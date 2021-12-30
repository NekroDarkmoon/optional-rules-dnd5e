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
	// Populate Settings
	SETTINGS.hidden = game.settings.get(moduleName, 'critHitHidden');
	SETTINGS.threshold = game.settings.get(moduleName, 'critFumbleThreshold');
	SETTINGS.mainCritTable = game.settings.get(moduleName, 'mainCritTable');
	SETTINGS.mainFumbleTable = game.settings.get(moduleName, 'mainFumbleTable');
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                             Initilization Function
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 */
export const CritHitFumble = async function () {
	// Populate settings initially and then repopulate everytime table changes.
	populateSettings();
	Hooks.on('ordnd5e.rollTableUpdate', (...args) => {
		populateSettings();
		console.info(`${moduleTag} | Updated Crit Hit & Fumble Settings`);
	});

	// Register Attack Hook
	Hooks.on('Item5e.rollAttack', (item, result, options, actor) => {
		_handleRoll(item, result);
	});
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
async function _handleRoll(item, result) {
	// Check if critical or fumble
	const { isCrit, isFumble } = _isCritOrFumble(result);
	console.log(isCrit, isFumble);
	if (!isCrit && !isFumble) return;

	// Check if weapon or spell
	console.log(item);
	const type = item.data.type;
	let tableRoll = null;

	// Roll threshold die
	const thresholdRoll = await new Roll('1d6').roll();
	await thresholdRoll.toMessage();

	if (thresholdRoll.total <= SETTINGS.threshold) return;

	if (type === 'weapon') return _rollWeapon(isCrit, isFumble);
	if (type === 'spell ') return _rollSpell(isCrit, isFumble);
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
	console.log(d20.total);
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

	// Get table
	let table = null;
	if (isCrit) table = game.tables.getName(critTable);
	else table = game.tables.getName(fumbleTable);

	await table.draw({
		rollMode: CONFIG.Dice.rollModes.blindroll,
	});
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 		Spell Roll
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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

	await table.draw({
		rollMode: CONFIG.Dice.rollModes.blindroll,
	});
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Crit Fumble Roll
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 * @param trigger
 * @returns {tableRoll}
 */
async function critFumbleRoll(trigger) {
	// Create roll
	const threshold = game.settings.get(moduleName, 'critFumbleThreshold');
	const roll = await new Roll('1d6').roll({ async: true });
	await roll.toMessage();

	// Roll v threshold
	if (roll.total < threshold) return;

	// Get table
	const tableType =
		trigger === 'Crit' ? 'critHitRolltable' : 'critFumbleRolltable';
	const tableName = game.settings.get(moduleName, tableType);
	const rollTable = game.tables.getName(tableName);
	const tableRoll = await rollTable.draw();

	return tableRoll;
}
