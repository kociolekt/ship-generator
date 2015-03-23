var Utils = {};

/**
 * Speed lerp between values
 * @param  {Float} Starting value
 * @param  {Float} Ending value
 * @param  {Float} Parameter t 0.0 - 1.0
 * @return {Float} Result value
 */
Utils.lerp = function(a, b, c) {
    return a + c * (b - a);
};

/**
 * Speed lerp 2D
 * @param  {Array} Starting point
 * @param  {Array} Ending point
 * @param  {Float} Parameter t 0.0 - 1.0
 * @param  {Array} Result Array
 * @return {undefined}
 */
Utils.lerp2 = function(a, b, c, d) {
    var e = a[0];
    a = a[1];
    d[0] = e + c * (b[0] - e);
    d[1] = a + c * (b[1] - a);
};

/**
 * Speed lerp 3D
 * @param  {Array} Starting point
 * @param  {Array} Ending point
 * @param  {Float} Parameter t 0.0 - 1.0
 * @param  {Array} Result Array
 * @return {undefined}
 */
Utils.lerp3 = function(a, b, c, d) {
    var e = a[0],
        f = a[1];
    a = a[2];
    d[0] = e + c * (b[0] - e);
    d[1] = f + c * (b[1] - f);
    d[2] = a + c * (b[2] - a);
};

/**
 * 16 bit Linear feedback shift register
 * @return {Object} With methods setSeed(val) and rand(). Rand returns values between 0.0 - 1.0
 */
Utils.lfsr = (function(){
    var max = Math.pow(2, 16),
        period = 0,
        seed, out;
    return {
        setSeed : function(val) {
            out = seed = val || Math.round(Math.random() * max);
        },
        getSeed : function() {
            return seed;
        },
        getPeriod : function() {
            return period;
        },
        rand : function() {
            var bit;
            // From http://en.wikipedia.org/wiki/Linear_feedback_shift_register
            bit  = ((out >> 0) ^ (out >> 2) ^ (out >> 3) ^ (out >> 5) ) & 1;
            out =  (out >> 1) | (bit << 15);
            period++;
            return out / max;
        }
    };
}());

/**
 * Calculates distance between two values
 * @param  {Float} First value
 * @param  {Float} Second value
 * @return {Float} Distance
 */
Utils.distance = function(p, q) {
	return p - q;
};

/**
 * Calculates distance between two points on plane
 * @param  {Array} First point
 * @param  {Array} Second point
 * @return {Float} Distance
 */
Utils.distance2 = function(p, q) {
	var d1 = p[0] - q[0],
	    d2 = p[1] - q[1];
	return Math.sqrt(d1 * d1 + d2 * d2);
};

/**
 * Calculates distance between two points in space
 * @param  {Array} First point
 * @param  {Array} Second point
 * @return {Float} Distance
 */
Utils.distance3	 = function(p, q) {
	var d1 = p[0] - q[0],
	    d2 = p[1] - q[1],
	    d3 = p[2] - q[2];
	return Math.sqrt(d1 * d1 + d2 * d2 + d3 * d3);
};

/**
 * Calculates angle between three points on a plane where p1 is vertex of athe angle
 * @param  {Array} First point
 * @param  {Array} Vertex of the angle
 * @param  {Array} Second point
 * @return {Float} Angle
 */
Utils.angle2 = function(p0, p1, p2) {
    var x1 = p1[0]-p0[0], y1 = p1[1]-p0[1],
        x2 = p1[0]-p2[0], y2 = p1[1]-p2[1],
        x3 = p2[0]-p0[0], y3 = p2[1]-p0[1],
        b = x1*x1 + y1*y1,
        a = x2*x2 + y2*y2,
        c = x3*x3 + y3*y3;
    return Math.acos( (a+b-c) / Math.sqrt(4*a*b) );
};

/**
 * Calculates angle between three points in space where p1 is vertex of athe angle
 * @param  {Array} First point
 * @param  {Array} Vertex of the angle
 * @param  {Array} Second point
 * @return {Float} Angle
 */
Utils.angle3 = function(v1, v2, v3) {
    var d12 = Utils.distance3(v1, v2),
    	d13 = Utils.distance3(v1, v3),
    	d23 = Utils.distance3(v2, v3);

    return Math.acos(((d12*d12) + (d13*d13) - (d23*d23)) / (2*d12*d13));
};