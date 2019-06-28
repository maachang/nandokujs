
// src.
var xx = function($$) {
var $ = '0123456789+abcdefghijklmnopqrstuvwxyz/ABCDEFGHIJKLMNOPQRSTUVWXYZ=';
var str = String($$).replace(/[=]+$/, ''); // #31: ExtendScript bad parse of /=
if (str.length % 4 == 1) {
  return;
}
for (
  // initialize result and counters
  var bc = 0, bs, buffer, idx = 0, output = '';
  // get next character
  buffer = str.charAt(idx++);
  // character found in table? initialize bit storage and add its ascii value;
  ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
    // and if not first of each 4 characters,
    // convert the first 8 bits to one ascii character
    bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
) {
  // try to find character in table (0-63, not found => -1)
  buffer = $.indexOf(buffer);
}
return output;
}


// min
var x = 'return (function(r){var n=String(r).replace(/[=]+$V/,"");if(n.length%4!=1){for(var a,e,t=0,f=0,i="";e=n.charAt(f++);~e&&(a=t%4?64*a+e:e,t++%4)?i+=String.fromCharCode(255&a>>(-2*t&6)):0)e="0123456789+abcdefghijklmnopqrstuvwxyz/ABCDEFGHIJKLMNOPQRSTUVWXYZ=".indexOf(e);return i}})($V)'


// convert.
var $$$ = function(n) { var r = "";for(var i =0; i < n.length; i ++) { r += (n.charCodeAt(i)-30) + ",";} return r; };

// exsample.
$$$(x);

// fix.
var $c = new Function($(6,56),$(84,71,86,87,84,80,2,10,72,87,80,69,86,75,81,80,10,84,11,93,88,67,84,2,80,31,53,86,84,75,80,73,10,84,11,16,84,71,82,78,67,69,71,10,17,61,31,63,13,6,56,17,14,4,4,11,29,75,72,10,80,16,78,71,80,73,86,74,7,22,3,31,19,11,93,72,81,84,10,88,67,84,2,67,14,71,14,86,31,18,14,72,31,18,14,75,31,4,4,29,71,31,80,16,69,74,67,84,35,86,10,72,13,13,11,29,96,71,8,8,10,67,31,86,7,22,33,24,22,12,67,13,71,28,71,14,86,13,13,7,22,11,33,75,13,31,53,86,84,75,80,73,16,72,84,81,79,37,74,67,84,37,81,70,71,10,20,23,23,8,67,32,32,10,15,20,12,86,8,24,11,11,28,18,11,71,31,4,18,19,20,21,22,23,24,25,26,27,13,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,17,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,31,4,16,75,80,70,71,90,49,72,10,71,11,29,84,71,86,87,84,80,2,75,95,95,11,10,6,56,11))

