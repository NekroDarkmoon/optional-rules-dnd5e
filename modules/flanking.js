// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';
import { attackRoll, getAttackToHit } from './lib/patches.js';
import { libWrapper } from './lib/shim.js';
import { TokenChar } from './lib/utils.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                Flanking Function
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export async function flanking(userSettings) {
	const flanking = new FlankingGrid(userSettings);

	// Set up Hooks
	Hooks.on('targetToken', async (user, target, state) => {
		await flanking.onTargetToken(user, target, state);
	});

	Hooks.on('updateToken', async (...args) => {
		flanking.onUpdateToken(...args);
	});

	// Set up libwrapper
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
		// Remove flanking status is untargeted
		if (!state) {
			await this.removeFlankingFlag();
			return true;
		}

		// Check if controlled tokens are flanking on target
		const selected = canvas?.tokens?.controlled[0];
		if (!selected) return;

		if (await this.isFlanking(user, selected, target)) {
			const actor = game.actors.get(selected.data.actorId);
			await actor.setFlag(moduleName, 'flanking', true);

			// Use Midi if exists for adv.
			if (this.userSettings.midi && this.userSettings.adv)
				await actor.setFlag('midi-qol', 'advantage.attack.mwak', true);

			return;
		}
	}

	async onUpdateToken(...args) {
		const actor = game.actors.get(args[0].data.actorId);
		if (!actor) return true;

		if (!actor.getFlag(moduleName, 'flanking')) return true;
		await actor.setFlag(moduleName, 'flanking', false);

		if (!(this.userSettings.midi && this.userSettings.adv)) return true;
		if (!actor.getFlag('midi-qol', 'advantage.attack.mwak')) return true;
		await actor.setFlag('midi-qol', 'advantage.attack.mwak', false);

		console.log(`${moduleTag} | Flanking condition Removed.`);
	}

	async isFlanking(user, attackerData, targetData) {
		// Create attacker and target
		const attacker = new TokenChar(attackerData);
		const target = new TokenChar(targetData);

		// Check size
		if (target.height >= this.userSettings?.size) return false;

		// Check disposition
		if (attacker.disposition === target.disposition) return false;

		// Check if adjacent
		if (!this.isAdjacent(attacker.location, target.location, attacker.height))
			return false;

		// Adjust Attacker and Target size
		attacker.adjustLocationGrid();
		target.adjustLocationGrid();

		// Create Flanking Ray and calculate relative location of flanker
		const ray = new FlankingRay(attacker.location, target.location);
		const requiredPosition = ray.getFlankingPosition();
		console.log(ray.normalized);

		// Check if freindly exists at target location.
		if (await this.friendlyExists(attacker, target, requiredPosition))
			return true;

		return false;
	}

	/**
	 *
	 * @param {*} attacker
	 * @param {*} target
	 *
	 * @returns {boolean}
	 */
	isAdjacent(attacker, target, aHeight) {
		let gridSize = canvas.grid.size;
		if (
			Math.abs(attacker.x - target.x) > aHeight * gridSize ||
			Math.abs(attacker.y - target.y) > aHeight * gridSize
		)
			return false;

		return true;
	}

	/**
	 *
	 * @param {TokenChar} attacker
	 * @param {TokenChar} target
	 * @param {{x:Number, y:Number, z:Number}} reqPos
	 * @returns
	 */
	async friendlyExists(attacker, target, reqPos) {
		const tokens = canvas.tokens.children[0].children;
		console.info(`${moduleTag} | Req Pos: ${JSON.stringify(reqPos)}`);

		console.log(attacker);
		// Create bounding box for attacker if size greater than medium
		const expandCoeff = (attacker.height * attacker.gridSize) / 2;
		const attackerBB = {
			x1: reqPos.x - expandCoeff,
			x2: reqPos.x + expandCoeff,
			y1: reqPos.y - expandCoeff,
			y2: reqPos.y + expandCoeff,
			z1: reqPos.z - expandCoeff,
			z2: reqPos.z + expandCoeff,
		};

		for (const token of tokens) {
			// Skip Self
			if (token.data._id === target.data.data._id) continue;

			// Check if dispositions match
			if (!(token.data.disposition === attacker.disposition)) continue;

			// Check if Unconcious
			const actor = game.actors.get(token.data.actorId);
			if (this.isUnconscious(actor)) continue;

			// Insert Comment here
			if (!this._isFlanker(attacker, target, token, reqPos, attackerBB))
				continue;

			await ChatMessage.create({
				speaker: { alias: 'Optional Rules DnD5e' },
				content: `${attacker.data.name} & ${token.data.name} are flanking ${target.data.name}`,
			});

			return true;
		}

		return false;
	}

	_isFlanker(a, target, t, reqPos, aBB) {
		console.log(t.data.name);
		const attackerSize = a.height;
		const tokenSize = t.data.height;
		const tLoc = {
			x: t._validPosition.x,
			y: t._validPosition.y,
			z: t.data.elevation,
		};

		if (!this.isAdjacent(this.getTrueCenter(t), target.location, tokenSize))
			return false;

		if (attackerSize === tokenSize) {
			if (tokenSize > 1)
				return JSON.stringify(this.getTrueCenter(t)) === JSON.stringify(reqPos);
			else return JSON.stringify(tLoc) === JSON.stringify(reqPos);
		}

		if (!game.settings.get(moduleName, 'flankSizeDiff')) return false;

		if (attackerSize > tokenSize) {
			// Construct token rectangle
			const tBB = { x1: tLoc.x, y1: tLoc.y, z1: tLoc.z };
			tBB.x2 = tBB.x1 + (tokenSize - 1) * a.gridSize;
			tBB.y2 = tBB.y1 + (tokenSize - 1) * a.gridSize;
			tBB.z2 = tBB.z1 + (tokenSize - 1) * a.gridSize;

			// Check if tBB is inside aBB
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

		if (tokenSize > attackerSize) {
			// Construct token rectangle
			const tBB = { x1: tLoc.x, y1: tLoc.y, z1: tLoc.z };
			tBB.x2 = tBB.x1 + (tokenSize - 1) * a.gridSize;
			tBB.y2 = tBB.y1 + (tokenSize - 1) * a.gridSize;
			tBB.z2 = tBB.z1 + (tokenSize - 1) * a.gridSize;

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

	getTrueCenter(target) {
		const tLoc = JSON.parse(JSON.stringify(target._validPosition));
		tLoc.z = target.data.elevation;

		const size = target.data.height;
		const hitSize = Math.max(target.hitArea.width, target.hitArea.height);

		// Return default if medium or smaller
		if (size > 1) {
			tLoc.x = (tLoc.x + (hitSize - canvas.grid.size) + tLoc.x) * 0.5;
			tLoc.y = (tLoc.y + (hitSize - canvas.grid.size) + tLoc.y) * 0.5;
			console.log('Modified size');
		}

		return tLoc;
	}

	isUnconscious(actor) {
		const effects = actor.data.effects?._source;
		if (actor.data.data.attributes.hp.value < 1) return true;
		if (effects == null) return false;

		for (let index = 0; index < effects.length; index++) {
			const effect = effects[index];
			if (effect.label == 'Unconscious') return true;
		}

		return false;
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
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Flanking Hex
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FlankingHex {}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    FlankingRay
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FlankingRay {
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
	 * @returns {Array}
	 */
	normalized() {
		const { x: x1, y: y1, z: z1 } = this.origin;
		const { x: x2, y: y2, z: z2 } = this.target;

		const v = [x1 - x2, y1 - y2, z1 - z2];
		return [v[0] / this.distance, v[1] / this.distance, v[2] / this.distance];
	}

	/**
	 *
	 * @returns {Object}
	 */
	getFlankingPosition() {
		const { x: x1, y: y1, z: z1 } = this.target;

		let x = x1 - this.distance * this.normalized[0];
		let y = y1 - this.distance * this.normalized[1];
		let z = z1 - this.distance * this.normalized[2];

		return { x, y, z };
	}
}
