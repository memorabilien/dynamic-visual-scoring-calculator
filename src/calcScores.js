/**
 * Calculate the score between 0 and 1000, depending on the given inputs, with a linear scoring curve
 * 
 * @param {number} value the value, which should be rated
 * @param {int} bias: the user bias input 
 * @param {number} target the target value of the category, which is aimed for
 * @param {int} direction valid inputs are '-1' or '1'
 * @param {number} grain needs to be grater than 0
 * @returns {number} score between 0 - 1000 
 */

export function getScoreLinear(value,bias,target,direction,grain){
    if( grain === 0 ){
        throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
    }
    else if(direction === 0){
        throw console.error("Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')");
    }
    let g = 1/(2*grain);
	let b = (bias - 5.001) / (bias + 5.001);
	function h(x) {
		return direction * (x - target);
	}
	function f(x) {
		return (1000 / Math.PI) * Math.atan(1000 * x);
	}
	let factor = f(-h(value)) + f(h(value)) * (b * g * h(value) + 1) + f(h(value + (1 / (direction * b * g)))) * ( -1*b *g * h(value) - 1) + 500;
	return factor < 0.0001 ? 0.0001 : factor;
	//https://www.desmos.com/calculator/bocxsfvlnl
}
/**
 * Calculate the score between 0 and 1000, depending on the given inputs, with a quadratic scoring curve
 * 
 * @param {number} value the value, which should be rated
 * @param {int} bias: the user bias input 
 * @param {number} target the target value of the category, which is aimed for
 * @param {int} direction valid inputs are '-1' or '1'
 * @param {number} grain needs to be grater than 0
 * @returns {number} score between 0 - 1000 
 */
 export function getScoreQuadratic(value,bias,target,direction,grain){
	 if( grain === 0 ){
		 throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
	 }
	 else if(direction === 0){
		 throw console.error("Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')");
	 }
	let b = (bias - 5.001) / (bias + 5.001);
	let g = 1 / (Math.pow(2,(1/2)) * grain);
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
	//https://www.desmos.com/calculator/kdltyorfb4
}
/**
 * Calculate the score between 0 and 1000, depending on the given inputs, with a cubic scoring curve
 * 
 * @param {number} value the value, which should be rated
 * @param {int} bias: the user bias input 
 * @param {number} target the target value of the category, which is aimed for
 * @param {int} direction valid inputs are '-1' or '1'
 * @param {number} grain needs to be grater than 0
 * @returns {number} score between 0 - 1000 
 */
export function getScoreCubic(value,bias,target,direction,grain){
    if( grain === 0 ){
        throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
    }
    else if(direction === 0){
        throw console.error("Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')");
    }
	let b = (bias - 5.001) / (bias + 5.001);
	let g = 1 / (Math.pow(2,(1/3)) * grain);
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
	//https://www.desmos.com/calculator/cw4vydx5rb
}

export function getScoreDefault(value,bias,target,direction,grain){
	if( grain === 0 ){
		throw console.error("Invalid grain value found in config!\nThe grain value needs to be greater than 0");
	}
	else if(direction === 0){
		throw console.error("Invalid direction value found in config!\nThe direction value can not be 0.\nAllowed values are either '-1' or '1')");
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
   return factor < 0.0001 ? 0.0001 : factor;
   //https://www.desmos.com/calculator/hbmma6qt6s
}




// TODO: Add more rating methods
// https://www.desmos.com/calculator/lsx20sjxag
// https://www.desmos.com/calculator/oqlvmezbze
// https://www.desmos.com/calculator/dufar5rf4g
// https://www.desmos.com/calculator/2t1ugwykrl
// https://www.desmos.com/calculator/unwvv66djp
// https://www.desmos.com/calculator/qhhziff2tx
//https://www.desmos.com/calculator/p3qch5vx0u
//https://www.desmos.com/calculator/gumri3yrwf