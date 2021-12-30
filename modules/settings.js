// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                      Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class ORDnD5e extends FormApplication {
	/**
	 *
	 */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Optional Rules 5e Settings',
			id: 'ordnd5e-settings',
			template: `modules/${moduleName}/templates/settings.hbs`,
			width: '600	',
			height: 'auto',
			closeOnSubmit: true,
			resizeable: true,
			tabs: [
				{
					navSelector: '.tabs',
					contentSelector: '#config-tabs',
					inital: 'critHitFumble',
				},
			],
		});
	}

	/**
	 *
	 * @param {*} options
	 */
	getData(options = {}) {
		const data = {
			settings: {
				// Settings for Critical Hit and Fumble Rules
				critHitFumble: {
					useCritHitFumble: {
						name: 'Critical Hit and Fumble Rules',
						hint: 'Use the critical hit and fumble rules found in the DMG.',
						id: 'useCritHitFumble',
						value: game.settings.get(moduleName, 'useCritHitFumble'),
						isCheckbox: true,
						client: game.user.isGM,
					},

					critHitThreshold: {
						name: 'Critical Fumble Threshold',
						hint: 'Change the triggering threshold for the rolltable roll. (Default is set to 5).',
						id: 'critFumbleThreshold',
						value: game.settings.get(moduleName, 'critFumbleThreshold'),
						isRange: true,
						range: { min: 1, max: 6 },
						client: game.user.isGM,
					},

					critHitHidden: {
						name: 'Hide Critical Hit/Fumble Card',
						hint: 'Choose whether to hide critical hit/fumble card',
						id: 'critHitHidden',
						value: game.settings.get(moduleName, 'critHitHidden'),
						isCheckbox: true,
						client: game.user.isGM,
					},

					mainCritTable: {
						name: 'Main Critical Hit Rolltable',
						hint: 'Main Rolltable for Critical Hits.',
						id: 'mainCritTable',
						value: game.settings.get(moduleName, 'mainCritTable'),
						client: game.user.isGM,
						isTable: true,
						choices: game.tables._source,
					},

					mainFumbleTable: {
						name: 'Main Critical Fumble Rolltable',
						hint: 'Main Rolltable for Critical Fumbles',
						id: 'mainFumbleTable',
						value: game.settings.get(moduleName, 'mainFumbleTable'),
						client: game.user.isGM,
						isTable: true,
						choices: game.tables._source,
					},

					meleeCritTable: {
						name: 'Melee Critical Hit Rolltable',
						hint: 'Rolltable for Melee Critical Hits. [Overrides main table if set]',
						id: 'meleeCritTable',
						value: game.settings.get(moduleName, 'meleeCritTable'),
						client: game.user.isGM,
						isTable: true,
						choices: game.tables._source,
					},

					meleeFumbleTable: {
						name: 'Melee Critical Fumble Rolltable',
						hint: 'Rolltable for Melee Critical Fumbles. [Overrides main table if set]',
						id: 'meleeFumbleTable',
						value: game.settings.get(moduleName, 'meleeFumbleTable'),
						client: game.user.isGM,
						isTable: true,
						choices: game.tables._source,
					},

					spellCritTable: {
						name: 'Spell Critical Hit Rolltable',
						hint: 'Rolltable for Spell Critical Hits. [Overrides main table if set]',
						id: 'spellCritTable',
						value: game.settings.get(moduleName, 'spellCritTable'),
						client: game.user.isGM,
						isTable: true,
						choices: game.tables._source,
					},

					spellFumbleTable: {
						name: 'Spell Critical Fumble Rolltable',
						hint: 'Rolltable for Spell Critical Fumbles. [Overrides main table if set]',
						id: 'spellFumbleTable',
						value: game.settings.get(moduleName, 'spellFumbleTable'),
						client: game.user.isGM,
						isTable: true,
						choices: game.tables._source,
					},
				},

				// Settings for Flanking
				flanking: {
					useFlanking: {
						name: 'Enable Flanking Automation',
						hint: 'Enable Automation for the optional flanking rules found in the DMG.',
						id: 'useFlanking',
						value: game.settings.get(moduleName, 'useFlanking'),
						isCheckbox: true,
						client: game.user.isGM,
					},

					flankSizeDiff: {
						name: 'Flank across creature sizes',
						hint: '[Experimental] Allow flanking when the attacker and the ally are of different sizes.',
						id: 'flankSizeDiff',
						value: game.settings.get(moduleName, 'flankSizeDiff'),
						isCheckbox: true,
						client: game.user.isGM,
					},

					useFlankingMod: {
						name: 'Variant Rule - Use Modifiers',
						hint: 'Use modifiers instead of giving advantage when flanking.',
						id: 'useFlankingMod',
						value: game.settings.get(moduleName, 'useFlankingMod'),
						isCheckbox: true,
						client: game.user.isGM,
					},

					flankingMod: {
						name: 'Flanking Modifier',
						hint: 'Modifier to use when using the Variant Rule - Use Modifiers. Default is set to 2',
						id: 'flankingMod',
						value: game.settings.get(moduleName, 'flankingMod'),
						isNumber: true,
						client: game.user.isGM,
					},

					creatureSize: {
						name: 'Flank Based on creature size',
						hint: 'Restrict flanking target to a creature of size x and below.',
						id: 'creatureSize',
						value: game.settings.get(moduleName, 'creatureSize'),
						isChoice: true,
						choices: [
							'None',
							'Tiny',
							'Small',
							'Medium',
							'Large',
							'Huge',
							'Gargantuan',
						],
						client: game.user.isGM,
					},
				},

				// Settings for Hero Points
				heroPoints: {
					useHeroPoints: {
						name: 'Enable Hero Points Automation',
						hint: 'Enable Automation for tracking and rolling hero points based on the optional rules from the DMG.',
						id: 'useHeroPoints',
						value: game.settings.get(moduleName, 'useHeroPoints'),
						isCheckbox: true,
						client: game.user.isGM,
					},
				},
			},
		};

		data.isGM = game.user.isGM;
		return data;
	}

	/**
	 *
	 * @param {*} html
	 */
	activateListeners(html) {
		super.activateListeners(html);
	}

	/**
	 *
	 * @param {*} event
	 * @param {*} formData
	 */
	async _updateObject(event, formData) {
		console.log(formData);
		for (let [key, value] of Object.entries(formData)) {
			await game.settings.set(moduleName, key, value);
		}

		this.render();
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Helper Functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 * @param tableName
 */
const tableExists = function (tableName) {
	Hooks.call('ordnd5e.rollTableUpdate', []);
	if (!tableName || tableName === '' || tableName === 'null') return;
	let rollTable = game.tables.getName(tableName);
	if (rollTable === undefined) {
		ui.notifications.error(
			`${moduleTag} | RollTable named ${tableName} not found.`
		);
		return;
	}
};

const flankCreatureMap = async function (choice) {
	var size = 0;
	switch (choice) {
		case 'None':
			size = 4;
			break;
		case 'Tiny':
			size = 1;
			break;
		case 'Small':
			size = 1;
			break;
		case 'Medium':
			size = 1;
			break;
		case 'Large':
			size = 2;
			break;
		case 'Huge':
			size = 3;
			break;
		case 'Gargantuan':
			size = 4;
			break;
	}

	await game.settings.set(moduleName, 'internalCreatureSize', size);
	return;
};

/**
 *
 */
const debounceReload = debounce(() => window.location.reload(), 100);

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Settings
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const RegisterSettings = async function () {
	// Settings for critical hit and fumble tables
	await game.settings.register(moduleName, 'useCritHitFumble', {
		name: 'Use Critical hit and fumble rules',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'critFumbleThreshold', {
		name: 'Set Critical Fumble Threshold',
		hint: 'Change the triggering threshold for the rolltable roll.',
		scope: 'world',
		config: false,
		type: Number,
		default: 1,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'critHitHidden', {
		name: 'Hide Critical Hit/Fumble Card',
		hint: 'Choose whether to hide critical hit/fumble card',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
	});

	await game.settings.register(moduleName, 'mainCritTable', {
		name: 'Main Critical hit rolltable',
		scope: 'world',
		config: false,
		type: String,
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'mainFumbleTable', {
		name: 'Main Fumble rolltable',
		scope: 'world',
		config: false,
		type: String,
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'meleeCritTable', {
		name: 'Melee Critical hit rolltable',
		scope: 'world',
		config: false,
		type: String,
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'meleeFumbleTable', {
		name: 'Melee Critical fumble rolltable',
		scope: 'world',
		config: false,
		type: String,
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'spellCritTable', {
		name: 'Spell Critical hit rolltable',
		scope: 'world',
		config: false,
		type: String,
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'spellFumbleTable', {
		name: 'Spell Critical fumble rolltable',
		scope: 'world',
		config: false,
		type: String,
		onChange: tableExists,
	});

	// Settings for Flanking
	await game.settings.register(moduleName, 'useFlanking', {
		name: 'Use Flanking',
		scope: 'world',
		config: false,
		type: Boolean,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'useFlankingMod', {
		name: 'Use Modifiers instead of Adv/Dis for flanking',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'flankingMod', {
		name: 'Modifier to use when flanking',
		scope: 'world',
		config: false,
		type: Number,
		default: 2,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'creatureSize', {
		name: 'Flank based on creature Size',
		scope: 'world',
		config: false,
		type: String,
		onChange: flankCreatureMap,
	});

	await game.settings.register(moduleName, 'internalCreatureSize', {
		name: 'Internal Creature Size',
		scope: 'world',
		config: false,
		type: Number,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'flankSizeDiff', {
		name: '[Experimental] Enable flanking across creature sizes',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
	});

	// Settings for Hero Points
	await game.settings.register(moduleName, 'useHeroPoints', {
		name: 'Use Hero Points',
		scope: 'world',
		config: false,
		type: Boolean,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'heroPointsData', {
		name: 'Hero Points Data',
		scope: 'world',
		config: false,
		type: Object,
		default: null,
	});

	await game.settings.register(moduleName, 'heroPointsLastSet', {
		name: 'Hero Points Last Set',
		scope: 'world',
		config: false,
		type: Object,
		default: null,
	});

	// Register Custom Setitng Sheet
	game.settings.registerMenu(moduleName, 'SettingsMenu', {
		name: 'Settings Menu',
		label: 'Configure Settings',
		icon: 'fas fa-bars',
		type: ORDnD5e,
		restricted: true,
	});
};
