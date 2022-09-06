// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                      Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class CHFSettings extends FormApplication {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Optional Rules DND5E - Critical Hit & Fumble Settings',
			id: 'ordnd5e-critical-fumble-settings',
			template: `modules/${moduleName}/templates/critHitFumbleSettings.hbs`,
			width: '600	',
			height: 'auto',
			closeOnSubmit: true,
			resizable: true,
		});
	}

	getData(options = {}) {
		const data = {
			isGm: game.user.isGM,
			settings: {
				useCritHitFumble: {
					name: 'Enable Critical/Fumble Rules',
					hint: 'Use the critical hit and fumble rules found in the DMG.',
					id: 'useCritHitFumble',
					value: game.settings.get(moduleName, 'useCritHitFumble'),
					isCheckbox: true,
					client: game.user.isGM,
				},

				critHitThreshold: {
					name: 'Critical Fumble Threshold',
					hint: 'Change the triggering threshold for the rolltable roll. (Default is set to 1).',
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
			},
			tables: {},
		};

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
//                                    Helpers
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Settings
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const registerCritHitFumbleSettings = async function (debounceReload) {
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
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'mainCritTable', {
		name: 'Main Critical hit rolltable',
		scope: 'world',
		config: false,
		type: String,
		default: '',
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'mainFumbleTable', {
		name: 'Main Fumble rolltable',
		scope: 'world',
		config: false,
		type: String,
		default: '',
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'meleeCritTable', {
		name: 'Melee Critical hit rolltable',
		scope: 'world',
		config: false,
		type: String,
		default: '',
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'meleeFumbleTable', {
		name: 'Melee Critical fumble rolltable',
		scope: 'world',
		config: false,
		type: String,
		default: '',
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'spellCritTable', {
		name: 'Spell Critical hit rolltable',
		scope: 'world',
		config: false,
		type: String,
		default: '',
		onChange: tableExists,
	});

	await game.settings.register(moduleName, 'spellFumbleTable', {
		name: 'Spell Critical fumble rolltable',
		scope: 'world',
		config: false,
		type: String,
		default: '',
		onChange: tableExists,
	});

	await game.settings.registerMenu(moduleName, 'CritHitSettingsMenu', {
		name: 'Critical Hit & Fumble Settings Menu',
		label: 'Configure',
		icon: 'fas fa-bars',
		type: CHFSettings,
		restricted: true,
	});
};
