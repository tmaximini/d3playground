
var width, height, radius, outerArc, textArc, segments, innerRadius;


var segObj = {};

function getRandomInt (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function getX (r, angle) {
  return Math.sin(angle) * r;
};

function getY (r, angle) {
  return -Math.cos(angle) * r;
};


function makePie () {

  $('.svg-chart').empty();

  width = $(window).width() - 50;
  height = $(window).height() < 500 ? $(window).height() : 500;
  radius = Math.min(width, height) / 2;
  innerRadius = radius - 20;



  var color = d3.scale.category10();

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

  var svg = d3.select('.svg-chart')
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .attr('id', 'mainGroup')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  d3.json('data/viewSegments.json', function(error, data) {

    segments = data;

    d3.json('data/relevances.json', function (relevances) {

      data.forEach(function(d, i) {
        d.value = (2 * Math.PI) / d.angleWidth * 100;

        d.startAngle = i * d.angleWidth;

        segObj[d.key] = d;

        // todo: check which relevances belong to which data / segment and attach them

      });


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

    relevances.forEach(function (r, i) {

      //segObj[r.segment_id].startAngle = i * segObj[r.segment_id].angleWidth;

      console.log(segObj);

      r.middleAngle = segObj[r.segment_id].startAngle + segObj[r.segment_id].angleWidth / 2;
      r.x = getX(radius - 50, r.middleAngle);
      r.y = getY(radius - 50, r.middleAngle);
      r.padX = 0;
      r.padY = 0;
      console.log(r)
    });

    var fill = d3.scale.category10();

    var force = d3.layout.force()
        .nodes(relevances)
        .size([Math.min(width, height), Math.min(width, height)])
        .on("tick", tick)
        .start();

    var svg = d3.select('#mainGroup');

    var nodes = svg.selectAll(".node")
        .data(relevances)
      .enter().append("g")
        //.attr('transform', 'translate( ' + -radius/2 + ', ' + -radius/2 + ')')
        .attr("class", "node");

    var circles = nodes.append('circle')
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", 8)
        .style("fill", function(d, i) { return fill(i & 3); })
        .style("stroke", function(d, i) { return d3.rgb(fill(i & 3)).darker(2); })
        .call(force.drag)
        .on("mousedown", function() { d3.event.stopPropagation(); });

    var texts = nodes.append('text')
        .attr('dy', '15')
        .attr('x', '75')
        .style('fill', '#000')
        .style('text-anchor', 'start')
        .text(function (d) { return d.key });

    svg.style("opacity", 1e-6)
      .transition()
        .duration(1000)
        .style("opacity", 1);

    //d3.select("body")
    //    .on("mousedown", mousedown);

    console.log(segObj);

    function tick(e) {

      var k = e.alpha;

      var circleX = [];
      var circleY = [];

      relevances.forEach(function(o, i) {
        o.padX += i & 1 ? k : -k;
        o.padY += i & 2 ? k : -k;
      });

      circles.attr("cx", function(d, i) {
          circleX[i] = getX(innerRadius * 0.75, d.middleAngle);
          circleX[i] += d.padX;
         return circleX[i];
        })
        .attr("cy", function(d, i) {
          circleY[i] = getY(innerRadius * 0.75, d.middleAngle);
          circleY[i] += d.padY;
          return circleY[i]
        });

      texts.attr("x", function(d, i) { return circleX[i] + 10; })
          .attr("dy", function(d, i) { return (circleY[i]) + 5; });
    }

  });

}

var resizer;

$(function () {
  makePie();
  setTimeout(drawCircles, 1000);
  $(window).resize(function() {
    clearTimeout(resizer);
    resizer = setTimeout(function () {
      console.log('finished resize');
      makePie();
      setTimeout(drawCircles, 1000);
    }, 500);
  });
});

