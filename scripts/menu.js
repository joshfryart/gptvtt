class GPTVTTMenu extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "gptvtt-menu",
      title: "GPT-VTT Menu",
      template: "modules/gptvtt/templates/menu.html",
      classes: ["gptvtt"],
      width: 400,
      height: "auto",
      closeOnSubmit: true,
      submitOnClose: false,
      submitOnChange: false,
      resizable: true
    });
  }

  getData() {
    return {
      openAIPrompt: game.i18n.localize("GPTVTT.OpenAIPrompt")
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("#gptvtt-button").click(this._onButtonClick.bind(this));
  }

  async _onButtonClick(event) {
    event.preventDefault();
    openAIPrompt();
    this.close();
  }
}

Hooks.once("init", () => {
  game.settings.registerMenu("gptvtt", "gptvttMenu", {
    name: "GPT-VTT Menu",
    label: "GPTVTT MENU",
    hint: "Open the GPT-VTT menu",
    type: GPTVTTMenu,
    restricted: false
  });
});
