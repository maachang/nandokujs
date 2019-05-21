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
    if (s) {
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
var _z = function(n) {
  n = n.toString(16);
  return "00".substring(n.length) + n;
}

// ハッシュ計算.
var fhash = function(code) {
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
  var a = n[0];
  var b = n[1];
  var c = n[2];
  var d = n[3];
  return _z(((a & 0xff000000) >> 24) & 0x00ff) +
    _z((a & 0x00ff0000) >> 16) +
    _z((a & 0x0000ff00) >> 8) +
    _z(a & 0x000000ff) +
    "-" +
    _z(((b & 0xff000000) >> 24) & 0x00ff) +
    _z((b & 0x00ff0000) >> 16) +
    "-" +
    _z((b & 0x0000ff00) >> 8) +
    _z((b & 0x000000ff)) +
    "-" +
    _z(((c & 0xff000000) >> 24) & 0x00ff) +
    _z((c & 0x00ff0000) >> 16) +
    "-" +
    _z((c & 0x0000ff00) >> 8) +
    _z((c & 0x000000ff)) +
    _z(((d & 0xff000000) >> 24) & 0x00ff) +
    _z((d & 0x00ff0000) >> 16) +
    _z((d & 0x0000ff00) >> 8) +
    _z((d & 0x000000ff));
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
  
  // 配列コピー.
  var _arraycopy = function( s,sp,d,dp,aLen ) {
    aLen = aLen|0 ;
    sp = sp|0 ;
    dp = dp|0 ;
    for( var i = 0 ; i < aLen ; i ++ ) {
      d[dp+i] = s[sp+i] ;
    }
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
  if(!src) {
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

// デコード.
fcipher.dec = function(value, pKey, head) {
  var value = fcipher.bdec(value, pKey, head);
  return _binaryToUTF8(value, 0, value) ;
}

// バイナリデコード.
fcipher.bdec = function(value, pKey, head) {
  head = !head ? ((_head == null) ? "" : _head) : head;
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
