import * as ajax from '../support/ajax';

function gotMoves(arena) { // jQuery
  arena = arena || {};
  arena.moves = {};
  var arenaMoves = $('#pCC img[vspace="4"]').slice(1);
  arenaMoves.each(function() {
    var self = $(this);
    var src = self.attr('src');
    var moveId = /(\d+)\.gif/.exec(src)[1];
    arena.moves[moveId] = {};
    arena.moves[moveId].count = /(\d)$/.exec(self.closest('td').html())[1] * 1;
    arena.moves[moveId].href = src;
  });
  ajax.setForage('fsh_arena', arena);
}

export function storeMoves() { // jQuery.min
  ajax.getForage('fsh_arena').done(gotMoves);
}