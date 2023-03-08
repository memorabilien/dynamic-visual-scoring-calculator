import calcWeights from "../calcWeights.js";
import { getScoreDefault, getScoreLinear, getScoreQuadratic, getScoreCubic } from "../calcScores.js";


// config
let config = {
	categoryDirections: [1, 1, -1, 1],
	categoryGrains: [10, 5, 10, 1],
	categoryNames: ["Time", "Cost", "Efficiency", "CO2"],
	categorySteps: [1, 0.01, 0.01, 1],
	categoryTargets: [10, 20, 100, 0],
	categoryUnits: ["s", "€", "%", "m"],
    categoryValues: [20,23,80,2],
};


const staticHtml = {
    tableHeadingRow: document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr"),
    tableHeadingWeighting: document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)"),
    tableHeadingWeightingSpan: document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting"),
    tableBody: document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody.dvsc_table_body"),
    svgFractions: document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions"),
    svgScoreText:  document.querySelector("#dvsc_score_text"),
    svgScoreCircle: document.querySelector("#dvsc_score_indicator"),
    manualWeightsDiscardButton: document.querySelector(".discard_btn"),
    manualWeightsButton: document.querySelector(".set_weights_btn"),
    manualWeightsModal: document.querySelector(".manual_input_modal"),
    manualWeightsSum: document.querySelector(".manual_input_sum"),
    manualWeightsInputs: document.querySelector(".manual_input_inputs"),
    manualWeightsButtonGearIcon: `<svg height="26" viewBox="0 0 26 26" width="26" xmlns="http://www.w3.org/2000/svg"> <g fill="none" fill-rule="evenodd" stroke="#999999" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M12.285 3.619c.434 0 .863.032 1.28.094l.629 1.906a6.784 6.784 0 0 1 1.56.664l1.808-.872a8.683 8.683 0 0 1 1.69 1.719l-.904 1.791a6.79 6.79 0 0 1 .636 1.572l1.895.66a8.748 8.748 0 0 1-.021 2.412l-1.906.629a6.893 6.893 0 0 1-.664 1.56l.872 1.808a8.718 8.718 0 0 1-1.719 1.69l-1.791-.904a6.818 6.818 0 0 1-1.572.636l-.66 1.895a8.748 8.748 0 0 1-2.412-.021l-.629-1.906a6.893 6.893 0 0 1-1.56-.664l-1.808.872a8.718 8.718 0 0 1-1.69-1.719l.904-1.791a6.89 6.89 0 0 1-.636-1.572l-1.895-.661a8.748 8.748 0 0 1 .021-2.41l1.906-.629a6.784 6.784 0 0 1 .664-1.56L5.411 7.01A8.718 8.718 0 0 1 7.13 5.32l1.791.904a6.818 6.818 0 0 1 1.572-.636l.661-1.895a8.741 8.741 0 0 1 1.131-.074z"/><path d="M16 12.285A3.715 3.715 0 0 1 12.285 16a3.715 3.715 0 0 1-3.713-3.715 3.715 3.715 0 0 1 7.428 0z"/></g></svg>`,
    manualWeightsButtonCheckIcon: `<svg height="26" viewBox="0 0 26 26" width="26" xmlns="http://www.w3.org/2000/svg"><path d="m5.619 12.81 3.714 3.714 9.939-9.905" fill="none" stroke="#61E786" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"/></svg>`,
}

let variableHtml = {
    tableRows: [],
    svgBackgroundCircles: [],
    svgScoreCircles: [],
    svgCategoryTexts: [],
    categoryTargetInputs: [],
    categoryTargetOutputs: [],
    categoryBiasInputs: [],
    categoryBiasOutputs: [],
    categoryWeightInputs: [],
    categoryWeightOutputs: [],
    categoryScoreOutputs: [],
    manualWeightInputs: [],
}




let x = 0;


init()

function moveCircles(obj,staticHtmlElements,variableHtmlElements){
    staticHtmlElements.svgScoreText.innerHTML = obj.totalScore.toFixed(2);
    staticHtmlElements.svgScoreText.style.fill = "hsl("+((obj.totalScore/100)*115).toString()+",78%,45%)";
    staticHtmlElements.svgScoreCircle.setAttribute("stroke-dashoffset" , getSvgTotalScoreCircleOffset(obj));
    staticHtmlElements.svgScoreCircle.stroke = "hsl("+((obj.totalScore/100)*115).toString()+",78%,45%)";

    for(let k = 0; k<obj.categoryCount; k++){
        variableHtmlElements.svgBackgroundCircles[k].setAttribute("stroke-dashoffset" , getSvgBackgroundCircleOffset(obj,k));
        variableHtmlElements.svgBackgroundCircles[k].style.transform  = getSvgBackgroundCircleRotation(obj,k);
        variableHtmlElements.svgScoreCircles[k].setAttribute("stroke-dashoffset" , getSvgScoreCircleOffset(obj,k));
        variableHtmlElements.svgScoreCircles[k].style.transform = getSvgScoreCircleRotation(obj,k);
        variableHtmlElements.svgCategoryTexts[k].setAttribute("dx", getSvgCategoryTextDx(obj,k));
        variableHtmlElements.svgCategoryTexts[k].setAttribute( "dy" , getSvgCategoryTextDy(obj,k));
        variableHtmlElements.svgCategoryTexts[k].style.transform = getSvgCategoryTextOffset(obj,k,variableHtml);
    }
}


function init(){
    console.log("assembling DVSC")
    staticHtml.svgScoreCircle.setAttribute("stroke-dasharray", ((2*40*Math.PI)-6).toString());
    let DVSC = fillBlanks(config);


    variableHtml = generateRows(DVSC, staticHtml, variableHtml);
    variableHtml = generateSVGCircles(DVSC, staticHtml, variableHtml);
    variableHtml = generateManualWeightInputs(DVSC,staticHtml,variableHtml);
    let targetExtrema = getTargetExtrema(DVSC);
    for(let i = 0; i < DVSC.categoryCount; i++){
        let {min,max} = targetExtrema[i];
        variableHtml.categoryTargetInputs[i].setAttribute("min", min);
        variableHtml.categoryTargetInputs[i].setAttribute("max", max);
    }

    for(let i = 0; i<DVSC.categoryCount;i++){
        variableHtml.categoryTargetInputs[i].addEventListener("input", (event)=>{
            DVSC.categoryTargets[i] = parseFloat(event.target.value);
            variableHtml.categoryTargetOutputs[i].innerHTML = DVSC.categoryTargets[i].toString();

            DVSC.categoryScores[i] = getCategoryScore(DVSC,i);
            variableHtml.categoryScoreOutputs[i].innerHTML = parseFloat(DVSC.categoryScores[i]).toFixed(2);;
            variableHtml.svgScoreCircles[i].setAttribute("stroke-dashoffset",getSvgScoreCircleOffset(DVSC,i));


        });
        variableHtml.categoryBiasInputs[i].addEventListener("input",(event)=>{
            DVSC.categoryBias[i] = parseFloat(event.target.value);
            variableHtml.categoryBiasOutputs[i].value = DVSC.categoryBias[i].toString();

            DVSC.categoryScores[i] = getCategoryScore(DVSC,i);
            variableHtml.categoryScoreOutputs[i].innerHTML = parseFloat(DVSC.categoryScores[i]).toFixed(2);
            variableHtml.svgScoreCircles[i].setAttribute("stroke-dashoffset" , getSvgScoreCircleOffset(DVSC,i));

        });
        variableHtml.categoryWeightInputs[i].addEventListener("input",(event)=>{
            //assign
            DVSC.categoryWeights = findWeights(DVSC, parseFloat(event.target.value), i);
            //display 
            for(let k = 0; k < DVSC.categoryCount; k++){
                variableHtml.categoryWeightInputs[k].value = DVSC.categoryWeights[k].toString();
                variableHtml.categoryWeightOutputs[k].innerHTML = parseFloat(DVSC.categoryWeights[k]).toFixed(2);
            }

            //assemble
            DVSC.totalScore = getTotalScore(DVSC);
            moveCircles(DVSC,staticHtml,variableHtml);

        });
        variableHtml.manualWeightInputs[i].addEventListener("input",(event)=>{
                DVSC.manualWeightInputValues[i] = parseFloat(event.target.value);
                DVSC.manualWeightInputSum = getManualWeightsInputSum(DVSC);
                staticHtml.manualWeightsSum.innerHTML = DVSC.manualWeightInputSum.toFixed(2);
                if(DVSC.manualWeightInputSum > 100 || DVSC.manualWeightInputSum < 100){
                    staticHtml.manualWeightsSum.style.color = "#ff1d15"
                }else{
                    staticHtml.manualWeightsSum.style.color = "#61E786"
                }
        })
    }


    staticHtml.manualWeightsButton.addEventListener("click",()=>{
        if(staticHtml.manualWeightsModal.style.display === "none"){
            staticHtml.manualWeightsModal.style.display = "flex"
            staticHtml.manualWeightsDiscardButton.style.display = "flex"
            staticHtml.manualWeightsButton.innerHTML = manualWeightsButtonCheckIcon;
            staticHtml.manualWeightsButton.title = "save"
        }
        else{
            staticHtml.manualWeightsModal.style.display = "none"
            staticHtml.manualWeightsDiscardButton.style.display = "none"
            staticHtml.manualWeightsButton.innerHTML = staticHtml.manualWeightsButtonGearIcon;
            staticHtml.manualWeightsButton.title = "set the weights manually"
            if(DVSC.manualWeightInputSum !== 100){
                window.alert("\nCould not verify changes.\nAll weights added together must be 100!");
                throw new Error("\nCould not verify changes.\nAll weights added together must be 100!")
            }
            //assign
            DVSC.categoryWeights = DVSC.manualWeightInputValues;
            //display
            for(let k = 0; k < DVSC.categoryCount; k++){
                variableHtml.categoryWeightInputs[k].value = DVSC.categoryWeights[k].toString();
                variableHtml.categoryWeightOutputs[k].innerHTML = DVSC.categoryWeights[k].toFixed(2);
            }
            //assemble
            DVSC.totalScore = getTotalScore(DVSC);
             moveCircles(DVSC,staticHtml,variableHtml);


        }
    });

    staticHtml.manualWeightsDiscardButton.addEventListener("click",()=>{
        staticHtml.manualWeightsDiscardButton.style.display = "none";
        staticHtml.manualWeightsModal.style.display = "none"
        staticHtml.manualWeightsButton.innerHTML = staticHtml.manualWeightsButtonGearIcon;
        staticHtml.manualWeightsButton.title = "set the weights manually"
    });

}




function fillBlanks(obj){

    let lastCount = obj[Object.keys(obj)[0]].length
    for(const key in obj){
        if(Array.isArray(obj[key])){
            if(obj[key].length !== lastCount){
                throw new Error("\n\nConfiguration Error occurred\nPleas check the that every Array in the configuration is the same length\n\n");
            }
        }
    }

    Object.defineProperty(obj, "manualWeightInputsSum", {
        value: 100.00,
        enumerable: true,
        configurable: true,
        writable: true,
    })

    Object.defineProperty(obj, "manualWeightInputValues", {
        value: new Array(),
        enumerable: true,
        configurable: true,
        writable: true,
    })

    Object.defineProperty(obj, "categoryCount",{
        value: lastCount,
        enumerable: true,
        configurable: true,
        writable: true,
    });

    Object.defineProperty(obj,"categoryNumbers",{
        value: new Array(),
        enumerable: true,
        configurable: true,
        writable: true,  
    });
    
    Object.defineProperty(obj, "categoryScores",{
        value: new Array(),
        enumerable: true,
        writable: true,
        configurable: true,
    })

    let options = ["categoryBias","categoryColors","categoryEvaluations","categoryWeights"];

    for(let i = 0; i< options.length; i++){
        if(!obj.hasOwnProperty(options[i])){
            switch(options[i]){
                case "categoryBias":
                    let biasDefaults = new Array(obj.categoryCount);
                    biasDefaults.fill(0)
                    Object.defineProperty(obj, options[i],{
                        value: biasDefaults,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    })
                    break;
                case "categoryColors":
                    let colorDefaults = new Array(obj.categoryCount);
                    let colorPresets = ['#ff0000','#e7eb17','#00ff22','#00ccff','#ff4400','#aaff00','#00ff66','#0088ff','#ff8800','#66ff00','#00ffaa','#0044ff','#ffcc00','#22ff00','#00ffee','#0000ff',];
                    for(let k = 0; k<obj.categoryCount; k++){
                        colorDefaults[k] = colorPresets[k];
                    }
                    Object.defineProperty(obj, options[i],{
                        value: colorDefaults,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    })
                    break;
                case "categoryEvaluations":
                    let evaluationDefaults = new Array(obj.categoryCount);
                    evaluationDefaults.fill("default")
                    Object.defineProperty(obj, options[i],{
                        value: evaluationDefaults,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    })
                    break;
                case "categoryWeights":
                    let weightDefaults = new Array(obj.categoryCount);
                   weightDefaults.fill(100/obj.categoryCount);
                    Object.defineProperty(obj, options[i],{
                        value: weightDefaults,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    })
                    break;
            }
        }
    }

    for(let i = 0; i < obj.categoryCount; i++){
        obj.categoryNumbers[i] = i;
        obj.categoryScores[i] = getCategoryScore(obj,i);
    }

    Object.defineProperty(obj,"totalScore",{
        value: getTotalScore(obj),
        enumerable: true,
        writable: true,
        configurable: true,
    })
    return obj;
}

function getCategoryScore(obj,category){
    if( typeof category !== "string" && typeof category !== "number"){
        throw new Error("\n\nTypeError:\nThe function getCategoryScore() only takes one arguments with the allowed types of:\n1. string\n2. number\n\nMake sure to pass the correct values\n\n");
    }

    if(typeof category === "string"){
        let inputCategory = category.trim().replaceAll(/\W/g, "").toLowerCase();
        var i = null;
        obj.categoryNames.forEach((element,index)=>{
            let storedCategory = element.trim().replaceAll(/\W/g, "").toLowerCase();
            if(storedCategory === inputCategory){
                i = index;
            }
        })

        if(i === null){
            throw new Error(`\n\n '${category}' could not be found as a valid category\n getCategoryScore() can take a category name and returns the score. Syntax and whitespace will be ignored, but the category must exist.\nMake sure the category name is spelled correctly`);
        }
        switch(obj.categoryEvaluations[i]){
            case "lin" || "linear":
               return getScoreLinear(obj.categoryValues[i], obj.categoryBias[i],obj.categoryTargets[i],obj.categoryDirections[i],obj.categoryGrains[i]);   
            case "quad" || "quadratic":
                return getScoreQuadratic(obj.categoryValues[i], obj.categoryBias[i],obj.categoryTargets[i],obj.categoryDirections[i],obj.categoryGrains[i]);
            case "cube" || "cubic":
                return getScoreCubic(obj.categoryValues[i], obj.categoryBias[i],obj.categoryTargets[i],obj.categoryDirections[i],obj.categoryGrains[i]);
            default:
               return getScoreDefault(obj.categoryValues[i], obj.categoryBias[i],obj.categoryTargets[i],obj.categoryDirections[i],obj.categoryGrains[i]);
        }
    }
    else if(typeof category === "number"){
        if(category >= obj.categoryCount){
            throw new Error(`\n\nCould not find the ${(category +1).toString()}. category.\nBe aware counting stats at 0!\n\n`);
        }
        var i = parseInt(category);
        switch(obj.categoryEvaluations[i]){
            case "lin" || "linear":
               return getScoreLinear(obj.categoryValues[i], obj.categoryBias[i],obj.categoryTargets[i],obj.categoryDirections[i],obj.categoryGrains[i]);   
            case "quad" || "quadratic":
                return getScoreQuadratic(obj.categoryValues[i], obj.categoryBias[i],obj.categoryTargets[i],obj.categoryDirections[i],obj.categoryGrains[i]);
            case "cube" || "cubic":
                return getScoreCubic(obj.categoryValues[i], obj.categoryBias[i],obj.categoryTargets[i],obj.categoryDirections[i],obj.categoryGrains[i]);
            default:
               return getScoreDefault(obj.categoryValues[i], obj.categoryBias[i],obj.categoryTargets[i],obj.categoryDirections[i],obj.categoryGrains[i]);
        }
    }
}

function getTotalScore(obj){
    let numerator = 0;
    for(let i = 0; i< obj.categoryCount; i++){
        numerator += (obj.categoryScores[i]/1000)*parseFloat(obj.categoryWeights[i]/100);
    }
    obj.totalScore = numerator * 100;
    return obj.totalScore;
}



function getExponentSyntax(string){
    let reg = new RegExp(/\w\^?\d/g);

    if(reg.test(string)){
        let rest = string.replaceAll(reg,"");
        let base = string.match(reg)[0][0];
        let exp = string.match(reg)[0].charAt(string.match(reg)[0].length - 1)

        if(rest.length > 0){
            return `<mi>`+ rest +`</mi>
                <mo>⋅</mo>
                <msup>
                    <mi>`+ base +`</mi>
                    <mi>`+ exp +`</mi>
                </msup>`;
        }
        else{
            return`<msup>
                <mi>`+ base +`</mi>
                <mi>`+ exp +`</mi>
            </msup>`
        }
        
    }
}

function getFractionSyntax(string){
    if(string.match(/\//g).length > 1){
        throw new Error("too many fraction to display unit properly")
    }
    let numerator = string.split("/")[0];
    let base = string.split("/")[1];

    for(const match of numerator.matchAll(/.?\w\^?\d/g)){
        if((/.?[A-Z]_?\d/g).test(match[0])){
            numerator = numerator.replace(match[0], getChemSyntax(match[0]));
            numerator  = numerator.replace(/\*/g,`<mo>⋅</mo>`);
            numerator = numerator.replace(numerator.replace(numerator.match(/(\<.*.\>)/g),""),`<mi>`+numerator.replace(numerator.match(/(\<.*.\>)/g),"")+`</mi>`);
        }
        else{
            numerator = numerator.replace(match[0],getExponentSyntax(match[0].trim()));
            numerator  = numerator.replace(/\*/g,`<mo>⋅</mo>`);
            // numerator = numerator.replace(numerator.replace(numerator.match(/(\<.*.\>)/g),""),`<mi>`+numerator.replace(numerator.match(/(\<.*.\>)/g),"")+`</mi>`);
        }
    }
    for(const match of base.matchAll(/\w\^?\d/g)){
        if((/.?[A-Z]_?\d/g).test(match[0])){
            base = base.replace(match[0], getChemSyntax(match[0]));
            base  = base.replace(/\*/g,`<mo>⋅</mo>`);
            base = base.replace(base.replace(base.match(/(\<.*.\>)/g),""),`<mi>`+base.replace(base.match(/(\<.*.\>)/g),"")+`</mi>`);
        }
        else{
            base = base.replace(match[0],getExponentSyntax(match[0].trim()));
            base  = base.replace(/\*/g,`<mo>⋅</mo>`);
            // base = base.replace(base.replace(base.match(/(\<.*.\>)/g),""),`<mi>`+base.replace(base.match(/(\<.*.\>)/g),"")+`</mi>`);
        }
    }



    numerator  = numerator.replace(/\*/g,`<mo>⋅</mo>`);
    base = base.replace(/\*/g,`<mo>⋅</mo>`);
    if(!numerator.includes("<")){
        numerator = `<mi>`+numerator+`</mi>`;
    }
    if(!base.includes("<")){
        base = `<mi>`+base+`</mi>`;
    }

    return(`<mfrac>
        <mrow>`+ numerator+`</mrow>
        <mrow>`+ base +`</mrow>
    </mfrac>`);

}

function getChemSyntax(string){
    let reg = new RegExp(/.?[A-Z]_?\d/g);



    for(const match of string.matchAll(reg)){
        string = string.replace("_","");
        string = string.replace(match[0],`<msub><mrow><mi>`+ match[0].match(/.?\w/g)[0] +`</mi></mrow><mrow><mi>` + match[0].match(/\d/g)[0] +`</mi></mrow></msub>`)
    }
    console.log(string)
    return string;

}




function generateRows(obj, staticHtmlElements, variableHtmlElements){
    for(let i = 0; i<obj.categoryCount; i++){
        let unit = ``;
        let categoryRow = document.createElement("tr");
        let categoryRowProps = {
            name: obj.categoryNames[i],
        }
       
        if(obj.categoryUnits[i].includes("/")){
            unit = `<mjx-container jax="SVG" display="true" tabindex="0" ctxtmenu_counter="347" style="position: relative;">
                     <mjx-assistive-mml unselectable="on" display="block">
                         <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                             <mstyle displaystyle="true" scriptlevel="0">
                                 <mrow data-mjx-texclass="ORD">
                                     <mtable rowspacing=".5em" columnspacing="1em" displaystyle="true">
                                         <mtr>
                                             <mtd>
                                                ` + getFractionSyntax(obj.categoryUnits[i]) + `
                                            </mtd>
                                     </mtr>
                                 </mtable>
                             </mrow>
                         </mstyle>
                     </math>
                 </mjx-assistive-mml>
              </mjx-container>
        `
        }
        else if((/.?[a-z]\^?\d/g).test(obj.categoryUnits[i])){
            
            unit =  `<mjx-container jax="SVG" display="true" tabindex="0" ctxtmenu_counter="347" style="position: relative;">
            <mjx-assistive-mml unselectable="on" display="block">
                <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                    <mstyle displaystyle="true" scriptlevel="0">
                        <mrow data-mjx-texclass="ORD">
                            <mtable rowspacing=".5em" columnspacing="1em" displaystyle="true">
                                <mtr>
                                    <mtd>
                                       ` + getExponentSyntax(obj.categoryUnits[i]) + `
                                   </mtd>
                            </mtr>
                        </mtable>
                    </mrow>
                </mstyle>
            </math>
        </mjx-assistive-mml>
     </mjx-container>
`
        }
        else if((/.?[A-Z]\d/g).test(obj.categoryUnits[i])){
            unit = `<mjx-container jax="SVG" display="true" tabindex="0" ctxtmenu_counter="347" style="position: relative;">
            <mjx-assistive-mml unselectable="on" display="block">
                <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                    <mstyle displaystyle="true" scriptlevel="0">
                        <mrow data-mjx-texclass="ORD">
                            <mtable rowspacing=".5em" columnspacing="1em" displaystyle="true">
                                <mtr>
                                    <mtd>
                                       ` + getChemSyntax(obj.categoryUnits[i]) + `
                                   </mtd>
                            </mtr>
                        </mtable>
                    </mrow>
                </mstyle>
            </math>
        </mjx-assistive-mml>
     </mjx-container>`
        }
        else{
            unit = obj.categoryUnits[i].toString()
        }
        categoryRow = applyProps(categoryRow,categoryRowProps)
        categoryRow.innerHTML =`<th>`+ obj.categoryNames[i].toString() +`</th>
                                <td>
                                    <p class="dvsc_tab">
                                        <output class="dvsc_data_input_display">`+ obj.categoryValues[i].toString() +`</output>
                                        <span>`+ unit +`</span>
                                    </p>
                                </td>
                                <td>
                                    <input class="dvsc_target_value_input" type="range" value="`+ obj.categoryTargets[i].toString() +`" step="`+ obj.categorySteps[i].toString() +`">
                                    <p class="dvsc_tab">
                                        <output class="dvsc_target_value_input_display" >`+ obj.categoryTargets[i].toString() +`</output>
                                        <span>`+ unit +`</span>
                                    </p>
                                </td>
                                <td>
                                    <input class="dvsc_bias_input" min="-5" max="5" type="range" step="1" value="0">
                                    <p class="dvsc_tab">
                                        <output class="dvsc_bias_input_display" >` + obj.categoryBias[i].toString() +`</output>
                                    </p>
                                </td>
                                <td>
                                    <input class="dvsc_weighting_input" type="range" step="0.01" value="`+ obj.categoryWeights[i].toString() +`">
                                    <p class="dvsc_tab">
                                        <output class="dvsc_weighting_input_display" >`+ obj.categoryWeights[i].toFixed(2) +`</output>
                                        <span> %</span>
                                    </p>
                                </td>
                                <td>
                                    <p class="dvsc_tab">
                                        <output class="dvsc_category_score_display">`+ obj.categoryScores[i].toFixed(2) +`</output>
                                        <span>
                                            <sub>/1000</sub>
                                        </span>
                                    </p>
                                </td>`;
        staticHtmlElements.tableBody.appendChild(categoryRow);

        variableHtmlElements.tableRows.push(categoryRow);
        variableHtmlElements.categoryTargetInputs.push(categoryRow.querySelector(".dvsc_target_value_input"));
        variableHtmlElements.categoryTargetOutputs.push(categoryRow.querySelector(".dvsc_target_value_input_display"));
        variableHtmlElements.categoryBiasInputs.push(categoryRow.querySelector(".dvsc_bias_input"));
        variableHtmlElements.categoryBiasOutputs.push(categoryRow.querySelector(".dvsc_bias_input_display"));
        variableHtmlElements.categoryWeightInputs.push(categoryRow.querySelector(".dvsc_weighting_input"));
        variableHtmlElements.categoryWeightOutputs.push(categoryRow.querySelector(".dvsc_weighting_input_display"));
        variableHtmlElements.categoryScoreOutputs.push(categoryRow.querySelector(".dvsc_category_score_display"));

    }

    return variableHtmlElements

}

function generateSVGCircles(obj,staticHtmlElements, variableHtmlElements){
    for(let i = 0; i< obj.categoryCount; i++ ){
        let svgBackgroundCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        let svgScoreCircle = document.createElementNS('http://www.w3.org/2000/svg',"circle");
        let svgCategoryText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        let svgGroup = document.createElementNS("http://www.w3.org/2000/svg","g");

        let svgBackgroundCircleProps = {
            "stroke": obj.categoryColors[i],
            "fill": "none",
            "class": "dvsc_fraction dvsc_fraction_bg",
            "stroke-dasharray": ((2 * 46 * Math.PI) - 6).toString(),
            "stroke-dashoffset":getSvgBackgroundCircleOffset(obj,i),
            "style": "transform:"+ getSvgBackgroundCircleRotation(obj,i)+";",
            "cx": "50",
            "cy": "50",
            "r": "46"
        }
        let svgScoreCircleProps = {
            "stroke": obj.categoryColors[i],
            "class": "dvsc_fraction dvsc_fraction_bar",
            "fill": "none",
            "stroke-dasharray": ((2 * 46 * Math.PI) - 6).toString(),
            "stroke-dashoffset": getSvgScoreCircleOffset(obj,i),
            "style": "transform:"+ getSvgBackgroundCircleRotation(obj,i) + ";",
            "cx": "50",
            "cy": "50",
            "r": "46"
        }
        let svgCategoryTextProps = {
            "class":"category_text",
            "fill": "#999999",
            "style": "text-anchor:middle; dominant-baseline: middle; transform-origin: center;font-size: 8px; font-weight: 600;",
            "x":"50",
            "y":"50",
            "dx": getSvgCategoryTextDx(obj,i),
            "dy": getSvgCategoryTextDy(obj,i),
        }

        svgBackgroundCircle = applyProps(svgBackgroundCircle,svgBackgroundCircleProps);
        svgScoreCircle = applyProps(svgScoreCircle,svgScoreCircleProps);
        svgCategoryText = applyProps(svgCategoryText,svgCategoryTextProps);

        svgGroup.appendChild(svgBackgroundCircle);
        svgGroup.appendChild(svgScoreCircle);
        svgGroup.appendChild(svgCategoryText);
        variableHtmlElements.svgBackgroundCircles.push(svgGroup.querySelector(".dvsc_fraction_bg"));
        variableHtmlElements.svgScoreCircles.push(svgGroup.querySelector(".dvsc_fraction_bar"));
        variableHtmlElements.svgCategoryTexts.push(svgGroup.querySelector(".category_text"));
        staticHtmlElements.svgFractions.appendChild(svgGroup);
    }
    return variableHtmlElements;
}

function generateManualWeightInputs(obj,staticHtmlElements,variableHtmlElements){


    staticHtmlElements.manualWeightsInputs.style.width = staticHtmlElements.tableHeadingWeighting.clientWidth + 4  +"px";

    staticHtmlElements.manualWeightsInputs.style.top =  staticHtmlElements.tableHeadingRow.clientHeight  + "px";



    for( let i = 0; i < obj.categoryCount ; i++){
        let manualInput = document.createElement("input");
        let manualInputAttr ={
            type: "number",
            class:"manual_weight_input",
            min: "0.01",
            max: (100 - (0.01 * (obj.categoryCount - 1))).toString(),
            step: "0.01",
            value: ( 100 / obj.categoryCount).toString()
        }

        manualInput = applyProps(manualInput, manualInputAttr);
        manualInput.style.height = staticHtmlElements.tableHeadingRow.clientHeight +"px";
        variableHtmlElements.manualWeightInputs.push(manualInput);
        staticHtmlElements.manualWeightsInputs.appendChild(manualInput);
    }

    return variableHtmlElements;
}

function applyProps(element,props){
    for(const key in props){
        element.setAttribute(key, props[key]);
    }
    return element;
}

function getTargetExtrema(obj){
    let outputs = [];
    for(let i = 0; i< obj.categoryCount; i++){
        let output = {min: null, max: null}
        let u = "";
        switch(obj.categoryDirections[i]){
            case -1:
                output.min =  obj.categoryValues[i].toString();
                u = obj.categoryUnits[i].toLowerCase().trim().replaceAll(/\W/g,"");
                if( u === "%" || u === "percent"){
                    output.max = "100";
                }
                else{
                    output.max =  (parseFloat(obj.categoryValues[i]) + parseFloat(obj.categoryGrains[i]) * 14).toString()
                }
                break;
            case 0:

                break;
            case 1:
                output.max = obj.categoryValues[i].toString()
                u = obj.categoryUnits[i].toLowerCase().trim().replaceAll(/\W/g,"");
                if(    u === "%" || u === "percent" || u === "s"    || u === "seconds"  || u === "min"  || u === "minutes"  || u === "h"  || u === "hours"   || u === "€"   || u === "euro"   || u === "eur"  || u === "$"  || u === "usd"  || u === "dollar"  || u === "kr"  || u === "bp"  || u === "kg"  || u === "kilogramms"  || u === "g" || u === "gramms"  || u === "mg" || u === "milligramms"  || u === "t" || u === "meters" || u === "m"  || u === "millimeters"  || u === "mm" || u === "km"  || u === "kilometers"  ){
                    output.min = "0";
                }
                else{
                    output.min = (parseFloat(obj.categoryValues[i]) - parseFloat(obj.categoryGrains[i]) * 5).toString()
                }
                break;
            default:
                throw new Error(`\n\nUnknown category direction\nCould not set 'min' and 'max' for the ${i.toString()}. target range slider`);
        }
        outputs[i] = output;
    }
    return outputs
}

function findWeights(obj, userInput, currentAdjustmentIndex){
	

    if(obj.categoryCount !== 1 && obj.categoryCount !== 0) {

        let matrix = new Array(obj.categoryCount - 1);
        let vector = new Array(obj.categoryCount - 1);
        for (let i = 0; i < obj.categoryCount - 1; i++) {
            
            if(i == 0){
                vector[i] = [100 - userInput];
            }
            else{
                vector[i] = [0];
            }

            let temp = new Array(obj.categoryCount -1);
            for(let k = 0; k < temp.length; k++){
                temp[k] = 0;
            }
            matrix[i] = temp;
        } 
        
        for(let row = 0; row < obj.categoryCount - 1; row++ ){
            for(let column = 0; column< obj.categoryCount -1; column++){
                if (row == 0) {
                    matrix[row][column] = 1;
                }
                else{
                    if(column == row - 1){
                        matrix[row][column] = - obj.categoryWeights[row +1];
                    }
                    if(column == row){
                        matrix[row][column] = obj.categoryWeights[row]
                    }
                }

            }
        }

        let newPercentages =  calcWeights(matrix, vector);
        newPercentages.splice(currentAdjustmentIndex, 0, userInput);
        for(let i = 0; i< obj.categoryCount; i++){
            if(newPercentages[i] < 0.01 && i !== currentAdjustmentIndex ){
                newPercentages[currentAdjustmentIndex] = newPercentages[currentAdjustmentIndex] - (0.01 - newPercentages[i]);
                newPercentages[i] = 0.01;
            }
        }
    
        if(newPercentages[currentAdjustmentIndex] > 0.01){
            return newPercentages;
        }
        else{
            return obj.categoryWeights
        }


    }
    else{
            return [userInput];
    }

}



function getSvgBackgroundCircleOffset(obj,index){
        return  2*46*Math.PI*(1 - obj.categoryWeights[index] / 100.0);
}

function getSvgScoreCircleOffset(obj,index){
    let circleCircumference = 2.0 * 46 * Math.PI;
    let scoreOffset = (obj.categoryScores[index] / 1000);
    let backgroundCircleOffset  =  (1 - obj.categoryWeights[index] / 100.0);
    let output = circleCircumference * scoreOffset * backgroundCircleOffset;



    return 2.0 * 46 * Math.PI * (1.0 - obj.categoryWeights[index] * (obj.categoryScores[index] / 1000) * 0.01) > 278 ? 278: 2.0 * 46 * Math.PI * (1.0 - obj.categoryWeights[index] * (obj.categoryScores[index] / 1000) * 0.01) < 2 * 46 * Math.PI * (1 - obj.categoryWeights[index] / 100.0) + 2 * 46 * Math.PI * (1 - obj.categoryWeights[index] / 100.0) * 0.05	? 2 * 46 * Math.PI * (1 - obj.categoryWeights[index] / 100.0): 2.0 * 46 * Math.PI * (1.0 - obj.categoryWeights[index] * (obj.categoryScores[index] / 1000) * 0.01);
}

 function getSvgScoreCircleRotation(obj,index){
    function getDegrees(currentIndex) {
        let degree = 0;
        for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(obj.categoryWeights[i]);
        }
        return 3.6 * degree;
    }

    return "rotate(" + getDegrees(index).toString() + "deg)";
 }

function getSvgBackgroundCircleRotation(obj,index){
    function getDegrees(currentIndex) {
        let degree = 0;
        for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(obj.categoryWeights[i]);
        }
        return 3.6 * degree;
    }
    
    return "rotate(" + getDegrees(index).toString() + "deg)"

}

function getSvgCategoryTextDx(obj,index){
    let degree = 0;
    let rad;
    let dx;
    for (let i = 0; i < index; i++) {
        degree += parseFloat(obj.categoryWeights[i]);
    }
    degree = 3.6 * degree;
    rad = (degree / 180) * Math.PI;
    function F(x) {
        let offset = ((3.6* parseFloat(obj.categoryWeights[index]))/180)*Math.PI/2;
        return 50 * Math.cos(x + offset);
    }
    dx = F(rad);
    return dx;
}

function getSvgCategoryTextDy(obj,index) {
    let degree = 0;
    let rad;
    let dy;
    for (let i = 0; i < index; i++) {
        degree += parseFloat(obj.categoryWeights[i]);
    }
    degree = 3.6 * degree;
    rad = (degree / 180) * Math.PI;
    function F(x) {
        let offset = ((3.6* parseFloat(obj.categoryWeights[index]))/180)*Math.PI/2;
        return 50 * Math.sin(x + offset);
    }
    dy = F(rad);
    return dy;
}

function getSvgCategoryTextOffset(obj,index,variableHtmlElements){
    let positionX = getSvgCategoryTextDx(obj,index);
    let positionY = getSvgCategoryTextDy(obj,index);
    let output = [];
    if(positionX > 12){
        output[0] =  "translateX(" + variableHtmlElements.svgCategoryTexts[index].getBoundingClientRect().width/4  +"px)";
    }
    else if(positionX < -12 ){
        output[0] =  "translateX(" + -1*variableHtmlElements.svgCategoryTexts[index].getBoundingClientRect().width/4  +"px)";
    }
    else if(positionX <= 12 && positionX >= -12 ){
        output[0] = "translateX(0px)"
        if(positionY > 0){
            output[1] = "translateY(" +  variableHtmlElements.svgCategoryTexts[index].getBoundingClientRect().height/4 +"px)";
        }
        else{
            output[1] = "translateY(" +  -1*variableHtmlElements.svgCategoryTexts[index].getBoundingClientRect().height/4 +"px)";
        }
    }
    if( positionY <= -12 && positionY >= 12){
        output[1] = "translateY(0px)";
        if(positionX < 0){
            output[0] = "translateX(" + -1*variableHtmlElements.svgCategoryTexts[index].getBoundingClientRect().width +"px)";
        }
    }

    return output.join(" ");

}

function getSvgTotalScoreCircleOffset(obj){
    let circleCircumference = 2*40*Math.PI;
    return circleCircumference*(1-obj.totalScore/100);
}


function getManualWeightsInputSum(obj){
    let sum  = 0;
    for(let i = 0; i< obj.categoryCount; i++){
        sum += obj.manualWeightInputValues[i];
    }
    return sum;
}


































// let categoryTargets,
//     categoryBias,
//     categoryWeights,
//     categoryTargetDisplays,
//     categoryBiasDisplays,
//     categoryWeightDisplays,
//     categoryScoreDisplays,
//     svgBackgroundCircles,
//     svgScoreCircles,
//     svgTexts,
//     totalScoreText,
//     totalScoreCircle



// const tableHeadingRow = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr");
// const tableHeadingWeighting = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)");
// const tableHeadingWeightingSpan = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting")
// const tableBody = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody.dvsc_table_body");
// const svgFractions = document.querySelector("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions");
// totalScoreText = document.querySelector("#dvsc_score_text");
// totalScoreCircle = document.querySelector("#dvsc_score_indicator");

// totalScoreCircle.setAttribute("stroke-dasharray", ((2*40*Math.PI)-6).toString())




// // appending Categories and circles
//     for (let i = 0; i < DVSC.categoryCount; i++) {
//         let categoryRow = document.createElement("tr");// creating row element
//         let svgFractionBackground = document.createElementNS("http://www.w3.org/2000/svg", "circle");
//         let svgFractionScore = document.createElementNS('http://www.w3.org/2000/svg',"circle");
//         let svgName = document.createElementNS("http://www.w3.org/2000/svg", "text");
//         let svgBackgroundProps = {
//             "id": "dvsc_fraction_" + i.toString()+"_background",
//             "stroke": DVSC.categoryColors[i],
//             "class": "dvsc_fraction dvsc_fraction_bg",
//             "stroke-dasharray": ((2 * 46 * Math.PI) - 6).toString(),
//             "cx": "50",
//             "cy": "50",
//             "r": "46"
//         }
//         let svgFractionProps = {
//             "id": "dvsc_fraction_" + i.toString()+"_indicator",
//             "stroke": DVSC.categoryColors[i],
//             "class": "dvsc_fraction dvsc_fraction_bar",
//             "stroke-dasharray": ((2 * 46 * Math.PI) - 6).toString(),
//             "cx": "50",
//             "cy": "50",
//             "r": "46"
//         }
//         let svgTextProps = {
//             "id": "dvsc_category_name_" + i.toString(),
//             "class":"category_text",
//             "style": "text-anchor:middle; dominant-baseline: middle; transform-origin: center",
//             "x":"50",
//             "y":"50",
//             "dx":"0",
//             "dy":"0"
//         }
//         categoryRow.innerHTML =`<th>`+ DVSC.categoryNames[i] +`</th><td><output class="dvsc_data_input_display" for="dvsc_data_input_`+ i.toString() +`" >`+ DVSC.categoryValues[i] +`</output><span>`+ DVSC.categoryUnits[i].toString() +`</span></td><td><input class="dvsc_target_value_input" id="dvsc_target_value_input_` +i.toString() +`" type="range" value="`+ DVSC.categoryTargets[i] +`" step="`+ DVSC.categorySteps[i] +`"><p class="dvsc_tab"><output class="dvsc_target_value_input_display" for="dvsc_target_value_input_` +i.toString() +`">`+ DVSC.categoryTargets[i] +`</output><span>`+ DVSC.categoryUnits[i].toString() +`</span></p></td><td><input class="dvsc_bias_input" min="-5" max="5" type="range" step="1" value="0"><p class="dvsc_tab"><output class="dvsc_bias_input_display" >0</output></p></td><td><input class="dvsc_weighting_input" type="range" step="0.01" value="`+ (100/DVSC.categoryCount).toString() +`"><p class="dvsc_tab"><output class="dvsc_weighting_input_display" >`+ DVSC.categoryWeights[i] +`</output><span> %</span></p></td><td><p class="dvsc_tab"><output class="dvsc_category_score_display">-</output><span><sub>/1000</sub></span></p></td>`;
//         tableBody.appendChild(categoryRow);// put row into html document
//         if (DVSC.categoryDirections[i] == 1){// set min or max values for target value range input slider
//             document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", DVSC.categoryValues[i].toString());
//             switch(DVSC.categoryUnits[i]){
// 				case "%":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "Percent":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "percent":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "s":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "S":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case  "Seconds":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "seconds":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "min":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "minutes":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "Minutes":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "h":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "hours":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "Hours":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "€":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "Euro":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "euro":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "$":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "Dollar":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				case "dollar":
// 					  document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", 0);
//                       break;
// 				default:
//                     document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", parseFloat(DVSC.categoryValues[i]) - parseFloat(DVSC.categoryGrains[i]) * 5);

// 			}
            
//         }
//         else if( DVSC.categoryDirections[i] == -1 ){
//             document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", DVSC.categoryValues[i].toString());
//             switch(DVSC.categoryUnits[i]){
// 				case "%":
//                     document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", 100);
//                     break;
// 				case "Percent":
//                     document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", 100);
//                     break;
// 				case "percent":
//                     document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", 100);
//                     break;
// 				default:
//                     document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", parseFloat(DVSC.categoryValues[i]) + parseFloat(DVSC.categoryGrains[i]) * 14);
// 			}

//         }


//         applyAttributes(svgFractionBackground, svgBackgroundProps);
//         applyAttributes(svgFractionScore, svgFractionProps);
//         applyAttributes(svgName, svgTextProps);
//         svgFractions.appendChild(svgFractionBackground);
//         svgFractions.appendChild(svgFractionScore);
//         svgName.innerHTML = DVSC.categoryNames[i];
//         svgFractions.appendChild(svgName);
//     }


// //select all inputs and outputs
// categoryTargets = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>input.dvsc_target_value_input"));
// categoryBias = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>input.dvsc_bias_input"));
// categoryWeights = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>input.dvsc_weighting_input"));
// categoryTargetDisplays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_target_value_input_display"));
// categoryBiasDisplays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_bias_input_display"));
// categoryWeightDisplays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_weighting_input_display"));
// categoryScoreDisplays = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>p.dvsc_tab>output.dvsc_category_score_display"));
// svgBackgroundCircles = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>circle.dvsc_fraction_bg")) ;
// svgScoreCircles = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>circle.dvsc_fraction_bar"));
// svgTexts = Array.from(document.querySelectorAll("div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>text.category_text"))


// //event Listeners
// for (let i = 0; i < DVSC.categoryCount; i++) {
// 	DVSC.categoryScores[i] = 0;
// 	categoryTargets[i].addEventListener("input", (event) => {
//         DVSC.categoryTargets[i] = event.target.value;
// 		categoryTargetDisplays[i].innerHTML = event.target.value;
//         categoryCompiler(i, DVSC.categoryEvaluations[i], DVSC.categoryValues[i], parseFloat(categoryBias[i].value), parseFloat(event.target.value), DVSC.categoryDirections[i], DVSC.categoryGrains[i]);
//         calcTotalScore();
//         setOffset();
// 	});
// 	categoryBias[i].addEventListener("input", (event) => {
//         DVSC.categoryBias[i] = event.target.value;
// 		categoryBiasDisplays[i].innerHTML = event.target.value;
//         categoryCompiler(i, DVSC.categoryEvaluations[i], DVSC.categoryValues[i], parseFloat(event.target.value), parseFloat(categoryTargets[i].value), DVSC.categoryDirections[i], DVSC.categoryGrains[i]);
//         setOffset();
//         calcTotalScore();

// 	});
// 	categoryWeights[i].addEventListener("input", (event) => {
// 		getAdjustments( event.target.value , DVSC.categoryCount, i);
//         setOffset();
//         calcTotalScore();
// 	});
// }


// /**
//  * Calculates and Adjusts every Percentage evenly, depending on which Percentage is being adjusted 
//  * @param {number} userInput 
//  * @param {int} categoryCount 
//  * @param {int} currentAdjustmentIndex 
//  */
// function getAdjustments(userInput, categoryCount, currentAdjustmentIndex){
	

//     if(categoryCount !== 1 && categoryCount !== 0) {
//         let inputStatus = [];
//         categoryWeights.forEach((element) => {
//             inputStatus.push(element.value);
//         });
//         let matrix = new Array(categoryCount - 1);
//         let vector = new Array(categoryCount - 1);
//         for (let i = 0; i < categoryCount - 1; i++) {
            
//             if(i == 0){
//                 vector[i] = [100 - userInput];
//             }
//             else{
//                 vector[i] = [0];
//             }

//             let temp = new Array(categoryCount -1);
//             for(let k = 0; k < temp.length; k++){
//                 temp[k] = 0;
//             }
//             matrix[i] = temp;
//         } 
        
//         for(let row = 0; row < categoryCount - 1; row++ ){
//             for(let column = 0; column< categoryCount -1; column++){
//                 if (row == 0) {
//                     matrix[row][column] = 1;
//                 }
//                 else{
//                     if(column == row - 1){
//                         matrix[row][column] = - inputStatus[row +1];
//                     }
//                     if(column == row){
//                         matrix[row][column] = inputStatus[row]
//                     }
//                 }

//             }
//         }

//         let newPercentages =  calcWeights(matrix, vector);
//         newPercentages.splice(currentAdjustmentIndex, 0, userInput);
//         for(let i = 0; i< categoryCount; i++){
//             if(newPercentages[i] < 0.01 && i !== currentAdjustmentIndex ){
//                 newPercentages[currentAdjustmentIndex] = newPercentages[currentAdjustmentIndex] - (0.01 - newPercentages[i]);
//                 newPercentages[i] = 0.01;
//             }
//         }
    
//         if(newPercentages[currentAdjustmentIndex] > 0.01){
//             for(let i = 0; i<categoryCount; i++){
//                 categoryWeights[i].value = newPercentages[i];
//                 let t = parseFloat(newPercentages[i]).toFixed(2);
//                 categoryWeightDisplays[i].innerHTML = t;
//                 DVSC.categoryWeights[i] = parseFloat(newPercentages[i]);
//             }
//         }


//     }
//     else{
//         categoryWeightDisplays[0].innerHTML = (userInput);
//         DVSC.categoryWeights[0] = parseFloat(userInput);
//     }

// }

// /**
//  * Calculate the score for a given category depending on its inputs and display them
//  * @param {int} categoryNumber 
//  * @param {str} categoryEvaluation 
//  * @param {number} categoryValue 
//  * @param {int} categoryBias 
//  * @param {number} categoryTarget 
//  * @param {number} categoryDirection 
//  * @param {number} categoryGrain 
//  */
// function categoryCompiler(categoryNumber, categoryEvaluation, categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain){
//     let output;
//     if (categoryEvaluation == "lin" || categoryEvaluation == "linear") {
// 		output = getScoreLinear(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
//     } else if (categoryEvaluation == "quad" || categoryEvaluation == "quadratic") {
// 		output = getScoreQuadratic(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
//     } else if (categoryEvaluation == "cube" || categoryEvaluation == "cubic") {
// 		output = getScoreCubic(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
//     }
//     else if( categoryEvaluation == "def" || categoryEvaluation == "default"){
// 		output = getScoreDefault(categoryValue, categoryBias, categoryTarget, categoryDirection, categoryGrain);
//     }
    
//     categoryScoreDisplays[categoryNumber].innerHTML = output.toFixed(2);
//     DVSC.categoryScores[categoryNumber] = output;
// }


// /**
//  * Sets the stroke-dashoffset for every category arch including background and filling
//  */
// function setOffset(){

//     function getDX(currentIndex) {
//         let degree = 0;
//         let rad;
//         let dx;
//         for (let i = 0; i < currentIndex; i++) {
//             degree += parseFloat(categoryWeights[i].value);
//         }
//         degree = 3.6 * degree;
//         rad = (degree / 180) * Math.PI;
//         function F(x) {
//             let offset = ((3.6* parseFloat(categoryWeights[currentIndex].value))/180)*Math.PI/2;
//             return 50 * Math.cos(x + offset);
//         }
//         dx = F(rad);
//         return dx;
//     }

//     /**
//      * Returns the y distance from the center
//      * @param {int} currentIndex
//      * @returns {number}
//      */
//     function getDY(currentIndex) {
//         let degree = 0;
//         let rad;
//         let dy;
//         for (let i = 0; i < currentIndex; i++) {
//             degree += parseFloat(categoryWeights[i].value);
//         }
//         degree = 3.6 * degree;
//         rad = (degree / 180) * Math.PI;
//         function F(x) {
//             let offset = ((3.6* parseFloat(categoryWeights[currentIndex].value))/180)*Math.PI/2;
//             return 50 * Math.sin(x + offset);
//         }
//         dy = F(rad);
//         return dy;
//     }

//     /**
//      * get the offset in degrees for the current index category circle part
//      * @param {int} currentIndex 
//      * @returns number
//      */
//     function getDegrees(currentIndex){
//         let degree = 0;
//          for (let i = 0; i < currentIndex; i++) {
//             degree += parseFloat(categoryWeights[i].value);
//          } 
//          return  3.6 * degree;
//     }

//     //setting the length and position on the circle for every category background circle arch
//     svgBackgroundCircles.forEach((element,index)=>{
//         element.setAttribute("stroke-dashoffset", 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0));
//         if(index >= 1){
//                  element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
//         }
//     });
//     //setting the length and position on the circle for every category scoring circle arch 
//     svgScoreCircles.forEach((element,index)=>{
//         //console.log(Math.min((2.0 * 46 * Math.PI - 6) * (1.0 - categoryWeights[index].value * (DVSC.categoryScores[index] / 1000) * 0.01), 2 * 46 * Math.PI - 12));
//          element.setAttribute("stroke-dashoffset", 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index].value * (DVSC.categoryScores[index] / 1000) * 0.01) > 278 ? 278: 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index].value * (DVSC.categoryScores[index] / 1000) * 0.01) < 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0) + 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0) * 0.05	? 2 * 46 * Math.PI * (1 - categoryWeights[index].value / 100.0): 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index].value * (DVSC.categoryScores[index] / 1000) * 0.01));
//           if (index >= 1) {
// 			element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
// 		}
//     });

//     //setting the position for every category text element near to its circle part
//     svgTexts.forEach((element,index)=>{
//         let positionX = getDX(index);
//         let positionY  = getDY(index);
//         if(positionX > 12){
//             element.style.transform = "translateX(" + element.getBoundingClientRect().width/4  +"px)";
//         }
//         else if(positionX < -12 ){
//             element.style.transform = "translateX(" + -1*element.getBoundingClientRect().width/4  +"px)";
//         }
//         else if(positionX <= 12 && positionX >= -12 ){
//             element.style.transform = "translateX(0px)";
//             if(positionY > 0){
//                 element.style.transform = "translateY(" +  element.getBoundingClientRect().height/4 +"px)";
//             }
//             else{
//                 element.style.transform = "translateY(" +  -1*element.getBoundingClientRect().height/4 +"px)";
//             }
//         }
//         if( positionY <= -12 && positionY >= 12){
//             element.style.transform = "translateY(0px)";
//             if(positionX < 0){
//                 element.style.transform = "translateX(" + -1*element.getBoundingClientRect().width +"px)";
//             }
//         }
//             element.setAttribute("dx", getDX(index));
//             element.setAttribute("dy", getDY(index));
//         })
// }

// /**
//  * Calculate and Display the total Score [0 ; 100] and adjust the stroke-dashoffset accordingly
//  */
// function calcTotalScore(){
//     let numerator = 0;
//     for(let i = 0; i< DVSC.categoryCount; i++){
//         numerator += (DVSC.categoryScores[i]/1000)*parseFloat(categoryWeights[i].value/100);
//     }
//     let totalScore = numerator*100;
//     totalScoreText.setAttribute("fill" , "hsl("+((totalScore/100)*115).toString()+",78%,45%)");
//     totalScoreCircle.setAttribute("stroke", "hsl(" + ((totalScore / 100) * 115).toString() + ",78%,45%)");
//     totalScoreCircle.setAttribute("stroke-dashoffset", 2*40*Math.PI*(1-totalScore/100));
//     totalScoreText.innerHTML = (totalScore).toFixed(0);
// }

// /**
//  * applies attributes to an HTML Element
//  * @param {HTMLElement} element 
//  * @param {object} attributes 
//  */
// function applyAttributes(element, attributes){
//     for(const key in attributes){
//         element.setAttribute(key, attributes[key]);
//     }
// }

// // Set weightings manually 
// const weightSettingsBtn = document.querySelector(".set_weights_btn");
// const discardIcon = `<svg height="26" viewBox="0 0 26 26" width="26" xmlns="http://www.w3.org/2000/svg"><path d="M22.429 12.524a9.905 9.905 0 0 1-9.905 9.905 9.905 9.905 0 0 1-9.905-9.905 9.905 9.905 0 0 1 19.81 0zM8.81 8.81l7.429 7.429m0-7.429L8.81 16.239" fill="none" stroke="#ff1d15" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// const approveIcon = `<svg height="26" viewBox="0 0 26 26" width="26" xmlns="http://www.w3.org/2000/svg"><path d="m5.619 12.81 3.714 3.714 9.939-9.905" fill="none" stroke="#61E786" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"/></svg>`;
// const settingsIcon = `<svg height="26" viewBox="0 0 26 26" width="26" xmlns="http://www.w3.org/2000/svg"> <g fill="none" fill-rule="evenodd" stroke="#999999" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M12.285 3.619c.434 0 .863.032 1.28.094l.629 1.906a6.784 6.784 0 0 1 1.56.664l1.808-.872a8.683 8.683 0 0 1 1.69 1.719l-.904 1.791a6.79 6.79 0 0 1 .636 1.572l1.895.66a8.748 8.748 0 0 1-.021 2.412l-1.906.629a6.893 6.893 0 0 1-.664 1.56l.872 1.808a8.718 8.718 0 0 1-1.719 1.69l-1.791-.904a6.818 6.818 0 0 1-1.572.636l-.66 1.895a8.748 8.748 0 0 1-2.412-.021l-.629-1.906a6.893 6.893 0 0 1-1.56-.664l-1.808.872a8.718 8.718 0 0 1-1.69-1.719l.904-1.791a6.89 6.89 0 0 1-.636-1.572l-1.895-.661a8.748 8.748 0 0 1 .021-2.41l1.906-.629a6.784 6.784 0 0 1 .664-1.56L5.411 7.01A8.718 8.718 0 0 1 7.13 5.32l1.791.904a6.818 6.818 0 0 1 1.572-.636l.661-1.895a8.741 8.741 0 0 1 1.131-.074z"/><path d="M16 12.285A3.715 3.715 0 0 1 12.285 16a3.715 3.715 0 0 1-3.713-3.715 3.715 3.715 0 0 1 7.428 0z"/></g></svg>`;



// weightSettingsBtn.addEventListener("click",()=>{
//     // create Elements, if it is the fist interaction
//     if(document.querySelector(".manual_input_modal") == undefined || document.querySelector(".manual_input_modal") == null){
//         // manual input modal
//         let manualInputModal = document.createElement("div");
//             manualInputModal.style.width = tableHeadingWeighting.clientWidth + 4  +"px"; 
//             manualInputModal.style.top =  tableHeadingRow.clientHeight  + "px";
//             manualInputModal.style.display = "flex";
//             manualInputModal.setAttribute("class", "manual_input_modal");
//                 // create input elements
//                 for( let i = 0; i < DVSC.categoryCount ; i++){
//                     let manualInput = document.createElement("input");
//                     let manualInputAttr ={
//                         type: "number",
//                         class:"manual_weight_input",
//                         min: "0.01",
//                         max: (100 - (0.01 * (DVSC.categoryCount - 1))).toString(),
//                         step: "0.01",
//                         value: ( 100 / DVSC.categoryCount).toString()
//                     }

//                     applyAttributes(manualInput, manualInputAttr);
//                     manualInput.style.height = document.querySelector("#no1 > div.dvsc_settings > table > tbody > tr:nth-child(1)").clientHeight +"px";
//                     manualInputModal.appendChild(manualInput);
//                 }
                
//                 //create sum element
//                 let sum = document.createElement("span");
//                 sum.setAttribute("class", "manual_input_sum");
//                 sum.innerHTML = "100";
//                 manualInputModal.appendChild(sum);
//         tableHeadingWeighting.appendChild(manualInputModal);

//         //handle button situation
//         let discard = document.createElement("button");
//         let discardAttr = {
//             class: "discard_btn",
//             style: "display: flex",
//             title: "discard changes"
//         }
//         applyAttributes(discard, discardAttr);
//         weightSettingsBtn.title = "save";
//         weightSettingsBtn.innerHTML = approveIcon;
//         discard.innerHTML = discardIcon;
//         tableHeadingWeightingSpan.appendChild(discard);
        
//         // add event listeners
//         let manualInputs = document.querySelectorAll(".manual_weight_input");
//         manualInputs.forEach((element)=>{    element.addEventListener("input", ()=>{    calcManualWeightsSum()  }) });
//         discard.addEventListener("click",()=>{toggleManualWeightsSettings("close")})

       
//     }
//     else{
    
//         let modal = document.querySelector(".manual_input_modal");
//         let sumElement = document.querySelector(".manual_input_sum");
//         if(modal.style.display == "flex"){
//         //check if modal is visible
//             if(sumElement.innerText !== "100" && sumElement.innerText !== "100.00"){
//                 // stop, if the sum of the manually input weights is not 100
//                 window.alert("\nCould not verify changes.\nAll weights added together must be 100!");
//                 throw new Error("\nCould not verify changes.\nAll weights added together must be 100!")
//             }

//             toggleManualWeightsSettings("close");
//             setWeightsManually();
//         }
//         else{
//             toggleManualWeightsSettings("open");
//         }
//     }
// });

// /**
//  * Applies the manually adjusted weights to the main module and calculates the new main score and adjusts the stroke dash offset
//  */
// function setWeightsManually(){
//     let manualInputs = Array.from(document.querySelectorAll(".manual_weight_input"));
//     manualInputs.forEach((element, index)=>{
//         DVSC.categoryWeights[index] = parseFloat(element.value);
//         categoryWeights[index].value = element.value.toString();
//         categoryWeightDisplays[index].innerHTML = element.value.toString();
//         setOffset();
//         calcTotalScore();
//     })
// }

// /**
//  * Calculates the sum of all manual input weights and and displays them.
//  * ALso Changes the color of the sum red, if the sum is not 100, and green if the sum is 100
//  */
// function calcManualWeightsSum(){
//     let inputs =  document.querySelectorAll(".manual_weight_input");
//     let sumElement = document.querySelector(".manual_input_sum");
//     let sum = 0;

//     inputs.forEach((element)=>{
//         sum += parseFloat(element.value);
//     })
    
//     sumElement.innerHTML = sum.toFixed(2);

//     if( sum > 100 || sum < 100){
//         sumElement.style.color = "#ff1d15";
//     }
//     else if(sum == 100){
//         sumElement.style.color = "#61E786";
//     }

// }


// /**
//  * Takes the input, which is an instruction, of either "open" or "close", and then opens or closes the manual weighting adjustment panel.
//  * ALso the button titles and icons adjust accordingly
//  * @param {String} state 
//  */
// function toggleManualWeightsSettings(state){
//     let modal = document.querySelector(".manual_input_modal");
//     let rightBtn = document.querySelector(".set_weights_btn");
//     let leftBtn = document.querySelector(".discard_btn");

//     if(state == "close"){
//         leftBtn.style.display = "none";
//         rightBtn.title = "set the weights manually";
//         rightBtn.innerHTML = settingsIcon
//         modal.style.display = "none";
//     }
//     else if(state == "open"){
//         leftBtn.style.display = "flex";
//         rightBtn.title = "save";
//         rightBtn.innerHTML = approveIcon
//         modal.style.display = "flex";
//     }

// }


// // init with a IIEF
// (()=>{ 
//     for (let i = 0; i < DVSC.categoryCount; i++) {
//     categoryCompiler(i, DVSC.categoryEvaluations[i], DVSC.categoryValues[i], parseFloat(categoryBias[i].value), parseFloat(categoryTargets[i].value), DVSC.categoryDirections[i], DVSC.categoryGrains[i]);
//     setOffset();
//     calcTotalScore();
//     }
// })()