/**
 * [MersenneTwister description]
 * @param {[type]} seed [description]
 */
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
