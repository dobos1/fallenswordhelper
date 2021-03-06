import {createDiv} from '../common/cElement';
import * as system from '../support/system';

function updateHistoryCharacters() { // Legacy
  var textArea = system.findNode('//textarea[@id="textInputBox"]');
  var previewArea = system.findNode('//span[@findme="biopreview"]');
  var bioPreviewHTML = system.convertTextToHtml(textArea.value);
  previewArea.innerHTML = bioPreviewHTML;
}

export default function addHistoryWidgets() { // Legacy
  var textArea = system.findNode('//textarea[@name="history"]');
  if (!textArea) {return;}
  textArea.value = textArea.value.replace(/<br \/>/ig, '');
  var textAreaDiv = textArea.parentNode;
  var bioPreviewHTML = system.convertTextToHtml(textArea.value);
  var newDiv = createDiv({
    innerHTML: '<table align="center" width="325" border="1"><tbody>' +
    '<tr><td style="text-align:center;color:#7D2252;' +
    'background-color:#CD9E4B">Preview</td></tr>' +
    '<tr><td align="left" width="325"><span style="font-size:small;" ' +
    'findme="biopreview">' + bioPreviewHTML +
    '</span></td></tr></tbody></table>'
  });
  textAreaDiv.appendChild(newDiv);
  document.getElementById('textInputBox').addEventListener('keyup',
    updateHistoryCharacters);
}
