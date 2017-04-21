import assets from './assets';
import calf from '../support/calf';
import * as common from '../common/common';
import * as system from '../support/system';

function calcAttack(combat) { // Native
  if (combat.callback.groupExists) {
    return combat.callback.groupAttackValue;
  }
  return combat.player.attackValue;
}

function calcDef(combat) { // Native
  if (combat.callback.groupExists) {
    return combat.callback.groupDefenseValue;
  }
  return combat.player.defenseValue;
}

function calcArm(combat) { // Native
  if (combat.callback.groupExists) {
    return combat.callback.groupArmorValue;
  }
  return combat.player.armorValue;
}

function calcDmg(combat) { // Native
  if (combat.callback.groupExists) {
    return combat.callback.groupDamageValue;
  }
  return combat.player.damageValue;
}

function calcHp(combat) { // Native
  if (combat.callback.groupExists) {
    return combat.callback.groupHPValue;
  }
  return combat.player.hpValue;
}

function getBiasGeneral(combat) { // Native
  if (assets.bias[combat.combatEvaluatorBias]) {
    return assets.bias[combat.combatEvaluatorBias].generalVariable;
  }
  return 1.1053;
}

function getBiasHp(combat) { // Native
  if (assets.bias[combat.combatEvaluatorBias]) {
    return assets.bias[combat.combatEvaluatorBias].hpVariable;
  }
  return 1.1;
}

function creatureData(ses) { // jQuery
  var obj = {};
  obj.name = $('#dialog-viewcreature').find('h2.name').text();
  obj.class = $('#dialog-viewcreature')
    .find('span.classification')
    .text();
  obj.attack = system.intValue($('#dialog-viewcreature')
    .find('dd.attribute-atk').text());
  obj.defense = system.intValue($('#dialog-viewcreature')
    .find('dd.attribute-def').text());
  obj.armor = system.intValue($('#dialog-viewcreature')
    .find('dd.attribute-arm').text());
  obj.damage = system.intValue($('#dialog-viewcreature')
    .find('dd.attribute-dmg').text());
  obj.hp = system.intValue($('#dialog-viewcreature')
    .find('p.health-max').text());
  // reduce stats if critter is a SE and player has SES cast on them.
  if (obj.name.search('Super Elite') !== -1) {
    obj.attack -= Math.ceil(obj.attack * ses);
    obj.defense -= Math.ceil(obj.defense * ses);
    obj.armor -= Math.ceil(obj.armor * ses);
    obj.damage -= Math.ceil(obj.damage * ses);
    obj.hp -= Math.ceil(obj.hp * ses);
  }
  return obj;
}

function evalSes(combat) { // Native
  if (combat.player.superEliteSlayerLevel > 0) {
    combat.extraNotes += 'SES Stat Reduction Multiplier = ' +
    combat.player.superEliteSlayerMultiplier + '<br>';
  }
}

function evalHolyFlame(combat) { // Native
  combat.holyFlameBonusDamage = 0;
  if (combat.creature.class !== 'Undead') {return;}
  combat.holyFlameBonusDamage = Math.max(Math.floor(
    (combat.player.damageValue - combat.creature.armor) *
    combat.player.holyFlameLevel * 0.002), 0);
  if (combat.player.holyFlameLevel > 0) {
    combat.extraNotes += 'HF Bonus Damage = ' + combat.holyFlameBonusDamage +
    '<br>';
  }
}

function evalExtraStam(combat) { // Native
  combat.extraStaminaPerHit = 0;
  if (combat.player.counterAttackLevel > 0) {
    combat.extraStaminaPerHit = Math.ceil(
      (1 + combat.player.doublerLevel / 50) *
      0.0025 * combat.player.counterAttackLevel
    );
  }
}

function evalDeathDealer(combat) { // Native
  if (combat.player.deathDealerLevel > 0) {
    combat.extraNotes += 'DD Bonus Damage = ' +
      combat.deathDealerBonusDamage + '<br>';
  }
}

function evalCounterAttack(combat) { // Native
  if (combat.player.counterAttackLevel > 0) {
    combat.extraNotes += 'CA Bonus Attack/Damage = ' +
      combat.counterAttackBonusAttack + ' / ' +
      combat.counterAttackBonusDamage + '<br>' +
      'CA Extra Stam Used = ' + combat.extraStaminaPerHit + '<br>';
  }
}

function evalExtraBuffs(combat) { // Native
  combat.extraNotes = '';
  evalSes(combat);
  // math section ... analysis
  // Holy Flame adds its bonus after the
  // armor of the creature has been taken off.
  evalHolyFlame(combat);
  // Death Dealer and Counter Attack both applied at the same time
  combat.deathDealerBonusDamage =
    Math.floor(combat.player.damageValue * (Math.min(Math.floor(
      combat.player.killStreakValue / 5) * 0.01 *
      combat.player.deathDealerLevel, 20) / 100));
  combat.counterAttackBonusAttack =
    Math.floor(combat.player.attackValue * 0.0025 *
    combat.player.counterAttackLevel);
  combat.counterAttackBonusDamage =
    Math.floor(combat.player.damageValue * 0.0025 *
    combat.player.counterAttackLevel);
  evalExtraStam(combat);
  evalDeathDealer(combat);
  evalCounterAttack(combat);
  return combat;
}

function calcHitByHowMuch(combat) { // Native
  var remainingDef = combat.creature.defense - combat.creature.defense *
    combat.player.darkCurseLevel * 0.002;
  if (combat.combatEvaluatorBias === 3) {
    return combat.overallAttackValue - Math.ceil(remainingDef) - 50;
  }
  return combat.overallAttackValue -
    Math.ceil(combat.attackVariable * remainingDef);
}

function evalAttack(combat) { // Native
  var atkValue = calcAttack(combat);
  // Attack:
  if (combat.player.darkCurseLevel > 0) {
    combat.extraNotes += 'DC Bonus Attack = ' +
      Math.floor(combat.creature.defense *
      combat.player.darkCurseLevel * 0.002) + '<br>';
  }
  combat.nightmareVisageAttackMovedToDefense =
    Math.floor((atkValue +
    combat.counterAttackBonusAttack) *
    combat.player.nightmareVisageLevel * 0.0025);
  if (combat.player.nightmareVisageLevel > 0) {
    combat.extraNotes += 'NMV Attack moved to Defense = ' +
      combat.nightmareVisageAttackMovedToDefense + '<br>';
  }
  combat.overallAttackValue = atkValue +
    combat.counterAttackBonusAttack -
    combat.nightmareVisageAttackMovedToDefense;
  combat.hitByHowMuch = calcHitByHowMuch(combat);
  return combat;
}

function evalFortitude(combat) { // Native
  var hpValue = calcHp(combat);
  var fortitudeLevel = combat.player.fortitudeLevel;
  combat.fortitudeExtraHPs = Math.floor(hpValue * fortitudeLevel * 0.001);
  if (fortitudeLevel > 0) {
    combat.extraNotes += 'Fortitude Bonus HP = ' + combat.fortitudeExtraHPs +
      '<br>';
  }
  combat.overallHPValue = hpValue + combat.fortitudeExtraHPs;
}

function evalChiStrike(combat) { // Native
  var chiStrikeLevel = combat.player.chiStrikeLevel;
  combat.chiStrikeExtraDamage = Math.floor(combat.overallHPValue *
    chiStrikeLevel * 0.001);
  if (chiStrikeLevel > 0) {
    combat.extraNotes += 'Chi Strike Bonus Damage = ' +
      combat.chiStrikeExtraDamage + '<br>';
  }
}

function evalDamage(combat) { // Native
  // Damage:
  evalFortitude(combat);
  evalChiStrike(combat);

  var damageValue = calcDmg(combat);
  combat.overallDamageValue = damageValue +
    combat.deathDealerBonusDamage + combat.counterAttackBonusDamage +
    combat.holyFlameBonusDamage + combat.chiStrikeExtraDamage;
  combat.damageDone = Math.floor(combat.overallDamageValue - (
    combat.generalVariable * combat.creature.armor +
    combat.hpVariable * combat.creature.hp));

  if (combat.hitByHowMuch > 0) {
    var dmgLessArmor = 1;
    if (combat.overallDamageValue >=
        combat.generalVariable * combat.creature.armor) {
      dmgLessArmor = combat.overallDamageValue - combat.generalVariable *
        combat.creature.armor;
    }
    combat.numberOfHitsRequired = Math.ceil(combat.hpVariable *
      combat.creature.hp / dmgLessArmor);
  } else {
    combat.numberOfHitsRequired = '-';
  }
  return combat;
}

function evalConstitution(combat) { // Native
  if (combat.player.constitutionLevel > 0) {
    combat.extraNotes += 'Constitution Bonus Defense = ' +
    Math.floor(calcDef(combat) *
    combat.player.constitutionLevel * 0.001) + '<br>';
  }
}

function evalFlinch(combat) { // Native
  if (combat.player.flinchLevel > 0) {
    combat.extraNotes += 'Flinch Bonus Attack Reduction = ' +
    Math.floor(combat.creature.attack * combat.player.flinchLevel *
    0.001) + '<br>';
  }
}

function evalDefence(combat) { // Native
  combat.overallDefenseValue = calcDef(combat) +
    Math.floor(calcDef(combat) *
    combat.player.constitutionLevel * 0.001) +
    combat.nightmareVisageAttackMovedToDefense;

  evalConstitution(combat);
  evalFlinch(combat);

  combat.creatureHitByHowMuch = Math.floor(combat.attackVariable *
    combat.creature.attack - combat.creature.attack *
    combat.player.flinchLevel * 0.001 - combat.overallDefenseValue);

  if (combat.combatEvaluatorBias === 3) {
    combat.creatureHitByHowMuch = Math.floor(combat.creature.attack -
      combat.creature.attack * combat.player.flinchLevel * 0.001 -
      combat.overallDefenseValue - 50);
  }

  return combat;
}

function evalSanctuary(combat) { // Native
  if (combat.player.sanctuaryLevel > 0) {
    combat.extraNotes += 'Sanc Bonus Armor = ' +
      Math.floor(combat.player.armorValue *
      combat.player.sanctuaryLevel * 0.001) + '<br>';
  }
}

function evalTerrorize(combat) { // Native
  if (combat.player.terrorizeLevel > 0) {
    combat.extraNotes += 'Terrorize Creature Damage Effect = ' +
      combat.terrorizeEffect * -1 + '<br>';
  }
}

function evalArmour(combat) { // Native
  var armorVal = calcArm(combat);
  combat.overallArmorValue = armorVal +
    Math.floor(combat.player.armorValue *
    combat.player.sanctuaryLevel * 0.001);

  evalSanctuary(combat);

  combat.terrorizeEffect = Math.floor(combat.creature.damage *
    combat.player.terrorizeLevel * 0.001);

  evalTerrorize(combat);

  combat.creature.damage -= combat.terrorizeEffect;
  combat.creatureDamageDone = Math.ceil(combat.generalVariable *
    combat.creature.damage - combat.overallArmorValue +
    combat.overallHPValue);

  if (combat.creatureHitByHowMuch >= 0) {
    var approxDmg = combat.generalVariable * combat.creature.damage;
    if (approxDmg < combat.overallArmorValue) {
      combat.numberOfCreatureHitsTillDead = combat.overallHPValue;
    } else {
      combat.numberOfCreatureHitsTillDead = Math.ceil(
        combat.overallHPValue / (approxDmg - combat.overallArmorValue));
    }
  } else {
    combat.numberOfCreatureHitsTillDead = '-';
  }

  return combat;
}

function canIHit(combat) { // Native
  return combat.numberOfHitsRequired === '-' ||
    combat.numberOfHitsRequired > combat.numberOfCreatureHitsTillDead;
}

function evalPlayerHits(combat) { // Native
  if (combat.numberOfCreatureHitsTillDead === '-') {
    return combat.numberOfHitsRequired;
  } else if (canIHit(combat)) {
    return '-';
  }
  return combat.numberOfHitsRequired;
}

function canCreatureHit(combat) { // Native
  return combat.numberOfCreatureHitsTillDead === '-' ||
    combat.numberOfCreatureHitsTillDead > combat.numberOfHitsRequired;
}

function evalCreatureHits(combat) { // Native
  if (combat.numberOfHitsRequired === '-') {
    return combat.numberOfCreatureHitsTillDead;
  } else if (canCreatureHit(combat)) {
    return '-';
  }
  return combat.numberOfCreatureHitsTillDead;
}

function evalMiss(combat) { // Native
  if (combat.numberOfCreatureHitsTillDead - combat.numberOfHitsRequired <= 1) {
    return ', dies on miss';
  }
  return ', survives a miss';
}

var evalFightStatus = [
  {
    test: function(combat) {
      return combat.playerHits === '-' && combat.creatureHits === '-';
    },
    fStatus: function() {return 'Unresolved';}
  },
  {
    test: function(combat) {return combat.playerHits === '-';},
    fStatus: function() {return 'Player dies';}
  },
  {
    test: function(combat) {return combat.playerHits === 1;},
    fStatus: function(combat) {return 'Player 1 hits' + evalMiss(combat);}
  },
  {
    test: function(combat) {return combat.playerHits > 1;},
    fStatus: function(combat) {return 'Player > 1 hits' + evalMiss(combat);}
  }
];

function evalAnalysis(combat) { // Native
  // Analysis:
  combat.playerHits = evalPlayerHits(combat);
  combat.creatureHits = evalCreatureHits(combat);
  for (var i = 0; i < evalFightStatus.length; i += 1) {
    if (evalFightStatus[i].test(combat)) {
      combat.fightStatus = evalFightStatus[i].fStatus(combat);
      return combat;
    }
  }
  combat.fightStatus = 'Unknown';
  return combat;
}

function stamAtLowestCa(combat) { // Native
  if (combat.player.counterAttackLevel > 0) {
    return Math.ceil((1 + combat.player.doublerLevel / 50) * 0.0025 *
      combat.lowestFeasibleCALevel);
  }
  return 0;
}

function caRunning(combat) { // Native
  combat.lowestCALevelToStillHit = Math.max(Math.ceil((
    combat.counterAttackBonusAttack - combat.hitByHowMuch + 1) /
    combat.player.attackValue / 0.0025), 0);
  combat.lowestCALevelToStillKill = Math.max(Math.ceil((
    combat.counterAttackBonusDamage - combat.damageDone + 1) /
    combat.player.damageValue / 0.0025), 0);
  combat.lowestFeasibleCALevel =
    Math.max(combat.lowestCALevelToStillHit,
    combat.lowestCALevelToStillKill);
  combat.extraNotes += 'Lowest CA to still 1-hit this creature = ' +
    combat.lowestFeasibleCALevel + '<br>';
  if (combat.lowestFeasibleCALevel !== 0) {
    combat.extraAttackAtLowestFeasibleCALevel =
      Math.floor(combat.player.attackValue * 0.0025 *
      combat.lowestFeasibleCALevel);
    combat.extraDamageAtLowestFeasibleCALevel =
      Math.floor(combat.player.damageValue * 0.0025 *
      combat.lowestFeasibleCALevel);
    combat.extraNotes +=
      'Extra CA Att/Dam at this lowered CA level = ' +
      combat.extraAttackAtLowestFeasibleCALevel + ' / ' +
      combat.extraDamageAtLowestFeasibleCALevel + '<br>';
  }
  combat.extraStaminaPerHitAtLowestFeasibleCALevel = stamAtLowestCa(combat);
  if (combat.extraStaminaPerHitAtLowestFeasibleCALevel <
    combat.extraStaminaPerHit) {
    combat.extraNotes +=
      'Extra Stam Used at this lowered CA level = ' +
      combat.extraStaminaPerHitAtLowestFeasibleCALevel + '<br>';
  } else {
    combat.extraNotes +=
      'No reduction of stam used at the lower CA level<br>';
  }
}

function evalCaKill(combat) { // Native
  if (combat.lowestCALevelToStillHit > 175) {
    combat.extraNotes +=
      'Even with CA175 you cannot hit this creature<br>';
  } else if (combat.lowestCALevelToStillHit !== 0) {
    combat.extraNotes += 'You need a minimum of CA' +
      combat.lowestCALevelToStillHit +
      ' to hit this creature<br>';
  }
}

function evalCaOneHit(combat) { // Native
  if (combat.lowestCALevelToStillKill > 175) {
    combat.extraNotes +=
      'Even with CA175 you cannot 1-hit kill this creature<br>';
  } else if (combat.lowestCALevelToStillKill !== 0) {
    combat.extraNotes += 'You need a minimum of CA' +
      combat.lowestCALevelToStillKill +
      ' to 1-hit kill this creature<br>';
  }
}

function caResult(combat) { // Native
  combat.lowestCALevelToStillHit = Math.max(Math.ceil((
    combat.counterAttackBonusAttack - combat.hitByHowMuch + 1) /
    combat.player.attackValue / 0.0025), 0);
  combat.lowestCALevelToStillKill = Math.max(Math.ceil((
    combat.counterAttackBonusDamage - combat.damageDone + 1) /
    combat.player.damageValue / 0.0025), 0);
  evalCaKill(combat);
  evalCaOneHit(combat);
}

function needCa(combat) { // Native
  return combat.numberOfHitsRequired === '-' ||
    combat.numberOfHitsRequired !== 1;
}

function evalCA(combat) { // Native
  if (combat.player.counterAttackLevel > 0 &&
      combat.numberOfHitsRequired === 1) {
    caRunning(combat);
  }
  if (needCa(combat)) {
    caResult(combat);
  }
  return combat;
}

function doesGroupExist(combat) { // Native
  if (combat.callback.groupExists) {return 'Group ';}
  return '';
}

function canIHitIt(combat) { // Native
  if (combat.hitByHowMuch > 0) {return 'Yes';}
  return 'No';
}

function willIBeHit(combat) { // Native
  if (combat.creatureHitByHowMuch >= 0) {return 'Yes';}
  return 'No';
}

function evalHTML(combat) { // Native
  return '<table width="100%"><tbody>' +
    '<tr><td bgcolor="#CD9E4B" colspan="4" align="center">' +
    doesGroupExist(combat) +
    'Combat Evaluation</td></tr>' +
    '<tr><td align="right"><span style="color:#333333">' +
    'Will I hit it? </td><td align="left">' +
    canIHitIt(combat) +
    '</td><td align="right"><span style="color:#333333">' +
    'Extra Attack: </td><td align="left">( ' +
    combat.hitByHowMuch + ' )</td></tr>' +
    '<tr><td align="right"><span style="color:#333333">' +
    '# Hits to kill it? </td><td align="left">' +
    combat.numberOfHitsRequired +
    '</td><td align="right"><span style="color:#333333">' +
    'Extra Damage: </td><td align="left">( ' + combat.damageDone +
    ' )</td></tr>' +
    '<tr><td align="right"><span style="color:#333333">' +
    'Will I be hit? </td><td align="left">' +
    willIBeHit(combat) +
    '</td><td align="right"><span style="color:#333333">' +
    'Extra Defense: </td><td align="left">( ' + -1 *
    combat.creatureHitByHowMuch + ' )</td></tr>' +
    '<tr><td align="right"><span style="color:#333333">' +
    '# Hits to kill me? </td><td align="left">' +
    combat.numberOfCreatureHitsTillDead +
    '</td><td align="right"><span style="color:#333333">' +
    'Extra Armor + HP: </td><td align="left">( ' + -1 *
    combat.creatureDamageDone + ' )</td></tr>' +
    '<tr><td align="right"><span style="color:#333333">' +
    '# Player Hits? </td><td align="left">' + combat.playerHits +
    '</td><td align="right"><span style="color:#333333">' +
    '# Creature Hits? </td><td align="left">' + combat.creatureHits +
    '</td></tr>' +
    '<tr><td align="right"><span style="color:#333333">' +
    'Fight Status: </span></td><td align="left" colspan="3"><span>' +
    combat.fightStatus + '</span></td></tr>' +
    '<tr><td align="right"><span style="color:#333333">' +
    'Notes: </span></td><td align="left" colspan="3">' +
    '<span style="font-size:x-small;">' + combat.extraNotes +
    '</span></td></tr>' +
    '<tr><td colspan="4"><span style="font-size:x-small; ' +
    'color:gray">*Does include CA, DD, HF, DC, Flinch, Super Elite ' +
    'Slayer, NMV, Sanctuary, Constitution, Fortitude, Chi Strike ' +
    'and Terrorize (if active) and allow for randomness (1.1053). ' +
    'Constitution, NMV, Fortitude and Chi Strike apply to group ' +
    'stats.</span></td></tr>' +
    '</tbody></table>';
}

function checkForCreatureEvaluatorGroup() { // Legacy
  if ($('#creatureEvaluatorGroup').length === 0) {
    $('#dialog-viewcreature')
      .append('<div id="creatureEvaluatorGroup" ' +
        'style="clear:both;"></div>');
  }
}

function checkForCreatureEvaluator() { // Legacy
  if ($('#creatureEvaluator').length === 0) {
    $('#dialog-viewcreature')
      .append('<div id="creatureEvaluator" ' +
        'style="clear:both;"></div>');
  }
}

function getCreaturePlayerData(responseText, callback) { // Legacy
  var combat = {};
  combat.callback = callback;
  // playerdata
  combat.player = common.playerData(responseText);
  combat.combatEvaluatorBias = system.getValue('combatEvaluatorBias');
  combat.attackVariable = 1.1053;
  combat.generalVariable = getBiasGeneral(combat);
  combat.hpVariable = getBiasHp(combat);
  combat.creature =
    creatureData(combat.player.superEliteSlayerMultiplier);
  combat = evalExtraBuffs(combat);
  combat = evalAttack(combat);
  combat = evalDamage(combat);
  combat = evalDefence(combat);
  combat = evalArmour(combat);
  combat = evalAnalysis(combat);
  combat = evalCA(combat);
  combat.evaluatorHTML = evalHTML(combat);
  var tempdata;
  if (callback.groupEvaluation) {
    checkForCreatureEvaluatorGroup();
    tempdata = combat.evaluatorHTML.replace(/'/g, '\\\'');
    $('#creatureEvaluatorGroup').html(tempdata);
  } else {
    checkForCreatureEvaluator();
    tempdata = combat.evaluatorHTML.replace(/'/g, '\\\'');
    $('#creatureEvaluator').html(tempdata);
  }
}

function getCreatureGroupData(responseText) { // Legacy
  var doc = system.createDocument(responseText);
  var groupAttackValue = Number(system.findNode('//table[@width="400"]/tbody' +
    '/tr/td[contains(.,"Attack:")]', doc).nextSibling.textContent
    .replace(/,/, ''));
  var groupDefenseValue = Number(system.findNode('//table[@width="400"]/tbody' +
    '/tr/td[contains(.,"Defense:")]', doc).nextSibling.textContent
    .replace(/,/, ''));
  var groupArmorValue = Number(system.findNode('//table[@width="400"]/tbody' +
    '/tr/td[contains(.,"Armor:")]', doc).nextSibling.textContent
    .replace(/,/, ''));
  var groupDamageValue = Number(system.findNode('//table[@width="400"]/tbody' +
    '/tr/td[contains(.,"Damage:")]', doc).nextSibling.textContent
    .replace(/,/, ''));
  var groupHPValue = Number(system.findNode('//table[@width="400"]/tbody' +
    '/tr/td[contains(.,"HP:")]', doc).nextSibling.textContent
    .replace(/,/, ''));
  system.xmlhttp('index.php?cmd=profile', getCreaturePlayerData, {
    groupExists: true,
    groupAttackValue: groupAttackValue,
    groupDefenseValue: groupDefenseValue,
    groupArmorValue: groupArmorValue,
    groupDamageValue: groupDamageValue,
    groupHPValue: groupHPValue,
    groupEvaluation: true
  });
}

function checkIfGroupExists(responseText) { // Hybrid
  var doc = system.createDocument(responseText);
  var groupExistsIMG = $(doc)
    .find('img[title="Disband Group (Cancel Attack)"]');
  if (groupExistsIMG.length > 0) {
    var groupHref = groupExistsIMG.parents('td:first').find('a:first')
      .attr('href');
    system.xmlhttp(groupHref, getCreatureGroupData);
  }
}

function addRemoveCreatureToDoNotKillList(evt) { // Native
  var creatureName = evt.target.getAttribute('creatureName');
  var ind = calf.doNotKillList.indexOf(creatureName);
  if (ind !== -1) {
    calf.doNotKillList.splice(ind, 1);
    evt.target.innerHTML = 'Add to the do not kill list';
  } else {
    calf.doNotKillList.push(creatureName);
    evt.target.innerHTML = 'Remove from do not kill list';
  }
  system.setValue('doNotKillList', calf.doNotKillList.join());
  // refresh the action list
  window.GameData.doAction(-1);
}

export function readyViewCreature() { // Hybrid
  $('#creatureEvaluator').html('');
  $('#creatureEvaluatorGroup').html('');

  system.xmlhttp('index.php?cmd=profile', getCreaturePlayerData, {
    groupExists: false,
    groupAttackValue: 0,
    groupDefenseValue: 0,
    groupArmorValue: 0,
    groupDamageValue: 0,
    groupHPValue: 0,
    groupEvaluation: false
  });
  system.xmlhttp('index.php?cmd=guild&subcmd=groups',
    checkIfGroupExists);

  $('#addRemoveCreatureToDoNotKillList').html('');
  if ($('#addRemoveCreatureToDoNotKillList').length === 0) {
    var doNotKillElement = '<div id="addRemoveCreatureToDo' +
      'NotKillList"" class="description" style="cursor:' +
      'pointer;text-decoration:underline;color:blue;"></div>';
    $(doNotKillElement).insertAfter($('#dialog-viewcreature')
      .find('p.description'));
  }
  var creatureName = $('#dialog-viewcreature').find('h2.name')
    .text();
  $('#addRemoveCreatureToDoNotKillList')
    .attr('creatureName', creatureName);
  var extraText = 'Add to the do not kill list';
  if (calf.doNotKillList.indexOf(creatureName) !== -1) {
    extraText = 'Remove from do not kill list';
  }
  $('#addRemoveCreatureToDoNotKillList').html(extraText);
  document.getElementById('addRemoveCreatureToDoNotKillList')
    .addEventListener('click',
      addRemoveCreatureToDoNotKillList, true);
}
