// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import {moduleName, moduleTag} from "./constants.js";

export const heroPoints = async function() {
    // Fetch Actors
    let chars = game.actors?._source.filter(u => u.type == "character");
    if (chars == undefined || chars == null){return;}

    let test = chars[0]._id;
    console.log(test);

    let hpActor = new HeroPoints(game.actors.get(test));
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class HeroPoints {

    constructor(actor) {
        // Given data
        this.actor = actor;
        
        // Derived data
        // TODO: Check Flag for existing hero points
        let flag = actor.getFlag(moduleName, 'heroPoints');
        if (flag == undefined || flag == null) {
            this.heroPoints = flag;
        } else {
            this.heroPoints = this.calcHeroPoints();
            this.setHpFlag();
        }

    }


    calcHeroPoints() {
        // Get class level
        let level = this.actor.data.data.details.level;
        let hp = 5 + Math.floor(level / 2);
        return hp;
    }


    setHpFlag() {
        let actorData = this.actor;
        
        // Overide exisitng flag
        try {
            actorData.setFlag(moduleName, 'heroPoints', this.heroPoints);

        } catch (error) {console.error(error);}
    }


}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Patching 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
