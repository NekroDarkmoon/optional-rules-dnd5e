// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';
import { registerCritHitFumbleSettings } from './partials/criticalHitFumbleSettings.js';
import { registerFlankingSettings } from './partials/flankingSettings.js';
import { registerHeroPointsSettings } from './partials/heroPointsSettings.js';

const debounceReload = debounce(() => window.location.reload(), 100);

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Settings
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const RegisterSettings = async function () {
	await registerCritHitFumbleSettings(debounceReload);
	await registerFlankingSettings(debounceReload);
	await registerHeroPointsSettings(debounceReload);

	// Utility Settings
	await game.settings.register(moduleName, 'outputDebug', {
		name: 'Enable Debug Log',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false,
		onChange: debounceReload,
	});
};
