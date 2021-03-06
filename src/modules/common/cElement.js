export function mixin(obj, mixins) {
  Object.keys(mixins).forEach(function(key) {
    if (typeof mixins[key] === 'object' && mixins[key] !== null) {
      mixin(obj[key], mixins[key]);
    } else {
      obj[key] = mixins[key];
    }
  });
}

function cElement(type, props) {
  var el = document.createElement(type);
  if (props) {mixin(el, props);}
  return el;
}

export function createDiv(props) {
  return cElement('div', props);
}

export function createSpan(props) {
  return cElement('span', props);
}

export function createTable(props) {
  return cElement('table', props);
}

export function createTBody(props) {
  return cElement('tbody', props);
}

export function createTr(props) {
  return cElement('tr', props);
}

export function createTd(props) {
  return cElement('td', props);
}

export function createTFoot(props) {
  return cElement('tfoot', props);
}

export function createUl(props) {
  return cElement('ul', props);
}

export function createLi(props) {
  return cElement('li', props);
}

export function createButton(props) {
  return cElement('button', props);
}

export function createBr() {
  return cElement('br');
}

export function createAnchor(props) {
  return cElement('a', props);
}

export function createInput(props) {
  return cElement('input', props);
}
