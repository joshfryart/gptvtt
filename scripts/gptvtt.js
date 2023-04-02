Hooks.once("init", function() {
  console.log("GPTVTT module loaded!");

  game.settings.register("gptvtt", "openai_key", {
    name: "OpenAI API Key",
    hint: "Enter your OpenAI API key here",
    scope: "world",
    config: true,
    type: String,
    default: "",
  });

  game.socket.on("module.gptvtt", async (data) => {
    if (game.user.isGM) {
      const prompt = data.prompt;
      const response = await openAIAPI(prompt);
      if (response && response !== "") {
        ChatMessage.create({ content: response }, {});
      } else {
        ui.notifications.error('OpenAI response was empty');
      }
    }
  });

  function openAIAPI(prompt) {
    async function openAIAPI(prompt) {
      const openai_key = game.settings.get('gptvtt', 'openai_key');
      if (openai_key === '') {
        ui.notifications.error('OpenAI API key not set');
        return;
      }

      const url = 'https://api.openai.com/v1/engines/davinci-codex/completions';
      const promptEncoded = encodeURIComponent(prompt);
      const data = {
        prompt: promptEncoded,
        max_tokens: 1024,
        n: 1,
        temperature: 0.7,
      };
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openai_key}`,
        },
        body: JSON.stringify(data),
      };
      const response = await fetch(url, options);
      const json = await response.json();
      const choices = json.choices;
      if (choices.length > 0) {
        return choices[0].text.trim();
      }
    }
  }

  // Add chat command to send prompt to OpenAI API
  Hooks.on('ready', () => {
    game.socket.on('module.gptvtt', async (data) => {
      if (game.user.isGM) {
        const prompt = data.prompt;
        const response = await openAIAPI(prompt);
        if (response && response !== "") {
          ChatMessage.create({ content: response }, {});
        } else {
          ui.notifications.error('OpenAI response was empty');
        }
      }
    });

    Hooks.on('chatMessage', async (chatLog, messageText, chatData) => {
      if (messageText.startsWith('/gpt ')) {
        const prompt = messageText.slice(5);
        game.socket.emit('module.gptvtt', { prompt });
      }
    });
  });
});
