define([
    'd3',
    'components/sl',
    'MockData',
    'components/candlestickSeries'
], function (d3, sl, MockData) {
    'use strict';

    var mockData = new MockData(0.1, 0.1, 100, 50, function (moment) {
        return !(moment.day() === 0 || moment.day() === 6);
    });

    var data = mockData.generateOHLC(new Date(2014, 6, 1), new Date(2014, 8, 1));

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 660 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var xScale = d3.time.scale(),
        yScale = d3.scale.linear();

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    var series = sl.series.candlestick()
        .xScale(xScale)
        .yScale(yScale);

    // Create svg element
    var svg = d3.select('#chart').classed('chart', true).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    // Ceate chart
    var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var plotArea = g.append('g');
    plotArea.append('clipPath')
        .attr('id', 'plotAreaClip')
        .append('rect')
        .attr({ width: width, height: height });
    plotArea.attr('clip-path', 'url(#plotAreaClip)');

    // Set scale domains
    var maxDate = d3.max(data, function (d) {
        return d.date;
    });

    xScale.domain([
        new Date(maxDate.getTime() - (8.64e7 * 31.5)),
        new Date(maxDate.getTime() + 8.64e7)
    ]);

    yScale.domain(
        [
            d3.min(data, function (d) {
                return d.low;
            }),
            d3.max(data, function (d) {
                return d.high;
            })
        ]
    ).nice();

    // Set scale ranges
    xScale.range([0, width]);
    yScale.range([height, 0]);

    // Draw axes
    g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    g.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // Draw series.
    plotArea.append('g')
        .attr('class', 'series')
        .datum(data)
        .call(series);
});