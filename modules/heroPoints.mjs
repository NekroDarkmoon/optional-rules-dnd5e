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
    let lastLevel = game.settings.get(moduleName, 'hero-points-lastSet');
    
    var HeroPoints;
    var updatedAt;

    if (Object.keys(existingHp).length === 0) {HeroPoints = {};}
    else {HeroPoints = existingHp;}

    if (Object.keys(lastLevel).length === 0) {updatedAt = {};}
    else {updatedAt = lastLevel;}    

    // Check every Actor for hp 
    for (let index = 0; index < chars.length; index++) {
        // Get Char data
        const currActor = game.actors.get(chars[index]._id);
        const prevLevel = updatedAt[currActor.data.name];
        const currLevel = currActor.data.data.details.level;

        // Set flag if not extsts
        let flag = getHpFlag(currActor);
        if (flag == undefined || flag == null || 
            Object.keys(existingHp).length === 0 || prevLevel != currLevel) {
            // Check if char exists in settings
            var hp;
            try {
                hp = HeroPoints[currActor.data.name];
            } catch (e) {
                console.error(`${moduleTag} | ${e}`);
                hp = null;
            }

            if (hp == null || hp == undefined || prevLevel == undefined || prevLevel != currLevel) {
                console.log(`${moduleTag} | Updating Hero Points for ${currActor.data.name}`);
                hp = calcHeroPoints(currActor);
                updatedAt[currActor.data.name] = currLevel;
            }   

            setHpFlag(currActor, hp);
            HeroPoints[currActor.data.name] = hp; 
        }
    }

    // Sync back to settings
    game.settings.set(moduleName, 'hero-points-data', HeroPoints);
    game.settings.set(moduleName, 'hero-points-lastSet', updatedAt);
    
    console.log(`${moduleTag} | HeroPoints initialized.`);
    console.log(HeroPoints);
    console.log(updatedAt);


    // Set up display of data
    await displayOnSheet(chars);

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


async function displayOnSheet(chars) {
    for (let index = 0; index < chars.length; index++) {    
        // Get Char data
        const currActor = game.actors.get(chars[index]._id);
        
        // Set Tertiary value
        const currHp = getHpFlag(currActor);
        const totalHp = calcHeroPoints(currActor);

        const newValue = {
            label: "Hero Points",
            lr: false,
            max: totalHp,
            sr: false,
            value: currHp
        }

        await currActor.update({"data.resources.tertiary": newValue});
        console.warn("Updated");

    }
}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Patching 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
