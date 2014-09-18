define([
    'd3',
    'components/sl',
    'MockData',
    'utils/tickWidth',
    'moment',
    'components/ohlcSeries',
    'examples/zoomChart'
], function (d3, sl, MockData, tickWidth, moment) {
    'use strict';

    var mockData = new MockData(0, 0.1, 100, 50, function (moment) {
        return !(moment.day() === 0 || moment.day() === 6);
    });

    var fromDate = new Date(2013, 8, 1),
        toDate = new Date(2014, 8, 1);

    var data = mockData.generateOHLC(fromDate, toDate);

    var xScale = d3.time.scale(),
        yScale = d3.scale.linear();

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    var series = sl.series.ohlc()
        .xScale(xScale)
        .yScale(yScale);

    var zoom = d3.behavior.zoom()
        .x(xScale)
        .scaleExtent([0.5, 50])
        .on('zoom', zoomed)
        .on('zoomend', zoomend);

    var zoomChart = sl.example.zoomChart(zoom, data, series, xScale, yScale, xAxis, yAxis, fromDate, toDate);
    zoomChart();

    function zoomed() {
        var xDomain = xScale.domain();
        var range = moment().range(xDomain[0], xDomain[1]);
        var filteredData = [];
        var g = d3.selectAll('svg').select('g');

        for (var i = 0; i < data.length; i += 1) {
            if (range.contains(data[i].date)) {
                filteredData.push(data[i]);
            }
        }
        yScale.domain(
            [
                d3.min(filteredData, function (d) {
                    return d.low;
                }),
                d3.max(filteredData, function (d) {
                    return d.high;
                })
            ]
        );

        g.select('.x.axis')
            .call(xAxis);

        g.select('.y.axis')
            .call(yAxis);

        series.tickWidth(tickWidth(xScale, xDomain[0], xDomain[1]));

        g.select('.series')
            .call(series);
    }

    function zoomend() {
    }

});
