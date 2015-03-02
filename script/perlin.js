/**
 * [Perlin description]
 * @param {[type]} options [description]
 */
function Perlin(options) {
    var defaults = {
        persistence: 1/2,
        octaves: 6,
        interpolation: 'cosine'
    }

    this.settings = defaults.extend(options);

    this.init();
}

Perlin.prototype.init = function() {
    this.frequecies = [];
    this.aplitudes = [];

    for (var i = 0; i < this.settings.octaves; i++) {
        this.frequecies.push(Math.pow(2, i));
        this.aplitudes.push(Math.pow(this.settings.persistence, i));
    }

    this.interpolation = this.linearInterpolation;

    switch(this.settings.interpolation){
        case 'linear':
            return this.interpolation = this.linearInterpolation;
            break;
        case 'cosine':
            return this.interpolation = this.cosineInterpolation;
            break;
    }
};

Perlin.prototype.random = function(x) {
    x = (x<<13) ^ x;
    return ( 1.0 - ( (x * (x * x * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
};

Perlin.prototype.linearInterpolation = function(a, b, t) {
    return  a*(1-t) + b*t;
};

Perlin.prototype.cosineInterpolation = function(a, b, t) {
    var f = (1 - Math.cos(t * 3.1415927)) * 0.5;

    return  a*(1-f) + b*f;
};

Perlin.prototype.cubicInterpolation = function(v0, v1, v2, v3, t) {
    var P = (v3 - v2) - (v0 - v1);
    var Q = (v0 - v1) - P;
    var R = v2 - v0;
    var S = v1;

    return (P * t * t * t) + (Q * t * t) + (R * t) + S;
};

Perlin.prototype.smoothedNoise = function(x) {
    return this.random(x)/2  +  this.random(x-1)/4  +  this.random(x+1)/4;
};

Perlin.prototype.interpolatedNoise = function(x) {
    var intX = Math.floor(x),
        fX = x - intX,
        v1 = this.smoothedNoise(intX),
        v2 = this.smoothedNoise(intX + 1);

    return this.interpolation(v1, v2, fX);
};

Perlin.prototype.noise = function(x) {
    var total = 0;

    for (var i = 0, n = this.settings.octaves - 1; i < n; i++) {
        total = total + this.interpolatedNoise(x * this.frequecies[i]) * this.aplitudes[i];
    }

    return total
};

/**
 * [Perlin2D description]
 * @param {[type]} options [description]
 */
function Perlin2D(options) {
    var defaults = {
        persistence: 1/2,
        octaves: 6,
        interpolation: 'cosine'
    }

    this.settings = defaults.extend(options);

    this.init();
}

Perlin2D.prototype.init = function() {
    this.frequecies = [];
    this.aplitudes = [];

    for (var i = 0; i < this.settings.octaves; i++) {
        this.frequecies.push(Math.pow(2, i));
        this.aplitudes.push(Math.pow(this.settings.persistence, i));
    }

    this.interpolation = this.linearInterpolation;

    switch(this.settings.interpolation){
        case 'linear':
            return this.interpolation = this.linearInterpolation;
            break;
        case 'cosine':
            return this.interpolation = this.cosineInterpolation;
            break;
    }
};

Perlin2D.prototype.random = function(x, y) {
    var n = x + y * 57;
    n = (n<<13) ^ n;
    return ( 1.0 - ( (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
};

Perlin2D.prototype.linearInterpolation = function(a, b, t) {
    return  a*(1-t) + b*t;
};

Perlin2D.prototype.cosineInterpolation = function(a, b, t) {
    var f = (1 - Math.cos(t * 3.1415927)) * 0.5;

    return  a*(1-f) + b*f;
};

Perlin2D.prototype.cubicInterpolation = function(v0, v1, v2, v3, t) {
    var P = (v3 - v2) - (v0 - v1);
    var Q = (v0 - v1) - P;
    var R = v2 - v0;
    var S = v1;

    return (P * t * t * t) + (Q * t * t) + (R * t) + S;
};

Perlin2D.prototype.smoothedNoise = function(x, y) {
    var corners = ( this.random(x-1, y-1)+this.random(x+1, y-1)+this.random(x-1, y+1)+this.random(x+1, y+1) ) / 16,
        sides   = ( this.random(x-1, y)  +this.random(x+1, y)  +this.random(x, y-1)  +this.random(x, y+1) ) /  8,
        center  =  this.random(x, y) / 4;

    return corners + sides + center;
};

Perlin2D.prototype.interpolatedNoise = function(x, y) {
    var intX    = Math.floor(x),
        fX = x - intX,
        intY    = Math.floor(y),
        fY = y - intY;

    var v1 = this.smoothedNoise(intX,     intY),
        v2 = this.smoothedNoise(intX + 1, intY),
        v3 = this.smoothedNoise(intX,     intY + 1),
        v4 = this.smoothedNoise(intX + 1, intY + 1);

    var i1 = this.interpolation(v1 , v2 , fX),
        i2 = this.interpolation(v3 , v4 , fX);

    return this.interpolation(i1 , i2 , fY);
};

Perlin2D.prototype.noise = function(x, y) {
    var total = 0;

    for (var i = 0, n = this.settings.octaves - 1; i < n; i++) {
        total = total + this.interpolatedNoise(x * this.frequecies[i], y * this.frequecies[i]) * this.aplitudes[i];
    }

    return total
};


/**
 * [PerlinOriginal description]
 */
function PerlinOriginal(random) {
    this.B = 0x100;
    this.BM = 0xff;

    this.N = 0x1000;
    this.NP = 12;   /* 2^N */
    this.NM = 0xfff;

    var size;

    size = this.B + this.B + 2;
    this.p = new Array(size);

    size = this.B + this.B + 2;
    this.g3 = new Array(size);
    while(size--) this.g3[size] = new Array(3);

    size = this.B + this.B + 2;
    this.g2 = new Array(size);
    while(size--) this.g2[size] = new Array(2);

    size = this.B + this.B + 2;
    this.g1 = new Array(size);


    if(typeof random === 'undefined') {
        random = function() {
            return Math.random() * 0xffffffff & 0x7fffffff;
        }
    }

    this.random = random;

    this.init();

    this.noise = this.noise2;
}

PerlinOriginal.prototype.sCurve = function(t) {
    return t * t * (3 - 2 * t);
};

PerlinOriginal.prototype.lerp = function(t, a, b) {
    return a + t * (b - a);
};

PerlinOriginal.prototype.noise1 = function(x)
{
    var bx0, bx1; //int
    var rx0, rx1, sx, t, u, v; //float

    t = x + this.N;
    bx0 = t & 0xFFFFFFFF & this.BM;
    bx1 = (bx0+1) & this.BM;
    rx0 = t - (t & 0xFFFFFFFF);
    rx1 = rx0 - 1;

    sx = this.sCurve(rx0);

    u = rx0 * this.g1[ this.p[ bx0 ] ];
    v = rx1 * this.g1[ this.p[ bx1 ] ];

    return this.lerp(sx, u, v);
}

PerlinOriginal.prototype.noise2 = function(x, y){
    var bx0, bx1, by0, by1, b00, b10, b01, b11;
    var rx0, rx1, ry0, ry1, q, sx, sy, a, b, t, u, v;
    var i, j;

    t = x + this.N;
    bx0 = t & 0xFFFFFFFF & this.BM;
    bx1 = (bx0+1) & this.BM;
    rx0 = t - (t & 0xFFFFFFFF);
    rx1 = rx0 - 1;

    t = y + this.N;
    by0 = t & 0xFFFFFFFF & this.BM;
    by1 = (by0+1) & this.BM;
    ry0 = t - (t & 0xFFFFFFFF);
    ry1 = ry0 - 1;

    i = this.p[ bx0 ];
    j = this.p[ bx1 ];

    b00 = this.p[ i + by0 ];
    b10 = this.p[ j + by0 ];
    b01 = this.p[ i + by1 ];
    b11 = this.p[ j + by1 ];

    sx = this.sCurve(rx0);
    sy = this.sCurve(ry0);

    u = this.at2(rx0, ry0, this.g2[ b00 ]);
    v = this.at2(rx1, ry0, this.g2[ b10 ]);
    a = this.lerp(sx, u, v);

    u = this.at2(rx0, ry1, this.g2[ b01 ]);
    v = this.at2(rx1, ry1, this.g2[ b11 ]);
    b = this.lerp(sx, u, v);

    return this.lerp(sy, a, b);
}

PerlinOriginal.prototype.at2 = function(rx, ry, q) {

    return (rx * q[0]) + (ry * q[1]);
}

PerlinOriginal.prototype.noise3 = function(x, y, z) {
    var bx0, bx1, by0, by1, bz0, bz1, b00, b10, b01, b11;
    var rx0, rx1, ry0, ry1, rz0, rz1, q, sy, sz, a, b, c, d, t, u, v;
    var i, j;

    t = x + this.N;
    bx0 = t & 0xFFFFFFFF & this.BM;
    bx1 = (bx0+1) & this.BM;
    rx0 = t - (t & 0xFFFFFFFF);
    rx1 = rx0 - 1;

    t = y + this.N;
    by0 = t & 0xFFFFFFFF & this.BM;
    by1 = (by0+1) & this.BM;
    ry0 = t - (t & 0xFFFFFFFF);
    ry1 = ry0 - 1;

    t = z + this.N;
    bz0 = t & 0xFFFFFFFF & this.BM;
    bz1 = (bz0+1) & this.BM;
    rz0 = t - (t & 0xFFFFFFFF);
    rz1 = rz0 - 1;

    i = this.p[ bx0 ];
    j = this.p[ bx1 ];

    b00 = this.p[ i + by0 ];
    b10 = this.p[ j + by0 ];
    b01 = this.p[ i + by1 ];
    b11 = this.p[ j + by1 ];

    t  = this.sCurve(rx0);
    sy = this.sCurve(ry0);
    sz = this.sCurve(rz0);


    u = this.at3(rx0,ry0,rz0,this.g3[ b00 + bz0 ]);
    v = this.at3(rx1,ry0,rz0,this.g3[ b10 + bz0 ]);
    a = this.lerp(t, u, v);

    u = this.at3(rx0,ry1,rz0,this.g3[ b01 + bz0 ]);
    v = this.at3(rx1,ry1,rz0,this.g3[ b11 + bz0 ]);
    b = this.lerp(t, u, v);

    c = this.lerp(sy, a, b);

    u = this.at3(rx0,ry0,rz1,this.g3[ b00 + bz1 ]);
    v = this.at3(rx1,ry0,rz1,this.g3[ b10 + bz1 ]);
    a = this.lerp(t, u, v);

    u = this.at3(rx0,ry1,rz1,this.g3[ b01 + bz1 ]);
    v = this.at3(rx1,ry1,rz1,this.g3[ b11 + bz1 ]);
    b = this.lerp(t, u, v);

    d = this.lerp(sy, a, b);

    return this.lerp(sz, c, d);
};

PerlinOriginal.prototype.at3 = function(rx, ry, rz, q) {
    return rx * q[0] + ry * q[1] + rz * q[2];
};


PerlinOriginal.prototype.init = function() {

    var B = this.B,
        p = this.p,
        g1 = this.g1,
        g2 = this.g2,
        g3 = this.g3,
        i,
        j,
        k,
        random = this.random;

    for (i = 0; i < B; i++) {
        p[i] = i;

        g1[i] = ((random() % (B + B)) - B) / B;

        for (j = 0 ; j < 2 ; j++)
            g2[i][j] = ((random() % (B + B)) - B) / B;
        this.normalize2(g2[i]);

        for (j = 0 ; j < 3 ; j++)
            g3[i][j] = ((random() % (B + B)) - B) / B;
        this.normalize3(g3[i]);
    }

    while (--i) {
        k = p[i];
        p[i] = p[j = random() % B];
        p[j] = k;
    }

    for (i = 0 ; i < B + 2 ; i++) {
        p[B + i] = p[i];
        g1[B + i] = g1[i];
        for (j = 0 ; j < 2 ; j++)
            g2[B + i][j] = g2[i][j];
        for (j = 0 ; j < 3 ; j++)
            g3[B + i][j] = g3[i][j];
    }
};

PerlinOriginal.prototype.normalize2 = function(v) {
    var s;

    s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    v[0] = v[0] / s;
    v[1] = v[1] / s;
};

PerlinOriginal.prototype.normalize3 = function(v) {
    var s;

    s = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    v[0] = v[0] / s;
    v[1] = v[1] / s;
    v[2] = v[2] / s;
};


function FastPerlin() {
    this.octaves = 2;
}

FastPerlin.prototype.noise = function(x, y) {

    var result = 0;
    var frequence256 = 256;
    var sx = Math.floor((x)*frequence256);
    var sy = Math.floor((y)*frequence256);
    var octaves = this.octaves;
    var octave=octaves;

    while(octave != 0) {
        var bX = sx&0xFF;
        var bY = sy&0xFF;

        var sxp = sx>>8;
        var syp = sy>>8;


        //Compute noise for each corner of current cell
        var Y1376312589_00=syp*1376312589;
        var Y1376312589_01=Y1376312589_00+1376312589;

        var XY1376312589_00=sxp+Y1376312589_00;
        var XY1376312589_10=XY1376312589_00+1;
        var XY1376312589_01=sxp+Y1376312589_01;
        var XY1376312589_11=XY1376312589_01+1;

        var XYBASE_00=(XY1376312589_00<<13)^XY1376312589_00;
        var XYBASE_10=(XY1376312589_10<<13)^XY1376312589_10;
        var XYBASE_01=(XY1376312589_01<<13)^XY1376312589_01;
        var XYBASE_11=(XY1376312589_11<<13)^XY1376312589_11;

        var alt1=(XYBASE_00 * (XYBASE_00 * XYBASE_00 * 15731 + 789221) + 1376312589);
        var alt2=(XYBASE_10 * (XYBASE_10 * XYBASE_10 * 15731 + 789221) + 1376312589);
        var alt3=(XYBASE_01 * (XYBASE_01 * XYBASE_01 * 15731 + 789221) + 1376312589);
        var alt4=(XYBASE_11 * (XYBASE_11 * XYBASE_11 * 15731 + 789221) + 1376312589);

        /*
         *NOTE : on  for true grandiant noise uncomment following block
         * for true gradiant we need to perform scalar product here, gradiant vector are created/deducted using
         * the above pseudo random values (alt1...alt4) : by cutting thoses values in twice values to get for each a fixed x,y vector
         * gradX1= alt1&0xFF
         * gradY1= (alt1&0xFF00)>>8
         *
         * the last part of the PRN (alt1&0xFF0000)>>8 is used as an offset to correct one of the gradiant problem wich is zero on cell edge
         *
         * source vector (sXN;sYN) for scalar product are computed using (bX,bY)
         *
         * each four values  must be replaced by the result of the following
         * altN=(gradXN;gradYN) scalar (sXN;sYN)
         *
         * all the rest of the code (interpolation+accumulation) is identical for value & gradiant noise
         */


        /*START BLOCK FOR TRUE GRADIANT NOISE*/

         var grad1X=(alt1&0xFF)-128;
         var grad1Y=((alt1>>8)&0xFF)-128;
         var grad2X=(alt2&0xFF)-128;
         var grad2Y=((alt2>>8)&0xFF)-128;
         var grad3X=(alt3&0xFF)-128;
         var grad3Y=((alt3>>8)&0xFF)-128;
         var grad4X=(alt4&0xFF)-128;
         var grad4Y=((alt4>>8)&0xFF)-128;


         var sX1=bX>>1;
         var sY1=bY>>1;
         var sX2=128-sX1;
         var sY2=sY1;
         var sX3=sX1;
         var sY3=128-sY1;
         var sX4=128-sX1;
         var sY4=128-sY1;
         alt1=(grad1X*sX1+grad1Y*sY1)+16384+((alt1&0xFF0000)>>9); //to avoid seams to be 0 we use an offset
         alt2=(grad2X*sX2+grad2Y*sY2)+16384+((alt2&0xFF0000)>>9);
         alt3=(grad3X*sX3+grad3Y*sY3)+16384+((alt3&0xFF0000)>>9);
         alt4=(grad4X*sX4+grad4Y*sY4)+16384+((alt4&0xFF0000)>>9);

        /*END BLOCK FOR TRUE GRADIANT NOISE */


        /*START BLOCK FOR VALUE NOISE*/
        /*
         alt1&=0xFFFF;
         alt2&=0xFFFF;
         alt3&=0xFFFF;
         alt4&=0xFFFF;
         */
        /*END BLOCK FOR VALUE NOISE*/


        /*START BLOCK FOR LINEAR INTERPOLATION*/
        //BiLinear interpolation
        /*
        int f24=(bX*bY)>>8;
        int f23=bX-f24;
        int f14=bY-f24;
        int f13=256-f14-f23-f24;

        int val=(alt1*f13+alt2*f23+alt3*f14+alt4*f24);
        */
        /*END BLOCK FOR LINEAR INTERPOLATION*/



        //BiCubic interpolation ( in the form alt(bX) = alt[n] - (3*bX^2 - 2*bX^3) * (alt[n] - alt[n+1]) )
        /*START BLOCK FOR BICUBIC INTERPOLATION*/
        var bX2=(bX*bX)>>8;
        var bX3=(bX2*bX)>>8;
        var _3bX2=3*bX2;
        var _2bX3=2*bX3;
        var alt12= alt1 - (((_3bX2 - _2bX3) * (alt1-alt2)) >> 8);
        var alt34= alt3 - (((_3bX2 - _2bX3) * (alt3-alt4)) >> 8);


        var bY2=(bY*bY)>>8;
        var bY3=(bY2*bY)>>8;
        var _3bY2=3*bY2;
        var _2bY3=2*bY3;
        var val= alt12 - (((_3bY2 - _2bY3) * (alt12-alt34)) >> 8);

        val*=256;
        /*END BLOCK FOR BICUBIC INTERPOLATION*/


        //Accumulate in result
        result+=(val<<octave);

        octave--;
        sx<<=1;
        sy<<=1;

    }
    return result>>>(16+octaves+1);
}



function AnotherPerlin(options) {

    var defaults = {
        width: 128,
        height: 128,
        octaves: 16
    }

    this.settings = defaults.extend(options);

    size = this.settings.width;
    this.noiseData = new Array(size);
    while(size--) this.noiseData[size] = new Array(this.settings.height);

    this.init();
}

AnotherPerlin.prototype.init = function() {

    for (var x = 0; x < this.settings.width; x++) {
        for (var y = 0; y < this.settings.height; y++) {
            this.noiseData[x][y] = ((Math.random() * 32768) % 32768) / 32768.0;
        }
    }
};

AnotherPerlin.prototype.smoothed = function(x, y) {

    var ix = Math.floor(x);
    var iy = Math.floor(y);

    //get fractional part of x and y
    var fractX = x - ix;
    var fractY = y - iy;

    //wrap around
    var x1 = (ix + this.settings.width) % this.settings.width;
    var y1 = (iy + this.settings.height) % this.settings.height;

    //neighbor values
    var x2 = (x1 + this.settings.width - 1) % this.settings.width;
    var y2 = (y1 + this.settings.height - 1) % this.settings.height;

    //smooth the noise with bilinear interpolation
    var value = 0.0;
    value += fractX       * fractY       * this.noiseData[x1][y1];
    value += fractX       * (1 - fractY) * this.noiseData[x1][y2];
    value += (1 - fractX) * fractY       * this.noiseData[x2][y1];
    value += (1 - fractX) * (1 - fractY) * this.noiseData[x2][y2];

    return value;
};

AnotherPerlin.prototype.noise = function(x, y) {

    var value = 0,
        size = this.settings.octaves,
        initialSize = size,
        iterations = 0;

    while(size >= 1) {
        value += this.smoothed(x / size, y / size) * size;
        size /= 2;
        iterations += size;
    }

    return (value / iterations);

};
