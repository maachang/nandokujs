# What is cipherjs

cipherjs is an obfuscation tool for obfuscating javascript files to be published on the Web and making it difficult to analyze the contents.

You can make your `keycode` mandatory for running javascript files, with your own `tally code`.

In this way, javascript files are obfuscated, so important logic is not exposed to the Web in plain text.

# How to use

The usage can be confirmed by executing the command.

Files obfuscated by cipherjs are output as `[js file name].cipher.js`.

```
$ cipherjs [js file name] [tally code]
  [js file name]  Set the js file name to be converted.
  [tally code]  Set tally code.
                html side js call (<script src='target js'></script>)に
                  <script> var _$tallyCode = 'tally code'; </script>
                Define.
                If you do not use it, please do not set it.

 Files obfuscated by cipherjs are output as [js file name] .cipher.js.

```

Set the javascript file to be converted to the first argument.

The second argument is optional, but you can set it to a `tally code`.

In that case, it is necessary to code as follows for the javascript caller to publish on the web.

```html

<script>
  var _$tallyCode = "tally code";
</script>
<script src="target javascript.cipher.js"></script>

```

With this tool, I hope to be a good deal for web development.
