// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';
import { attackRoll, getAttackToHit } from './lib/patches.js';
import { libWrapper } from './lib/shim.js';
import {
	debug,
	FlankingRay,
	getDistance,
	TokenChar,
} from './partials/utils.js';

/**
 * @typedef {Object} Rectangle
 * @param {Number} x1
 * @param {Number} x2
 * @param {Number} y1
 * @param {Number} y2
 * @param {Number} z1
 * @param {Number} z2
 */

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                Flanking Function
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 * @param {Object} userSettings
 */
export async function flanking(userSettings) {
	const flanking = new FlankingGrid(userSettings);

	// Set up Hooks
	Hooks.on('targetToken', async (user, target, state) => {
		await flanking.onTargetToken(user, target, state);
	});

	Hooks.on('updateToken', async (...args) => {
		flanking.onUpdateToken(...args);
	});

	// Set up Lib Wrapper
	if (!userSettings.midi && userSettings.adv) {
		libWrapper.register(
			moduleName,
			'CONFIG.Item.documentClass.prototype.rollAttack',
			attackRoll,
			'WRAPPER'
		);
		console.log(`${moduleTag} | Rolling with adv`);
	}

	if (!userSettings.adv) {
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

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Flanking Grid
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FlankingGrid {
	constructor(userSettings) {
		this.userSettings = userSettings;
	}

	// Hooks
	async onTargetToken(user, target, state) {
		// Remove flanking status if target is removed
		if (!state) {
			await this.removeFlankingFlag();
			return;
		}

		// Check if controlled tokens are flanking on target
		const selected = canvas?.tokens?.controlled[0];
		if (!selected) return;

		if (await this.isFlanking(user, selected, target)) {
			const actor = game.actors.get(selected.data.actorId);
			await actor.setFlag(moduleName, 'flanking', true);

			// Use midi if exists to provide advantage
			if (this.userSettings.midi && this.userSettings.adv)
				await actor.setFlag('midi-qol', 'advantage.attack.mwak', true);

			return;
		}

		return;
	}

	/**
	 *
	 * @param  {...any} args
	 */
	async onUpdateToken(...args) {
		const actor = game.actors.get(args[0].data.actorId);
		if (!actor) return false;

		if (!actor.getFlag(moduleName, 'flanking')) return true;
		await actor.setFlag(moduleName, 'flanking', false);

		if (!(this.userSettings.midi && this.userSettings.adv)) return true;
		if (!actor.getFlag('midi-qol', 'advantage.attack.mwak')) return true;
		await actor.setFlag('midi-qol', 'advantage.attack.mwak', false);

		console.info(`${moduleTag} | Flanking condition Removed.`);
		return true;
	}

	async removeFlankingFlag() {
		const selected = canvas?.tokens?.controlled[0];
		if (!selected) return;

		// Get Actor
		const actor = game.actors.get(selected.data.actorId);

		if (actor.getFlag(moduleName, 'flanking')) {
			await actor.setFlag(moduleName, 'flanking', false);

			if (this.userSettings.midi && this.userSettings.adv)
				await actor.setFlag('midi-qol', 'advantage.attack.mwak', false);

			console.log(`${moduleTag} | Flanking condition Removed.`);
		}
	}

	// Main Functions
	async isFlanking(user, attackerData, targetData) {
		// Create helper attacker and target classes
		const attacker = new TokenChar(attackerData);
		const target = new TokenChar(targetData);

		// Check target size
		if (target.height >= this.userSettings?.size) return false;
		debug('Target size checked');

		// Check disposition
		if (attacker.disposition === target.disposition) return false;
		debug('Target disposition checked');

		// Adjust center points for calculations
		attacker.adjustLocationGrid();
		target.adjustLocationGrid();

		// Check if Adjacent
		if (!this.isAdjacent(attacker.data, target.data)) return false;
		debug('Adjacency Checked');

		// Create Flanking Ray and calculate relative location of flanker
		const ray = new FlankingRay(attacker.location, target.location);
		const requiredPosition = ray.getFlankingPosition();
		debug('Ray Calculated');

		// Check if a friendly exists at target location.
		if (await this.friendlyExists(attacker, target, requiredPosition))
			return true;

		return false;
	}

	isAdjacent(attacker, target) {
		if (getDistance(attacker, target) > 5) return false;

		return true;
	}

	/**
	 * @param {TokenChar} attacker
	 * @param {TokenChar} target
	 * @param {import('./partials/utils.js').Point} reqPos
	 */
	async friendlyExists(attacker, target, reqPos) {
		const tokens = canvas.tokens.children[0].children;
		console.info(`${moduleTag} | Req Pos: ${JSON.stringify(reqPos)}`);

		// Create a BBox for the attacker if size is greater than medium;
		const attackerBB = this._getAttackerBBox(attacker, reqPos);

		for (const t of tokens) {
			// Skip Self
			if (t.data._id === target.data.data._id) continue;
			if (t.data._id === attacker.data.data._id) continue;

			// Check disposition match
			if (t.data.disposition === target.disposition) continue;
			debug('Target and Flanker not of the same disposition.');

			// Check if Unconscious
			const actor = game.actors.get(t.data.actorId);
			if (this._isUnconscious(actor)) continue;

			// Check if a token exists in space
			if (!this.tokenAt(attacker, target, t, reqPos, attackerBB)) continue;

			// Create chat message
			await ChatMessage.create({
				speaker: { alias: 'Optional Rules DnD5e' },
				content: `${attacker.data.name} & ${t.data.name} are flanking ${target.data.name}`,
			});

			return true;
		}

		return false;
	}

	/**
	 *
	 * @param {*} a
	 * @param {*} tar
	 * @param {*} tok
	 * @param {*} reqPos
	 * @param {*} aBB
	 */
	tokenAt(a, tar, tok, reqPos, aBB) {
		const attackerSize = a.height;
		const tokenSize = tok.data.height;
		const tLoc = {
			x: tok._validPosition.x,
			y: tok._validPosition.y,
			z: tok.data.elevation,
		};

		// Check if the token and the target are adjacent
		if (!this.isAdjacent(tar.data, tok)) return false;

		// Case: same size
		if (attackerSize === tokenSize) {
			if (tokenSize > 1)
				return JSON.stringify(
					this._getTrueCenter(tok) === JSON.stringify(reqPos)
				);
			else return JSON.stringify(tLoc) === JSON.stringify(reqPos);
		}

		// If attacker is larger than helper
		if (attackerSize > tokenSize) {
			// Construct token Rectangle
			const tBB = this._getTokenBBox(tokenSize, tLoc, a.gridSize);

			// Check if tBB is inside aBB inside
			if (
				tBB.x1 >= aBB.x1 &&
				tBB.x2 <= aBB.x2 &&
				tBB.y1 >= aBB.y1 &&
				tBB.y2 <= tBB.y2 //&&
				// tBB.z1 >= aBB.z1 &&
				// tBB.z2 <= aBB.z2
			)
				return true;

			return false;
		}

		if (attackerSize < tokenSize) {
			// Construct token rectangle
			const tBB = this._getTokenBBox(tokenSize, tLoc, a.gridSize);

			// Check if req Pos in token rectangle
			if (
				reqPos.x >= tBB.x1 &&
				reqPos.x <= tBB.x2 &&
				reqPos.y >= tBB.y1 &&
				reqPos.y <= tBB.y2
			)
				return true;

			return false;
		}

		return false;
	}

	/**
	 * @param {TokenChar} attacker
	 * @returns {Rectangle}
	 */
	_getAttackerBBox(attacker, reqPos) {
		const expandCoff = (attacker.height * attacker.gridSize) / 2;
		return {
			x1: reqPos.x - expandCoff,
			x2: reqPos.x + expandCoff,
			y1: reqPos.y - expandCoff,
			y2: reqPos.y + expandCoff,
			z1: reqPos.z - expandCoff,
			z2: reqPos.z + expandCoff,
		};
	}

	/**
	 * @param {Number} tokenSize
	 * @param {*} tLoc
	 * @param {Number} coff
	 * @returns {Rectangle}
	 */
	_getTokenBBox(tokenSize, tLoc, coff) {
		return {
			x1: tLoc.x,
			y1: tLoc.y,
			z1: tLoc.z,
			x2: tLoc.x + (tokenSize - 1) * coff,
			y2: tLoc.y + (tokenSize - 1) * coff,
			z2: tLoc.z + (tokenSize - 1) * coff,
		};
	}

	/**
	 *
	 * @param {*} actor
	 * @returns {Boolean}
	 */
	_isUnconscious(actor) {
		const effects = actor.data.effects?._source;
		if (actor.data.data.attributes.hp.value < 1) return true;
		if (!effects) return false;

		for (let i = 0; i < effects.length; i++) {
			const effect = effects[i];
			if (effect.label == 'Unconscious') return true;
		}

		return false;
	}

	/**
	 *
	 * @param {*} token
	 * @returns {import('./partials/utils.js').Point}
	 */
	_getTrueCenter(token) {
		const tLoc = JSON.parse(JSON.stringify(token._validPosition));
		tLoc.z = token.data.elevation;

		const size = token.data.height;
		const hitSize = Math.max(token.hitArea.width, token.hitArea.height);

		// Return default if medium or smaller
		if (size > 1) {
			tLoc.x = (tLoc.x + (hitSize - canvas.grid.size) + tLoc.x) * 0.5;
			tLoc.y = (tLoc.y + (hitSize - canvas.grid.size) + tLoc.y) * 0.5;
		}

		console.log(tLoc);
		return tLoc;
	}
}
