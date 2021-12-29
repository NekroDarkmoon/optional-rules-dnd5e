// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                             				Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                             Initilization Function
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 */
export const CritHitFumble = async function () {
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
