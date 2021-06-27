// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Flanking
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function Flanking() {
    
    Hooks.on('targetToken', async (...args) => {
        // 3 attributes, user, targeted token, targeted or not
        // 2530

        if (!args[2]) {return;}        
        console.log(args);                

        for(const selected of canvas.tokens.controlled){
            console.log(selected);
        }

        await checkNeighbours(args);
    });
    
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function checkNeighbours(args) {

    // Get valid location
    let location = args[1]._validPosition;
    console.log(location);

    // Get Grid size
    let gridSize = canvas.grid.size;

    // Generate bounding box
    let boundingBox = {
        x1: location.x-gridSize,
        x2: location.x+gridSize,
        y1: location.y-gridSize,
        y2: location.y+gridSize
    };
   
    // Create Ray from attacker to target
    // Project ray further from target to the other side
    console.log(this);


    console.log(boundingBox);

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


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
