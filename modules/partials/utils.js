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
export function getDistance(t1, t2) {
	const { x: x1, y: y1 } = t1._object.center;
	const { x: x2, y: y2 } = t2._object.center;

	const sizeDiff = t2.height - t1.height;

	console.log(sizeDiff);
	const projectValue = sizeDiff === 0 ? 1 : sizeDiff / 2;
	console.log(projectValue);

	// console.log(x1, y1, x2, y2);
	const origin = t1._object.center;
	const destination = t2._object.center;

	// 	const originalRay = new Ray(origin, destination);
	// 	const adjustedRay = new Ray(
	// 		origin,
	// 		originalRay.project(projectValue * Math.sign(originalRay.slope))
	// 	);

	// 	console.log(originalRay);
	// 	console.log(
	// 		canvas.grid.measureDistances([{ ray: originalRay }], { gridSpaces: true })
	// 	);

	// 	console.log(adjustedRay);
	// 	console.log(
	// 		canvas.grid.measureDistances([{ ray: adjustedRay }], { gridSpaces: true })
	// 	);
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Distance Measuring
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function distanceBetween(t1, t2) {
	const { width: t1Width, height: t1Height, elevation: t1e } = t1;
	const { width: t2Width, height: t2Height, elevation: t2e } = t2;

	const [t1x, t1y, t2x, t2y] = [t1Width, t1Height, t2Width, t2Height].map(d =>
		d >= 1 ? 0.5 : d / 2
	);

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
					// if (wallBlocks)
					// 	if (canvas.walls.checkCollision(ray, { mode: 'any' })) continue;
					segments.push({ ray });
				}
			}
		}
	}

	// Check if ray exists
	if (!segments.length) return null;
	const rayDistances = canvas.grid.measureDistances(segments, {
		gridSpaces: true,
	});
	let distance = Math.min(...rayDistances);

	// Account for Elevation
	const sceneSquare = canvas?.dimensions?.distance ?? 5;
	const t1TotalE = t1e + t1Height * sceneSquare;
	const t2TotalE = t2e + t2Height * sceneSquare;
	let heightDifference = 0;
	const elevationRange = Math.max(t1Height, t1Width) * sceneSquare;

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
