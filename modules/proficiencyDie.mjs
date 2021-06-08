// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag} from "./constants.js";
import { libWrapper } from "./lib/shim.js";
import { d20Roll } from "../../../../systems/dnd5e/module/dice.js";

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Wrapped Functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 * Patch for getRollData
 * @param wrapped 
 * @returns 
 */
function getRollData(wrapped) {
    const original = wrapped();
    const data = original;
    let level = data?.details?.level;

    if (level == null || level == undefined) {
        return data;
    }

    // Get maxdie for prof
    let maxDie = Math.floor((level + 7) / 4) * 2;

    let profDie = `1d${maxDie}`;
    data.prof = profDie; 
    return data;
}

/**
 * Patch for getRollData - DAE Version
 * @param wrapped 
 * @returns 
 */
function getRollDataDAE(wrapped) {
    const original = wrapped();
    const data = original;
    let level = data?.details?.level;

    if (level == null || level == undefined) {
        return data;
    }

    // Get maxdie for prof  
    let maxDie = Math.floor((level + 7) / 4) * 2;

    let profDie = `1d${maxDie}`;
    data.prof = profDie;
    return data;
}

/**
 * Patch for roll Ability Save
 * @param wrapper 
 * @param args 
 * @returns 
 */
function rollAbilitySave(wrapper, ...args) {
  const [ abilityId, options={event: {}, parts: []} ] = args;
  const label = CONFIG.DND5E.abilities[abilityId];

  const abl = this.data.data.abilities[abilityId];
  const level = this.data?.data?.details?.level;
    
  const parts = ["@mod"];
  const data = {mod: abl.mod};

  // Change Proficiency for roll here if avaialble.
  if (abl.prof > 0) {
    let maxDie = Math.floor((level + 7) / 4) * 2;
    let profDie = `1d${maxDie}`;
    parts.push("@prof");
    data.prof = profDie;
  }

  // Include a global actor ability save bonus
  const bonuses = getProperty(this.data.data, "bonuses.abilities") || {};
  if ( bonuses.save ) {
    parts.push("@saveBonus");
    data.saveBonus = bonuses.save;
  }

  // Add provided extra roll parts now because they will get clobbered by mergeObject below
  if (options.parts?.length > 0) {
    parts.push(...options.parts);
  }

  // Roll and return
  const rollData = foundry.utils.mergeObject(options, {
    parts: parts,
    data: data,
    title: game.i18n.format("DND5E.SavePromptTitle", {ability: label}),
    halflingLucky: this.getFlag("dnd5e", "halflingLucky"),
    messageData: {
      speaker: options.speaker || ChatMessage.getSpeaker({actor: this}),
      "flags.dnd5e.roll": {type: "save", abilityId }
    }
  });

  // return wrapper(...args);
  return d20Roll(rollData);
}

/**
 * Patch for roll Ability Save - DAE version
 * @param wrapper 
 * @param args 
 * @returns 
 */
function rollAbilitySaveDAE(wrapper, ...args) {
  const [ abilityId, options={event: {}, parts: []} ] = args;
  const label = CONFIG.DND5E.abilities[abilityId];

  const abl = this.data.data.abilities[abilityId];
  const level = this.data?.data?.details?.level;
    
  const parts = ["@mod", "@saveNeg"];
  const data = {mod: abl.mod, saveNeg: -(abl.save)};

  // Change Proficiency for roll here if avaialble.
  if (abl.prof > 0) {
    let maxDie = Math.floor((level + 7) / 4) * 2;
    let profDie = `1d${maxDie}`;
    parts.push("@prof");
    data.prof = profDie;
  }

  // Include a global actor ability save bonus
  const bonuses = getProperty(this.data.data, "bonuses.abilities") || {};
  if ( bonuses.save ) {
    parts.push("@saveBonus");
    data.saveBonus = bonuses.save;
  }

  // Add provided extra roll parts now because they will get clobbered by mergeObject below
  if (options.parts?.length > 0) {
    parts.push(...options.parts);
  }

  // Roll and return
  const rollData = foundry.utils.mergeObject(options, {
    parts: parts,
    data: data,
    title: game.i18n.format("DND5E.SavePromptTitle", {ability: label}),
    halflingLucky: this.getFlag("dnd5e", "halflingLucky"),
    messageData: {
      speaker: options.speaker || ChatMessage.getSpeaker({actor: this}),
      "flags.dnd5e.roll": {type: "save", abilityId }
    }
  });

  return wrapper(...args);
  // return d20Roll(rollData);
}


/**
 * Patch for rollSkill
 * @param wrapper 
 * @param args 
 * @returns 
 */

function rollSkill(wrapper, ...args) {
  const [ skillId, options = {event: {}, parts: []} ] = args;
  const skl = this.data.data.skills[skillId];
  const bonuses = getProperty(this.data.data, "bonuses.abilities") || {};
  
  // Compose roll parts and data
  const level = this?.data?.data?.details?.level;
  const charProf = Math.floor((level + 7) / 4);
  var profDie = "";
  let maxDie = Math.floor((level + 7) / 4) * 2;

  if (skl.prof === 2*charProf) {
    profDie = `2d${maxDie}`;
  } else if (skl.prof === charProf){
    profDie = `1d${maxDie}`;
  } else {
    profDie = skl.prof;
  }

  const parts = ["@profDie", "@mod"];
  const data = {profDie: profDie, mod: skl.mod };

  if (bonuses.check) {
    data["checkBonus"] = bonuses.check;
    parts.push("@checkBonus");
  }

  // Add provided extra roll parts now because they will get clobbered by mergeObject below
  if (options.parts?.length > 0) {
    parts.push(...options.parts);
  }

  // Reliable Talent applies to any skill check we have full or better proficiency in
  const reliableTalent = (skl.value >= 1 && this.getFlag("dnd5e", "reliableTalent"));

  // Roll and return
  const rollData = foundry.utils.mergeObject(options, {
    parts: parts,
    data: data,
    title: game.i18n.format("DND5E.SkillPromptTitle", {skill: CONFIG.DND5E.skills[skillId]}),
    halflingLucky: this.getFlag("dnd5e", "halflingLucky"),
    reliableTalent: reliableTalent,
    messageData: {
      speaker: options.speaker || ChatMessage.getSpeaker({actor: this}),
      "flags.dnd5e.roll": {type: "skill", skillId }
    }
  });

  return d20Roll(rollData);
}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Patches
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export let diePatching = () => {
    libWrapper.register(moduleName, "CONFIG.Item.documentClass.prototype.getRollData", getRollData, "OVERRIDE", {chain: true});
    libWrapper.register(moduleName, "CONFIG.Actor.documentClass.prototype.rollAbilitySave", rollAbilitySave, "OVERRIDE", {chain: true});
    libWrapper.register(moduleName, "CONFIG.Actor.documentClass.prototype.rollSkill", rollSkill, "OVERRIDE", {chain: true});
}

export let diePatchingDAE = () => {
    libWrapper.register(moduleName, "CONFIG.Item.documentClass.prototype.getRollData", getRollData, "OVERRIDE", {chain: true});
    libWrapper.register(moduleName, "CONFIG.Actor.documentClass.prototype.rollAbilitySave", rollAbilitySaveDAE, "WRAPPER");
    libWrapper.register(moduleName, "CONFIG.Actor.documentClass.prototype.rollSkill", rollSkill, "OVERRIDE", {chain: true});
    libWrapper.register(moduleName, "CONFIG.Actor.documentClass.prototype.getRollData", getRollDataDAE, "WRAPPER");
} 