/* globals ClassicalNoise */

Object.prototype.extend = function(obj) {
    for(var i in obj)
        this[i] = obj[i];
    return this;
};

function TextureGenerator(options) {

	var defaults = {
		width: 100,
		height: 100,
		gradientGridSize: 64
	}

	this.settings = defaults.extend(options);
	this.context = this.createContext(this.settings.width, this.settings.height);
	this.noiseGenerator = new ClassicalNoise();
	this.generate();
}

TextureGenerator.prototype.createContext = function(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    return this.canvas.getContext('2d');
};

TextureGenerator.prototype.generate = function() {
	var value = 0;
	for (var x = 0; x < this.settings.width; x++) {
		for (var y = 0; y < this.settings.height; y++) {
			value = Math.floor(Math.abs(this.noiseGenerator.noise(x/this.settings.width, y/this.settings.height, 0)) * 255);
			this.context.fillStyle = 'rgba('+value+', '+value+', '+value+', 1)';//'rgb('+value+','+value+','+value+')';
			this.context.fillRect( x, y, 1, 1 );
		}
	}
}

function Perlin(options) {
    var defaults = {
        persistence: 1/2,
        octaves: 6
    }

    this.settings = defaults.extend(options);


}

Perlin.prototype.preprocess = function(first_argument) {
    this.frequecies = [];
    this.aplitudes = [];

    for (var i = 0; i < octaves; i++) {
        this.frequecies.push(Math.pow(2, i));
        this.aplitudes.push(Math.pow(this.settings.persistence, i));
    }
};

function MersenneTwister(seed) {
	this.MT = new Array(623);
	this.index = 0;
	this.MT[0] = seed;

	for (var i = 1, mtLen = this.MT.length; i < mtLen; i++) {
		this.MT[i] = (1812433253 * (this.MT[i-1] ^ (this.MT[i-1] >> 30)) + i) & 0xFFFFFFFF;
	}

	this.generateNumbers();
}

MersenneTwister.prototype.random = function() {
    var y = this.MT[this.index];
    y = y ^ (y >> 11);
    y = y ^ ((y << 7) & (2636928640));
    y = y ^ ((y << 15) & (4022730752));
    y = y ^ (y >> 18);

    this.index = (this.index + 1) % 624;

    return y
};

MersenneTwister.prototype.generateNumbers = function() {
    for (var i = 0; i < 623; i++) {
        var y = (this.MT[i] & 0x80000000) + (this.MT[(i+1) % 624] & 0x7fffffff);
        this.MT[i] = this.MT[(i + 397) % 624] ^ (y >> 1);
        if ((y % 2) !== 0) {
            this.MT[i] = this.MT[i] ^ (2567483615);
        }
    }
}

mt = new MersenneTwister(0);
console.log(mt.random());
console.log(mt.random());