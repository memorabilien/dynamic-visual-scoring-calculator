import React, { useEffect, useState, useCallback } from "react";
import "./dvsc_style.css";

function DVSC(props) {
	const [config, setConfig] = useState(props.config);
	const [data, setData] = useState(props.data);
	const [targetValues, setTargetValues] = useState(config.category_target_values);
	const [biasInputValues, setBiasInputValues] = useState(config.category_bias_preset);
	const [weightings, setWeightings] = useState(config.category_weighting_preset);
	const [porpsMinMax, setPropsMinMax] = useState([]);
	const [scores, setScores] = useState([0, 0, 0, 0, 0]);
	const [mainScore, setMainScore] = useState(0);
	useEffect(() => {
		let properties = {};
		for (let i = 0; i < config.category_count; i++) {
			if (config.category_direction[i] === 1) {
				properties[i] = { max: data[i] };
			} else if (config.category_direction[i] === -1) {
				properties[i] = { min: data[i] };
			}
		}
		setPropsMinMax(properties);
	}, []);

	useEffect(() => {
		// default if no config is passed to module
		if (config === undefined) {
			setConfig({
				category_count: 4,
				category_names: ["Time", "Cost", "Efficiency", "Personell"],
				category_value_unit: ["s", "€", "%", "P"],
				category_target_values: [10, 20, 100, 0],
				category_target_value_step: [1, 0.01, 0.01, 1],
				category_direction: [1, 1, -1, 1],
				category_grain: [1, 1, 1, 1],
				category_evaluation: ["linear", "quadratic", "cubic", "linear"],
				category_weighting_preset: [25, 25, 25, 25],
				category_bias_preset: [0, 0, 0, 0],
				colors: ["#ff0000", "#ff7b00", "#ffbb00", "#00dfba", "#127efa", "#8921ff", "#d500e9"],
			});
		} else if (config === null) {
			setConfig({
				category_count: 4,
				category_names: ["Time", "Cost", "Efficiency", "Personell"],
				category_value_unit: ["s", "€", "%", "P"],
				category_target_values: [10, 20, 100, 0],
				category_target_value_step: [1, 0.01, 0.01, 1],
				category_direction: [1, 1, -1, 1],
				category_grain: [1, 1, 1, 1],
				category_evaluation: ["linear", "quadratic", "cubic", "linear"],
				category_weighting_preset: [25, 25, 25, 25],
				category_bias_preset: [0, 0, 0, 0],
				colors: ["#ff0000", "#ff7b00", "#ffbb00", "#00dfba", "#127efa", "#8921ff", "#d500e9"],
			});
		}
	}, [config]);

	useEffect(() => {
		// default data values if no data values are passed to module
		if (data === undefined) {
			setData([20, 30, 80, 1]);
		} else if (data === null) {
			setData([20, 30, 80, 1]);
		}
	}, [data]);

	const targetValueChangeHandler = (input, currentIndex) => {
		setTargetValues(targetValues.map((element, index) => (index === currentIndex ? parseFloat(input) : parseFloat(element))));
	};
	const biasChangeHandler = (input, currentIndex) => {
		setBiasInputValues(biasInputValues.map((element, index) => (index === currentIndex ? parseFloat(input) : parseFloat(element))));
		// console.log(biasInputValues.map((element, index) => (index === currentIndex ? parseFloat(input) : parseFloat(element))));
	};
	const weightingChangeHandler = useCallback((input, currentIndex) => {
		function getAdjustments(userInput, categoryCount, currentAdjustmentIndex) {
			/*
			Functions for matrix computation are from matrix-js with the following license:

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
			// matrix calculation function start
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
			// matrix calculation functions
			if (categoryCount !== 1 && categoryCount !== 0) {
				let inputStatus = weightings;

				let tempMatrix = new Array(categoryCount - 1);
				let vector = new Array(categoryCount - 1);
				for (let i = 0; i < categoryCount - 1; i++) {
					if (i === 0) {
						vector[i] = [100 - parseFloat(userInput)];
					} else {
						vector[i] = [0];
					}

					let temp = new Array(categoryCount - 1);
					for (let k = 0; k < temp.length; k++) {
						temp[k] = 0;
					}
					tempMatrix[i] = temp;
				}

				for (let row = 0; row < categoryCount - 1; row++) {
					for (let column = 0; column < categoryCount - 1; column++) {
						if (row === 0) {
							tempMatrix[row][column] = 1;
						} else {
							if (column === row - 1) {
								tempMatrix[row][column] = -inputStatus[row + 1];
							}
							if (column === row) {
								tempMatrix[row][column] = inputStatus[row];
							}
						}
					}
				}

				let eq = matrix(tempMatrix).inv();
				let res = matrix(vector);

				let newPerc = prod(eq, res);
				newPerc = newPerc.flat();
				newPerc.splice(currentAdjustmentIndex, 0, parseFloat(userInput));

				newPerc.forEach((element, index, array) => {
					if (index !== currentAdjustmentIndex && array[index] < 0.01) {
						array[currentAdjustmentIndex] = parseFloat(array[currentAdjustmentIndex] - (0.01 - array[index]));
						array[index] = 0.01;
					}
				});
				setWeightings(newPerc);
			} else {
				setWeightings(userInput);
			}
		}

		getAdjustments(input, config.category_count, currentIndex);
	});

	function linearBias(value, bias, target, direction, grain) {
		let g = (100 * grain) / 5;
		let b = ((bias - 5.001) / (-bias - 5.001)) * (1 / g);
		function h(x) {
			return direction * (x - target);
		}
		function f(x) {
			return (1000 / Math.PI) * Math.atan(1000 * x);
		}
		let factor = f(-h(value)) + f(h(value)) * (-b * h(value) + 1) + f(h(value - 1 / (direction * b))) * (b * h(value) - 1) + 500;
		return factor < 0.0001 ? factor : factor;
		// https://www.desmos.com/calculator/qp8yb4jbnz
	}
	function quadraticBias(value, bias, target, direction, grain) {
		let b = (bias - 5.001) / (bias + 5.001);
		let g = 1 / (1.38648041843 * grain);
		function f(x) {
			return (1 / Math.PI) * Math.atan(x) + 0.5;
		}
		function h(x) {
			return 2 * f(-2 * Math.pow(x, 2)) - 1;
		}
		function j(x) {
			return direction * (x - target);
		}

		let factor = 1000 * f(1000 * j(value)) * h(g * b * j(value)) + 1000;
		return factor < 0.0001 ? 0.0001 : factor;

		//https://www.desmos.com/calculator/a3uakjjpbd
	}
	function cubicBias(value, bias, target, direction, grain) {
		let b = (bias - 5.001) / (bias + 5.001);
		let g = 1 / (1.38648041843 * grain);
		function f(x) {
			return (1 / Math.PI) * Math.atan(x) + 0.5;
		}
		function h(x) {
			return 2 * f(2 * Math.pow(x, 3)) - 1;
		}
		function j(x) {
			return direction * (x - target);
		}

		let factor = 1000 * f(1000 * j(value)) * h(g * b * j(value)) + 1000;
		return factor < 0.0001 ? 0.0001 : factor;

		//https://www.desmos.com/calculator/7mp16fywjh
	}

	useEffect(() => {
		let categoryScore = [] ?? [0, 0, 0, 0];
		for (let i = 0; i < config.category_count; i++) {
			if (config.category_evaluation[i] === "lin" || config.category_evaluation[i] === "linear") {
				categoryScore[i] = linearBias(data[i], biasInputValues[i], targetValues[i], config.category_direction[i], config.category_grain[i]);
			} else if (config.category_evaluation[i] === "quad" || config.category_evaluation[i] === "quadratic") {
				categoryScore[i] = quadraticBias(data[i], biasInputValues[i], targetValues[i], config.category_direction[i], config.category_grain[i]);
			} else if (config.category_evaluation[i] === "cube" || config.category_evaluation[i] === "cubic") {
				categoryScore[i] = cubicBias(data[i], biasInputValues[i], targetValues[i], config.category_direction[i], config.category_grain[i]);
			} else {
				console.error("unknown evaluation type: " + config.category_evaluation[i].toString());
			}
		}
		setScores(categoryScore);
	}, [targetValues, biasInputValues, data, config]);

	const getDegrees = (currentIndex) => {
		let degree = 0;
		for (let i = 0; i < currentIndex; i++) {
			degree += parseFloat(weightings[i]);
		}
		return 3.6 * degree;
	};

	useEffect(() => {
		let sum = 0;
		scores.forEach((element, index) => {
			sum += parseFloat(element / 1000) * parseFloat(weightings[index] / 100);
		});
		setMainScore(sum);
	}, [scores, config, weightings]);

	return (
		<div className='dynamic_visual_scoring_calculator'>
			<div className='dvsc_settings'>
				<table>
					<thead className='dvsc_settings_head'>
						<tr>
							<th>Category</th>
							<th>Value</th>
							<th>Target Value</th>
							<th>Bias</th>
							<th>Weighting</th>
							<th>Score</th>
						</tr>
					</thead>
					<tbody>
						{config.category_names.map((name, index) => (
							<tr>
								<th>{name}</th>
								<td>
									<p>
										<output className='dvsc_data_input_display' for={`data_input_${(index + 1).toString()}`}>
											{data[index]}
										</output>
										<span> {config.category_value_unit[index].toString()}</span>
									</p>
								</td>
								<td className='dvsc_target_value'>
									<input
										className='dvsc_target_value_input'
										id={`dvsc_target_value_input_${(index + 1).toString()}`}
										type='range'
										{...porpsMinMax[index]}
										value={targetValues[index]}
										onChange={(event) => {
											targetValueChangeHandler(event.target.value, index);
										}}
										step={config.category_target_value_step[index]}
									/>
									<p className='dvsc_tab'>
										<output className='dvsc_target_value_input_display' for={`dvsc_target_value_input_${(index + 1).toString()}`}>
											{targetValues[index]}
										</output>
										<span> {config.category_value_unit[index].toString()} </span>
									</p>
								</td>
								<td className='dvsc_bias'>
									<input
										className='dvsc_bias_input'
										id={`dvsc_bias_input_${(index + 1).toString()}`}
										min='-5'
										max='5'
										type='range'
										step='1'
										value={biasInputValues[index]}
										onChange={(event) => {
											biasChangeHandler(event.target.value, index);
										}}
									/>
									<p className='dvsc_tab'>
										<output className='dvsc_bias_input_display' for={`dvsc_bias_input_${(index + 1).toString()}`}>
											{biasInputValues[index]}
										</output>
									</p>
								</td>
								<td className='dvsc_weighting'>
									<input
										className='dvsc_weighting_input'
										id={`dvsc_weighting_input_${(index + 1).toString()}`}
										type='range'
										step='0.01'
										value={weightings[index]}
										onChange={(event) => {
											weightingChangeHandler(event.target.value, index);
										}}
									/>
									<p className='dvsc_tab'>
										<output className='dvsc_weighting_input_display' for={`dvsc_weighting_input_${(index + 1).toString()}`}>
											{weightings[index].toFixed(2)}
										</output>
										<span> %</span>
									</p>
								</td>
								<td>
									<p className='dvsc_tab'>
										<output className='dvsc_category_score'>{scores[index].toFixed(1)}</output>
										<span>/1000</span>
									</p>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className='dvsc_output'>
				<svg xmlns='http://www.w3.org/2000/svg' className='dvsc_output_svg' viewBox='0 0 100 100'>
					<g id='dsvc_fractions'>
						{weightings.map((weight, index) => (
							<>
								<circle
									id={`dsvc_fraction_${(index + 1).toString()}_background`}
									stroke={config.colors[index]}
									class='fraction fraction_bg'
									transform={`rotate(${index > 0 ? getDegrees(index) : 0})`}
									stroke-dasharray={2 * 46 * Math.PI - 6}
									stroke-dashoffset={2 * 46 * Math.PI * (1 - weight / 100.0)}></circle>
								<circle
									id={`dsvc_fraction_${(index + 1).toString()}_indicator`}
									stroke={config.colors[index]}
									class='fraction fraction_bar'
									transform={`rotate(${index > 0 ? getDegrees(index) : 0})`}
									stroke-dasharray={2 * 46 * Math.PI - 6}
									stroke-dashoffset={
										2.0 * 46 * Math.PI * (1.0 - weight * (scores[index] / 1000) * 0.01) > 278
											? 278
											: 2.0 * 46 * Math.PI * (1.0 - weight * (scores[index] / 1000) * 0.01) < 2 * 46 * Math.PI * (1 - weight / 100.0) + 2 * 46 * Math.PI * (1 - weight / 100.0) * 0.05
											? 2 * 46 * Math.PI * (1 - weight / 100.0)
											: 2.0 * 46 * Math.PI * (1.0 - weight * (scores[index] / 1000) * 0.01)
									}></circle>
							</>
						))}
					</g>
					<g id='dvsc_total_score'>
						<circle id='dvsc_score_indicator' stroke={`hsl(${mainScore * 115},78%,45%)`} strokeDasharray={2 * 40 * Math.PI} strokeDashoffset={2 * 40 * Math.PI * (1 - mainScore)}></circle>
						<text id='dvsc_score_text' x='50' y='50' fill={`hsl(${mainScore * 115},78%,45%)`}>
							{(mainScore * 100).toFixed(0)}
						</text>
					</g>
				</svg>
			</div>
		</div>
	);
}
export default DVSC;
