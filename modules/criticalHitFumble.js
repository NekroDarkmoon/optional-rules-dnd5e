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
	SETTINGS.threshold = game.settings.get(moduleName, 'critFumbleThreshhold');
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
	Hooks.on('ordnd5e-rollTableUpdate', (...args) => {
		populateSettings();
		console.info(`${moduleTag} | Updated Crit Hit & Fumble Settings`);
	});

	// Register Crit Hooks
	// Register Fumble Hooks

	Hooks.on('midi-qol.AttackRollComplete', async midiData => {
		//  Check if critcal
		if (midiData.isCritical) {
			console.log('Critical Hit!');
			await critFumbleRoll('Crit');
		}
		// Check if fumble
		if (midiData.isFumble) {
			console.log('Critical Faliure!');
			await critFumbleRoll('Fumble');
		}
	});
};

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
