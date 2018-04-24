d3 = require('d3');

function makeGraph() {
    d3.select("#graph").selectAll('svg').remove();

    this.svg = d3.select("#graph").append('svg')
        .attr("width", "410px")
        .attr("height", "410px")
        //debug
        // .attr("width", this.width + this.margin.left + this.margin.right)
        // .attr("height", this.height + this.margin.top + this.margin.bottom + (parseInt(this.fontSize.replace('px', '')) * 2 + 5))
        .append("g");

    // filters go in defs element
    var defs = this.svg.append("defs");

    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    this.filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    this.filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 3)
        .attr("result", "blur");

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    this.filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 0)
        .attr("dy", 0)
        .attr("result", "offsetBlur");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    var feMerge = this.filter.append("feMerge");

    feMerge.append("feMergeNode")
        .attr("in", "offsetBlur");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

    var data = [];

    this.svg.append('rect')
        .attr("id", "graph")
        .attr("width", "400px")
        .attr("height", "400px")
        .style("fill", "#d8d9d9")
        .style("filter", "url(#drop-shadow)");
}