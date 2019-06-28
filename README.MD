# What is nandokujs

<p align="center">
  <a href="https://www.npmjs.com/package/nandokujs"><img src="https://img.shields.io/npm/dt/nandokujs.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/nandokujs"><img src="https://img.shields.io/npm/v/nandokujs.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/nandokujs"><img src="https://img.shields.io/npm/l/nandokujs.svg" alt="License"></a>
</p>

日本語の説明は [こちら](https://github.com/maachang/nandokujs/blob/master/README_JP.MD)

nandokujs is an obfuscation tool for obfuscating javascript files to be published on the Web and making it difficult to analyze the contents.

You can make your `keycode` mandatory for running javascript files, with your own `tally code`.

In this way, javascript files are obfuscated, so important logic is not exposed to the Web in plain text.

_

_

# Installation

※ It is assumed that nodejs is installed and npm can be used.

```sh
$ npm install -g nandokujs
```

_

_

# How to use

The usage can be confirmed by executing the command.

Files obfuscated by nandokujs are output as `[js file name].nan.js`.

```
$ nandokujs -j [js file name] -m [execute eval] -t [tally code]
  -j (--js) [js file name]  Set the js file name to be converted.
  -m (--mode) [execute eval] Set the expansion condition.
        When [true] Expand obfuscated information with eval
        [false] Extract obfuscated information with location = `javascript:`
        If not used, [true] is set.
  -t (--tally) [tally code]  Set tally code.
        html side js call (<script src='target js'></script>)
          <script> var _$tallyCode = 'tally code'; </script>
        Define.
        If you do not use it, please do not set it.
  -v (--version) Version information will be returned.
  -h (--help) Help information will be returned.

 Files obfuscated by nandokujs are output as [js file name].nan.js.

```
-j or --js Set the javascript file you want to convert.

-m or --mode Set expansion conditions.
```
When [true] Expand obfuscated information with eval.

[false] Extract obfuscated information with location = "javascript:".

If this setting is omitted, it will be treated as [true].
As a reason to do this setting, there are cases where you do not want to extract obfuscated information in eval, but you want to expand it with location = "javascript:".
For example, when an error occurs during eval execution.
It is used in such a case.
```

-t or --tally You can optionally set the `Tally code`.
```
In that case, it is necessary to code as follows for the javascript caller to publish on the web.
```

```html

<script>
  var _$tallyCode = "tally code";
</script>
<script src="[target javascript].nan.js"></script>

```

-v or --version Display the version.

-h or --help Display help information.

_

_

# exsample

Obfuscation with command.

```cmd

$ nandokujs -j cbox-min.js -t test

```

The following call is described in html using js file.

```html

<script>
  var _$tallyCode = "test";
</script>
<script src="cbox-min.js.nan.js"></script>

```

_

_

# Finally

With this tool, I hope to be a good deal for web development.
