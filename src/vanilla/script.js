import calcWeights from "../calcWeights.js";
import { getScoreLinear, getScoreQuadratic, getScoreCubic } from "../calcScores.js";
// import matrix.js for simpler linear algebra calculation


let inputData = [20, 23, 80, 2];// the set which will be evaluated
// config
const config = {
	categoryCount: 4,// number of category
	categoryNames: ["Time", "Cost", "Efficiency", "Personell"],//category title to display
	categoryUnits: ["s", "€", "%", "P"],// category unit to display
	categoryTargets: [10, 20, 100, 0],// target value to which a data Point in the data set should converge
	categorySteps: [1, 0.01, 0.01, 1],//how big on step on the slider should be
	categoryDirections: [1, 1, -1, 1],// 1: data point > target value; -1: data point < target value 
	categoryGrains: [1, 1, 1, 1],// fine tune to the acceptable difference between data point and target value ( IMPORTANT: g !== 0 always)!
	categoryEvaluations: ["linear", "linear", "linear", "linear"], // how should the score of a category be calculated
	categoryWeightPresets: [25, 25, 25, 25], // presets
	categoryColors: ["#FF1D15", "#0075FF", "#61E786", "#ffbb00",  "#FCC217", "#AA3E98", "#34F6F2"], // define the circle colors
};

let categoryTargets,
    categoryBias,
    categoryWeights,
    categoryTargetDisplays,
    categoryBiasDisplays,
    categoryWeightDisplays,
    categoryScoreDisplays,
    svgBackgroundCircles,
    svgScoreCircles,
    svgTexts,
    totalScoreText,
    totalScoreCircle,
    scores;

const tableBody = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody.dvsc_table_body");
const svgFractions = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions");
totalScoreText = document.querySelector("#dvsc_score_text");
totalScoreCircle = document.querySelector("#dvsc_score_indicator");

totalScoreCircle.setAttribute("stroke-dasharray", ((2*40*Math.PI)-6).toString())

scores = []; // init category scores


// appending Categories
    for (let i = 0; i < config.categoryCount; i++) {
        let categoryRow = document.createElement("tr");// creating row element
        let svgFractionBackground = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        let svgFractionScore = document.createElementNS('http://www.w3.org/2000/svg',"circle");
        let svgName = document.createElementNS("http://www.w3.org/2000/svg", "text");
        let svgBackgroundProps = {
            "id": "dvsc_fraction_" + i.toString()+"_background",
            "stroke": config.categoryColors[i],
            "class": "dvsc_fraction dvsc_fraction_bg",
            "stroke-dasharray": ((2 * 46 * Math.PI) - 6).toString(),
        }
        let svgFractionProps = {
            "id": "dvsc_fraction_" + i.toString()+"_indicator",
            "stroke": config.categoryColors[i],
            "class": "dvsc_fraction dvsc_fraction_bar",
            "stroke-dasharray": ((2 * 46 * Math.PI) - 6).toString(),
        }
        let svgTextProps = {
            "id": "dvsc_category_name_" + i.toString(),
            "class":"category_text",
            "style": "text-anchor:middle; dominant-baseline: middle; transform-origin: center",
            "x":"50",
            "y":"50",
            "dx":"0",
            "dy":"0"
        }
        categoryRow.innerHTML =`<th>`+ config.categoryNames[i] +`</th><td><output class="dvsc_data_input_display" for="dvsc_data_input_`+ i.toString() +`" >`+ inputData[i] +`</output><span>`+ config.categoryUnits[i].toString() +`</span></td><td><input class="dvsc_target_value_input" id="dvsc_target_value_input_` +i.toString() +`" type="range" value="`+ config.categoryTargets[i] +`" step="`+ config.categorySteps[i] +`"><p class="dvsc_tab"><output class="dvsc_target_value_input_display" for="dvsc_target_value_input_` +i.toString() +`">`+ config.categoryTargets[i] +`</output><span>`+ config.categoryUnits[i].toString() +`</span></p></td><td><input class="dvsc_bias_input" min="-5" max="5" type="range" step="1" value="0"><p class="dvsc_tab"><output class="dvsc_bias_input_display" >0</output></p></td><td><input class="dvsc_weighting_input" type="range" step="0.01" value="`+ (100/config.categoryCount).toString() +`"><p class="dvsc_tab"><output class="dvsc_weighting_input_display" >`+ config.categoryWeightPresets[i] +`</output><span> %</span></p></td><td><p class="dvsc_tab"><output class="dvsc_category_score_display">-</output><span><sub>/1000</sub></span></p></td>`;
        tableBody.appendChild(categoryRow);// put row into html document
        if (config.categoryDirections[i] == 1){// set min or max values for target value range input slider
            document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", inputData[i].toString());
        }
        else if( config.categoryDirections[i] == -1 ){
            document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", inputData[i].toString());
        }

        applyAttributes(svgFractionBackground, svgBackgroundProps);
        applyAttributes(svgFractionScore, svgFractionProps);
        applyAttributes(svgName, svgTextProps);
        svgFractions.appendChild(svgFractionBackground);
        svgFractions.appendChild(svgFractionScore);
        svgName.innerHTML = config.categoryNames[i];
        svgFractions.appendChild(svgName);
    }


//select all inputs and outputs
categoryTargets = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>input.dvsc_target_value_input"));
categoryBias = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>input.dvsc_bias_input"));
categoryWeights = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>input.dvsc_weighting_input"));
categoryTargetDisplays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_target_value_input_display"));
categoryBiasDisplays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_bias_input_display"));
categoryWeightDisplays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_weighting_input_display"));
categoryScoreDisplays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_category_score_display"));
svgBackgroundCircles = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>circle.dvsc_fraction_bg")) ;
svgScoreCircles = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>circle.dvsc_fraction_bar"));
svgTexts = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>text.category_text"))


//event Listeners
for (let i = 0; i < config.categoryCount; i++) {
	scores[i] = 0;
	categoryTargets[i].addEventListener("input", (event) => {
		categoryTargetDisplays[i].innerHTML = event.target.value;
        categoryCompiler(i, config.categoryEvaluations[i], inputData[i], parseFloat(categoryBias[i].value), parseFloat(event.target.value), config.categoryDirections[i], config.categoryGrains[i]);
        getTotalScore();
        setOffset();

	});
	categoryBias[i].addEventListener("input", (event) => {
		categoryBiasDisplays[i].innerHTML = event.target.value;
        categoryCompiler(i, config.categoryEvaluations[i], inputData[i], parseFloat(event.target.value), parseFloat(categoryTargets[i].value), config.categoryDirections[i], config.categoryGrains[i]);
        setOffset();
        getTotalScore();

	});
	categoryWeights[i].addEventListener("input", (event) => {
		getAdjustments( event.target.value , config.categoryCount, i);
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
        categoryWeights.forEach((element) => {
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

        let newPercentages =  calcWeights(matrix, vector);
        newPercentages.splice(currentAdjustmentIndex, 0, userInput);
        for(let i = 0; i< categoryCount; i++){
            if(newPercentages[i] < 0.01 && i !== currentAdjustmentIndex ){
                newPercentages[currentAdjustmentIndex] = newPercentages[currentAdjustmentIndex] - (0.01 - newPercentages[i]);
                newPercentages[i] = 0.01;
            }
        }
    
        if(newPercentages[currentAdjustmentIndex] > 0.01){
            for(let i = 0; i<categoryCount; i++){
                categoryWeights[i].value = newPercentages[i];
                let t = parseFloat(newPercentages[i]).toFixed(2);
                categoryWeightDisplays[i].innerHTML = t;
            }
        }


    }
    else{
        categoryWeightDisplays[0].innerHTML = (userInput);
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


    categoryScoreDisplays[categoryNumber].innerHTML = output.toFixed(2);
    scores[categoryNumber] = output;
}


/**
 * Sets the stroke-dashoffset for every category arch including background and filling
 */
function setOffset(){
    
    function getDX(currentIndex) {
        let degree = 0;
        let rad;
        let dx;
        for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(categoryWeights[i].value);
        }
        degree = 3.6 * degree;
        rad = (degree / 180) * Math.PI;
        function F(x) {
            let offset = ((3.6* parseFloat(categoryWeights[currentIndex].value))/180)*Math.PI/2;
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
            degree += parseFloat(categoryWeights[i].value);
        }
        degree = 3.6 * degree;
        rad = (degree / 180) * Math.PI;
        function F(x) {
            let offset = ((3.6* parseFloat(categoryWeights[currentIndex].value))/180)*Math.PI/2;
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
    function getDegrees(currentIndex){
        let degree = 0;
         for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(categoryWeights[i].value);
         } 
         return  3.6 * degree;
    }

    //setting the length and position on the circle for every category background circle arch
    svgBackgroundCircles.forEach((element,index)=>{
        element.setAttribute("stroke-dashoffset", 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0));
        if(index >= 1){
                 element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
        }
    });
    //setting the length and position on the circle for every category scoring circle arch 
    svgScoreCircles.forEach((element,index)=>{
        //console.log(Math.min((2.0 * 46 * Math.PI - 6) * (1.0 - categoryWeights[index].value * (scores[index] / 1000) * 0.01), 2 * 46 * Math.PI - 12));
         element.setAttribute("stroke-dashoffset", 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index].value * (scores[index] / 1000) * 0.01) > 278 ? 278: 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index].value * (scores[index] / 1000) * 0.01) < 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0) + 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0) * 0.05	? 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0): 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index].value * (scores[index] / 1000) * 0.01));
          if (index >= 1) {
			element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
		}
    });

    //setting the position for every category text element near to its circle part
    svgTexts.forEach((element,index)=>{
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
        })
}

/**
 * Calculate and Display the total Score [0 ; 100] and adjust the stroke-dashoffset accordingly
 */
function getTotalScore(){
    let numerator = 0;
    for(let i = 0; i< config.categoryCount; i++){
        numerator += (scores[i]/1000)*parseFloat(categoryWeights[i].value/100);
    }
    let totalScore = numerator*100;
    totalScoreText.setAttribute("fill" , "hsl("+((totalScore/100)*115).toString()+",78%,45%)");
    totalScoreCircle.setAttribute("stroke", "hsl(" + ((totalScore / 100) * 115).toString() + ",78%,45%)");
    totalScoreCircle.setAttribute("stroke-dashoffset", 2*40*Math.PI*(1-totalScore/100));
    totalScoreText.innerHTML = (totalScore).toFixed(0);
}

/**
 * applies attributes to an HTML Element
 * @param {HTMLElement} element 
 * @param {object} attributes 
 */
function applyAttributes(element, attributes){
    for(const key in attributes){
        element.setAttribute(key, attributes[key]);
    }
}



// init with a IIEF
(()=>{ 
    for (let i = 0; i < config.categoryCount; i++) {
    categoryCompiler(i, config.categoryEvaluations[i], inputData[i], parseFloat(categoryBias[i].value), parseFloat(categoryTargets[i].value), config.categoryDirections[i], config.categoryGrains[i]);
    setOffset();
    getTotalScore();
    }
})()