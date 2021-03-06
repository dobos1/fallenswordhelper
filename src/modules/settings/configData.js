import bountyPrefs from './bountyPrefs';
import calf from '../support/calf';
import equipPrefs from './equipPrefs';
import generalPrefs from './generalPrefs';
import guildPrefs from './guildPrefs';
import logPrefs from './logPrefs';
import otherPrefs from './otherPrefs';
import profilePrefs from './profilePrefs';
import questPrefs from './questPrefs';
import * as system from '../support/system';
import * as world from './worldPrefs';

export default function setupConfigData() {
  calf.configData =
    '<form><table id="fshSettingsTable">' +
    '<thead><th colspan="2"><b>Fallen Sword Helper configuration ' +
      'Settings</b></th></thead>' +
    '<tr><td align=center><input id="fshClearStorage" type="button" ' +
      'class="awesome magenta tip-static" value="Clear Storage" ' +
      'data-tipped="<span class=\'fshHelpTitle\'>Clear Storage' +
      '</span><br><br>This will clear all localStorage related to ' +
      'fallensword.com<br>It will reset all your Helper settings to ' +
      'defaults<br>Use it if your storage has overflowed or become ' +
      'corrupt"></td><td align=center>' +
      '<span style="font-size:x-small">(Current version: ' +
      FSH.version + '(' + FSH.calf + ')) (Storage Used: ' +
      calf.storage + '% Remaining: ' +
      (100 - calf.storage).toFixed(2) + '%)</span></td></tr>' +
    '<tr><td colspan="2" align=center>' +
      '<span style="font-weight:bold;">Visit the ' +
      '<a href="https://github.com/fallenswordhelper/fallenswordhelper">' +
      'Fallen Sword Helper web site</a> ' +
      'for any suggestions, requests or bug reports</span></td></tr>' +

    // General Prefs
    generalPrefs() +

    // Guild Manage
    guildPrefs() +

    // World Screen
    world.prefs() +

    // Log screen prefs
    logPrefs() +

    // Equipment screen prefs
    equipPrefs() +

    // Quest Preferences
    questPrefs() +

    // profile prefs
    profilePrefs() +

    // Bounty hunting prefs
    bountyPrefs() +

    // Other prefs
    otherPrefs() +

    // save button
    // http://www.fallensword.com/index.php?cmd=notepad&blank=1&subcmd=savesettings
    '<tr><td colspan="2" align=center><input type="button" class=' +
      '"custombutton" value="Save" id="Helper:SaveOptions"></td></tr>' +
    '<tr><td colspan="2" align=center><a href="' + system.server +
      'index.php?cmd=notepad&blank=1&subcmd=savesettings">Export or Load ' +
      'Settings!</a></td></tr>' +
    '<tr><td colspan="2" align=center>' +
      '<span style="font-size:xx-small">Fallen Sword Helper was coded by ' +
      '<a href="' + system.server +
      'index.php?cmd=profile&player_id=1393340">Coccinella</a>, ' +
      '<a href="' + system.server +
      'index.php?cmd=profile&player_id=1599987">yuuzhan</a>, ' +
      '<a href="' + system.server +
      'index.php?cmd=profile&player_id=1963510">PointyHair</a>, ' +
      '<a href="' + system.server +
      'index.php?cmd=profile&player_id=1346893">Tangtop</a>, ' +
      '<a href="' + system.server +
      'index.php?cmd=profile&player_id=2536682">dkwizard</a>, ' +
      '<a href="' + system.server +
      'index.php?cmd=profile&player_id=1570854">jesiegel</a>, ' +
      '<a href="' + system.server +
      'index.php?cmd=profile&player_id=2156859">ByteBoy</a>, and ' +
      '<a href="' + system.server +
      'index.php?cmd=profile&player_id=2169401">McBush</a>, ' +
      'with valuable contributions by ' +
      '<a href="' + system.server +
      'index.php?cmd=profile&player_id=524660">Nabalac</a>, ' +
      '<a href="' + system.server +
      'index.php?cmd=profile&player_id=37905">Ananasii</a></span></td></tr>' +
    '</table></form>';
}
