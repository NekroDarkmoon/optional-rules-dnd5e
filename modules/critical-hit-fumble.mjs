import {moduleName, moduleTag} from "./constants.js";

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                             Initilization Function 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * 
 */
export var CritHitFumble = async function(){

    Hooks.on('midi-qol.AttackRollComplete', async (midiData) => {
        //  Check if critcal
        if (midiData.isCritical) {
            console.log("Critical Hit!");
            critFumbleRoll("Crit");
        } 
        // Check if fumble
        if (midiData.isFumble) {
            console.log("Critical Faliure!");
            critFumbleRoll("Fumble");
        }
    });

};


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Crit Fumble Roll 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * 
 * @param trigger 
 * @returns 
 */
async function critFumbleRoll(trigger) {
    
    var roll;
    let threshold = game.settings.get(moduleName, 'crit-fumble-threshold');

    switch (trigger) {
        case "Crit":
            roll = new Roll("1d6").roll();
            roll.toMessage();

            if (roll.total >= threshold) {
                // Roll on Critical table
                let name = await game.settings.get(moduleName, 'crit-hit-rolltable');
                let critTable = game.tables.getName(name);
                let tableRoll = await critTable.draw();
            }
            return;
            
        case "Fumble":
            roll = new Roll("1d6").roll();
            roll.toMessage();

            if (roll.total >= threshold) {
                // Roll on Fumble table
                let name = game.settings.get(moduleName, 'crit-fumble-rolltable');
                let fumbleTable = game.tables.getName(name);
                let tableRoll = await fumbleTable.draw();
            }
            return;
    }
}

