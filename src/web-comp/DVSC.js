//create the templates for the custom HTML ELements
const scoringCalculator = document.createElement("template");
const scoringCategory = document.createElement("template");

// fill the templates with HTML
scoringCalculator.innerHTML = `<div class="dynamic_visual_scoring_calculator" id="no1"><div class="dvsc_settings"><table><thead><th>Category</th><th>Value</th><th>Target Value</th><th>Bias</th><th>Weighting</th><th>Score</th></thead><tbody class="dvsc_table_body"></tbody></table></div><div class="dvsc_output"><svg xmlns="http://www.w3.org/2000/svg" class="dvsc_output_svg" viewBox="0 0 100 100"><g id="dvsc_fractions"></g><g id="dvsc_total_score"><circle id="dvsc_score_indicator"></circle><text id="dvsc_score_text" x="50" y="50">100</text></g></svg></div></div><style>@import "./scoring-calc.css"</style>`;
scoringCategory.innerHTML = `<tr><th class="category_name"></th><td><output class="category_value"> </output><span class="category_unit"></span></td><td><input class="dvsc_target_value_input" type="range" value="" step=""><p class="dvsc_tab"><output class="dvsc_target_value_input_display"></output><span class="category_unit"> </span></p></td><td><input class="dvsc_bias_input" min="-5" max="5" type="range" step="1" value="0"><p class="dvsc_tab"><output class="dvsc_bias_input_display" >0</output></p></td><td><input class="dvsc_weighting_input" type="range" step="0.01" value=""><p class="dvsc_tab"><output class="dvsc_weighting_input_display" ></output><span> %</span></p></td><td><p class="dvsc_tab"><output class="dvsc_category_score_display">-</output><span><sub>/1000</sub></span></p></td><style>@import "./scoring-calc-category.css"</style><tr>`;

/**
 * Defines a new custom HtmlElement, a Web Components which acts as the hub and wrapper for the  scoring-calc-category elements
 */
class ScoringCalc extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: "open", slotAssignment: "manual" });
		this._root.append(scoringCalculator.content.cloneNode(true));
		this.elements = this.children;
		this.categoryCount = null;
		this.categoryNumbers = [];
		this.categoryNames = [];
		this.categoryUnits = [];
		this.categoryValues = [];
		this.categoryTargets = [];
		this.categorySteps = [];
		this.categoryDirections = [];
		this.categoryEvaluations = [];
		this.categoryBiases = [];
		this.categoryWeights = [];
		this.categoryColors = [];
		this.categoryGrains = [];
		this.categoryScores = [];
		this.score = null;
		this.row = this._root.querySelectorAll("scoring-calc-category");
	}
	/**
	 * Executes once at the beginning
	 */
	connectedCallback() {
		this.#assignSlots();
		let totalScoreCircle = this._root.querySelector("#dvsc_score_indicator");
		let svgFractions = this._root.querySelector("#dvsc_fractions");
		totalScoreCircle.setAttribute("stroke-dasharray", (2 * 40 * Math.PI - 6).toString());
		// insert svg circles and apply attributes on them
		for (let i = 0; i < this.categoryCount; i++) {
			let svgFractionBackground = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			let svgFractionScore = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			let svgName = document.createElementNS("http://www.w3.org/2000/svg", "text");
			let svgBackgroundProps = {
				id: "dvsc_fraction_" + i.toString() + "_background",
				stroke: this.categoryColors[i],
				class: "dvsc_fraction dvsc_fraction_bg",
				"stroke-dasharray": (2 * 46 * Math.PI - 6).toString(),
				style:""
			};
			let svgFractionProps = {
				id: "dvsc_fraction_" + i.toString() + "_indicator",
				stroke: this.categoryColors[i],
				class: "dvsc_fraction dvsc_fraction_bar",
				"stroke-dasharray": (2 * 46 * Math.PI - 6).toString(),
				style:""
			};
			let svgTextProps = {
				id: "dvsc_category_name_" + i.toString(),
				class: "category_text",
				style: "text-anchor:middle; dominant-baseline: middle; transform-origin: center",
				x: "50",
				y: "50",
				dx: "0",
				dy: "0",
			};
			this.#applyAttributes(svgFractionBackground, svgBackgroundProps);
			this.#applyAttributes(svgFractionScore, svgFractionProps);
			this.#applyAttributes(svgName, svgTextProps);
			svgFractions.appendChild(svgFractionBackground);
			svgFractions.appendChild(svgFractionScore);
			svgName.innerHTML = this.categoryNames[i];
			svgFractions.appendChild(svgName);
		}
		this.#svgBackgroundCircles = Array.from(this._root.querySelectorAll(".dvsc_fraction_bg"));
		this.#svgScoreCircles = Array.from(this._root.querySelectorAll(".dvsc_fraction_bar"));
		this.#svgTexts = Array.from(this._root.querySelectorAll(".category_text"));
	}

	/**
	 * Finds all children element in the scoring calc. Then dynamically creating a slot in the table body and assigning the children to it.
	 * Also binds a mutation observer to every child element
	 */
	#assignSlots() {
		let tableBody = this._root.querySelector(".dvsc_table_body");
		for (let i = 0; i < this.elements.length; i++) {
			//create an assign slots
			tableBody.appendChild(document.createElement("slot")).assign(this.elements.item(i));
		}
		// select every element
		this.row = this.querySelectorAll("scoring-calc-category");
		this.row.forEach((element, index) => {
			// assign mutation observer to every row
			this.#categoryObservers.push(this.#daemons[index]);
		});
		//  collect starting values
		this.categoryCount = this.childElementCount;
		this.#getState()
		for(let i = 0; i< this.categoryCount; i++){
			this.#listener(this.row[i], i, this.#categoryObservers[i]);
		}
	}

	dump(){
		console.log({
			"elements":this.elements,
			"categoryCount":this.categoryCount,
			"categoryNumbers":this.categoryNumbers,
			"categoryNames":this.categoryNames,
			"categoryUnits":this.categoryUnits,
			"categoryValues":this.categoryValues,
			"categoryTargets":this.categoryTargets,
			"categorySteps":this.categorySteps,
			"categoryDirections":this.categoryDirections,
			"categoryEvaluations":this.categoryEvaluations,
			"categoryBiases":this.categoryBiases,
			"categoryWeights":this.categoryWeights,
			"categoryColors":this.categoryColors,
			"categoryGrains":this.categoryGrains,
			"categoryScores":this.categoryScores,
			"score":this.score,
		})
	}

	#getState(){
		for (let i = 0; i < this.categoryCount; i++) {
			//numbers
			this.categoryNumbers[i] = parseFloat(this.row[i].getAttribute("number"));
			this.categoryValues[i] = parseFloat(this.row[i].getAttribute("value"));
			this.categoryTargets[i] = parseFloat(this.row[i].getAttribute("target"));
			this.categorySteps[i] = parseFloat(this.row[i].getAttribute("step"));
			this.categoryDirections[i] = parseFloat(this.row[i].getAttribute("direction"));
			this.categoryBiases[i] = parseFloat(this.row[i].getAttribute("bias"));
			this.categoryWeights[i] = parseFloat(this.row[i].getAttribute("weight"));
			this.categoryScores[i] = parseFloat(this.row[i].getAttribute("score"));
			this.categoryGrains[i] = parseFloat(this.row[i].getAttribute("grain"));
			//strings
			this.categoryNames[i] = this.row[i].getAttribute("rowname")
			this.categoryUnits[i] = this.row[i].getAttribute("unit")
			this.categoryEvaluations[i] = this.row[i].getAttribute("evaluation");
			this.categoryColors[i] = this.row[i].getAttribute("color");
		}
	}

	#setState() {
		for(let i = 0; i< this.categoryCount; i++){
			this.#categoryObservers[i].disconnect();
			this.row[i].setAttribute("number", this.categoryNumbers[i]);
			this.row[i].setAttribute("rowname", this.categoryNames[i]);
			this.row[i].setAttribute("unit", this.categoryUnits[i]);
			this.row[i].setAttribute("value", this.categoryValues[i]);
			this.row[i].setAttribute("target", this.categoryTargets[i]);
			this.row[i].setAttribute("step", this.categorySteps[i]);
			this.row[i].setAttribute("direction", this.categoryDirections[i]);
			this.row[i].setAttribute("evaluation", this.categoryEvaluations[i]);
			this.row[i].setAttribute("bias", this.categoryBiases[i]);
			this.row[i].setAttribute("weight", this.categoryWeights[i]);
			this.row[i].setAttribute("color", this.categoryColors[i]);
			this.row[i].setAttribute("grain", this.categoryGrains[i]);
			this.#categoryObservers[i].observe(this.row[i], this.#observerOptions);
		}
	}

	/**
	 * calculates all weights, if one weight is being adjusted, so the sum of all weight always stays 100%
	 * @param {Object} weightChanges
	 */
	#calcWeights(categoryNumber) {
		let currentAdjustmentIndex = parseInt(categoryNumber);
		// calculate only if there is more than one category
		if (this.categoryCount !== 1 && this.categoryCount !== 0) {
			let matrix = new Array(this.categoryCount - 1);
			let vector = new Array(this.categoryCount - 1);
			// assemble the matrix and the vector to use linear algebra
			for (let i = 0; i < this.categoryCount - 1; i++) {
				if (i == 0) {
					vector[i] = [100 - parseFloat(this.categoryWeights[currentAdjustmentIndex])];
				} else {
					vector[i] = [0];
				}

				let temp = new Array(this.categoryCount - 1);
				for (let k = 0; k < temp.length; k++) {
					temp[k] = 0;
				}
				matrix[i] = temp;
			}
			for (let row = 0; row < this.categoryCount - 1; row++) {
				for (let column = 0; column < this.categoryCount - 1; column++) {
					if (row == 0) {
						matrix[row][column] = 1;
					} else {
						if (column == row - 1) {
							matrix[row][column] = parseFloat(-this.categoryWeights[row + 1]);
						}
						if (column == row) {
							matrix[row][column] = parseFloat(this.categoryWeights[row]);
						}
					}
				}
			}
			let newPercentages = this.#matrixCalculations(matrix, vector);
			// insert the current user input back into the array, to get all new weights in an array
			newPercentages.splice(currentAdjustmentIndex, 0, this.categoryWeights[currentAdjustmentIndex]);
			for (let i = 0; i < this.categoryCount; i++) {
				if (newPercentages[i] < 0.01 && i !== currentAdjustmentIndex) {
					// adjust any value below 0.01 to 0.01 by subtracting the amount below 0.01 from the input weight
					newPercentages[currentAdjustmentIndex] = newPercentages[currentAdjustmentIndex] - (0.01 - newPercentages[i]);
					newPercentages[i] = 0.01;
				}
			}
			// apply the new percentages. but only if the input weight is above 0.01. This makes any changes impossible, and the input weight just stays above 0.01
			if (newPercentages[currentAdjustmentIndex] > 0.01) {
				for (let i = 0; i < this.categoryCount; i++) {
					this.categoryWeights[i] = newPercentages[i];
				}
			}
		}
		this.#setState();
	}

	/**
	 * Utility function for calculating the new weight values for every weight, which is not the current input weight
	 * @param {Array} inputMatrix an array of arrays; every nested array should be a row. the resulting matrix must be square (e.g 3 x 3. this also means the scoring calculator has 4 categories)
	 * @param {Array} inputVector an array of arrays; every nested array should be a row and must have the length of 1
	 * @returns {Array}
	 */
	#matrixCalculations(inputMatrix, inputVector) {
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
		function merge(t) {


			return { top: (n) => top(t, n), bottom: (n) => bottom(t, n), left: (n) => left(t, n), right: (n) => right(t, n) };
		}
		function matrix(t) {


			if (!Array.isArray(t)) throw new Error("Input should be of type array");
			return Object.assign(function () {
				let n = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
				return read(t, n);
			}, _mat(t));
		}
		function _mat(t) {


			return {
				size: () => size(t),
				add: (n) => operate(t, n, addition),
				sub: (n) => operate(t, n, subtraction),
				mul: (n) => operate(t, n, multiplication),
				div: (n) => operate(t, n, division),
				prod: (n) => prod(t, n),
				trans: () => trans(t),
				set: function () {
					let n = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
					return { to: (e) => replace(t, e, n) };
				},
				det: () => determinant(t),
				inv: () => invert(t),
				merge: merge(t),
				map: (n) => map(t, n),
				equals: (n) => equals(t, n),
			};
		}
		function size(t) {
			let n = [];
			for (; Array.isArray(t); ) n.push(t.length), (t = t[0]);
			return n;
		}
		function read(t, n) {
			return 0 === n.length ? t : extract(t, n);
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
					for (let n = 0; n < a[1]; n++) for (let a = 0; a < i[1]; a++) void 0 === l[t][n] && (l[t][n] = 0), (l[t][n] += multiplication(e[t][a], r[a][n]));
				}
			return l;
		}
		function multiplication(t, n) {
			return t * n;
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

	/**
	 * Calculate the average score and the set the stroke-dashoffset of the center svg circle, as well as the color
	 */
	#calcScore() {
		let numerator = 0;
		for (let i = 0; i < this.categoryCount; i++) {
			numerator += (parseFloat(this.categoryScores[i]) / 1000) * parseFloat(this.categoryWeights[i] / 100);
		}
		this.score = numerator * 100;
		let totalScoreElement = this._root.querySelector("#dvsc_score_text");
		let totalScoreInd = this._root.querySelector("#dvsc_score_indicator");
		totalScoreElement.innerHTML = this.score.toFixed(0);
		totalScoreElement.setAttribute("fill", "hsl(" + ((this.score / 100) * 115).toString() + ",78%,45%)");
		totalScoreInd.setAttribute("stroke", "hsl(" + ((this.score / 100) * 115).toString() + ",78%,45%)");
		totalScoreInd.setAttribute("stroke-dashoffset", 2 * 40 * Math.PI * (1 - this.score / 100));
	}

	/**
	 * sets the stroke dash offset for every svg element and rotate them to fit into the scheme
	 */
	#setOffset(scores, weights) {
		/**
		 * Returns the x distance from the center
		 * @param {int} currentIndex
		 * @returns {number}
		 */
		function getDX(currentIndex) {
			let degree = 0;
			let rad;
			let dx;
			for (let i = 0; i < currentIndex; i++) {
				degree += parseFloat(weights[i]);
			}
			degree = 3.6 * degree;
			rad = (degree / 180) * Math.PI;
			function F(x) {
				let offset = ((3.6* parseFloat(weights[currentIndex]))/180)*Math.PI/2;
				return 50 * Math.cos(x + offset);
			}
			dx = F(rad);
			return dx;
		}
		/**
		 * Returns the y distance from the center
		 * @param {int} currentIndex
		 * @returns {number}
		 */
		function getDY(currentIndex) {
			let degree = 0;
			let rad;
			let dy;
			for (let i = 0; i < currentIndex; i++) {
				degree += parseFloat(weights[i]);
			}
			degree = 3.6 * degree;
			rad = (degree / 180) * Math.PI;
			function F(x) {
				let offset = ((3.6* parseFloat(weights[currentIndex]))/180)*Math.PI/2;
				return 50 * Math.sin(x + offset);
			}
			dy = F(rad);
			return dy;
		}
		
		/**
		 * get the offset in degrees for the current index category circle part
		 * @param {int} currentIndex
		 * @returns number
		 */
		function getDegrees(currentIndex) {
			let degree = 0;
			for (let i = 0; i < currentIndex; i++) {
				degree += parseFloat(weights[i]);
			}
			return 3.6 * degree;
		}

		//setting the length and position on the circle for every category background circle arch
		this.#svgBackgroundCircles.forEach((element, index) => {
			element.setAttribute("stroke-dashoffset", 2 * 46 * Math.PI * (1 - weights[index] / 100.0));
			if (index >= 1) {
				element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
			}
		});
		//setting the length and position on the circle for every category scoring circle arch
		this.#svgScoreCircles.forEach((element, index) => {
			element.setAttribute(
				"stroke-dashoffset",
				2.0 * 46 * Math.PI * (1.0 - weights[index] * (scores[index] / 1000) * 0.01) > 278
					? 278
					: 2.0 * 46 * Math.PI * (1.0 - weights[index] * (scores[index] / 1000) * 0.01) < 2 * 46 * Math.PI * (1 - weights[index] / 100.0) + 2 * 46 * Math.PI * (1 - weights[index] / 100.0) * 0.05
					? 2 * 46 * Math.PI * (1 - weights[index] / 100.0)
					: 2.0 * 46 * Math.PI * (1.0 - weights[index] * (scores[index] / 1000) * 0.01)
			);
			if (index >= 1) {
				element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
			}
		});

		//setting the position for every category text element near to its circle part
		this.#svgTexts.forEach((element, index) => {
				let positionX = getDX(index);
				let positionY  = getDY(index);
				if(positionX > 12){
					element.style.transform = "translateX(" + element.getBoundingClientRect().width/4  +"px)";
				}
				else if(positionX < -12 ){
					element.style.transform = "translateX(" + -1*element.getBoundingClientRect().width/4  +"px)";
				}
				else if(positionX <= 12 && positionX >= -12 ){
					element.style.transform = "translateX(0px)";
					if(positionY > 0){
						element.style.transform = "translateY(" +  element.getBoundingClientRect().height/4 +"px)";
					}
					else{
						element.style.transform = "translateY(" +  -1*element.getBoundingClientRect().height/4 +"px)";
					}
				}
				if( positionY <= -12 && positionY >= 12){
					element.style.transform = "translateY(0px)";
					if(positionX < 0){
						element.style.transform = "translateX(" + -1*element.getBoundingClientRect().width +"px)";
					}
				}

				element.setAttribute("dx", getDX(index));
				element.setAttribute("dy", getDY(index));
		});
	}

	/**
	 * A utility function to apply attributes stored in an object to an element
	 * @param {HTMLElement} element
	 * @param {Object} attributes
	 */
	#applyAttributes(element, attributes) {
		for (const key in attributes) {
			element.setAttribute(key, attributes[key]);
		}
	}

	/**
	 * apply mutation observer to wanted element(observable)
	 * @param {HTMLElement} observable
	 * @param {int} number
	 * @param {MutationObserver} observer
	 */
	#listener = (observable, number, observer) => {
		observer.observe(observable, this.#observerOptions);
	};

	/**
	 *  define what should happen once a observer observers any change
	 * @param {MutationRecordType} entries
	 * @param {MutationObserver} observer
	 */
	#callback = (entries, observer) => {
		if ((entries.type = "attributes")) {
				for(let i = 0; i < entries.length; i++){
					switch(entries[i].attributeName){
						case "weight":
							this.#getState()
							this.#calcWeights(entries[0].target.number);
							this.#calcScore();
							this.#setOffset( this.categoryScores, this.categoryWeights);
							break;
						case "score":
							this.#getState()
							this.#calcScore();
							this.#setOffset( this.categoryScores, this.categoryWeights);
					}
				}
		}
	};

	/**
	 * collect the info about every category and store them in an accessible Array
	 */
	#svgBackgroundCircles = [];
	#svgScoreCircles = [];
	#svgTexts = [];
	#categoryObservers = [];
	#changingAttributes = { weight: null, index: null, score: null };
	// only observe the attributes weight and score
	#observerOptions = {
		childList: false,
		attributes: true,
		characterData: false,
		subtree: false,
		attributeFilter: ["weight", "score"],
		attributeOldValue: false,
		characterDataOldValue: false,
	};
	// these are sort of "event listeners". the number of rows is limited by the length of this array (16)
	#daemons = [
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
		new MutationObserver(this.#callback),
	];
}

/**
 * Defines a new html element which will act as a row in the scoring calculator
 */
class ScoringCalcCategory extends HTMLElement {
	static get observedAttributes() {
		return ["number", "rowName", "unit", "value", "target", "step", "direction", "evaluation", "bias", "weight", "score", "color"];
	}

	constructor() {
		super();
		this._root = this.attachShadow({ mode: "open" });
		this._root.append(scoringCategory.content.cloneNode(true));
		this.number = "";
		this.rowName = "";
		this.unit = "";
		this.value = "";
		this.target = "";
		this.step = "";
		this.direction = "";
		this.evaluation = "";
		this.grain = "";
		this.bias = "";
		this.weight = "";
		this.score = "";
		this.color = "";
	}
	//execute once at the beginning
	connectedCallback() {
		this.#addListeners();
		this.#init();
		this.#prep();
		this.#getTargetLimit();
		this.#calcScore();
	}

	//execute once the weight attribute experienced changes from the outside(<scoring-calc>)
	attributeChangedCallback(name, oldValue, newValue) {
		if (name == "weight" && name !== "rowname") {
			let weightingInput = this._root.querySelector(".dvsc_weighting_input");
			let weightingOutput = this._root.querySelector(".dvsc_weighting_input_display");
			weightingInput.value = newValue;
			weightingInput.setAttribute("value", newValue);
			weightingOutput.innerHTML = parseFloat(newValue).toFixed(2);
		}
		// if(name == "rowName" || name == "rowname"){
		// 	let categoryName = this._root.querySelector(".category_name");
		// 	categoryName.innerHTML = newValue;
		// 	this.setAttribute("rowname", newValue );
		// 	this.rowName = newValue;
		// }
	}

	// import all attribute data
	#init() {
		this.number = this.getAttribute("number") ?? "0";
		this.rowName = this.getAttribute("rowName") ?? "default";
		this.unit = this.getAttribute("unit") ?? "bars";
		this.value = this.getAttribute("value") ?? "56";
		this.target = this.getAttribute("target") ?? "44";
		this.step = this.getAttribute("step") ?? "4";
		this.direction = this.getAttribute("direction") ?? "1";
		this.evaluation = this.getAttribute("evaluation") ?? "linear";
		this.bias = this.getAttribute("bias") ?? "0";
		this.weight = this.getAttribute("weight") ?? "25";
		this.score = this.getAttribute("score") ?? "500";
		this.color = this.getAttribute("color") ?? "#ff0000";
		this.grain = this.getAttribute("grain") ?? "1";
		this.setAttribute("number", this.number);
		this.setAttribute("rowName", this.rowName);
		this.setAttribute("unit", this.unit);
		this.setAttribute("value", this.value);
		this.setAttribute("target", this.target);
		this.setAttribute("step", this.step);
		this.setAttribute("direction", this.direction);
		this.setAttribute("evaluation", this.evaluation);
		this.setAttribute("bias", this.bias);
		this.setAttribute("weight", this.weight);
		this.setAttribute("score", this.score);
		this.setAttribute("color", this.color);
		this.setAttribute("grain", this.grain);
		let targetValueInput = this._root.querySelector(".dvsc_target_value_input");
		let biasInput = this._root.querySelector(".dvsc_bias_input");
		targetValueInput.setAttribute("step", this.step);
		targetValueInput.setAttribute("value", this.target);
		biasInput.setAttribute("value", this.bias);
	}

	// display all attribute data
	#prep() {
		let categoryName = this._root.querySelector(".category_name");
		let categoryUnit = this._root.querySelectorAll(".category_unit");
		let categoryValue = this._root.querySelector(".category_value");
		let targetValueOutput = this._root.querySelector(".dvsc_target_value_input_display");
		let biasOutput = this._root.querySelector(".dvsc_bias_input_display");
		let weightingOutput = this._root.querySelector(".dvsc_weighting_input_display");
		let scoreOutput = this._root.querySelector(".dvsc_category_score_display");
		categoryName.innerHTML = this.rowName;
		categoryUnit.forEach((element) => {
			element.innerHTML = this.unit;
		});
		categoryValue.innerHTML = this.value;
		targetValueOutput.innerHTML = this.target;
		biasOutput.innerHTML = this.bias;
		weightingOutput.innerHTML = this.weight;
		scoreOutput.innerHTML = this.score;
	}

	// add eventListeners to every input
	#addListeners() {
		let targetValueInput = this._root.querySelector(".dvsc_target_value_input");
		let targetValueOutput = this._root.querySelector(".dvsc_target_value_input_display");
		targetValueInput.addEventListener("input", () => {
			this.target = targetValueInput.value;
			targetValueOutput.innerHTML = targetValueInput.value;
			this.setAttribute("target", targetValueInput.value);
			this.#calcScore(this.number);
		});

		let biasInput = this._root.querySelector(".dvsc_bias_input");
		let biasOutput = this._root.querySelector(".dvsc_bias_input_display");
		biasInput.addEventListener("input", () => {
			this.bias = biasInput.value;
			biasOutput.innerHTML = biasInput.value;
			this.setAttribute("bias", biasInput.value);
			this.#calcScore(this.number);
		});

		let weightingInput = this._root.querySelector(".dvsc_weighting_input");
		let weightingOutput = this._root.querySelector(".dvsc_weighting_input_display");
		weightingInput.addEventListener("input", () => {
			//disallow the weight input value to reach 0, because this messes with the matrix calculation.
			// once a weight reaches 0 it will stay at 0 and can not be passively changed anymore by changing another weight
			this.weight = weightingInput.value < 0.01 ? 0.01 : weightingInput.value;
			weightingOutput.innerHTML = weightingInput.value < 0.01 ? 0.01 : weightingInput.value;
			this.setAttribute("weight", weightingInput.value < 0.01 ? 0.01 : weightingInput.value);
		});
	}

	#getTargetLimit() {
		let targetValueInput = this._root.querySelector(".dvsc_target_value_input");
		if (this.direction == "1") {
			// set min or max values for target value range input slider
			targetValueInput.setAttribute("max", this.value);
			if (this.getAttribute("unit") !== "%") {
				//estimate a reasonable min input value based on the grain attribute
				targetValueInput.setAttribute("min", parseFloat(this.value) - parseFloat(this.getAttribute("grain")) * 5);
			} else {
				// disallow percentages above 100 or below 0
				targetValueInput.setAttribute("min", 0);
			}
		} else if (this.direction == "-1") {
			targetValueInput.setAttribute("min", this.value);
			// disallow percentages above 100 or below 0
			if (this.getAttribute("unit") !== "%") {
				//estimate a reasonable max input value based on the grain attribute
				targetValueInput.setAttribute("max", parseFloat(this.value) + parseFloat(this.getAttribute("grain")) * 14);
			} else {
				targetValueInput.setAttribute("max", 100);
			}
		}
	}

	#getScoreLinear(value, bias, target, direction, grain) {
		let g = (100 * grain) / 5;
		if (g === 0) {
			throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
		} else if (direction === 0) {
			throw console.error("Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')");
		}
		let b = ((bias - 5.001) / (-bias - 5.001)) * (1 / g);
		function h(x) {
			return direction * (x - target);
		}
		function f(x) {
			return (1000 / Math.PI) * Math.atan(1000 * x);
		}
		let factor = f(-h(value)) + f(h(value)) * (-b * h(value) + 1) + f(h(value - 1 / (direction * b))) * (b * h(value) - 1) + 500;

		return factor < 0.0001 ? 0.0001 : factor;
		// https://www.desmos.com/calculator/qp8yb4jbnz
	}
	#getScoreQuadratic(value, bias, target, direction, grain) {
		let b = (bias - 5.001) / (bias + 5.001);
		let g = 1 / (1.38648041843 * grain);
		if (g === 0) {
			throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
		} else if (direction === 0) {
			throw console.error("Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')");
		}
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
	#getScoreCubic(value, bias, target, direction, grain) {
		let b = (bias - 5.001) / (bias + 5.001);
		let g = 1 / (1.38648041843 * grain);
		if (g === 0) {
			throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
		} else if (direction === 0) {
			throw console.error("Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')");
		}
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

	#calcScore() {
		let scoreOutput = this._root.querySelector(".dvsc_category_score_display");

		if (this.evaluation == "lin" || this.evaluation == "linear") {
			this.score = this.#getScoreLinear(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain));
			scoreOutput.innerHTML = this.#getScoreLinear(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain)).toFixed(2);
			this.setAttribute("score", this.score);
		}
		if (this.evaluation == "quad" || this.evaluation == "quadratic") {
			this.score = this.#getScoreQuadratic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain));
			scoreOutput.innerHTML = this.#getScoreQuadratic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain)).toFixed(2);
			this.setAttribute("score", this.score);
		}
		if (this.evaluation == "cube" || this.evaluation == "cubic") {
			this.score = this.#getScoreCubic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain));
			scoreOutput.innerHTML = this.#getScoreCubic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain)).toFixed(2);
			this.setAttribute("score", this.score);
		}
	}
}

// make the custom elements available to use in the HTML doc
customElements.define("scoring-calc", ScoringCalc);
customElements.define("scoring-calc-category", ScoringCalcCategory);
