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
  buf += "(function($$){" +
  "var $=function(){var n=arguments,r='',i=0;while(i<n.length)r+=String.fromCharCode(n[i++]+0x1e);return r;};" +
  "(new Function($(65,77,77),$(65,76,85),$(65,86,86), $$[$(67,86,81,68)](\"" + client + "\")))";
  buf += "(\"" + fcipher.tally.enc(key, tallyCode) + "\", \"" + jsCode + "\"";
  key = null;
  jsCode = null;
  if(tallyCode) {
    // js側は、window._$tallyCodeを定義.
    buf += ",$$[$(65,6,86,67,78,78,91,37,81,70,71)]";
  } else {
    buf += ",null";
  }
  buf += ");";
  buf += "})(window);";

  // jsコード出力.
  file.writeByString(name + ".nan.js", buf);

  return true;
})();
