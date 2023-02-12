const scoringCalculator = document.createElement("template");
const scoringCategory = document.createElement("template");

scoringCalculator.innerHTML = `<div class="dynamic_visual_scoring_calculator" id="no1"><div class="dvsc_settings"><table><thead><th>Category</th><th>Value</th><th>Target Value</th><th>Bias</th><th>Weighting</th><th>Score</th></thead><tbody class="dvsc_table_body"></tbody></table></div><div class="dvsc_output"><svg xmlns="http://www.w3.org/2000/svg" class="dvsc_output_svg" viewBox="0 0 100 100"><g id="dvsc_fractions"></g><g id="dvsc_total_score"><circle id="dvsc_score_indicator"></circle><text id="dvsc_score_text" x="50" y="50">100</text></g></svg></div></div><style>@import "./scoring-calc.css"</style>`
scoringCategory.innerHTML = `<tr><th class="category_name"></th><td><output class="category_value"> </output><span class="category_unit"></span></td><td><input class="dvsc_target_value_input" type="range" value="" step=""><p class="dvsc_tab"><output class="dvsc_target_value_input_display"></output><span class="category_unit"> </span></p></td><td><input class="dvsc_bias_input" min="-5" max="5" type="range" step="1" value="0"><p class="dvsc_tab"><output class="dvsc_bias_input_display" >0</output></p></td><td><input class="dvsc_weighting_input" type="range" step="0.01" value=""><p class="dvsc_tab"><output class="dvsc_weighting_input_display" ></output><span> %</span></p></td><td><p class="dvsc_tab"><output class="dvsc_category_score_display">-</output><span><sub>/1000</sub></span></p></td><style>@import "./scoring-calc-category.css"</style><tr>`;

class ScoringCalc extends HTMLElement{
    constructor(){
        super();
        this._root = this.attachShadow({ mode: "closed", slotAssignment: "manual"});
        this._root.append(scoringCalculator.content.cloneNode(true));
        this.elements = this.children;
        this.categoryCount = null;
        this.categoryNumbers = [];
        this.categoryNames = [];
        this.categoryUnits = [];
        this.categoryValues = [];
        this.categoryTargets = [];
        this.categorySteps = [];
        this.categoryDirections = [];
        this.categoryEvaluations = [];
        this.categoryBiases = [];
        this.categoryWeights = [];
        this.categoryColors = [];
        this.categoryGrains = [];
        this.row = this._root.querySelectorAll("scoring-calc-category");
    };
    
   
    

    connectedCallback(){
        this.#assignSlots();
        let totalScoreCircle = this._root.querySelector("#dvsc_score_indicator");
        let svgFractions = this._root.querySelector("#dvsc_fractions");
        totalScoreCircle.setAttribute("stroke-dasharray", ((2 * 40 * Math.PI) - 6).toString());
    
        for(let i = 0; i < this.categoryCount; i++){
            let svgFractionBackground = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            let svgFractionScore = document.createElementNS('http://www.w3.org/2000/svg',"circle");
            let svgName = document.createElementNS("http://www.w3.org/2000/svg", "text");
            let svgBackgroundProps = {
                "id": "dvsc_fraction_" + i.toString()+"_background",
                "stroke": this.categoryColors[i],
                "class": "dvsc_fraction dvsc_fraction_bg",
                "stroke-dasharray": ((2 * 46 * Math.PI) - 6).toString(),
                }
            let svgFractionProps = {
                "id": "dvsc_fraction_" + i.toString()+"_indicator",
                "stroke": this.categoryColors[i],
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
                this.#applyAttributes(svgFractionBackground, svgBackgroundProps);
                this.#applyAttributes(svgFractionScore, svgFractionProps);
                this.#applyAttributes(svgName, svgTextProps);
                svgFractions.appendChild(svgFractionBackground);
                svgFractions.appendChild(svgFractionScore);
                svgName.innerHTML = this.categoryNames[i];
                svgFractions.appendChild(svgName);
        }
        this.#svgBackgroundCircles = Array.from(this._root.querySelectorAll(".dvsc_fraction_bg"));
        this.#svgScoreCircles  = Array.from(this._root.querySelectorAll(".dvsc_fraction_bar"));
        this.#svgTexts = Array.from(this._root.querySelectorAll(".category_text"));
    }
    #assignSlots(){
        let tableBody = this._root.querySelector(".dvsc_table_body");
        for(let i = 0; i <this.elements.length; i++){
            tableBody.appendChild(document.createElement("slot")).assign(this.elements.item(i));
        }
        this.row = this.querySelectorAll("scoring-calc-category")
    
        this.row.forEach((element, index)=>{
            this.#categoryObservers.push(this.#daemons[index]);
         });
         this.categoryCount = this.childElementCount;
        for(let i = 0; i <this.categoryCount; i++){
            // console.log(element)
            this.categoryNumbers.push(this.row[i].getAttribute("number"))
            this.categoryNames.push(this.row[i].getAttribute("rowname"))
            this.categoryUnits.push(this.row[i].getAttribute("unit"))
            this.categoryValues.push(this.row[i].getAttribute("value"))
            this.categoryTargets.push(this.row[i].getAttribute("target"))
            this.categorySteps.push(this.row[i].getAttribute("step"))
            this.categoryDirections.push(this.row[i].getAttribute("direction"))
            this.categoryEvaluations.push(this.row[i].getAttribute("evaluation"))
            this.categoryBiases.push(this.row[i].getAttribute("bias"))
            this.categoryWeights.push(this.row[i].getAttribute("weight"))
            this.categoryColors.push(this.row[i].getAttribute("color"))
            this.categoryGrains.push(this.row[i].getAttribute("grain"))
            this.#listener(this.row[i], i, this.#categoryObservers[i]);
         }
    }
    #calcWeights(weightChanges){
        if(this.categoryCount !== 1 && this.categoryCount !== 0) {
            this.categoryWeights = [];
            this.row.forEach((element,index)=>{
                if(element.weight >= 0.01 && element.weight !== null && element.weight !== undefined){
                this.categoryWeights.push(element.weight);
                }
                else if(element.weight < 0.01){
                    this.categoryWeights.push(0.01);
                    this.#categoryObservers[index].disconnect()
                    element.setAttribute("weight", 0.01)
                    this.#categoryObservers[index].observe(element, this.#observerOptions)
                }
            })
            let inputStatus = this.categoryWeights;
            let userInput = weightChanges.weight > 0.01 ? weightChanges.weight : 0.01;
            let currentAdjustmentIndex = weightChanges.index;
            let matrix = new Array(this.categoryCount - 1);
            let vector = new Array(this.categoryCount - 1);
            for (let i = 0; i < this.categoryCount - 1; i++) {
                if(i == 0){
                    vector[i] = [100 - userInput];
                }
                else{
                    vector[i] = [0];
                }

                let temp = new Array(this.categoryCount -1);
                for(let k = 0; k < temp.length; k++){
                    temp[k] = 0;
                }
                matrix[i] = temp;
            
            } 
            for(let row = 0; row < this.categoryCount - 1; row++ ){
                for(let column = 0; column< this.categoryCount -1; column++){
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

            let newPercentages =  this.#matrixCalculations(matrix, vector);
            newPercentages.splice(currentAdjustmentIndex, 0, userInput);
            for(let i = 0; i< this.categoryCount; i++){
                if(newPercentages[i] < 0.01 && i !== currentAdjustmentIndex ){
                    newPercentages[currentAdjustmentIndex] = newPercentages[currentAdjustmentIndex] - (0.01 - newPercentages[i]);
                    newPercentages[i] = 0.01;
                }
            }
        
            if(newPercentages[currentAdjustmentIndex] > 0.01){
                for(let i = 0; i<this.categoryCount; i++){
                this.#categoryObservers[i].disconnect()
                this.row[i].setAttribute("weight",newPercentages[i]);
                this.#categoryObservers[i].observe(this.row[i], this.#observerOptions)
                }
            }

        }
        this.#updateCategoryInfo()
    }   
    #matrixCalculations( inputMatrix, inputVector){
        let output;
        /*
          Made with matrix.js from Raghavendra Ravikumar
          MIT License copyright (c) 2016 Raghavendra Ravikumar
        */  
        function rational(t,n){return n=n||1,-1===Math.sign(n)&&(t=-t,n=-n),{num:t,den:n,add:e=>rational(t*e.den+n*e.num,n*e.den),sub:e=>rational(t*e.den-n*e.num,n*e.den),mul:e=>multiply(e,t,n),div:e=>multiply(rational(e.den,e.num),t,n)}}function multiply(t,n,e){let r=Math.sign(n)*Math.sign(t.num),i=Math.sign(e)*Math.sign(t.den);return Math.abs(n)===Math.abs(t.den)&&Math.abs(e)===Math.abs(t.num)?(r=r,i=i):Math.abs(e)===Math.abs(t.num)?(r*=Math.abs(n),i*=Math.abs(t.den)):Math.abs(n)===Math.abs(t.den)?(r*=Math.abs(t.num),i*=Math.abs(e)):(r=n*t.num,i=e*t.den),rational(r,i)}function merge(t){return{top:n=>top(t,n),bottom:n=>bottom(t,n),left:n=>left(t,n),right:n=>right(t,n)}}function top(t,n){if((t[0].length||t.length)!==(n[n.length-1].length||n.length))return t;Array.isArray(t[0])||(t=[t]),Array.isArray(n[n.length-1])||(n=[n]);for(let e=n.length-1;e>=0;e--)t.unshift(n[e].map((t=>t)));return t}function bottom(t,n){if((t[t.length-1].length||t.length)!==(n[0].length||n.length))return t;Array.isArray(t[t.length-1])||(t=[t]),Array.isArray(n[0])||(n=[n]);for(let e=0;e<n.length;e++)t.push(n[e].map((t=>t)));return t}function left(t,n){let e=t.length,r=n.length;if(!Array.isArray(t[0])&&!Array.isArray(n[0]))return t.unshift.apply(t,n),t;if(e!==r)return t;for(let r=0;r<e;r++)t[r].unshift.apply(t[r],n[r].map((t=>t)));return t}function right(t,n){let e=t.length,r=n.length;if(!Array.isArray(t[0])&&!Array.isArray(n[0]))return t.push.apply(t,n),t;if(e!==r)return t;for(let r=0;r<e;r++)t[r].push.apply(t[r],n[r].map((t=>t)));return t}function matrix(t){if(!Array.isArray(t))throw new Error("Input should be of type array");return Object.assign((function(){let n=1===arguments.length?[arguments[0]]:Array.apply(null,arguments);return read(t,n)}),_mat(t))}function _mat(t){return{size:()=>size(t),add:n=>operate(t,n,addition),sub:n=>operate(t,n,subtraction),mul:n=>operate(t,n,multiplication),div:n=>operate(t,n,division),prod:n=>prod(t,n),trans:()=>trans(t),set:function(){let n=1===arguments.length?[arguments[0]]:Array.apply(null,arguments);return{to:e=>replace(t,e,n)}},det:()=>determinant(t),inv:()=>invert(t),merge:merge(t),map:n=>map(t,n),equals:n=>equals(t,n)}}function size(t){let n=[];for(;Array.isArray(t);)n.push(t.length),t=t[0];return n}function dimensions(t){return size(t).length}function read(t,n){return 0===n.length?t:extract(t,n)}function extract(t,n){let e=dimensions(t);for(let r=0;r<e;r++){let e=n[r];if(void 0===e)break;Array.isArray(e)?t=extractRange(t,e,r):Number.isInteger(e)&&(t=dimensions(t)>1&&r>0?t.map((function(t){return[t[e]]})):t[e])}return t}function extractRange(t,n,e){if(!n.length)return t;if(2===n.length){let r=n[0]>n[1],i=r?n[1]:n[0],a=r?n[0]:n[1];return dimensions(t)>1&&e>0?t.map((function(t){return r?t.slice(i,a+1).reverse():t.slice(i,a+1)})):(t=t.slice(i,a+1),r&&t.reverse()||t)}}function replace(t,n,e){let r=clone(t),i=e[0],a=i[0]||0,l=i[1]&&i[1]+1||t.length;if(Array.isArray(i)||1!==e.length){if(1===e.length)for(let t=a;t<l;t++)r[t].fill(n)}else r[i].fill(n);for(let u=1;u<e.length;u++){let o=Array.isArray(e[u])?e[u][0]||0:e[u],f=Array.isArray(e[u])?e[u][1]&&e[u][1]+1||t[0].length:e[u]+1;if(Array.isArray(i))for(let t=a;t<l;t++)r[t].fill(n,o,f);else r[i].fill(n,o,f)}return r}function operate(t,n,e){let r=[],i=n();for(let n=0;n<t.length;n++){let a=t[n],l=i[n];r.push(a.map((function(t,n){return e(t,l[n])})))}return r}function prod(t,n){let e=t,r=n(),i=size(e),a=size(r),l=[];if(i[1]===a[0])for(let t=0;t<i[0];t++){l[t]=[];for(let n=0;n<a[1];n++)for(let a=0;a<i[1];a++)void 0===l[t][n]&&(l[t][n]=0),l[t][n]+=multiplication(e[t][a],r[a][n])}return l}function trans(t){let n=t,e=size(t),r=[];for(let t=0;t<e[0];t++)for(let i=0;i<e[1];i++)Array.isArray(r[i])?r[i].push(n[t][i]):r[i]=[n[t][i]];return r}function clone(t){let n=[];for(let e=0;e<t.length;e++)n.push(t[e].slice(0));return n}function addition(t,n){return t+n}function subtraction(t,n){return t-n}function multiplication(t,n){return t*n}function division(t,n){return t/n}function determinant(t){let n=rationalize(t),e=size(t),r=rational(1),i=1;for(let t=0;t<e[0]-1;t++)for(let r=t+1;r<e[0];r++){if(0===n[r][t].num)continue;if(0===n[t][t].num){interchange(n,t,r),i=-i;continue}let a=n[r][t].div(n[t][t]);a=rational(Math.abs(a.num),a.den),Math.sign(n[r][t].num)===Math.sign(n[t][t].num)&&(a=rational(-a.num,a.den));for(let i=0;i<e[1];i++)n[r][i]=a.mul(n[t][i]).add(n[r][i])}return r=n.reduce(((t,n,e)=>t.mul(n[e])),rational(1)),i*r.num/r.den}function interchange(t,n,e){let r=t[n];t[n]=t[e],t[e]=r}function invert(t){let n=rationalize(t),e=size(t),r=rationalize(identity(e[0])),i=0,a=0;for(;a<e[0];){if(0===n[i][a].num)for(let t=i+1;t<e[0];t++)0!==n[t][a].num&&(interchange(n,i,t),interchange(r,i,t));if(0!==n[i][a].num){if(1!==n[i][a].num||1!==n[i][a].den){let t=rational(n[i][a].num,n[i][a].den);for(let a=0;a<e[1];a++)n[i][a]=n[i][a].div(t),r[i][a]=r[i][a].div(t)}for(let t=i+1;t<e[0];t++){let l=n[t][a];for(let a=0;a<e[1];a++)n[t][a]=n[t][a].sub(l.mul(n[i][a])),r[t][a]=r[t][a].sub(l.mul(r[i][a]))}}i+=1,a+=1}let l=e[0]-1;if(1!==n[l][l].num||1!==n[l][l].den){let t=rational(n[l][l].num,n[l][l].den);for(let i=0;i<e[1];i++)n[l][i]=n[l][i].div(t),r[l][i]=r[l][i].div(t)}for(let t=e[0]-1;t>0;t--)for(let i=t-1;i>=0;i--){let a=rational(-n[i][t].num,n[i][t].den);for(let l=0;l<e[1];l++)n[i][l]=a.mul(n[t][l]).add(n[i][l]),r[i][l]=a.mul(r[t][l]).add(r[i][l])}return derationalize(r)}function map(t,n){const e=size(t),r=[];for(let i=0;i<e[0];i++)if(Array.isArray(t[i])){r[i]=[];for(let a=0;a<e[1];a++)r[i][a]=n(t[i][a],[i,a],t)}else r[i]=n(t[i],[i,0],t);return r}function rationalize(t){let n=[];return t.forEach(((t,e)=>{n.push(t.map((t=>rational(t))))})),n}function derationalize(t){let n=[];return t.forEach(((t,e)=>{n.push(t.map((t=>t.num/t.den)))})),n}function generate(t,n){let e=2;for(;e>0;){for(var r=[],i=0;i<t;i++)Array.isArray(n)?r.push(Object.assign([],n)):r.push(n);n=r,e-=1}return n}function identity(t){let n=generate(t,0);return n.forEach(((t,n)=>{t[n]=1})),n}function equals(t,n){let e=t,r=n(),i=size(e),a=size(r);return!!i.every(((t,n)=>t===a[n]))&&e.every(((t,n)=>t.every(((t,e)=>Math.abs(t-r[n][e])<1e-10))))}
        let A = matrix(inputMatrix);
        let b = matrix(inputVector);
        let MatrixInverse = A.inv();
        output = prod(MatrixInverse,b);
        return output.flat();
    }
    #calcScore(){
        let scores =  [];
        let allWeights = [];
        for(let i = 0; i < this.categoryCount; i++){
                scores.push(this.row[i].getAttribute("score"));
                allWeights.push(this.row[i].getAttribute("weight"));
        }
        let numerator = 0;
        for(let i = 0; i< this.categoryCount; i++){
            numerator += (scores[i]/1000)*parseFloat(allWeights[i]/100);
        }
        let totalScore = numerator*100;
        let totalScoreElement = this._root.querySelector("#dvsc_score_text");
        let totalScoreInd = this._root.querySelector("#dvsc_score_indicator");
        totalScoreElement.innerHTML = totalScore.toFixed(0);
        totalScoreElement.setAttribute("fill" , "hsl("+((totalScore/100)*115).toString()+",78%,45%)");
        totalScoreInd.setAttribute("stroke", "hsl(" + ((totalScore / 100) * 115).toString() + ",78%,45%)");
        totalScoreInd.setAttribute("stroke-dashoffset", 2*40*Math.PI*(1-totalScore/100));
    }
    #setOffset(){
        let scores =  [];
        let allWeights = [];
        for(let i = 0; i < this.categoryCount; i++){
                scores.push(this.row[i].getAttribute("score"));
                allWeights.push(this.row[i].getAttribute("weight"));
        }
        /**
         * Returns the x distance from the center 
         * @param {int} currentIndex 
         * @returns {number} 
         */
        function getDX(currentIndex){
            let degree = 0;
            let rad;
            let dx;
            for (let i = 0; i < currentIndex; i++) {
                degree += parseFloat(allWeights[i]);
             } 
             degree = 3.6 * degree;
    
             rad = (degree/180)*Math.PI 
    
             function F(x){
                // let offset = 0.25 * Math.PI;
                let offset = 0.125 * Math.PI
                return 65* Math.cos(x + offset);
             }
             dx = F(rad);
    
             return dx;
        }
        /**
         * Returns the y distance from the center 
         * @param {int} currentIndex 
         * @returns {number} 
         */
        function getDY(currentIndex){
            let degree = 0;
            let rad;
            let dy;
            for (let i = 0; i < currentIndex; i++) {
                degree += parseFloat(allWeights[i]);
             } 
             degree = 3.6 * degree;
    
             rad = (degree/180)*Math.PI 
    
             function F(x){
                // let offset = 0.25 * Math.PI;
                let offset = 0.125 * Math.PI
                return 65* Math.sin(x + offset);
             }
             dy = F(rad);
    
             return dy;
        }
        /**
         * Returns the x distance from the center, for the first category 
         * 
         * @returns {number} 
         */
        function getDXStart(){
            // let degree = 3.6  *( parseFloat(weighting_inputs[0].value) + parseFloat(weighting_inputs[1].value)) ;
            let degree = 3.6  *( parseFloat(allWeights[0]));
            let rad;
            let dx;
             rad = (degree/180)*Math.PI 
    
             function F(x){
                let offset = -rad/1.5
                return 65* Math.cos(x + offset);
             }
             dx = F(rad);
    
             return dx;
        }
    
        /**
         * Returns the y distance from the center for the fist category
         * 
         * @returns {number} 
         */
        function getDYStart(){
            // let degree = 3.6  *( parseFloat(weighting_inputs[0].value) + parseFloat(weighting_inputs[1].value)) ;
            let degree = 3.6  *( parseFloat(allWeights[0]) );
    
            let rad;
            let dy;
    
             rad = (degree/180)*Math.PI 
    
             function F(x){
                let offset = -rad/1.5
                return 65* Math.sin(x + offset);
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
                degree += parseFloat(allWeights[i]);
             } 
             return  3.6 * degree;
        }
    
        //setting the length and position on the circle for every category background circle arch
        this.#svgBackgroundCircles.forEach((element,index)=>{
            element.setAttribute("stroke-dashoffset", 2 * 46 * Math.PI * (1 - allWeights[index] / 100.0));
            if(index >= 1){
                     element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
            }
        });
        //setting the length and position on the circle for every category scoring circle arch 
        this.#svgScoreCircles.forEach((element,index)=>{
            //console.log(Math.min((2.0 * 46 * Math.PI - 6) * (1.0 - weighting_inputs[index].value * (scores[index] / 1000) * 0.01), 2 * 46 * Math.PI - 12));
             element.setAttribute("stroke-dashoffset", 2.0 * 46 * Math.PI * (1.0 - allWeights[index] * (scores[index] / 1000) * 0.01) > 278 ? 278: 2.0 * 46 * Math.PI * (1.0 - allWeights[index] * (scores[index] / 1000) * 0.01) < 2 * 46 * Math.PI * (1 - allWeights[index] / 100.0) + 2 * 46 * Math.PI * (1 - allWeights[index] / 100.0) * 0.05	? 2 * 46 * Math.PI * (1 - allWeights[index] / 100.0): 2.0 * 46 * Math.PI * (1.0 - allWeights[index] * (scores[index] / 1000) * 0.01));
              if (index >= 1) {
                element.setAttribute("transform", "rotate(" + getDegrees(index).toString() + ")");
            }
        });
    
        //setting the position for every category text element near to its circle part
        this.#svgTexts.forEach((element,index)=>{
            if(index >= 1){
                element.setAttribute("dx", getDX(index));
                element.setAttribute("dy", getDY(index));
            }
            if(index === 0){
                element.setAttribute("dx", getDXStart());
                element.setAttribute("dy", getDYStart())
            }
        })
    
    
    }
    #applyAttributes(element, attributes){
        for(const key in attributes){
            element.setAttribute(key, attributes[key]);
        }
    }
    #listener = (observable,number,observer) => {
        observer.observe(observable, this.#observerOptions);
    };
    #callback = (entries,observer) =>{
        if(entries.type = "attributes"){
            this.#changingAttributes =  {weight:entries[0].target.weight, index: entries[0].target.number, score: entries[0].target.score};
            this.#calcWeights(this.#changingAttributes)
            this.#calcScore()
            this.#setOffset()
        }
    };

    #updateCategoryInfo(){
        this.categoryNumbers = [];
        this.categoryNames = [];
        this.categoryUnits = [];
        this.categoryValues = [];
        this.categoryTargets = [];
        this.categorySteps = [];
        this.categoryDirections = [];
        this.categoryEvaluations = [];
        this.categoryBiases = [];
        this.categoryWeights = [];
        this.categoryColors = [];
        this.categoryGrains = [];
        for(let i = 0; i< this.categoryCount; i++){
            this.categoryNumbers.push(this.row[i].getAttribute("number"))
            this.categoryNames.push(this.row[i].getAttribute("rowname"))
            this.categoryUnits.push(this.row[i].getAttribute("unit"))
            this.categoryValues.push(this.row[i].getAttribute("value"))
            this.categoryTargets.push(this.row[i].getAttribute("target"))
            this.categorySteps.push(this.row[i].getAttribute("step"))
            this.categoryDirections.push(this.row[i].getAttribute("direction"))
            this.categoryEvaluations.push(this.row[i].getAttribute("evaluation"))
            this.categoryBiases.push(this.row[i].getAttribute("bias"))
            this.categoryWeights.push(this.row[i].getAttribute("weight"))
            this.categoryColors.push(this.row[i].getAttribute("color"))
            this.categoryGrains.push(this.row[i].getAttribute("grain"))
        }
    }

    #svgBackgroundCircles = [];
    #svgScoreCircles = [];
    #svgTexts = [];
    #categoryObservers = [];
    #changingAttributes = {weight: null, index: null, score: null};
    #observerOptions = {
        childList: false,
        attributes: true,
        characterData: false,
        subtree: false,
        attributeFilter: ['weight','score'],
        attributeOldValue: false,
        characterDataOldValue: false
    };
    #daemons = [
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback),
                    new MutationObserver(this.#callback)
    ];
    

}


class ScoringCalcCategory extends HTMLElement{

    static get observedAttributes(){
        return ['number', 'rowName', "unit", "value","target","step","direction","evaluation","bias","weight","score","color"]
    }

    constructor(){
        super();
        const shadow = this.attachShadow({mode: "open"});
        shadow.append(scoringCategory.content.cloneNode(true));
        this.number="";this.rowName="";this.unit="";this.value="";this.target="";this.step="";this.direction="";this.evaluation="";this.grain="";this.bias="";this.weight="";this.score="";this.color="";
        this.categoryName = shadow.querySelector(".category_name");
        this.categoryUnit = shadow.querySelectorAll(".category_unit");
        this.categoryValue = shadow.querySelector(".category_value");
        this.targetValueInput = shadow.querySelector(".dvsc_target_value_input");
        this.biasInput = shadow.querySelector(".dvsc_bias_input");
        this.weightingInput = shadow.querySelector(".dvsc_weighting_input");
        this.targetValueOutput = shadow.querySelector(".dvsc_target_value_input_display");
        this.biasOutput = shadow.querySelector(".dvsc_bias_input_display");
        this.weightingOutput = shadow.querySelector(".dvsc_weighting_input_display");
        this.scoreOutput = shadow.querySelector(".dvsc_category_score_display");
        this.targetValueInput.addEventListener("input",()=>{
           this.target = this.targetValueInput.value;
           this.targetValueOutput.innerHTML = this.targetValueInput.value;
           this.setAttribute("target", this.targetValueInput.value)
           this.#calcScore(this.number);
         
        });
        this.biasInput.addEventListener("input",()=>{
            this.bias = this.biasInput.value;
            this.biasOutput.innerHTML = this.biasInput.value;
            this.setAttribute("bias", this.biasInput.value);
            this.#calcScore(this.number)
        });
        this.weightingInput.addEventListener("input",(event)=>{
            this.weight = this.weightingInput.value < 0.01 ? 0.01 : this.weightingInput.value;
            this.weightingOutput.innerHTML = this.weightingInput.value < 0.01 ? 0.01 : this.weightingInput.value;
            this.setAttribute("weight", this.weightingInput.value < 0.01 ? 0.01 : this.weightingInput.value)
        })



    }
    connectedCallback(){
        this.number = this.getAttribute("number") ?? "0";
        this.rowName = this.getAttribute("rowName") ?? "default";
        this.unit = this.getAttribute("unit") ?? "bars";
        this.value = this.getAttribute("value") ?? "56";
        this.target = this.getAttribute("target") ?? "44";
        this.step = this.getAttribute("step") ?? "4";
        this.direction = this.getAttribute("direction") ?? "1";
        this.evaluation = this.getAttribute("evaluation") ?? "linear";
        this.bias = this.getAttribute("bias") ?? "0";
        this.weight = this.getAttribute("weight") ?? "25";
        this.score = this.getAttribute("score") ?? "500";
        this.color = this.getAttribute("color") ?? "#ff0000";
        this.grain = this.getAttribute("grain") ?? "1";
        this.setAttribute("number", this.number);
        this.setAttribute("rowName", this.rowName);
        this.setAttribute("unit", this.unit);
        this.setAttribute("value", this.value);
        this.setAttribute("target", this.target);
        this.setAttribute("step", this.step);
        this.setAttribute("direction", this.direction);
        this.setAttribute("evaluation", this.evaluation);
        this.setAttribute("bias", this.bias);
        this.setAttribute("weight", this.weight);
        this.setAttribute("score", this.score);
        this.setAttribute("color", this.color);
        this.setAttribute("grain", this.grain);
        this.categoryValue.innerHTML = this.value
        this.targetValueOutput.innerHTML = this.target;
        this.biasOutput.innerHTML = this.bias;
        this.weightingOutput.innerHTML = this.weight;
        this.scoreOutput.innerHTML = this.score;
        this.categoryName.innerHTML = this.rowName;
        this.categoryUnit.forEach((element)=>{element.innerHTML = this.unit;});
        this.getTargetLimit()
        this.targetValueInput.setAttribute("step", this.step)
    }   
    getTargetLimit(){
        if (this.direction == "1"){// set min or max values for target value range input slider
            this.targetValueInput.setAttribute("max", this.value)
            // document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("max", inputData[i-1].toString());
        }
        else if( this.direction == "-1" ){
            this.targetValueInput.setAttribute("min", this.value)
            // document.querySelector("#dvsc_target_value_input_" + i.toString()).setAttribute("min", inputData[i - 1].toString());
        }
    }
     getScoreLinear(value,bias,target,direction,grain){
        let g = (100*grain)/5;
        if( g === 0 ){
            throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
        }
        else if(direction === 0){
            throw console.error("Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')");
        }
        let b = ((bias - 5.001) / (-bias - 5.001)) * (1 / g);
        function h(x) {
            return direction * (x - target);
        }
        function f(x) {
            return (1000 / Math.PI) * Math.atan(1000 * x);
        }
        let factor = f(-h(value)) + f(h(value)) * (-b * h(value) + 1) + f(h(value - 1 / (direction * b))) * (b * h(value) - 1) + 500;
    
        return factor < 0.0001 ? 0.0001 : factor;
        // https://www.desmos.com/calculator/qp8yb4jbnz
    }
     getScoreQuadratic(value,bias,target,direction,grain){
        let b = (bias - 5.001) / (bias + 5.001);
        let g = 1 / (1.38648041843 * grain);
        if( g === 0 ){
            throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
        }
        else if(direction === 0){
            throw console.error("Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')");
        }
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
        return factor < 0.0001 ? 0.0001 : factor;
        
        //https://www.desmos.com/calculator/a3uakjjpbd
    }
     getScoreCubic(value,bias,target,direction,grain){
        let b = (bias - 5.001) / (bias + 5.001);
        let g = 1 / (1.38648041843 * grain);
        if( g === 0 ){
            throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
        }
        else if(direction === 0){
            throw console.error("Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')");
        }
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
        return factor < 0.0001 ? 0.0001 : factor;
    
        //https://www.desmos.com/calculator/7mp16fywjh
    }
    #calcScore(){
            if(this.evaluation == "lin" || this.evaluation == "linear"){
                this.score = this.getScoreLinear(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain));
                this.scoreOutput.innerHTML = this.getScoreLinear(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain)).toFixed(2);
                this.setAttribute("score", this.score);
            }
            if(this.evaluation == "quad" || this.evaluation == "quadratic"){
                this.score = this.getScoreQuadratic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain));
                this.scoreOutput.innerHTML = this.getScoreQuadratic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain)).toFixed(2);
                this.setAttribute("score", this.score);
            }
            if(this.evaluation == "cube" || this.evaluation == "cubic"){
                this.score = this.getScoreCubic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain));
                this.scoreOutput.innerHTML = this.getScoreCubic(parseFloat(this.value), parseInt(this.bias), parseFloat(this.target), parseInt(this.direction), parseFloat(this.grain)).toFixed(2);
                this.setAttribute("score", this.score);
            }

        }

    attributeChangedCallback(name, oldValue, newValue){
        if(name == "weight"){
            this.weightingInput.value = newValue;
            this.weightingInput.setAttribute("value", newValue);
            this.weightingOutput.innerHTML = parseFloat(newValue).toFixed(2);
        }
    }

}

customElements.define("scoring-calc", ScoringCalc);
customElements.define("scoring-calc-category", ScoringCalcCategory)