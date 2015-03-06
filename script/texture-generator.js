/* globals Perlin */

Object.prototype.extend = function(obj) {
    for(var i in obj)
        this[i] = obj[i];
    return this;
};

function TextureGenerator(options) {

	var defaults = {
		width: 2048,
		height: 2048
	}

    this.ship = new ShipGenerator();
	this.settings = defaults.extend(options);
	this.context = this.createContext(this.settings.width, this.settings.height);
	this.plating();
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
			octaves: 64
		}),
		value = 0;
	for (var x = 0; x < this.settings.width; x++) {
		for (var y = 0; y < this.settings.height; y++) {

            var cover = 49.84,
            	sharpness = 0.95,
            	value = noiseGenerator.noise(x, y) * 100,
            	c = (value - 50 - cover) < 0 ? 0 : (value - 50 - cover),
            	lgh = 100 - ((Math.pow(sharpness, c))*50);

			this.context.fillStyle = 'hsl(200, 100%, '+lgh+'%)';
			this.context.fillRect( x, y, 1, 1 );
		}
	}
};

TextureGenerator.prototype.marble = function() {

    //xPeriod and yPeriod together define the angle of the lines
    //xPeriod and yPeriod both 0 ==> it becomes a normal clouds or turbulence pattern
    var xPeriod = 5; //defines repetition of marble lines in x direction
    var yPeriod = 10; //defines repetition of marble lines in y direction
    //turbPower = 0 ==> it becomes a normal sine pattern
    var turbPower = 500; //makes twists
    var turbSize = 100; //initial size of the turbulence

	var noiseGenerator = new AnotherPerlin({
			width: this.settings.width,
			height: this.settings.height,
			octaves: turbSize
		}),
		value = 0;

	for (var x = 0; x < this.settings.width; x++) {
		for (var y = 0; y < this.settings.height; y++) {

            var value = noiseGenerator.noise(x, y) * 100;

            var xyValue = x * xPeriod / this.settings.height + y * yPeriod / this.settings.width + turbPower * noiseGenerator.noise(x, y) / 200;

            var sineValue = 200 * Math.abs(Math.sin(xyValue * 3.14159));

			this.context.fillStyle = 'hsl(200, 10%, '+sineValue+'%)';
			this.context.fillRect( x, y, 1, 1 );
		}
	}
};

TextureGenerator.prototype.wood = function() {

    var xyPeriod = 12.0; //number of rings
    var turbPower = 7.1; //makes twists
    var turbSize = 32.0; //initial size of the turbulence

    var noiseGenerator = new AnotherPerlin({
            width: this.settings.width,
            height: this.settings.height,
            octaves: turbSize
        }),
        value = 0;

    for (var x = 0; x < this.settings.width; x++) {
        for (var y = 0; y < this.settings.height; y++) {

            var xValue = (x - this.settings.height / 2) / this.settings.height;
            var yValue = (y - this.settings.width / 2) / this.settings.width;
            var distValue = Math.sqrt(xValue * xValue + yValue * yValue) + turbPower * noiseGenerator.noise(x, y) / 256.0;
            var sineValue = 30 * Math.abs(Math.sin(2 * xyPeriod * distValue * 3.14159)) + 20;

            this.context.fillStyle = 'hsl(35, 100%, '+sineValue+'%)';
            this.context.fillRect( x, y, 1, 1 );
        }
    }
};

TextureGenerator.prototype.nebula = function() {
    var cloudGenerator = new AnotherPerlin({
            width: this.settings.width/4,
            height: this.settings.height/4,
            octaves: 256
        }),
        redGenerator = new AnotherPerlin({
            width: this.settings.width/4,
            height: this.settings.height/4,
            octaves: 512
        }),
        greenGenerator = new AnotherPerlin({
            width: this.settings.width/4,
            height: this.settings.height/4,
            octaves: 512
        }),
        blueGenerator = new AnotherPerlin({
            width: this.settings.width/4,
            height: this.settings.height/4,
            octaves: 512
        }),
        value = 0;

    for (var x = 0; x < this.settings.width; x++) {
        for (var y = 0; y < this.settings.height; y++) {

            var cover = 64,
                sharpness = 0.95,
                value = cloudGenerator.noise(x, y) * 128,
                c = (value - (128 - cover)) < 0 ? 0 : (value - (128 - cover)),
                black = 1 + ((Math.pow(sharpness, c))*64);

            var red = (Math.abs(redGenerator.noise(x, y) * 128) / black ) & 0xFF,
                green = (Math.abs(greenGenerator.noise(x, y) * 128) / black ) & 0xFF,
                blue = (Math.abs(blueGenerator.noise(x, y) * 128) / black ) & 0xFF;

            this.context.fillStyle = 'rgb('+red+', '+green+', '+blue+')';
            this.context.fillRect( x, y, 1, 1 );
        }
    }
};

TextureGenerator.prototype.perling = function() {
    var width = this.settings.width,
    	height = this.settings.height,
    	cloudGenerator = new PerlinG(),
    	value = 0;

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {

        	value = cloudGenerator.perlin(x, y);
        	color = Math.abs(value * 255) | 0;

            this.context.fillStyle = 'rgb('+color+', '+color+', '+color+')';
            this.context.fillRect( x, y, 1, 1 );

/*
            var cover = 64,
                sharpness = 0.95,
                value = cloudGenerator.noise(x, y) * 128,
                c = (value - (128 - cover)) < 0 ? 0 : (value - (128 - cover)),
                black = 1 + ((Math.pow(sharpness, c))*64);

            var red = (Math.abs(redGenerator.noise(x, y) * 128) / black ) & 0xFF,
                green = (Math.abs(greenGenerator.noise(x, y) * 128) / black ) & 0xFF,
                blue = (Math.abs(blueGenerator.noise(x, y) * 128) / black ) & 0xFF;

            this.context.fillStyle = 'rgb('+red+', '+green+', '+blue+')';
            this.context.fillRect( x, y, 1, 1 );*/
        }
    }
}

TextureGenerator.prototype.plating = function() {
    var width = this.settings.width,
        height = this.settings.height,
        ctx = this.context,
        h = 100,
        s = 50,
        l = 50;

    console.log(this.ship.geometry.faceVertexUvs[0]);

    this.baseColor = 'hsl('+h+', '+s+'%, '+l+'% )',
    this.lightenColor = 'hsl('+h+', '+s+'%, '+((l+10) > 100 ? 100 : (l+10))+'% )',
    this.darkenColor = 'hsl('+h+', '+s+'%, '+((l-10) < 0 ? 0: (l-10))+'% )';

    //put base color

    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = this.baseColor;
    ctx.fill();

    /*
        nail
    */
    //this.platingNail(102, 102, 1);

    /*
        hatch
    */
    //this.platingHatch(150, 50, 15, 1);

    this.context.lineWidth = 1;
    this.context.strokeStyle = this.darkenColor;

    for (var i = 0, fuvLen = this.ship.geometry.faceVertexUvs.length; i < fuvLen; i++) {
        for (var j = 0, uvLen = this.ship.geometry.faceVertexUvs[i].length; j < uvLen; j++) {
            var a = this.ship.geometry.faceVertexUvs[i][j][0],
                b = this.ship.geometry.faceVertexUvs[i][j][1],
                c = this.ship.geometry.faceVertexUvs[i][j][2];

            ctx.beginPath();
            ctx.moveTo(a.x*500, a.y*500);
            ctx.lineTo(b.x*500, b.y*500);
            ctx.lineTo(c.x*500, c.y*500);
            ctx.lineTo(a.x*500, a.y*500);
            ctx.stroke();
        };
    };

}

TextureGenerator.prototype.platingNail = function(nailX, nailY, nailRadius) {
    this.context.beginPath();
    this.context.arc(nailX + 0.5, nailY + 0.5, nailRadius, 0, 2 * Math.PI, false);
    this.context.lineWidth = 1;
    this.context.strokeStyle = this.lightenColor;
    this.context.stroke();

    this.context.beginPath();
    this.context.arc(nailX, nailY, nailRadius, 0, 2 * Math.PI, false);
    this.context.lineWidth = 1;
    this.context.strokeStyle = this.darkenColor;
    this.context.stroke();
    this.context.fillStyle = this.darkenColor;
    this.context.fill();
};

TextureGenerator.prototype.platingHatch = function(hatchX, hatchY, hatchSize, hatchHeight) {
    this.context.beginPath();
    this.context.arc(hatchX + hatchHeight, hatchY + hatchHeight, hatchSize, 0, 2 * Math.PI, false);
    this.context.lineWidth = 1;
    this.context.strokeStyle = this.lightenColor;
    this.context.stroke();

    this.context.beginPath();
    this.context.arc(hatchX, hatchY, hatchSize, 0, 2 * Math.PI, false);
    this.context.lineWidth = 1;
    this.context.strokeStyle = this.darkenColor;
    this.context.stroke();
    this.context.fillStyle = this.baseColor;
    this.context.fill();

    this.platingNail(hatchX - 2, hatchY + (hatchSize * 3 / 4), 0.5);
    this.platingNail(hatchX, hatchY + (hatchSize * 3 / 4), 0.5);
    this.platingNail(hatchX + 2, hatchY + (hatchSize * 3 / 4), 0.5);
};
