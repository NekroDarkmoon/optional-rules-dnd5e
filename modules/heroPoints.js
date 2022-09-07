// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

const SETTINGS = {
	die: 6,
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            Exports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export async function setupHeroPoints() {
	// Populate Settings
	SETTINGS.die = game.settings.get(moduleName, 'heroPointsDie');

	// Get points data
	const existingHp = getHeroPoints();
	console.log(existingHp);

	// Set up as tertiary resource.
	await setupTertiaryResource(existingHp);

	Hooks.on('updateActor', onUse);
}

/**
 *
 * @returns {{String: Number}} existingPoints
 */
export function getHeroPoints() {
	const charIds = game.users.map(u => u.character?.id).filter(id => id);
	const actors = charIds.map(id => game.actors.get(id)).filter(a => a);

	// Early Return
	if (actors?.length === 0) return null;

	const existingHp = {};
	actors.forEach(
		a =>
			(existingHp[a.id] =
				a.getFlag(moduleName, 'heroPoints') ?? calcHeroPoints(a, true))
	);

	return existingHp;
}

export async function setHeroPoints(data) {
	for (const [id, points] of Object.entries(data)) {
		// Update flags
		const actor = game.actors.get(id) ?? null;
		if (!actor) continue;
		await actor.setFlag(moduleName, 'heroPoints', points);
	}

	// Update resources
	await setupTertiaryResource(data);
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                          Points Update
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function onUse(actor, changes, _, userId) {
	// Return if not current user
	if (game.user.id !== userId) return;

	const value = changes?.system?.resources?.tertiary?.value;

	if (!value) return;
	if (actor.system.resources.tertiary.label !== 'Hero Points') return;

	const prevPoints = actor.getFlag(moduleName, 'heroPoints');
	if (!prevPoints) return;

	if (value === prevPoints) return;
	else if (value > prevPoints) {
		// Send notification to GM
		await sendNotification(actor, { prevPoints, value });
		return await actor.setFlag(moduleName, 'heroPoints', value);
	} else {
		const count = prevPoints - value;
		console.debug('count', count);
		await rollHeroDie(actor, count);

		await actor.setFlag(moduleName, 'heroPoints', value);
		return console.info(`${moduleTag} | Updated info`);
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                        Display on Sheets
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function setupTertiaryResource(data) {
	for (const [id, points] of Object.entries(data)) {
		const actor = game.actors.get(id);
		const current = points;
		const max = calcHeroPoints(actor);

		const resource = {
			label: 'Hero Points',
			lr: false,
			max,
			sr: false,
			value: current,
		};

		await actor.update({ 'system.resources.tertiary': resource });
		console.info(`${moduleTag} | Updated Sheet ${actor.name}`);
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                            Helpers
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 * @param {*} actor
 * @param {Boolean} set
 * @returns {Promise<Number>}
 */
function calcHeroPoints(actor, set = false) {
	const { level } = actor.system.details;
	const points = 5 + Math.floor(level / 2);
	if (set) actor.setFlag(moduleName, 'heroPoints', points);
	return points;
}

async function rollHeroDie(actor, count) {
	await new Roll(`${count}d${SETTINGS.die}`).toMessage({
		speaker: { alias: actor.name },
		flavor: 'Hero Points',
	});
}

async function sendNotification(actor, { prevPoints, value }) {
	const message = `Hero Points for ${actor.name} increased from ${prevPoints} to ${value}.`;

	await ChatMessage.create({
		blind: true,
		speaker: { alias: 'Optional Rules Dnd5e' },
		content: message,
		whisper: ChatMessage.getWhisperRecipients('GM'),
	});
}
