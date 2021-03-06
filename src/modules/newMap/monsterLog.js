import getForage from '../ajax/getForage';
import retryAjax from '../ajax/retryAjax';
import setForage from '../ajax/setForage';
import * as system from '../support/system';

var showCreatureInfo;
var showMonsterLog;
var monsterLog;
var actionData;
var creature;
var monster;
var generalVariable = 1.1053;
var hpVariable = 1.1;
var statLevel;
var statDefense;
var statAttack;
var statDamage;
var statArmor;
var statHp;

function updateMinMax(_logStat, creatureStat) {
  var logStat = system.fallback(_logStat, {});
  if (logStat.min) {
    logStat.min = Math.min(logStat.min, creatureStat);
  } else {
    logStat.min = creatureStat;
  }
  if (logStat.max) {
    logStat.max = Math.max(logStat.max, creatureStat);
  } else {
    logStat.max = creatureStat;
  }
  return logStat;
}

function processMonsterLog() {
  if (!showMonsterLog) {return;}
  monsterLog[creature.name] = system.fallback(monsterLog[creature.name], {});
  var logCreature = monsterLog[creature.name];
  logCreature.creature_class = system.fallback(logCreature.creature_class,
    creature.creature_class);
  logCreature.image_id = system.fallback(logCreature.image_id,
    creature.image_id);
  logCreature.level = system.fallback(logCreature.level,
    Number(creature.level));
  logCreature.type = system.fallback(logCreature.type, creature.type);
  logCreature.armor = updateMinMax(logCreature.armor,
    Number(creature.armor));
  logCreature.attack = updateMinMax(logCreature.attack,
    Number(creature.attack));
  logCreature.damage = updateMinMax(logCreature.damage,
    Number(creature.damage));
  logCreature.defense = updateMinMax(logCreature.defense,
    Number(creature.defense));
  logCreature.hp = updateMinMax(logCreature.hp,
    Number(creature.hp));
  if (creature.enhancements && creature.enhancements.length > 0) {
    logCreature.enhancements = system.fallback(logCreature.enhancements, {});
    var logEnh = logCreature.enhancements;
    creature.enhancements.forEach(function(e) {
      logEnh[e.name] = updateMinMax(logEnh[e.name], Number(e.value));
    });
  }
  setForage('fsh_monsterLog', monsterLog);
}

function doMouseOver() {
  var oneHitNumber = Math.ceil(creature.hp * hpVariable + creature.armor *
    generalVariable);
  var myLvlClas = 'fshYellow';
  if (statLevel > creature.level) {myLvlClas = 'fshRed';}
  var monsterTip = '<table><tr><td>' +
    '<img src="https://cdn.fallensword.com/creatures/' + creature.image_id +
    '.jpg" height="200" width="200"></td><td rowspan="2">' +
    '<table width="400"><tr>' +
    '<td class="header" colspan="4" class="fshCenter">Statistics</td></tr>' +
    '<tr><td>Class:&nbsp;</td><td width="40%">' + creature.creature_class +
    '</td><td>Level:&nbsp;</td><td width="40%">' + creature.level +
    ' (your level:<span class="' + myLvlClas + '">' +
    statLevel + '</span>)</td>' +
    '</tr><tr><td>Attack:&nbsp;</td><td width="40%">' + creature.attack +
    ' (your defense:<span class="fshYellow">' + statDefense + '</span>)</td>' +
    '<td>Defense:&nbsp;</td><td width="40%">' + creature.defense +
    ' (your attack:<span class="fshYellow">' + statAttack + '</span>)</td>' +
    '</tr><tr><td>Armor:&nbsp;</td><td width="40%">' + creature.armor +
    ' (your damage:<span class="fshYellow">' + statDamage + '</span>)</td>' +
    '<td>Damage:&nbsp;</td><td width="40%">' + creature.damage +
    ' (your armor:<span class="fshYellow">' + statArmor + '</span>)</td>' +
    '</tr><tr><td>HP:&nbsp;</td><td width="40%">' + creature.hp +
    ' (your HP:<span class="fshYellow">' + statHp + '</span>)' +
    '(1H: <span class="fshRed">' + oneHitNumber + '</span>)</td>' +
    '<td>Gold:&nbsp;</td><td width="40%">' + creature.gold + '</td></tr>' +
    '<tr><td colspan="4" height="5"></td></tr><tr>' +
    '<td class="header" colspan="4" class="fshCenter">Enhancements</td></tr>';

  if (!creature.enhancements) {
    monsterTip += '<tr><td colspan="4">[no enhancements]</td></tr>';
  } else {
    creature.enhancements.forEach(function(e) {
      monsterTip += '<tr><td colspan="2">' + e.name +
        ':</td><td colspan="2">' + e.value + '</td></tr>';
    });
  }

  monsterTip += '<tr><td colspan="4" height="5"></td></tr><tr>' +
    '<td class="header" colspan="4" class="fshCenter">Description</td>' +
    '</tr><tr><td colspan="4">' + creature.description + '</td></tr>' +
    '<tr><td colspan="4" height="5"></td></tr></table></td></tr>' +
    '<tr><td class="fshCenter"><b>' + creature.name + '</b></td></tr>' +
    '</table>';

  monster.setAttribute('data-tipped', monsterTip);
}

var bailOut = [
  function(data, actions) {
    return actions.length === 1 &&
      actions[0].classList.contains('hcs-state-disabled'); // In motion
  },
  function(data, actions) {
    return actions.length - 1 < data.passback; // Not enough actions
  },
  function(data) {
    return creature.id !== actionData[data.passback].data.id.toString(); // Different action list
  }
];

function doCreatureInfo(data) {
  var actions = document.getElementById('actionList').children;
  for (var i = 0; i < bailOut.length; i += 1) {
    if (bailOut[i](data, actions)) {return;}
  }
  monster = actions[data.passback].firstElementChild.firstElementChild
    .firstElementChild;
  doMouseOver();
}

function processMouseOver(data) {
  if (showCreatureInfo) {doCreatureInfo(data);}
}

function processMonster(data) {
  creature = data.response.data;
  if (!creature) {return;} // creature is null
  processMouseOver(data);
  processMonsterLog();
}

function loopActions(e, i) { // jQuery
  if (e.type !== 6) {return;}
  retryAjax({
    url: 'fetchdata.php?a=1&d=0&id=' + e.data.id + '&passback=' + i,
    dataType: 'json'
  }).done(processMonster);
}

function getStatText(statTooltip, statClassName) {
  return statTooltip.getElementsByClassName(statClassName)[0]
    .nextElementSibling.textContent;
}

function getMyStats() {
  statLevel = system.intValue(getStatText(document
    .getElementById('statbar-level-tooltip-general'), 'stat-level'));
  var statTooltip = document.getElementById('statbar-character-tooltip-stats');
  statDefense = getStatText(statTooltip, 'stat-defense');
  statAttack = getStatText(statTooltip, 'stat-attack');
  statDamage = getStatText(statTooltip, 'stat-damage');
  statArmor = getStatText(statTooltip, 'stat-armor');
  statHp = getStatText(statTooltip, 'stat-hp');
}

function initMonsterLog() {
  if (showCreatureInfo) {getMyStats();}
  actionData = GameData.actions();
  actionData.forEach(loopActions);
}

var genVar = [0, 1.1, 1.053, 1.1053];
var hpVar = [0, 1.053, 1, 1];

function getBias() {
  var combatEvaluatorBias = system.getValue('combatEvaluatorBias');
  generalVariable = genVar[combatEvaluatorBias];
  hpVariable = hpVar[combatEvaluatorBias];
}

export default function startMonsterLog() { // jQuery
  showCreatureInfo = system.getValue('showCreatureInfo');
  showMonsterLog = system.getValue('showMonsterLog');
  if (!showCreatureInfo && !showMonsterLog) {return;}
  if (showCreatureInfo) {getBias();}
  $.subscribe('after-update.actionlist', initMonsterLog);
  getForage('fsh_monsterLog').done(function(data) {
    monsterLog = data || {};
  });
  initMonsterLog();
}
