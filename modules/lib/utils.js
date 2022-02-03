import { moduleName, moduleTag } from '../constants.js';

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

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     TokenChar
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function debug(msg) {
	if (true) console.info(`${moduleTag} | ${msg}`);
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    FlankingRay
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class FlankingRay {
	// Object of x y z
	constructor(origin, target) {
		this.origin = origin;
		this.target = target;

		this.distance = this.calcDistance();
		this.normalized = this.normalized();
	}

	/**
	 *
	 * @returns {number}
	 */
	calcDistance() {
		const { x: x1, y: y1, z: z1 } = this.origin;
		const { x: x2, y: y2, z: z2 } = this.target;

		return Math.sqrt(
			Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
		);
	}

	/**
	 *
	 * @returns {Array<Number>}
	 */
	normalized() {
		const { x: x1, y: y1, z: z1 } = this.origin;
		const { x: x2, y: y2, z: z2 } = this.target;

		const v = [x1 - x2, y1 - y2, z1 - z2];
		return [v[0] / this.distance, v[1] / this.distance, v[2] / this.distance];
	}

	/**
	 *
	 * @returns {import('./lib/utils.js').Point}
	 */
	getFlankingPosition() {
		const { x: x1, y: y1, z: z1 } = this.target;

		let x = x1 - this.distance * this.normalized[0];
		let y = y1 - this.distance * this.normalized[1];
		let z = z1 - this.distance * this.normalized[2];

		return { x, y, z };
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    FlankingRay
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function getDistance(t1, t2, wallBlock = true) {
	const t1X = t1.data.width >= 1 ? 0.5 : t1.data.width / 2;
	const t2X = t2.data.width >= 1 ? 0.5 : t2.data.width / 2;
	const t1Y = t1.data.height >= 1 ? 0.5 : t1.data.height / 2;
	const t2Y = t2.data.height >= 1 ? 0.5 : t2.data.height / 2;

	// Start loop for t1
	const segments = [];
	for (let x = t1X; x < t1.data.width; x++) {
		for (let y = t1Y; y < t1.data.height; y++) {
			// Get origin Point
			const origin = new PIXI.Point(
				...canvas.grid.getCenter(
					Math.round(t1.data.x + canvas.dimensions.size * x),
					Math.round(t1.data.y + canvas.dimensions.size * y)
				)
			);

			// Start loop for t2
			for (let x1 = t2X; x1 < t2.data.width; x1++) {
				for (let y1 = t2Y; y1 < t2.data.height; y1++) {
					// Get Destination point
					const dest = new PIXI.Point(
						...canvas.grid.getCenter(
							Math.round(t2.data.x + canvas.dimensions.size * x1),
							Math.round(t2.data.y + canvas.dimensions.size * y1)
						)
					);

					// Create Ray
					const r = new Ray(origin, dest);

					// Check Wall Blocking
					if (wallBlock) if (canvas.walls?.checkCollision(r)) continue;

					segments.push({ ray: r });
				}
			}
		}
	}

	// Check if ray exists
	if (!segments.length) return -1;
	const rDistance = segments.map(
		ray => canvas.grid.measureDistances([ray], { gridSpaces: true })[0]
	);

	const distance = Math.min(...rDistance);
	const height = Math.abs((t1.data.elevation || 0) - (t2.data.elevation || 0));

	return Math.sqrt(height * height + distance * distance);
}
