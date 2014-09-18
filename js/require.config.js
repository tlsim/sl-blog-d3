/* jshint unused:false */
/* global require: true */

var require = {
    baseUrl: '/js',
    paths: {
        'd3': 'lib/d3',
        'jstat': 'lib/jstat',
        'moment': 'lib/moment',
        'moment-range': 'lib/moment-range',
        'modernizr': 'lib/modernizr'
    },
    shim: {
        'modernizr': {
            exports: 'Modernizr'
        }
    }
};