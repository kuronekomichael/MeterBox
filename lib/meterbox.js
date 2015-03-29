var multimeter = require('multimeter');
var eaw = require('eastasianwidth');

var MeterBox = function(param) {
    // default
    this.name = 'Progress';
    this.multijob = 1;
    this.barWidth = 20;
    this.endMessage = 'All done.';

    this.maxLength = 0;
    this.SPACE = ' \n';
    this.consoleY = 0;
    this.currentJobNo = 0;

    this.multi = multimeter(process);
    this.multi.on('^C', process.exit);
    this.multi.charm.reset();
    this.multi.write(this.name + ':\n\n');
    this.consoleY++;// \n
    this.consoleY++;// \n

    this.bars = [];

    for (var key in param) {
        this[key] = param[key];
    }
};

MeterBox.STATUS_STOP = 0;
MeterBox.STATUS_RUNNING = 1;
MeterBox.STATUS_FINISHED = 2;

MeterBox.prototype.add = function(data, cb) {
    var that = this;

    this.bars.push({
        data: data,
        meter: null,
        percent: 0,
        status: MeterBox.STATUS_STOP,  // 0 = stop, 1 = running, 2 = finished
        onStarted: cb,
        deltas: 5 + Math.random() * 9
    });

    if (that.bars.length > 10) {
        that.multi.charm.setMaxListeners(that.bars.length);
    }
};

MeterBox.prototype.run = function() {
    var that = this;

    // get max length of title
    that.maxLength = this.bars.reduce(function(prev, bar) {
        var label = bar.data.label + that.SPACE;
        var length = eaw.length(label);
        if (prev < length) {
            return length;
        } else {
            return prev;
        }
    }, 0);

    for (var i = 0; i < that.multijob; i++) {
        that.runNextMeter();
    }
};

MeterBox.prototype.runNextMeter = function() {
    var that = this;
    if (that.bars.length === that.currentJobNo) {
        // no more jobs
        return;
    }

    var bar = that.bars[that.currentJobNo];
    bar.status = MeterBox.STATUS_RUNNING;

    that.multi.write(bar.data.label + that.SPACE);
    bar.meter = that.multi(that.maxLength, ++that.consoleY, {width: that.barWidth});

    bar.onStarted(bar.meter, function() {
        bar.status = MeterBox.STATUS_FINISHED;
        that.runNextMeter();
        if (that.bars.every(function(bar) { return bar.status === MeterBox.STATUS_FINISHED })) {
            that.multi.write('\n' + that.endMessage + '\n');
            that.multi.destroy();
        }
    });
    that.currentJobNo++;
};

module.exports = MeterBox;
