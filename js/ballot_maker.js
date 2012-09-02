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
var G, G1, H, H1, precompG, precompG1, precompH, precompH1;


/**
 * Computes a full encrypted ballot
 */
function prepare_ballot(m){
	
	$("#status").text("(1/5) Generating random numbers...");
	var r = get_256_random_bits_bi().mod(n_u_);
	var s = get_256_random_bits_bi().mod(n_u_);

	$("#status").text("(2/5) Encrypting...");
	c = ccs_enc(m,r,s,G,H,G,H1);
	// c = [c0, c1, c2]
	
	$("#status").text("(3/5) Adding cc proof...");
	// sigmacc = compute_cc_proof(m, r, s, c, G, H, G1, H1);
	// sigmacc = [ecc, zm, zr, zs]
	
	$("#status").text("(4/5) Adding or proof...");
	// sigmaor = compute_or_proof(m, c[2], s, H, G1, H1);
	// sigmaor = [e0, e1, t0, t1]
	
	$("#status").text("(5/6) Finalizing...");
	return (c, null,null);// sigmacc, sigmaor);
}


/**
 *   
 */
function ccs_enc(m,r,s,G,H,G,H1){
	
	alert("test");
	c0 = G.multiply(s,7,precompG);
	alert("test");
	// c0 = g * s
	c1 = (G.multiply(r,7,precompG)).add(G1.multiply(s,7,precompG1));
	alert("test");
	// c1 = g * r + g1 * s
	// c2 = (H.multiply(r,7,precompH)).add(H1.multiply(m,7,precompH1));
	// FIXME c2 ne marche pas, visiblement le precalcul est foireux
	// c2 = h * r + h1 * m
	c = [c0.affine(),c1.affine(),null];// c2.affine()];
	
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

// def __compute_cc_proof(m, r, s, c, g, h, g1, h1):
// j = randint(n_u_ - 1)
// u = randint(n_u_ - 1)
// v = randint(n_u_ - 1)
//
// d = ccs_enc(j, u, v, g, h, g1, h1)
//
// longstring = g1.__repr__() + h1.__repr__() + c.__repr__() + d.__repr__()
// ecc = int((sha256(longstring).hexdigest()), 16)
// # TODO faut il faire modulo n_u_ ?
//
// (zm, zr, zs) = (j + ecc * m, u + ecc * r, v + ecc * s)
//
// return (ecc, zm, zr, zs)
//
//
// def __compute_or_proof(m, c2, s, h, g1, h1):
// assert m == 0 | m == 1
//
// e0, e1, t0, t1, w0, w1 = None, None, None, None, None, None
// b = randint(n_u_ - 1)
//
// if m == 0:
// e1 = randint(n_u_ - 1)
// t1 = randint(n_u_ - 1)
// w0 = h * b
// w1 = h * t1 + (c2 - (h1 * 1)) * (-e1)
// longstring = g1.__repr__() + h1.__repr__() + c2.__repr__() + w0.__repr__() +
// w1.__repr__()
// e0 = int((sha256(longstring).hexdigest()), 16) - e1
// # TODO faut il faire modulo n_u_ ?
// t0 = b + e0 * s
//
// else:
// e0 = randint(n_u_ - 1)
// t0 = randint(n_u_ - 1)
// w1 = h * b
// w0 = h * t0 + (c2 - (h1 * 0)) * (-e0)
// longstring = g1.__repr__() + h1.__repr__() + c2.__repr__() + w0.__repr__() +
// w1.__repr__()
// e0 = int((sha256(longstring).hexdigest()), 16) - e0
// # TODO faut il faire modulo n_u_ ?
// t1 = b + e1 * s
//
// return (e0, e1, t0, t1)


