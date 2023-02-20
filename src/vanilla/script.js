import calcWeights from "../calcWeights.js";
import { getScoreDefault, getScoreLinear, getScoreQuadratic, getScoreCubic } from "../calcScores.js";
// import matrix.js for simpler linear algebra calculation


// config
let DVSC = {
    categoryBias : [],
    categoryColors: ["#FF1D15", "#0075FF", "#61E786", "#ffbb00",  "#FCC217", "#AA3E98", "#34F6F2"], // define the circle colors
	categoryCount: 4,// number of category
	categoryDirections: [1, 1, -1, 1],// 1: data point > target value; -1: data point < target value 
	categoryEvaluations: ["cube", "linear", "quad", "linear"], // how should the score of a category be calculated
	categoryGrains: [10, 5, 10, 1],// fine tune to the acceptable difference between data point and target value ( IMPORTANT: g !== 0 always)!
	categoryNames: ["Time", "Cost", "Efficiency", "Personell"],//category title to display
    categoryNumbers: [0,1,2,3],
    categoryScores: [],
	categorySteps: [1, 0.01, 0.01, 1],//how big on step on the slider should be
	categoryTargets: [10, 20, 100, 0],// target value to which a data Point in the data set should converge
	categoryUnits: ["s", "€", "%", "P"],// category unit to display
    categoryValues: [20,23,80,2],
	categoryWeights: [25.00, 25.00, 25.00, 25.00], // presets
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
    totalScoreCircle


const tableHeadingRow = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr");
const tableHeadingWeighting = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)");
const tableHeadingWeightingSpan = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting")
const tableBody = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody.dvsc_table_body");
const svgFractions = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions");
totalScoreText = document.querySelector("#dvsc_score_text");
totalScoreCircle = document.querySelector("#dvsc_score_indicator");

totalScoreCircle.setAttribute("stroke-dasharray", ((2*40*Math.PI)-6).toString())



// appending Categories and circles
    for (let i = 0; i < DVSC.categoryCount; i++) {
        let categoryRow = document.createElement("tr");// creating row element
        let svgFractionBackground = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        let svgFractionScore = document.createElementNS('http://www.w3.org/2000/svg',"circle");
        let svgName = document.createElementNS("http://www.w3.org/2000/svg", "text");
        let svgBackgroundProps = {
            "id": "dvsc_fraction_" + i.toString()+"_background",
            "stroke": DVSC.categoryColors[i],
            "class": "dvsc_fraction dvsc_fraction_bg",
            "stroke-dasharray": ((2 * 46 * Math.PI) - 6).toString(),
            "cx": "50",
            "cy": "50",
            "r": "46"
        }
        let svgFractionProps = {
            "id": "dvsc_fraction_" + i.toString()+"_indicator",
            "stroke": DVSC.categoryColors[i],
            "class": "dvsc_fraction dvsc_fraction_bar",
            "stroke-dasharray": ((2 * 46 * Math.PI) - 6).toString(),
            "cx": "50",
            "cy": "50",
            "r": "46"
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
        categoryRow.innerHTML =`<th>`+ DVSC.categoryNames[i] +`</th><td><output class="dvsc_data_input_display" for="dvsc_data_input_`+ i.toString() +`" >`+ DVSC.categoryValues[i] +`</output><span>`+ DVSC.categoryUnits[i].toString() +`</span></td><td><input class="dvsc_target_value_input" id="dvsc_target_value_input_` +i.toString() +`" type="range" value="`+ DVSC.categoryTargets[i] +`" step="`+ DVSC.categorySteps[i] +`"><p class="dvsc_tab"><output class="dvsc_target_value_input_display" for="dvsc_target_value_input_` +i.toString() +`">`+ DVSC.categoryTargets[i] +`</output><span>`+ DVSC.categoryUnits[i].toString() +`</span></p></td><td><input class="dvsc_bias_input" min="-5" max="5" type="range" step="1" value="0"><p class="dvsc_tab"><output class="dvsc_bias_input_display" >0</output></p></td><td><input class="dvsc_weighting_input" type="range" step="0.01" value="`+ (100/DVSC.categoryCount).toString() +`"><p class="dvsc_tab"><output class="dvsc_weighting_input_display" >`+ DVSC.categoryWeights[i] +`</output><span> %</span></p></td><td><p class="dvsc_tab"><output class="dvsc_category_score_display">-</output><span><sub>/1000</sub></span></p></td>`;
        tableBody.appendChild(categoryRow);// put row into html document
        if (DVSC.categoryDirections[i] == 1){// set min or max values for target value range input slider
            document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", DVSC.categoryValues[i].toString());
            switch(DVSC.categoryUnits[i]){
				case "%":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "Percent":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "percent":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "s":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "S":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case  "Seconds":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "seconds":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "min":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "minutes":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "Minutes":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "h":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "hours":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "Hours":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "€":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "Euro":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "euro":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "$":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "Dollar":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				case "dollar":
					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
                      break;
				default:
                    document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", parseFloat(DVSC.categoryValues[i]) - parseFloat(DVSC.categoryGrains[i]) * 5);

			}
            
        }
        else if( DVSC.categoryDirections[i] == -1 ){
            document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", DVSC.categoryValues[i].toString());
            switch(DVSC.categoryUnits[i]){
				case "%":
                    document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", 100);
                    break;
				case "Percent":
                    document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", 100);
                    break;
				case "percent":
                    document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", 100);
                    break;
				default:
                    document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", parseFloat(DVSC.categoryValues[i]) + parseFloat(DVSC.categoryGrains[i]) * 14);
			}

        }


        applyAttributes(svgFractionBackground, svgBackgroundProps);
        applyAttributes(svgFractionScore, svgFractionProps);
        applyAttributes(svgName, svgTextProps);
        svgFractions.appendChild(svgFractionBackground);
        svgFractions.appendChild(svgFractionScore);
        svgName.innerHTML = DVSC.categoryNames[i];
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
for (let i = 0; i < DVSC.categoryCount; i++) {
	DVSC.categoryScores[i] = 0;
	categoryTargets[i].addEventListener("input", (event) => {
        DVSC.categoryTargets[i] = event.target.value;
		categoryTargetDisplays[i].innerHTML = event.target.value;
        categoryCompiler(i, DVSC.categoryEvaluations[i], DVSC.categoryValues[i], parseFloat(categoryBias[i].value), parseFloat(event.target.value), DVSC.categoryDirections[i], DVSC.categoryGrains[i]);
        calcTotalScore();
        setOffset();
        console.log("log")
	});
	categoryBias[i].addEventListener("input", (event) => {
        DVSC.categoryBias[i] = event.target.value;
		categoryBiasDisplays[i].innerHTML = event.target.value;
        categoryCompiler(i, DVSC.categoryEvaluations[i], DVSC.categoryValues[i], parseFloat(event.target.value), parseFloat(categoryTargets[i].value), DVSC.categoryDirections[i], DVSC.categoryGrains[i]);
        setOffset();
        calcTotalScore();

	});
	categoryWeights[i].addEventListener("input", (event) => {
		getAdjustments( event.target.value , DVSC.categoryCount, i);
        setOffset();
        calcTotalScore();
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
                DVSC.categoryWeights[i] = parseFloat(newPercentages[i]);
            }
        }


    }
    else{
        categoryWeightDisplays[0].innerHTML = (userInput);
        DVSC.categoryWeights[0] = parseFloat(userInput);
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
    else if( categoryEvaluation == "def" || categoryEvaluation == "default"){
		output = getScoreDefault(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
    }
    
    categoryScoreDisplays[categoryNumber].innerHTML = output.toFixed(2);
    DVSC.categoryScores[categoryNumber] = output;
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
        //console.log(Math.min((2.0 * 46 * Math.PI - 6) * (1.0 - categoryWeights[index].value * (DVSC.categoryScores[index] / 1000) * 0.01), 2 * 46 * Math.PI - 12));
         element.setAttribute("stroke-dashoffset", 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index].value * (DVSC.categoryScores[index] / 1000) * 0.01) > 278 ? 278: 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index].value * (DVSC.categoryScores[index] / 1000) * 0.01) < 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0) + 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0) * 0.05	? 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0): 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index].value * (DVSC.categoryScores[index] / 1000) * 0.01));
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
function calcTotalScore(){
    let numerator = 0;
    for(let i = 0; i< DVSC.categoryCount; i++){
        numerator += (DVSC.categoryScores[i]/1000)*parseFloat(categoryWeights[i].value/100);
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

// Set weightings manually 
const weightSettingsBtn = document.querySelector(".set_weights_btn");
const discardIcon = `<svg height="26" viewBox="0 0 26 26" width="26" xmlns="http://www.w3.org/2000/svg"><path d="M22.429 12.524a9.905 9.905 0 0 1-9.905 9.905 9.905 9.905 0 0 1-9.905-9.905 9.905 9.905 0 0 1 19.81 0zM8.81 8.81l7.429 7.429m0-7.429L8.81 16.239" fill="none" stroke="#ff1d15" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const approveIcon = `<svg height="26" viewBox="0 0 26 26" width="26" xmlns="http://www.w3.org/2000/svg"><path d="m5.619 12.81 3.714 3.714 9.939-9.905" fill="none" stroke="#61E786" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"/></svg>`;
const settingsIcon = `<svg height="26" viewBox="0 0 26 26" width="26" xmlns="http://www.w3.org/2000/svg"> <g fill="none" fill-rule="evenodd" stroke="#999999" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M12.285 3.619c.434 0 .863.032 1.28.094l.629 1.906a6.784 6.784 0 0 1 1.56.664l1.808-.872a8.683 8.683 0 0 1 1.69 1.719l-.904 1.791a6.79 6.79 0 0 1 .636 1.572l1.895.66a8.748 8.748 0 0 1-.021 2.412l-1.906.629a6.893 6.893 0 0 1-.664 1.56l.872 1.808a8.718 8.718 0 0 1-1.719 1.69l-1.791-.904a6.818 6.818 0 0 1-1.572.636l-.66 1.895a8.748 8.748 0 0 1-2.412-.021l-.629-1.906a6.893 6.893 0 0 1-1.56-.664l-1.808.872a8.718 8.718 0 0 1-1.69-1.719l.904-1.791a6.89 6.89 0 0 1-.636-1.572l-1.895-.661a8.748 8.748 0 0 1 .021-2.41l1.906-.629a6.784 6.784 0 0 1 .664-1.56L5.411 7.01A8.718 8.718 0 0 1 7.13 5.32l1.791.904a6.818 6.818 0 0 1 1.572-.636l.661-1.895a8.741 8.741 0 0 1 1.131-.074z"/><path d="M16 12.285A3.715 3.715 0 0 1 12.285 16a3.715 3.715 0 0 1-3.713-3.715 3.715 3.715 0 0 1 7.428 0z"/></g></svg>`;



weightSettingsBtn.addEventListener("click",()=>{
    // create Elements, if it is the fist interaction
    if(document.querySelector(".manual_input_modal") == undefined || document.querySelector(".manual_input_modal") == null){
        // manual input modal
        let manualInputModal = document.createElement("div");
            manualInputModal.style.width = tableHeadingWeighting.clientWidth + 4  +"px"; 
            manualInputModal.style.top =  tableHeadingRow.clientHeight  + "px";
            manualInputModal.style.display = "flex";
            manualInputModal.setAttribute("class", "manual_input_modal");
                // create input elements
                for( let i = 0; i < DVSC.categoryCount ; i++){
                    let manualInput = document.createElement("input");
                    let manualInputAttr ={
                        type: "number",
                        class:"manual_weight_input",
                        min: "0.01",
                        max: (100 - (0.01 * (DVSC.categoryCount - 1))).toString(),
                        step: "0.01",
                        value: ( 100 / DVSC.categoryCount).toString()
                    }

                    applyAttributes(manualInput, manualInputAttr);
                    manualInput.style.height = document.querySelector("#no1 > div.dvsc_settings > table > tbody > tr:nth-child(1)").clientHeight +"px";
                    manualInputModal.appendChild(manualInput);
                }
                
                //create sum element
                let sum = document.createElement("span");
                sum.setAttribute("class", "manual_input_sum");
                sum.innerHTML = "100";
                manualInputModal.appendChild(sum);
        tableHeadingWeighting.appendChild(manualInputModal);

        //handle button situation
        let discard = document.createElement("button");
        let discardAttr = {
            class: "discard_btn",
            style: "display: flex",
            title: "discard changes"
        }
        applyAttributes(discard, discardAttr);
        weightSettingsBtn.title = "save";
        weightSettingsBtn.innerHTML = approveIcon;
        discard.innerHTML = discardIcon;
        tableHeadingWeightingSpan.appendChild(discard);
        
        // add event listeners
        let manualInputs = document.querySelectorAll(".manual_weight_input");
        manualInputs.forEach((element)=>{    element.addEventListener("input", ()=>{    calcManualWeightsSum()  }) });
        discard.addEventListener("click",()=>{toggleManualWeightsSettings("close")})

       
    }
    else{
    
        let modal = document.querySelector(".manual_input_modal");
        let sumElement = document.querySelector(".manual_input_sum");
        if(modal.style.display == "flex"){
        //check if modal is visible
            if(sumElement.innerText !== "100" && sumElement.innerText !== "100.00"){
                // stop, if the sum of the manually input weights is not 100
                window.alert("\nCould not verify changes.\nAll weights added together must be 100!");
                throw new Error("\nCould not verify changes.\nAll weights added together must be 100!")
            }

            toggleManualWeightsSettings("close");
            setWeightsManually();
        }
        else{
            toggleManualWeightsSettings("open");
        }
    }
});

/**
 * Applies the manually adjusted weights to the main module and calculates the new main score and adjusts the stroke dash offset
 */
function setWeightsManually(){
    let manualInputs = Array.from(document.querySelectorAll(".manual_weight_input"));
    manualInputs.forEach((element, index)=>{
        DVSC.categoryWeights[index] = parseFloat(element.value);
        categoryWeights[index].value = element.value.toString();
        categoryWeightDisplays[index].innerHTML = element.value.toString();
        setOffset();
        calcTotalScore();
    })
}

/**
 * Calculates the sum of all manual input weights and and displays them.
 * ALso Changes the color of the sum red, if the sum is not 100, and green if the sum is 100
 */
function calcManualWeightsSum(){
    let inputs =  document.querySelectorAll(".manual_weight_input");
    let sumElement = document.querySelector(".manual_input_sum");
    let sum = 0;

    inputs.forEach((element)=>{
        sum += parseFloat(element.value);
    })
    
    sumElement.innerHTML = sum.toFixed(2);

    if( sum > 100 || sum < 100){
        sumElement.style.color = "#ff1d15";
    }
    else if(sum == 100){
        sumElement.style.color = "#61E786";
    }

}


/**
 * Takes the input, which is an instruction, of either "open" or "close", and then opens or closes the manual weighting adjustment panel.
 * ALso the button titles and icons adjust accordingly
 * @param {String} state 
 */
function toggleManualWeightsSettings(state){
    let modal = document.querySelector(".manual_input_modal");
    let rightBtn = document.querySelector(".set_weights_btn");
    let leftBtn = document.querySelector(".discard_btn");

    if(state == "close"){
        leftBtn.style.display = "none";
        rightBtn.title = "set the weights manually";
        rightBtn.innerHTML = settingsIcon
        modal.style.display = "none";
    }
    else if(state == "open"){
        leftBtn.style.display = "flex";
        rightBtn.title = "save";
        rightBtn.innerHTML = approveIcon
        modal.style.display = "flex";
    }

}


// init with a IIEF
(()=>{ 
    for (let i = 0; i < DVSC.categoryCount; i++) {
    categoryCompiler(i, DVSC.categoryEvaluations[i], DVSC.categoryValues[i], parseFloat(categoryBias[i].value), parseFloat(categoryTargets[i].value), DVSC.categoryDirections[i], DVSC.categoryGrains[i]);
    setOffset();
    calcTotalScore();
    }
})()