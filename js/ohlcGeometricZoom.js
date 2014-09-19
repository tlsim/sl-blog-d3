define([
    'd3',
    'components/sl',
    'MockData',
    'utils/tickWidth',
    'moment',
    'moment-range',
    'components/ohlcBarSeries',
    'modernizr',
    'zoomChart'
], function (d3, sl, MockData, tickWidth, moment) {
    'use strict';

    var hasVectorEffect = Modernizr.testProp('vectorEffect');

    var mockData = new MockData(0, 0.1, 100, 50, function (moment) {
        return !(moment.day() === 0 || moment.day() === 6);
    });

    var fromDate = new Date(2008, 8, 1),
        toDate = new Date(2014, 8, 1);

    var data = mockData.generateOHLC(fromDate, toDate);

    var xScale = d3.time.scale(),
        yScale = d3.scale.linear(),
        initialScale;

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    var series = sl.series.ohlcBar()
        .xScale(xScale)
        .yScale(yScale);

    var zoom = d3.behavior.zoom()
        .x(xScale)
        .scaleExtent([0.5, 500])
        .on('zoom', zoomed)
        .on('zoomend', zoomend);


    var zoomChart = sl.example.zoomChart(zoom, data, series, xScale, yScale, xAxis, yAxis, fromDate, toDate);
    zoomChart();

    initialScale = zoomChart.initialScale();

    function zoomed() {

        var yDomain,
            xDomain = xScale.domain(),
            initialDomain = initialScale.domain();

        var yTransformTranslate = 0,
            yTransformScale,
            xTransformTranslate = d3.event.translate[0],
            xTransformScale = d3.event.scale;

        var range = moment().range(xDomain[0], xDomain[1]);
        var rangeData = [];
        var g = d3.selectAll('svg').select('g');

        for (var i = 0; i < data.length; i += 1) {
            if (range.contains(data[i].date)) {
                rangeData.push(data[i]);
            }
        }

        yScale.domain(
            [
                d3.min(rangeData, function (d) {
                    return d.low;
                }),
                d3.max(rangeData, function (d) {
                    return d.high;
                })
            ]
        );

        yDomain = yScale.domain();

        g.select('.x.axis')
            .call(xAxis);

        g.select('.y.axis')
            .call(yAxis);

        yTransformScale = (initialDomain[1] - initialDomain[0]) / (yDomain[1] - yDomain[0]);

        if (yDomain[1] !== initialDomain[1]) {
            yTransformTranslate = initialScale.range()[1] - initialScale(yDomain[1]);
            yTransformTranslate *= yTransformScale; // To screen pixel space.
        }

        g.select('.series')
            .attr('transform', 'translate(' + xTransformTranslate + ',' + yTransformTranslate + ')' +
                ' scale(' + xTransformScale + ',' + yTransformScale + ')');

    }

    function zoomend() {
        var g, xDomain;

        if (!hasVectorEffect) {
            g = d3.selectAll('svg').select('g');
            xDomain = xScale.domain();

            initialScale = yScale.copy();

            zoom.x(xScale);
            series.tickWidth(tickWidth(xScale, xDomain[0], xDomain[1]));

            g.select('.x.axis')
                .call(xAxis);

            g.select('.y.axis')
                .call(yAxis);

            g.selectAll('.series')
                .datum(data);

            g.select('.series')
                .call(series);

            g.select('.series')
                .attr('transform', 'translate(0,0) scale(1)');
        }
    }

});
