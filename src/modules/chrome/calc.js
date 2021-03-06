import * as dataObj from '../support/dataObj';
import * as system from '../support/system';

var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatShortDate(aDate) {
  var yyyy = aDate.getFullYear();
  var dd = system.padZ(aDate.getDate());
  var ddd = days[aDate.getDay()];
  var month = dataObj.months[aDate.getMonth()];
  var hh = system.padZ(aDate.getHours());
  var mm = system.padZ(aDate.getMinutes());
  return hh + ':' + mm + ' ' + ddd + ' ' + dd + '/' + month + '/' + yyyy;
}

function timeBox(nextGainTime, hrsToGo) {
  var nextGain = /([0-9]+)m ([0-9]+)s/.exec(nextGainTime);
  if (!nextGain) {return;}
  return '<dd>' +
    formatShortDate(new Date(Date.now() +
    (hrsToGo * 60 * 60 + parseInt(nextGain[1], 10) * 60 +
    parseInt(nextGain[2], 10)) * 1000)) + '</dd>';
}

export function injectStaminaCalculator() {
  var nextGain = document.getElementsByClassName('stat-stamina-nextGain');
  if (!nextGain) {return;}
  var staminaMouseover =
    document.getElementById('statbar-stamina-tooltip-stamina');
  var stamVals = /([,0-9]+)\s\/\s([,0-9]+)/.exec(
    staminaMouseover.getElementsByClassName('stat-name')[0]
      .nextElementSibling.textContent
  );
  staminaMouseover.insertAdjacentHTML('beforeend',
    '<dt class="stat-stamina-nextHuntTime">Max Stam At</dt>' +
    timeBox(
      nextGain[0].nextElementSibling.textContent,
      // get the max hours to still be inside stamina maximum
      Math.floor(
        (system.intValue(stamVals[2]) -
        system.intValue(stamVals[1])) /
        system.intValue(
          document.getElementsByClassName('stat-stamina-gainPerHour')[0]
            .nextElementSibling.textContent
        )
      )
    )
  );
}

export function injectLevelupCalculator() {
  var nextGain = document.getElementsByClassName('stat-xp-nextGain');
  if (!nextGain) {return;}
  document.getElementById('statbar-level-tooltip-general')
    .insertAdjacentHTML('beforeend',
      '<dt class="stat-xp-nextLevel">Next Level At</dt>' +
      timeBox(
        nextGain[0].nextElementSibling.textContent,
        Math.ceil(
          system.intValue(
            document.getElementsByClassName('stat-xp-remaining')[0]
              .nextElementSibling.textContent
          ) /
          system.intValue(
            document.getElementsByClassName('stat-xp-gainPerHour')[0]
              .nextElementSibling.textContent
          )
        )
      )
    );
}
