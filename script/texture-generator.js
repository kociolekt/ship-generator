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
	this.noiseGenerator = new PerlinOriginal();
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
            var nx = x/this.settings.width;
            var ny = y/this.settings.height;
            var n1 = this.noiseGenerator.noise(nx, ny);
            var n2 = this.noiseGenerator.noise(nx*2, ny*2)/2;
            var n3 = this.noiseGenerator.noise(nx*4, ny*4)/4;

			value = Math.abs(((n1 + n2 + n3 + n1 + n2 + n3) * 255)) & 0x000000ff;
			this.context.fillStyle = 'rgba('+value+', '+value+', '+value+', 1)';//'rgb('+value+','+value+','+value+')';
			this.context.fillRect( x, y, 1, 1 );
		}
	}
}
