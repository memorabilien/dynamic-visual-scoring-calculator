import React, { useEffect, useState, useCallback } from "react";
import { getScoreLinear, getScoreQuadratic, getScoreCubic } from "../scoreCalc";
import calculator from "../matrix";
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

				let eq = matrix(tempMatrix);
				let res = matrix(vector);

				let newPerc = calculator(eq, res);

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


	useEffect(() => {
		let categoryScore = [] ?? [0, 0, 0, 0];
		for (let i = 0; i < config.category_count; i++) {
			if (config.category_evaluation[i] === "lin" || config.category_evaluation[i] === "linear") {
				categoryScore[i] = getScoreLinear(data[i], biasInputValues[i], targetValues[i], config.category_direction[i], config.category_grain[i]);
			} else if (config.category_evaluation[i] === "quad" || config.category_evaluation[i] === "quadratic") {
				categoryScore[i] = getScoreQuadratic(data[i], biasInputValues[i], targetValues[i], config.category_direction[i], config.category_grain[i]);
			} else if (config.category_evaluation[i] === "cube" || config.category_evaluation[i] === "cubic") {
				categoryScore[i] = getScoreCubic(data[i], biasInputValues[i], targetValues[i], config.category_direction[i], config.category_grain[i]);
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
