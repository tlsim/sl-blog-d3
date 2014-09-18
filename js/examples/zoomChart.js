define([
    'd3',
    'utils/tickWidth',
    'components/sl'
], function (d3, tickWidth, sl) {
    'use strict';

    sl.example.zoomChart = function (zoom, data, series, xScale, yScale, xAxis, yAxis, fromDate, toDate) {

        var initialScale = d3.scale.linear();
        var zoomMethod = 'redraw';

        var translate = 0,
            scale = 1;

        var zoomChart = function () {
            var margin = {top: 20, right: 20, bottom: 30, left: 50},
                width = 800 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            // Create svg element
            var svg = d3.select('#chart').classed('chart', true).append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);

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

            // Create zoom pane
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

            // Reset zoom.
            zoom.x(xScale);

            series.tickWidth(tickWidth(xScale, fromDate, toDate));

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

            // Return initial scale.
            initialScale = yScale.copy();
        };

        zoomChart.initialScale = function () {
            return initialScale;
        };

        zoomChart.cssTransform = function () {
            var g = d3.selectAll('svg').select('g');

            //translate += ((Math.random() * 2) - 1) * 50;
            // scale += ((Math.random() * 2) - 1) / 20;

            g.select('.series')
                .datum(data)
                .attr('transform', 'translate(' + translate + ',0) scale(' + scale + ',1)');
        };

        zoomChart.redraw = function () {
            var xDomain;
            var g = d3.selectAll('svg').select('g');

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

            xDomain = xScale.domain();
            series.tickWidth(tickWidth(xScale, xDomain[0], xDomain[1]));
            initialScale = yScale.copy();

            g.select('.x.axis')
                .call(xAxis);

            g.select('.y.axis')
                .call(yAxis);

            g.selectAll('.series')
                .datum(data)
                .call(series);
        };

        zoomChart.data = function (value) {
            if (!arguments.length) {
                return data;
            }
            data = value;
            return zoomChart;
        };

        zoomChart.zoomMethod = function (value) {
            if (!arguments.length) {
                return data;
            }
            zoomMethod = value;
            return zoomMethod;
        };

        zoomChart.zoom = function () {
            switch(zoomMethod) {
                case "redraw":
                    zoomChart.redraw();
                    break;
                case "cssTransform": {
                    zoomChart.cssTransform();
                    break;
                }
            }
        };

        zoomChart.resetTransform = function () {
            translate = 0;
            scale = 1;
        };

        return zoomChart;
    };
});