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

    ![linear]()
  * **quadratic**

    ![quad]()
  * **cubic**

    comeing soon...


Tho calculate the overall Score all `categeory_scores` are used to get the average, which then is being modified to be a score between 0 and 100




<img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjY2Ni42NjciIHZpZXdCb3g9IjAgMCAxMDAwIDY2Ni42NjciPjxwYXRoIGZpbGw9IiNmZmYiIGNsYXNzPSJkY2ctc3ZnLWJhY2tncm91bmQiIGQ9Ik0wIDBoMTAwMHY2NjYuNjY2SDBWMHoiLz48ZyB0cmFuc2Zvcm09InNjYWxlKDIpIi8+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBwYWludC1vcmRlcj0iZmlsbCBzdHJva2UgbWFya2VycyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjEuNjY2Ij48cGF0aCBjbGFzcz0iZGNnLXN2Zy1taW5vci1ncmlkbGluZSIgZD0iTTE3LjUgMHY2NjYuNjY2TTYwLjgzNCAwdjY2Ni42NjZNMTA0LjE2NiAwdjY2Ni42NjZNMTQ3LjUgMHY2NjYuNjY2TTE5MC44MzQgMHY2NjYuNjY2TTIzNC4xNjYgMHY2NjYuNjY2TTI3Ny41IDB2NjY2LjY2Nk0zMjAuODM0IDB2NjY2LjY2Nk00MDkuMTY2IDB2NjY2LjY2Nk00NTIuNSAwdjY2Ni42NjZNNDk1LjgzNCAwdjY2Ni42NjZNNTM5LjE2NiAwdjY2Ni42NjZNNTgyLjUgMHY2NjYuNjY2TTYyNS44MzQgMHY2NjYuNjY2TTY2OS4xNjYgMHY2NjYuNjY2TTcxMi41IDB2NjY2LjY2Nk03NTUuODM0IDB2NjY2LjY2Nk04MDAuODM0IDB2NjY2LjY2Nk04NDQuMTY2IDB2NjY2LjY2Nk04ODcuNSAwdjY2Ni42NjZNOTMwLjgzNCAwdjY2Ni42NjZNOTc0LjE2NiAwdjY2Ni42NjZNMCA2NTQuMTY2aDEwMDBtLTEwMDAtNDVoMTAwME0wIDU2NS44MzRoMTAwME0wIDUyMi41aDEwMDBNMCA0NzkuMTY2aDEwMDBNMCAzOTIuNWgxMDAwTTAgMzQ5LjE2NmgxMDAwTTAgMzA1LjgzNGgxMDAwTTAgMjYyLjVoMTAwME0wIDIxNy41aDEwMDBNMCAxNzQuMTY2aDEwMDBNMCAxMzAuODM0aDEwMDBNMCA4Ny41aDEwMDBNMCA0NC4xNjZoMTAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4yIi8+PHBhdGggY2xhc3M9ImRjZy1zdmctbWFqb3ItZ3JpZGxpbmUiIGQ9Ik0xNDcuNSAwdjY2Ni42NjZNNTgyLjUgMHY2NjYuNjY2TTgwMC44MzQgMHY2NjYuNjY2TTAgNjUzLjMzNGgxMDAwbS0xMDAwLTQzNWgxMDAwTTAgMGgxMDAwIiBzdHJva2Utb3BhY2l0eT0iLjI1Ii8+PC9nPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgY2xhc3M9ImRjZy1zdmctYXhpcy1saW5lIiBwYWludC1vcmRlcj0iZmlsbCBzdHJva2UgbWFya2VycyIgZD0iTTM2NSAwdjY2Ni42NjZtLTM2NS0yMzBoMTAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii45IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi41Ii8+PGcgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj48ZyBjbGFzcz0iZGNnLXN2Zy1heGlzLXZhbHVlIj48dGV4dCBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHRleHQtZGVjb3JhdGlvbj0ibm9ybWFsIiB4PSIyMTAuMDQ0IiB5PSIyNzcuMzIyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMiIgc3Ryb2tlLXdpZHRoPSIzIiB0cmFuc2Zvcm09InNjYWxlKDIpIj4wPC90ZXh0Pjx0ZXh0IHRleHQtZGVjb3JhdGlvbj0ibm9ybWFsIiB4PSIyMTAuMDQ0IiB5PSIyNzcuMzIyIiB0cmFuc2Zvcm09InNjYWxlKDIpIj4wPC90ZXh0PjwvZz48ZyBjbGFzcz0iZGNnLXN2Zy1heGlzLXZhbHVlIj48dGV4dCBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHRleHQtZGVjb3JhdGlvbj0ibm9ybWFsIiB4PSI4Ni4wNzEiIHk9IjI3Ny4zMjIiIHN0cm9rZS1taXRlcmxpbWl0PSIyIiBzdHJva2Utd2lkdGg9IjMiIHRyYW5zZm9ybT0ic2NhbGUoMikiPi0xMDAwPC90ZXh0Pjx0ZXh0IHRleHQtZGVjb3JhdGlvbj0ibm9ybWFsIiB4PSI4Ni4wNzEiIHk9IjI3Ny4zMjIiIHRyYW5zZm9ybT0ic2NhbGUoMikiPi0xMDAwPC90ZXh0PjwvZz48ZyBjbGFzcz0iZGNnLXN2Zy1heGlzLXZhbHVlIj48dGV4dCBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHRleHQtZGVjb3JhdGlvbj0ibm9ybWFsIiB4PSIzNDkuNDczIiB5PSIyNzcuMzIyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMiIgc3Ryb2tlLXdpZHRoPSIzIiB0cmFuc2Zvcm09InNjYWxlKDIpIj4xMDAwPC90ZXh0Pjx0ZXh0IHRleHQtZGVjb3JhdGlvbj0ibm9ybWFsIiB4PSIzNDkuNDczIiB5PSIyNzcuMzIyIiB0cmFuc2Zvcm09InNjYWxlKDIpIj4xMDAwPC90ZXh0PjwvZz48ZyBjbGFzcz0iZGNnLXN2Zy1heGlzLXZhbHVlIj48dGV4dCBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHRleHQtZGVjb3JhdGlvbj0ibm9ybWFsIiB4PSI0ODAuMDA4IiB5PSIyNzcuMzIyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMiIgc3Ryb2tlLXdpZHRoPSIzIiB0cmFuc2Zvcm09InNjYWxlKDIpIj4yMDAwPC90ZXh0Pjx0ZXh0IHRleHQtZGVjb3JhdGlvbj0ibm9ybWFsIiB4PSI0ODAuMDA4IiB5PSIyNzcuMzIyIiB0cmFuc2Zvcm09InNjYWxlKDIpIj4yMDAwPC90ZXh0PjwvZz48ZyBjbGFzcz0iZGNnLXN2Zy1heGlzLXZhbHVlIGRjZy1zdmctb2ZmY2VudGVyLWF4aXMtdmFsdWUiPjx0ZXh0IGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgdGV4dC1kZWNvcmF0aW9uPSJub3JtYWwiIHg9IjE5Ni4wMzQiIHk9IjM5My44MDgiIHN0cm9rZS1taXRlcmxpbWl0PSIyIiBzdHJva2Utd2lkdGg9IjMiIHRyYW5zZm9ybT0ic2NhbGUoMikiPi0xMDAwPC90ZXh0Pjx0ZXh0IHRleHQtZGVjb3JhdGlvbj0ibm9ybWFsIiB4PSIxOTYuMDM0IiB5PSIzOTMuODA4IiB0cmFuc2Zvcm09InNjYWxlKDIpIj4tMTAwMDwvdGV4dD48L2c+PGcgY2xhc3M9ImRjZy1zdmctYXhpcy12YWx1ZSI+PHRleHQgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiB0ZXh0LWRlY29yYXRpb249Im5vcm1hbCIgeD0iMTk4LjM2NSIgeT0iMTM0Ljc4NiIgc3Ryb2tlLW1pdGVybGltaXQ9IjIiIHN0cm9rZS13aWR0aD0iMyIgdHJhbnNmb3JtPSJzY2FsZSgyKSI+MTAwMDwvdGV4dD48dGV4dCB0ZXh0LWRlY29yYXRpb249Im5vcm1hbCIgeD0iMTk4LjM2NSIgeT0iMTM0Ljc4NiIgdHJhbnNmb3JtPSJzY2FsZSgyKSI+MTAwMDwvdGV4dD48L2c+PGcgY2xhc3M9ImRjZy1zdmctYXhpcy12YWx1ZSBkY2ctc3ZnLW9mZmNlbnRlci1heGlzLXZhbHVlIj48dGV4dCBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHRleHQtZGVjb3JhdGlvbj0ibm9ybWFsIiB4PSIxOTguMzY1IiB5PSIxMy44MDgiIHN0cm9rZS1taXRlcmxpbWl0PSIyIiBzdHJva2Utd2lkdGg9IjMiIHRyYW5zZm9ybT0ic2NhbGUoMikiPjIwMDA8L3RleHQ+PHRleHQgdGV4dC1kZWNvcmF0aW9uPSJub3JtYWwiIHg9IjE5OC4zNjUiIHk9IjEzLjgwOCIgdHJhbnNmb3JtPSJzY2FsZSgyKSI+MjAwMDwvdGV4dD48L2c+PC9nPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM4OGM0NiIgY2xhc3M9ImRjZy1zdmctY3VydmUiIHBhaW50LW9yZGVyPSJmaWxsIHN0cm9rZSBtYXJrZXJzIiBkPSJNLTQuODgyIDIxOC4yOThoMGw0MTMuNDIyLjEzIDIxNy42OCAyMTcuNDI4aDM3OC42NjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjguMzM0IiBzdHJva2Utb3BhY2l0eT0iLjkiLz48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMyZDcwYjMiIGNsYXNzPSJkY2ctc3ZnLWN1cnZlIiBwYWludC1vcmRlcj0iZmlsbCBzdHJva2UgbWFya2VycyIgZD0iTTQwOC40MDggNjcwLjEzOHYtMjkuMzMybTAtMTguNjY4di0yOS4zMzJtMC0xOC42Njh2LTI5LjMzMm0wLTE4LjY2OHYtMjkuMzMybTAtMTguNjY4di0yOS4zMzJtMC0xOC42Njh2LTI5LjMzMm0wLTE4LjY2OHYtMjkuMzMybTAtMTguNjY4di0yOS4zMzJtMC0xOC42Njh2LTI5LjMzMm0wLTE4LjY2OHYtMjkuMzMybTAtMTguNjY4di0yOS4zMzJtMC0xOC42Njh2LTI5LjMzMm0wLTE4LjY2OFY2NC44MDZtMC0xOC42NjhWMTYuODA2bTAtMTguNjY4di0xLjYxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSI2LjY2NiIgc3Ryb2tlLW9wYWNpdHk9Ii45Ii8+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzc0NDQwIiBjbGFzcz0iZGNnLXN2Zy1jdXJ2ZSIgcGFpbnQtb3JkZXI9ImZpbGwgc3Ryb2tlIG1hcmtlcnMiIGQ9Ik01MTcuMTg4IDY3MC4xMzh2LTI5LjMzMm0wLTE4LjY2OHYtMjkuMzMybTAtMTguNjY4di0yOS4zMzJtMC0xOC42Njh2LTI5LjMzMm0wLTE4LjY2OHYtMjkuMzMybTAtMTguNjY4di0yOS4zMzJtMC0xOC42Njh2LTI5LjMzMm0wLTE4LjY2OHYtMjkuMzMybTAtMTguNjY4di0yOS4zMzJtMC0xOC42Njh2LTI5LjMzMm0wLTE4LjY2OHYtMjkuMzMybTAtMTguNjY4di0yOS4zMzJtMC0xOC42NjhWNjQuODA2bTAtMTguNjY4VjE2LjgwNm0wLTE4LjY2OHYtMS42MSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iNi42NjYiIHN0cm9rZS1vcGFjaXR5PSIuOSIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzYwNDJhNiIgY2xhc3M9ImRjZy1zdmctY3VydmUiIHBhaW50LW9yZGVyPSJmaWxsIHN0cm9rZSBtYXJrZXJzIiBkPSJNMCAzMjcuMDc2aC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjJtMTYgMGguMm0xNiAwaC4ybTE2IDBoLjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjEwIi8+PGcgdHJhbnNmb3JtPSJzY2FsZSgyKSIvPjwvc3ZnPg=='/>
