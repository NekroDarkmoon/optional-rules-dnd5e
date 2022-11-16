// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                      Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FlankingSettings extends FormApplication {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Optional Rules DND5E - Flanking Settings',
			id: 'ordnd5e-flanking-settings',
			template: `modules/${moduleName}/templates/flankingSettings.hbs`,
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
					hint: 'Allow flanking when the attacker and the ally are of different sizes.',
					id: 'flankSizeDiff',
					value: game.settings.get(moduleName, 'flankSizeDiff'),
					isCheckbox: true,
					client: game.user.isGM,
				},

				flankNeutrals: {
					name: 'Enable Flanking for neutral tokens',
					hint: 'Allows flanker to be either neutral token or an ally.',
					id: 'flankNeutrals',
					value: game.settings.get(moduleName, 'flankNeutrals'),
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
					name: 'Restrict Flanking based on creature size',
					hint: 'Targets of the selected size and greater cannot be flanked.',
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

				flankingDisableCard: {
					name: 'Disable Chat Card',
					hint: 'Disables the card sent when flanking is confirmed.',
					id: 'flankingDisableCard',
					value: game.settings.get(moduleName, 'flankingDisableCard'),
					isCheckbox: true,
					client: game.user.isGM,
				},
			},
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
//                                 Helper Functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Settings
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const registerFlankingSettings = async function (debounceReload) {
	await game.settings.register(moduleName, 'useFlanking', {
		name: 'Use Flanking',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
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
		name: 'Restrict Flanking based on creature size',
		scope: 'world',
		config: false,
		type: String,
		default: '',
		onChange: flankCreatureMap,
	});

	await game.settings.register(moduleName, 'internalCreatureSize', {
		name: 'Internal Creature Size',
		scope: 'world',
		config: false,
		type: Number,
		default: 1,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'flankSizeDiff', {
		name: 'Enable flanking across creature sizes',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'flankNeutrals', {
		name: 'Enable flanking for neutrals',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'flankingDisableCard', {
		name: 'Disable Chat Card',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
		onChange: debounceReload,
	});

	await game.settings.registerMenu(moduleName, 'FlankingSettingsMenu', {
		name: 'Flanking Settings Menu',
		label: 'Configure',
		icon: 'fas fa-bars',
		type: FlankingSettings,
		restricted: true,
	});
};
