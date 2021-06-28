// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Flanking
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function Flanking() {
    Hooks.on('targetToken', async (user, target, state) => {
        // Return if state is not targetting.
        if (!state) {return;}        

        // Start checking for controlled/selected actors.
        for(const selected of canvas.tokens.controlled){
            await isFlanking(user, selected, target);
        }
    });


    
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * Check if a target is being flanked by another ally.
 * @param user {Object} 
 * @param origin {Object}
 * @param target {Object}
 */
async function isFlanking(user, origin, target) {
    
    // Check attacker disposition

    // Get target size
    let tSize = target.hitArea.width; 

    // Get origin and target location
    const oLocation = origin._validPosition;
    let tLocation = target._validPosition;
    console.log(oLocation);
    console.log(tLocation);

    // Get Grid size and check if adjacent
    let gridSize = canvas.grid.size;
    console.log(`Gridsize: ${gridSize}, tSize: ${tSize}`);
    

    // Change target location based on creature size
    if (tSize > gridSize) {
        // Calculate new targeted location
        tLocation = {
            x: (tLocation.x + (tSize - gridSize) + tLocation.x)/2,
            y: (tLocation.y + (tSize - gridSize) + tLocation.y)/2
        };
    }

    // Create flanking ray and calculate relative location of flanker
    let flanker = new FlankingRay(oLocation, tLocation);    
    let requiredPosition = flanker.getFlankingPosititon();

    // Check if friendly exists at location
    let tokens = canvas.tokens.children[0].children;
    for (const token of tokens) {
        if (token._validPosition.x == requiredPosition.x && token._validPosition.y == requiredPosition.y) {
            console.info(`Flanking with ${token.data.name}`);
        }
    }

    // Ready for garbage collection.
    flanker = undefined;
}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Class
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FlankingRay {
    /**
     * 
     * @param origin {Object}
     * @param target {Object}
     */
    constructor(origin, target) {
        this.origin = origin;
        this.target = target;
        
        this.distance = this.clacdistance();
        console.log(`Distance: ${this.distance}`);
        this.normalized = this.normalized();
        console.log(`Normalized = ${this.normalized}`);
    }

    /**
     * 
     * @returns 
     */
    clacdistance() {
        const {x: x1, y: y1} = this.origin;
        const {x: x2, y: y2} = this.target;

        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2-y1), 2)); 
    }

    /**
     * 
     * @returns 
     */
    normalized() {
        const {x: x1, y: y1} = this.origin;
        const {x: x2, y: y2} = this.target;

        const v = [(x1-x2), (y1-y2)];
        return [(v[0]/this.distance), (v[1]/this.distance)];
    }

    /**
     * 
     * @returns 
     */
    getFlankingPosititon() {
        const {x: x1, y: y1} = this.target;
        
        let x = x1 - (this.distance * this.normalized[0]);
        let y = y1 - (this.distance * this.normalized[1]);

        return {x: x, y: y};
    }
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
