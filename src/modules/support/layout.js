import add from './task';
import {
  createButton,
  createDiv,
  createLi,
  createUl
} from '../common/cElement';
import * as dataObj from './dataObj';
import * as system from './system';

var dotList;
var dotCount;
var redDot =
  '<span class="fshDot redDot tip-static" data-tipped="Offline"></span>';
var greenDiamond =
  '<span class="fshDot greenDiamond tip-static" data-tipped="Online"></span>';
var yellowDiamond =
  '<span class="fshDot yellowDiamond tip-static" data-tipped="Offline"></span>';
var orangeDiamond =
  '<span class="fshDot orangeDiamond tip-static" data-tipped="Offline"></span>';
var offlineDot =
  '<span class="fshDot offlineDot tip-static" data-tipped="Offline"></span>';
var sevenDayDot =
  '<span class="fshDot sevenDayDot tip-static" data-tipped="Offline"></span>';

export var pCC = document.getElementById('pCC');

export function buffAllHref(shortList) { // Bad Pattern
  var _shortList = shortList.join(',').replace(/\s/g, '');
  var j = 'java';
  return j + 'script:openWindow(\'index.php?cmd=quickbuff&t=' + _shortList +
    '\', \'fsQuickBuff\', 618, 1000, \',scrollbars\')';
}

export function quickBuffHref(aPlayerId, buffList) { // Bad Pattern
  var passthru = '';
  if (buffList) {passthru = '&blist=' + buffList;}
  return 'href=\'javascript:window.openWindow("index.php?cmd=' +
    'quickbuff&tid=' + aPlayerId + passthru +
    '", "fsQuickBuff", 618, 1000, ",scrollbars")\'';
}

export function openQuickBuffById(aPlayerId) {
  window.openWindow('index.php?cmd=quickbuff&tid=' + aPlayerId,
    'fsQuickBuff', 618, 1000, ',scrollbars');
}

export function openQuickBuffByName(aPlayerName) {
  window.openWindow('index.php?cmd=quickbuff&t=' + aPlayerName,
    'fsQuickBuff', 618, 1000, ',scrollbars');
}

export function doBuffLinks(members) {
  // quick buff only supports 16
  var shortList = members.reduce(function(prev, curr, i) {
    var slot = Math.floor(i / 16);
    prev[slot] = system.fallback(prev[slot], []);
    prev[slot].push(curr);
    return prev;
  }, []).reduce(function(prev, curr, i) {
    var theNames = curr.join(',');
    var modifierWord = dataObj.places[i];
    var li = createLi();
    var btn = createButton({
      className: 'fshBl fshBls tip-static',
      dataset: {tipped: 'Quick buff functionality from HCS only does 16'},
      textContent: 'Buff ' + modifierWord + ' 16'
    });
    btn.addEventListener('click',
      openQuickBuffByName.bind(null, theNames));
    li.appendChild(btn);
    prev.appendChild(li);
    return prev;
  }, createUl());
  return shortList;
}

export function infoBox(documentText) {
  var doc = system.createDocument(documentText);
  var result;
  var infoMsg = doc.getElementById('info-msg');
  if (infoMsg) {
    var infoMatch = infoMsg.innerHTML;
    result = '';
    if (infoMatch) {
      infoMatch = infoMatch.replace(/<br.*/, '');
      result = infoMatch;
    }
  }
  return result;
}

export function guildId() {
  var _guildId;
  var nodeList = document.body.getElementsByTagName('script');
  Array.prototype.forEach.call(nodeList, function getGuildId(el) {
    var match = el.textContent.match(/\s+guildId: ([0-9]+),/);
    if (match) {_guildId = parseInt(match[1], 10);}
  });
  system.setValue('guildId', _guildId);
  return _guildId;
}

export function playerId() {
  var thePlayerId = parseInt(document.getElementById('holdtext')
    .textContent.match(/fallensword.com\/\?ref=(\d+)/)[1], 10);
  system.setValue('playerID', thePlayerId);
  return thePlayerId;
}

export function playerName() {
  return document.getElementById('statbar-character').textContent;
}

export function makePageHeader(title, comment, spanId, button) {
  var _comment = '';
  if (comment !== '') {_comment = '&nbsp;(' + comment + ')';}
  var _span = '';
  if (spanId) {
    _span = '[<span class="fshLink" id="' +
      spanId + '">' + button + '</span>]';
  }
  return '<table width=100%><tbody><tr class="fshHeader">' +
    '<td width="90%"><b>&nbsp;' + title + '</b>' + _comment +
    '<td width="10%" class="fshBtnBox">' + _span +
    '</td></tr><tbody></table>';
}

export function makePageTemplate(title, comment, spanId, button, divId) {
  return makePageHeader(title, comment, spanId, button) +
    '<div class="fshSmall" id="' + divId + '"></div>';
}

var getMins = [
  function(obj, min) {
    if (obj.day) {return min + parseInt(obj.day, 10) * 1440;}
    return min;
  },
  function(obj, min) {
    if (obj.hour) {return min + parseInt(obj.hour, 10) * 60;}
    return min;
  },
  function(obj, min) {
    if (obj.min) {return min + parseInt(obj.min, 10);}
    return min;
  },
  function(obj, min) {
    if (obj.last_login) {
      return Math.floor(Date.now() / 60000) - Math.floor(obj.last_login / 60);
    }
    return min;
  },
  function(obj, min) {
    // last_login is 'false' over 30 days
    if ('last_login' in obj && !obj.last_login) {return 99999;}
    return min;
  }
];

var getDot = [
  {condition: 2, result: greenDiamond},
  {condition: 5, result: yellowDiamond},
  {condition: 30, result: orangeDiamond},
  {condition: 10080, result: offlineDot},
  {condition: 44640, result: sevenDayDot}
];

export function onlineDot(obj) {
  var min = getMins.reduce(function(prev, curr) {
    return curr(obj, prev);
  }, 0);
  for (var i = 0; i < getDot.length; i += 1) {
    var el = getDot[i];
    if (min < el.condition) {return el.result;}
  }
  return redDot;
}

function changeOnlineDot(contactLink) {
  var lastActivity = dataObj.lastActivityRE
    .exec(contactLink.getAttribute('data-tipped'));
  contactLink.parentNode.previousSibling.innerHTML =
    onlineDot({
      min: lastActivity[3],
      hour: lastActivity[2],
      day: lastActivity[1]
    });
}

function batchDots() {
  var limit = performance.now() + 5;
  while (performance.now() < limit &&
      dotCount < dotList.length) {
    changeOnlineDot(dotList[dotCount]);
    dotCount += 1;
  }
  if (dotCount < dotList.length) {
    add(3, batchDots);
  }
}

export function colouredDots() {
  if (!system.getValue('enhanceOnlineDots')) {return;}
  dotList = document.querySelectorAll(
    '#pCC a[data-tipped*="Last Activity"]');
  dotCount = 0;
  add(3, batchDots);
}

export function confirm(title, msgText, fn) { // jQuery
  var fshMsg = document.getElementById('fshmsg');
  if (!fshMsg) {
    fshMsg = createDiv({id: 'fshmsg'});
    document.body.appendChild(fshMsg);
    $(fshMsg).dialog({
      autoOpen: false,
      dialogClass: 'no-close',
      draggable: false,
      modal: true,
      resizable: false,
    });
  }
  fshMsg.textContent = msgText;
  $(fshMsg).dialog('option', {
    buttons: {
      Yes: function() {
        fn();
        $(this).dialog('close');
      },
      No: function() {$(this).dialog('close');}
    },
    title: title
  }).dialog('open');
}
