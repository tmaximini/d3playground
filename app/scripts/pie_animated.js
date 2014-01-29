
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

      var arcTween = function (a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          return outerArc(i(t));
        };
      };


      var g = svg.selectAll('.arc')
          .data(pie(renderData))
        .enter().append('path')
          .attr('class', 'arc')
          .attr('d', outerArc)
          .each(function(d) { this._current = d; })
          .attr('id', function (d) {
            return d.data.key;
          })
          .on('click', function(d) { console.log('clicked on segment ' + d.data.key); })
          .style('fill', function(d) { return color(d.data.name); });

      innerPaths.transition().duration(750).attrTween("d", arcTween);


      var texts = svg.selectAll('.text-arc')
          .data(pie(renderData))
        .enter().append('g')
          .attr('class', 'text-arc');




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

    var labels = relevances.map(function (r) { return r.key });


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

    var updateNode = function() {
      this.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    };

    var nodes = svg.selectAll(".node")
        .data(relevances)
      .enter().append("circle")
        //.attr('transform', 'translate( ' + -radius/2 + ', ' + -radius/2 + ')')
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", radius * 0.025)
        .on('click', function () { radiate(d3.mouse(this), d3.select(this.parentNode)); })
        .style("fill", function(d, i) { return fill(i & 3); })
        .style("stroke", function(d, i) { return d3.rgb(fill(i & 3)).darker(2); })
        .call(force.drag)
        .on("mousedown", function() { d3.event.stopPropagation(); });

    var texts = svg.selectAll(".nodeText")
        .data(labels)
      .enter().append('text')
        .attr('class', 'nodeText')
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

      force2.start();

      nodes.call(updateNode);

      texts.each(function(d, i) {
          if(i % 2 == 0) {
            d.x = nodes[i].x;
            d.y = nodes[i].y;
          } else {
            var b = this.getBBox();

            var diffX = d.x - nodes[i].x;
            var diffY = d.y - nodes[i].y;

            var dist = Math.sqrt(diffX * diffX + diffY * diffY);

            var shiftX = b.width * (diffX - dist) / (dist * 2);
            shiftX = Math.max(-b.width, Math.min(0, shiftX));
            var shiftY = 5;
            this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
          }
        });

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

