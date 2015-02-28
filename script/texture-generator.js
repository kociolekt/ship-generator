/* globals Perlin */

Object.prototype.extend = function(obj) {
    for(var i in obj)
        this[i] = obj[i];
    return this;
};

function TextureGenerator(options) {

	var defaults = {
		width: 300,
		height: 300,
		gradientGridSize: 64
	}

	this.settings = defaults.extend(options);
	this.context = this.createContext(this.settings.width, this.settings.height);
	this.noiseGenerator = new AnotherPerlin();
	this.generate();
}

TextureGenerator.prototype.createContext = function(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    return this.canvas.getContext('2d');
};

TextureGenerator.prototype.generate = function() {
	var noise = this.noiseGenerator.noise,
        value = 0;
	for (var x = 0; x < this.settings.width; x++) {
		for (var y = 0; y < this.settings.height; y++) {
            var nx = x;
            var ny = y;
            var n1 = this.noiseGenerator.noise(nx, ny);
            var hue = 169;
            var sat = 100;
            var lgh = 10 + ((n1) * 60);
			//this.context.fillStyle = 'rgba('+value+', '+value+', '+value+', 1)';//'rgb('+value+','+value+','+value+')';
			this.context.fillStyle = 'hsl(' + hue + ', ' + sat + '%, '+lgh+'%)';
			this.context.fillRect( x, y, 1, 1 );
		}
	}
}
