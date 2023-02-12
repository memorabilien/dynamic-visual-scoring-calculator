# Dynamic Visual Scoring Calculator

A dynamically adjustable scoring calculator with a lighthouse style data visualization. Get a score between 0 to 100 from data, with dynamically adjustable target value, a from -5 to +5 adjustable bias , and a self adjusting weighting system.

[Live Demo](https://memorabilien.github.io/dynamic-visual-scoring-calculator/docs/demo/)

### Config

```javascript
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
```

## Score Calculation

To calculate a single category Score, the main principle is the difference between the `categoryTarget` and the actual `categoryValue`. Things to note are as follows:

* The `categoryValue` can not be dynamically adjusted by the front end user, because it is a measured value in open world.
* The `categoryTarget` is adjustable, with the `min` or `max` value  automatically being set to the `categoryValue`.
  Should the `categoryValue >= categoryTarget` the `categoryDirection = 1` . E.g. the category goal is it to optimize the measured process for as little time as possible). If set correctly the `categoryTarget` cannot be set bigger than the `categoryValue`. The Result is the adjustable `categoryTarget` will automatically stop at `max = categoryValue`.
  Now The other way around: Should the `categoryValue <= categoryTarget` the `categoryDirection = -1` . E.g. the category goal is it to optimize the measured process for the hightest efficiency possible. If set correctly the `categoryTarget` cannot be set smaller than the `categoryValue`. The Result is the adjustable `categoryTarget` will automatically stop at `min = categoryValue`.
* The `categoryWeight` can be adjusted, which affects the overall score, but **not** the ``categoryScore``! When adjusting one `categoryWeight` all the other `categoryWeight` will adjust accordingly, so:

  $$\sum_{i=1}^c categoryScore_i = 1 = 100\%$$

  For ease of use the lowest individual `categoryWeight` is 0.01 %. This ensures, that no `categoryWeight` will be stuck at 0%. *Due to the nature of using linear Algebra (more specific Matrix calculations) for calculation the weights.  Depending on the number of categories, if one category reaches 0% it will stay at 0% and the other weight will compensate, which is an unwanted effect*
* The `categoryBias` is adjustable, with the `categoryBias` accepting any value between $bias ∈ [-5 , 5] ,  bias ∈ Z$. If `0 < categoryBias < 5` means, you favor the category and therefore giving it a better score. If the  `categoryBias == 5` the `categoryScore ≅ 1 ≅ 100%` .
  If you set  `-5 < categoryBias < 0` means, you disfavor the category and therefore giving it a worse score. If the `categoryBias == -5` the `categoryScore ≅ 0 ≅ 0%` . To control how the bias impacts the `categoryScore` there are three different option which must be chosen in the `config`. There are three evaluation methods:

  * **linear:**
    s(v) returns a score with  0 >= `categoryScore` <= 1000 , dependent on the `categoryTarget` $t$, the actual `categoryValue` $v$ , `categoryBias` $b$ , `categoryDirection` $p$ and the `categoryGrain`$g$ , which should be set to relative resolution, which ís dependent on the use case, i.e. when running a marathon anything from 10 seconds to 10 minutes would be the grain, on the other hand when running  a 100m dash the grain would be 0.5 Seconds to 0.005 Seconds.

    $$b\in[-5,5];\ b \in Z;\ \ \ t \le v \vee t \ge v; \ \ \ p \in [-1,1]; \ p \in Z\ \ \ t,v,g \in R$$

    $$s(v)=f(-h(v))+f(h(v))(-b_1h(v)+1)+f(h(v- \frac{1}{pb_1}))(b_1h(v))-1)+500$$

    $$f(v) = \frac{1000}{π} arctan(999999v)$$

    $$h(v) = p(v-t)$$

    $$b_1 = \frac{b-5.001}{-b-5.001} \frac{1}{g_1}\\ \ \\ g_1 = 2g$$

    In this example `categoryTarget` (the blue line) is set to 200 and `categoryValue` (the red line) is set to 700. Because  `categoryValue`>`categoryTarget`our `categoryDirection` is +1.
    `categoryBias` shall be 0 and the `categoryGrain` is set to 500. By design if the `categoryValue == categoryGrain - categoryTarget` the `categoryScore` shall always be 500(purple line)

    ![linear bias example plot](./docs/calc/linear.svg "Linear Bias Plot")
  * **quadratic**

    ![quadratic bias example plot](./docs/calc/quad.svg "Quadratic Bias Plot")


To calculate the overall Score all `categoryScore` values are used to get the average, which then is being modified to be a score between 0 and 100
