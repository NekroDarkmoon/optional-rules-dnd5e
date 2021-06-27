// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Flanking
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function Flanking() {
    
    Hooks.on('targetToken', async (user, target, state) => {
        // 3 attributes, user, targeted token, targeted or not
        // 2530

        if (!state) {return;}        
        // console.log(target);                

        for(const selected of canvas.tokens.controlled){
            // console.log(selected);
            await checkNeighbours(user, target, selected);
        }

    });
    
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function checkNeighbours(user, target, origin) {

    // Get valid location
    let location = target._validPosition;
    console.log(location);

    // Get Grid size
    let gridSize = canvas.grid.size;

    // // Generate bounding box
    // let boundingBox = {
    //     x1: location.x-gridSize,
    //     x2: location.x+gridSize,
    //     y1: location.y-gridSize,
    //     y2: location.y+gridSize
    // };
   
    // Create Ray from attacker to target



    let flanker = new FlankingRay(origin._validPosition, target._validPosition);    
    let requiredPosition = flanker.getFlankingPosititon();
    console.log(requiredPosition);    

    let tokens = canvas.tokens.children[0].children;
    for (const token of tokens) {
        if (token._validPosition.x == requiredPosition.x && token._validPosition.y == requiredPosition.y) {
            console.log(`Flanking with ${token.data.name}`);
        }
    }

}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FlankingRay {

    constructor(origin, target) {
        this.origin = origin;
        this.target = target;
        
        this.distance = this.clacdistance();
        this.normalized = this.normalized();
    }


    clacdistance() {
        const {x: x1, y: y1} = this.origin;
        const {x: x2, y: y2} = this.target;

        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2-y1), 2)); 
    }


    normalized() {
        const {x: x1, y: y1} = this.origin;
        const {x: x2, y: y2} = this.target;

        const v = [(x1-x2), (y1-y2)];
        return [(v[0]/this.distance), (v[1]/this.distance)];
    }


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
