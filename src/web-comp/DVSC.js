

const scoringCalculator = document.createElement("template");
scoringCalculator.innerHTML = `
<div class="dynamic_visual_scoring_calculator" id="no1">
            <div class="dvsc_settings">
                <table>
                    <thead>
                        <th>Category</th>
                        <th>Value</th>
                        <th>Target Value</th>
                        <th>Bias</th>
                        <th>Weighting</th>
                        <th>Score</th>
                    </thead>
                    <tbody class="dvsc_table_body">
                    
                    </tbody>
                </table>
              
            </div>
            <div class="dvsc_output">
                <svg xmlns="http://www.w3.org/2000/svg" class="dvsc_output_svg" viewBox="0 0 100 100">
                <g id="dvsc_fractions">
                    </g>
                    <g id="dvsc_total_score">
                        <circle id="dvsc_score_indicator"></circle>
                        <text id="dvsc_score_text" x="50" y="50">100</text>
                    </g>
                </svg>
            </div>
        </div>
        <style>
            @import "./scoring-calc.css"
        </style>

`

class ScoringCalc extends HTMLElement{
    constructor(){
        super();
        this.temp = null;
        const shadow = this.attachShadow({ mode: "open", slotAssignment: "manual"});
        shadow.append(scoringCalculator.content.cloneNode(true));
        this.elements = this.children;
        this.tableBody = shadow.querySelector(".dvsc_table_body");
        this.slots = Array.from(shadow.querySelectorAll("slot"));
        this.fractions = shadow.querySelector("#dvsc_fractions");
        this.totalScoreText = shadow.querySelector("#dvsc_score_text");
        this.totalScoreCircle = shadow.querySelector("#dvsc_score_indicator");
        this.row = shadow.querySelectorAll("scoring-calc-category");
        this.categoryCount = 0;
        this.changingAttributes = {weight: null, index: null};
        this.weights = [];
        this.observers = [];
        this.observerOptions = {
            childList: false,
            attributes: true,
            characterData: false,
            subtree: false,
            attributeFilter: ['weight','score'],
            attributeOldValue: false,
            characterDataOldValue: false
        };
        this.look = (observable,number,observer) => {
            observer.observe(observable, this.observerOptions);
        };
        this.callback = (entries,observer) =>{
            if(entries.type = "attributes"){
                this.changingAttributes =  {weight:entries[0].target.weight, index: entries[0].target.number, score: entries[0].target.score};
                this.calcWeights(this.changingAttributes)
                this.calcScore()
            
            }
        };
        this.daemon = [
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback),
                        new MutationObserver(this.callback)
        ];

    };

    connectedCallback(){
        this.assignSlots()
        this.totalScoreCircle.setAttribute("stroke-dasharray", ((2 * 40 * Math.PI) - 6).toString())
    }

    assignSlots(){
        for(let i = 0; i <this.elements.length; i++){
            this.tableBody.appendChild(document.createElement("slot")).assign(this.elements.item(i));
        }
        this.row = this.querySelectorAll("scoring-calc-category")
    
        this.row.forEach((element, index)=>{
            this.observers.push(this.daemon[index]);
         });
         this.categoryCount = this.childElementCount
        for(let i = 0; i <this.categoryCount; i++){
            // console.log(element)
            this.look(this.row[i], i, this.observers[i]);
         }
    }

    calcWeights(weightChanges){
        if(this.categoryCount !== 1 && this.categoryCount !== 0) {
        this.weights = [];
        this.row.forEach((element,index)=>{
            if(element.weight >= 0.01 && element.weight !== null && element.weight !== undefined){
            this.weights.push(element.weight);
            }
            else if(element.weight < 0.01){
                this.weights.push(0.01);
                this.observers[index].disconnect()
                element.setAttribute("weight", 0.01)
                this.observers[index].observe(element, this.observerOptions)
            }
        })
        // console.log(this.weights);// inputStatus
        // console.log(this.categoryCount);// categoryCount
        // console.log(weightChanges.weight);// userInput
        // console.log(weightChanges.index);// currentAdjustmentIndex
        let inputStatus = this.weights;
        let userInput = weightChanges.weight > 0.01 ? weightChanges.weight : 0.01;
        let currentAdjustmentIndex = weightChanges.index;
        let matrix = new Array(this.categoryCount - 1);
        let vector = new Array(this.categoryCount - 1);
        for (let i = 0; i < this.categoryCount - 1; i++) {
            
            if(i == 0){
                vector[i] = [100 - userInput];
            }
            else{
                vector[i] = [0];
            }

            let temp = new Array(this.categoryCount -1);
            for(let k = 0; k < temp.length; k++){
                temp[k] = 0;
            }
            matrix[i] = temp;
        
        } 
        for(let row = 0; row < this.categoryCount - 1; row++ ){
            for(let column = 0; column< this.categoryCount -1; column++){
                if (row == 0) {
                    matrix[row][column] = 1;
                }
                else{
                    if(column == row - 1){
                        matrix[row][column] = - inputStatus[row +1];
                    }
                    if(column == row){
                        matrix[row][column] = inputStatus[row]
                    }
                }

            }
        }

        let newPercentages =  this.matrixCalculations(matrix, vector);
        newPercentages.splice(currentAdjustmentIndex, 0, userInput);
        for(let i = 0; i< this.categoryCount; i++){
            if(newPercentages[i] < 0.01 && i !== currentAdjustmentIndex ){
                newPercentages[currentAdjustmentIndex] = newPercentages[currentAdjustmentIndex] - (0.01 - newPercentages[i]);
                newPercentages[i] = 0.01;
            }
        }
    
        if(newPercentages[currentAdjustmentIndex] > 0.01){
            for(let i = 0; i<this.categoryCount; i++){
              this.observers[i].disconnect()
              this.row[i].setAttribute("weight",newPercentages[i]);
              this.observers[i].observe(this.row[i], this.observerOptions)
                // let t = parseFloat(newPercentages[i]).toFixed(2);
                // weighting_inputs_displays[i].innerHTML = t;
            }
        }

    }
    else{
        
    }

    }
        
    matrixCalculations( inputMatrix, inputVector){
        let output;
        
 
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

 
 function merge(base) {
	return {
		top: (mergeData) => top(base, mergeData),
		bottom: (mergeData) => bottom(base, mergeData),
		left: (mergeData) => left(base, mergeData),
		right: (mergeData) => right(base, mergeData),
	};
}

 
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

 
 function size(mat) {
	let s = [];
	while (Array.isArray(mat)) {
		s.push(mat.length);
		mat = mat[0];
	}
	return s;
}

 
 function dimensions(mat) {
	return size(mat).length;
}

 
 function read(mat, args) {
	if (args.length === 0) {
		return mat;
	} else {
		return extract(mat, args);
	}
}

 
 function extract(mat, args) {
	let dim = dimensions(mat);
	for (let i = 0; i < dim; i++) {
		let d = args[i];
		if (d === undefined) {
			break;
		}
		if (Array.isArray(d)) {
			
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

 
 function replace(mat, value, args) {
	
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

 
 function clone(mat) {
	let result = [];
	for (let i = 0; i < mat.length; i++) {
		result.push(mat[i].slice(0));
	}
	return result;
}

 
 function addition(op1, op2) {
	return op1 + op2;
}

 
 function subtraction(op1, op2) {
	return op1 - op2;
}

 
 function multiplication(op1, op2) {
	return op1 * op2;
}

 
 function division(op1, op2) {
	return op1 / op2;
}

 
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

 
 function interchange(mat, ind1, ind2) {
	let temp = mat[ind1];
	mat[ind1] = mat[ind2];
	mat[ind2] = temp;
}

 
 function invert(mat) {
	let rationalized = rationalize(mat);
	let siz = size(mat);
	let result = rationalize(identity(siz[0]));

	
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

 
 function rationalize(mat) {
	let rationalized = [];
	mat.forEach((row, ind) => {
		rationalized.push(row.map((ele) => rational(ele)));
	});
	return rationalized;
}

 
 function derationalize(mat) {
	let derationalized = [];
	mat.forEach((row, ind) => {
		derationalized.push(row.map((ele) => ele.num / ele.den));
	});
	return derationalized;
}

 
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

 
 function identity(size) {
	let result = generate(size, 0);
	result.forEach((row, index) => {
		row[index] = 1;
	});
	return result;
}

 
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
        let b = matrix(inputVector);
        let MatrixInverse = A.inv();
        output = prod(MatrixInverse,b);
        return output.flat();
    }


    calcScore(){
        let scores =  [];
        let allWeights = [];
        for(let i = 0; i < this.categoryCount; i++){
                scores.push(this.row[i].getAttribute("score"));
                allWeights.push(this.row[i].getAttribute("weight"));
        }
        let numerator = 0;
        for(let i = 0; i< this.categoryCount; i++){
            numerator += (scores[i]/1000)*parseFloat(allWeights[i]/100);
        }
        let totalScore = numerator*100;
        this.totalScoreText.innerHTML = totalScore.toFixed(0);
        this.totalScoreText.setAttribute("fill" , "hsl("+((totalScore/100)*115).toString()+",78%,45%)");
        this.totalScoreCircle.setAttribute("stroke", "hsl(" + ((totalScore / 100) * 115).toString() + ",78%,45%)");
        this.totalScoreCircle.setAttribute("stroke-dashoffset", 2*40*Math.PI*(1-totalScore/100));
    }

    




//-----------------------------------------------
}

 customElements.define("scoring-calc", ScoringCalc);






 const scoringCategory = document.createElement("template");
 scoringCategory.innerHTML=`
    <tr>
   
        <th class="category_name"></th>
        <td>            
            <output class="category_value"> </output>
            <span class="category_unit"></span>
        </td>
        <td>
            <input 
                class="dvsc_target_value_input" 
                type="range" 
                value="" 
                step="">
            <p class="dvsc_tab">
                <output class="dvsc_target_value_input_display"></output>
                <span class="category_unit"> </span>
            </p>
        </td>
        <td>
            <input 
                class="dvsc_bias_input" 
                min="-5" 
                max="5" 
                type="range"
                step="1"
                value="0">
            <p class="dvsc_tab">
                <output class="dvsc_bias_input_display" >0</output>
            </p>
        </td>
        <td>
            <input 
                class="dvsc_weighting_input" 
                type="range"
                step="0.01"
                value="">
            <p class="dvsc_tab">
                <output class="dvsc_weighting_input_display" ></output>
                <span> %</span>
            </p>
        </td>
        <td>
            <p class="dvsc_tab">
                <output class="dvsc_category_score_display">-</output><span><sub>/1000</sub></span>
            </p>
        </td>
        <style>
            @import "./scoring-calc-category.css"
         </style>
    <tr>
    `
class ScoringCalcCategory extends HTMLElement{

    static get observedAttributes(){
        return ['number', 'rowName', "unit", "value","target","step","direction","evaluation","bias","weight","score","color"]
    }

    constructor(){
        super();
        const shadow = this.attachShadow({mode: "open"});
        shadow.append(scoringCategory.content.cloneNode(true));
        this.number="";this.rowName="";this.unit="";this.value="";this.target="";this.step="";this.direction="";this.evaluation="";this.grain="";this.bias="";this.weight="";this.score="";this.color="";
        this.categoryName = shadow.querySelector(".category_name");
        this.categoryUnit = shadow.querySelectorAll(".category_unit");
        this.categoryValue = shadow.querySelector(".category_value");
        this.targetValueInput = shadow.querySelector(".dvsc_target_value_input");
        this.biasInput = shadow.querySelector(".dvsc_bias_input");
        this.weightingInput = shadow.querySelector(".dvsc_weighting_input");
        this.targetValueOutput = shadow.querySelector(".dvsc_target_value_input_display");
        this.biasOutput = shadow.querySelector(".dvsc_bias_input_display");
        this.weightingOutput = shadow.querySelector(".dvsc_weighting_input_display");
        this.scoreOutput = shadow.querySelector(".dvsc_category_score_display");
        this.targetValueInput.addEventListener("input",()=>{
           this.target = this.targetValueInput.value;
           this.targetValueOutput.innerHTML = this.targetValueInput.value;
           this.setAttribute("target", this.targetValueInput.value)
           this.calcScore(this.number);
         
        });
        this.biasInput.addEventListener("input",()=>{
            this.bias = this.biasInput.value;
            this.biasOutput.innerHTML = this.biasInput.value;
            this.setAttribute("bias", this.biasInput.value);
            this.calcScore(this.number)
        });
        this.weightingInput.addEventListener("input",(event)=>{
            this.weight = this.weightingInput.value < 0.01 ? 0.01 : this.weightingInput.value;
            this.weightingOutput.innerHTML = this.weightingInput.value < 0.01 ? 0.01 : this.weightingInput.value;
            this.setAttribute("weight", this.weightingInput.value < 0.01 ? 0.01 : this.weightingInput.value)
        })



    }
    connectedCallback(){
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
        this.categoryValue.innerHTML = this.value
        this.targetValueOutput.innerHTML = this.target;
        this.biasOutput.innerHTML = this.bias;
        this.weightingOutput.innerHTML = this.weight;
        this.scoreOutput.innerHTML = this.score;
        this.categoryName.innerHTML = this.rowName;
        this.categoryUnit.forEach((element)=>{element.innerHTML = this.unit;});
        this.getTargetLimit()
        this.targetValueInput.setAttribute("step", this.step)
    }   
    getTargetLimit(){
        if (this.direction == "1"){// set min or max values for target value range input slider
            this.targetValueInput.setAttribute("max", this.value)
            // document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", inputData[i-1].toString());
        }
        else if( this.direction == "-1" ){
            this.targetValueInput.setAttribute("min", this.value)
            // document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", inputData[i - 1].toString());
        }
    }
     getScoreLinear(value,bias,target,direction,grain){
        let g = (100*grain)/5;
        if( g === 0 ){
            throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
        }
        else if(direction === 0){
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
     getScoreQuadratic(value,bias,target,direction,grain){
        let b = (bias - 5.001) / (bias + 5.001);
        let g = 1 / (1.38648041843 * grain);
        if( g === 0 ){
            throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
        }
        else if(direction === 0){
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
     getScoreCubic(value,bias,target,direction,grain){
        let b = (bias - 5.001) / (bias + 5.001);
        let g = 1 / (1.38648041843 * grain);
        if( g === 0 ){
            throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
        }
        else if(direction === 0){
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
    calcScore(){
            if(this.evaluation == "lin" || this.evaluation == "linear"){
                this.score = this.getScoreLinear(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain));
                this.scoreOutput.innerHTML = this.getScoreLinear(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain)).toFixed(2);
                this.setAttribute("score", this.score);
            }
            if(this.evaluation == "quad" || this.evaluation == "quadratic"){
                this.score = this.getScoreQuadratic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain));
                this.scoreOutput.innerHTML = this.getScoreQuadratic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain)).toFixed(2);
                this.setAttribute("score", this.score);
            }
            if(this.evaluation == "cube" || this.evaluation == "cubic"){
                this.score = this.getScoreCubic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain));
                this.scoreOutput.innerHTML = this.getScoreCubic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain)).toFixed(2);
                this.setAttribute("score", this.score);
            }

        }

    attributeChangedCallback(name, oldValue, newValue){
        if(name == "weight"){
            this.weightingInput.value = newValue;
            this.weightingInput.setAttribute("value", newValue);
            this.weightingOutput.innerHTML = parseFloat(newValue).toFixed(2);
        }
    }

}
customElements.define("scoring-calc-category", ScoringCalcCategory)







