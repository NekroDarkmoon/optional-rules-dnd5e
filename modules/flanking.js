// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';
import { attackRoll, getAttackToHit, setModifier } from './lib/patches.js';
import { debug, isAdjacent, FlankingRay } from './partials/utils.js';

const SETTINGS = {
	midi: game.modules.get('midi-qol')?.active,
	adv: !game.settings.get(moduleName, 'useFlankingMod'),
	mod: game.settings.get(moduleName, 'flankingMod'),
	size: game.settings.get(moduleName, 'internalCreatureSize'),
	allowNeutrals: game.settings.get(moduleName, 'flankNeutrals'),
	disableCard: game.settings.get(moduleName, 'flankingDisableCard'),
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                           Exports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export async function setupFlanking() {
	const flanking = new FlankingGrid();
	await setModifier();

	// LibWrapper
	if (!SETTINGS.midi && SETTINGS.adv) {
		libWrapper.register(
			moduleName,
			'CONFIG.Item.documentClass.prototype.rollAttack',
			attackRoll,
			'WRAPPER'
		);

		console.log(`${moduleTag} | Rolling with adv`);
	}

	if (!SETTINGS.adv) {
		libWrapper.register(
			moduleName,
			'CONFIG.Item.documentClass.prototype.getAttackToHit',
			getAttackToHit,
			'MIXED',
			{ chain: true }
		);
		console.log(`${moduleTag} | Patching for flanking modifier.`);
	}
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
		if (user.id !== game.userId) return;

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
		// Check target Size
		if (target.height >= SETTINGS.size) return false;
		debug('Target size checked.');

		if (attacker.disposition === target.disposition) return false;
		debug('Target disposition checked.');

		// Check if attacker is adjacent to target
		if (!this.isAdjacent(attacker, target)) return false;
		debug('Attacker Adjacency checked.');

		// Get adjacent tokens
		const possibleFlankers = this.getAdjacentTokens(target).filter(
			t => t.id !== attacker.id
		);
		if (!possibleFlankers.length) return false;
		debug('Possible Flankers', possibleFlankers.length);

		// Calculate Flanking ray and relative position of flanker
		const ray = new FlankingRay(
			this.getTokenCenter(attacker),
			this.getTokenCenter(target)
		);

		// Check if possibleFlakers are in a required position.
		const exists = !possibleFlankers.every(token => {
			debug('Checking token: ', token.name);
			const tokenCenter = this.getTokenCenter(token);
			const reqPos = ray.getAdjustedFlankingPosition(
				this.getSizeDifference(attacker, token)
			);

			// Check if required Position is the same as center
			if (JSON.stringify(tokenCenter) === JSON.stringify(reqPos)) {
				// Optionally Create chat message
				if (SETTINGS.disableCard) return false;

				ChatMessage.create({
					speaker: { alias: 'Optional Rules DnD5e' },
					content: `${attacker.name} & ${token.name} are flanking ${target.name}`,
				});

				return false;
			}

			return true;
		});

		debug(exists);
		return exists;
	}

	// *********************************************************
	// Helpers
	/**
	 *
	 * @param {*} attacker
	 * @param {*} target
	 * @returns {Boolean}
	 */
	isAdjacent(attacker, target) {
		// FIXME: INLINE
		return isAdjacent(attacker, target);
	}

	/**
	 *
	 * @param {*} target
	 * @returns {Array}
	 */
	getAdjacentTokens(target) {
		const reqDisposition = target.disposition * -1;
		return (
			canvas.scene.tokens.filter(t => {
				const isNeutral = SETTINGS.allowNeutrals && t.disposition === 0;
				const matchDisposition = t.disposition === reqDisposition || isNeutral;

				if (t?.actor?.system?.attributes?.hp?.value > 0 && matchDisposition)
					return this.isAdjacent(target, t);
				else return false;
			}) ?? []
		);
	}

	/**
	 * @param {*} token
	 * @returns {import('./partials/utils.js').Point}
	 */
	getTokenCenter(token) {
		const { x, y } = token._object.center;
		return { x, y, z: 0 };
	}

	/**
	 *
	 * @param {*} t1
	 * @param {*} t2
	 * @returns {Number}
	 */
	getSizeDifference(t1, t2) {
		return t2.height - t1.height;
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
