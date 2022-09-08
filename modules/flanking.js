// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';
import { debug, distanceBetween } from './partials/utils.js';

const SETTINGS = {
	midi: game.modules.get('midi-qol')?.active,
	adv: !game.settings.get(moduleName, 'useFlankingMod'),
	mod: game.settings.get(moduleName, 'flankingMod'),
	size: game.settings.get(moduleName, 'internalCreatureSize'),
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Exports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export async function setupFlanking() {
	const flanking = new FlankingGrid();

	// LibWrapper
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FlankingGrid {
	constructor() {
		Hooks.on('targetToken', this.onTarget.bind(this));
		Hooks.on('updateToken', this.onUpdateToken.bind(this));
	}

	// *********************************************************
	// Hooks and Helpers
	async onTarget(user, target, state) {
		// Remove flanking status if target is removed.
		if (!state) return await this.removeFlankingFlag();

		// Check if controlled tokens are flanking on target
		const selected = canvas?.tokens?.controlled[0];
		if (!selected) return;

		if (await this.checkFlankingStatus(selected, target)) {
			const actor = game.actors.get(selected.document.actorId);
			await actor.setFlag(moduleName, 'flanking', true);

			if (SETTINGS.midi && SETTINGS.adv)
				await actor.setFlag('midi-qol', 'advantage.attack.mwak', true);

			return;
		}
		return;
	}

	async onUpdateToken(token) {
		const actor = token.actor;
		if (!actor) return;

		if (!actor.getFlag(moduleName, 'flanking')) return;
		await actor.setFlag(moduleName, 'flanking', false);

		if (!SETTINGS.midi && SETTINGS.adv) return;
		if (!actor.getFlag('midi-qol', 'advantage.attack.mwak')) return;
		await actor.setFlag('midi-qol', 'advantage.attack.mwak', false);

		console.info(`${moduleTag} | Flanking condition Removed.`);
		return;
	}

	async removeFlankingFlag() {
		const selected = canvas?.tokens?.controlled[0];
		if (!selected) return;

		const actor = game.actors.get(selected.document.actorId);

		if (actor.getFlag(moduleName, 'flanking')) {
			await actor.setFlag(moduleName, 'flanking', false);

			if (SETTINGS.midi && SETTINGS.adv)
				await actor.setFlag('midi-qol', 'advantage.attack.mwak', false);

			console.log(`${moduleTag} | Flanking condition Removed.`);
		}
	}

	// *********************************************************
	// Main Functions
	async checkFlankingStatus({ document: attacker }, { document: target }) {
		console.log('AttackerData');
		console.log(attacker);
		console.log('TargetData');
		console.log(target);

		// Check target Size
		if (target.height >= SETTINGS.size) return false;
		console.debug('Target size checked.');

		if (attacker.disposition === target.disposition) return false;
		console.debug('Target disposition checked.');

		// Check if attacker is adjacent to target
		if (!this.isAdjacent(attacker, target)) return false;
		console.debug('Adjacency checked.');
	}

	// *********************************************************
	// Helpers
	isAdjacent(attacker, target) {
		if (distanceBetween(attacker, target) > 5) return false;
		return true;
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                        Helper - Adjacent
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                   Helper - Get Nearby Targets
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
