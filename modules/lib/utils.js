// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     TokenChar
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * @typedef {Object} Point
 * @property {Number} x
 * @property {Number} y
 * @property {Number} z
 */

/**
 * A class for representing token data needed for Flanking.
 */
export class TokenChar {
	constructor(data) {
		this.data = data;
		this.gridSize = canvas.grid.size;

		// Calculated data.
		this.disposition = this.fetchDisposition();
		this.size = this.fetchSize();
		this.height = this.fetchHeight(); //Integer representation of size in grid count.
		this.location = this.calcLocation();
		this.validPos = this.calcLocation();
	}

	/**
	 * @memberof TokenChar
	 */
	adjustLocationGrid() {
		if (this.size > this.gridSize) {
			this.location = {
				x: this.location.x + (this.size - this.gridSize) * 0.5,
				y: this.location.y + (this.size - this.gridSize) * 0.5,
				z: this.data.data.elevation,
			};
		}
	}

	/**
	 * @memberof TokenChar
	 */
	adjustLocationHex() {}

	/**
	 * Gets the valid location of a token and adds elevation data to it.
	 * @returns {Point}
	 */
	calcLocation() {
		const location = JSON.parse(JSON.stringify(this.data._validPosition));
		location.z = this.data.data.elevation;
		return location;
	}

	/**
	 *
	 * @returns {Number}
	 */
	fetchDisposition() {
		return this.data.data.disposition;
	}

	/**
	 *
	 * @returns {Number}
	 */
	fetchHeight() {
		return this.data.data.height;
	}

	/**
	 *
	 * @returns {Number}
	 */
	fetchSize() {
		return Math.max(this.data.hitArea.width, this.data.hitArea.height);
	}
}
