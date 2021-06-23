// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import {moduleName, moduleTag} from "./modules/constants.js";
import {RegisterSettings} from "./modules/registerSettings.mjs";
import {CritHitFumble} from "./modules/critical-hit-fumble.mjs";
import {heroPoints} from "./modules/heroPoints.mjs";
import { diePatching, diePatchingDAE } from "./modules/proficiencyDie.mjs";


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Hooks.once('init', async function() {
    console.log(`${moduleTag} | Initializing `);
    RegisterSettings();
});

Hooks.once('setup', async function() {
    // Enable Critical Hit Fumble Rules
    if (await game.settings.get(moduleName, 'use-crit-hit-fumble')) {
        CritHitFumble();
        console.log(`${moduleTag} | Loaded Critcal Hit & Fumble System`);
    }

    // Enable Proficiency Die
    if (await game.settings.get(moduleName, 'use-prof-die')) {
        let dae = game.modules.get('dae');

        if (dae?.active) {
            diePatchingDAE();
            console.warn(`${moduleTag} | DAE dected. Patching for DAE instead.`);
        }
        else {diePatching();}
        
        console.log(`${moduleTag} | Loaded Proficiency Die System`);
    }


    console.log(`${moduleTag} | Setting Up`)
});


Hooks.once('ready', async function() {
    heroPoints();
    
    console.log(`${moduleTag} | Ready.`)
});