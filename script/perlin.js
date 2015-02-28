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
