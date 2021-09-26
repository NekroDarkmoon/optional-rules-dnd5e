// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from "./constants.js";
import { attackRoll , getAttackToHit} from "./lib/patches.js";
import { libWrapper } from "./lib/shim.js";


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Flanking
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Flanking
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Flanking
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                Flanking Function
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export async function flanking(userSettings) {

    const flanking = new FlankingGrid(userSettings);
    

    // Set up Hooks
    Hooks.on('targetToken',  async (user, target, state) => {
        await flanking.onTargetToken(user, target, state)
    });


    Hooks.on('updateToken', async (...args) => {flanking.onUpdateToken(...args)});


    // Set up libwrapper
    if ( !userSettings.midi && userSettings.adv ) {
        libWrapper.register(moduleName, "CONFIG.Item.documentClass.prototype.rollAttack", attackRoll, "WRAPPER");
        console.log(`${moduleTag} | Rolling with adv`);
    } 

    if ( !userSettings.adv ) {
        libWrapper.register(moduleName, "CONFIG.Item.documentClass.prototype.getAttackToHit", getAttackToHit, "OVERRIDE", userSettings=userSettings,{chain: true});
        console.log(`${moduleTag} | Patching for flanking modifier.`)
    } 

}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Flanking Grid
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FlankingGrid {

    constructor(userSettings) {
        this.userSettings = userSettings;
    }


    // Hooks
    async onTargetToken(user, target, state){
        // Remove flanking status is untargeted
        if ( !state ) {await this.removeFlankingFlag(); return true;}

        // Check if controlled tokens are flanking on target
        for ( const selected of canvas.tokens.controlled) {
            if ( await this.isFlanking(user, selected, target) ) {
                
                const actor = game.actors.get(selected.data.actorId);
                await actor.setFlag(moduleName, "flanking", true);

                // Use midi for adv is exists
                if (this.userSettings.midi && this.userSettings.adv) {
                    await actor.setFlag("midi-qol", "advantage.attack.mwak", true);
                }

                return;
            }
        }
    }


    async onUpdateToken(...args) {

        const actor = game.actors.get(args[0].data.actorId);

        if ( !actor.getFlag(moduleName, "flanking")) return true;
        await actor.setFlag(moduleName, "flanking", false);

        if ( !(this.userSettings.midi && this.userSettings.adv) ) return true;
        if ( !actor.getFlag("midi-qol", "advantage.attack.mwak")) return true;
        await actor.setFlag("midi-qol", "advantage.attack.mwak", false);

    }


    async isFlanking(user, attackerData, targetData) {
        // Create attacker and target 
        const attacker = new Char(attackerData);
        const target = new Char(targetData);

        // Check size 
        if ( target.height >= this.userSettings?.size ) return false;

        // Check disposition
        if ( attacker.disposition === target.disposition ) return false;

        // Check if adjacent
        if ( !this.isAdjacent(attacker.location, target.location) ) return false;

        // Adjust Attacker and Target size
        attacker.adjustLocationGrid();
        target.adjustLocationGrid();

        // Create Flanking Ray and calculate relative location of flanker
        const ray = new FlankingRay(attacker.location, target.location);
        const requiredPosition = ray.getFlankingPosition();

        // Check if freindly exists at target location.
        if ( await this.friendlyExists(attacker, target, requiredPosition) ) return true; 


        return false;
    }

    /**
     * 
     * @param {number} attacker 
     * @param {number} target 
     * 
     * @returns {boolean}
     */
    isAdjacent(attacker, target) {
        let gridSize = canvas.grid.size;
        if ( Math.abs(attacker.x - target.x) > (target.height * gridSize ) ||
             Math.abs(attacker.y - target.y) > (target.height * gridSize) ) {
                return false;
        }

        return true;
    }


    async friendlyExists( attacker, target, reqPos ) {
        const tokens = canvas.tokens.children[0].children;
        console.log(reqPos)

        for (const token of tokens) {
            let tLoc = token._validPosition;
            tLoc.z = token.data.elevation;

            if ( !(JSON.stringify(tLoc) === JSON.stringify(reqPos)) ) continue;
            if ( !(token.data.disposition === attacker.disposition) ) continue;

            // Check if unconcious
            const actor = game.actors.get(token.data.actorId);
            if (this.isUnconscious(actor)) return false;

            await ChatMessage.create({
                speaker: {alias: "Optional Rules"},
                content: `${attacker.data.name} & ${token.data.name} are flanking ${target.data.name}`
            });

            return true;
        }

        return false;
    }


    isUnconscious (actor) {
        const effects = actor.data.effects?._source;
        if ( effects == null ) return false;

        for (let index = 0; index < effects.length; index++) {
            const effect = effects[index];
            if ( effect.label == "Unconscious" ) return true; 
        }

        return false;
    }


    async removeFlankingFlag() {
        // TODO: Can just use canvas.tokens.controlled[0]
        for ( const selected of canvas.tokens.controlled) {
            const actor = game.actors.get(selected.data.actorId);

            if ( actor.getFlag(moduleName, "flanking") ) {
                await actor.setFlag(moduleName, "flanking", false);

                if ( this.userSettings.midi && this.userSettings.adv) {
                    await actor.setFlag("midi-qol", "advantage.attack.mwak", false);
                }
                console.log(`${moduleTag} | Flanking condition Removed.`);
            }
        }
    }
    
}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Flanking Hex
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FlankingHex {


}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    FlankingRay
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FlankingRay {
    // Object of x y z
    constructor (origin, target) {
        this.origin = origin;
        this.target = target;

        this.distance = this.calcDistance();
        this.normalized = this.normalized();
    }

    /**
     * 
     * @returns {number}
     */
    calcDistance( ) {
        const { x: x1, y: y1, z: z1 } = this.origin;
        const { x: x2, y: y2, z: z2 } = this.target;
        
        return (Math.sqrt(
            Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2) + Math.pow((z2-z1), 2) 
        ));
    }


    /**
     * 
     * @returns {Array}
     */
    normalized( ) {
        const { x: x1, y: y1, z: z1 } = this.origin;
        const { x: x2, y: y2, z: z2 } = this.target;

        const v = [ (x1-x2), (y1-y2), (z1-z2) ];
        return [ 
            v[0]/this.distance, v[1]/this.distance, v[2]/this.distance
        ]
    }
    

    /**
     * 
     * @returns {Object}
     */
    getFlankingPosition( ) {
        const {x: x1, y: y1, z: z1} = this.target;

        let x = x1 - (this.distance * this.normalized[0]);
        let y = y1 - (this.distance * this.normalized[1]);
        let z = z1 - (this.distance * this.normalized[2]);

        return { x, y, z };

    }
}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                       Char
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * A class fro representing token data needed for Flanking.
 */
class Char {
    constructor( data ) {
        this.data = data;
        this.gridSize = canvas.grid.size;

        // Calculated data.
        this.disposition = this.fetchDisposition();
        this.size = this.fetchSize();
        this.height = this.fetchHeight(); //Integer representation of size in grid count.
        this.location = this.calcLocation();
    }


    adjustLocationGrid() {
        if ( this.size > this.gridSize ) {
            this.location = {
                x: (this.location.x + (this.size - this.gridSize) + this.location.x) * 0.5,
                y: (this.location.y + (this.size - this.gridSize) + this.location.y) * 0.5,
                z: target.data.elevation
            }
        }
    }

    adjustLocationHex() {}

    calcLocation() {
        const location = this.data._validPosition;
        location.z = this.data.data.elevation;
        return location;
    }

    fetchDisposition() {
        return this.data.data.disposition;
    }

    fetchHeight() {
        return this.data.data.height;
    }

    fetchSize() {
        return Math.max( this.data.hitArea.width, this.data.hitArea.height); 
    }

}
