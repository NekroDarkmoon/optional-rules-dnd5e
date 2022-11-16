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
	await RegisterSettings();
	console.info(`${moduleName} | Registered Settings`);
	loadTemplates({
		insertSettings: `modules/${moduleName}/templates/partials/insertSetting.hbs`,
	});
});

Hooks.once('setup', async function () {
	// Enable Critical Hit Fumble Rules
	if (game.settings.get(moduleName, 'useCritHitFumble')) {
		const { CritHitFumble } = await import('./modules/criticalHitFumble.js');
		CritHitFumble();
		console.info(`${moduleTag} | Loaded Critical Hit & Fumble System.`);
	}

	// Enable Flanking
	if (game.settings.get(moduleName, 'useFlanking')) {
		const { setupFlanking } = await import('./modules/flanking.js');
		// Get cross module Compatibility
		let settings = {
			midi: game.modules.get('midi-qol')?.active ? true : false,
			adv: (await game.settings.get(moduleName, 'useFlankingMod'))
				? false
				: true,
			mod: await game.settings.get(moduleName, 'flankingMod'),
			size: await game.settings.get(moduleName, 'internalCreatureSize'),
			disableCard: await game.settings.get(moduleName, 'flankingDisableCard'),
		};
		console.log(settings);

		await setupFlanking(settings);
		console.info(`${moduleTag} | Loaded Flanking System.`);
	}

	console.log(`${moduleTag} | Setting Up`);
});

Hooks.once('ready', async function () {
	// Enable Hero Points
	const { setupHeroPoints } = await import('./modules/heroPoints.js');
	if (game.settings.get(moduleName, 'useHeroPoints')) {
		setupHeroPoints();
		console.info(`${moduleTag} | Loaded Hero Points System.`);
	}

	console.log(`${moduleTag} | Ready.`);
});
