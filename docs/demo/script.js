import calculator from "./matrix.js";
import { getScoreLinear, getScoreQuadratic, getScoreCubic } from "./scoreCalc.js";
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
	category_evaluation: ["linear", "linear", "linear", "linear"], // how should the score of a category be calculated
	category_weighting_preset: [25, 25, 25, 25], // presets
	colors: ["#ff0000", "#ff7b00", "#ffbb00", "#00dfba", "#127efa", "#8921ff", "#d500e9"], // define the circle colors
};



const frame = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody.dvsc_table_body");
const fractions = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions");


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
                <output class="dvsc_category_score_display">-</output><span><sub>/1000</sub></span>
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
    let categoryName;
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
    categoryName =  document.createElementNS("http://www.w3.org/2000/svg", "text");
    categoryName.setAttribute("id", "dvsc_category_name_" + i.toString());
    categoryName.setAttribute("class","category_text");
    categoryName.setAttribute("style", "text-anchor:middle; dominant-baseline: middle; transform-origin: center");
    categoryName.setAttribute("x","50");
    categoryName.setAttribute("y","50")
    categoryName.setAttribute("dx","0");
    categoryName.setAttribute("dy","0");
    categoryName.innerHTML = config.category_names[i-1];
    fractions.appendChild(categoryName);
}

//select all inputs and outputs
let target_value_inputs = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>input.dvsc_target_value_input"));
let bias_inputs = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>input.dvsc_bias_input"));
let weighting_inputs = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>input.dvsc_weighting_input"));
let target_value_inputs_displays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_target_value_input_display"));
let bias_inputs_displays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_bias_input_display"));
let weighting_inputs_displays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_weighting_input_display"));
let category_scores = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_category_score_display"));
let scores = []; // init category scores

let category_background_circles = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>circle.dvsc_fraction_bg")) ;
let category_score_circles = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>circle.dvsc_fraction_bar"));
let category_text = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>text.category_text"))

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


/**
 * Calculates and Adjusts every Percentage evenly, depending on which Percentage is being adjusted 
 * @param {number} userInput 
 * @param {int} categoryCount 
 * @param {int} currentAdjustmentIndex 
 */
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

/**
 * Calculate the score for a given category depending on its inputs and display them
 * @param {int} categoryNumber 
 * @param {str} categoryEvaluation 
 * @param {number} categoryValue 
 * @param {int} categoryBias 
 * @param {number} categoryTarget 
 * @param {number} categoryDirection 
 * @param {number} categoryGrain 
 */
function categoryCompiler(categoryNumber, categoryEvaluation, categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain){
    let output;
    if (categoryEvaluation == "lin" || categoryEvaluation == "linear") {
		output = getScoreLinear(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
    } else if (categoryEvaluation == "quad" || categoryEvaluation == "quadratic") {
		output = getScoreQuadratic(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
    } else if (categoryEvaluation == "cube" || categoryEvaluation == "cubic") {
		output = getScoreCubic(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
    }


    category_scores[categoryNumber].innerHTML = output.toFixed(2);
    scores[categoryNumber] = output;
}


/**
 * Sets the stroke-dashoffset for every category arch including background and filling
 */
function setOffset(){
    /**
     * Returns the x distance from the center 
     * @param {int} currentIndex 
     * @returns {number} 
     */
    function getDX(currentIndex){
        let degree = 0;
        let rad;
        let dx;
        for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(weighting_inputs[i].value);
         } 
         degree = 3.6 * degree;

         rad = (degree/180)*Math.PI 

         function F(x){
            // let offset = 0.25 * Math.PI;
            let offset = 0.125 * Math.PI
            return 65* Math.cos(x + offset);
         }
         dx = F(rad);

         return dx;
    }
    /**
     * Returns the y distance from the center 
     * @param {int} currentIndex 
     * @returns {number} 
     */
    function getDY(currentIndex){
        let degree = 0;
        let rad;
        let dy;
        for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(weighting_inputs[i].value);
         } 
         degree = 3.6 * degree;

         rad = (degree/180)*Math.PI 

         function F(x){
            // let offset = 0.25 * Math.PI;
            let offset = 0.125 * Math.PI
            return 65* Math.sin(x + offset);
         }
         dy = F(rad);

         return dy;
    }
    /**
     * Returns the x distance from the center, for the first category 
     * 
     * @returns {number} 
     */
    function getDXStart(){
        // let degree = 3.6  *( parseFloat(weighting_inputs[0].value) + parseFloat(weighting_inputs[1].value)) ;
        let degree = 3.6  *( parseFloat(weighting_inputs[0].value));
        let rad;
        let dx;
         rad = (degree/180)*Math.PI 

         function F(x){
            let offset = -rad/1.5
            return 65* Math.cos(x + offset);
         }
         dx = F(rad);

         return dx;
    }


    /**
     * Returns the y distance from the center for the fist category
     * 
     * @returns {number} 
     */
    function getDYStart(){
        // let degree = 3.6  *( parseFloat(weighting_inputs[0].value) + parseFloat(weighting_inputs[1].value)) ;
        let degree = 3.6  *( parseFloat(weighting_inputs[0].value) );

        let rad;
        let dy;

         rad = (degree/180)*Math.PI 

         function F(x){
            let offset = -rad/1.5
            return 65* Math.sin(x + offset);
         }
         dy = F(rad);

         return dy;
    }


    /**
     * get the offset in degrees for the current index category circle part
     * @param {int} currentIndex 
     * @returns number
     */
    function getDegrees(currentIndex){
        let degree = 0;
         for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(weighting_inputs[i].value);
         } 
         return  3.6 * degree;
    }

    //setting the length and position on the circle for every category background circle arch
    category_background_circles.forEach((element,index)=>{
        element.setAttribute("stroke-dashoffset", 2 * 46 * Math.PI * (1 - weighting_inputs[index].value / 100.0));
        if(index >= 1){
                 element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
        }
    });
    //setting the length and position on the circle for every category scoring circle arch 
    category_score_circles.forEach((element,index)=>{
        //console.log(Math.min((2.0 * 46 * Math.PI - 6) * (1.0 - weighting_inputs[index].value * (scores[index] / 1000) * 0.01), 2 * 46 * Math.PI - 12));
         element.setAttribute("stroke-dashoffset", 2.0 * 46 * Math.PI * (1.0 - weighting_inputs[index].value * (scores[index] / 1000) * 0.01) > 278 ? 278: 2.0 * 46 * Math.PI * (1.0 - weighting_inputs[index].value * (scores[index] / 1000) * 0.01) < 2 * 46 * Math.PI * (1 - weighting_inputs[index].value / 100.0) + 2 * 46 * Math.PI * (1 - weighting_inputs[index].value / 100.0) * 0.05	? 2 * 46 * Math.PI * (1 - weighting_inputs[index].value / 100.0): 2.0 * 46 * Math.PI * (1.0 - weighting_inputs[index].value * (scores[index] / 1000) * 0.01));
          if (index >= 1) {
			element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
		}
    });

    //setting the position for every category text element near to its circle part
    category_text.forEach((element,index)=>{
        if(index >= 1){
            element.setAttribute("dx", getDX(index));
            element.setAttribute("dy", getDY(index));
        }
        if(index === 0){
            element.setAttribute("dx", getDXStart());
            element.setAttribute("dy", getDYStart())
        }
        })


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

// init with a IIEF
(()=>{ 
    for (let i = 0; i < config.category_count; i++) {
    categoryCompiler(i, config.category_evaluation[i], inputData[i], parseFloat(bias_inputs[i].value), parseFloat(target_value_inputs[i].value), config.category_direction[i], config.category_grain[i]);
    setOffset();
    getTotalScore();
    }
})()