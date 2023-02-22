/*
The MIT License (MIT)
Copyright (c) 2016 Raghavendra Ravikumar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
 */

/**
 * calculates the other weight percentages, which are not the input weight
 * @param {Array} inputMatrix
 * @param {Array} inputVektor
 * @returns {Array} other weights in percent
 */
export default function calcWeight(inputMatrix, inputVector) {
	let output;
	/*
        Made with matrix.js from Raghavendra Ravikumar
        MIT License copyright (c) 2016 Raghavendra Ravikumar
        https://github.com/RaghavCodeHub/matrix/blob/master/LICENSE-MIT
      */
	function rational(t, n) {
		return (
			(n = n || 1),
			-1 === Math.sign(n) && ((t = -t), (n = -n)),
			{ num: t, den: n, add: (e) => rational(t * e.den + n * e.num, n * e.den), sub: (e) => rational(t * e.den - n * e.num, n * e.den), mul: (e) => multiply(e, t, n), div: (e) => multiply(rational(e.den, e.num), t, n) }
		);
	}
	function multiply(t, n, e) {
		let r = Math.sign(n) * Math.sign(t.num),
			i = Math.sign(e) * Math.sign(t.den);
		return (
			Math.abs(n) === Math.abs(t.den) && Math.abs(e) === Math.abs(t.num)
				? ((r = r), (i = i))
				: Math.abs(e) === Math.abs(t.num)
				? ((r *= Math.abs(n)), (i *= Math.abs(t.den)))
				: Math.abs(n) === Math.abs(t.den)
				? ((r *= Math.abs(t.num)), (i *= Math.abs(e)))
				: ((r = n * t.num), (i = e * t.den)),
			rational(r, i)
		);
	}
	function matrix(t) {
		if (!Array.isArray(t)) throw new Error("Input should be of type array");
		return Object.assign(function () {
			let n = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
			if(0 === n.length ){
				return t;
			}
		}, _mat(t));
	}
	function _mat(t) {
		return {
			size: () => size(t),
			prod: (n) => prod(t, n),
			inv: () => invert(t),
		};
	}
	function size(t) {
		let n = [];
		for (; Array.isArray(t); ) n.push(t.length), (t = t[0]);
		return n;
	}
	function prod(t, n) {
		let e = t,
			r = n(),
			i = size(e),
			a = size(r),
			l = [];
		if (i[1] === a[0])
			for (let t = 0; t < i[0]; t++) {
				l[t] = [];
				for (let n = 0; n < a[1]; n++) for (let a = 0; a < i[1]; a++) void 0 === l[t][n] && (l[t][n] = 0), (l[t][n] += (e[t][a]* r[a][n]));
			}
		return l;
	}
	function invert(t) {
		let n = rationalize(t),
			e = size(t),
			r = rationalize(identity(e[0])),
			i = 0,
			a = 0;
		for (; a < e[0]; ) {
			if (0 === n[i][a].num) for (let t = i + 1; t < e[0]; t++) 0 !== n[t][a].num && (interchange(n, i, t), interchange(r, i, t));
			if (0 !== n[i][a].num) {
				if (1 !== n[i][a].num || 1 !== n[i][a].den) {
					let t = rational(n[i][a].num, n[i][a].den);
					for (let a = 0; a < e[1]; a++) (n[i][a] = n[i][a].div(t)), (r[i][a] = r[i][a].div(t));
				}
				for (let t = i + 1; t < e[0]; t++) {
					let l = n[t][a];
					for (let a = 0; a < e[1]; a++) (n[t][a] = n[t][a].sub(l.mul(n[i][a]))), (r[t][a] = r[t][a].sub(l.mul(r[i][a])));
				}
			}
			(i += 1), (a += 1);
		}
		let l = e[0] - 1;
		if (1 !== n[l][l].num || 1 !== n[l][l].den) {
			let t = rational(n[l][l].num, n[l][l].den);
			for (let i = 0; i < e[1]; i++) (n[l][i] = n[l][i].div(t)), (r[l][i] = r[l][i].div(t));
		}
		for (let t = e[0] - 1; t > 0; t--)
			for (let i = t - 1; i >= 0; i--) {
				let a = rational(-n[i][t].num, n[i][t].den);
				for (let l = 0; l < e[1]; l++) (n[i][l] = a.mul(n[t][l]).add(n[i][l])), (r[i][l] = a.mul(r[t][l]).add(r[i][l]));
			}
		return derationalize(r);
	}
	function rationalize(t) {
		let n = [];
		return (
			t.forEach((t, e) => {
				n.push(t.map((t) => rational(t)));
			}),
			n
		);
	}
	function derationalize(t) {
		let n = [];
		return (
			t.forEach((t, e) => {
				n.push(t.map((t) => t.num / t.den));
			}),
			n
		);
	}
	function generate(t, n) {
		let e = 2;
		for (; e > 0; ) {
			for (var r = [], i = 0; i < t; i++) Array.isArray(n) ? r.push(Object.assign([], n)) : r.push(n);
			(n = r), (e -= 1);
		}
		return n;
	}
	function identity(t) {
		let n = generate(t, 0);
		return (
			n.forEach((t, n) => {
				t[n] = 1;
			}),
			n
		);
	}

	let A = matrix(inputMatrix);
	let b = matrix(inputVector);
	let MatrixInverse = A.inv();
	output = prod(MatrixInverse, b);
	return output.flat();
}
