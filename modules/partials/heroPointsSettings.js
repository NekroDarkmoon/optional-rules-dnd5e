// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                      Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class HeroPointsSettings extends FormApplication {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Optional Rules DND5E - Hero Points Settings',
			id: 'ordnd5e-hero-points-settings',
			template: `modules/${moduleName}/templates/heroPointsSettings.hbs`,
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
				// Settings for Hero Points
				useHeroPoints: {
					name: 'Enable Hero Points Automation',
					hint: 'Enable Automation for tracking and rolling hero points based on the optional rules from the DMG.',
					id: 'useHeroPoints',
					value: game.settings.get(moduleName, 'useHeroPoints'),
					isCheckbox: true,
					client: game.user.isGM,
				},

				heroPointsDie: {
					name: 'Die Size for Hero Points',
					hint: 'Change the die size when rolling for hero points.',
					id: 'heroPointsDie',
					value: game.settings.get(moduleName, 'heroPointsDie'),
					isNumber: true,
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
//                                    Settings
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const registerHeroPointsSettings = async function (debounceReload) {
	// Settings for Hero Points
	await game.settings.register(moduleName, 'useHeroPoints', {
		name: 'Use Hero Points',
		scope: 'world',
		config: false,
		default: false,
		type: Boolean,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'heroPointsDie', {
		name: 'Die for Hero Points',
		scope: 'world',
		config: false,
		default: 6,
		type: Number,
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

	await game.settings.registerMenu(moduleName, 'HeroPointsSettingsMenu', {
		name: 'Hero Points Settings Menu',
		label: 'Configure',
		icon: 'fas fa-bars',
		type: HeroPointsSettings,
		restricted: true,
	});
};
