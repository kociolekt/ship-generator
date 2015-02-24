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