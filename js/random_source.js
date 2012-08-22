/**
 * random_source.js
 *
 * This module wraps ways of getting some randomness.
 * 
 * This module requires sjcl library:
 * http://bitwiseshiftleft.github.com/sjcl/sjcl.js
 * */

/**
 * @returns A BigInteger of 256 random bits
 * */
function get_256_random_bits_bi(){
	var rw = sjcl.random.randomWords(8,0);
	var a = new BigInteger("0");
	for(var i = 0 ; i < 8; i++){
		a = a.shiftLeft(32);
		var x;
		if(rw[i] < 0){
			x = new BigInteger((-rw[i]).toString());
		}
		else{
			x = new BigInteger(rw[i].toString());
		}
		a = a.add(x);		
	}
	return a;
}
