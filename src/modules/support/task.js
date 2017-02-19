import * as debug from './debug';
import * as sch from './sch';

var paused = true;
var message = 'fshMessage';

function taskRunner() {
  if (sch.getLength() === 0) {
    paused = true;
  } else {
    paused = false;
    window.postMessage(message, '*');
  }
}

export function add(priority, fn, args, scope) {
  //#if _DEV  //  Not sending args as Array
  if (args && !Array.isArray(args)) {
    console.log('addTask Array.isArray(args)', Array.isArray(args)); // DEV Only
  }
  //#endif
  if (typeof fn === 'function') {
    scope = scope || window;
    args = args || [];
    sch.push(fn.bind.apply(fn, [scope].concat(args)), priority);
    if (paused) {taskRunner();}
  }
}

function asyncTask() {
  try {
    sch.pop()();
  } catch (error) {
    debug.log('Unhandled Exception:', error);
    //#if _DEV  //  Unhandled Exception
    console.log('Unhandled Exception:', error); // DEV Only
    //#endif
  }
  taskRunner();
}

function callback(event) {
  var key = event.data;
  if (typeof key === 'string' && key.indexOf(message) === 0) {
    asyncTask();
  }
}

window.addEventListener('message', callback);