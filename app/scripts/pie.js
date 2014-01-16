
function makePie () {

  $(".svg-chart").empty();

  var width = $(window).width() - 50,
      height = $(window).height() < 500 ? $(window).height() : 500,
      radius = Math.min(width, height) / 2;



  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });

  var svg = d3.select(".svg-chart")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  d3.json("data.json", function(error, data) {

    data.forEach(function(d) {
      d.value = 100 / data.length;
    });

    var g = svg.selectAll(".arc")
        .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.name); });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.name; });

  });
}

var resizer;

$(function () {

  makePie();
  $(window).resize(function() {
    clearTimeout(resizer);
    resizer = setTimeout(function () {
      console.log('finished resize');
      return makePie();
    }, 500);
  });
});

