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
    console.log(" Files obfuscated by nandokujs are output as [js file name] .cipher.js.");
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
  var client = fs.readFileSync(dir + '/client.min.js', "base64");
  fs.writeFileSync(dir + '/client.base64.js', client);
  client = file.readByString(dir + '/client.base64.js');
  file.removeFile(dir + '/client.base64.js');
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
  buf += "if(!window[\"global\"]) window[\"global\"] = window;\n" +
  "(function(_g) {\n" +
  "var _$=function(n){var r='';for(var i=0;i<n.length;i++)r+=String.fromCharCode(n[i]);return r;};" +
  "(new Function(_$([95,107,107]),_$([95,106,115]),_$([95,116,116]), _g[_$([97,116,111,98])](\"" + client + "\")))";
  buf += "(\"" + fcipher.tally.enc(key, tallyCode) + "\", \"" + jsCode + "\"";
  key = null;
  jsCode = null;
  if(tallyCode) {
    // js側は、window._$tallyCodeを定義.
    buf += ", _g[_$([95,36,116,97,108,108,121,67,111,100,101])]";
  } else {
    buf += ", null";
  }
  buf += ");\n";
  buf += "})(global);\n";

  // jsコード出力.
  file.writeByString(name + ".cipher.js", buf);

  return true;
})();
