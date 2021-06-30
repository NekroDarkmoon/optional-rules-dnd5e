// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from "./constants.js";
import { libWrapper } from "./lib/shim.js";

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Flanking
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export async function Flanking() {
    Hooks.on('targetToken', async (user, target, state) => {
        // Return if state is not targetting.
        if (!state) {return;}        

        // Start checking for controlled/selected actors.
        for(const selected of canvas.tokens.controlled){
            if (await isFlanking(user, selected, target)){
                return;
            }
        }

    });

    // Run a patch for attack roll
    // libWrapper.register(moduleName, "CONFIG.Item.documentClass.prototype.rollAttack", attackRoll, "WRAPPER");

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
    const oDisposition = origin.data.disposition; 

    // Get target size
    let tSize = target.hitArea.width; 

    // Get origin and target location
    let oLocation = origin._validPosition;
    oLocation.z = origin.data.elevation;
    let tLocation = target._validPosition;
    tLocation.z = target.data.elevation;
    // console.log(oLocation);
    // console.log(tLocation);

    // Get Grid size and check if adjacent
    let gridSize = canvas.grid.size;
    // console.log(`Gridsize: ${gridSize}, tSize: ${tSize}`);
    

    // Change target location based on creature size
    if (tSize > gridSize) {
        // Calculate new targeted location
        tLocation = {
            x: (tLocation.x + (tSize - gridSize) + tLocation.x)/2,
            y: (tLocation.y + (tSize - gridSize) + tLocation.y)/2,
            z: target.data.elevation,
        };
    }

    // Create flanking ray and calculate relative location of flanker
    let flanker = new FlankingRay(oLocation, tLocation);    
    let requiredPosition = flanker.getFlankingPosititon();

    // Check if friendly exists at location
    let tokens = canvas.tokens.children[0].children;
    for (const token of tokens) {
        if (token._validPosition.x == requiredPosition.x && token._validPosition.y == requiredPosition.y &&
            token.data.elevation == requiredPosition.z && token.data.disposition == oDisposition) {
            // if (token.data.document.data.effects._source)
            console.info(`${moduleTag} | Flanking with ${token.data.name}.`);
            console.info(`${moduleTag} | Distance: ${flanker.distance}; Normalized: ${flanker.normalized}; ReqPos: ${JSON.stringify(requiredPosition)}.`);
            await ChatMessage.create({
                speaker: {alias: "Optional Rules"},
                content: `${origin.data.name} & ${token.data.name} are flanking ${target.data.name}`
            });
            return true;
        }
    }

    // Ready for garbage collection.
    flanker = undefined;
    return false;
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
        
        this.distance = this.clacDistance();
        this.normalized = this.normalized();
    }

    /**
     * 
     * @returns 
     */
    clacDistance() {
        const {x: x1, y: y1, z: z1} = this.origin;
        const {x: x2, y: y2, z: z2} = this.target;

        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2-y1), 2) + Math.pow((z2-z1),2)); 
    }

    /**
     * 
     * @returns 
     */
    normalized() {
        const {x: x1, y: y1, z: z1} = this.origin;
        const {x: x2, y: y2, z: z2} = this.target;

        const v = [(x1-x2), (y1-y2), (z1-z2)];
        return [(v[0]/this.distance), (v[1]/this.distance), (v[2]/this.distance)];
    }

    /**
     * 
     * @returns 
     */
    getFlankingPosititon() {
        const {x: x1, y: y1, z: z1} = this.target;
        
        let x = x1 - (this.distance * this.normalized[0]);
        let y = y1 - (this.distance * this.normalized[1]);
        let z = z1 - (this.distance * this.normalized[2]);

        return {x: x, y: y, z: z};
    }
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Patching
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function attackRoll(wrapped, options) {

    options.advantage = true;

    let result = await wrapped(options);
    return result;
} 