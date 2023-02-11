/*
The MIT License (MIT)
Copyright (c) 2016 Raghavendra Ravikumar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
 */

/**
 * calculates the other weight percentages, which are not the input weight
 * @param {Array} inputMatrix 
 * @param {Array} inputVektor 
 * @returns {Array} other weights in percent
 */
export default function calcWeight(inputMatrix, inputVektor){
let output;
/*
  Made with matrix.js from Raghavendra Ravikumar
  MIT License copyright (c) 2016 Raghavendra Ravikumar
*/
function rational(t,n){return n=n||1,-1===Math.sign(n)&&(t=-t,n=-n),{num:t,den:n,add:e=>rational(t*e.den+n*e.num,n*e.den),sub:e=>rational(t*e.den-n*e.num,n*e.den),mul:e=>multiply(e,t,n),div:e=>multiply(rational(e.den,e.num),t,n)}}function multiply(t,n,e){let r=Math.sign(n)*Math.sign(t.num),i=Math.sign(e)*Math.sign(t.den);return Math.abs(n)===Math.abs(t.den)&&Math.abs(e)===Math.abs(t.num)?(r=r,i=i):Math.abs(e)===Math.abs(t.num)?(r*=Math.abs(n),i*=Math.abs(t.den)):Math.abs(n)===Math.abs(t.den)?(r*=Math.abs(t.num),i*=Math.abs(e)):(r=n*t.num,i=e*t.den),rational(r,i)}function merge(t){return{top:n=>top(t,n),bottom:n=>bottom(t,n),left:n=>left(t,n),right:n=>right(t,n)}}function top(t,n){if((t[0].length||t.length)!==(n[n.length-1].length||n.length))return t;Array.isArray(t[0])||(t=[t]),Array.isArray(n[n.length-1])||(n=[n]);for(let e=n.length-1;e>=0;e--)t.unshift(n[e].map((t=>t)));return t}function bottom(t,n){if((t[t.length-1].length||t.length)!==(n[0].length||n.length))return t;Array.isArray(t[t.length-1])||(t=[t]),Array.isArray(n[0])||(n=[n]);for(let e=0;e<n.length;e++)t.push(n[e].map((t=>t)));return t}function left(t,n){let e=t.length,r=n.length;if(!Array.isArray(t[0])&&!Array.isArray(n[0]))return t.unshift.apply(t,n),t;if(e!==r)return t;for(let r=0;r<e;r++)t[r].unshift.apply(t[r],n[r].map((t=>t)));return t}function right(t,n){let e=t.length,r=n.length;if(!Array.isArray(t[0])&&!Array.isArray(n[0]))return t.push.apply(t,n),t;if(e!==r)return t;for(let r=0;r<e;r++)t[r].push.apply(t[r],n[r].map((t=>t)));return t}function matrix(t){if(!Array.isArray(t))throw new Error("Input should be of type array");return Object.assign((function(){let n=1===arguments.length?[arguments[0]]:Array.apply(null,arguments);return read(t,n)}),_mat(t))}function _mat(t){return{size:()=>size(t),add:n=>operate(t,n,addition),sub:n=>operate(t,n,subtraction),mul:n=>operate(t,n,multiplication),div:n=>operate(t,n,division),prod:n=>prod(t,n),trans:()=>trans(t),set:function(){let n=1===arguments.length?[arguments[0]]:Array.apply(null,arguments);return{to:e=>replace(t,e,n)}},det:()=>determinant(t),inv:()=>invert(t),merge:merge(t),map:n=>map(t,n),equals:n=>equals(t,n)}}function size(t){let n=[];for(;Array.isArray(t);)n.push(t.length),t=t[0];return n}function dimensions(t){return size(t).length}function read(t,n){return 0===n.length?t:extract(t,n)}function extract(t,n){let e=dimensions(t);for(let r=0;r<e;r++){let e=n[r];if(void 0===e)break;Array.isArray(e)?t=extractRange(t,e,r):Number.isInteger(e)&&(t=dimensions(t)>1&&r>0?t.map((function(t){return[t[e]]})):t[e])}return t}function extractRange(t,n,e){if(!n.length)return t;if(2===n.length){let r=n[0]>n[1],i=r?n[1]:n[0],a=r?n[0]:n[1];return dimensions(t)>1&&e>0?t.map((function(t){return r?t.slice(i,a+1).reverse():t.slice(i,a+1)})):(t=t.slice(i,a+1),r&&t.reverse()||t)}}function replace(t,n,e){let r=clone(t),i=e[0],a=i[0]||0,l=i[1]&&i[1]+1||t.length;if(Array.isArray(i)||1!==e.length){if(1===e.length)for(let t=a;t<l;t++)r[t].fill(n)}else r[i].fill(n);for(let u=1;u<e.length;u++){let o=Array.isArray(e[u])?e[u][0]||0:e[u],f=Array.isArray(e[u])?e[u][1]&&e[u][1]+1||t[0].length:e[u]+1;if(Array.isArray(i))for(let t=a;t<l;t++)r[t].fill(n,o,f);else r[i].fill(n,o,f)}return r}function operate(t,n,e){let r=[],i=n();for(let n=0;n<t.length;n++){let a=t[n],l=i[n];r.push(a.map((function(t,n){return e(t,l[n])})))}return r}function prod(t,n){let e=t,r=n(),i=size(e),a=size(r),l=[];if(i[1]===a[0])for(let t=0;t<i[0];t++){l[t]=[];for(let n=0;n<a[1];n++)for(let a=0;a<i[1];a++)void 0===l[t][n]&&(l[t][n]=0),l[t][n]+=multiplication(e[t][a],r[a][n])}return l}function trans(t){let n=t,e=size(t),r=[];for(let t=0;t<e[0];t++)for(let i=0;i<e[1];i++)Array.isArray(r[i])?r[i].push(n[t][i]):r[i]=[n[t][i]];return r}function clone(t){let n=[];for(let e=0;e<t.length;e++)n.push(t[e].slice(0));return n}function addition(t,n){return t+n}function subtraction(t,n){return t-n}function multiplication(t,n){return t*n}function division(t,n){return t/n}function determinant(t){let n=rationalize(t),e=size(t),r=rational(1),i=1;for(let t=0;t<e[0]-1;t++)for(let r=t+1;r<e[0];r++){if(0===n[r][t].num)continue;if(0===n[t][t].num){interchange(n,t,r),i=-i;continue}let a=n[r][t].div(n[t][t]);a=rational(Math.abs(a.num),a.den),Math.sign(n[r][t].num)===Math.sign(n[t][t].num)&&(a=rational(-a.num,a.den));for(let i=0;i<e[1];i++)n[r][i]=a.mul(n[t][i]).add(n[r][i])}return r=n.reduce(((t,n,e)=>t.mul(n[e])),rational(1)),i*r.num/r.den}function interchange(t,n,e){let r=t[n];t[n]=t[e],t[e]=r}function invert(t){let n=rationalize(t),e=size(t),r=rationalize(identity(e[0])),i=0,a=0;for(;a<e[0];){if(0===n[i][a].num)for(let t=i+1;t<e[0];t++)0!==n[t][a].num&&(interchange(n,i,t),interchange(r,i,t));if(0!==n[i][a].num){if(1!==n[i][a].num||1!==n[i][a].den){let t=rational(n[i][a].num,n[i][a].den);for(let a=0;a<e[1];a++)n[i][a]=n[i][a].div(t),r[i][a]=r[i][a].div(t)}for(let t=i+1;t<e[0];t++){let l=n[t][a];for(let a=0;a<e[1];a++)n[t][a]=n[t][a].sub(l.mul(n[i][a])),r[t][a]=r[t][a].sub(l.mul(r[i][a]))}}i+=1,a+=1}let l=e[0]-1;if(1!==n[l][l].num||1!==n[l][l].den){let t=rational(n[l][l].num,n[l][l].den);for(let i=0;i<e[1];i++)n[l][i]=n[l][i].div(t),r[l][i]=r[l][i].div(t)}for(let t=e[0]-1;t>0;t--)for(let i=t-1;i>=0;i--){let a=rational(-n[i][t].num,n[i][t].den);for(let l=0;l<e[1];l++)n[i][l]=a.mul(n[t][l]).add(n[i][l]),r[i][l]=a.mul(r[t][l]).add(r[i][l])}return derationalize(r)}function map(t,n){const e=size(t),r=[];for(let i=0;i<e[0];i++)if(Array.isArray(t[i])){r[i]=[];for(let a=0;a<e[1];a++)r[i][a]=n(t[i][a],[i,a],t)}else r[i]=n(t[i],[i,0],t);return r}function rationalize(t){let n=[];return t.forEach(((t,e)=>{n.push(t.map((t=>rational(t))))})),n}function derationalize(t){let n=[];return t.forEach(((t,e)=>{n.push(t.map((t=>t.num/t.den)))})),n}function generate(t,n){let e=2;for(;e>0;){for(var r=[],i=0;i<t;i++)Array.isArray(n)?r.push(Object.assign([],n)):r.push(n);n=r,e-=1}return n}function identity(t){let n=generate(t,0);return n.forEach(((t,n)=>{t[n]=1})),n}function equals(t,n){let e=t,r=n(),i=size(e),a=size(r);return!!i.every(((t,n)=>t===a[n]))&&e.every(((t,n)=>t.every(((t,e)=>Math.abs(t-r[n][e])<1e-10))))}
let A = matrix(inputMatrix);
let b = matrix(inputVektor);
let MatrixInverse = A.inv();
output = prod(MatrixInverse,b);
return output.flat();
}

