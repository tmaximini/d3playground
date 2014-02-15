// twitter

// d3 playground
// barchart tutorial

console.log(window.d3);


var body = d3.select("body");



d3.json("tweets.json", function(error, data) {

  console.log(data, error);

  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.time.scale()
            .domain([new Date(data[0].created_at), d3.time.day.offset(new Date(data[data.length - 1].created_at), 1)])
            .rangeRound([0, width - margin.left - margin.right]);

  var y = d3.scale.linear()
      .range([height, 0]);


  var chart = d3.select(".svg-chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10, "%");


  x.domain(data.map(function(d) { console.log(d.name); return d.name; }));
  y.domain([0, d3.max(data, function(d) { console.log(d.value); return d.value; })]);

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Frequency");

  chart.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .attr("width", x.rangeBand());

});

