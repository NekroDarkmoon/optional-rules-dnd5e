import { moduleName, moduleTag } from '../constants.js';
let debugLog;

/**
 * @typedef {Object} Point
 * @property {Number} x
 * @property {Number} y
 * @property {Number} z
 */

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Debug Log
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

		this.distance = this._calcDistance();
		this.normalized = this._normalize();
		this.reqPos = this._getFlankingPosition();
	}

	/**
	 *
	 * @returns {number}
	 */
	_calcDistance() {
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
	_normalize() {
		const { x: x1, y: y1, z: z1 } = this.origin;
		const { x: x2, y: y2, z: z2 } = this.target;

		const v = [x1 - x2, y1 - y2, z1 - z2];
		return [v[0] / this.distance, v[1] / this.distance, v[2] / this.distance];
	}

	/**
	 *
	 * @returns {Point}
	 */
	_getFlankingPosition() {
		const { x: x1, y: y1, z: z1 } = this.target;
		const x = x1 - this.distance * this.normalized[0];
		const y = y1 - this.distance * this.normalized[1];
		const z = z1 - this.distance * this.normalized[2];

		return { x, y, z };
	}

	/**
	 *
	 * @returns {Point}
	 */
	getAdjustedFlankingPosition(sizeDiff) {
		const { x, y, z } = this.reqPos;
		const [directionX, directionY, directionZ] = this.normalized.map(Math.sign);
		const gridSize = canvas.grid.size / 2;
		return {
			x: x - gridSize * sizeDiff * directionX,
			y: y - gridSize * sizeDiff * directionY,
			z: z - gridSize * sizeDiff * directionZ,
		};
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Distance Measuring
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function isAdjacent(t1, t2) {
	// Create ray from t1 center to t2 center
	const ray = new Ray(t1._object.center, t2._object.center);
	// console.debug(ray);
	// console.debug('Distance: ', ray.distance);

	// Get diagonal distance
	const gridScale = canvas?.grid?.size / 2;
	const t1Size = Math.max(t1.width, t1.height);
	const t2Size = Math.max(t2.width, t2.height);
	const diagonal = Math.sqrt(2 * Math.pow(gridScale * (t1Size + t2Size), 2));

	// console.debug('Diagonal Distance: ', diagonal);

	// Return if dx > diagonal || dy > diagonal
	// console.debug('dx > diagonal: ', ray.dx > diagonal);
	// console.debug('dy > diagonal: ', ray.dy > diagonal);

	if (ray.dx > diagonal || ray.dy > diagonal) return false;

	// Check if diagonal
	if (diagonal === ray.distance && Math.abs(ray.slope) !== 1) return false;

	return ray.distance <= diagonal;
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Distance Measuring
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// export function distanceBetween(t1, t2) {
// 	const { width: t1Width, height: t1Height, elevation: t1e } = t1;
// 	const { width: t2Width, height: t2Height, elevation: t2e } = t2;

// 	const [t1x, t1y, t2x, t2y] = [t1Width, t1Height, t2Width, t2Height].map(d =>
// 		d >= 1 ? 0.5 : d / 2
// 	);

// 	// Start loop for t1
// 	const segments = [];
// 	for (let x0 = t1x; x0 < t1.width; x0++) {
// 		for (let y0 = t1y; y0 < t1.height; y0++) {
// 			// Get Origin Point
// 			const origin = new PIXI.Point(
// 				...canvas.grid.getCenter(
// 					Math.round(t1.x + canvas.dimensions.size * x0),
// 					Math.round(t1.y + canvas.dimensions.size * y0)
// 				)
// 			);

// 			// Start loop for t2
// 			for (let x1 = t2x; x1 < t2.width; x1++) {
// 				for (let y1 = t2y; y1 < t2.height; y1++) {
// 					// Get Destination point
// 					const destination = new PIXI.Point(
// 						...canvas.grid.getCenter(
// 							Math.round(t2.x + canvas.dimensions.size * x1),
// 							Math.round(t2.y + canvas.dimensions.size * y1)
// 						)
// 					);

// 					const ray = new Ray(origin, destination);

// 					// Check wall blocking
// 					// if (wallBlocks)
// 					// 	if (canvas.walls.checkCollision(ray, { mode: 'any' })) continue;
// 					segments.push({ ray });
// 				}
// 			}
// 		}
// 	}

// 	// Check if ray exists
// 	if (!segments.length) return null;
// 	const rayDistances = canvas.grid.measureDistances(segments, {
// 		gridSpaces: true,
// 	});
// 	let distance = Math.min(...rayDistances);

// 	// Account for Elevation
// 	const sceneSquare = canvas?.dimensions?.distance ?? 5;
// 	const t1TotalE = t1e + t1Height * sceneSquare;
// 	const t2TotalE = t2e + t2Height * sceneSquare;
// 	let heightDifference = 0;
// 	const elevationRange = Math.max(t1Height, t1Width) * sceneSquare;

// 	if (Math.abs(t2e - t1e) < elevationRange) heightDifference = 0;
// 	else if (t1e > t2e) heightDifference = t1e - t2TotalE;
// 	else if (t2e > t1e) heightDifference = t2e - t1TotalE;

// 	const rule = canvas.grid.diagonalRule;
// 	if (['5105', '555'].includes(rule)) {
// 		let nd = Math.min(distance, heightDifference);
// 		let ns = Math.abs(distance - heightDifference);
// 		distance = nd + ns;
// 		let dimension = canvas?.dimensions?.distance ?? 5;
// 		if (rule === '5105')
// 			distance = distance + Math.floor(nd / 2 / dimension) * dimension;
// 	} else {
// 		distance = Math.sqrt(
// 			heightDifference * heightDifference + distance * distance
// 		);
// 	}

// 	return distance;
// }
