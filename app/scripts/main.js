// d3 playground
// barchart tutorial

console.log(window.d3);

var data = [4, 8, 15, 16, 23, 42];

var body = d3.select("body");
var div = body.append("div");
div.html("Hello, world - herre comes the chart!");


d3.select("#chart")
  .selectAll("div")
    .data(data)
  .enter().append("div")
    .style("width", function(d) { return d * 10 + "px"; })
    .text(function(d) { return d; });

