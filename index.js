#!/usr/bin/env node

/*!
 * nandokujs.
 * Copyright(c) 2021 maachang.
 * MIT Licensed.
 */

(function() {
  'use strict';

  var file = require("./lib/file");
  var fcipher = require("./lib/fcipher");
  var fcomp = require("./lib/fcomp");
  var nums = require("./lib/nums");
  var strs = require("./lib/strs");

  // パラメータ引数を取得.
  var _args = function(c, use) {
    use = use == true || use == "true";
    for(var i = 2; i < process.argv.length; i ++) {
      if(process.argv[i] == c) {
        if(use) {
          return true;
        }
        return process.argv[i+1];
      }
    }
    return use ? false : undefined;
  }

  // コマンド名を取得.
  var _commandName = function() {
    return "nandokujs";
  }

  // バージョン情報を出力.
  var _version = function() {
    return "0.0.29";
  }

  // ヘルプ情報.
  var _help = function() {
    console.log(_commandName() + " version: " + _version());
    console.log();
    console.log("$ nandokujs -j [js file name] -m [execute eval] -t [tally code] -o [out file]")
    console.log("  -j (--js) [js file name]  Set the js file name to be converted.")
    console.log("  -m (--mode) [execute eval] Set the expansion condition.");
    console.log("      When [true] Expand obfuscated information with eval");
    console.log("      [false] Extract obfuscated information with location = `javascript:`")
    console.log("      If not used, [true] is set.")
    console.log("  -t (--tally) [tally code]  Set tally code.")
    console.log("      html side js call (<script src='target js'></script>)");
    console.log("        <script> var _$tallyCode = 'tally code'; </script>");
    console.log("      Define.");
    console.log("      If you do not use it, please do not set it.");
    console.log("  -o (--out) Set the output file name of nandokujs.");
    console.log("  -v (--version) Version information will be returned.");
    console.log("  -h (--help) Help information will be returned.");
    console.log("");
    console.log(" Files obfuscated by nandokujs are output as [js file name].nan.js.");
    console.log("");
  }

  // 変換対象のバイナリを設定します.
  var name = _args("-j") || _args("--js");
  var execEval = _args("-m") || _args("--mode");
  var tallyCode = _args("-t") || _args("--tally");
  var outFile = _args("-o") || _args("--out");
  var versionFlg = _args("-v", true) || _args("--version", true);
  var helpFLg = _args("-h", true) || _args("--help", true);

  if(!name || name == "") {
    helpFLg = true;
  }

  // version.
  if(versionFlg) {
    console.log(_version());
    return false;
  }

  // help
  if(helpFLg) {
    _help();
    return false;
  }

  // exec eval.
  if(!execEval || execEval == "" || execEval == "true" || execEval == true) {
    execEval = true;
  } else {
    execEval = false;
  }

  // 割符コードを設定します.
  if(!tallyCode || tallyCode == "") {
    tallyCode = null;
  }

  // JSファイルを取得.
  var jsCode = file.readByString(name);

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

  // $()処理難読化.
  var firstFunc = function() {
    // this['\\44\\104']=
    var base = "var $D=(function(){var _A=['','\\x66\\x72\\x6F\\x6D\\x43\\x68\\x61\\x72\\x43\\x6F\\x64\\x65','\\x6C\\x65\\x6E\\x67\\x74\\x68','\\x53\\x74\\x72\\x69\\x6e\\x67','\\x30\\x78\\x31\\x65'];return function(){var _B=arguments,_C=_A[0],_D=0;while(_D< _B[_A[2]]){_C+=this[_A[3]][_A[1]](_B[_D++]+(_A[4]|0))};return _C};})();";
    var keys = ["_A", "_B", "_C", "_D"];
    var randKeys = [];
    var n, flg, i, j;
    for(i = 0;i < keys.length; i ++) {
      n = rand.next() & 0x7fffffff;
      flg = false;
      for(j = 0; j < randKeys.length; j ++) {
        if(n == randKeys[j]) {
          flg = true;
          break;
        }
      }
      if(flg) {
        i --;
        continue;
      }
      randKeys.push(n);
    }
    for(var i = 0; i < randKeys.length; i ++) {
      base = strs.changeString(base, keys[i], "_0x" + randKeys[i].toString(16));
    }
    return base;
  }

  // ファイル出力.
  var buf = "";
  buf += "(function($G){" +
  firstFunc() +
  "$D[$D(6,69)]=new Function($D(6,56),$D(84,71,86,87,84,80,2,10,72,87,80,69,86,75,81,80,10,84,11,93,88,67,84,2,80,31,53,86,84,75,80,73,10,84,11,16,84,71,82,78,67,69,71,10,17,61,31,63,13,6,17,14,4,4,11,29,75,72,10,80,16,78,71,80,73,86,74,7,22,3,31,19,11,93,72,81,84,10,88,67,84,2,67,14,71,14,86,31,18,14,72,31,18,14,75,31,4,4,29,71,31,80,16,69,74,67,84,35,86,10,72,13,13,11,29,96,71,8,8,10,67,31,86,7,22,33,24,22,12,67,13,71,28,71,14,86,13,13,7,22,11,33,75,13,31,53,86,84,75,80,73,16,72,84,81,79,37,74,67,84,37,81,70,71,10,20,23,23,8,67,32,32,10,15,20,12,86,8,24,11,11,28,18,11,71,31,4,18,19,20,21,22,23,24,25,26,27,13,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,17,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,31,4,16,75,80,70,71,90,49,72,10,71,11,29,84,71,86,87,84,80,2,75,95,95,11,10,6,56,11));" +
  // ('_kk', '_js', '_evl', '_tt')
  "(new Function($D(65,77,77),$D(65,76,85),$D(65,71,88,78),$D(65,86,86),$D[$D(6,69)](\"" + client + "\")))";
  buf += "(\"" + fcipher.tally.enc(key, tallyCode) + "\", \"" + jsCode + "\", " + execEval + "";
  client = null;
  key = null;
  jsCode = null;
  if(tallyCode) {
    // js側は、this._$tallyCodeを定義.
    buf += ",$G[$D(65,6,86,67,78,78,91,37,81,70,71)]";
  } else {
    buf += ",null";
  }
  buf += ");";
  buf += "})(this);";

  // 出力先ファイル名をセット.
  // 指定されてない場合は、変換ファイル名＋.nan.jsをファイル名とする.
  if(!outFile || outFile == "") {
    outFile = name + ".nan.js";
  }

  // jsコード出力.
  file.writeByString(outFile, buf);

  return true;
})();
