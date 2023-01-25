# Dynamic Visual Scoring Calculator

A dynamically adjustable scoring calculator with a lighthouse style data visualization. Get a score between 0 to 100 from data, with dynamically adjustable target value, a from -5 to +5 adjustable bias , and a self adjusting weighting system.

[Live Demo](https://memorabilien.github.io/dynamic-visual-scoring-calculator/src/)

### Config

```js
let config = {
	category_count: 4,// number of category
	category_names: ["Time", "Cost", "Efficiency", "Personell"],//category title to display
	category_value_unit: ["s", "€", "%", "P"],// category unit to display
	category_target_values: [10, 20, 100, 0],// target value to which a data Point in the data set should converge
	category_target_value_step: [1, 0.01, 0.01, 1],//how big on step on the slider should be
	category_direction: [1, 1, -1, 1],// 1: data point > target value; -1: data point < target value 
	category_grain: [1, 1, 1, 1],// fine tune to the acceptable difference between data point and target value
	category_evaluation: ["linear", "quadratic", "cubic", "linear"], // how should the score of a category be calculated
	category_weighting_preset: [25, 25, 25, 25], // presets
	colors: ["#ff0000", "#ff7b00", "#ffbb00", "#00dfba", "#127efa", "#8921ff", "#d500e9"], // define the circle colors
};
```

## Score Claculation

To calculate a single category Score, the main principle is the difference between the `category_target_value` and the acutal `data_value`. Things to note are as follows:

* The `data_value` can not be dynamically adjusted by the front end user, because it is a measured value in open world.
* The `target_value` is adjustabe, with the `min` or `max` value  automatically beeing set to the `data_value`.
  Should the `data_value >= target_value` the `category_direction = 1` . E.g. the category goal is it to omptimize the measured process for as little time as possible). If set correctly the `target_value` cannot be set bigger than the `data_value`. The Result is the ajdustable `target_value` will automatically stop at `max = data_value`.
  Now The other way arround: Should the `data_value <= target_value` the `category_direction = -1` . E.g. the category goal is it to opptimize the measured process for the hightest efficientcy possible. If set correctly the `target_value` cannot be set smaller than the `data_value`. The Result is the ajdustable `target_value` will automatically stop at `min = data_value`.
* The `category_weight` can be adjusted, which affects the overall score, but **not** the ``category_score``! When adjusting one `category_weighting` all the other `category_weightings` will adjust accordingly to   `∑[^category_count][_i = 1] category_weight[_i] = 1 = 100%`
* The `bias_value` is adjustable, with the `bias_value` accepting any value between x ∈ [-5 , 5] ,  x ∈ Z. If `0 < bias_value < 5 ` means, you favor the category and therfore giving it a better score. If the  `bias_value == 5` the `categegory_score ≅ 1 ≅ 100%` .
  Ifyou set  `-5 < bias_value < 0 ` means, you disfavor the category and therfore giving it a worse score. If the `bias_value == -5` the `categegory_score ≅ 0 ≅ 0%` .
