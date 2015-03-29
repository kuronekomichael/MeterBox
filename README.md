 MeterBox
=================

[![NPM version][npm-badge]](http://badge.fury.io/js/meterbox)
[npm-badge]: https://badge.fury.io/js/meterbox.png

[multimeter](https://github.com/substack/node-multimeter) wrapper

![](./meterbox.gif)

## Install

```
npm install meterbox
```

## Feature

- Limited concurrent execution (default only single job)
- Unlimited job (`emit.setMaxListeners` as you think proper)

## Example

```
var MeterBox = require('meterbox');

var meterBox = new MeterBox({
    name: 'my progress',
    multijob: 3, //同時実行数
    barWidth: 70
});

var uploads = [
    {fromPath:'File A', toPath:'/newDir1', speed:5 },
    {fromPath:'File B', toPath:'/newDir1', speed:10 },
    {fromPath:'File C', toPath:'/newDir1', speed:15 },
    {fromPath:'File D', toPath:'/newDir2', speed:20 },
    {fromPath:'File E', toPath:'/newDir3', speed:10 },
    {fromPath:'File F', toPath:'/newDir3', speed:15 },
    {fromPath:'File G', toPath:'/newDir3', speed:20 },
    {fromPath:'File H', toPath:'/newDir4', speed:25 },
    {fromPath:'File I', toPath:'/newDir4', speed:12 }
];

var count = 0;
uploads.forEach(function(data) {
    data.percent = 0;
    data.label = '[' + count++ + '] ' + data.fromPath;
    data.label = data.label.substring(0, 50);

    meterBox.add(data, function(meter, done) {
        var iv = setInterval(function () {
            data.percent += data.speed;
            if (100 < data.percent) {
                data.percent = 100;
            }
            meter.percent(data.percent, data.percent + '％');
            if (data.percent === 100) {
                clearInterval(iv);
                done();
            }
        }, 100);
    });
});

meterBox.run();
```
