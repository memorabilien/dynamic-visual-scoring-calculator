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
* The `category_weight` can be adjusted, which affects the overall score, but **not** the ``category_score``! When adjusting one `category_weighting` all the other `category_weightings` will adjust accordingly, so   $\sum_{i=1}^c categoryScore_i = 1 = 100\%  $ . For ease of use the lowest individual `category_weight` is 0.01 %. This ensures, that no `category_weight` will be stuck at 0%. *Due to the nature of using linear Alegebra (more specific Matrix calculations) for calculation the weights.  Depending on the number of categorys, if one category reaches 0% it will stay at 0% and the other weight will compensate, which is an unwanted effect*
* The `bias_value` is adjustable, with the `bias_value` accepting any value between $ bias ∈ [-5 , 5] ,  bias ∈ Z $. If `0 < bias_value < 5 ` means, you favor the category and therfore giving it a better score. If the  `bias_value == 5` the `categegory_score ≅ 1 ≅ 100%` .
  If you set  `-5 < bias_value < 0 ` means, you disfavor the category and therfore giving it a worse score. If the `bias_value == -5` the `categegory_score ≅ 0 ≅ 0%` . To control how the bias impacts the `category_score` there are three differnet option which must be chosen in the `config`. There are three evaluation methods:
  * **linear:**
    s(v) returns a score with  0 >= `category_score` <= 1000 , dependent on the `target_value` $t$, the actual `data_value` $v$ , `bias_value` $b$ , `category_direction` $p$ and the `category_grain `$g$ , which should be set to relative resolution, which ís dependent on the use case, i.e. when running a marathon anything from 10 seconds to 10 minutues would be the grain, on the other hand when running  a 100m dash the grain would be 0.5 Seconds to 0.005 Seconds.

    $$
    b \in [-5,5];\ b \in Z;\ \ \ t \le v \vee t \ge v; \ \ \ p \in [-1,1]; \ p \in Z\ \ \ t,v,g \in R
    $$

    $$
    s(v)=f(-h(v))+f(h(v))(-b_1h(v)+1)+f(h(v- \frac{1}{pb_1}))(b_1h(v))-1)+500 \\  \\  f(v) = \frac{1000}{π} arctan(999999v) \\ \ \\h(v) = p(v-t)\\ \ \\b_1 = \frac{b-5.001}{-b-5.001} \frac{1}{g_1}\\ \ \\ g_1 = 2g
    $$

    In this example `target_value` (the blue line) is set to 200 and ` data_value` (the red line) is set to 700. Because  `data_value `>`targe_tvalue `our `category_direction` is +1.
    `bias_value` shall be 0 and the `category_grain` is set to 500. By design if the `data_value == category_grain - traget_value` the `category_score` shall always be 500(purple line)

    ![linear bias example plot](https://raw.githubusercontent.com/memorabilien/dynamic-visual-scoring-calculator/test-branch-1/docs/calc/linear.svg "Linear Bias Plot")
  * **quadratic**

    ![img]()
  * **cubic**

    comeing soon...

Tho calculate the overall Score all `categeory_scores` are used to get the average, which then is being modified to be a score between 0 and 100
