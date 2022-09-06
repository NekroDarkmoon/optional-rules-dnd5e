// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            Exports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export async function setupHeroPoints() {
	// Get all pc chars
	const charIds = game.users.map(u => u.character?.id).filter(id => id);
	const actors = charIds.map(id => game.actors.get(id)).filter(a => a);

	// Early Return
	if (actors?.length === 0) return;

	const existingHp = {};
	actors.forEach(
		a =>
			(existingHp[a.id] =
				a.getFlag(moduleName, 'heroPoints') ?? calcHeroPoints(a, true))
	);
	console.log(existingHp);
}

export async function getHeroPoints() {}

export async function setHeroPoints(data) {}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            Functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 * @param {*} actor
 * @param {Boolean} set
 * @returns {Promise<Number>}
 */
function calcHeroPoints(actor, set = false) {
	const { level } = actor.system.details;
	const points = 5 + Math.floor(level / 2);
	if (set) actor.setFlag(moduleName, 'heroPoints', points);
	return points;
}
