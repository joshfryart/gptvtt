import { openAIAPI } from "./ai.js";

Hooks.once('init', async function () {
  game.settings.register('gptvtt', 'openai_key', {
    name: 'OpenAI API Key',
    hint: 'Enter your OpenAI API key here',
    scope: 'world',
    config: true,
    type: String,
    default: '',
  });
});

function openAIPrompt() {
  const systemPrompt = "You are the best game master in the world, and know all the tabletop RPGs like D&D 5th edition, Pathfinder 2nd edition, and so forth. You are an expert today on {{SYSTEM}}.";

  try {
    const system = window.prompt("Enter a tabletop RPG system name:");
    const destination = window.prompt("Select where to send or save the response text:", "chat");

    const rollableTablePrompt = "How many items on the rollable table?\nType of the rollable table (description)";

    const rollableTableResponse = window.prompt(rollableTablePrompt);

    const [rollableTableItems, rollableTableDesc] = rollableTableResponse.split("\n");

    if (rollableTableItems && rollableTableDesc) {
      let itemPrompt = "";
      for (let i = 1; i <= parseInt(rollableTableItems); i++) {
        itemPrompt += i + ". ";
      }

      const itemResponse = window.prompt(`Name: \nDescription: ${rollableTableDesc}\n${itemPrompt}`);

      const [tableName, items] = itemResponse.split("\nDescription:");

      if (tableName && items) {
        const rollableTableNode = window.nodes.createSafeWindow('tablelist');
        const rollableTable = rollableTableNode.createChild(tableName);
        rollableTable.setPublic(true);
        rollableTable.setDescription(rollableTableDesc);

        items.split("\n").forEach((item, i) => {
          const [, itemText] = item.match(/^(\d+).(.*)$/);
          if (itemText) {
            const entryNode = rollableTable.createChild('tableitem');
            entryNode.setValue(itemText.trim());
          }
        });

        ui.notifications.info(`Rollable Table '${tableName}' created and populated with ${rollableTableItems} items`);
      } else {
        ui.notifications.error('Invalid rollable table prompt format');
      }
    }

 if (destination === "chat" || destination === "journal" || destination === "compendium") {
  // handle chat, journal, and compendium destinations the same way as before
  const prompt = systemPrompt.replace("{{SYSTEM}}", system);
  const response = openAIAPI(prompt);
  
  if (response && response !== "") {
    if (destination === "chat") {
      ChatMessage.create({ content: response }, {});
    } else if (destination === "journal") {
      const newEntry = game.packs.get('world.journal').entity.create({ name: "OpenAI Journal Entry", content: response });
    } else if (destination === "compendium") {
      const newEntry = game.packs.get('world.compendium').entity.create({ name: "OpenAI Compendium Entry", type: "referenceitem", data: { description: response } });
    }
  }
} else if (destination === "scenes" || destination === "actors" || destination === "items" || destination === "rollabletables") {
  // handle other destinations
}

// handle chat, journal, and compendium destinations the same way as before
const prompt = systemPrompt.replace("{{SYSTEM}}", system);
const response = openAIAPI(prompt);
if (response && response !== "") {
if (destination === "chat") {
  const response = await openAIAPI(systemPrompt.replace("{{SYSTEM}}", system));
  if (response && response !== "") {
    ChatMessage.create({ content: response }, {});
  } else {
    ui.notifications.error('OpenAI response was empty');
  }
} else if (destination === "journal" || destination === "compendium") {
  const response = await openAIAPI(systemPrompt.replace("{{SYSTEM}}", system));
  if (response && response !== "") {
    const newEntry = await game.packs.get(`world.${destination}`).entity.create({ name: "OpenAI Entry", [destination === "journal" ? "content" : "data"]: { description: response } });
    ui.notifications.info(`New ${destination.charAt(0).toUpperCase() + destination.slice(1)} created with name '${newEntry.data.name}'`);
  } else {
    ui.notifications.error('OpenAI response was empty');
  }
}

// prompt for AI response
const prompt = systemPrompt.replace("{{SYSTEM}}", system);
const response = openAIAPI(prompt);

// set up dropdown options based on destination
let dropdowns = [];
if (destination === "scenes") {
  dropdowns = [
    { value: "currentscene", label: "Current Scene" },
    { value: "newscene", label: "New Scene" },
  ];
} else if (destination === "actors" || destination === "items") {
  dropdowns = [
    { value: "current", label: "Current " + destination.charAt(0).toUpperCase() + destination.slice(1) },
    { value: "new", label: "New " + destination.charAt(0).toUpperCase() + destination.slice(1) },
  ];
}


// show dialog box with dropdown and response text area
new Dialog({
  title: "OpenAI Response",
  content: `
    <div class="form-group">
      <label for="select-destination">Select Destination</label>
      <select id="select-destination" name="select-destination">
        ${dropdowns.map((option) => `<option value="${option.value}">${option.label}</option>`)}
      </select>
    </div>
    <div class="form-group">
      <label for="response-textarea">AI Response:</label>
      <textarea id="response-textarea" name="response-textarea">${response}</textarea>
    </div>
  `,
  buttons: {
    ok: {
      icon: '<i class="fas fa-check"></i>',
      label: "OK",
      callback: async (html) => {
        const selectedDestination = html.find("#select-destination")[0].value;
        const responseText = html.find("#response-textarea")[0].value;
if (selectedDestination === "currentscene") {
const currentScene = game.scenes.viewed;
if (currentScene) {
currentScene.update({ name: response });
ui.notifications.info(Scene '${currentScene.data.name}' renamed to '${response}');
}
} else if (selectedDestination === "newscene") {
const newScene = await Scene.create({ name: response });
ui.notifications.info(New scene created with name '${response}');
} else if (selectedDestination === "current" || selectedDestination === "new") {
let entityClass = null;
if (selectedDestination === "current") {
if (destination === "actors") {
entityClass = Actor;
} else if (destination === "items") {
entityClass = Item;
}
const currentEntity = entityClass.collection.viewed;
if (currentEntity) {
currentEntity.update({ name: response });
ui.notifications.info(${destination.charAt(0).toUpperCase() + destination.slice(1)} '${currentEntity.data.name}' renamed to '${response}');
}
} else if (selectedDestination === "new") {
if (destination === "actors") {
entityClass = Actor;
} else if (destination === "items") {
entityClass = Item;
}
const newEntity = await entityClass.create({ name: response });
ui.notifications.info(New ${destination.charAt(0).toUpperCase() + destination.slice(1)} created with name '${response}');
}
}
}

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

function copyResponse() {
const systemPrompt = "You are the best game master in the world, and know all the tabletop RPGs like D&D 5th edition, Pathfinder 2nd edition, and so forth. You are an expert today on {{SYSTEM}}.";

const system = window.prompt("Enter a tabletop RPG system name:");
const response = await openAIAPI(systemPrompt.replace("{{SYSTEM}}", system));
if (response && response !== "") {
navigator.clipboard.writeText(response);
ui.notifications.info(Response copied to clipboard);
} else {
ui.notifications.error('OpenAI response was empty');
}
}
// register settings menu

Hooks.on('renderSidebarTab', (app, html) => {
if (app.options.id === "settings") {
const openAIKeyInput = <div class="form-group"> <label>OpenAI API Key</label> <input type="text" name="openai_key" data-dtype="String" value="${game.settings.get('gptvtt', 'openai_key')}"> </div>;

const div = document.createElement('div');
div.innerHTML = openAIKeyInput;
html.find('.game-details').prepend(div);

html.find('button[type="submit"]').click(ev => {
  ev.preventDefault();
  const form = ev.currentTarget.form;
  game.settings.set('gptvtt', 'openai_key', form.openai_key.value);
  form.submit();
});

}
});
	}