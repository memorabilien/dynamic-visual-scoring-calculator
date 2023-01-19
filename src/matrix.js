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


export default function calculator( inputMatrix, inputVektor){

let output;

/**
 * Constructs an object storing rational numbers and methods performing operations
 *
 * @param num numerator of the rational number
 * @param den denomenator of the rational number
 * @returns Object storing the rational number and method doing arthmetic operations
 */
 function rational(num, den) {
	den = den || 1;
	if (Math.sign(den) === -1) {
		num = -num;
		den = -den;
	}
	return {
		num: num,
		den: den,
		add: (op) => rational(num * op.den + den * op.num, den * op.den),
		sub: (op) => rational(num * op.den - den * op.num, den * op.den),
		mul: (op) => multiply(op, num, den),
		div: (op) => {
			let _num = op.den;
			let _den = op.num;
			return multiply(rational(_num, _den), num, den);
		},
	};
}

/**
 * Multiplies two rational number based on multiplication rules that cancels common terms
 *
 * @param op the second operand
 * @param num numerator of first operand
 * @param den denominator of second operand
 * @returns another rational number
 */
 function multiply(op, num, den) {
	let _num = Math.sign(num) * Math.sign(op.num);
	let _den = Math.sign(den) * Math.sign(op.den);
	if (Math.abs(num) === Math.abs(op.den) && Math.abs(den) === Math.abs(op.num)) {
		_num = _num;
		_den = _den;
	} else if (Math.abs(den) === Math.abs(op.num)) {
		_num = _num * Math.abs(num);
		_den = _den * Math.abs(op.den);
	} else if (Math.abs(num) === Math.abs(op.den)) {
		_num = _num * Math.abs(op.num);
		_den = _den * Math.abs(den);
	} else {
		_num = num * op.num;
		_den = den * op.den;
	}
	return rational(_num, _den);
}

/**
 * Merges two matrices in all directions
 *
 * @param {Array} base Base matrix on which merge is performed
 */
 function merge(base) {
	return {
		top: (mergeData) => top(base, mergeData),
		bottom: (mergeData) => bottom(base, mergeData),
		left: (mergeData) => left(base, mergeData),
		right: (mergeData) => right(base, mergeData),
	};
}

/**
 * Merges the base matrix with the incoming matrix in the top direction
 * @param {Array} base
 * @param {Array} mergeData incoming matrix
 */
 function top(base, mergeData) {
	let baseWidth = base[0].length || base.length;
	let mergeDataWidth = mergeData[mergeData.length - 1].length || mergeData.length;

	if (baseWidth !== mergeDataWidth) {
		return base;
	}

	if (!Array.isArray(base[0])) {
		base = [base];
	}

	if (!Array.isArray(mergeData[mergeData.length - 1])) {
		mergeData = [mergeData];
	}

	for (let row = mergeData.length - 1; row >= 0; row--) {
		base.unshift(mergeData[row].map((ele) => ele));
	}
	return base;
}

/**
 * Merges the base matrix with the incoming matrix in the bottom direction
 * @param {Array} base
 * @param {Array} mergeData incoming matrix
 */
 function bottom(base, mergeData) {
	let baseWidth = base[base.length - 1].length || base.length;
	let mergeDataWidth = mergeData[0].length || mergeData.length;
	if (baseWidth !== mergeDataWidth) {
		return base;
	}

	if (!Array.isArray(base[base.length - 1])) {
		base = [base];
	}

	if (!Array.isArray(mergeData[0])) {
		mergeData = [mergeData];
	}

	for (let row = 0; row < mergeData.length; row++) {
		base.push(mergeData[row].map((ele) => ele));
	}
	return base;
}

/**
 * Merges the base matrix with the incoming matrix in the left direction
 * @param {Array} base
 * @param {Array} mergeData incoming matrix
 */
 function left(base, mergeData) {
	let baseHeight = base.length;
	let mergeDataHeight = mergeData.length;
	if (!Array.isArray(base[0]) && !Array.isArray(mergeData[0])) {
		base.unshift.apply(base, mergeData);
		return base;
	}

	if (baseHeight !== mergeDataHeight) {
		return base;
	}

	for (let row = 0; row < baseHeight; row++) {
		base[row].unshift.apply(
			base[row],
			mergeData[row].map((ele) => ele)
		);
	}
	return base;
}

/**
 * Merges the base matrix with the incoming matrix in the right direction
 * @param {Array} base
 * @param {Array} mergeData incoming matrix
 */
 function right(base, mergeData) {
	let baseHeight = base.length;
	let mergeDataHeight = mergeData.length;
	if (!Array.isArray(base[0]) && !Array.isArray(mergeData[0])) {
		base.push.apply(base, mergeData);
		return base;
	}

	if (baseHeight !== mergeDataHeight) {
		return base;
	}

	for (let row = 0; row < baseHeight; row++) {
		base[row].push.apply(
			base[row],
			mergeData[row].map((ele) => ele)
		);
	}
	return base;
}

/**
 * Pass a 2-dimensional array that will return a function accepting indices to access the matrix
 *
 * @param mat array that initializes the matrix
 * @returns function with the array initialized and access to method that perform operations on the matrix
 */
 function matrix(mat) {
	if (!Array.isArray(mat)) {
		throw new Error("Input should be of type array");
	}
	let _matrix = function () {
		let args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
		return read(mat, args);
	};
	return Object.assign(_matrix, _mat(mat));
}

/**
 * Private function that returns an object containing methods
 * that perform operations on the matrix
 *
 * @param mat array that initializes the matrix
 * @returns object of methods performing matrix operations
 */
 function _mat(mat) {
	return {
		size: () => size(mat),
		add: (operand) => operate(mat, operand, addition),
		sub: (operand) => operate(mat, operand, subtraction),
		mul: (operand) => operate(mat, operand, multiplication),
		div: (operand) => operate(mat, operand, division),
		prod: (operand) => prod(mat, operand),
		trans: () => trans(mat),
		set: function () {
			let args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
			return {
				to: (val) => replace(mat, val, args),
			};
		},
		det: () => determinant(mat),
		inv: () => invert(mat),
		merge: merge(mat),
		map: (func) => map(mat, func),
		equals: (operand) => equals(mat, operand),
	};
}

/**
 * Calculates the size of the array across each dimension
 *
 * @param mat input matrix that initialized the function
 * @returns size of the matrix as an array
 */
 function size(mat) {
	let s = [];
	while (Array.isArray(mat)) {
		s.push(mat.length);
		mat = mat[0];
	}
	return s;
}

/**
 * Private function to calculate the dimensions of the matrix
 *
 * @param mat input matrix that initializes the function
 * @returns integer indicating the number of dimensions
 */
 function dimensions(mat) {
	return size(mat).length;
}

/**
 * Outputs the original matrix or a particular element or a matrix that is part of the original
 *
 * @param mat input matrix that initializes the function
 * @param args indices to access one or more array elements
 * @returns array or single element
 */
 function read(mat, args) {
	if (args.length === 0) {
		return mat;
	} else {
		return extract(mat, args);
	}
}

/**
 * Private function to extract a single element or a matrix that is part of the original
 *
 * @param mat input matrix that initializes the function
 * @param args indices to access one or more array elements
 * @returns array or single element
 */
 function extract(mat, args) {
	let dim = dimensions(mat);
	for (let i = 0; i < dim; i++) {
		let d = args[i];
		if (d === undefined) {
			break;
		}
		if (Array.isArray(d)) {
			// if an element of args is an array, more extraction is needed
			mat = extractRange(mat, d, i);
		} else if (Number.isInteger(d)) {
			if (dimensions(mat) > 1 && i > 0) {
				mat = mat.map(function (elem) {
					return [elem[d]];
				});
			} else {
				mat = mat[d];
			}
		}
	}
	return mat;
}

/**
 * Private function to extract a portion of the array based on the specified range
 *
 * @param mat input matrix that initialized the function
 * @param arg single argument containing the range specified as an array
 * @param ind the current index of the arguments while extracting the matrix
 * @returns array from the specified range
 */
 function extractRange(mat, arg, ind) {
	if (!arg.length) {
		return mat;
	} else if (arg.length === 2) {
		let reverse = arg[0] > arg[1];
		let first = !reverse ? arg[0] : arg[1];
		let last = !reverse ? arg[1] : arg[0];
		if (dimensions(mat) > 1 && ind > 0) {
			return mat.map(function (elem) {
				if (reverse) {
					return elem.slice(first, last + 1).reverse();
				}
				return elem.slice(first, last + 1);
			});
		} else {
			mat = mat.slice(first, last + 1);
			return (reverse && mat.reverse()) || mat;
		}
	}
}

/**
 * Replaces the specified index in the matrix with the specified value
 *
 * @param mat input matrix that initialized the function
 * @param value specified value that replace current value at index or indices
 * @param args index or indices passed in arguments to initialized function
 * @returns replaced matrix
 */
 function replace(mat, value, args) {
	//TODO: Clean this function up
	let result = clone(mat);
	let prev = args[0];
	let start = prev[0] || 0;
	let end = (prev[1] && prev[1] + 1) || mat.length;
	if (!Array.isArray(prev) && args.length === 1) {
		result[prev].fill(value);
	} else if (args.length === 1) {
		for (let ind = start; ind < end; ind++) {
			result[ind].fill(value);
		}
	}
	for (let i = 1; i < args.length; i++) {
		let first = Array.isArray(args[i]) ? args[i][0] || 0 : args[i];
		let last = Array.isArray(args[i]) ? (args[i][1] && args[i][1] + 1) || mat[0].length : args[i] + 1;
		if (!Array.isArray(prev)) {
			result[prev].fill(value, first, last);
		} else {
			for (let ind = start; ind < end; ind++) {
				result[ind].fill(value, first, last);
			}
		}
	}
	return result;
}

/**
 * Operates on two matrices of the same size
 *
 * @param mat input matrix that initialized the function
 * @param operand second matrix with which operation is performed
 * @param operation function performing the desired operation
 * @returns result of the operation
 */
 function operate(mat, operand, operation) {
	let result = [];
	let op = operand();

	for (let i = 0; i < mat.length; i++) {
		let op1 = mat[i];
		let op2 = op[i];
		result.push(
			op1.map(function (elem, ind) {
				return operation(elem, op2[ind]);
			})
		);
	}

	return result;
}

/**
 * Finds the product of two matrices
 *
 * @param mat input matrix that initialized the function
 * @param operand second matrix with which operation is performed
 * @returns the product of the two matrices
 */
 function prod(mat, operand) {
	let op1 = mat;
	let op2 = operand();
	let size1 = size(op1);
	let size2 = size(op2);
	let result = [];
	if (size1[1] === size2[0]) {
		for (let i = 0; i < size1[0]; i++) {
			result[i] = [];
			for (let j = 0; j < size2[1]; j++) {
				for (let k = 0; k < size1[1]; k++) {
					if (result[i][j] === undefined) {
						result[i][j] = 0;
					}
					result[i][j] += multiplication(op1[i][k], op2[k][j]);
				}
			}
		}
	}
	return result;
}

/**
 * Returns the transpose of a matrix, swaps rows with columns
 *
 * @param mat input matrix that initialized the function
 * @returns a matrix with rows and columns swapped from the original matrix
 */
 function trans(mat) {
	let input = mat;
	let s = size(mat);
	let output = [];
	for (let i = 0; i < s[0]; i++) {
		for (let j = 0; j < s[1]; j++) {
			if (Array.isArray(output[j])) {
				output[j].push(input[i][j]);
			} else {
				output[j] = [input[i][j]];
			}
		}
	}
	return output;
}

/**
 * Private method to clone the matrix
 *
 * @param mat input matrix that initialized the function
 * @returns cloned matrix
 */
 function clone(mat) {
	let result = [];
	for (let i = 0; i < mat.length; i++) {
		result.push(mat[i].slice(0));
	}
	return result;
}

/**
 * Performs addition
 *
 * @param op1 first operand
 * @param op2 second operand
 * @returns result
 */
 function addition(op1, op2) {
	return op1 + op2;
}

/**
 * Performs subtraction
 *
 * @param op1 first operand
 * @param op2 second operand
 * @returns result
 */
 function subtraction(op1, op2) {
	return op1 - op2;
}

/**
 * Performs multiplication
 *
 * @param op1 first operand
 * @param op2 second operand
 * @returns result
 */
 function multiplication(op1, op2) {
	return op1 * op2;
}

/**
 * Performs division
 *
 * @param op1 first operand
 * @param op2 second operand
 * @returns result
 */
 function division(op1, op2) {
	return op1 / op2;
}

/**
 * Computes the determinant using row reduced echelon form
 * Works best if the elements are integers or rational numbers
 * The matrix must be a square
 *
 * @param mat input matrix that initialized the function
 * @returns determinant value as a number
 */
 function determinant(mat) {
	let rationalized = rationalize(mat);
	let siz = size(mat);
	let det = rational(1);
	let sign = 1;

	for (let i = 0; i < siz[0] - 1; i++) {
		for (let j = i + 1; j < siz[0]; j++) {
			if (rationalized[j][i].num === 0) {
				continue;
			}
			if (rationalized[i][i].num === 0) {
				interchange(rationalized, i, j);
				sign = -sign;
				continue;
			}
			let temp = rationalized[j][i].div(rationalized[i][i]);
			temp = rational(Math.abs(temp.num), temp.den);
			if (Math.sign(rationalized[j][i].num) === Math.sign(rationalized[i][i].num)) {
				temp = rational(-temp.num, temp.den);
			}
			for (let k = 0; k < siz[1]; k++) {
				rationalized[j][k] = temp.mul(rationalized[i][k]).add(rationalized[j][k]);
			}
		}
	}

	det = rationalized.reduce((prev, curr, index) => prev.mul(curr[index]), rational(1));

	return (sign * det.num) / det.den;
}

/**
 * Interchanges one row index with another on passed matrix
 *
 * @param mat input matrix
 * @param ind1 one of the row indices to exchange
 * @param ind2 one of the row indices to exchange
 */
 function interchange(mat, ind1, ind2) {
	let temp = mat[ind1];
	mat[ind1] = mat[ind2];
	mat[ind2] = temp;
}

/**
 * Inverts the input square matrix using row reduction technique
 * Works best if the elements are integers or rational numbers
 * The matrix has to be a square and non-singular
 *
 * @param mat input matrix
 * @returns inverse of the input matrix
 */
 function invert(mat) {
	let rationalized = rationalize(mat);
	let siz = size(mat);
	let result = rationalize(identity(siz[0]));

	// row reduction
	let i = 0;
	let j = 0;
	while (j < siz[0]) {
		if (rationalized[i][j].num === 0) {
			for (let k = i + 1; k < siz[0]; k++) {
				if (rationalized[k][j].num !== 0) {
					interchange(rationalized, i, k);
					interchange(result, i, k);
				}
			}
		}
		if (rationalized[i][j].num !== 0) {
			if (rationalized[i][j].num !== 1 || rationalized[i][j].den !== 1) {
				let factor = rational(rationalized[i][j].num, rationalized[i][j].den);
				for (let col = 0; col < siz[1]; col++) {
					rationalized[i][col] = rationalized[i][col].div(factor);
					result[i][col] = result[i][col].div(factor);
				}
			}
			for (let k = i + 1; k < siz[0]; k++) {
				let temp = rationalized[k][j];
				for (let col = 0; col < siz[1]; col++) {
					rationalized[k][col] = rationalized[k][col].sub(temp.mul(rationalized[i][col]));
					result[k][col] = result[k][col].sub(temp.mul(result[i][col]));
				}
			}
		}
		i += 1;
		j += 1;
	}

	// Further reduction to convert rationalized to identity
	let last = siz[0] - 1;
	if (rationalized[last][last].num !== 1 || rationalized[last][last].den !== 1) {
		let factor = rational(rationalized[last][last].num, rationalized[last][last].den);
		for (let col = 0; col < siz[1]; col++) {
			rationalized[last][col] = rationalized[last][col].div(factor);
			result[last][col] = result[last][col].div(factor);
		}
	}

	for (let i = siz[0] - 1; i > 0; i--) {
		for (let j = i - 1; j >= 0; j--) {
			let temp = rational(-rationalized[j][i].num, rationalized[j][i].den);
			for (let k = 0; k < siz[1]; k++) {
				rationalized[j][k] = temp.mul(rationalized[i][k]).add(rationalized[j][k]);
				result[j][k] = temp.mul(result[i][k]).add(result[j][k]);
			}
		}
	}

	return derationalize(result);
}

/**
 * Applies a given function over the matrix, elementwise. Similar to Array.map()
 * The supplied function is provided 4 arguments:
 * the current element,
 * the row index,
 * the col index,
 * the matrix.
 *
 * @param mat input matrix
 * @returns matrix of same dimensions with values altered by the function.
 */
 function map(mat, func) {
	const s = size(mat);
	const result = [];
	for (let i = 0; i < s[0]; i++) {
		if (Array.isArray(mat[i])) {
			result[i] = [];
			for (let j = 0; j < s[1]; j++) {
				result[i][j] = func(mat[i][j], [i, j], mat);
			}
		} else {
			result[i] = func(mat[i], [i, 0], mat);
		}
	}
	return result;
}

/**
 * Converts a matrix of numbers to all rational type objects
 *
 * @param mat input matrix
 * @returns matrix with elements of type rational
 */
 function rationalize(mat) {
	let rationalized = [];
	mat.forEach((row, ind) => {
		rationalized.push(row.map((ele) => rational(ele)));
	});
	return rationalized;
}

/**
 * Converts a rationalized matrix to all numerical values
 *
 * @param mat input matrix
 * @returns matrix with numerical values
 */
 function derationalize(mat) {
	let derationalized = [];
	mat.forEach((row, ind) => {
		derationalized.push(row.map((ele) => ele.num / ele.den));
	});
	return derationalized;
}

/**
 * Generates a square matrix of specified size all elements with same specified value
 *
 * @param size specified size
 * @param val specified value
 * @returns square matrix
 */
 function generate(size, val) {
	let dim = 2;
	while (dim > 0) {
		var arr = [];
		for (var i = 0; i < size; i++) {
			if (Array.isArray(val)) {
				arr.push(Object.assign([], val));
			} else {
				arr.push(val);
			}
		}
		val = arr;
		dim -= 1;
	}
	return val;
}

/**
 * Generates an identity matrix of the specified size
 *
 * @param size specified size
 * @returns identity matrix
 */
 function identity(size) {
	let result = generate(size, 0);
	result.forEach((row, index) => {
		row[index] = 1;
	});
	return result;
}

/**
 * Checks the equality of two matrices
 * @param mat input matrix
 * @param operand second matrix
 */
 function equals(mat, operand) {
	let op1 = mat;
	let op2 = operand();
	let size1 = size(op1);
	let size2 = size(op2);

	if (!size1.every((val, ind) => val === size2[ind])) {
		return false;
	}

	return op1.every((val, ind1) => val.every((ele, ind2) => Math.abs(ele - op2[ind1][ind2]) < 1e-10));
}


let A = matrix(inputMatrix);
let b = matrix(inputVektor);

let MatrixInverse = A.inv();

output = prod(MatrixInverse,b);

return output.flat();

}

