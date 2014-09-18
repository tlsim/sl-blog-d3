define ([
    'd3',
    'components/sl',
    'components/ohlcBar'
], function (d3, sl) {
    'use strict';

    sl.series.ohlcBar = function () {

        var xScale = d3.time.scale(),
            yScale = d3.scale.linear();

        var tickWidth = 5;

        var isUpDay = function(d) {
            return d.close > d.open;
        };
        var isDownDay = function (d) {
            return !isUpDay(d);
        };

        var ohlcBar = sl.svg.ohlcBar()
            .open(function (d) {
                return yScale(d.open);
            })
            .high(function (d) {
                return yScale(d.high);
            })
            .low(function (d) {
                return yScale(d.low);
            })
            .close(function (d) {
                return yScale(d.close);
            })
            .date(function (d) {
                return xScale(d.date);
            });

        var ohlc = function (selection) {
            var series, bars;

            selection.each(function (data) {
                series = d3.select(this).selectAll('.ohlc-series').data([data]);

                series.enter().append('g')
                    .classed('ohlc-series', true);

                bars = series.selectAll('.bar')
                    .data(data, function (d) {
                        return d.date;
                    });

                bars.enter()
                    .append('path')
                    .classed('bar', true);

                bars.classed({
                    'up-day': isUpDay,
                    'down-day': isDownDay
                });

                ohlcBar.tickWidth(tickWidth);

                bars.attr('d', function (d) {
                    return ohlcBar(d);
                });

                bars.exit().remove();
                series.exit().remove();


            });
        };

        ohlc.xScale = function (value) {
            if (!arguments.length) {
                return xScale;
            }
            xScale = value;
            return ohlc;
        };

        ohlc.yScale = function (value) {
            if (!arguments.length) {
                return yScale;
            }
            yScale = value;
            return ohlc;
        };

        ohlc.tickWidth = function (value) {
            if (!arguments.length) {
                return tickWidth;
            }
            tickWidth = value;
            return ohlc;
        };

        return ohlc;

    };
});
