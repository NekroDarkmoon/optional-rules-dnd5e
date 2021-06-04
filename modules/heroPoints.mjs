// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import {moduleName, moduleTag} from "./constants.js";

export const heroPoints = async function() {
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class HeroPoints {

    constructor(actor) {
        // Given data
        this.actor = actor;
        
        // Derived data
        this.heroPoints = calcHeroPoints();
        
    }


    calcHeroPoints() {
        // Get class level
        let level = this.actor.data.data.details.level;
        let hp = 5 + Math.floor(level / 2);
        return hp;
    }


}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
