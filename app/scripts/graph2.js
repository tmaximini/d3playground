d3.select('.svg-chart').remove();

var n = 40,
    random = d3.random.normal(0, .2);

function chart(domain, interpolation, tick) {
  var data = d3.range(n).map(random);

  var margin = {top: 6, right: 0, bottom: 6, left: 40},
      width = 960 - margin.right,
      height = 120 - margin.top - margin.bottom;

  var x = d3.scale.linear()
      .domain(domain)
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([-1, 1])
      .range([height, 0]);

  var line = d3.svg.line()
      .interpolate(interpolation)
      .x(function(d, i) { return x(i); })
      .y(function(d, i) { return y(d); });

  var svg = d3.select("body").append("p").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("margin-left", -margin.left + "px")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  svg.append("g")
      .attr("class", "y axis")
      .call(d3.svg.axis().scale(y).ticks(5).orient("left"));

  var path = svg.append("g")
      .attr("clip-path", "url(#clip)")
    .append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", line);

  tick(path, line, data, x);
}

chart([0, n - 1], "linear", function tick(path, line, data, x) {

  // push a new data point onto the back
  data.push(random());

  // redraw the line, and then slide it to the left
  path
      .attr("d", line)
      .attr("transform", null)
    .transition()
      .duration(750)
      .ease("linear")
      .attr("transform", "translate(" + x(-1) + ")")
      .each("end", function() { tick(path, line, data, x); });

  // pop the old data point off the front
  data.shift();

});
 /*

chart([1, n - 2], "basis", function tick(path, line, data, x) {

  // push a new data point onto the back
  data.push(random());

  // redraw the line, and then slide it to the left
  path
      .attr("d", line)
      .attr("transform", null)
    .transition()
      .duration(750)
      .ease("linear")
      .attr("transform", "translate(" + x(0) + ")")
      .each("end", function() { tick(path, line, data, x); });

  // pop the old data point off the front
  data.shift();

});




chart([0, n - 1], "linear", function tick(path, line, data) {

  // push a new data point onto the back
  data.push(random());

  // pop the old data point off the front
  data.shift();

  // transition the line
  path.transition()
      .duration(750)
      .ease("linear")
      .attr("d", line)
      .each("end", function() { tick(path, line, data); });
});



  */