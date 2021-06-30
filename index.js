// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import {moduleName, moduleTag} from "./modules/constants.js";
import {RegisterSettings} from "./modules/registerSettings.mjs";
import {CritHitFumble} from "./modules/critical-hit-fumble.mjs";
import {heroPoints} from "./modules/heroPoints.mjs";
import { diePatching, diePatchingDAE } from "./modules/proficiencyDie.mjs";
import { Flanking } from "./modules/flanking.mjs";


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
        console.info(`${moduleTag} | Loaded Critcal Hit & Fumble System.`);
    }

    // Enable Proficiency Die
    if (await game.settings.get(moduleName, 'use-prof-die')) {
        let dae = game.modules.get('dae');

        if (dae?.active) {
            diePatchingDAE();
            console.warn(`${moduleTag} | DAE dected. Patching for DAE instead.`);
        }
        else {diePatching();}
        
        console.info(`${moduleTag} | Loaded Proficiency Die System.`);
    }

    // Enable Flanking
    if (await game.settings.get(moduleName, 'use-flanking')) {
        // Get cross module Compatibility
        let midi = game.modules.get('midi-qol');
        if (midi?.active) {
            await Flanking(true);
        } else {
            await Flanking();    
        }
        
        console.info(`${moduleTag} | Loaded Flanking System.`);
    }


    console.log(`${moduleTag} | Setting Up`)
});


Hooks.once('ready', async function() {
    // Enable Hero Points
    if (await game.settings.get(moduleName, 'use-hero-points')) {
        heroPoints();
        console.info(`${moduleTag} | Loaded Hero Points System.`);
    }
    
    console.log(`${moduleTag} | Ready.`)
});