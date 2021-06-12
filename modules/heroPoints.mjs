// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import {moduleName, moduleTag} from "./constants.js";

export const heroPoints = async function() {
    // Fetch Actors
    let chars = game.actors?._source.filter(u => u.type == "character");
    if (chars == undefined || chars == null){return;}

    // Hero points redundacy storage
    let existingHp = game.settings.get(moduleName, 'hero-points-data');
    var HeroPoints;
    
    if (Object.keys(existingHp).length === 0) {HeroPoints = {};}
    else {
        HeroPoints = existingHp;
    }


    // Check every Actor for hp 
    for (let index = 0; index < chars.length; index++) {
        const currActor = game.actors.get(chars[index]._id);
        
        // Set flag if not extsts
        let flag = getHpFlag(currActor);
        console.log(flag);
        if (flag == undefined || flag == null) {

            // Check if char exists in settings
            var hp;
            try {
                hp = HeroPoints[currActor.data.name];
            } catch (e) {
                console.error(`${moduleTag} | ${e}`);
                hp = calcHeroPoints(currActor);
            }

            if (hp == null || hp == undefined) {hp = calcHeroPoints(currActor);}

            setHpFlag(currActor, hp);
            HeroPoints[currActor.data.name] = hp; 
        }
    }

    // Sync back to settings
    game.settings.set(moduleName, 'hero-points-data', HeroPoints);
    
    console.log(`${moduleTag} | HeroPoints initialized.`);
    console.log(HeroPoints);


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
        return actor.getFlag(moduleName, 'heroPoints');
    } catch (e) {console.error(e);}
}




// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Patching 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
