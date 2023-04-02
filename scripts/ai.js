function openAIPrompt() {
  const systemPrompt = "You are the best game master in the world, and know all the tabletop RPGs like D&D 5th edition, Pathfinder 2nd edition, and so forth. You are an expert today on {{SYSTEM}}.";

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

    const itemResponse = window.prompt("Name: \nDescription: "..rollableTableDesc+"\n" + itemPrompt);

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
  } else if (destination === "rollabletables") {
    if (response && response !== "") {
      const rollableTableName = "OpenAI Rollable Table";
      const rollableTableDesc = response;
      const rollableItems = [];
      let itemPrompt = "";
      for (let i = 1; i <= parseInt(rollableTableItems); i++) {
        itemPrompt += `Enter item #${i} for '${rollableTableName}': `;
        const itemResponse = window.prompt(itemPrompt);
        rollableItems.push(itemResponse);
      }

      const rollableTableNode = window.nodes.createSafeWindow('tablelist');
      const rollableTable = rollableTableNode.createChild(rollableTableName);
      rollableTable.setPublic(true);
      rollableTable.setDescription(rollableTableDesc);

      rollableItems.forEach((item) => { if (item && item !== "") { const entryNode = rollableTable.createChild('tableitem'); entryNode.setValue(item); } });

  ui.notifications.info(`Rollable Table '${rollableTableName}' created and populated with ${rollableTableItems} items`);
}

} }
  async function openAIAPI(prompt) {
    const apiKey = game.settings.get("GPTVTT", "openai_key");

    if (!apiKey) {
      ui.notifications.error("OpenAI API key not set. Please set it in the module configuration.");
      return "";
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 1200, // Set the maximum number of tokens in the response
        n: 1, // The number of completions to generate for each prompt
        stop: null, // Set a stop sequence if needed
        temperature: 1, // Sampling temperature (higher values make output more random, lower values make it more deterministic)
      }),
    };

    try {
      const response = await fetch("https://api.openai.com/v1/engines/davinci-codex/completions", requestOptions);
      const jsonResponse = await response.json();

      if (response.status !== 200) {
        ui.notifications.error(`Error ${response.status}: ${jsonResponse.error}`);
        return "";
      }

      return jsonResponse.choices[0].text.trim();
    } catch (error) {
      console.error("Error fetching OpenAI API data:", error);
      ui.notifications.error("Error fetching OpenAI API data.");
      return "";
    
  }
} // This closing brace should be at the end of the function