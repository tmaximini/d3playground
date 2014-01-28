
var width, height, radius, outerArc, textArc, segments, innerRadius;

var onlySegmentsWithSymptoms = false;

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

function toggleRenderMode () {
  onlySegmentsWithSymptoms = !onlySegmentsWithSymptoms;
  makePie();
  setTimeout(drawCircles, 200);
}


function makePie () {

  //$('.svg-chart').empty();

  width = $(window).width() - 50;
  height = $(window).height() - 100;
  radius = Math.min(width, height) / 2;
  innerRadius = radius - 20;

  var color = d3.scale.category20c();

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

  var renderData = [];

  d3.json('data/viewSegments.json', function(error, data) {

    segments = data;
    var segmentsWithSymptomsCount = 0;

    var usedSegments = [];

    d3.json('data/relevances.json', function (relevances) {

      relevances.forEach(function (r) {
        usedSegments = relevances.map(function (r) { return r.segment_id });
      });

      usedSegments = jQuery.unique(usedSegments);

      segments.forEach(function(d, i) {

        if (onlySegmentsWithSymptoms) {

          if (usedSegments.indexOf(d.key) !== -1) {

            d.angleWidth = (2 * Math.PI) / usedSegments.length;

            // correct startAngles
            d.startAngle = segmentsWithSymptomsCount * d.angleWidth;

            // get pie value
            d.value = 1;
            d.endValue = (2 * Math.PI) / d.angleWidth * 100;

            // get the middle angle of the segment
            d.middleAngle = d.startAngle + d.angleWidth / 2;

            // get a centered point inside the segment

            d.center = {
              x: getX(radius / 2, d.middleAngle),
              y: getY(radius / 2, d.middleAngle)
            };

            renderData.push(d);

            segObj[d.key] = d;

            segmentsWithSymptomsCount++;

          } else {
            d.angleWidth = 0;
            d.middleAngle = 0;
            d.value = 0;
          }

        }
        else {

          // correct startAngles
          d.startAngle = i * d.angleWidth;

          // get pie value
          d.value = 1;
          d.endValue = (2 * Math.PI) / d.angleWidth * 100;

          // get the middle angle of the segment
          d.middleAngle = d.startAngle + d.angleWidth / 2;
          // get a centered point inside the segment

          d.center = {
            x: getX(radius / 2, d.middleAngle),
            y: getY(radius / 2, d.middleAngle)
          };

          renderData.push(d);

        }



        segObj[d.key] = d;

        // todo: check which relevances belong to which data / segment and attach them

      });


      var g = svg.selectAll('.arc')
          .data(pie(renderData))
        .enter().append('g')
          .attr('class', 'arc');


      var texts = svg.selectAll('.text-arc')
          .data(pie(renderData))
        .enter().append('g')
          .attr('class', 'text-arc');


      g.append('path')
        .attr('d', outerArc)
        .each(function(d) { this._current = d; })
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
        .attr('dy', '15')
        .style('fill', '#000')
        .style('font-size', radius > 250 ? '12px' : '10px')
        .style('font-weight', '100')
        .attr('text-rendering', 'geometricPrecision')
        .attr('alignment-baseline', 'middle')
        .attr('dominant-baseline', 'middle');


      text.append('textPath')
        .attr('stroke','black')
        .attr('text-anchor', 'middle')
        .attr('startOffset', '25%')
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
        .gravity(0.0001)
        .charge(-75)
        .nodes(relevances)
        .size([Math.min(width, height), Math.min(width, height)])
        .on("tick", tick)
        .start();



    var svg = d3.select('#mainGroup');

    var radiate = function (pos, element) {
      d3.range(3).forEach(function (d) {
        element.append('circle')
          .attr( {
            cx: pos[0],
            cy: pos[1],
            r: 0
          } )
          .style('opacity', '1')
          .style('fill', 'none')
          .style('stroke', 'red')
          .style('stroke-width', '2px')
          .transition()
          .duration(1000)
          .delay(d * 50)
            .attr('r', 50)
            .style('opacity', '0.00001')
            .remove()
      });
    };

    var nodes = svg.selectAll(".node")
        .data(relevances)
      .enter().append("g")
        //.attr('transform', 'translate( ' + -radius/2 + ', ' + -radius/2 + ')')
        .attr("class", "node");

    var circles = nodes.append('circle')
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", radius * 0.025)
        .on('click', function () { radiate(d3.mouse(this), d3.select(this.parentNode)); })
        .style("fill", function(d, i) { return fill(i & 3); })
        .style("stroke", function(d, i) { return d3.rgb(fill(i & 3)).darker(2); })
        .call(force.drag)
        .on("mousedown", function() { d3.event.stopPropagation(); });

    var texts = nodes.append('text')
        .attr('dy', '15')
        .attr('x', '75')
        .style('font-size', radius > 250 ? '12px' : '10px')
        .style('fill', '#000')
        .style('text-anchor', 'start')
        .text(function (d) { return d.key });


    /*
    svg.style("opacity", 1e-6)
      .transition()
        .duration(1000)
        .style("opacity", 1);
    */

    var safety = 0;
    while (force.alpha() > 0.05) { // You'll want to try out different, "small" values for this
        force.tick();
        if(safety++ > 500) {
          break;// Avoids infinite looping in case this solution was a bad idea
        }
    }

    function tick(e) {

      var k = e.alpha * .1;

      var circleX = [];
      var circleY = [];


      relevances.forEach(function(node, i) {
        var center = segObj[node.segment_id].center;
        node.x += (center.x - node.x) * k;
        node.y += (center.y - node.y) * k;
      });

      var q = d3.geom.quadtree(relevances),
          i = 0,
          n = nodes.length;
      while (++i < n) {
        q.visit(collide(relevances[i]));
      }

      // update circle positions and remember them
      circles.attr("cx", function(d, i) {
          circleX[i] = d.x;
         return circleX[i];
        })
        .attr("cy", function(d, i) {
          circleY[i] = d.y;
          return circleY[i]
        });

      // update text positions as well
      texts.attr("x", function(d, i) { return circleX[i] + radius * 0.0275; })
          .attr("dy", function(d, i) { return circleY[i] + radius * 0.0135; });
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

