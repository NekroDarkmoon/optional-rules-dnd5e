// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './modules/constants.js';
import { RegisterSettings } from './modules/settings.js';
import { libWrapper } from './modules/lib/shim.js'; // Make libwrapper available

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Setting Up
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Hooks.once('init', async function () {
	console.log(`${moduleTag} | Initializing `);
	RegisterSettings();
	console.info(`${moduleName} | Registered Settings`);
	loadTemplates([`modules/${moduleName}/templates/settings.hbs`]);
});

Hooks.once('setup', async function () {
	// Enable Critical Hit Fumble Rules
	if (game.settings.get(moduleName, 'useCritHitFumble')) {
		const { CritHitFumble } = await import('./modules/criticalHitFumble.js');
		// Perform Hook avail Check
		if (!game.modules.get('more-hooks-5e')?.active) {
			const msg =
				'Critical Hit and Fumble not active - Requires "More Hooks 5e" module.';
			ui.notifications.warn(msg);

			console.warn(`${moduleTag} | ${msg}`);
		} else {
			CritHitFumble();
			console.info(`${moduleTag} | Loaded Critcal Hit & Fumble System.`);
		}
	}

	// Enable Flanking
	if (game.settings.get(moduleName, 'useFlanking')) {
		const { flanking } = await import('./modules/flanking.js');
		// Get cross module Compatibility
		let settings = {
			midi: game.modules.get('midi-qol')?.active ? true : false,
			adv: (await game.settings.get(moduleName, 'useFlankingMod'))
				? false
				: true,
			mod: await game.settings.get(moduleName, 'flankingMod'),
			size: await game.settings.get(moduleName, 'internalCreatureSize'),
		};
		console.log(settings);

		await flanking(settings);
		console.info(`${moduleTag} | Loaded Flanking System.`);
	}

	console.log(`${moduleTag} | Setting Up`);
});

Hooks.once('ready', async function () {
	// Enable Hero Points
	const { heroPoints } = await import('./modules/heroPoints.js');
	if (game.settings.get(moduleName, 'useHeroPoints')) {
		heroPoints();
		console.info(`${moduleTag} | Loaded Hero Points System.`);
	}

	console.log(`${moduleTag} | Ready.`);
});
