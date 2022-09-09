// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                             				Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

/**
 * @typedef {Object} CritHitSettings
 * @property {Boolean} hidden
 * @property {Number} threshold
 * @property {String} mainCritTable
 * @property {String} mainFumbleTable
 * @property {String} meleeCritTable
 * @property {String} meleeFumbleTable
 * @property {String} spellCritTable
 * @property {String} spellFumbleTable
 */

/**@type {CritHitSettings}*/
const SETTINGS = {};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            	Populate Settings
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function populateSettings() {
	// Get Tables
	const mainCritTable = game.settings.get(moduleName, 'mainCritTable');
	const mainFumbleTable = game.settings.get(moduleName, 'mainFumbleTable');
	const meleeCritTable = game.settings.get(moduleName, 'meleeCritTable');
	const meleeFumbleTable = game.settings.get(moduleName, 'meleeFumbleTable');
	const spellCritTable = game.settings.get(moduleName, 'spellCritTable');
	const spellFumbleTable = game.settings.get(moduleName, 'spellFumbleTable');

	// Populate Settings
	SETTINGS.hidden = game.settings.get(moduleName, 'critHitHidden');
	SETTINGS.threshold = game.settings.get(moduleName, 'critFumbleThreshold');
	SETTINGS.mainCritTable = mainCritTable === 'null' ? null : mainCritTable;
	SETTINGS.mainFumbleTable =
		mainFumbleTable === 'null' ? null : mainFumbleTable;
	SETTINGS.meleeCritTable = meleeCritTable === 'null' ? null : meleeCritTable;
	SETTINGS.meleeFumbleTable =
		meleeFumbleTable === 'null' ? null : meleeFumbleTable;
	SETTINGS.spellCritTable = spellCritTable === 'null' ? null : spellCritTable;
	SETTINGS.spellFumbleTable =
		spellFumbleTable === 'null' ? null : spellFumbleTable;
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                             Initilization Function
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 */
export const CritHitFumble = async function () {
	// Populate settings initially and then repopulate every time table changes.
	populateSettings();
	Hooks.on('ordnd5e.rollTableUpdate', (...args) => {
		populateSettings();
		console.info(`${moduleTag} | Updated Crit Hit & Fumble Settings`);
		return true;
	});

	// Register Attack Hook
	Hooks.on('dnd5e.rollAttack', (item, roll) => {
		_handleRoll(item, roll);
	});

	console.log(SETTINGS);
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 	Handle Roll
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 * @param {Object} item
 * @param {Object} result
 * @private
 */
async function _handleRoll(item, roll) {
	// Check if critical or fumble
	const { isCrit, isFumble } = _isCritOrFumble(roll);
	if (!isCrit && !isFumble) return;

	// Check if weapon or spell
	const type = item.type;

	// Roll threshold die
	const thresholdRoll = await new Roll('1d6').roll({ async: true });
	await thresholdRoll.toMessage();

	if (thresholdRoll.total < SETTINGS.threshold) return;

	if (type === 'weapon') return _rollWeapon(isCrit, isFumble);
	if (type === 'spell') return _rollSpell(isCrit, isFumble);
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 	Handle Roll
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 * @param {Object} roll
 * @returns {Object<Boolean>}
 * @private
 */
function _isCritOrFumble(roll) {
	// Get dice
	if (!roll.dice.length) return null;
	const d20 = roll.dice[0];

	// Ensure is d20
	const isD20 = d20.faces === 20 && d20.values.length === 1;
	if (!isD20) return null;

	// Get crit and fumble defaults
	const critDef = roll.options.critical || 20;
	const fumbleDef = roll.options.fumble || 1;

	// Check if d20 matches either
	const isCrit = d20.total >= critDef ? true : false;
	const isFumble = d20.total <= fumbleDef ? true : false;

	return { isCrit, isFumble };
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 		Melee Roll
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * @param {Boolean} isCrit
 * @param {Boolean} isFumble
 */
async function _rollWeapon(isCrit, isFumble) {
	// Set melee tables
	const critTable = SETTINGS.meleeCritTable
		? SETTINGS.meleeCritTable
		: SETTINGS.mainCritTable;

	const fumbleTable = SETTINGS.meleeFumbleTable
		? SETTINGS.meleeFumbleTable
		: SETTINGS.mainFumbleTable;

	console.log(critTable);
	// Get table
	let table = null;
	if (isCrit) table = game.tables.getName(critTable);
	else table = game.tables.getName(fumbleTable);

	if (!table) return;

	// Set Roll Mode
	const currentRollMode = game.settings.get('core', 'rollMode');

	table.draw({
		rollMode: SETTINGS.hidden ? CONST.DICE_ROLL_MODES.BLIND : currentRollMode,
	});
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 		Spell Roll
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 * @param {Boolean} isCrit
 * @param {Boolean} isFumble
 * @returns
 */
async function _rollSpell(isCrit, isFumble) {
	// Set melee tables
	const critTable = SETTINGS.spellCritTable
		? SETTINGS.spellCritTable
		: SETTINGS.mainCritTable;

	const fumbleTable = SETTINGS.spellFumbleTable
		? SETTINGS.spellFumbleTable
		: SETTINGS.mainFumbleTable;

	// Get table
	let table = null;
	if (isCrit) table = game.tables.getName(critTable);
	else table = game.tables.getName(fumbleTable);

	if (!table) return;

	// Set Roll Mode
	const currentRollMode = game.settings.get('core', 'rollMode');

	table.draw({
		rollMode: SETTINGS.hidden ? CONST.DICE_ROLL_MODES.BLIND : currentRollMode,
	});
}
