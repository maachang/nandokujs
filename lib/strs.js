// 文字列系ユーティリティ.
//

module.exports = (function (_g) {
  'use strict';
  var o = {};
  var _u = undefined;

  // UTF8文字列を、通常バイナリ(配列)に変換.
  o.utf8ToBinary = function( n,off,len ) {
    var lst = [] ;
    var cnt = 0 ;
    var c ;
    len += off ;
    for( var i = off ; i < len ; i ++ ) {
      c = n.charCodeAt(i)|0;
      if (c < 128) {
        lst[cnt++] = c|0 ;
      }
      else if ((c > 127) && (c < 2048)) {
        lst[cnt++] = (c >> 6) | 192 ;
        lst[cnt++] = (c & 63) | 128 ;
      }
      else {
        lst[cnt++] = (c >> 12) | 224 ;
        lst[cnt++] = ((c >> 6) & 63) | 128 ;
        lst[cnt++] = (c & 63) | 128 ;
      }
    }
    return lst ;
  }

  // バイナリ(配列)をUTF8文字列に変換.
  o.binaryToUTF8 = function( n,off,len ) {
    var c ;
    var ret = "" ;
    len += off ;
    for( var i = off ; i < len ; i ++ ) {
      c = n[i] & 255;
      if (c < 128) {
        ret += String.fromCharCode(c);
      }
      else if ((c > 191) && (c < 224)) {
        ret += String.fromCharCode(((c & 31) << 6) |
          ((n[i+1] & 255) & 63));
        i += 1;
      }
      else {
        ret += String.fromCharCode(((c & 15) << 12) |
          (((n[i+1] & 255) & 63) << 6) |
          ((n[i+2] & 255) & 63));
        i += 2;
      }
    }
    return ret ;
  }

  // 文字列を置き換える.
  o.changeString = function(base, src, dest) {
    base = "" + base;
    src = "" + src;
    dest = "" + dest;
    var old = base;
    var val = base;
    while (true) {
      val = val.replace(src,dest);
      if (old == val) {
        return val;
      }
      old = val;
    }
  }

  return o;
})(global);