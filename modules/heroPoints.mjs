// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import {moduleName, moduleTag} from "./constants.js";

export const heroPoints = async function() {
    // Fetch Actors
    let chars = game.actors?._source.filter(u => u.type == "character");
    if (chars == undefined || chars == null){return;}

    let test = game.actors.get(chars[0]._id);

    // Set flag if not extsts
    let flag = getHpFlag(test);
    if (flag == undefined || flag == null) {
        setHpFlag(test, calcHeroPoints(test));
    }

    // Set up display of data
    // Set up functions for triggers

};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Functions 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


function calcHeroPoints(actor) {
    // Get class level
    let level = actor.data.data.details.level;
    return (5 + Math.floor(level / 2));
}


function setHpFlag(actor, hp) {
    try {
        actor.setFlag(moduleName, 'heroPoints', hp);
    } catch (error) {console.error(error);}
}


function getHpFlag(actor) {
    try {
        actor.getFlag(moduleName, 'heroPoints');
    } catch (e) {console.error(e);}
}




// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Patching 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
