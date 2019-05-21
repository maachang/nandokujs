// js-cipherクライアント.
// ブラウザ側で動く処理、これをbase64変換して、jsコードに埋め込みます.
//
// _kk : jsCodeを解凍するキーコードを設定します.
// _js : 実行するJSコードを設定します.
// _tc : 割符コード.この値が正しくないと、キーコードは復元されません.
//             [未設定の場合は、割符コードは設定しません]

// nodeで以下の処理を行います.
//
// http://refresh-sf.com/
// で、jsを圧縮、ファイル名をclient.min.jsで保存.
//

var _u = undefined;

// CustomBase64.
var CBase64 = (function() {
  var o = {};
  var EQ = '=';
  var ENC_CD = "0123456789+abcdefghijklmnopqrstuvwxyz/ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var DEC_CD = (function() {
    var src = ENC_CD;
    var ret = {};
    var len = src.length;
    for(var i = 0; i < len; i ++) {
      ret[src[i]] = i;
    }
    return ret;
  })();
  o.encode = function(bin) {
    var i, j, k;
    var allLen = allLen = bin.length ;
    var etc = (allLen % 3)|0;
    var len = (allLen / 3)|0;
    var ary = new Array((len * 4) + ((etc != 0) ? 4 : 0));
    for (i = 0, j = 0, k = 0; i < len; i++, j += 3, k += 4) {
      ary[k] = ENC_CD[((bin[j] & 0x000000fc) >> 2)];
      ary[k + 1] = ENC_CD[(((bin[j] & 0x00000003) << 4) | ((bin[j+1] & 0x000000f0) >> 4))];
      ary[k + 2] = ENC_CD[(((bin[j+1] & 0x0000000f) << 2) | ((bin[j+2] & 0x000000c0) >> 6))];
      ary[k + 3] = ENC_CD[(bin[j+2] & 0x0000003f)];
    }
    switch (etc) {
    case 1:
      j = len * 3;
      k = len * 4;
      ary[k] = ENC_CD[((bin[j] & 0x000000fc) >> 2)];
      ary[k + 1] = ENC_CD[((bin[j] & 0x00000003) << 4)];
      ary[k + 2] = EQ;
      ary[k + 3] = EQ;
      break;
    case 2:
      j = len * 3;
      k = len * 4;
      ary[k] = ENC_CD[((bin[j] & 0x000000fc) >> 2)];
      ary[k + 1] = ENC_CD[(((bin[j] & 0x00000003) << 4) | ((bin[j+1] & 0x000000f0) >> 4))];
      ary[k + 2] = ENC_CD[(((bin[j+1] & 0x0000000f) << 2))];
      ary[k + 3] = EQ;
      break;
    }
    return ary.join('');
  }
  o.decode = function(base64) {
    var i, j, k;
    var allLen = base64.length ;
    var etc = 0 ;
    for (i = allLen - 1; i >= 0; i--) {
      if (base64.charAt(i) == EQ) {
        etc++;
      } else {
        break;
      }
    }
    var len = (allLen / 4)|0;
    var ret = new Uint8Array((len * 3) - etc);
    len -= 1;
    for (i = 0, j = 0, k = 0; i < len; i++, j += 4, k += 3) {
      ret[k] = (((DEC_CD[base64[j]] & 0x0000003f) << 2) | ((DEC_CD[base64[j+1]] & 0x00000030) >> 4));
      ret[k + 1] = (((DEC_CD[base64[j+1]] & 0x0000000f) << 4) | ((DEC_CD[base64[j+2]] & 0x0000003c) >> 2));
      ret[k + 2] = (((DEC_CD[base64[j+2]] & 0x00000003) << 6) | (DEC_CD[base64[j+3]] & 0x0000003f));
    }
    switch (etc) {
    case 0:
      j = len * 4;
      k = len * 3;
      ret[k] = (((DEC_CD[base64[j]] & 0x0000003f) << 2) | ((DEC_CD[base64[j+1]] & 0x00000030) >> 4));
      ret[k + 1] = (((DEC_CD[base64[j+1]] & 0x0000000f) << 4) | ((DEC_CD[base64[j+2]] & 0x0000003c) >> 2));
      ret[k + 2] = (((DEC_CD[base64[j+2]] & 0x00000003) << 6) | (DEC_CD[base64[j+3]] & 0x0000003f));
      break;
    case 1:
      j = len * 4;
      k = len * 3;
      ret[k] = (((DEC_CD[base64[j]] & 0x0000003f) << 2) | ((DEC_CD[base64[j+1]] & 0x00000030) >> 4));
      ret[k + 1] = (((DEC_CD[base64[j+1]] & 0x0000000f) << 4) | ((DEC_CD[base64[j+2]] & 0x0000003c) >> 2));
      break;
    case 2:
      j = len * 4;
      k = len * 3;
      ret[k] = (((DEC_CD[base64[j]] & 0x0000003f) << 2) | ((DEC_CD[base64[j+1]] & 0x00000030) >> 4));
      break;
    }
    return ret;
  }
  return o;
})();

// 指定文字の数を取得.
var _targetCharCount = function(off,src,value) {
  var ret = 0;
  var p;
  while ((p = src.indexOf(value,off)) != -1) {
    ret ++;
    off = p + value.length;
  }
  return ret;
}

// 数値チェック.
// num : チェック対象の情報を設定します.
// 戻り値 : [true]の場合、文字列情報です.
var _isNumeric = (function() {
  var _IS_NUMERIC_REG = /[^0-9.0-9]/g;
  return function(num){
    var n = "" + num;
    if (num == null || num == _u) {
      return false;
    } else if(typeof(num) == "number") {
      return true;
    } else if(n.indexOf("-") == 0) {
      n = n.substring(1);
    }
    return !(n.length == 0 || n.match(_IS_NUMERIC_REG)) && !(_targetCharCount(0,n,".")>1);
  }
})();

// UTF8文字列を、通常バイナリ(配列)に変換.
var _utf8ToBinary = function( n,off,len ) {
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
var _binaryToUTF8 = function( n,off,len ) {
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

// xor128演算乱数装置.
var _Xor128 = function(seet) {
  var r = {v:{a:123456789,b:362436069,c:521288629,d:88675123}};
  
  // シートセット.
  r.setSeet = function(s) {
    if (_isNumeric(s)) {
      var n = this.v;
      s = s|0;
      n.a=s=1812433253*(s^(s>>30))+1;
      n.b=s=1812433253*(s^(s>>30))+2;
      n.c=s=1812433253*(s^(s>>30))+3;
      n.d=s=1812433253*(s^(s>>30))+4;
    }
  }
  
  // 乱数取得.
  r.next = function() {
    var n = this.v;
    var t=n.a;
    var r=t;
    t = ( t << 11 );
    t = ( t ^ r );
    r = t;
    r = ( r >> 8 );
    t = ( t ^ r );
    r = n.b;
    n.a = r;
    r = n.c;
    n.b = r;
    r = n.d;
    n.c = r;
    t = ( t ^ r );
    r = ( r >> 19 );
    r = ( r ^ t );
    n.d = r;
    return r;
  }
  r.nextInt = function() {
    return this.next();
  }
  r.setSeet(seet) ;
  return r;
}

// 256フリップ.
var _flip = function(pause, step) {
  switch (step & 0x00000007) {
  case 1:
    return ((((pause & 0x00000003) << 6) & 0x000000c0) | (((pause & 0x000000fc) >> 2) & 0x0000003f)) & 0x000000ff ;
  case 2:
    return ((((pause & 0x0000003f) << 2) & 0x000000fc) | (((pause & 0x000000c0) >> 6) & 0x00000003)) & 0x000000ff ;
  case 3:
    return ((((pause & 0x00000001) << 7) & 0x00000080) | (((pause & 0x000000fe) >> 1) & 0x0000007f)) & 0x000000ff ;
  case 4:
    return ((((pause & 0x0000000f) << 4) & 0x000000f0) | (((pause & 0x000000f0) >> 4) & 0x0000000f)) & 0x000000ff ;
  case 5:
    return ((((pause & 0x0000007f) << 1) & 0x000000fe) | (((pause & 0x00000080) >> 7) & 0x00000001)) & 0x000000ff ;
  case 6:
    return ((((pause & 0x00000007) << 5) & 0x000000e0) | (((pause & 0x000000f8) >> 3) & 0x0000001f)) & 0x000000ff ;
  case 7:
    return ((((pause & 0x0000001f) << 3) & 0x000000f8) | (((pause & 0x000000e0) >> 5) & 0x00000007)) & 0x000000ff ;
  }
  return pause & 0x000000ff ;
}

// 256notフリップ.
var _nflip = function(pause, step) {
  switch (step & 0x00000007) {
  case 1:
    return ((((pause & 0x0000003f) << 2) & 0x000000fc) | (((pause & 0x000000c0) >> 6) & 0x00000003)) & 0x000000ff ;
  case 2:
    return ((((pause & 0x00000003) << 6) & 0x000000c0) | (((pause & 0x000000fc) >> 2) & 0x0000003f)) & 0x000000ff ;
  case 3:
    return ((((pause & 0x0000007f) << 1) & 0x000000fe) | (((pause & 0x00000080) >> 7) & 0x00000001)) & 0x000000ff ;
  case 4:
    return ((((pause & 0x0000000f) << 4) & 0x000000f0) | (((pause & 0x000000f0) >> 4) & 0x0000000f)) & 0x000000ff ;
  case 5:
    return ((((pause & 0x00000001) << 7) & 0x00000080) | (((pause & 0x000000fe) >> 1) & 0x0000007f)) & 0x000000ff ;
  case 6:
    return ((((pause & 0x0000001f) << 3) & 0x000000f8) | (((pause & 0x000000e0) >> 5) & 0x00000007)) & 0x000000ff ;
  case 7:
    return ((((pause & 0x00000007) << 5) & 0x000000e0) | (((pause & 0x000000f8) >> 3) & 0x0000001f)) & 0x000000ff ;
  }
  return pause & 0x000000ff ;
}

// ゼロサプレス.
var _z2 = function(n) {
  return "00".substring(n.length) + n;
}

// 16バイトデータ(4バイト配列４つ)をUUIDに変換.
// UUIDに変換.
var _byte16ToUUID = function(n) {
  var a = n[0];
  var b = n[1];
  var c = n[2];
  var d = n[3];

  return _z2((((a & 0xff000000) >> 24) & 0x00ff).toString(16)) +
    _z2(((a & 0x00ff0000) >> 16).toString(16)) +
    _z2(((a & 0x0000ff00) >> 8).toString(16)) +
    _z2(((a & 0x000000ff)).toString(16)) +
    "-" +
    _z2((((b & 0xff000000) >> 24) & 0x00ff).toString(16)) +
    _z2(((b & 0x00ff0000) >> 16).toString(16)) +
    "-" +
    _z2(((b & 0x0000ff00) >> 8).toString(16)) +
    _z2(((b & 0x000000ff)).toString(16)) +
    "-" +
    _z2((((c & 0xff000000) >> 24) & 0x00ff).toString(16)) +
    _z2(((c & 0x00ff0000) >> 16).toString(16)) +
    "-" +
    _z2(((c & 0x0000ff00) >> 8).toString(16)) +
    _z2(((c & 0x000000ff)).toString(16)) +
    _z2((((d & 0xff000000) >> 24) & 0x00ff).toString(16)) +
    _z2(((d & 0x00ff0000) >> 16).toString(16)) +
    _z2(((d & 0x0000ff00) >> 8).toString(16)) +
    _z2(((d & 0x000000ff)).toString(16));
}

// ハッシュ計算.
var fhash = function(code, uuidFlg) {
  var o = null;
  var n = [0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xCA62C1D6];
  if(typeof(code) == "string") {
    code = _utf8ToBinary(code, 0, code.length);
  }
  var len = code.length;
  for(var i = 0; i < len; i ++) {
    o = (code[i] & 0x000000ff);
    if((o & 1) == 1) {
      o = _flip(o, o);
    } else {
      o = _nflip(o, o);
    }
    if((i & 1) == 1) {
      n[0] = n[0] + o;
      n[1] = n[1] - (o << 8);
      n[2] = n[2] + (o << 16);
      n[3] = n[3] - (o << 24);
      n[3] = n[3] ^ (o);
      n[2] = n[2] ^ (o << 8);
      n[1] = n[1] ^ (o << 16);
      n[0] = n[0] ^ (o << 24);
      n[0] = (n[3]+1) + (n[0]);
      n[1] = (n[2]-1) + (n[1]);
      n[2] = (n[1]+1) + (n[2]);
      n[3] = (n[0]-1) + (n[3]);
    } else {
      n[3] = n[3] + o;
      n[2] = n[2] - (o << 8);
      n[1] = n[1] + (o << 16);
      n[0] = n[0] - (o << 24);
      n[0] = n[0] ^ (o);
      n[1] = n[1] ^ (o << 8);
      n[2] = n[2] ^ (o << 16);
      n[3] = n[3] ^ (o << 24);
      n[0] = (n[3]+1) - (n[0]);
      n[1] = (n[2]-1) - (n[1]);
      n[2] = (n[1]+1) - (n[2]);
      n[3] = (n[0]-1) - (n[3]);
    }
    n[3] = (n[0]+1) ^ (~n[3]);
    n[2] = (n[1]-1) ^ (~n[2]);
    n[1] = (n[2]+1) ^ (~n[1]);
    n[0] = (n[3]-1) ^ (~n[0]);
  }

  // UUIDで返却.
  if(uuidFlg != false) {
    return _byte16ToUUID(n);
  }
  // バイナリで返却.
  return [
    (n[0] & 0x000000ff),
    ((n[0] & 0x0000ff00) >> 8),
    ((n[0] & 0x00ff0000) >> 16),
    (((n[0] & 0xff000000) >> 24) & 0x00ff),
    (n[1] & 0x000000ff),
    ((n[1] & 0x0000ff00) >> 8),
    ((n[1] & 0x00ff0000) >> 16),
    (((n[1] & 0xff000000) >> 24) & 0x00ff),  
    (n[2] & 0x000000ff),
    ((n[2] & 0x0000ff00) >> 8),
    ((n[2] & 0x00ff0000) >> 16),
    (((n[2] & 0xff000000) >> 24) & 0x00ff),  
    (n[3] & 0x000000ff),
    ((n[3] & 0x0000ff00) >> 8),
    ((n[3] & 0x00ff0000) >> 16),
    (((n[3] & 0xff000000) >> 24) & 0x00ff)
  ]
}

// 割符コード.
var tally = (function() {
  var _CODE = [59, 95, 36, 58, 37, 47, 38, 46, 61, 42, 44, 45, 126, 35, 94, 64];
  var _HEAD = 64;
  var _CHECK = 33;
  var _APPEND_CHECK = 124;
  var rand = _Xor128(new Date().getTime()+1) ;
  (function(){
    var n = "";
    var _x = function(a) {return String.fromCharCode(a);}
    for(var i = 0;i < _CODE.length; i ++) n += _x(_CODE[i]);
    _CODE = n;
    _HEAD = _x(_HEAD);
    _CHECK = _x(_CHECK);
    _APPEND_CHECK = _x(_APPEND_CHECK);
  })();
  var o = {};
  
  // エンコード.
  o.enc = function(value, check) {
    if(typeof(check) == "string" && check.length > 0) {
      value += _CHECK + fhash(check);
    }
    value = _utf8ToBinary(value, 0, value.length) ;  
    var i,j,n,m,c,t ;
    var len = value.length ;
    var allLen = ( len << 1 ) + 2 ;
    var v = new Array( allLen ) ;
    
    m = 255 ;
    v[ 0 ] = rand.nextInt() & m ;
    
    for( var i = 0 ; i < len ; i ++ ) {
        v[ 1 + ( i << 1 ) ] = value[ i ] ;
        v[ 2 + ( i << 1 ) ] = rand.nextInt() & m ;
    }
      v[ allLen-1 ] = rand.nextInt() & m ;
      
      len = allLen - 1 ;
      for( i = 0,t = 0 ; i < len ; i += 2 ) {
        n = v[ i ] ;
        if( ( t ++ ) & 1 == 0 ) {
          n = ~n ;
        }
        for( j = i+1 ; j < len ; j += 2 ) {
          v[ j ] = ( v[ j ] ^ n ) & m ;
        }
      }
      n = v[ 0 ] ;
      for( i = 1 ; i < len ; i ++ ) {
        v[ i ] = ( ( i & 1 == 0 ) ?
          v[ i ] ^ n :
          v[ i ] ^ (~n) )
          & m ;
      }
      n = v[ len ] ;
      for( i = len-1 ; i >= 0 ; i -- ) {
        v[ i ] = ( ( i & 1 == 0 ) ?
          v[ i ] ^ (~n) :
          v[ i ] ^ n )
          & m ;
      }
      c = _CODE ;
      var buf = "";
      for( i = 0 ; i < allLen ; i ++ ) {
        n = v[ i ] ;
        for( j = 0 ; j < 2 ; j ++ ) {
          buf += ( c.charAt( ( n & ( 0x0f << ( j << 2 ) ) ) >> ( j << 2 ) ) ) ;
        }
      }
      if(typeof(check) == "string" && check.length > 0) {
        return _HEAD + buf + _APPEND_CHECK;
      }
      return _HEAD + buf;
  }
  
  // デコード.
  o.dec = function( value,check ) {
    var useCheck = false;
    var ret = null;
    try {
      if( !(typeof(value) == "string" && value.length > 0) ||
        value.charAt( 0 ) != _HEAD ||
        value.length & 1 == 0 ) {
        return null ;
      }
      if(value[value.length-1] == _APPEND_CHECK) {
        useCheck = true;
        value = value.substring(0,value.length-1);
      }
      var i,j,k,a,b,c,m,n,t ;
      var len = value.length ;
      var v = new Array( (len-1) >> 1 ) ;
      m = 255 ;
      c = _CODE ;
      for( i = 1,k = 0 ; i < len ; i += 2 ) {
        a = c.indexOf( value.charAt( i ) ) ;
        b = c.indexOf( value.charAt( i+1 ) ) ;
        if( a == -1 || b == -1 ) {
          return null ;
        }
        v[ k ++ ] = ( a | ( b << 4 ) ) & m ;
      }
      len = v.length - 1 ;
      n = v[ len ] ;
      for( i = len-1 ; i >= 0 ; i -- ) {
        v[ i ] = ( ( i & 1 == 0 ) ?
          v[ i ] ^ (~n) :
          v[ i ] ^ n )
          & m ;
      }
      n = v[ 0 ] ;
      for( i = 1 ; i < len ; i ++ ) {
        v[ i ] = ( ( i & 1 == 0 ) ?
          v[ i ] ^ n :
          v[ i ] ^ (~n) )
          & m ;
      }
      for( i = 0,t = 0 ; i < len ; i += 2 ) {
        n = v[ i ] ;
        if( ( t ++ ) & 1 == 0 ) {
          n = ~n ;
        }
        for( j = i+1 ; j < len ; j += 2 ) {
          v[ j ] = ( v[ j ] ^ n ) & m ;
        }
      }
      var cnt = 0 ;
      var vv = new Array( (len>>1)-1 ) ;
      for( i = 1 ; i < len ; i += 2 ) {
        vv[ cnt++ ] = v[ i ] ;
      }
      ret = _binaryToUTF8(vv, 0, vv.length) ;
    } catch(e) {
      throw new Error("Analysis failed.");
    }
    
    if(typeof(check) == "string" && check.length > 0) {
      check = fhash(check);
      var p = ret.lastIndexOf(_CHECK + check);
      if(p == -1 || (ret.length - p) != check.length + 1) {
        throw new Error("Check codes do not match.");
      }
      return ret.substring(0,ret.length-(check.length + 1));
    } else if(useCheck) {
      throw new Error("Analysis failed.");
    }
    return ret;
  }
  return o;
})();

// 簡易圧縮解凍.
var fcomp = (function() {
  var o = {} ;
  
  // Limit.
  var _LIMIT = 64 ;
  
  // Hashマスク値.
  var _HASH = 0x1e35a7bd ;
  
  // 連続左ゼロビット長を取得.
  var _nlzs = function( x ) {
    x |= ( x >>  1 );
    x |= ( x >>  2 );
    x |= ( x >>  4 );
    x |= ( x >>  8 );
    x |= ( x >> 16 );
    x = (x & 0x55555555) + (x >> 1 & 0x55555555);
    x = (x & 0x33333333) + (x >> 2 & 0x33333333);
    x = (x & 0x0f0f0f0f) + (x >> 4 & 0x0f0f0f0f);
    x = (x & 0x00ff00ff) + (x >> 8 & 0x00ff00ff);
    return (x & 0x0000ffff) + (x >>16 & 0x0000ffff);
  }
  
  // ビットサイズの取得.
  var _bitMask = function( x ) {
    x = x|0 ;
    if( x <= 256 ) {
      return 256 ;
    }
    x |= ( x >>  1 );
    x |= ( x >>  2 );
    x |= ( x >>  4 );
    x |= ( x >>  8 );
    x |= ( x >> 16 );
    x = (x & 0x55555555) + (x >> 1 & 0x55555555);
    x = (x & 0x33333333) + (x >> 2 & 0x33333333);
    x = (x & 0x0f0f0f0f) + (x >> 4 & 0x0f0f0f0f);
    x = (x & 0x00ff00ff) + (x >> 8 & 0x00ff00ff);
    x = (x & 0x0000ffff) + (x >>16 & 0x0000ffff);
    return 1 << ( ( (x & 0x0000ffff) + (x >>16 & 0x0000ffff) ) - 1 ) ;
  }
  
  // 配列コピー.
  var _arraycopy = function( s,sp,d,dp,aLen ) {
    aLen = aLen|0 ;
    sp = sp|0 ;
    dp = dp|0 ;
    for( var i = 0 ; i < aLen ; i ++ ) {
      d[dp+i] = s[sp+i] ;
    }
  }
  
  // 4バイト整数変換.
  var _byte4ToInt = function( s,p ) {
    return ((s[p]&255)<<24)|
      ((s[p+1]&255)<<16)|
      ((s[p+2]&255)<<8)|
      (s[p+3]&255) ;
  }
  
  // 圧縮に対するバッファ数を取得.
  // len 元のサイズを設定します.
  // 戻り値 : 圧縮時の最大バッファ長が返却されます.
  var _calcMaxCompressLength = function( len ) {
    len = len|0 ;
    return ( 32 + len + ( len / 6 ) )|0;
  }
  
  // 解凍対象のバッファ数を取得.
  // binary 圧縮バイナリを設定します.
  // off オフセットを設定します.
  // 戻り値 : 解凍対象のバッファサイズが返却されます.
  var _decompressLength = function( binary,off ) {
    off = off|0 ;
    var ret = 0 ;
    var i = 0 ;
    do {
      ret += (binary[off] & 0x7f) << (i++ * 7);
    } while ((binary[off++] & 0x80) == 0x80);
    return ret ;
  }
  
  // 圧縮処理(バイナリ).
  // out 圧縮結果のバイナリ配列を設定します.
  // src 対象のバイナリ配列を設定します.
  // off 対象のオフセット値を設定します.
  // len 対象の長さを設定します.
  // 戻り値 : 圧縮されたバッファ長が返却されます.
  var _comp = function( out,src,offset,length ) {
    offset = offset|0 ;
    length = length|0 ;
    
    var len,tLen,fp,n,i,cnt ;
    var len4 = length + 4 ;
    var lenM4 = length - 4 ;
    var offLenM4 = lenM4 + offset ;
    var offLen = offset + length ;
    var hOff = 0 ;
    var hLen = 0 ;
    
    // Hash衝突率を下げるためのヒントを設定.
    var hashShift = _nlzs( length ) ;
    if( hashShift > 16 ) {
      hashShift = 31-hashShift ;
    }
    
    // ヘッダに元の長さをセット.
    n = length;
    var outIndex = 0 ;
    while( n > 0 ) {
      out[outIndex++] = (n>=128) ? (0x80 | (n&0x7f)) : n & 255 ;
      n >>= 7;
    }
    
    // 圧縮用Hash条件を生成.
    var _msk = ( _bitMask( length / 6 ) ) - 1 ;
    var _cc = new Uint32Array( _msk+1 ) ;
    
    // 外部定義の最適化.
    var _hash = _HASH|0 ;
    var _limit = _LIMIT|0 ;
    var _b2i = _byte4ToInt ;
    var _ac = _arraycopy ;
    
    // 先頭４バイトの圧縮用Hash条件をセット.
    len = ( offLenM4 < offset + 4 ) ? offLenM4 : offset + 4 ;
    for(i = offset; i < len ;
      _cc[ ( ( _b2i(src,i) * _hash ) >> hashShift ) & _msk ] = i ++ ){};
    
    var lastHit = offset ;
    for( i = offset + 4; i < offLenM4 ; i ++ ) {
      
      // 圧縮条件が存在する場合.
      n = _b2i( src,i ) ;
      fp = _cc[ ( ( n * _hash ) >> hashShift ) & _msk ] ;
      if( n == _b2i( src,fp ) && fp + 4 < i && i + 4 < offLen ) {
        
        // limitまでの同一条件をチェック.
        hLen = 4 ;
        tLen = ( i + hLen + _limit < offLen ) ?
          ( ( fp + hLen + _limit < i ) ? _limit : i - ( fp + hLen ) ) :
          offLen - ( i + hLen ) ;
        for( ; hLen < tLen && (src[ fp + hLen ]&255) == (src[ i + hLen ]&255) ;
          hLen ++ ){};
        
        // 圧縮位置をセット.
        hOff = i - fp ;
        
        // 圧縮用Hash条件をセット.
        _cc[ ( ( n * _hash ) >> hashShift ) & _msk ] = i ;
        
      }
      // 圧縮条件が存在しない場合.
      else {
        
        // 圧縮用Hash条件をセット.
        _cc[ ( ( n * _hash ) >> hashShift ) & _msk ] = i ;
        
        // 圧縮処理なし.
        continue ;
      }
      
      // 非圧縮情報をセット.
      if( lastHit < i ) {
        
        // (3bit)ヘッド[0]をセット.
        if ( ( len = ( i - lastHit ) - 1 ) < 60) {
          
          // 非圧縮条件が60バイト未満の場合.
          out[outIndex++] = (len<<2);
        }
        else if (len < 0x100) {
          
          // 非圧縮条件が256バイト未満の場合.
          out[outIndex] = 240 ;
          out[outIndex+1] = len;
          outIndex += 2 ;
        }
        else if (len < 0x10000) {
          
          // 非圧縮条件が65536バイト未満の場合.
          out[outIndex] = 244 ;
          out[outIndex+1] = len;
          out[outIndex+2] = (len>>8);
          outIndex += 3 ;
        }
        else if (len < 0x1000000) {
          
          // 非圧縮条件が16777216バイト未満の場合.
          out[outIndex] = 248 ;
          out[outIndex+1] = len;
          out[outIndex+2] = (len>>8);
          out[outIndex+3] = (len>>16);
          outIndex += 4 ;
        }
        else {
          
          // 非圧縮条件が16777215バイト以上の場合.
          out[outIndex] = 252 ;
          out[outIndex+1] = len;
          out[outIndex+2] = (len>>8);
          out[outIndex+3] = (len>>16);
          out[outIndex+4] = (len>>24);
          outIndex += 5 ;
        }
        
        _ac(src, lastHit, out, outIndex, len + 1) ;
        outIndex += len + 1 ;
        lastHit = i ;
      }
      
      // 圧縮位置をセット.
      if(hLen <= 11 && hOff < 2048) {
        
        // (3bit)ヘッド[1]をセット.
        out[outIndex] = ( 1 | ((hLen-4)<<2) | ((hOff>>3)&0xe0) ) ;
        out[outIndex+1] = (hOff&255);
        outIndex += 2 ;
      }
      else if (hOff < 65536) {
        
        // (3bit)ヘッド[2]をセット.
        out[outIndex] = ( 2 | ((hLen-1)<<2) ) ;
        out[outIndex+1] = (hOff);
        out[outIndex+2] = (hOff>>8);
        outIndex += 3 ;
      }
      else {
        
        // (3bit)ヘッド[3]をセット.
        out[outIndex] = ( 3 | ((hLen-1)<<2) ) ;
        out[outIndex+1] = (hOff);
        out[outIndex+2] = (hOff>>8);
        out[outIndex+3] = (hOff>>16);
        out[outIndex+4] = (hOff>>24);
        outIndex += 5 ;
      }
      
      // 圧縮用Hash条件をセット.
      tLen = ( lastHit > offLenM4 ) ? offLenM4 : lastHit ;
      for( ; i < tLen;
        _cc[ ( ( _b2i(src,i) * _hash ) >> hashShift ) & _msk ] = i ++ ){};
      lastHit = i + hLen ;
      
      tLen = ( lastHit-1 > offLenM4 ) ? offLenM4 : lastHit-1 ;
      for( ; i < tLen;
        _cc[ ( ( _b2i(src,i) * _hash ) >> hashShift ) & _msk ] = i ++ ){};
      i = lastHit - 1 ;
    }
    
    // 終了時に非圧縮情報が存在する場合.
    if (lastHit < offLen) {
      
      // (3bit)ヘッド[0]をセット.
      if (( len = ( offLen - lastHit ) - 1 ) < 60) {
        out[outIndex++] = (len<<2);
      }
      // (3bit)ヘッド[1]をセット.
      else if (len < 0x100) {
        out[outIndex] = 240 ;
        out[outIndex+1] = len;
        outIndex += 2 ;
      }
      // (3bit)ヘッド[2]をセット.
      else if (len < 0x10000) {
        out[outIndex] = 244 ;
        out[outIndex+1] = len;
        out[outIndex+2] = (len>>8);
        outIndex += 3 ;
      }
      // (3bit)ヘッド[3]をセット.
      else if (len < 0x1000000) {
        out[outIndex] = 248 ;
        out[outIndex+1] = len;
        out[outIndex+2] = (len>>8);
        out[outIndex+3] = (len>>16);
        outIndex += 4 ;
      }
      // (3bit)ヘッド[4]をセット.
      else {
        out[outIndex] = 252 ;
        out[outIndex+1] = len;
        out[outIndex+2] = (len>>8);
        out[outIndex+3] = (len>>16);
        out[outIndex+4] = (len>>24);
        outIndex += 5 ;
      }
      _ac(src, lastHit, out, outIndex, len + 1);
      outIndex += len + 1 ;
    }
    return outIndex ;
  }
  
  // 解凍処理(バイナリ).
  // out 解凍先のバイナリを設定します.
  // src 圧縮バイナリを設定します.
  // offset 圧縮バイナリのオフセット値を設定します.
  // length 圧縮バイナリの長さを設定します.
  // 戻り値 : 解凍バイナリ長が返却されます.
  var _dec = function( out,src,offset,length ) {
    offset = offset|0 ;
    length = length|0 ;
    
    var p,c,bc,n,o ;
    var targetIndex = 0;
    var offLen = offset + length ;
    var sourceIndex = offset ;
    var targetLength = 0 ;
    var _ac = _arraycopy ;
    
    // 全体の長さを取得.
    p = 0 ;
    do {
      targetLength += (src[sourceIndex] & 0x7f) << (p++ * 7);
    } while ((src[sourceIndex++] & 0x80) == 0x80);
    
    while(sourceIndex < offLen && targetIndex < targetLength) {
      
      // 対象ブロック毎の処理.
      if( ( bc = src[sourceIndex] & 3 ) == 0 ) {
        
        // 非圧縮情報の取得.
        if( ( o = ( n = (src[sourceIndex++] >> 2) &
          0x3f ) - 60 ) > -1 ) {
          for( ++o,c = 1,n = (src[ sourceIndex ] & 255) ;
            c < o ;
            n |= ( src[ sourceIndex+c ] & 255 ) <<
              ( c ++ << 3 ) ){};
          sourceIndex += o ;
        }
        _ac(src, sourceIndex, out, targetIndex, ++n );
        sourceIndex += n ;
        targetIndex += n ;
      }
      else {
        
        // 圧縮情報の取得.
        switch( bc ) {
          case 1 :
            n = ( (src[sourceIndex] >> 2) & 0x7) + 4 ;
            o = ( (src[sourceIndex] & 0xe0) << 3 ) |
                ( src[sourceIndex+1] & 255 ) ;
            sourceIndex += 2 ;
            break ;
          case 2 :
            n = ( (src[sourceIndex] >> 2) & 0x3f) + 1 ;
            o = ( src[sourceIndex+1] & 255 ) |
                ( (src[sourceIndex+2] & 255) << 8 ) ;
            sourceIndex += 3 ;
            break ;
          case 3 :
            n = ((src[sourceIndex] >> 2) & 0x3f) + 1;
            o = ( src[sourceIndex+1] & 255 ) |
                ( (src[sourceIndex+2] & 255) << 8 ) |
                ( (src[sourceIndex+3] & 255) << 16 ) |
                ( (src[sourceIndex+4] & 255) << 24 ) ;
            sourceIndex += 5 ;
        }
        
        // 圧縮情報のセット.
        for( p = targetIndex - o,c = p + n ;
          p < c ;
          out[ targetIndex ++ ] = out[ p ++ ]&255 ){};
      }
    }
    
    // 処理範囲を超えている場合はエラー.
    if(targetIndex > targetLength) {
      throw new Error("Superfluous input data encountered on offset (index:" +
        targetIndex + " max:" + targetLength + ")") ;
    }
    return targetLength ;
  }
  
  // 圧縮処理.
  // src 圧縮対象の情報を設定します.
  // off 対象のオフセット値を設定します.
  // len 対象の長さを設定します.
  // 戻り値 : 圧縮された情報が返却されます.
  o.freeze = function( src,off,len ) {
    off = off|0 ;
    len = len|0 ;
    
    if( len == 0 ) {
      len = src.length ;
    }
    if( typeof( src ) == "string" ) {
      src = _utf8ToBinary( src,off,len ) ;
      off = 0 ;
      len = src.length ;
    }
    var out = new Uint8Array( _calcMaxCompressLength( len ) )
    var res = _comp( out,src,off,len ) ;
    var ret = new Uint8Array( res );
    _arraycopy( out,0,ret,0,res ) ;
    return ret ;
  }
  
  // 解凍処理.
  // src 解凍対象の情報を設定します.
  // off 対象のオフセット値を設定します.
  // len 対象の長さを設定します.
  // 戻り値 : 解凍された情報が返却されます.
  o.unfreeze = function( src,off,len ) {
    off = off|0 ;
    len = len|0 ;
    if( len == 0 ) {
      len = src.length ;
    }
    if( typeof( src ) == "string" ) {
      var t = [];
      for(var i = off; i < len; i ++) {
          t[t.length] = src.charCodeAt(i)|0;
      }
      src = t;
      off = 0 ;
      len = src.length ;
    }
    var ret = new Uint8Array( _decompressLength( src,off ) ) ;
    _dec( ret,src,off,len ) ;
    return ret ;
  }
  
  // 圧縮処理して文字列変換.
  // src 圧縮対象の情報を設定します.
  // off 対象のオフセット値を設定します.
  // len 対象の長さを設定します.
  // 戻り値 : 圧縮された情報が返却されます.
  o.freeze_s = function( src,off,len ) {
    var res = o.freeze(src,off,len);
    var len = res.length;
    var ret = "";
    for(var i = 0; i < len; i ++) {
      ret +=  String.fromCharCode(res[i]);
    }
    return ret;
  }
  
  // 解凍処理を行い、文字列変換.
  // src 解凍対象の情報を設定します.
  // off 対象のオフセット値を設定します.
  // len 対象の長さを設定します.
  // 戻り値 : 解凍された情報が返却されます.
  o.unfreeze_s = function( src,off,len ) {
    var ret = o.unfreeze(src,off,len);
    return _binaryToUTF8( ret,0,ret.length ) ;
  }
  
  return o ;
})();

// 暗号・複合処理.
var fcipher = {};
var _head = null;
var rand = _Xor128(new Date().getTime());

// ヘッダデータをセット.
fcipher.head = function(h) {
  _head = h;
}

// 指定文字列を保証するキーを生成.
fcipher.key = function(word, src) {
  if(src == _u || src == null) {
    src = "-l_l-u_f-s_m-";
  }
  var srcBin = code16(src, 1) ;
  var wordBin = code16(word, 1) ;
  var ret = srcBin.concat(wordBin) ;
  for( var i = 0 ; i < 16 ; i ++ ) {
      ret[ i ] = _convert( ret, i, wordBin[ i ] ) ;
  }
  for( var i = 15,j = 0 ; i >= 0 ; i --,j ++ ) {
      ret[ i+16 ] = _convert( ret, i+16, srcBin[ j ] ) ;
  }
  return ret ;
}

// エンコード.
fcipher.enc = function(value, pKey, head) {
  value = "" + value;
  return fcipher.benc(_utf8ToBinary(value, 0, value.length), pKey, head) ;
}

// バイナリエンコード.
fcipher.benc = function(bin, pKey, head) {
  head = head == null || head == _u ? ((_head == null) ? "" : _head) : head;
  // 第一引数がバイナリ.
  var pubKey = _randKey() ;
  var key32 = _convertKey(pKey, pubKey) ;
  var key256 = _key256(key32) ;
  key32 = null ;
  var stepNo = _getStepNo(pKey, bin) & 0x0000007f ;
  var nowStep = _convert256To(key256, pubKey, stepNo) ;
  _ed(true, bin, key256, nowStep) ;
  var eb = new Uint8Array(34+bin.length) ;
  eb[ 0 ] = rand.nextInt() & 0x000000ff;
  eb[ 1 ] = (~(stepNo^eb[ 0 ])) ;
  arraycopy(pubKey, 0, eb, 2, 32) ;
  arraycopy(bin, 0, eb, 34, bin.length) ;
  return head + CBase64.encode(eb);
}

// デコード.
fcipher.dec = function(value, pKey, head) {
  var value = fcipher.bdec(value, pKey, head);
  return _binaryToUTF8(value, 0, value) ;
}

// バイナリデコード.
fcipher.bdec = function(value, pKey, head) {
  head = head == null || head == _u ? ((_head == null) ? "" : _head) : head;
  var bin = CBase64.decode(value.substring(""+head.length));
  if( bin.length <= 34 ) {
    throw new Error("decode:Invalid binary length.") ;
  }
  var stepNo = ((~(bin[ 1 ]^bin[0]))&0x0000007f) ;
  var pubKey = new Uint8Array(32) ;
  arraycopy(bin, 2, pubKey, 0, 32) ;
  var bodyLen = bin.length - 34 ;
  var body = new Uint8Array(bodyLen) ;
  arraycopy(bin, 34, body, 0, bodyLen) ;
  bin = null ;
  var key32 = _convertKey(pKey, pubKey) ;
  var key256 = _key256(key32) ;
  key32 = null ;
  var nowStep = _convert256To(key256, pubKey, stepNo) ;
  _ed(false, body, key256, nowStep) ;
  var destStepNo = _getStepNo(pKey, body) & 0x0000007f;
  if( destStepNo != stepNo ) {
    throw new Error("decode:Decryption process failed.");
  }
  return body;
}

// ランダムキー生成.
var _randKey = function() {
  var bin = new Uint8Array(32) ;
  for( var i = 0 ; i < 32 ; i ++ ) {
    bin[ i ] = ( rand.next() & 0x000000ff ) ;
  }
  return bin ;
}

// コード16データを作成.
// s 処理対象情報.
// mode
//   1 : string
//   それ以外: 配列.
var code16 = function(s, mode) {
  var ret = mode == 1 ?
    [177, 75, 163, 143, 73, 49, 207, 40, 87, 41, 169, 91, 184, 67, 254, 89] :
    [87, 41, 169, 91, 184, 67, 254, 89, 177, 75, 163, 143, 73, 49, 207, 40] ;
  var n;
  var len = s.length;
  mode = mode|0;
  for(var i = 0; i < len; i ++) {
    n = (mode==1 ? s.charCodeAt(i)|0 : s[i]|0) & 0x00ffffff;
    if((i&0x00000001) == 0) {
      for(var j = 0; j < 16; j+= 2) {
        ret[j] = ret[j] ^ (n-(i+j));
      }
      for(var j = 1; j < 16; j+= 1) {
        ret[j] = ret[j] ^ ~(n-(i+j));
      }
    }
    else {
      for(var j = 1; j < 16; j+= 1) {
        ret[j] = ret[j] ^ (n-(i+j));
      }
      for(var j = 0; j < 16; j+= 2) {
        ret[j] = ret[j] ^ ~(n-(i+j));
      }
    }
  }
  for(var i = 0; i < 16; i++) {
    ret[i] = ret[i] & 0x000000ff;
  }
  return ret;
}

/// 変換処理.
var _convert = function(key, no, pause) {
  switch ((no & 0x00000001)) {
    case 0:
      return (((pause ^ key[no])) & 0x000000ff) ;
    case 1:
      return (~(pause ^ key[no]) & 0x000000ff) ;
  }
  return 0 ;
}

var _convertKey = function(pKey, key) {
  var low = code16(pKey,0);
  var hight = code16(key,0);
  var ret = new Uint8Array(32);
  for (var i = 0,j = 0,k = 15; i < 16; i++, j += 2, k--) {
    ret[j] = _convert(low, i, key[j]);
    ret[j + 1] = _convert(hight, i, low[k]);
  }
  return ret;
}

var _key256 = function(key32) {
  var ret = new Uint8Array( 256 ) ;
  var b = new Uint8Array( 4 ) ;
  var o ;
  var n = 0 ;
  var s,e ;
  for( var i = 0,j = 0 ; i < 31 ; i += 2,j += 16 ) {
    s = ( key32[i] & 0x000000ff ) ;
    e = ( key32[i+1] & 0x000000ff ) ;
    if( ( n & 0x00000001 ) != 0 ) {
      n += s ^ (~ e ) ;
    }
    else {
      n -= (~s) ^ e ;
    }
    b[0] = (n & 0x000000ff) ;
    b[1] = (((n & 0x0000ff00)>>8)&0x000000ff) ;
    b[2] = (((n & 0x00ff0000)>>16)&0x000000ff) ;
    b[3] = (((n & 0xff000000)>>24)&0x000000ff) ;
    o = code16(b,0) ;
    arraycopy( o,0,ret,j,16 ) ;
  }
  return ret ;
}

var _getStepNo = function(pubKey, binary) {
  var i, j;
  var bin;
  var ret = 0;
  var len = binary.length ;
  var addCd = (pubKey[(binary[len>>1] & 0x0000001f)] & 0x00000003) + 1;
  for (i = 0, j = 0; i < len; i += addCd, j += addCd) {
    bin = ((~binary[i]) & 0x000000ff);
    ret = ((bin & 0x00000001) + ((bin & 0x00000002) >> 1)
      + ((bin & 0x00000004) >> 2) + ((bin & 0x00000008) >> 3)
      + ((bin & 0x00000010) >> 4) + ((bin & 0x00000020) >> 5)
      + ((bin & 0x00000040) >> 6) + ((bin & 0x00000080) >> 7))
      + (j & 0x000000ff) + ret;
  }
  if ((ret & 0x00000001) == 0) {
    for (i = 0; i <32; i++) {
      bin = (((pubKey[i] & 0x00000001) == 0) ? ((~pubKey[i]) & 0x000000ff)
        : (pubKey[i] & 0x000000ff));
      ret += ((bin & 0x00000001) + ((bin & 0x00000002) >> 1)
        + ((bin & 0x00000004) >> 2) + ((bin & 0x00000008) >> 3)
        + ((bin & 0x00000010) >> 4) + ((bin & 0x00000020) >> 5)
        + ((bin & 0x00000040) >> 6) + ((bin & 0x00000080) >> 7));
    }
  } else {
    for (i = 0; i < 32; i++) {
      bin = (((pubKey[i] & 0x00000001) == 0) ? ((~pubKey[i]) & 0x000000ff)
        : (pubKey[i] & 0x000000ff));
      ret -= ((bin & 0x00000001) + ((bin & 0x00000002) >> 1)
        + ((bin & 0x00000004) >> 2) + ((bin & 0x00000008) >> 3)
        + ((bin & 0x00000010) >> 4) + ((bin & 0x00000020) >> 5)
        + ((bin & 0x00000040) >> 6) + ((bin & 0x00000080) >> 7));
    }
  }
  return ((~ret) & 0x000000ff);
}

var _convert256To = function(key256, pKey, step) {
  var ns = step ;
  for (var i = 0, j = 0; i < 256; i++, j = ((j + 1) & 0x0000001f)) {
    ns = (ns ^ (~(key256[i]))) ;
    if( (ns & 0x00000001 ) == 0 ) {
      ns = ~ns ;
    }
    key256[i] = _convert(pKey, j, key256[i]);
    key256[i] = _flip(key256[i], ns);
  }
  return ns;
}

var _ed = function(mode, binary, key256, step) {
  var len = binary.length ;
  var ns = step ;
  if( mode ) {
    for (var i = 0, j = 0; i < len; i++, j = ((j + 1) & 0x000000ff)) {
      ns = (ns ^ (~( key256[j]))) ;
      if( (ns & 0x00000001 ) != 0 ) {
        ns = ~ns ;
      }
      binary[i] = _convert(key256, j, binary[i]);
      binary[i] = _flip(binary[ i ], ns) ;
    }
  }
  else {
    for (var i = 0, j = 0; i < len; i++, j = ((j + 1) & 0x000000ff)) {
      ns = (ns ^ (~( key256[j]))) ;
      if( (ns & 0x00000001 ) != 0 ) {
        ns = ~ns ;
      }
      binary[i] = _nflip(binary[ i ], ns) ;
      binary[i] = _convert(key256, j, binary[i]);
    }
  }
}

var arraycopy = function(s, sp, d, dp, len) {
  len = len|0;
  sp = sp|0;
  dp = dp|0;
  for( var i = 0 ; i < len ; i ++ ) {
    d[(dp+i)] = s[(sp+i)] ;
  }
}

// 解凍キーを生成.
var key = fcipher.key(tally.dec(_kk, _tt), "fcipher.js");
_js = fcipher.bdec(_js, key, "_");
_js = fcomp.unfreeze_s(_js);

// JSコードを実行.
eval(_js);
