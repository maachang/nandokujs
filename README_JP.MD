# nandokujs とは

nandokujsは、Webに公開するjavascriptファイルを難読化し、内容を解析しづらくするための、難読化ツールです.

独自の `割符コード` により `キーコード` が、javascriptファイルの実行に必須とすることもできます.

このように、簡単ですが javascriptファイルは難読化されるので、大事なロジックが平文でWebに公開されなくなります.

# インストール

※ nodejsがインストールされており npm が利用できることが前提です。

```sh
$ npm install -g nandokujs
```

# 使い方について

使い方は、コマンドを実行することで、確認可能です.

nandokujsで難読化されたファイルは `[js file name].cipher.js` と言う名前に出力されます.

```
$ nandokujs [js file name] [tally code]
  [js file name]  Set the js file name to be converted.
  [tally code]  Set tally code.
                html side js call (<script src='target js'></script>)に
                  <script> var _$tallyCode = 'tally code'; </script>
                Define.
                If you do not use it, please do not set it.

 Files obfuscated by nandokujs are output as [js file name] .cipher.js.

```

第一引数に、変換したい javascriptファイルを設定します. 

第二引数には、任意ですが `割符コード` を設定できます.

その場合は、webに公開するjavascript呼び出し元に対して、以下のようにコーディングする必要があります.

```html

<script>
  var _$tallyCode = "指定した割符コード";
</script>
<script src="nandokujsで難読化されたjavascript.cipher.js"></script>

```

このツールによって、Web開発にとって `お得になる` ことを願っています.
