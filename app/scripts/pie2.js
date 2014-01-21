
var width, height, radius, outerArc, textArc, segments;

function getRandomInt (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function makePie () {

  $('.svg-chart').empty();

  width = $(window).width() - 50;
  height = $(window).height() < 500 ? $(window).height() : 500;
  radius = Math.min(width, height) / 2;



  var color = d3.scale.category10();

  /*
  var color = function (color) {
    var nr = +color;
    return '#' + nr.toString(16);
  }
   */

  outerArc = d3.svg.arc()
      .outerRadius(radius-20)
      .innerRadius(30);

  textArc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius-20);

  var middle = d3.select('.svg-chart')
      .append('circle')
      .attr('r', 15)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('fill', '#fff');

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });


  var getX = function (r, angle) {
    return Math.sin(angle) * r;
  };

  var getY = function (r, angle) {
    return -Math.cos(angle) * r;
  };

  var svg = d3.select('.svg-chart')
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  d3.json('data/viewSegments.json', function(error, data) {

    segments = data;

    d3.json('data/relevances.json', function (relevances) {

      data.forEach(function(d, i) {
        d.value = (2 * Math.PI) / d.angleWidth * 100;

        // todo: check which relevances belong to which data / segment and attach them

      });

      var bubble = d3.layout.pack()
          .sort(null)
          .size([50, 50])
          .padding(1.5);


      var g = svg.selectAll('.arc')
          .data(pie(data))
        .enter().append('g')
          .attr('class', 'arc');


      var texts = svg.selectAll('.text-arc')
          .data(pie(data))
        .enter().append('g')
          .attr('class', 'text-arc');


      g.append('path')
        .attr('d', outerArc)
        .attr('id', function (d) {
          return d.data.key;
        })
        .on('click', function(d) { console.log('clicked on segment ' + d.data.key); })
        .style('fill', function(d) { return color(d.data.name); });

      texts.append('path')
        .attr('id', function (d, i) { return 'path' + i.toString() } )
        .attr('d', textArc)
        .style('fill', function(d) { return color(d.data.name); })
        .style('stroke', '#fff');

      var text = texts.append('text')
        .attr('dy', '15')
        .attr('x', '75')
        .style('fill', '#000');



      text.append('textPath')
        .attr('stroke','black')
        .style('font-size', '10px')
        .style('font-weight', '100')
        .style("text-anchor", "middle")
        .text(function(d) {
          var parentData = d3.select(this.parentNode).datum();
          return parentData.data.name;
        })
        .attr('xlink:href', function (d, i) { return '#path' + i.toString() });


    });

  });
}


function drawCircles () {


  d3.json('data/relevances.json', function (relevances) {

    var fill = d3.scale.category10();

    var force = d3.layout.force()
        .nodes(relevances)
        .size([width, height])
        .on("tick", tick)
        .start();

    var svg = d3.select('.svg-chart');

    var node = svg.selectAll(".node")
        .data(relevances)
      .enter().append("circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", 8)
        .style("fill", function(d, i) { return fill(i & 3); })
        .style("stroke", function(d, i) { return d3.rgb(fill(i & 3)).darker(2); })
        .call(force.drag)
        .on("mousedown", function() { d3.event.stopPropagation(); });

    svg.style("opacity", 1e-6)
      .transition()
        .duration(1000)
        .style("opacity", 1);

    //d3.select("body")
    //    .on("mousedown", mousedown);

    function tick(e) {

      var k = 6 * e.alpha;

      relevances.forEach(function(o, i) {


      if (o.segment_id === segments[i].key) {
        o.y += i & 1 ? k : -k;
        o.x += i & 2 ? k : -k;
      }


      });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

  });

}

var resizer;

$(function () {
  makePie();
  drawCircles();
  $(window).resize(function() {
    clearTimeout(resizer);
    resizer = setTimeout(function () {
      console.log('finished resize');
      makePie();
      drawCircles();
    }, 500);
  });
});

