import { libWrapper } from "./lib/shim.js";
import { d20Roll } from "../../../../systems/dnd5e/module/dice.js";

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Export 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var moduleName;

export const ProfDie = async function(name) {
    moduleName = name;

    

}
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                         Set Up Char Sheets with new Prof 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const ProfDieSheetUpdate = function() {

}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Wrapped Functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function getRollData(wrapped) {
    const data = wrapped();
    
    let level = data?.details?.level;

    if (level == null || level == undefined) {
        return data;
    }

    // TODO: Change prof die based on level

    let newProf = Math.ceil(Math.random() * (4 - 1) + 1);
    data.prof = newProf; 

    return data;
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Patches
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

export let itemPatching = () => {
    libWrapper.register(moduleName, "CONFIG.Item.documentClass.prototype.getRollData", getRollData, "OVERRIDE", {chain: true});
}
