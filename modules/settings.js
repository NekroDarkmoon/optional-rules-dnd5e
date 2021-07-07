// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from "./constants.js";

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                      Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class ORDnD5e extends FormApplication{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: "Optional Rules 5e Settings",
            id: "ordnd5e-settings",
            template: `modules/${moduleName}/templates/settings.html`,
            width: "550",
            height: "auto",
            closeOnSubmit: true,
            resizeable: true,
            // tabs: [{navSelector: ".tabs", contentSelector: "form", inital: "critHitFumble"}]
        });
    }

    /**
     * 
     * @param {*} options 
     */
    getData(options = {}) {
    
    }

    activeListeners(html){
        super.activeListeners(html);
    }

    async _updateObject(event, formData) {
        console.log(formData);
    }

    async _updateObject(event, fromData) {
        this.render();
    }

}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Helper Functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Settings
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const RegisterSettings2 = async function() {
    game.settings.registerMenu(moduleName, "SettingsMenu", {
        name: "Settings Menu",
        label: "Configure Settings",
        icon: "fas fa-bars",
        type: ORDnD5e,
        restricted: true
    });
}