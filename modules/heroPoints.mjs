// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var moduleName;

export const heroPoints = async function(name) {
    moduleName = name;


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
        let hp = 5 + Math.ceil(level / 2);
        return hp;
    }


}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
