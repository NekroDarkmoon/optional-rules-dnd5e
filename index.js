// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import {RegisterSettings} from "./modules/registerSettings.mjs";
import {CritHitFumble} from "./modules/critical-hit-fumble.mjs";


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


Hooks.once('ready', async function() {
    // Enable Critical Hit Fumble Rules
    if (await game.settings.get(moduleName, 'use-crit-hit-fumble')) {
        CritHitFumble(moduleName);
        console.log(`${moduleName} | Loaded Critcal Hit & Fumble System`);
    }

    console.log(`${moduleName} | Ready`)
});

Hooks.on('midi-qol.preAttackRoll', async(item, workflow) => {
    console.log(item);
    console.log(workflow);
});