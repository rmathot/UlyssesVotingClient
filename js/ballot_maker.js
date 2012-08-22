/**
 * An implementation of the client-side part of a perfectly-private voting 
 * protocol.
 * 
 * @author Richard Mathot
 */

// The prime order of the field F_p
var p_u_ = new BigInteger('112225151618308592783581337952706825077306830693019724675042491754660182257191');
// The prime order of the curve E(F_p)
var n_u_ = new BigInteger('112225151618308592783581337952706825076971830466723818133309233737966567079841');

// The BN curve has the form y^2 = x^3 + b 
var bn_b = new BigInteger('3');

// The public key, to be initialized
var G, G1, H, H1;


/**
 * Computes a full encrypted ballot
 * */
function prepare_ballot(m){
	
	$("#status").text("(1/5) Generating random numbers...");
	var r = get_256_random_bits_bi().mod(n_u_);
	var s = get_256_random_bits_bi().mod(n_u_);
	
	console.log(G.coord[0].toString());
	console.log(G.coord[1].toString());

	
	$("#status").text("(2/5) Encrypting...");
	c = ccs_enc(m,r,s,G,H,G,H1);
	// c = [c0, c1, c2]
	
	$("#status").text("(3/5) Adding cc proof...");
	sigmacc = compute_cc_proof(m, r, s, c, G, H, G1, H1);
	// sigmacc = [ecc, zm, zr, zs]
	
	$("#status").text("(4/5) Adding or proof...");
	sigmaor = compute_or_proof(m, c[2], s, H, G1, H1);
	// sigmaor = [e0, e1, t0, t1]
	
	$("#status").text("(5/6) Finalizing...");
	return (c, sigmacc, sigmaor);
}


/**
 *   
 */
function ccs_enc(m,r,s,G,H,G,H1){
	
	
	c0 = G.multiply(s); // c0 = g * s
	c1 = (G.multiply(r)).add(G1.multiply(s)); // c1 = g * r + g1 * s
	c2 = (H.multiply(r)).add(H1.multiply(m)); // c2 = h * r + h1 * m
	
	c = [c0.affine(),c1.affine(),c2.affine()];
	
	return c;
}


/**
 * 
 * */
function compute_cc_proof(m, r, s, c, G, H, G1, H1){
	
	return;
}


/**
 * 
 * */
function compute_or_proof(m, c2, s, H, G1, H1){
	
}


