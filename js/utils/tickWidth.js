define([
    'moment',
    'moment-range'
], function (moment) {
    'use strict';

    var countDays = function (range) {
        return range / (1000 * 60 * 60 * 24);
    };

    return function calculateTickWidth(scale, fromDate, toDate) {
        var scaleRange = scale.range(),
            dayRange = moment().range(fromDate, toDate);
        return (scaleRange[1] - scaleRange[0]) / (countDays(dayRange) * 2.5);
    };
});