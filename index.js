#!/usr/bin/env node

/*!
 * nandokujs.
 * Copyright(c) 2019 maachang.
 * MIT Licensed
 */

(function() {
  'use strict';

  var file = require("./lib/file");
  var fcipher = require("./lib/fcipher");
  var fcomp = require("./lib/fcomp");
  var nums = require("./lib/nums");

  // 変換対象のバイナリを設定します.
  var name = process.argv[2]
  if(!name || name == "" || name == "-h" || name == "--help") {
    console.log("$ nandokujs [js file name] [tally code]")
    console.log("  [js file name]  Set the js file name to be converted.")
    console.log("  [tally code]  Set tally code.")
    console.log("                html side js call (<script src='target js'></script>)に");
    console.log("                  <script> var _$tallyCode = 'tally code'; </script>");
    console.log("                Define.");
    console.log("                If you do not use it, please do not set it.");
    console.log("");
    console.log(" Files obfuscated by nandokujs are output as [js file name] .nan.js.");
    console.log("");
    return false;
  }
  // JSファイルを取得.
  var jsCode = file.readByString(name);

  // 割符コードを設定します.
  var tallyCode = process.argv[3];
  if(!tallyCode || tallyCode == "") {
    tallyCode = null;
  }

  // client.jsを取得.
  var fs = require("fs");
  var dir = __dirname + '/./lib/client';
  var client = fcipher.CBase64.encode(fs.readFileSync(dir + '/client.min.js'));
  fs = null;

  // ランダムキーを取得.
  var rand = nums.Xor128(nums.getNanoTime());
  var key = [];
  for(var i = 0; i < 48; i ++) {
    key[i] = rand.next() & 0x00ff;
  }
  key = fcipher.CBase64.encode(key);

  // JSファイルを変換.
  jsCode = fcomp.freeze(jsCode);
  jsCode = fcipher.benc(jsCode, fcipher.key(key, "fcipher.js"), "_");

  // ファイル出力.
  var buf = "";
  buf += "(function($$){" +
  "var $=function(){var n=arguments,r='',i=0;while(i<n.length)r+=String.fromCharCode(n[i++]+0x1e);return r;};" +
  "$[$(6,69)]=new Function($(6),$(84,71,86,87,84,80,2,10,72,87,80,69,86,75,81,80,10,84,11,93,88,67,84,2,80,31,53,86,84,75,80,73,10,84,11,16,84,71,82,78,67,69,71,10,17,61,31,63,13,6,17,14,4,4,11,29,75,72,10,80,16,78,71,80,73,86,74,7,22,3,31,19,11,93,72,81,84,10,88,67,84,2,67,14,71,14,86,31,18,14,72,31,18,14,75,31,4,4,29,71,31,80,16,69,74,67,84,35,86,10,72,13,13,11,29,96,71,8,8,10,67,31,86,7,22,33,24,22,12,67,13,71,28,71,14,86,13,13,7,22,11,33,75,13,31,53,86,84,75,80,73,16,72,84,81,79,37,74,67,84,37,81,70,71,10,20,23,23,8,67,32,32,10,15,20,12,86,8,24,11,11,28,18,11,71,31,4,18,19,20,21,22,23,24,25,26,27,13,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,17,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,31,4,16,75,80,70,71,90,49,72,10,71,11,29,84,71,86,87,84,80,2,75,95,95,11,10,6,11));" +
  // ('_kk', '_js', '_tt')
  "(new Function($(65,77,77),$(65,76,85),$(65,86,86),$[$(6,69)](\"" + client + "\")))";
  buf += "(\"" + fcipher.tally.enc(key, tallyCode) + "\", \"" + jsCode + "\"";
  client = null;
  key = null;
  jsCode = null;
  if(tallyCode) {
    // js側は、this._$tallyCodeを定義.
    buf += ",$$[$(65,6,86,67,78,78,91,37,81,70,71)]";
  } else {
    buf += ",null";
  }
  buf += ");";
  buf += "})(this);";

  // jsコード出力.
  file.writeByString(name + ".nan.js", buf);

  return true;
})();
