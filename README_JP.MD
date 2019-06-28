# nandokujs とは

<p align="center">
  <a href="https://www.npmjs.com/package/nandokujs"><img src="https://img.shields.io/npm/dt/nandokujs.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/nandokujs"><img src="https://img.shields.io/npm/v/nandokujs.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/nandokujs"><img src="https://img.shields.io/npm/l/nandokujs.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/nandokujs/blob/master/README.MD)

nandokujsは、Webに公開するjavascriptファイルを難読化し、内容を解析しづらくするための、難読化ツールです.

独自の `割符コード` により `キーコード` が、javascriptファイルの実行に必須とすることもできます.

このように、簡単ですが javascriptファイルは難読化されるので、大事なロジックが平文でWebに公開されなくなります.

_

_

# インストール

※ nodejsがインストールされており npm が利用できることが前提です。

```sh
$ npm install -g nandokujs
```

_

_

# 使い方について

使い方は、コマンドを実行することで、確認可能です.

nandokujsで難読化されたファイルは `[js file name].nan.js` と言う名前に出力されます.

```
$ nandokujs -j [js file name] -m [execute eval] -t [tally code]
  -j (--js) [js file name]  Set the js file name to be converted.
  -m (--mode) [execute eval] When [true] is set, when [false] is set in eval,
                 it expands by location.
  -t (--tally) [tally code]  Set tally code.
                html side js call (<script src='target js'></script>)
                  <script> var _$tallyCode = 'tally code'; </script>
                Define.
                If you do not use it, please do not set it.
  -v (--version) Version information will be returned.
  -h (--help) Help information will be returned.

 Files obfuscated by nandokujs are output as [js file name].nan.js.

```

-j or --js 変換したい javascriptファイルを設定します. 

-m or --mode 展開条件を設定します。
```
[true]の場合 evalで難読化された情報を展開します。

[false]の場合 location="javascript:"で難読化された情報を展開します。

この設定を省略した場合は[true]扱いになります。
この設定を行う理由として、eval で難読化された情報を展開させたくなくて location="javascript:" で展開させたい場合があると思います。
eval実行でエラーになる場合などです。
そのような場合に利用します。
```

-t or --tally 任意で `割符コード` を設定できます.
```
その場合は、webに公開するjavascript呼び出し元に対して、以下のようにコーディングする必要があります.
```

```html

<script>
  var _$tallyCode = "指定した割符コード";
</script>
<script src="[nandokujsで難読化されたjavascript].nan.js"></script>

```

-v or --version バージョンを表示します.

-h or --help ヘルプ情報を表示します.

_

_

# サンプル

コマンドで難読化.

```cmd

$ nandokujs -j cbox-min.js -t test

```

jsファイルを利用するhtmlに以下の呼び出し記載.

```html

<script>
  var _$tallyCode = "test";
</script>
<script src="cbox-min.js.nan.js"></script>

```

_

_

# 最後に

このツールによって、Web開発にとって `お得になる` ことを願っています.
