/*
Based on
fiddle.jshell.net/GRIFFnDOOR/r7tvg/
*/

var heap = [null];

function cmp(i, j) {
  return heap[i] && heap[i].priority < heap[j].priority;
}

function swp(i, j) {
  var temp = heap[i];
  heap[i] = heap[j];
  heap[j] = temp;
}

function calcChildIndex(leftHigher, i) {
  if (leftHigher) {return i * 2;}
  return i * 2 + 1;
}

function sink(j) {
  var i = j;
  while (i * 2 < heap.length) {
    var leftHigher = !cmp(i * 2 + 1, i * 2);
    var childIndex = calcChildIndex(leftHigher, i);
    if (cmp(i, childIndex)) {break;}
    swp(i, childIndex);
    i = childIndex;
  }
}

function bubble(j) {
  var i = j;
  while (i > 1) {
    /* jshint -W016 */
    // eslint-disable-next-line no-bitwise
    var parentIndex = i >> 1;
    /* jshint +W016 */
    if (!cmp(i, parentIndex)) {break;}
    swp(i, parentIndex);
    i = parentIndex;
  }
}

export function pop() {
  if (heap.length === 1) {return;}
  var topVal = heap[1].data;
  var last = heap.pop();
  if (heap.length > 1) {
    heap[1] = last;
    sink(1);
  }
  return topVal;
}

export function push(data, priority) {
  bubble(heap.push({data: data, priority: priority}) - 1);
}

export function getLength() {
  return heap.length - 1;
}
