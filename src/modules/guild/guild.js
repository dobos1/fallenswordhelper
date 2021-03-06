import add from '../support/task';
import retryAjax from '../ajax/retryAjax';
import * as guildUtils from './guildUtils';
import * as layout from '../support/layout';
import * as system from '../support/system';

var leftHandSideColumnTable;
var members;
var memCount;

function hazConflict(conflictTable, curPage, insertHere) { // Legacy
  if (curPage === 1) {
    var newNode = insertHere.insertRow(insertHere.rows.length - 2);
    newNode.insertCell(0);
    newNode.insertCell(0);
    newNode.cells[0].innerHTML =
      '<a href="index.php?cmd=guild&subcmd=conflicts">Active Conflicts</a>';
    newNode.cells[1].innerHTML = 'Score';
  }
  for (var i = 1; i <= conflictTable.rows.length - 4; i += 2) {
    var newRow = insertHere.insertRow(insertHere.rows.length - 2);
    newRow.insertCell(0);
    newRow.insertCell(0);
    newRow.cells[0].innerHTML = conflictTable.rows[i].cells[0].innerHTML;
    newRow.cells[1].innerHTML = '<b>' + conflictTable.rows[i].cells[6]
      .innerHTML + '</b>';
  }
}

function activeConflicts(doc, curPage, insertHere) { // Legacy
  var conflictTable = system.findNode(
    '//font[contains(.,"Participants")]/ancestor::table[1]', doc);
  if (conflictTable && conflictTable.rows.length > 3) {
    hazConflict(conflictTable, curPage, insertHere);
  }
}

function gotConflictInfo(responseText, callback) { // Legacy
  var doc = system.createDocument(responseText);
  var page = system.findNode('//td[contains(.,"Page:")]', doc);
  var curPage = parseInt(system.findNode('//input[@name="page"]',
    doc).value, 10);
  var maxPage = page.innerHTML.match(/of&nbsp;(\d*)/);
  activeConflicts(doc, curPage, callback.node);
  if (maxPage && parseInt(maxPage[1], 10) > curPage) {
    system.xmlhttp(
      'index.php?cmd=guild&subcmd=conflicts&subcmd2=&page=' +
      (curPage + 1) + '&search_text=',
      gotConflictInfo,
      {node: callback.node});
  }
}

function conflictInfo() { // jQuery
  retryAjax('index.php?cmd=guild&subcmd=conflicts').done(function(data) {
    gotConflictInfo(data,
      {node: document.getElementById('statisticsControl')});
  });
}

function logoToggle() {
  var changeLogoCell = leftHandSideColumnTable.rows[0].cells[1].firstChild;
  changeLogoCell.insertAdjacentHTML('beforeend', '[ <span class="fshLink' +
    ' tip-static" id="toggleGuildLogoControl" ' +
    'linkto="guildLogoControl" data-tipped="Toggle Section">X</span> ]');
  var guildLogoElement = leftHandSideColumnTable.rows[2].cells[0]
    .firstChild.nextSibling;
  guildLogoElement.id = 'guildLogoControl';
  if (system.getValue('guildLogoControl')) {
    guildLogoElement.classList.add('fshHide');
  }
  document.getElementById('toggleGuildLogoControl')
    .addEventListener('click', system.toggleVisibilty);
}

function statToggle() {
  var leaveGuildCell = leftHandSideColumnTable.rows[4].cells[1].firstChild;
  leaveGuildCell.insertAdjacentHTML('beforeend', '<span class="fshNoWrap">' +
    '[ <span class="fshLink tip-static" id="toggleStatisticsControl" ' +
    'linkto="statisticsControl" data-tipped="Toggle Section">X</span> ]' +
    '</span>');
  var statisticsControlElement = leftHandSideColumnTable.rows[6].cells[0]
    .firstChild.nextSibling;
  statisticsControlElement.id = 'statisticsControl';
  if (system.getValue('statisticsControl')) {
    statisticsControlElement.classList.add('fshHide');
  }
  document.getElementById('toggleStatisticsControl')
    .addEventListener('click', system.toggleVisibilty);
}

function structureToggle() {
  var buildCell = leftHandSideColumnTable.rows[15].cells[1].firstChild;
  buildCell.insertAdjacentHTML('beforeend', '[ <span class="fshLink ' +
    'tip-static" id="toggleGuildStructureControl" ' +
    'linkto="guildStructureControl" data-tipped="Toggle Section">X</span> ]');
  var guildStructureControlElement = leftHandSideColumnTable.rows[17]
    .cells[0].firstChild.nextSibling;
  guildStructureControlElement.id = 'guildStructureControl';
  if (system.getValue('guildStructureControl')) {
    guildStructureControlElement.classList.add('fshHide');
  }
  document.getElementById('toggleGuildStructureControl')
    .addEventListener('click', system.toggleVisibilty);
}

function batchBuffLinks() {
  var limit = performance.now() + 5;
  while (performance.now() < limit && memCount < members.length) {
    members[memCount].parentNode.insertAdjacentHTML('beforeend',
      ' <span class="smallLink">[b]</span>');
    memCount += 1;
  }
  if (memCount < members.length) {
    add(3, batchBuffLinks);
  }
}

function buffLinks() {
  // TODO preference
  memCount = 0;
  members = document.querySelectorAll(
    '#pCC a[href^="index.php?cmd=profile&player_id="]');
  add(3, batchBuffLinks);
  layout.pCC.addEventListener('click', function(evt) {
    if (evt.target.className !== 'smallLink') {return;}
    layout.openQuickBuffByName(evt.target.previousElementSibling.text);
  });
}

function selfRecallLink() {
  // self recall
  var getLi = leftHandSideColumnTable.getElementsByTagName('LI');
  var selfRecall = getLi[getLi.length - 1].parentNode;
  selfRecall.insertAdjacentHTML('beforeend',
    '<li><a href="index.php?cmd=guild&subcmd=inventory&subcmd2=report&' +
    'user=' + layout.playerName() +
    '" class="tip-static" data-tipped="Self Recall">Self Recall</a></li>');
}

export default function injectGuild() {
  add(3, layout.colouredDots);
  add(3, guildUtils.removeGuildAvyImgBorder);
  add(3, guildUtils.guildXPLock);
  leftHandSideColumnTable = layout.pCC
    .lastElementChild.rows[2].cells[0].firstElementChild;
  add(3, logoToggle);
  add(3, statToggle);
  add(3, structureToggle);
  add(3, buffLinks);
  add(3, selfRecallLink);

  // Detailed conflict information
  if (system.getValue('detailedConflictInfo')) {
    add(3, conflictInfo);
  }

}
