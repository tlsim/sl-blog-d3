define([
    'd3'
], function () {
    return function (oldScale, newScale) {
        var oldDomain = oldScale.domain(),
            newDomain = newScale.domain(),
            scale = (oldDomain[1] - oldDomain[0]) / (newDomain[1] - newDomain[0]),
            translate = scale * (oldScale.range()[1] - oldScale(newDomain[1]));

        return {
            translate: translate,
            scale: scale
        };
    };
});