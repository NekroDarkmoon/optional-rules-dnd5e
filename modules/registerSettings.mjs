import { moduleName, moduleTag} from "./constants.js";

export const RegisterSettings = async function() {

    // Settings for critical hit and fumble tables
    await game.settings.register(moduleName, 'use-crit-hit-fumble', {
        name: "Use Critical hit and fumble rules",
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        onChange: debounceReload
    });

    await game.settings.register(moduleName, 'crit-fumble-threshold', {
        name: "Set Critical Fumble Threshold",
        hint: "Change the triggering threshold for the rolltable roll.",
        scope: 'world',
        config: true,
        type: Number,
        default: 5,
        onChange: verifycfThreshold
    });

    await game.settings.register(moduleName, 'crit-hit-rolltable', {
        name: "Critical hit rolltable",
        scope: 'world',
        config: true,
        type: String,
        onChange: tableExists
    });

    await game.settings.register(moduleName, 'crit-fumble-rolltable', {
        name: "Critical fumble rolltable",
        scope: 'world',
        config: true,
        type: String,
        onChange: tableExists
    });
    
    // Settings for Flanking
    await game.settings.register(moduleName, 'use-flanking', {
        name: "Use Flanking",
        scope: 'world',
        config: true,
        type: Boolean,
        onChange: debounceReload
    });

    await game.settings.register(moduleName, 'use-flanking-mod', {
        name: "Use Modifiers instead of Adv/Dis for flanking",
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        onChange: debounceReload
    });

    await game.settings.register(moduleName, 'flanking-mod', {
        name: "Modifier to use when flanking",
        scope: 'world',
        config: true,
        type: Number,
        default: 0,
        onChange: debounceReload
    });

    // Settings for Hero Points
    await game.settings.register(moduleName, 'use-hero-points', {
        name: "Use Hero Points",
        scope: 'world',
        config: true,
        type: Boolean,
        onChange: debounceReload
    });

    await game.settings.register(moduleName, 'hero-points-data', {
        name: "Hero Points Data",
        scope: 'world',
        config: false,
        type: Object,
        default: null
    });

    await game.settings.register(moduleName, 'hero-points-lastSet', {
        name: "Hero Points Last Set",
        scope: 'world',
        config: false,
        type: Object,
        default: null
    });

    
    // Settings for proficiency die 
    await game.settings.register(moduleName, 'use-prof-die', {
        name: "Use Proficiency die rules",
        scope: 'world',
        config: true,
        type: Boolean,
        onChange: debounceReload
    });
};

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
        ui.notifications.error(`${moduleTag} | RollTable named ${tableName} not found.`)
    }
};

const debounceReload = debounce(() => window.location.reload(), 100);

function verifycfThreshold(threshold) {

    if (threshold > 6 || threshold < 1) {
        console.error(`${moduleTag} | Incorrect Value set for crti-fumble threshold.`);
        ui.notifications.error(`${moduleTag} | Crit-Fumble value should be greater than 0 and less than 7`);
    }
}