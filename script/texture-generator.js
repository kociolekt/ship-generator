/* globals Perlin */

Object.prototype.extend = function(obj) {
    for(var i in obj)
        this[i] = obj[i];
    return this;
};

function TextureGenerator(options) {

	var defaults = {
		width: 300,
		height: 300
	}

	this.settings = defaults.extend(options);
	this.context = this.createContext(this.settings.width, this.settings.height);
	this.clouds();
}

TextureGenerator.prototype.createContext = function(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    return this.canvas.getContext('2d');
};

TextureGenerator.prototype.clouds = function() {
	var noiseGenerator = new AnotherPerlin({
			width: this.settings.width,
			height: this.settings.height,
			octaves: 1024
		}),
		value = 0;
	for (var x = 0; x < this.settings.width; x++) {
		for (var y = 0; y < this.settings.height; y++) {

            var cover = 2.84,
            	sharpness = 0.98,
            	value = noiseGenerator.noise(x, y) * 100,
            	c = (value - 50 - cover) < 0 ? 0 : (value - 50 - cover),
            	lgh = 100 - ((Math.pow(sharpness, c))*50);

			this.context.fillStyle = 'hsl(200, 100%, '+lgh+'%)';
			this.context.fillRect( x, y, 1, 1 );
		}
	}
}
