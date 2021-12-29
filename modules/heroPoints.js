// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

/**
 * Hero Points
 * @returns
 */
export const heroPoints = async function () {
	// Fetch Actors
	let chars = game.actors?._source.filter(u => u.type == 'character');
	if (chars == undefined || chars == null) {
		return;
	}

	// Hero points redundacy storage
	let existingHp = game.settings.get(moduleName, 'heroPointsData');
	let lastLevel = game.settings.get(moduleName, 'heroPointsLastSet');

	var HeroPoints;
	var updatedAt;

	if (Object.keys(existingHp).length === 0) {
		HeroPoints = {};
	} else {
		HeroPoints = existingHp;
	}

	if (Object.keys(lastLevel).length === 0) {
		updatedAt = {};
	} else {
		updatedAt = lastLevel;
	}

	// Check every Actor for hp
	for (let index = 0; index < chars.length; index++) {
		// Get Char data
		const currActor = game.actors.get(chars[index]._id);
		const prevLevel = updatedAt[currActor.data.name];
		const currLevel = currActor.data.data.details.level;

		// Set flag if not extsts
		let flag = getHpFlag(currActor);
		if (
			flag == undefined ||
			flag == null ||
			Object.keys(existingHp).length === 0 ||
			prevLevel != currLevel
		) {
			// Check if char exists in settings
			var hp;
			try {
				hp = HeroPoints[currActor.data.name];
			} catch (e) {
				console.error(`${moduleTag} | ${e}`);
				hp = null;
			}

			if (
				hp == null ||
				hp == undefined ||
				prevLevel == undefined ||
				prevLevel != currLevel
			) {
				console.log(
					`${moduleTag} | Updating Hero Points for ${currActor.data.name}`
				);
				hp = calcHeroPoints(currActor);
				updatedAt[currActor.data.name] = currLevel;
			}

			await setHpFlag(currActor, hp);
			HeroPoints[currActor.data.name] = hp;
		}
	}

	// Sync back to settings
	game.settings.set(moduleName, 'heroPointsData', HeroPoints);
	game.settings.set(moduleName, 'heroPointsLastSet', updatedAt);

	console.log(`${moduleTag} | HeroPoints initialized.`);
	console.info(HeroPoints);
	console.info(updatedAt);

	// Set up display of data
	for (let index = 0; index < chars.length; index++) {
		await displayOnSheet(chars[index]);
	}

	// Set up functions for triggers
	Hooks.on('updateActor', async (...args) => {
		var newHP;

		// Check if it's the correct update
		try {
			newHP = args[1].data.resources?.tertiary?.value;
		} catch (error) {
			return;
		}

		if (newHP == undefined || newHP == null) {
			return;
		}

		let stored = game.settings.get(moduleName, 'heroPointsData');

		let actor = game.actors.get(args[1]._id);
		let oldHP = stored[actor.data.name];

		if (oldHP == null || oldHP == undefined) {
			return;
		}
		if (newHP >= oldHP) {
			await setHpFlag(actor, newHP);
			stored[actor.data.name] = newHP;
			console.info(`${moduleTag} | Updated info`);
			console.info(stored);
		} else {
			// Roll for how many points were used
			let count = oldHP - newHP;
			await rollHeroPoint(count, actor);

			await setHpFlag(actor, newHP);
			stored[actor.data.name] = newHP;
			console.info(`${moduleTag} | Updated info`);
			console.info(stored);
		}
	});
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * Calculate Hero Points
 * @param actor
 * @returns
 */
function calcHeroPoints(actor) {
	// Get class level
	let level = actor.data.data.details.level;
	return 5 + Math.floor(level / 2);
}

/**
 * Set HP Flag
 * @param actor
 * @param hp
 */
async function setHpFlag(actor, hp) {
	try {
		await actor.setFlag(moduleName, 'heroPoints', hp);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Get HP flag
 * @param actor
 * @returns
 */
function getHpFlag(actor) {
	try {
		return actor.getFlag(moduleName, 'heroPoints');
	} catch (e) {
		console.error(e);
	}
}

/**
 * Display to Sheet on Ready
 * @param char
 */
async function displayOnSheet(char) {
	// Get Char data
	const currActor = game.actors.get(char._id);

	// Set Tertiary value
	const currHp = getHpFlag(currActor);
	const totalHp = calcHeroPoints(currActor);

	const newValue = {
		label: 'Hero Points',
		lr: false,
		max: totalHp,
		sr: false,
		value: currHp,
	};

	await currActor.update({ 'data.resources.tertiary': newValue });
	console.info(`${moduleTag} | Updated Sheet ${currActor.data.name}`);
}

/**
 * Roll for Hero Points
 * @param count
 * @param actor
 */
async function rollHeroPoint(count, actor) {
	let roll = await new Roll(`${count}d6`).evaluate();
	await roll.toMessage({
		speaker: { alias: actor.data.name },
		flavor: 'Hero Points',
	});
}
