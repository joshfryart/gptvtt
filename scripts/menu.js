import { openAIPrompt } from "./ai.js";

Hooks.on('renderSidebarTab', (app, html) => {
  if (app.options.id === "actors") {
    const button = $(`<button class="openai-button"><i class="fas fa-robot"></i>GPT-VTT MENU</button>`);
    html.find(".directory-footer").append(button);
    button.click(() => openAIPrompt());
  }
});

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
        const [match, itemNumber, itemText] = item.match(/^(\d+).(.*$)/);
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

vbnet

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

let options = `<option value=""></option>`;
dropdowns.forEach((dropdown) => {
  options += `<option value="${dropdown.value}">${dropdown.label}</option>`;
});

const html = `
  <div style="display:flex;flex-direction:column;">
    <div style="margin-bottom: 5px;"><label>Select a destination for the response:</label></div>
    <div style="margin-bottom: 10px;">
      <select id="destination">${options}</select>
    </div>
    <div style="margin-bottom: 5px;"><label>Enter a name for the new ${destination}:</label></div>
    <div style="margin-bottom: 10px;">
      <input type="text" id="name">
    </div>
    <div>
      <button type="button" id="create">${destination.charAt(0).toUpperCase() + destination.slice(1)}</button>
    </div>
  </div>
`;

const dialog = new Dialog({
  title: "OpenAI Response",
  content: html,
  buttons: {},
  close: () => {},
});

dialog.render(true);

// handle click event for the create button
const button = dialog.element.find("#create");
button.on("click", async () => {
  const destinationValue = dialog.element.find("#destination").val();
  const nameValue = dialog.element.find("#name").val();

  if (destinationValue === "" || nameValue === "") {
    ui.notifications.error("Please select a destination and enter a name");
    return;
  }

  let newObject;
  if (destinationValue === "currentscene") {
    newObject = game.scenes.active.createEmbeddedEntity("Token", { name: nameValue });
  } else if (destinationValue === "newscene") {
    newObject = game.scenes.create({ name: nameValue });
  } else if (destinationValue === "current") {
    newObject = game[destination].placeables.find((p) => p._controlled);
    if (newObject === undefined) {
      ui.notifications.error(`Please select a ${destination} to modify`);
      return;
    }
    newObject.update({ name: nameValue });
  } else if (destinationValue === "new") {
    newObject = await game[destination].create({ name: nameValue });
  }
  // send response text to appropriate destination
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
} else if (destination === "rollabletables") {
  dropdowns = [
    { value: "new", label: "New Rollable Table" },
  ];
}

// prompt user for dropdown selection
const selection = await new Promise((resolve) => {
  const dialog = new Dialog({
    title: "Select Destination",
    content: `
      <p>Select a destination for the AI response:</p>
      <div class="form-group">
        <label>Destination</label>
        <select name="destination">
          ${dropdowns.map((d) => `<option value="${d.value}">${d.label}</option>`)}
        </select>
      </div>
    `,
    buttons: {
      ok: {
        label: "OK",
        callback: (html) => {
          resolve(html.find('[name=destination]').val());
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
    default: "ok",
    close: () => {},
  });
  dialog.render(true);
});

// handle scene, actor, and item destinations
if (selection === "currentscene") {
  const scene = canvas.scene;
  const prompt = systemPrompt.replace("{{SYSTEM}}", system);
  const response = openAIAPI(prompt);
  if (response && response !== "") {
    scene.setFlag("openai", "description", response);
    ui.notifications.info(`Scene '${scene.data.name}' updated with AI response`);
  }
} else if (selection === "newscene") {
  const sceneData = await Scene.create({
    name: "OpenAI Scene",
    navigation: true,
    permission: {
      default: CONST.ENTITY_PERMISSIONS.OBSERVER,
    },
    flags: {
      "openai": {
        "description":} else if (dropdowns.length > 0) {
// prompt for AI response
const prompt = systemPrompt.replace("{{SYSTEM}}", system);
const response = openAIAPI(prompt);

php

// create the form fields
let fields = {};
fields[destination] = {
  type: "select",
  label: destination.charAt(0).toUpperCase() + destination.slice(1),
  options: dropdowns,
};
fields["response"] = {
  type: "textarea",
  label: "AI Response",
  value: response,
};

// create the form
new Dialog({
  title: "OpenAI Response",
  content: `<p>Your response from OpenAI has been populated below. Please select the ${destination} and fill in any other necessary details.</p>`,
  buttons: {
    submit: {
      label: "Submit",
      callback: (html) => {
        const destinationValue = html.find(`select[name='${destination}']`).val();
        const responseValue = html.find("textarea[name='response']").val();
        if (responseValue && responseValue !== "") {
          if (destination === "scenes") {
            if (destinationValue === "currentscene") {
              game.scenes.viewed.update({ name: "OpenAI Scene", description: responseValue });
            } else if (destinationValue === "newscene") {
              Scene.create({ name: "OpenAI Scene", description: responseValue });
            }
          } else if (destination === "actors") {
            if (destinationValue === "current") {
              const currentActor = game.actors.viewed;
              if (currentActor) {
                currentActor.update({ name: "OpenAI Actor", data: { details: responseValue } });
              }
            } else if (destinationValue === "new") {
              Actor.create({ name: "OpenAI Actor", type: "character", img: "icons/svg/mystery-man.svg", data: { details: responseValue } });
            }
          } else if (destination === "items") {
            if (destinationValue === "current") {
              const currentItem = game.items.viewed;
              if (currentItem) {
                currentItem.update({ name: "OpenAI Item", data: { description: responseValue } });
              }
            } else if (destinationValue === "new") {
              Item.create({ name: "OpenAI Item", type: "weapon", img: "icons/svg/mystery-man.svg", data: { description: responseValue } });
            }
          }
        }
      },
    },
  },
  default: "submit",
  close: () => {},
  render: (html) => {
    // append the fields to the form
    for (const field in fields) {
      html.find(".dialog-content").append(`<div class="form-group"><label>${fields[field].label}</label>${fields[field].type === "select" ? createSelectField(field, fields[field]) : createTextareaField(field, fields[field])}</div>`);
    }
  },
}).render(true);
} else {
ui.notifications.error("Invalid destination");
}
}

function createSelectField(name, options) {
let optionsHtml = "";
for (const option of options.options) {
optionsHtml += <option value="${option.value}">${option.label}</option>;
}
return <select name="${name}" data-dtype="String">${optionsHtml}</select>;
}

function createTextareaField(name, options) {
return <textarea name="${name}" data-dtype="String">${options.value}</textarea>;
}
  if (destination === "scenes") {
    const scene = game.scenes.get(game.user.viewedScene);
    if (target === "newscene") {
      const newScene = await Scene.create({ name: response, active: true });
      game.user.update({ viewedScene: newScene.id });
      ui.notifications.info(`New scene created: ${response}`);
    } else if (target === "currentscene") {
      scene.update({ name: response });
      ui.notifications.info(`Scene name updated to: ${response}`);
    }
  } else if (destination === "actors") {
    const actor = game.actors.get(game.user.viewedActor);
    if (target === "new") {
      const newActor = await Actor.create({ name: response });
      game.user.update({ viewedActor: newActor.id });
      ui.notifications.info(`New actor created: ${response}`);
    } else if (target === "current") {
      actor.update({ name: response });
      ui.notifications.info(`Actor name updated to: ${response}`);
    }
  } else if (destination === "items") {
    const item = game.items.get(game.user.viewedItem);
    if (target === "new") {
      const newItem = await Item.create({ name: response });
      game.user.update({ viewedItem: newItem.id });
      ui.notifications.info(`New item created: ${response}`);
    } else if (target === "current") {
      item.update({ name: response });
      ui.notifications.info(`Item name updated to: ${response}`);
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
    } else {
      ui.notifications.error('No response text received from OpenAI API');
    }
  }
} else {
  ui.notifications.error('Invalid destination prompt format');
}

} else {
ui.notifications.error('No response text received from OpenAI API');
}
}

async function createMacro() {
const macro = await Macro.create({
name: 'OpenAI Prompt',
type: 'script',
command: openAIPrompt();,
img: 'icons/svg/d20-black.svg',
flags: { 'gptvtt.macro': true },
}, { displaySheet: false });
const compendium = await game.packs.find(p => p.entity === "Macro");
await compendium.importEntity(macro);
}
Hooks.on('ready', async () => {
  if (game.user.isGM) {
    const pack = game.packs.find(p => p.metadata.label === "GPT-VTT Macros");
    if (!pack) {
      await Pack.create({
        name: "GPT-VTT Macros",
        entity: "Macro",
        label: "GPT-VTT Macros",
        path: "packs/macros.json"
      });
    }
    const openaiKey = game.settings.get('gptvtt', 'openai_key');
    if (openaiKey === '') {
      ui.notifications.error("OpenAI API key not found. Please enter your API key in the GPT-VTT module settings.");
      return;
    }

    const macros = [
      {
        name: "OpenAIPrompt",
        type: "script",
        scope: "global",
        command: "openAIPrompt();",
        img: "icons/svg/d20-black.svg"
      }
    ];

    for (const macro of macros) {
      const pack = game.packs.find(p => p.metadata.label === "GPT-VTT Macros");
      const index = await pack.getIndex();
      const entity = index.find(e => e.name === macro.name && e.type === macro.type);
      if (!entity) {
        await pack.createEntity(macro);
      }
    }

    ui.notifications.info("GPT-VTT module ready.");
  }
});