// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import {moduleName, moduleTag} from "./modules/constants.js";
import {RegisterSettings} from "./modules/settings.js";
import {CritHitFumble} from "./modules/critical-hit-fumble.mjs";
import {heroPoints} from "./modules/heroPoints.mjs";
// import { diePatching, diePatchingDAE } from "./modules/proficiencyDie.mjs";
import { flanking } from "./modules/flanking.js";


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Hooks.once('init', async function() {
    console.log(`${moduleTag} | Initializing `);
    RegisterSettings();
});

Hooks.once('setup', async function() {
    // Enable Critical Hit Fumble Rules
    if (game.settings.get(moduleName, 'use-crit-hit-fumble')) {
        CritHitFumble();
        console.info(`${moduleTag} | Loaded Critcal Hit & Fumble System.`);
    }

    // Enable Proficiency Die
    // if (game.settings.get(moduleName, 'use-prof-die')) {
    //     let dae = game.modules.get('dae');
        
    //     if (dae?.active) {
    //         diePatchingDAE(profDie);
    //         console.warn(`${moduleTag} | DAE dected. Patching for DAE instead.`);
    //     }
    //     else {diePatching(profDie);}
        
    //     console.info(`${moduleTag} | Loaded Proficiency Die System.`);
    // }

    // Enable Flanking
    if (game.settings.get(moduleName, 'use-flanking')) {
        // Get cross module Compatibility
        let settings = {
            midi: ((game.modules.get('midi-qol'))?.active) ? true : false,
            adv: (await game.settings.get(moduleName, 'use-flanking-mod')) ? false : true,
            mod: await game.settings.get(moduleName, 'flanking-mod'),
            size: await game.settings.get(moduleName, 'internalCreatureSize'),
            variant: (await game.settings.get(moduleName, 'variant')) ? true : false
        };
        console.log(settings);

        await flanking(settings);
        console.info(`${moduleTag} | Loaded Flanking System.`);
    }


    console.log(`${moduleTag} | Setting Up`)
});


Hooks.once('ready', async function() {
    // Enable Hero Points
    if (game.settings.get(moduleName, 'use-hero-points')) {
        heroPoints();
        console.info(`${moduleTag} | Loaded Hero Points System.`);
    }

    
    console.log(`${moduleTag} | Ready.`)
});