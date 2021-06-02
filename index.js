// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import {RegisterSettings} from "./modules/registerSettings.mjs";
import {CritHitFumble} from "./modules/critical-hit-fumble.mjs";
import { ProfDie} from "./modules/proficiencyDie.mjs";
import { libWrapper } from "./modules/lib/shim.js";
import { itemPatching } from "./modules/proficiencyDie.mjs";

const moduleName = "optional-rules-dnd5e";
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Hooks.once('init', async function() {
    console.log("Optional Rules Dnd5e | Initializing ");

    RegisterSettings(moduleName);

});


// Hooks.once('setup', () => {
//     ProfDie(moduleName);
//     itemPatching()
// });

Hooks.once('ready', async function() {
    // Enable Critical Hit Fumble Rules
    if (await game.settings.get(moduleName, 'use-crit-hit-fumble')) {
        CritHitFumble(moduleName);
        console.log(`${moduleName} | Loaded Critcal Hit & Fumble System`);
    }


    // Enable Proficiency Die
    if (await game.settings.get(moduleName, 'use-prof-die')) {
        ProfDie(moduleName);
        itemPatching();
    }

    console.log(`${moduleName} | Ready`)
});

