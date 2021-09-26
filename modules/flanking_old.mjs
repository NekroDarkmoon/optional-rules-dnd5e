// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from "./constants.js";
import { libWrapper } from "./lib/shim.js";

var flankingSettings;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Flanking
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * 
 * @param midi {boolean}
 */
export async function Flanking(settings) {

    flankingSettings = settings;

    Hooks.on('targetToken', async (user, target, state) => {
        // Remove flanking if state is not targetting.
        if (!state) {
            for (const selected of canvas.tokens.controlled){
                let actor = game.actors.get(selected.data.actorId);
                if (actor.getFlag(moduleName, "flanking")) {
                    await actor.setFlag(moduleName, "flanking", false);
                    if (settings.midi && settings.adv) {
                        await actor.setFlag("midi-qol", "advantage.attack.mwak", false);
                    }
                    console.log(`${moduleTag} | Flanking condition Removed.`);
                }
            }
            return;
        }        

        // Start checking for controlled/selected actors.
        for(const selected of canvas.tokens.controlled){
            if (await isFlanking(user, selected, target)){
                let actor = game.actors.get(selected.data.actorId);
                await actor.setFlag(moduleName, "flanking", true);
                
                // Use midi for advantage automation
                if (settings.midi && settings.adv) {
                    await actor.setFlag("midi-qol", "advantage.attack.mwak", true);
                }

                return;
            }
        }

    });

    // Remove flanking on move
    Hooks.on('updateToken', async (...args) => {
        let actor = game.actors.get(args[0].data.actorId);

        if (await actor.getFlag(moduleName, "flanking")){
            await actor.setFlag(moduleName, "flanking", false);

            if (settings.midi && settings.adv) {
                if (await actor.getFlag("midi-qol", "advantage.attack.mwak")) {
                    await actor.setFlag("midi-qol", "advantage.attack.mwak", false);
                }
            }
        }

    });

    // Run a patch for attack roll if midi is not found
    if (!settings.midi && settings.adv) {
        libWrapper.register(moduleName, "CONFIG.Item.documentClass.prototype.rollAttack", attackRoll, "WRAPPER");
        console.log(`${moduleTag} | Rolling with adv`);
    }

    if (!settings.adv) {
        libWrapper.register(moduleName, "CONFIG.Item.documentClass.prototype.getAttackToHit", getAttackToHit, "OVERRIDE", {chain: true});
        console.log(`${moduleTag} | Patching for flanking modifier.`)
    }

}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * Check if a target is being flanked by another ally.
 * @param user {Object} 
 * @param origin {Object}
 * @param target {Object}
 * @returns
 */
async function isFlanking(user, origin, target) {
    
    // Check attacker disposition against target disposition
    const oDisposition = origin.data.disposition;
    const tDisposition = target.data.disposition;
    if (oDisposition === tDisposition) {return false;}

    // Check Target size
    if (target.data.height >= flankingSettings?.size){return false;}
   
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
    let height = target.data.height;
    if (Math.abs(oLocation.x - tLocation.x) > height*gridSize || 
        Math.abs(oLocation.y - tLocation.y) > height*gridSize) {
            return false;
    }
    
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
        console.info(`${moduleTag} | Distance: ${flanker.distance}; Normalized: ${flanker.normalized}; ReqPos: ${JSON.stringify(requiredPosition)}.`);
        
        if (token._validPosition.x == requiredPosition.x && token._validPosition.y == requiredPosition.y &&
            token.data.elevation == requiredPosition.z && token.data.disposition == oDisposition) {
           
            // Check if Unconcious 
            const actor = game.actors.get(token.data.actorId);
            let effects = actor.data.effects?._source;
            if (effects !== undefined && effects !== null) {
                for (let index = 0; index < effects.length; index++) {
                    const effect = effects[index];
                    if (effect.label == "Unconscious") {
                        console.info(`${moduleTag} | ${token.data.name} is Unconscious.`);
                        return false;
                    }
                }
            }

            console.info(`${moduleTag} | Flanking with ${token.data.name}.`);
            
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
//                                    Hold
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Hold
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Patching
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * 
 * @param wrapped {wrapped}
 * @param options {Object}
 * @returns 
 */
async function attackRoll(wrapped, options) {

    if (this.parent.data.flags[moduleName] !== undefined 
        && this.parent.data.flags[moduleName].flanking &&
        this?.data?.data?.actionType == "mwak") { 
        options.advantage = true;
        options.fastForward = true;
    }

    return await wrapped(options);
} 


function getAttackToHit(wrapped) {
    let original = wrapped();
    
    if (this == null || this == undefined) {return wrapped();}
    if (original == undefined || original == null) {return wrapped();}

    if (this?.parent?.data?.flags[moduleName] !== undefined &&
        this?.parent?.data?.flags[moduleName] !== null &&
        this?.parent?.data?.flags[moduleName]?.flanking &&
        this?.data?.data?.actionType == "mwak") {
            original.parts.push(flankingSettings.mod);
            console.log("Added modifier");
        }

    return original;
}