import { moduleName, moduleTag } from '../constants.js';
let debugLog;
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
	if (!debugLog) debugLog = game.settings.get(moduleName, 'outputDebug');
	if (debugLog) console.debug(`${moduleTag} | ${msg}`);
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
export function distanceBetween(t1, t2, wallBlocks = true) {
	const t1x = t1.width >= 1 ? 0.5 : t1.width / 2;
	const t1y = t1.height >= 1 ? 0.5 : t1.height / 2;
	const t2x = t2.width >= 1 ? 0.5 : t2.width / 2;
	const t2y = t2.height >= 1 ? 0.5 : t2.height / 2;

	// Start loop for t1
	const segments = [];
	for (let x0 = t1x; x0 < t1.width; x0++) {
		for (let y0 = t1y; y0 < t1.height; y0++) {
			// Get Origin Point
			const origin = new PIXI.Point(
				...canvas.grid.getCenter(
					Math.round(t1.x + canvas.dimensions.size * x0),
					Math.round(t1.y + canvas.dimensions.size * y0)
				)
			);

			// Start loop for t2
			for (let x1 = t2x; x1 < t2.width; x1++) {
				for (let y1 = t2y; y1 < t2.height; y1++) {
					// Get Destination point
					const destination = new PIXI.Point(
						...canvas.grid.getCenter(
							Math.round(t2.x + canvas.dimensions.size * x1),
							Math.round(t2.y + canvas.dimensions.size * y1)
						)
					);

					const ray = new Ray(origin, destination);

					// Check wall blocking
					if (wallBlocks)
						if (canvas.walls.checkCollision(ray, { mode: 'any' })) continue;
					segments.push({ ray });
				}
			}
		}
	}

	// Check if ray exists
	if (!segments.length) return -1;
	const rayDistances = segments.map(
		ray => canvas.grid.measureDistances([ray], { gridSpaces: true })[0]
	);
	let distance = Math.min(...rayDistances);

	// Account for Elevation
	const sceneSquare = canvas?.dimensions?.distance ?? 5;
	const t1e = t1.elevation ?? 0;
	const t2e = t2.elevation ?? 0;
	const t1TotalE = t1e + t1.height * sceneSquare;
	const t2TotalE = t2e + t2.height * sceneSquare;
	let heightDifference = 0;
	const elevationRange = Math.max(t1.height, t1.width) * sceneSquare;

	if (Math.abs(t2e - t1e) < elevationRange) heightDifference = 0;
	else if (t1e > t2e) heightDifference = t1e - t2TotalE;
	else if (t2e > t1e) heightDifference = t2e - t1TotalE;

	const rule = canvas.grid.diagonalRule;
	if (['5105', '555'].includes(rule)) {
		let nd = Math.min(distance, heightDifference);
		let ns = Math.abs(distance - heightDifference);
		distance = nd + ns;
		let dimension = canvas?.dimensions?.distance ?? 5;
		if (rule === '5105')
			distance = distance + Math.floor(nd / 2 / dimension) * dimension;
	} else {
		distance = Math.sqrt(
			heightDifference * heightDifference + distance * distance
		);
	}

	return distance;
}
