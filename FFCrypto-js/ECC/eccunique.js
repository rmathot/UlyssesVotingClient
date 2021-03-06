// -------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------
//
// ECC's library, includes EC operations on prime fields and OEF's,
// requires jsbn-ec.js, jsbn2-ec.js, OEF.js
//
// Z=A.add(B); returns A(jacobian coordinates)+B(jacobian coordinates)
// Z=A.dobble(); returns 2A(jacobian coordinates)
// Z=A.dobbleMult(n); returns 2^n * A(jacobian coordinates)
// Z=A.comb2Mult(k,w); returns k*A using comb2 method including precomputations
// and window size w
// Z=A.multiply(k,w,precomp); also returns k*A but requires the precomputations
// Z=A.affine(); returns A in affine coordinates
// Z=A.jacobian(); returns A in jacobian coordinates
// Z=A.toString(); returns A as a string
//
// There are some additional side functions, see end of the library
//
// -------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------

// variables
//
/*
 * var p28 =
 * BigInteger.ONE.shiftLeft(224).add(BigInteger.ONE.shiftLeft(140)).add(
 * BigInteger.ONE.shiftLeft(56)).add(BigInteger.ONE);
 */

var h1 = nbi();
var h2 = nbi();
var h3 = nbi();
var h4 = nbi();
var h5 = nbi();
var h6 = nbi();
var h7 = nbi();
var h8 = nbi();
var h9 = nbi();
var h10 = nbi();
var h11 = nbi();
var h12 = nbi();
var h13 = nbi();
var h14 = nbi();
var h15 = nbi();
var h16 = nbi();
var h17 = nbi();
var h18 = nbi();
var h19 = nbi();
var h20 = nbi();
var h21 = nbi();
var h22 = nbi();
var h23 = nbi();
var h24 = nbi();
var h25 = nbi();
var h26 = nbi();
var h27 = nbi();

var inv2 = noef(2).modInverse();
var hh1 = new OEF();
var hh2 = new OEF();
var hh3 = new OEF();
var hh4 = new OEF();
var hh5 = new OEF();
var hh6 = new OEF();
var hh7 = new OEF();
var hh8 = new OEF();
var hh9 = new OEF();
var hh10 = new OEF();
var hh11 = new OEF();

// -------------------------------------------------------------------------------------------------------------------------------------
// Constructor
//
function ecPoint(coord, curve, rep, field, m, inf) {//

	this.inf = inf;
	this.coord = coord;
	this.rep = rep;
	this.curve = curve;
	this.field = field;
	this.m = m;
}

// -------------------------------------------------------------------------------------------------------------------------------------
// return new element or random element of a given field (OEF/Prime)
//
function newFieldElem(field) {

	if (field == 'prime') { return nbi(); }
	// else {
	return new OEF();
	// }
}
function randFieldElem(field) {

	if (field == 'prime') { return randBigInt(100).mod(p28); }
	// else {
	return randOEF();
	// }
}

// return point at infinity
function infinity(P) {

	return new ecPoint([ newFieldElem(P.field), newFieldElem(P.field),
			newFieldElem(P.field) ], P.curve, P.rep, P.field, P.m, true);
}
// -------------------------------------------------------------------------------------------------------------------------------------
// return random points
//
function randEcPoint(curve, rep, field, m) {

	// ~ document.write(field);
	if (rep == 'jacobian') {
		var coord = [ randFieldElem(field), randFieldElem(field),
				randFieldElem(field) ];
		return new ecPoint(coord, curve, rep, field, m, false);
	} else if (rep == 'affine') {
		var coord = [ randFieldElem(field), randFieldElem(field) ];
		return new ecPoint(coord, curve, rep, field, m, false);
	}
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Converts to Jacobian/Affine coordinates
//
function ecpJacobian() {

	if (this.rep == 'jacobian') return this.copy();
	// else {
	if (this.inf) {
		var r = infinity(this);
		r.rep = 'jacobian';
		return r;
	}
	return new ecPoint([ this.coord[0], this.coord[1], fieldONE(this.field) ],
			this.curve, 'jacobian', this.field, this.m, 0);
	// }
}

function ecpAffine() {

	if (this.rep == 'affine') return this.copy();
	// else {
	if (this.inf) {
		var r = infinity(this);
		r.rep = 'affine';
		return r;
	}
	var invZ2 = this.coord[2].multiply(this.coord[2]).modInverse(this.m);
	var invZ3 = this.coord[2].multiply(this.coord[2]).multiply(this.coord[2])
			.modInverse(this.m);
	var X = this.coord[0].multiply(invZ2);
	var Y = this.coord[1].multiply(invZ3);
	return new ecPoint([ X, Y ], this.curve, 'affine', this.field, this.m, 0);
	// }
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Doubling OEF
// The curve must be of the form Y^2 = X^3 + b
// http://www.hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#doubling-dbl-2009-l
//
function ecpDobbleOEF() {

	if (this.inf) { return this; }
	
	var X1, Y1, Z1, A, B, C, D, E, F, X3, Y3, Z3, t1, t2, t3, t4, t5;
	
	X1 = this.coord[0];
	Y1 = this.coord[1];
	Z1 = this.coord[2];
	
	A = X1.multiply(X1);
	B = Y1.multiply(Y1);
	C = B.multiply(B);
	t1 = X1.spAdd(B, hh1);
	t2 = t1.multiply(t1);
	D = (t2.spSubtract(A, hh2).spSubtract(C, hh3)).spScalarMult(2, hh4);
	E = A.spScalarMult(3, hh5);
	F = E.multiply(E);
	
	X3 = F.spSubtract(D.spScalarMult(2, hh7), hh6);
	t3 = C.multiply(C); // 2C
	t4 = t3.multiply(t3); // 4C
	t5 = t4.multiply(t4); // 8C
	Y3 = E.multiply(D.spSubtract(X3, hh8)).spSubtract(t5, hh9);
	Z3 = Y1.multiply(Z1).spScalarMult(2, hh9);
	
	this.coord = [ X3, Y3, Z3 ];
	return this;
	
	/*
	 * var X, Y, Z, t1, t2, t3, x3, y3, z3; X = this.coord[0]; Y =
	 * this.coord[1]; Z = this.coord[2]; t1 = Z.multiply(Z); t2 =
	 * X.spSubtract(t1, hh1).multiply(X.spAdd(t1, hh2)); t2 = t2.spScalarMult(3,
	 * t2); y3 = Y.spScalarMult(2, hh1); z3 = y3.multiply(Z); y3 =
	 * y3.multiply(y3); t3 = y3.multiply(X); y3 =
	 * y3.multiply(y3).multiply(inv2); x3 = t2.multiply(t2); x3 =
	 * x3.spSubtract(t3.spScalarMult(2, hh2), hh3); t1 = t3.spSubtract(x3, t3);
	 * y3 = t1.multiply(t2).spSubtract(y3, t1); this.coord = [ x3, y3, z3 ];
	 * return this;
	 */
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Addition EF
// The curve must be of the form Y^2 = X^3 + b
// http://www.hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#addition-add-2007-bl
//
function ecpAddOEF(S) {

	if (S.inf) { return this; }
	if (this.inf) { return S.jacobian(); }
	var X1 = this.coord[0];
	var Y1 = this.coord[1];
	var Z1 = this.coord[2];
	
	var Z1Z1, Z2Z2, U1, U2, S1, S2, H, J, r, V, X3, Y3, Z3, t1, t2, t3;
	
	Z1Z1 = Z1.multiply(Z1);
	Z2Z2 = Z2.multiply(Z2);
	U1 = X1.multiply(Z2Z2);
	U2 = X2.multiply(Z1Z1);
	S1 = Y1.multiply(Z2).multiply(Z2Z2);
	S2 = Y2.multiply(Z1).multiply(Z1Z1);
	H = U2 - U1;
	t1 = H.spScalarMult(2, hh1);
	I = t1.multiply(t1);
	J = H.multiply(I);
	r = (S2.spSubtract(S1, hh2)).spScalarMult(2, hh3);
	V = U1.multiply(I);
	X3 = (r.multiply(r)).spSubtract(J, hh4).spSubtract(V.spScalarMult(2, hh6),
			hh5);
	t2 = S1.multiply(J).spScalarMult(2);
	Y3 = (r.multiply(V.spSubtract(X3, hh7))).spSubtract(t2, hh8);
	t3 = Z1.spAdd(Z2, hh9);
	Z3 = (t3.multiply(t3).spSubtract(Z1Z1, hh10).spSubtract(Z2Z2, hh11))
			.multiply(H);
	
	this.coord = [ X3, Y3, Z3 ];
	return this;
	
	/*
	 * if (S.inf) { return this; } ; if (this.inf) { return S.jacobian(); } ;
	 * var X1 = this.coord[0]; var Y1 = this.coord[1]; var Z1 = this.coord[2];
	 * var x2 = S.coord[0]; var y2 = S.coord[1]; t1 = Z1.multiply(Z1); t2 =
	 * t1.multiply(Z1); t1 = t1.multiply(x2); t2 = t2.multiply(y2); t1 =
	 * t1.spSubtract(X1, t1); t2 = t2.spSubtract(Y1, t2); if (t1.isZero()) { if
	 * (t2.isZero()) { return S.dobble(); } else { return infinity(this); } } z3 =
	 * Z1.multiply(t1); t3 = t1.multiply(t1); t4 = t3.multiply(t1); t3 =
	 * t3.multiply(X1); t1 = t3.spScalarMult(2, hh1); x3 = t2.multiply(t2); x3 =
	 * x3.spSubtract(t1, x3); x3 = x3.spSubtract(t4, x3); t3 = t3.spSubtract(x3,
	 * t3); t3 = t3.multiply(t2); t4 = t4.multiply(Y1); y3 = t3.spSubtract(t4,
	 * t2); this.coord = [ x3, y3, z3 ]; return this;
	 */
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Doubling Prime
// The curve must be of the form Y^2 = X^3 + b
// http://www.hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#doubling-dbl-2009-l
//
function ecpDobbleP() {

	if (this.inf) { return nec(this); }
	var X1, Y1, Z1, A, B, C, D, E, F, X3, Y3, Z3, t1, t2, t3, t4, t5, t6;
	X1 = this.coord[0];
	Y1 = this.coord[1];
	Z1 = this.coord[2];
	p = this.m;
	
	A = X1.square().spMod(p, h1);
	B = Y1.square().spMod(p, h2);
	C = B.square.spMod(p, h3);
	t1 = ((X1.spAdd(B, h4)).square().spMod(p, h5)).spSubtract(A, h6)
			.spSubtract(A, h7);
	D = t1.spAdd(t1, h8);
	E = A.spAdd(A, h9).spAdd(A, h10);
	F = E.square().spMod(p, h11);
	
	t2 = D.spAdd(D);
	X3 = F.spSubtract(t2);
	t3 = C.spAdd(C); // 2C
	t4 = t3.spAdd(t3); // 4C
	t5 = t4.spAdd(t4); // 8C
	Y3 = E.multiply(D.spSubtract(X3)).spMod(p, h12).spSubtract(t5);
	t6 = Y1.multiply(Z1).spMod(p, h13);
	Z3 = t6.spAdd(t6);
	
	this.coord = [ X3, Y3, Z3 ];
	return this;
	
	/*
	 * if (this.inf) { return nec(this); } var X, Y, Z, p, t1, t2, t3, x3, y3,
	 * z3; X = this.coord[0]; Y = this.coord[1]; Z = this.coord[2]; p = this.m;
	 * t1 = Z.square().spMod(p, h1); t2 = X.spSubtract(t1,
	 * h2).multiply(X.spAdd(t1, h3)).spMod(p, h4); t2 = t2.spAdd(t2,
	 * h5).spAdd(t2, h6); y3 = Y.spAdd(Y, h7); z3 = y3.multiply(Z).spMod(p, h8);
	 * y3 = y3.square().spMod(p, h9); t3 = y3.multiply(X).spMod(p, h10); y3 =
	 * y3.square().spMod(p, h11).multiply( p.shiftRight(1).spAdd(BigInteger.ONE,
	 * h19)).spMod(p, h12); x3 = t2.square().spMod(p, h13); t1 = t3.spAdd(t3,
	 * h14); x3 = x3.spSubtract(t1, h15); t1 = t3.spSubtract(x3, h16); y3 =
	 * t1.multiply(t2).spMod(p, h17).spSubtract(y3, h18); this.coord = [ x3, y3,
	 * z3 ]; return this;
	 */
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Addition Prime
// The curve must be of the form Y^2 = X^ 3+b
// http://www.hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#addition-add-2007-bl
//
function ecpAddP(S) {

	if (S.inf) { return nec(this); }
	if (this.inf) { return S.jacobian(); }
	var X1 = this.coord[0];
	var Y1 = this.coord[1];
	var Z1 = this.coord[2];
	var p = this.m;
	
	var z1z1, z2z2, u1, u2, s1, s2, h, i, j, r, v, x3, y3, z3, t1, t2, t3, t4;
	
	z1z1 = Z1.square().spMod(p, h1);
	z2z2 = Z2.square().spMod(p, h2);
	u1 = X1.multiply(z2z2).spMod(p, h3);
	u2 = X2.multiply(z1z1).spMod(p, h4);
	s1 = (Y1.multiply(Z2).spMod(p, h5)).multiply(z2z2).spMod(p, h6);
	s2 = (Y2.multiply(Z1).spMod(p, h7)).multiply(z1z1).spMod(p, h8);
	
	h = u2.spSubtract(u1, h9);
	
	i = (h.spAdd(h, h27)).square().spMod(p, h10);
	
	j = h.multiply(i).spMod(p, h11);
	t1 = s2.spSubtract(s1, h12);
	r = t1.spAdd(t1, h13);
	v = u1.multiply(i).spMod(p, h14);
	
	x3 = r.square().spMod(h15).spSubtract(j, h16).spSubtract((v.spAdd(v, h18)),
			h17);
	t2 = s1.multiply(j).spMod(p, h19);
	t3 = t2.spAdd(t2, h20);
	y3 = (r.multiply(v.spSubtract(x3, h21)).spMod(p, h22)).spSubtract(t3, h23);
	t4 = (Z1.spAdd(Z2, h24)).square().spMod(p, h25);
	z3 = ((t4.spSubtract(z1z1, h26)).spSubtract(z2z2, h27)).multiply(h).spMod(
			p, h26);
	
	this.coord = [ x3, y3, z3 ];
	return this;
	
	/*
	 * var t1,t2,t3,t4,x3,y3,z3; if(S.inf){return nec(this);}
	 * if(this.inf){return S.jacobian();} var X1=this.coord[0]; var
	 * Y1=this.coord[1]; var Z1=this.coord[2]; var x2=S.coord[0]; var
	 * y2=S.coord[1]; var p=this.m; t1=Z1.square().spMod(p,h3);
	 * t2=t1.multiply(Z1).spMod(p,h4); t1=t1.multiply(x2).spMod(p,h5);
	 * t2=t2.multiply(y2).spMod(p,h6); t1=t1.spSubtract(X1,h1);
	 * t2=t2.spSubtract(Y1,h2); if (t1.isZero()) { if (t2.isZero()) { return
	 * S.dobble();} else {return infinity(this);} }
	 * z3=Z1.multiply(t1).spMod(p,h8); t3=t1.square().spMod(p,h7);
	 * t4=t3.multiply(t1).spMod(p,h9); t3=t3.multiply(X1).spMod(p,h10);
	 * t1=t3.spAdd(t3,h11); x3=t2.square().spMod(p,h12);
	 * x3=x3.spSubtract(t1,h13); x3=x3.spSubtract(t4,h14);
	 * t3=t3.spSubtract(x3,h15); t3=t3.multiply(t2).spMod(p,h16);
	 * t4=t4.multiply(Y1).spMod(p,h17); y3=t3.spSubtract(t4,h18);
	 * this.coord=[x3, y3, z3]; return this;
	 */
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Comb2 multiplication (see section Point Multiplication)
//
function ecpComb2Mult(k, Q, w, precomp) {

	// input : Window width w, k
	// d = ceil(t/w), e = ceil(d/2)
	// output : kP
	var d = Math.ceil(k.DB * k.t / w);
	var e = Math.ceil(d / 2);
	var kTab = factResize(k, w);
	Q = precomp[kTab[e - 1]].add(precomp[kTab[2 * e - 1] + (1 << w)]);
	for ( var i = e - 2; i >= 0; i--) {
		Q = Q.dobble().add(precomp[kTab[i]]).add(
				precomp[kTab[i + e] + (1 << w)]);
	}
	return Q;
}

function factResize(k, w) {

	// input : key, window size
	// output : k such that k[i]=K_i^(w-1) ... K_i^(0)
	var d = Math.ceil(k.DB * k.t / w);
	var factArr = new Array();
	for ( var i = 0; i < 2 * Math.ceil(d / 2); i++) {
		factArr[i] = 0;
	}
	for ( var ind = d - 1; ind >= 0; ind--) {
		for ( var j = 0; j < w; j++) {
			if (k.testBit(d * j + ind)) {
				factArr[ind] = factArr[ind] + (1 << (j));
			}
		}
	}
	return factArr;
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Precomputation for comb2 multiplication
//
function precomputeComb2(k, P, w) {

	var d = Math.ceil(k.DB * k.t / w);
	var e = Math.ceil(d / 2);
	var r = 1 << w;
	var R = P.jacobian();
	var tab = new Array();
	tab[0] = R;
	tab[w] = R.dobbleMult(e); /* .affine(); */
	for ( var i = 1; i < w; i++) {
		tab[i] = tab[i - 1].dobbleMult(d);/* .affine(); */
		tab[i + w] = tab[i].dobbleMult(e);/* .affine(); */
	}
	var precomp = new Array();
	// var j = 0;
	precomp[0] = infinity(R);
	precomp[r] = infinity(R);
	for ( var ipc = 1; ipc < r; ipc++) {
		var fact = 1;
		var jpc = ipc;
		while ((jpc & 1) == 0) {
			fact += 1;
			jpc = jpc >> 1;
		}
		precomp[ipc] = precomp[ipc - (1 << (fact - 1))].add(tab[fact - 1]); /* .affine(); */
		precomp[ipc + r] = precomp[ipc + r - (1 << (fact - 1))].add(tab[w
				+ fact - 1]);/* .affine(); */
	}
	return precomp;
}
function ecpDobbleMult(n) {

	var i = 0;
	var R = this;
	for (i = 0; i < n; i++) {
		R = R.dobble();
	}
	return R;
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Display precomputation for comb2 multiplication
// OEF
function displayPrecompOEF(precomp) {

	var index;
	document.write("var Px=[");
	for (index = 0; index < precomp.length; index++) {
		document.write(precomp[index].coord[0]);
		if (index != (precomp.length - 1)) document.write(",");
	}
	document.write("];");
	document.write("<br/>");
	document.write("var Py=[");
	for (index = 0; index < precomp.length; index++) {
		document.write(precomp[index].coord[1]);
		if (index != (precomp.length - 1)) {
			document.write(",");
		}
	}
	document.write("];");
	document.write("<br/>");
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Read stored precomputation for comb2 multiplication and make input for comb2
// OEF
function readPrecompOEF(Px, Py, P) {

	var i, nb;
	nb = Px.length / 10;// Math.log(Px.length)/Math.log(2);
	var precomp = new Array();
	precomp[0] = infinity(P);
	for (i = 1; i < nb; i++) {
		precomp[i] = new ecPoint([ noeftab(Px.slice(i * 10, i * 10 + 10)),
				noeftab(Py.slice(i * 10, i * 10 + 10)) ], 'curve', 'affine',
				'OEF', 0, 0);
	}
	precomp[nb / 2] = infinity(P);
	return precomp;
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Display precomputation for comb2 multiplication
// Prime
function displayPrecompP(precomp) {

	document.write("var Px=[");
	for ( var index = 0; index < precomp.length; index++) {
		document.write("'" + precomp[index].coord[0].toString(35) + "'");
		if (index != (precomp.length - 1)) document.write(",");
	}
	document.write("];");
	document.write("<br/>");
	document.write("var Py=[");
	for ( var index = 0; index < precomp.length; index++) {
		document.write("'" + precomp[index].coord[1].toString(35) + "'");
		if (index != (precomp.length - 1)) document.write(",");
	}
	document.write("];");
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Read stored precomputation for comb2 multiplication and make input for comb2
// Prime
function readPrecompP(Px, Py, m2) {

	var precomp = new Array();
	for ( var i = 0; i < Px.length; i++) {
		precomp[i] = new ecPoint([ new BigInteger(Px[i], 35),
				new BigInteger(Py[i], 35) ], 'curve', 'affine', 'prime', m2,
				(Px[i] == 0));
	}
	return precomp;
}

// -------------------------------------------------------------------------------------------------------------------------------------

function nec(P) {

	return new ecPoint(P.coord, P.curve, P.rep, P.field, P.m, P.inf);
}
function ninf(P) {

	return new ecPoint([ 0, 0, 0 ], P.curve, P.rep, P.field, P.m, true);
}

function ecAffine() {

	var R = nec(this);
	return R.pAffine();
}
function ecJacobian() {

	var R = nec(this);
	return R.pJacobian();
}
function ecAdd(Q) {

	var R = this.jacobian();
	var S = Q.jacobian();
	if (this.field == 'prime') { return R.pAddP(S); }
	// else {
	return R.pAddOEF(S);
	// }
}
function ecDobble() {

	var R = this.jacobian();
	if (this.field == 'prime') { return R.pDobbleP(); }
	// else {
	return R.pDobbleOEF();
	// }
}
function ecDobbleMult(n) {

	var R = this.jacobian();
	return R.pDobbleMult(n);
}
function ecComb2Mult(k, w) {

	var R = nec(this);
	var precomp = precomputeComb2(k, R, w);
	var r = this.pComb2Mult(k, R, w, precomp);
	return r;
}
function ecMultiply(k, w, precomp) {

	var R = nec(this);
	var r = this.pComb2Mult(k, R, w, precomp);
	return r;
}
function ecToString(n) {

	var R = this.affine();
	return R.coord[0].toString(n).concat(R.coord[1].toString(n));
}
function ecCopy() {

	return new ecPoint(this.coord, this.curve, this.rep, this.field, this.m,
			this.inf);
}
function fieldONE(field) {

	if (field == 'prime') { return BigInteger.ONE; }
	// else {
	return OEF.ONE;
	// }
}

// protected
ecPoint.prototype.pAffine = ecpAffine;
ecPoint.prototype.pJacobian = ecpJacobian;
ecPoint.prototype.pAddOEF = ecpAddOEF;
ecPoint.prototype.pDobbleOEF = ecpDobbleOEF;
ecPoint.prototype.pAddP = ecpAddP;
ecPoint.prototype.pDobbleP = ecpDobbleP;
ecPoint.prototype.pDobbleMult = ecpDobbleMult;
ecPoint.prototype.pComb2Mult = ecpComb2Mult;

// public
ecPoint.prototype.add = ecAdd;
ecPoint.prototype.dobble = ecDobble;
ecPoint.prototype.dobbleMult = ecDobbleMult;
ecPoint.prototype.comb2Mult = ecComb2Mult;
ecPoint.prototype.multiply = ecMultiply;
ecPoint.prototype.affine = ecAffine;
ecPoint.prototype.jacobian = ecJacobian;
ecPoint.prototype.toString = ecToString;
ecPoint.prototype.copy = ecCopy;
