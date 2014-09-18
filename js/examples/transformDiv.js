define([
    'd3',
    'components/sl',
    'MockData',
    'utils/tickWidth',
    'moment',
    'moment-range',
    'components/ohlcBarSeries'
], function (d3, sl, MockData, tickWidth, moment) {
    'use strict';

    var mockData = new MockData(0, 0.1, 100, 50, function (moment) {
        return !(moment.day() === 0 || moment.day() === 6);
    });

    var fromDate = new Date(2012, 8, 1),
        toDate = new Date(2014, 8, 1);

    var data = mockData.generateOHLC(fromDate, toDate);

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var xScale = d3.time.scale(),
        yScale = d3.scale.linear();

    var oldScale;

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    var series = sl.series.ohlcBar()
        .xScale(xScale)
        .yScale(yScale)
        .tickWidth(tickWidth(xScale, fromDate, toDate));

    var zoom = d3.behavior.zoom()
        .x(xScale)
        .scaleExtent([0.5, 500])
        .on('zoom', zoomed)
        .on('zoomend', zoomend);


    function zoomed() {

        var yTransformTranslate = 0,
            yTransformScale,
            xTransformTranslate = d3.event.translate[0],
            xTransformScale = d3.event.scale;

        var xDomain = xScale.domain();
        var range = moment().range(xDomain[0], xDomain[1]);
        var rangeData = [];

        var oldDomain = oldScale.domain();

        var g = d3.selectAll('svg').select('g');
        var seriesDiv = d3.selectAll('#series-container');
        var transform;

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

        g.select('.x.axis')
            .call(xAxis);

        g.select('.y.axis')
            .call(yAxis);

        yTransformScale = (oldDomain[1] - oldDomain[0]) / (yScale.domain()[1] - yScale.domain()[0]);

        if (yScale.domain()[1] !== oldDomain[1]) {
            yTransformTranslate = oldScale(oldDomain[1]) - oldScale(yScale.domain()[1]) ;
            yTransformTranslate *= yTransformScale;
        }

        seriesDiv = document.getElementById('series-container');

        transform = 'translate3d(' + xTransformTranslate + 'px,' + yTransformTranslate  + 'px, 0px) scale3d(' + xTransformScale + ',' + yTransformScale + ', 1)';
        seriesDiv.style.webkitTransform = transform;
        seriesDiv.style.webkitTransformOrigin = "0 0";
        seriesDiv.style.MozTransform = transform;
        seriesDiv.style.MozTransformOrigin = "0 0";

    }

    function zoomend() {
        var xDomain = xScale.domain();
        var seriesDiv = d3.select('#series-container');
        var nullTransform =  'translate3d(0,0,0) scale3d(1,1,1)';

        oldScale = yScale.copy();

        zoom.x(xScale);
        series.tickWidth(tickWidth(xScale, xDomain[0], xDomain[1]));

        seriesDiv.select('.series')
            .call(series);

        seriesDiv = document.getElementById('series-container');
        seriesDiv.style.webkitTransform = nullTransform;
        seriesDiv.style.MozTransform = nullTransform;

    }

    // Create svg element

    var clipDiv = d3.select('#chart').classed('chart', true).append('div')
        .attr('id', 'series-clip')
        .style('position', 'absolute')
        .style('overflow', 'hidden')
        .style('top', margin.top + 'px')
        .style('left', margin.left + 'px');


    var seriesDiv = clipDiv.append('div')
        .attr('id', 'series-container');

    var svg = d3.select('#chart').append('svg')
        .style('position', 'absolute')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    var seriesSvg = seriesDiv.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Ceate chart
    var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Create plot area
    var plotArea = g.append('g');
    plotArea.append('clipPath')
        .attr('id', 'plotAreaClip')
        .append('rect')
        .attr({ width: width, height: height });
    plotArea.attr('clip-path', 'url(#plotAreaClip)');

    plotArea.append('rect')
        .attr('class', 'zoom-pane')
        .attr('width', width)
        .attr('height', height)
        .call(zoom);

    // Set scale domains
    xScale.domain(d3.extent(data, function (d) {
        return d.date;
    }));

    yScale.domain(
        [
            d3.min(data, function (d) {
                return d.low;
            }),
            d3.max(data, function (d) {
                return d.high;
            })
        ]
    );

    // Set scale ranges
    xScale.range([0, width]);
    yScale.range([height, 0]);

    zoom.x(xScale);
    oldScale = yScale.copy();

    // Draw axes
    g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    g.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // Draw series.
    seriesSvg.append('g')
        .attr('class', 'series')
        .datum(data)
        .call(series);
});
