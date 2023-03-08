<script setup>
import {
    reactive,
    ref,
    defineProps,
    computed,
    onMounted,
    watch,
    watchEffect,
} from "vue";
const props = defineProps({
    config: {
        categoryBias: Array,
        categoryColors: Array,
        categoryCount: Number,
        categoryDirections: Array,
        categoryEvaluations: Array,
        categoryGrains: Array,
        categoryNames: Array,
        categoryNumbers: Array,
        categoryScores: Array,
        categorySteps: Array,
        categoryTargets: Array,
        categoryUnits: Array,
        categoryValues: Array,
        categoryWeights: Array,
    },
});
const minValues = ref([
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
]);
const maxValues = ref([
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
]);
const weightMax = ref("100");
const rowHeight = ref([
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
]);
const tableHeadRow = ref();
const manualWeights = ref({ display: "none", width: "auto", top: "0" });
const strokeDashLarge = computed(() => 2 * 46 * Math.PI - 6);
const strokeDashSmall = computed(() => 2 * 40 * Math.PI);
const score = ref(0);
const scoreColor = ref("");
const scoreOffset = ref({ "stroke-dashoffset": 0 });
const DVSC = reactive(props.config);
const manualWeightsBtn = reactive({
    title: "set the weights manually",
    active: false,
});
const rows = [
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
];
const offset = ref({
    background: [
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
    ],
    score: [
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
        { "stroke-dashoffset": 0, transform: "rotate(0)" },
    ],
    text: [
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
        { dx: 0, dy: 0, style: { transform: "translateX(0)" } },
    ],
    textTransform: [
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
        { transform: "translateX(0)" },
    ],
});
const backgroundCircles = [
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
];
const scoreCircles = [
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
];
const circleTexts = [
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
    ref(),
];
const manualWeightInputs = ref([
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
]);
const maualWeightsInputsSum = reactive({ sum: 0 });
const maualWeightsInputsSumColor = ref({ color: "#999999" });
function manualWeightsBtnHandler() {
    if (manualWeightsBtn.active) {
        manualWeightsBtn.title = "set the weights manually";
        manualWeightsBtn.active = false;
        manualWeights.value.display = "none";

        if (
            maualWeightsInputsSum.sum !== 100 &&
            maualWeightsInputsSum.sum !== 100.0
        ) {
            window.alert(
                "\nCould not verify changes.\nAll weights added together must be 100!"
            );
            throw new Error(
                "\nCould not verify changes.\nAll weights added together must be 100!"
            );
        } else {
            for (let i = 0; i < DVSC.categoryCount; i++) {
                DVSC.categoryWeights[i] = parseFloat(manualWeightInputs.value[i]);
            }
        }
    } else {
        manualWeightsBtn.title = "save";
        manualWeightsBtn.active = true;
        manualWeights.value.display = "flex";
    }
}
function discardManualWeights() {
    manualWeightsBtn.title = "set the weights manually";
    manualWeightsBtn.active = false;
    manualWeights.value.display = "none";
}
function minHandler(index) {
    if (DVSC.categoryDirections[index] === -1) {
        return DVSC.categoryValues[index].toString();
    } else if (DVSC.categoryDirections[index] === 1) {
        switch (DVSC.categoryUnits[index]) {
            case "%":
                return "0";
            case "Percent":
                return "0";
            case "percent":
                return "0";
            case "s":
                return "0";
            case "S":
                return "0";
            case "Seconds":
                return "0";
            case "seconds":
                return "0";
            case "min":
                return "0";
            case "minutes":
                return "0";
            case "Minutes":
                return "0";
            case "h":
                return "0";
            case "hours":
                return "0";
            case "Hours":
                return "0";
            case "€":
                return "0";
            case "Euro":
                return "0";
            case "euro":
                return "0";
            case "$":
                return "0";
            case "Dollar":
                return "0";
            case "dollar":
                return "0";
            default:
                return (
                    DVSC.categoryValues[index] -
                    DVSC.categoryGrains[index] * 5
                ).toString();
        }
    }
}
function maxHandler(index) {
    if (DVSC.categoryDirections[index] === -1) {
        switch (DVSC.categoryUnits[index]) {
            case "%":
                return "100";
            case "Percent":
                return "100";
            case "percent":
                return "100";
            default:
                return (
                    DVSC.categoryValues[index] +
                    DVSC.categoryGrains[index] * 14
                ).toString();
        }
    } else if (DVSC.categoryDirections[index] === 1) {
        return DVSC.categoryValues[index].toString();
    }
}
function weightChangeHandler(changedWeight, index, weightsArray) {
    let currentAdjustmentIndex = index;
    let userInput = changedWeight;
    let categoryWeights = weightsArray;
    if (DVSC.categoryCount !== 1 && DVSC.categoryCount !== 0) {
        let matrix = new Array(DVSC.categoryCount - 1);
        let vector = new Array(DVSC.categoryCount - 1);
        for (let i = 0; i < DVSC.categoryCount - 1; i++) {
            if (i === 0) {
                vector[i] = [100 - userInput];
            } else {
                vector[i] = [0];
            }

            let temp = new Array(DVSC.categoryCount - 1);
            for (let k = 0; k < temp.length; k++) {
                temp[k] = 0;
            }
            matrix[i] = temp;
        }

        for (let row = 0; row < DVSC.categoryCount - 1; row++) {
            for (let column = 0; column < DVSC.categoryCount - 1; column++) {
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

        let newPercentages = calcWeight(matrix, vector);
        console.log(newPercentages);
        newPercentages.splice(currentAdjustmentIndex, 0, userInput);
        for (let i = 0; i < DVSC.categoryCount; i++) {
            if (newPercentages[i] < 0.01 && i !== currentAdjustmentIndex) {
                newPercentages[currentAdjustmentIndex] =
                    newPercentages[currentAdjustmentIndex] - (0.01 - newPercentages[i]);
                newPercentages[i] = 0.01;
            }
        }

        if (newPercentages[currentAdjustmentIndex] > 0.01) {
            return newPercentages;
        }
    } else {
        return [parseFloat(userInput)];
    }
}
watch(
    () => DVSC.categoryWeights,
    (outputWeights, inputWeights) => {
        if (inputWeights == undefined || inputWeights == null) {
            throw console.error("input weights undefined");
        }
        let currentAdjustmentIndex;
        let userInput;
        let weightsArray = inputWeights;
        for (let i = 0; i < DVSC.categoryCount; i++) {
            if (typeof weightsArray[i] == "string") {
                userInput = inputWeights[i];
                currentAdjustmentIndex = i;
            }
        }

        switch (userInput) {
            case undefined:
                return;
            case null:
                return;
            default:
                if (userInput <= 0.01) {
                    userInput = 0.01;
                } else if (userInput >= 100 - (DVSC.categoryCount - 1) * 0.01) {
                    userInput = 100 - (DVSC.categoryCount - 1) * 0.01;
                }
        }
        let output = weightChangeHandler(
            userInput,
            currentAdjustmentIndex,
            weightsArray
        );

        if (output !== undefined || output !== null || output !== "0") {
            for (let i = 0; i < DVSC.categoryCount; i++) {
                // if (
                //   output[i] !== undefined ||
                //   output[i] !== null ||
                //   output[i] !== "0"
                // ) {
                if (typeof output[i] !== "number") {
                    outputWeights[i] = parseFloat(output[i]);
                    // DVSC.categoryWeights[i] = parseFloat(output[i]);
                } else {
                    outputWeights[i] = output[i];
                }
                // }
                // else{
                //     throw console.error("output[i] null or undefined");
                // }
            }
        } else {
            throw console.error("output null or undefined");
        }

        for (let i = 0; i < DVSC.categoryCount; i++) {
            DVSC.categoryWeights[i] = outputWeights[i];
        }
    },
    {
        flush: "immediate",
        deep: true,
    }
);
watchEffect(
    () => {
        for (let i = 0; i < DVSC.categoryCount; i++) {
            if (typeof DVSC.categoryWeights[i] === "string") {
                DVSC.categoryWeights[i] = parseFloat(DVSC.categoryWeights[i]);
            }
        }
    },
    { flush: "post" }
);


function calcWeight(t, e) { let l = t.length, $ = [], f = [], r = [], o = [], _ = [], n = []; for (let g = 0; g < l; g++) { $[g] = [], o[g] = []; for (let h = 0; h < l; h++)$[g][h] = 0, o[g][h] = 0; _[g] = 0, f[g] = 0, r[g] = 0, n[g] = [0] } for (let i = 0; i < l; i++) { for (let a = 0; a < l; a++)$[i][a] = t[i][a], o[i][a] = t[i][a]; _[i] = i } for (let c = 0; c < l - 1; c++) { let b = Math.abs(o[c][c]), s = c; for (let u = c + 1; u < l; u++) { let W = Math.abs(o[u][c]); W >= b && (b = W, s = u) } if (s != c) { let d = o[s]; o[s] = o[c], o[c] = d; let j = _[s]; _[s] = _[c], _[c] = j } let k = o[c][c]; if (0 != k) for (let m = c + 1; m < l; m++) { let p = o[m][c] / k; o[m][c] = p; for (let q = c + 1; q < l; q++)o[m][q] -= p * o[c][q] } } for (let v = 0; v < l; v++) { for (let w = 0; w < l; w++)v == _[w] ? f[w] = 1 : f[w] = 0; for (let x = 1; x < l; x++) { let y = f[x]; for (let z = 0; z < x; z++)y -= o[x][z] * f[z]; f[x] = y } f[l - 1] /= o[l - 1][l - 1]; for (let A = l - 2; A >= 0; A--) { let B = f[A]; for (let C = A + 1; C < l; C++)B -= o[A][C] * f[C]; f[A] = B / o[A][A] } for (let D = 0; D < l; D++)$[D][v] = f[D] } for (let E = 0; E < $.length; E++)for (let F = 0; F < $[0].length; ++F)n[E][0] += $[E][F] * e[F][0]; return n }



function getScoreDefault(value, bias, target, direction, grain) {
    if (grain === 0) {
        throw console.error(
            "Invalid grain value found in config!\nThe grain value needs to be greater than 0"
        );
    } else if (direction === 0) {
        throw console.error(
            "Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')"
        );
    }
    let b = (bias - 5.001) / (bias + 5.001);
    let g = 1 / (2 * grain);
    function f(x) {
        return (1 / Math.PI) * Math.atan(x) + 0.5;
    }
    function h(x) {
        return 2 * f(2 * x) - 1;
    }
    function j(x) {
        return direction * (x - target);
    }
    let factor = 1000 * f(1000 * j(value)) * h(g * b * j(value)) + 1000;
    // console.log(factor < 0.0001 ? 0.0001 : factor)
    return factor < 0.0001 ? 0.0001 : factor;

    //https://www.desmos.com/calculator/hbmma6qt6s
}
function getScoreCubic(value, bias, target, direction, grain) {
    if (grain === 0) {
        throw console.error(
            "Invalid grain value found in config!\nThe grain value needs to be greater than 0"
        );
    } else if (direction === 0) {
        throw console.error(
            "Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')"
        );
    }
    let b = (bias - 5.001) / (bias + 5.001);
    let g = 1 / (Math.pow(2, 1 / 3) * grain);
    function f(x) {
        return (1 / Math.PI) * Math.atan(x) + 0.5;
    }
    function h(x) {
        return 2 * f(2 * Math.pow(x, 3)) - 1;
    }
    function j(x) {
        return direction * (x - target);
    }

    let factor = 1000 * f(1000 * j(value)) * h(g * b * j(value)) + 1000;
    // console.log(factor < 0.0001 ? 0.0001 : factor)
    return factor < 0.0001 ? 0.0001 : factor;
    //https://www.desmos.com/calculator/cw4vydx5rb
}
function getScoreQuadratic(value, bias, target, direction, grain) {
    if (grain === 0) {
        throw console.error(
            "Invalid grain value found in config!\nThe grain value needs to be greater than 0"
        );
    } else if (direction === 0) {
        throw console.error(
            "Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')"
        );
    }
    let b = (bias - 5.001) / (bias + 5.001);
    let g = 1 / (Math.pow(2, 1 / 2) * grain);
    function f(x) {
        return (1 / Math.PI) * Math.atan(x) + 0.5;
    }
    function h(x) {
        return 2 * f(-2 * Math.pow(x, 2)) - 1;
    }
    function j(x) {
        return direction * (x - target);
    }
    let factor = 1000 * f(1000 * j(value)) * h(g * b * j(value)) + 1000;
    // console.log(factor < 0.0001 ? 0.0001 : factor)
    return factor < 0.0001 ? 0.0001 : factor;
    //https://www.desmos.com/calculator/kdltyorfb4
}
function getScoreLinear(value, bias, target, direction, grain) {
    if (grain === 0) {
        throw console.error(
            "Invalid grain value found in config!\nThe grain value needs to be greater than 0"
        );
    } else if (direction === 0) {
        throw console.error(
            "Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')"
        );
    }
    let g = 1 / (2 * grain);
    let b = (bias - 5.001) / (bias + 5.001);
    function h(x) {
        return direction * (x - target);
    }
    function f(x) {
        return (1000 / Math.PI) * Math.atan(1000 * x);
    }
    let factor =
        f(-h(value)) +
        f(h(value)) * (b * g * h(value) + 1) +
        f(h(value + 1 / (direction * b * g))) * (-1 * b * g * h(value) - 1) +
        500;
    // console.log(factor < 0.0001 ? 0.0001 : factor)
    return factor < 0.0001 ? 0.0001 : factor;
    //https://www.desmos.com/calculator/bocxsfvlnl
}
function categoryCompiler(
    number,
    evaluation,
    value,
    bias,
    target,
    direction,
    grain
) {
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
    let newScores = DVSC.categoryScores;
    newScores.splice(number, 1, parseFloat(output));
    return newScores;
}
watchEffect(
    () => {
        for (let i = 0; i < DVSC.categoryCount; i++) {
            DVSC.categoryScores[i] = categoryCompiler(
                i,
                DVSC.categoryEvaluations[i],
                DVSC.categoryValues[i],
                DVSC.categoryBias[i],
                DVSC.categoryTargets[i],
                DVSC.categoryDirections[i],
                DVSC.categoryGrains[i]
            )[i];
        }
    },
    { flush: "post" }
);
function setOffset() {
    let output = { background: [], score: [], text: [], textTransform: [] };

    function getDX(currentIndex) {
        let degree = 0;
        let rad;
        let dx;
        for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(DVSC.categoryWeights[i]);
        }
        degree = 3.6 * degree;
        rad = (degree / 180) * Math.PI;
        function F(x) {
            let offset =
                (((3.6 * parseFloat(DVSC.categoryWeights[currentIndex])) / 180) *
                    Math.PI) /
                2;
            return 50 * Math.cos(x + offset);
        }
        dx = F(rad);
        return dx;
    }

    function getDY(currentIndex) {
        let degree = 0;
        let rad;
        let dy;
        for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(DVSC.categoryWeights[i]);
        }
        degree = 3.6 * degree;
        rad = (degree / 180) * Math.PI;
        function F(x) {
            let offset =
                (((3.6 * parseFloat(DVSC.categoryWeights[currentIndex])) / 180) *
                    Math.PI) /
                2;
            return 50 * Math.sin(x + offset);
        }
        dy = F(rad);
        return dy;
    }

    function getDegrees(currentIndex) {
        let degree = 0;
        for (let i = 0; i < currentIndex; i++) {
            degree += parseFloat(DVSC.categoryWeights[i]);
        }
        return 3.6 * degree;
    }

    //setting the length and position on the circle for every category background circle arch
    let newSvgBackgroundCircles = [];

    for (let index = 0; index < DVSC.categoryCount; index++) {
        let offset = 2 * 46 * Math.PI * (1 - DVSC.categoryWeights[index] / 100.0);
        let rotation = "rotate(" + getDegrees(index).toString() + ")";

        newSvgBackgroundCircles[index] = {
            "stroke-dashoffset": offset.toString(),
            transform: rotation.toString(),
        };
    }
    output.background = newSvgBackgroundCircles;
    //setting the length and position on the circle for every category scoring circle arch
    let newSvgScoreCircles = [];
    for (let index = 0; index < DVSC.categoryCount; index++) {
        let offset =
            2.0 *
                46 *
                Math.PI *
                (1.0 -
                    DVSC.categoryWeights[index] *
                    (DVSC.categoryScores[index] / 1000) *
                    0.01) >
                278
                ? 278
                : 2.0 *
                    46 *
                    Math.PI *
                    (1.0 -
                        DVSC.categoryWeights[index] *
                        (DVSC.categoryScores[index] / 1000) *
                        0.01) <
                    2 * 46 * Math.PI * (1 - DVSC.categoryWeights[index] / 100.0) +
                    2 * 46 * Math.PI * (1 - DVSC.categoryWeights[index] / 100.0) * 0.05
                    ? 2 * 46 * Math.PI * (1 - DVSC.categoryWeights[index] / 100.0)
                    : 2.0 *
                    46 *
                    Math.PI *
                    (1.0 -
                        DVSC.categoryWeights[index] *
                        (DVSC.categoryScores[index] / 1000) *
                        0.01);
        let rotation = "rotate(" + getDegrees(index).toString() + ")";

        newSvgScoreCircles[index] = {
            "stroke-dashoffset": offset.toString(),
            transform: rotation.toString(),
        };
    }
    output.score = newSvgScoreCircles;

    //setting the position for every category text element near to its circle part
    let texts = [];
    let transforms = [];
    for (let index = 0; index < DVSC.categoryCount; index++) {
        let positionX = getDX(index);
        let positionY = getDY(index);
        let temp = {
            dx: positionX,
            dy: positionY,
            style: { transform: "translateX(0px)" },
        };
        let textTransform = { transform: "" };
        if (positionX > 12) {
            // eslint-disable-next-line prettier/prettier
            textTransform = { transform: "translateX(" + circleTexts[index].value.getBoundingClientRect().width / 8 + "px)" };
        } else if (positionX < -12) {
            // eslint-disable-next-line prettier/prettier
            textTransform = { transform: "translateX(" + (-1 * circleTexts[index].value.getBoundingClientRect().width) / 2 + "px)" };
        } else if (positionX <= 12 && positionX >= -12) {
            if (positionY > 0) {
                // eslint-disable-next-line prettier/prettier
                textTransform = { transform: "translateY(" + circleTexts[index].value.getBoundingClientRect().height / 4 + "px)" };
            } else {
                // eslint-disable-next-line prettier/prettier
                textTransform = { transform: "translateY(" + (-1 * circleTexts[index].value.getBoundingClientRect().height) / 4 + "px)" };
            }
        }
        if (positionY <= -12 && positionY >= 12) {
            // eslint-disable-next-line prettier/prettier
            textTransform = { transform: "translateY(0px)" };
            if (positionX < 0) {
                textTransform = {
                    // eslint-disable-next-line prettier/prettier
                    transform: "translateX(" + (-1) * circleTexts[index].value.getBoundingClientRect().width + "px)",
                };
            }
        }
        transforms[index] = textTransform;
        texts[index] = temp;
    }

    output.text = texts;
    output.textTransform = transforms;
    return output;
}
function calcTotalScore() {
    let numerator = 0;
    for (let i = 0; i < DVSC.categoryCount; i++) {
        numerator +=
            (parseFloat(DVSC.categoryScores[i]) / 1000) *
            parseFloat(DVSC.categoryWeights[i] / 100);
    }
    return numerator * 100;
}
onMounted(() => {
    let mins = [];
    let maxs = [];
    let height = [];
    for (let index = 0; index < DVSC.categoryCount; index++) {
        height[index] = {
            height: rows[index].value.parentNode.clientHeight.toString() + "px",
        };
        mins[index] = minHandler(index).toString();
        maxs[index] = maxHandler(index).toString();
    }
    minValues.value = mins;
    maxValues.value = maxs;
    rowHeight.value = height;

    weightMax.value = 100 - (DVSC.categoryCount - 1) * 0.01;

    offset.value = setOffset();
    score.value = calcTotalScore();
    console.log(score.value);

    manualWeights.value.width =
        (rows[0].value.clientWidth + 12).toString() + "px";
    manualWeights.value.top =
        (tableHeadRow.value.clientHeight - 5).toString() + "px";

    for (let i = 0; i < DVSC.categoryCount; i++) {
        manualWeightInputs.value[i] = 100 / DVSC.categoryCount;
    }
});
watchEffect(
    () => {
        offset.value = setOffset();
        score.value = calcTotalScore();
        scoreColor.value =
            "hsl(" + ((score.value / 100) * 115).toString() + ",78%,45%)";
        scoreOffset.value = {
            "stroke-dashoffset": 2 * 40 * Math.PI * (1 - score.value / 100),
        };
    },
    {
        flush: "post",
    }
);
watchEffect(
    () => {
        let sum = 0;
        for (let i = 0; i < DVSC.categoryCount; i++) {
            sum += manualWeightInputs.value[i];
        }
        maualWeightsInputsSum.sum = sum;
        if (sum > 100 || sum < 100) {
            maualWeightsInputsSumColor.value = { color: "rgb(255, 29, 21)" };
        } else if (sum === 100.0) {
            maualWeightsInputsSumColor.value = { color: "rgb(97, 231, 134)" };
        }
    },
    {
        flush: "post",
    }
);
</script>

<template>
    <div class="dynamic_visual_scoring_calculator calculator" id="no1">
        <div class="dvsc_settings">
            <table>
                <thead>
                    <tr :ref="(element) => (tableHeadRow = element)">
                        <th>Category</th>
                        <th>Value</th>
                        <th>Target Value</th>
                        <th>Bias</th>
                        <th>
                            <span class="dvsc_table_head_weighting">
                                <button v-if="manualWeightsBtn.active" class="discard_btn" title="discard changes"
                                    @click="discardManualWeights()">
                                    <svg height="26" viewBox="0 0 26 26" width="26" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M22.429 12.524a9.905 9.905 0 0 1-9.905 9.905 9.905 9.905 0 0 1-9.905-9.905 9.905 9.905 0 0 1 19.81 0zM8.81 8.81l7.429 7.429m0-7.429L8.81 16.239"
                                            fill="none" stroke="#ff1d15" strokeWidth="1.2" strokeLinecap="round"
                                            strokeLinejoin="round" />
                                    </svg>
                                </button>
                                Weighting
                                <button class="set_weights_btn" :title="manualWeightsBtn.title"
                                    @click="manualWeightsBtnHandler()">
                                    <svg v-if="manualWeightsBtn.active" height="26" viewBox="0 0 26 26" width="26"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="m5.619 12.81 3.714 3.714 9.939-9.905" fill="none" stroke="#61E786"
                                            strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
                                    </svg>
                                    <svg v-else height="26" viewBox="0 0 26 26" width="26"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <g fill="none" fill-rule="evenodd" stroke="#999999" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="1.2">
                                            <path
                                                d="M12.285 3.619c.434 0 .863.032 1.28.094l.629 1.906a6.784 6.784 0 0 1 1.56.664l1.808-.872a8.683 8.683 0 0 1 1.69 1.719l-.904 1.791a6.79 6.79 0 0 1 .636 1.572l1.895.66a8.748 8.748 0 0 1-.021 2.412l-1.906.629a6.893 6.893 0 0 1-.664 1.56l.872 1.808a8.718 8.718 0 0 1-1.719 1.69l-1.791-.904a6.818 6.818 0 0 1-1.572.636l-.66 1.895a8.748 8.748 0 0 1-2.412-.021l-.629-1.906a6.893 6.893 0 0 1-1.56-.664l-1.808.872a8.718 8.718 0 0 1-1.69-1.719l.904-1.791a6.89 6.89 0 0 1-.636-1.572l-1.895-.661a8.748 8.748 0 0 1 .021-2.41l1.906-.629a6.784 6.784 0 0 1 .664-1.56L5.411 7.01A8.718 8.718 0 0 1 7.13 5.32l1.791.904a6.818 6.818 0 0 1 1.572-.636l.661-1.895a8.741 8.741 0 0 1 1.131-.074z">
                                            </path>
                                            <path
                                                d="M16 12.285A3.715 3.715 0 0 1 12.285 16a3.715 3.715 0 0 1-3.713-3.715 3.715 3.715 0 0 1 7.428 0z">
                                            </path>
                                        </g>
                                    </svg>
                                </button>
                            </span>
                            <div class="manual_input_modal" :style="manualWeights">
                                <input v-for="number in DVSC.categoryNumbers" type="number" class="manual_weight_input"
                                    min="0.01" step="0.01" :key="number" :style="rowHeight[number]"
                                    v-model="manualWeightInputs[number]" />
                                <span class="manual_input_sum" :style="maualWeightsInputsSumColor">{{
                                    parseFloat(maualWeightsInputsSum.sum).toFixed(2) }}</span>
                            </div>
                        </th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody class="dvsc_table_body">
                    <tr v-for="(name, index) in DVSC.categoryNames" :key="index">
                        <th>{{ name }}</th>
                        <td>
                            <output class="dvsc_data_input_display">{{
                                DVSC.categoryValues[index]
                            }}</output>
                            <span>{{ DVSC.categoryUnits[index] }}</span>
                        </td>
                        <td>
                            <input class="dvsc_target_value_input" type="range" :min="minValues[index]"
                                :max="maxValues[index]" :step="DVSC.categorySteps[index]"
                                v-model.number="DVSC.categoryTargets[index]" />
                            <p class="dvsc_tab">
                                <output class="dvsc_target_value_input_display">{{
                                    DVSC.categoryTargets[index]
                                }}</output>
                                <span>{{ DVSC.categoryUnits[index] }}</span>
                            </p>
                        </td>
                        <td>
                            <input class="dvsc_bias_input" min="-5" max="5" type="range" step="1"
                                v-model.number="DVSC.categoryBias[index]" />
                            <p class="dvsc_tab">
                                <output class="dvsc_bias_input_display">{{
                                    DVSC.categoryBias[index]
                                }}</output>
                            </p>
                        </td>
                        <td :ref="(element) => (rows[index].value = element)">
                            <input class="dvsc_weighting_input" type="range" step="0.01" min="0.01" :max="weightMax"
                                :value="DVSC.categoryWeights[index]"
                                @input="DVSC.categoryWeights[index] = $event.target.value" />
                            <p class="dvsc_tab">
                                <output class="dvsc_weighting_input_display">{{
                                    parseFloat(DVSC.categoryWeights[index]).toFixed(2)
                                }}</output>
                                <span> %</span>
                            </p>
                        </td>
                        <td>
                            <p class="dvsc_tab">
                                <output class="dvsc_category_score_display">{{
                                    parseFloat(DVSC.categoryScores[index]).toFixed(2)
                                }}</output>
                                <span>
                                    <sub>/1000</sub>
                                </span>
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="dvsc_output">
            <svg xmlns="http://www.w3.org/2000/svg" class="dvsc_output_svg" viewBox="0 0 100 100">
                <g id="dvsc_fractions">
                    <g v-for="(number, index) in DVSC.categoryNumbers" :key="index">
                        <circle cx="50" cy="50" r="46" stroke-width="3" stroke-linecap="round" opacity="0.5" fill="none"
                            transform-origin="center" class="fraction fraction_bg"
                            :id="'dvsc_fraction_' + index + '_background'" :stroke="DVSC.categoryColors[index].toString()"
                            :stroke-dasharray="strokeDashLarge" v-bind="offset.background[index]"></circle>
                        <circle cx="50" cy="50" r="46" stroke-width="3" opacity="1" stroke-linecap="round" fill="none"
                            transform-origin="center" class="fraction fraction_bar"
                            :id="'dvsc_fraction_' + index + '_indicator'" :stroke="DVSC.categoryColors[index]"
                            :stroke-dasharray="strokeDashLarge" v-bind="offset.score[index]"></circle>
                        <text :ref="(element) => (circleTexts[index].value = element)" :id="'dvsc_category_name' + index"
                            class="category_text" x="50" y="50" v-bind="offset.text[index]"
                            :style="offset.textTransform[index]">
                            {{ DVSC.categoryNames[index] }}
                        </text>
                    </g>
                </g>
                <g id="dvsc_total_score">
                    <circle cx="50" cy="50" r="40" id="dvsc_score_indicator" :stroke-dasharray="strokeDashLarge"
                        :stroke="scoreColor" v-bind="scoreOffset"></circle>
                    <text id="dvsc_score_text" x="50" y="50" :fill="scoreColor">
                        {{ parseFloat(score).toFixed(0) }}
                    </text>
                </g>
            </svg>
        </div>
    </div>
</template>

<style scoped>
svg {
    -webkit-transition: all 0.5s ease-out;
    -o-transition: all 0.5s ease-out;
    transition: all 0.5s ease-out;
}

div.dynamic_visual_scoring_calculator#no1 {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    justify-items: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    -webkit-align-content: center;
    align-content: center;
    gap: 100px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-align-content: flex-start;
    align-content: flex-start;
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    justify-content: flex-start;
    gap: 17px;
    -webkit-box-align: stretch;
    -webkit-align-items: stretch;
    align-items: stretch;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr {
    border-bottom: 1px solid#999999;
    padding: 8px 0;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr,
div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr {
    display: -ms-grid;
    display: grid;
    grid-gap: 32px;
    grid-auto-flow: column;
    -ms-grid-columns: 120px 32px 62px 32px 197px 32px 164px 32px 197px 32px 110px;
    grid-template-columns: 120px 62px 197px 164px 197px 110px;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    gap: 12px;
    -webkit-flex-wrap: nowrap;
    flex-wrap: nowrap;
    text-align: end;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th {
    font-weight: 400;
    color: #999999;
    position: relative;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(1) {
    text-align: left;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td:nth-child(2) {
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>input[type="range"] {
    max-width: 129px;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting {
    position: relative;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>div.manual_input_modal {
    flex-direction: column;
    gap: 17px;
    position: absolute;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 0px;
    opacity: 1 !important;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>div.manual_input_modal>input.manual_weight_input {
    padding: 0;
    border: 0;
    box-shadow: inset 0 0px 6px 0 #999999;
    border-radius: 3px;
    /* border: 1px solid #999999; */
    opacity: 1;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    font-style: normal;
    font-weight: bold;
    text-align: center;
    width: 80px;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>div.manual_input_modal>input.manual_weight_input:focus {
    outline: 1px solid #999999;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>div.manual_input_modal>input.manual_weight_input::-webkit-textfield-decoration--webkit-inner-spin-button {
    cursor: pointer;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>div.manual_input_modal>span.manual_input_sum {
    border-top: 3px double #999999;
    width: 80px;
    text-align: center;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting>button.set_weights_btn,
div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting>button.discard_btn {
    border: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px 0;
    position: absolute;
    margin: 0;
    top: 0;
    bottom: 0;
    cursor: pointer;
    background: transparent;
    transition: all 0.3s ease-out;
    border: 1px solid #00000000;
    border-radius: 8px;
    height: 26px;
    width: 26px;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting>button.set_weights_btn {
    right: -28px;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting>button.discard_btn {
    left: -28px;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting>button.set_weights_btn:hover,
div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting>button.discard_btn:hover {
    border: 1px solid #00000080;
    box-shadow: 0 2px 4px 0 #2e0946a2;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting>button.set_weights_btn>*,
div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>thead>tr>th:nth-child(5)>span.dvsc_table_head_weighting>button.discard_btn>* {
    pointer-events: none;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td:nth-child(6) {
    -webkit-box-pack: end;
    -webkit-justify-content: flex-end;
    justify-content: flex-end;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>th {
    text-align: left;
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    justify-content: flex-start;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: nowrap;
    flex-wrap: nowrap;
    -webkit-align-content: center;
    align-content: center;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>.dvsc_tab,
div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>.dvsc_tab>p {
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    margin: 0;
    text-align: end;
    white-space: nowrap;
    word-break: keep-all;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_settings>table>tbody>tr>td>.dvsc_tab>output.dvsc_category_score_display {
    font-weight: bold;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>.dvsc_output_svg {
    height: 200px;
    width: 200px;
    position: relative;
    overflow: visible;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg * {
    -webkit-transition: all 0.4s ease-out;
    -o-transition: all 0.4s ease-out;
    transition: all 0.4s ease-out;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_total_score>circle#dvsc_score_indicator {
    cx: 50;
    cy: 50;
    r: 40;
    stroke-width: 4px;
    stroke-linecap: round;
    fill: none;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_total_score>text#dvsc_score_text {
    text-anchor: middle;
    font-family: "Courier New", Courier, monospace;
    font-size: 32px;
    font-weight: bold;
    dominant-baseline: middle;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>g>circle.dvsc_fraction {
    cx: 50;
    cy: 50;
    r: 46;
    stroke-width: 3px;
    stroke-linecap: round;
    fill: none;
    -webkit-transform-origin: center;
    -o-transform-origin: center;
    transform-origin: center;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>g>circle.dvsc_fraction_bg {
    opacity: 0;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>g>circle.dvsc_fraction_bar {
    opacity: 1;
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>svg.dvsc_output_svg>g#dvsc_fractions>g>text.category_text {
    font-size: 8px;
    font-weight: 600;
    opacity: 0.5;
    text-anchor: "middle";
    dominant-baseline: "middle";
    transform-origin: "center";
}

div.dynamic_visual_scoring_calculator#no1>div.dvsc_output>.dvsc_output {
    padding: 32px 100px !important;
    overflow: hidden !important;
}

.dvsc_output {
    padding: 32px 100px;
    overflow: hidden;
}
</style>
