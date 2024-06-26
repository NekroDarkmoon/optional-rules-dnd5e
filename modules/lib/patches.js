// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

let MOD = null;

export async function setModifier() {
	MOD = game.settings.get(moduleName, 'flankingMod');
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Attack Roll
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export async function attackRoll(wrapped, options) {
	// Flanking
	if (
		this.parent.flags[moduleName] !== undefined &&
		this.parent.flags[moduleName].flanking &&
		this?.system?.actionType == 'mwak'
	) {
		options.advantage = true;
		options.fastForward = true;
	}

	return await wrapped(options);
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                Get Attack To Hit
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function getAttackToHit(wrapped) {
	// Flanking
	let original = wrapped();

	if (!this) return wrapped();
	if (!original) return wrapped();

	if (
		this?.parent?.flags[moduleName] !== null &&
		this?.parent?.flags[moduleName]?.flanking &&
		this?.system?.actionType == 'mwak'
	)
		original.parts.push(MOD);

	return original;
}

