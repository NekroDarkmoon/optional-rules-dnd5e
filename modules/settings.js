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
			template: `modules/${moduleName}/templates/settings.html`,
			width: '550',
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
						id: 'use-crit-hit-fumble',
						value: game.settings.get(moduleName, 'use-crit-hit-fumble'),
						isCheckbox: true,
						client: game.user.isGM,
					},

					critHitThreshold: {
						name: 'Critical Fumble Threshold',
						hint: 'Change the triggering threshold for the rolltable roll. (Default is set to 5).',
						id: 'crit-fumble-threshold',
						value: game.settings.get(moduleName, 'crit-fumble-threshold'),
						isRange: true,
						range: { min: 1, max: 6 },
						client: game.user.isGM,
					},

					critHitHidden: {
						name: 'Hide Critical Hit/Fumble Card',
						hint: 'Choose whether to hide critical hit/fumble card',
						id: 'crit-hit-hidden',
						value: game.settings.get(moduleName, 'crit-hit-hidden'),
						isCheckbox: true,
						client: game.user.isGM,
					},

					critHitRolltable: {
						name: 'Critical Hit Rolltable',
						hint: 'Rolltable for Critical Hit',
						id: 'crit-hit-rolltable',
						value: game.settings.get(moduleName, 'crit-hit-rolltable'),
						client: game.user.isGM,
					},

					critFumbleRolltable: {
						name: 'Critical Fumble Rolltable',
						hint: 'Rolltable for Critical Fumble',
						id: 'crit-fumble-rolltable',
						value: game.settings.get(moduleName, 'crit-fumble-rolltable'),
						client: game.user.isGM,
					},
				},

				// Settings for Flanking
				flanking: {
					useFlanking: {
						name: 'Enable Flanking Automation',
						hint: 'Enable Automation for the optional flanking rules found in the DMG.',
						id: 'use-flanking',
						value: game.settings.get(moduleName, 'use-flanking'),
						isCheckbox: true,
						client: game.user.isGM,
					},

					useFlankingMod: {
						name: 'Variant Rule- Use Modifiers',
						hint: 'Use modifiers instead of giving advantage when flanking.',
						id: 'use-flanking-mod',
						value: game.settings.get(moduleName, 'use-flanking-mod'),
						isCheckbox: true,
						client: game.user.isGM,
					},

					flankingMod: {
						name: 'Flanking Modifier',
						hint: 'Modifier to use when using the Variant Rule - Use Modifiers. Default is set to 2',
						id: 'flanking-mod',
						value: game.settings.get(moduleName, 'flanking-mod'),
						isNumber: true,
						client: game.user.isGM,
					},

					creatureSize: {
						name: 'Flank Based on creature size',
						hint: 'Restrict flanking to a creature size and below.',
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
						id: 'use-hero-points',
						value: game.settings.get(moduleName, 'use-hero-points'),
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
	let rollTable = game.tables.getName(tableName);
	if (rollTable == undefined) {
		ui.notifications.error(
			`${moduleTag} | RollTable named ${tableName} not found.`
		);
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
	await game.settings.register(moduleName, 'use-crit-hit-fumble', {
		name: 'Use Critical hit and fumble rules',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'crit-fumble-threshold', {
		name: 'Set Critical Fumble Threshold',
		hint: 'Change the triggering threshold for the rolltable roll.',
		scope: 'world',
		config: false,
		type: Number,
		default: 5,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'crit-hit-hidden', {
		name: 'Hide Critical Hit/Fumble Card',
		hint: 'Choose whether to hide critical hit/fumble card',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
	});

	await game.settings.register(moduleName, 'crit-hit-rolltable', {
		name: 'Critical hit rolltable',
		scope: 'world',
		config: false,
		type: String,
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'crit-fumble-rolltable', {
		name: 'Critical fumble rolltable',
		scope: 'world',
		config: false,
		type: String,
		onChange: tableExists,
	});

	// Settings for Flanking
	await game.settings.register(moduleName, 'use-flanking', {
		name: 'Use Flanking',
		scope: 'world',
		config: false,
		type: Boolean,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'use-flanking-mod', {
		name: 'Use Modifiers instead of Adv/Dis for flanking',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'flanking-mod', {
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

	await game.settings.register(moduleName, 'variant', {
		name: 'Variant Flanking Rules',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
		onChange: debounceReload,
	});

	// Settings for Hero Points
	await game.settings.register(moduleName, 'use-hero-points', {
		name: 'Use Hero Points',
		scope: 'world',
		config: false,
		type: Boolean,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'hero-points-data', {
		name: 'Hero Points Data',
		scope: 'world',
		config: false,
		type: Object,
		default: null,
	});

	await game.settings.register(moduleName, 'hero-points-lastSet', {
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
