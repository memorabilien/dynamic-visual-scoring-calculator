import calculator from "./matrix.js";
// import matrix.js for simpler linear algebra calculation


let inputData = [ 20, 23, 80, 2];// the set which will be evaluated


// config
let config = {
	category_count: 4,// number of category
	category_names: ["Time", "Cost", "Efficiency", "Personell"],//category title to display
	category_value_unit: ["s", "€", "%", "P"],// category unit to display
	category_target_values: [10, 20, 100, 0],// target value to which a data Point in the data set should converge
	category_target_value_step: [1, 0.01, 0.01, 1],//how big on step on the slider should be
	category_direction: [1, 1, -1, 1],// 1: data point > target value; -1: data point < target value 
	category_grain: [1, 1, 1, 1],// fine tune to the acceptable difference between data point and target value ( IMPORTANT: g !== 0 always)!
	category_evaluation: ["quad", "quad", "quad", "quad"], // how should the score of a category be calculated
	category_weighting_preset: [25, 25, 25, 25], // presets
	colors: ["#ff0000", "#ff7b00", "#ffbb00", "#00dfba", "#127efa", "#8921ff", "#d500e9"], // define the circle colors
};

const frame = document.querySelector(".dvsc_table_body");
const fractions = document.querySelector("#dvsc_fractions");


// appending Categories
for (let i = 1; i < config.category_count + 1; i++) {

	let tr = document.createElement("tr");// creating row element
	tr.innerHTML =`
        <th>`+ config.category_names[i - 1] +`</th>
        <td>            
            <output class="dvsc_data_input_display" for="dvsc_data_input_`+ i.toString() +`" >`+ inputData[i-1] +`</output>
            <span>`+ config.category_value_unit[i - 1].toString() +`</span>
        </td>
        <td>
            <input 
                class="dvsc_target_value_input" 
                id="dvsc_target_value_input_` +i.toString() +`" 
                type="range" 
                value="`+ config.category_target_values[i - 1] +`" 
                step="`+ config.category_target_value_step[i - 1] +`">
            <p class="dvsc_tab">
                <output class="dvsc_target_value_input_display" for="dvsc_target_value_input_` +i.toString() +`">`+ config.category_target_values[i - 1] +`</output>
                <span>`+ config.category_value_unit[i - 1].toString() +`</span>
            </p>
        </td>
        <td>
            <input 
                class="dvsc_bias_input" 
                id="dvsc_bias_input_`+ i.toString() +`" 
                min="-5" 
                max="5" 
                type="range"
                step="1"
                value="0">
            <p class="dvsc_tab">
                <output class="dvsc_bias_input_display" for="dvsc_bias_input_`+ i.toString() +`">0</output>
            </p>
        </td>
        <td>
            <input 
                class="dvsc_weighting_input" 
                id="dvsc_weighting_input_`+ i.toString() +`" 
                type="range"
                step="0.01"
                value="`+ (100/config.category_count).toString() +`">
            <p class="dvsc_tab">
                <output class="dvsc_weighting_input_display" for="dvsc_weighting_input_`+ i.toString() +`">`+ config.category_weighting_preset[i-1] +`</output>
                <span> %</span>
            </p>
        </td>
        <td>
            <p class="dvsc_tab">
                <output class="dvsc_category_score_display">-</output><span>/1000</span>
            </p>
        </td>
    `;
    frame.appendChild(tr);// put row into html document
    if (config.category_direction[i-1] == 1){// set min or max values for target value range input slider
        document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", inputData[i-1].toString());
    }
    else if( config.category_direction[i-1] == -1 ){
        document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", inputData[i - 1].toString());
    }
	
}
// appending SVG circles
for(let i = 1; i< config.category_count + 1; i++ ){
    let fraction ;
    fraction = document.createElementNS("http://www.w3.org/2000/svg", "circle"); // create circle element
    fraction.setAttribute("id", "dvsc_fraction_" + i.toString()+"_background"); // set id
    fraction.setAttribute("stroke", config.colors[i]); // set stroke
    fraction.setAttribute("class", "dvsc_fraction dvsc_fraction_bg"); // set css class
    fraction.setAttribute("stroke-dasharray", ((2 * 46 * Math.PI) - 6).toString()  ); // set str0ke-dasharray
    fractions.appendChild(fraction); // put background circle into html document
    fraction =  document.createElementNS('http://www.w3.org/2000/svg',"circle"); // over write and create another circle element
    fraction.setAttribute("id", "dvsc_fraction_" + i.toString() + "_indicator"); // set it
    fraction.setAttribute("stroke", config.colors[i]); // set stroke
    fraction.setAttribute("class", "dvsc_fraction dvsc_fraction_bar"); // set css class
    fraction.setAttribute("stroke-dasharray", ((2 * 46 * Math.PI) - 6).toString()); // set stroke-dasharray
    fractions.appendChild(fraction); // put indicator circle into html document
}

//select all inputs and outputs
let target_value_inputs = Array.from(document.querySelectorAll(".dvsc_target_value_input"));
let bias_inputs = Array.from(document.querySelectorAll(".dvsc_bias_input"));
let weighting_inputs = Array.from(document.querySelectorAll(".dvsc_weighting_input"));
let target_value_inputs_displays = Array.from(document.querySelectorAll(".dvsc_target_value_input_display"));
let bias_inputs_displays = Array.from(document.querySelectorAll(".dvsc_bias_input_display"));
let weighting_inputs_displays = Array.from(document.querySelectorAll(".dvsc_weighting_input_display"));
let category_scores = Array.from(document.querySelectorAll(".dvsc_category_score_display"));
let scores = []; // init category scores

let category_background_circles = Array.from(document.querySelectorAll(".dvsc_fraction_bg")) ;
let category_score_circles = Array.from(document.querySelectorAll(".dvsc_fraction_bar"));

let totalScoreText = document.querySelector("#dvsc_score_text");
let totalScoreCircle = document.querySelector("#dvsc_score_indicator");
totalScoreCircle.setAttribute("stroke-dasharray", ((2*40*Math.PI)-6).toString() )
//event Listeners
for (let i = 0; i < config.category_count; i++) {
	scores[i] = 0;
	target_value_inputs[i].addEventListener("input", (event) => {
		target_value_inputs_displays[i].innerHTML = event.target.value;
        categoryCompiler(i, config.category_evaluation[i], inputData[i], parseFloat(bias_inputs[i].value), parseFloat(event.target.value), config.category_direction[i], config.category_grain[i]);
        getTotalScore();
        setOffset();

	});
	bias_inputs[i].addEventListener("input", (event) => {
		bias_inputs_displays[i].innerHTML = event.target.value;
        categoryCompiler(i, config.category_evaluation[i], inputData[i], parseFloat(event.target.value), parseFloat(target_value_inputs[i].value), config.category_direction[i], config.category_grain[i]);
        setOffset();
        getTotalScore();

	});
	weighting_inputs[i].addEventListener("input", (event) => {
		getAdjustments( event.target.value , config.category_count, i);
        setOffset();
        getTotalScore();

	});
}


//core logic
function getAdjustments(userInput, categoryCount, currentAdjustmentIndex){
	if(categoryCount !== 1 && categoryCount !== 0) {
        let inputStatus = [];
        weighting_inputs.forEach((element) => {
            inputStatus.push(element.value);
        });


        let matrix = new Array(categoryCount - 1);
        let vector = new Array(categoryCount - 1);
        for (let i = 0; i < categoryCount - 1; i++) {
            
            if(i == 0){
                vector[i] = [100 - userInput];
            }
            else{
                vector[i] = [0];
            }

            let temp = new Array(categoryCount -1);
            for(let k = 0; k < temp.length; k++){
                temp[k] = 0;
            }
            matrix[i] = temp;
        
        } 
        
        for(let row = 0; row < categoryCount - 1; row++ ){
            for(let column = 0; column< categoryCount -1; column++){
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

        let newPercentages =  calculator(matrix, vector);
        newPercentages.splice(currentAdjustmentIndex, 0, userInput);
        for(let i = 0; i< categoryCount; i++){
            if(newPercentages[i] < 0.01 && i !== currentAdjustmentIndex ){
                newPercentages[currentAdjustmentIndex] = newPercentages[currentAdjustmentIndex] - (0.01 - newPercentages[i]);
                newPercentages[i] = 0.01;
            }
        }
    
        if(newPercentages[currentAdjustmentIndex] > 0.01){
            for(let i = 0; i<categoryCount; i++){
                weighting_inputs[i].value = newPercentages[i];
                let t = parseFloat(newPercentages[i]).toFixed(2);
                weighting_inputs_displays[i].innerHTML = t;
            }
        }


    }
    else{
        weighting_inputs_displays[0].innerHTML = (userInput);
    }

}
function categoryCompiler(categoryNumber, categoryEvaluation, categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain){
    let output;
    if (categoryEvaluation == "lin" || categoryEvaluation == "linear") {
		output = linearBias(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
    } else if (categoryEvaluation == "quad" || categoryEvaluation == "quadratic") {
		output = quadraticBias(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
    } else if (categoryEvaluation == "cube" || categoryEvaluation == "cubic") {
		output = cubicBias(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
    }


    category_scores[categoryNumber].innerHTML = output.toFixed(2);
    scores[categoryNumber] = output;
}
function linearBias(value,bias,target,direction,grain){
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
    console.log(factor);
	return factor < 0.0001 ? 0.0001 : parseFloat(factor);
	// https://www.desmos.com/calculator/qp8yb4jbnz
}
function quadraticBias(value,bias,target,direction,grain){
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
function cubicBias(value,bias,target,direction,grain){
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

/**
 * Sets the stroke-dashoffset for every category arch including background and filling
 */
function setOffset(){
    function getDegrees(currentIndex){
        let degree = 0;
         for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(weighting_inputs[i].value);
         } 
         return  3.6 * degree;
    }
    function setScore(currentIndex){
        let degree = 0;
		for (let i = 0; i < currentIndex; i++) {
			degree += parseFloat(weighting_inputs[i].value);
		}
		return 3.6 * degree;
    }

    category_background_circles.forEach((element,index)=>{
        element.setAttribute("stroke-dashoffset", 2 * 46 * Math.PI * (1 - weighting_inputs[index].value / 100.0));
        if(index >= 1){
                 element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
        }
    });
    category_score_circles.forEach((element,index)=>{
        //console.log(Math.min((2.0 * 46 * Math.PI - 6) * (1.0 - weighting_inputs[index].value * (scores[index] / 1000) * 0.01), 2 * 46 * Math.PI - 12));
         element.setAttribute("stroke-dashoffset", 2.0 * 46 * Math.PI * (1.0 - weighting_inputs[index].value * (scores[index] / 1000) * 0.01) > 278 ? 278: 2.0 * 46 * Math.PI * (1.0 - weighting_inputs[index].value * (scores[index] / 1000) * 0.01) < 2 * 46 * Math.PI * (1 - weighting_inputs[index].value / 100.0) + 2 * 46 * Math.PI * (1 - weighting_inputs[index].value / 100.0) * 0.05	? 2 * 46 * Math.PI * (1 - weighting_inputs[index].value / 100.0): 2.0 * 46 * Math.PI * (1.0 - weighting_inputs[index].value * (scores[index] / 1000) * 0.01));
          if (index >= 1) {
			element.setAttribute("transform", "rotate(" + setScore(index).toString() + ")");
		}
    });

}

/**
 * Calculate and Display the total Score [0 ; 100] and adjust the stroke-dashoffset accordingly
 *
 */
function getTotalScore(){
    let numerator = 0;
    for(let i = 0; i< config.category_count; i++){
        numerator += (scores[i]/1000)*parseFloat(weighting_inputs[i].value/100);
    }
    let totalScore = numerator*100;
    totalScoreText.setAttribute("fill" , "hsl("+((totalScore/100)*115).toString()+",78%,45%)");
    totalScoreCircle.setAttribute("stroke", "hsl(" + ((totalScore / 100) * 115).toString() + ",78%,45%)");
    totalScoreCircle.setAttribute("stroke-dashoffset", 2*40*Math.PI*(1-totalScore/100));
    totalScoreText.innerHTML = (totalScore).toFixed(0);
}

// document.addEventListener("mousemove", ()=>{
//     for(let i = 0; i<scores.length; i++){
//         console.log(scores[i]);
//     }
//     console.log('-');
//     for (let i = 0; i < weighting_inputs.length; i++) {
//         console.log(weighting_inputs[i].value);
//     }
//     console.log('---------------------');
// })