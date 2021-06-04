// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import {moduleName, moduleTag} from "./modules/constants.js";
import {RegisterSettings} from "./modules/registerSettings.mjs";
import {CritHitFumble} from "./modules/critical-hit-fumble.mjs";
import { diePatching } from "./modules/proficiencyDie.mjs";


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Hooks.once('init', async function() {
    console.log(`${moduleTag} | Initializing `);
    RegisterSettings();
});


Hooks.once('setup', () => {
    console.log(`${moduleTag} | Setting up.`)
});


Hooks.once('ready', async function() {
    // Enable Critical Hit Fumble Rules
    if (await game.settings.get(moduleName, 'use-crit-hit-fumble')) {
        CritHitFumble();
        console.log(`${moduleTag} | Loaded Critcal Hit & Fumble System`);
    }

    // Enable Proficiency Die
    if (await game.settings.get(moduleName, 'use-prof-die')) {
        diePatching();
        console.log(`${moduleTag} | Loaded Proficiency Die System`);
    }

    console.log(`${moduleTag} | Ready`)
});
