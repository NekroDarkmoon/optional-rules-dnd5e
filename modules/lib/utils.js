// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     TokenChar
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * A class for representing token data needed for Flanking.
 */
class TokenChar {
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
                z: this.data.data.elevation
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
