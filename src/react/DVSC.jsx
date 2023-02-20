/**
 * Import this file (the one you're are reading right now) into a file, where the Dynamic Visual Scoring Calculator should be located and feed the component with its config Object (DVSC)
 * example usage:
 * import React from "react";
 * import DynamicVisualScoringCalculator from "./DynamicVisualScoringCalculator";
 *  function MyReactComponent(){
 *   
 *  let DVSC = { ...}
 * 	
 * 	return (
 *  	<>
 *  		<div className='my_parent_element'>
 *  				<DynamicVisualScoringCalculator config={DVSC} />
 *  		</div>
 *  	</>
 *  );
 */

import React, { useEffect, useState, useCallback , useRef} from "react";
import "./style.css";
import { getScoreLinear, getScoreQuadratic, getScoreCubic, getScoreDefault } from "../calcScores";
import calcWeights from "../calcWeights";


//example config
let DVSC = {
	categoryBias : [0,0,0,0,0],
	categoryColors: ["#FF1D15", "#0075FF", "#61E786", "#ffbb00",  "#AA3E98", "#AA3E98", "#34F6F2"], // define the circle colors
	categoryCount: 5,// number of category
	categoryDirections: [-1, 1, 1, -1, -1],// 1: data point > target value; -1: data point < target value 
	categoryEvaluations: ["lin", "quad", "quad", "linear", "cube"], // how should the score of a category be calculated
	categoryGrains: [15, 5, 5, 40,10],// fine tune to the acceptable difference between data point and target value ( IMPORTANT: g !== 0 always)!
	categoryNames: ["Menu", "Cost", "Waiting Time", "Ambiance", "Taste"],//category title to display
	categoryNumbers: [0,1,2,3,4],
	categoryScores: [500,500,500,500,500],
	categorySteps: [10, 0.01, 1, 10, 1],//how big on step on the slider should be
	categoryTargets: [100, 15, 5, 100, 100],// target value to which a data Point in the data set should converge
	categoryUnits: ["%", "€", "min", "%","%"],// category unit to display
	categoryValues: [70,12,5,60,80],
	categoryWeights: [20.00, 20.00, 20.00, 20.00,20.00], // presets	
};


function DynamicVisualScoringCalculator(props) {
	const [categoryBias, setCategoryBias] = useState(props.config.categoryBias);
	const [categoryColors, setCategoryColors] = useState(props.config.categoryColors);
	const [categoryCount, setCategoryCount] = useState(props.config.categoryCount);
	const [categoryDirections, setCategoryDirections] = useState(props.config.categoryDirections);
	const [categoryEvaluations, setCategoryEvaluations] = useState(props.config.categoryEvaluations);
	const [categoryGrains, setCategoryGrains] = useState(props.config.categoryGrains);
	const [categoryNames, setCategoryNames] = useState(props.config.categoryNames);
	const [categoryNumbers, setCategoryNumbers] = useState(props.config.categoryNumbers);
	const [categoryScores, setCategoryScores] = useState(props.config.categoryScores);
	const [categorySteps, setCategorySteps] = useState(props.config.categorySteps);
	const [categoryTargets, setCategoryTargets] = useState(props.config.categoryTargets);
	const [categoryUnits, setCategoryUnits] = useState(props.config.categoryUnits);
	const [categoryValues, setCategoryValues] = useState(props.config.categoryValues);
	const [categoryWeights, setCategoryWeights] = useState(props.config.categoryWeights);
	const [lastChange, setLastChange] = useState();
	const [totalScore, setTotalScore] = useState(0);
	const [totalScoreFill, setTotalScoreFill] = useState("null");
	const [totalScoreOffset, setTotalScoreOffset] = useState(0);
	const [svgBackgroundCirclesOffset, setSvgBackgroundCirclesOffset] = useState(["", "", "", "", "", "", "", "","", "", "", "", "", "", "", ""]);
	const [svgBackgroundCirclesRotation, setSvgBackgroundCirclesRotation] = useState(["", "", "", "", "", "", "", "","", "", "", "", "", "", "", ""]);
	const [svgScoreCirclesOffset, setSvgScoreCirclesOffset] = useState(["", "", "", "", "", "", "", "","", "", "", "", "", "", "", ""]);
	const [svgScoreCirclesRotation, setSvgScoreCirclesRotation] = useState(["", "", "", "", "", "", "", "","", "", "", "", "", "", "", ""]);
	const [svgTextsDX, setSvgTextsDX] = useState(["", "", "", "", "", "", "", "","", "", "", "", "", "", "", ""]);
	const [svgTextsDY, setSvgTextsDY] = useState(["", "", "", "", "", "", "", "","", "", "", "", "", "", "", ""]);
	const [targetMins, setTargetMins] = useState(["", "", "", "", "", "", "", "","", "", "", "", "", "", "", ""]);
	const [targetMaxs, setTargetMaxs] = useState(["", "", "", "", "", "", "", "","", "", "", "", "", "", "", ""]);
	const [svgTextTransform, setSvgTextTransform] = useState([{fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100},{fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100}, {fontWeight: 100},{fontWeight:100}]);	
	const svgTexts = [useRef(), useRef(), useRef(), useRef() , useRef(),useRef(),useRef(),useRef(),useRef(),useRef(),useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
	

	const targetChangeHandler = (event, index) => {
		let newTargets = categoryTargets;
		newTargets.splice(index, 1, parseFloat(event.target.value));
		setCategoryTargets(newTargets);
		setLastChange(event.target.value);
		categoryCompiler(index, categoryEvaluations[index], categoryValues[index], categoryBias[index], categoryTargets[index], categoryDirections[index], categoryGrains[index]);
		calcTotalScore();
		setOffset();
	};

	const biasChangeHandler = (event, index) => {
		let newBiases = categoryBias;
		newBiases.splice(index, 1, parseFloat(event.target.value));
		setCategoryBias(newBiases);
		setLastChange(event.target.value);
		categoryCompiler(index, categoryEvaluations[index], categoryValues[index], categoryBias[index], categoryTargets[index], categoryDirections[index], categoryGrains[index]);
		calcTotalScore();
		setOffset();
	};

	const weightChangeHandler = (event, index) => {
		getAdjustments(parseFloat(event.target.value), index);
		setLastChange(event.target.value);
		calcTotalScore();
		setOffset();
	};

	const getAdjustments = useCallback(
		(userInput, currentAdjustmentIndex) => {
			if (categoryCount !== 1 && categoryCount !== 0) {
				let matrix = new Array(categoryCount - 1);
				let vector = new Array(categoryCount - 1);
				for (let i = 0; i < categoryCount - 1; i++) {
					if (i === 0) {
						vector[i] = [100 - userInput];
					} else {
						vector[i] = [0];
					}

					let temp = new Array(categoryCount - 1);
					for (let k = 0; k < temp.length; k++) {
						temp[k] = 0;
					}
					matrix[i] = temp;
				}

				for (let row = 0; row < categoryCount - 1; row++) {
					for (let column = 0; column < categoryCount - 1; column++) {
						if (row === 0) {
							matrix[row][column] = 1;
						} else {
							if (column === row - 1) {
								matrix[row][column] = -categoryWeights[row + 1];
							}
							if (column === row) {
								matrix[row][column] = categoryWeights[row];
							}
						}
					}
				}

				let newPercentages = calcWeights(matrix, vector);
				newPercentages.splice(currentAdjustmentIndex, 0, userInput);
				for (let i = 0; i < categoryCount; i++) {
					if (newPercentages[i] < 0.01 && i !== currentAdjustmentIndex) {
						newPercentages[currentAdjustmentIndex] = newPercentages[currentAdjustmentIndex] - (0.01 - newPercentages[i]);
						newPercentages[i] = 0.01;
					}
				}

				if (newPercentages[currentAdjustmentIndex] > 0.01) {
					setCategoryWeights(newPercentages);
				}
			} else {
				setCategoryWeights([userInput]);
			}
		},
		[categoryWeights, categoryCount]
	);

	const categoryCompiler = useCallback(
		(number, evaluation, value, bias, target, direction, grain) => {
			let output;
			if (evaluation === "lin" || evaluation === "linear") {
				output = getScoreLinear(value, bias, target, direction, grain);
			} else if (evaluation === "quad" || evaluation === "quadratic") {
				output = getScoreQuadratic(value, bias, target, direction, grain);
			} else if (evaluation === "cube" || evaluation === "cubic") {
				output = getScoreCubic(value, bias, target, direction, grain);
			} else if (evaluation === "def" || evaluation === "default") {
				output = getScoreDefault(value, bias, target, direction, grain);
			}

			let newScores = categoryScores;
			newScores.splice(number, 1, parseFloat(output));
			setCategoryScores(newScores);
		},
		[categoryScores]
	);

	const calcTotalScore = useCallback(() => {
		let numerator = 0;
		for (let i = 0; i < categoryCount; i++) {
			numerator += (categoryScores[i] / 1000) * parseFloat(categoryWeights[i] / 100);
		}
		let ts = numerator * 100;
		let tf = `hsl(${((ts / 100) * 115).toString()},78%,45%)`;
		let to = 2 * 40 * Math.PI * (1 - ts / 100);
		setTotalScoreFill(tf);
		setTotalScoreOffset(to);
		setTotalScore(ts);
	}, [categoryWeights, categoryScores, categoryCount]);

	const setOffset = useCallback(() => {
		function getDX(currentIndex) {
			let degree = 0;
			let rad;
			let dx;
			for (let i = 0; i < currentIndex; i++) {
				degree += parseFloat(categoryWeights[i]);
			}
			degree = 3.6 * degree;
			rad = (degree / 180) * Math.PI;
			function F(x) {
				let offset = (((3.6 * parseFloat(categoryWeights[currentIndex])) / 180) * Math.PI) / 2;
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
				degree += parseFloat(categoryWeights[i]);
			}
			degree = 3.6 * degree;
			rad = (degree / 180) * Math.PI;
			function F(x) {
				let offset = (((3.6 * parseFloat(categoryWeights[currentIndex])) / 180) * Math.PI) / 2;
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
				degree += parseFloat(categoryWeights[i]);
			}
			return 3.6 * degree;
		}

		//setting the length and position on the circle for every category background circle arch
		let newSvgBackgroundCirclesOffsets = [];
		let newSvgBackgroundCirclesRotations = [];
		for (let index = 0; index < categoryCount; index++) {
			let offset = 2 * 46 * Math.PI * (1 - categoryWeights[index] / 100.0);
			let rotation = "rotate(" + getDegrees(index).toString() + ")";
			// let rotation =  getDegrees(index).toString()

			newSvgBackgroundCirclesOffsets[index] = offset;
			// if(index >= 1){
			newSvgBackgroundCirclesRotations[index] = rotation;
			// }
			// else{
			// 	newSvgBackgroundCirclesRotations[index] = "rotate(0rad)"
			// }
		}
		setSvgBackgroundCirclesOffset(newSvgBackgroundCirclesOffsets);
		setSvgBackgroundCirclesRotation(newSvgBackgroundCirclesRotations);
		//setting the length and position on the circle for every category scoring circle arch
		let newSvgScoreCirclesOffsets = [];
		let newSvgScoreCirclesRotations = [];
		for (let index = 0; index < categoryCount; index++) {
			let offset =
				2.0 * 46 * Math.PI * (1.0 - categoryWeights[index] * (categoryScores[index] / 1000) * 0.01) > 278
					? 278
					: 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index] * (categoryScores[index] / 1000) * 0.01) < 2 * 46 * Math.PI * (1 - categoryWeights[index] / 100.0) + 2 * 46 * Math.PI * (1 - categoryWeights[index] / 100.0) * 0.05
					? 2 * 46 * Math.PI * (1 - categoryWeights[index] / 100.0)
					: 2.0 * 46 * Math.PI * (1.0 - categoryWeights[index] * (categoryScores[index] / 1000) * 0.01);
			let rotation = "rotate(" + getDegrees(index).toString() + ")";
			// let rotation =  getDegrees(index).toString()

			newSvgScoreCirclesOffsets[index] = offset;
			// if (index >= 1) {
			newSvgScoreCirclesRotations[index] = rotation;
			// }
			// else{
			// 	newSvgScoreCirclesRotations[index] = "rotate(0rad)";
			// }
		}
		setSvgScoreCirclesOffset(newSvgScoreCirclesOffsets);
		setSvgScoreCirclesRotation(newSvgScoreCirclesRotations);

		//setting the position for every category text element near to its circle part
		let newSvgTextsDX = [];
		let newSvgTextsDY = [];
		let newSvgTextsTransform = [];
		for (let index = 0; index < categoryCount; index++) {
			let positionX = getDX(index);
			let positionY = getDY(index);

			console.log()
			if(positionX > 12){
				// newSvgTextsTransform[index] = "translateX(" + element.getBoundingClientRect().width/4  +"px)";
				// newSvgTextsTransform[index] = ({: "translateX(" + svgTexts[index].current.getBoundingClientRect().width +"px)"})
				newSvgTextsTransform[index] = ({transform: "translateX("+svgTexts[index].current.getBoundingClientRect().width/8 +"px)"})

			}
			else if(positionX < -12 ){
				// newSvgTextsTransform[index] = "translateX(" + -1*element.getBoundingClientRect().width/4  +"px)";
				newSvgTextsTransform[index] = ({transform: "translateX("+ (-1)*svgTexts[index].current.getBoundingClientRect().width/2 +"px)"})

			}
			else if(positionX <= 12 && positionX >= -12 ){
				
				if(positionY > 0){
					// newSvgTextsTransform[index] = "translateY(" +  element.getBoundingClientRect().height/4 +"px)";
				newSvgTextsTransform[index] = ({transform: "translateY("+svgTexts[index].current.getBoundingClientRect().height/5 +"px)"})

				}
				else{
					// newSvgTextsTransform[index] = "translateY(" +  -1 * element.getBoundingClientRect().height/4 +"px)";
				newSvgTextsTransform[index] = ({transform: "translateY("+ (-1)*svgTexts[index].current.getBoundingClientRect().height/5 +"px)"})

				}
			}
			if( positionY <= -12 && positionY >= 12){
				// newSvgTextsTransform[index] = "translateY(0px)";
				newSvgTextsTransform[index] = ({transform: "translateY(0px)"})

				if(positionX < 0){
					// newSvgTextsTransform[index] = "translateX(" + -1 * element.getBoundingClientRect().width +"px)";
					newSvgTextsTransform[index] = ({transform: "translateX("+ (-1)*svgTexts[index].current.getBoundingClientRect().width +"px)"})

				}
			}
			newSvgTextsDX[index] = positionX;
			newSvgTextsDY[index] = positionY;
		}
		setSvgTextTransform(newSvgTextsTransform);
		setSvgTextsDX(newSvgTextsDX);
		setSvgTextsDY(newSvgTextsDY);



	}, [categoryScores, categoryWeights, categoryCount, svgTexts]);


	const minHandler = (index)=>{
		if(categoryDirections[index] === -1){
				return (categoryValues[index]).toString();
		}
		else if(categoryDirections[index] === 1){
			switch(categoryUnits[index]){
				case "%":
					return "0";
				case "Percent":
					return "0"
				case "percent":
					return "0"
				case "s":
					return "0"
				case "S":
					return "0"
				case  "Seconds":
					return "0"
				case "seconds":
					return "0"
				case "min":
					return "0"
				case "minutes":
					return "0"
				case "Minutes":
					return "0"
				case "h":
					return "0"
				case "hours":
					return "0"
				case "Hours":
					return "0"
				case "€":
					return "0"
				case "Euro":
					return "0"
				case "euro":
					return "0"
				case "$":
					return "0"
				case "Dollar":
					return "0"
				case "dollar":
					return "0"
				default:
					return (categoryValues[index] - categoryGrains[index]*5).toString();
			}
		}
	}

	const maxHandler = (index) =>{
		if(categoryDirections[index] === -1){

			switch(categoryUnits[index]){
				case "%":
					return "100";
				case "Percent":
					return "100";
				case "percent":
					return "100";
				default:
					return (categoryValues[index] + categoryGrains[index]*14).toString();
			}

		}
		else if(categoryDirections[index] === 1){
				return (categoryValues[index]).toString();

		}
	}

	useEffect(()=>{
		let newTargetMins = [];
		let newTargetMaxs = [];
		for(let index = 0; index< categoryCount; index++){
			newTargetMins[index] = minHandler(index);
			newTargetMaxs[index] = maxHandler(index);
		}
		setTargetMaxs(newTargetMaxs);
		setTargetMins(newTargetMins);
	},[])

	return (
		<>
			<div className='dynamic_visual_scoring_calculator' id='no1'>
				<div className='dvsc_settings'>
					<table>
						<thead className='dvsc_settings_head'>
							<tr>
								<th>Category</th>
								<th>Value</th>
								<th>Target Value</th>
								<th>Bias</th>
								<th>
									<span className='dvsc_table_head_weighting'>
										Weighting
										<button className='set_weights_btn' title='set the weights manually'>
											<svg height='26' viewBox='0 0 26 26' width='26' xmlns='http://www.w3.org/2000/svg'>
												<g fill='none' fillRule='evenodd' stroke='#999999' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.2'>
													<path d='M12.285 3.619c.434 0 .863.032 1.28.094l.629 1.906a6.784 6.784 0 0 1 1.56.664l1.808-.872a8.683 8.683 0 0 1 1.69 1.719l-.904 1.791a6.79 6.79 0 0 1 .636 1.572l1.895.66a8.748 8.748 0 0 1-.021 2.412l-1.906.629a6.893 6.893 0 0 1-.664 1.56l.872 1.808a8.718 8.718 0 0 1-1.719 1.69l-1.791-.904a6.818 6.818 0 0 1-1.572.636l-.66 1.895a8.748 8.748 0 0 1-2.412-.021l-.629-1.906a6.893 6.893 0 0 1-1.56-.664l-1.808.872a8.718 8.718 0 0 1-1.69-1.719l.904-1.791a6.89 6.89 0 0 1-.636-1.572l-1.895-.661a8.748 8.748 0 0 1 .021-2.41l1.906-.629a6.784 6.784 0 0 1 .664-1.56L5.411 7.01A8.718 8.718 0 0 1 7.13 5.32l1.791.904a6.818 6.818 0 0 1 1.572-.636l.661-1.895a8.741 8.741 0 0 1 1.131-.074z' />
													<path d='M16 12.285A3.715 3.715 0 0 1 12.285 16a3.715 3.715 0 0 1-3.713-3.715 3.715 3.715 0 0 1 7.428 0z' />
												</g>
											</svg>
										</button>
									</span>
								</th>
								<th>Score</th>
							</tr>
						</thead>
						<tbody>
							{categoryNames.map((name, index) => (
								<tr key={index}>
									<th>{name}</th>
									<td>
										<output className='dvsc_data_input_display'>{categoryValues[index]}</output>
										<span> {categoryUnits[index]} </span>
									</td>
									<td>
										<input
											className='dvsc_target_value_input'
											id={`dvsc_target_value_input_${index}`}
											type='range'
											value={categoryTargets[index]}
											step={categorySteps[index]}
											min={targetMins[index]}
											max={targetMaxs[index]}
											onChange={(event) => targetChangeHandler(event, index)}
										/>
										<p className='dvsc_tab'>
											<output className='dvsc_target_value_input_display'>{categoryTargets[index].toString()} </output>
											<span>{categoryUnits[index]}</span>
										</p>
									</td>
									<td>
										<input className='dvsc_bias_input' id={`dvsc_bias_input_${index}`} min='-5' max='5' type='range' step='1' value={categoryBias[index].toString()} onChange={(event) => biasChangeHandler(event, index)} />
										<p className='dvsc_tab'>
											<output className='dvsc_bias_input_display'>{categoryBias[index]}</output>
										</p>
									</td>
									<td>
										<input className='dvsc_weighting_input' id={`dvsc_weighting_input_${index}`} type='range' step='0.01' value={categoryWeights[index].toString()} onChange={(event) => weightChangeHandler(event, index)} />
										<p className='dvsc_tab'>
											<output className='dvsc_weighting_input_display'> {categoryWeights[index].toFixed(2)} </output>
											<span> %</span>
										</p>
									</td>
									<td>
										<p className='dvsc_tab'>
											<output className='dvsc_category_score_display'>{categoryScores[index].toFixed(2)}</output>
											<span>
												<sub>/1000</sub>
											</span>
										</p>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className='dvsc_output'>
					<svg xmlns='http://www.w3.org/2000/svg' className='dvsc_output_svg' viewBox='0 0 100 100'>
						<g id='dvsc_fractions'>
							{categoryWeights.map((weight, index) => (
								<>
									<g key={`group${index}`}>
										<circle
											key={`c1${index}`}
											cx='50'
											cy='50'
											r='46'
											strokeWidth='3'
											strokeLinecap='round'
											opacity='0.5'
											fill='none'
											transform-origin='center'
											id={`dvsc_fraction_${(index + 1).toString()}_background`}
											stroke={categoryColors[index]}
											className='fraction fraction_bg'
											transform={svgBackgroundCirclesRotation[index]}
											strokeDasharray={2 * 46 * Math.PI - 6}
											strokeDashoffset={svgBackgroundCirclesOffset[index].toString()}></circle>
										<circle
											key={`c2${index}`}
											cx='50'
											cy='50'
											r='46'
											strokeWidth='3'
											opacity='1'
											strokeLinecap='round'
											fill='none'
											transform-origin='center'
											id={`dvsc_fraction_${(index + 1).toString()}_indicator`}
											stroke={categoryColors[index]}
											className='fraction fraction_bar'
											transform={svgScoreCirclesRotation[index].toString()}
											strokeDasharray={2 * 46 * Math.PI - 6}
											strokeDashoffset={svgScoreCirclesOffset[index].toString()}></circle>
										<text
											ref={svgTexts[index]}
											key={`t1${index}`}
											id={`dvsc_category_name_${index}`}
											className='category_text'
											x='50'
											y='50'
											dx={svgTextsDX[index]}
											dy={svgTextsDY[index]}
											style={svgTextTransform[index]}
											>
											{categoryNames[index]}
										</text>
									</g>
								</>
							))}
						</g>
						<g id='dvsc_total_score'>
							<circle id='dvsc_score_indicator' stroke={totalScoreFill} strokeDasharray={2 * 40 * Math.PI} strokeDashoffset={totalScoreOffset.toString()}></circle>
							<text id='dvsc_score_text' x='50' y='50' fill={totalScoreFill}>
								{totalScore.toFixed(0)}
							</text>
						</g>
					</svg>
				</div>
			</div>
		</>
	);
}

export default DynamicVisualScoringCalculator;
