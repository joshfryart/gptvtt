class GPTVTTMenu extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "gptvtt-menu",
      title: "GPTVTT Menu",
      template: "templates/settings/menu.html",
      classes: ["sheet"],
      width: 500,
      height: "auto",
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: true
    });
  }

  async getData() {
    return {
      openai_key: game.settings.get("gptvtt", "openai_key")
    };
  }

  async _updateObject(event, formData) {
    await game.settings.set("gptvtt", "openai_key", formData.openai_key);
  }
}

// Register the menu
Hooks.once("init", () => {
  game.settings.registerMenu("gptvtt", "gptvtt-menu", {
    name: "GPTVTT Menu",
    label: "GPTVTT Menu",
    hint: "Open the GPTVTT module menu",
    icon: "fas fa-dragon",
    type: GPTVTTMenu,
    restricted: false
  });
});
