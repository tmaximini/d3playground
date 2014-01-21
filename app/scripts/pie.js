
var width, height, radius, outerArc, textArc;

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


      var dot = g.selectAll('.pie-spot')
        .data(relevances)
        .enter().append('g')
          .attr('class', 'pie-spot')
          .attr('transform', function (d) {
            var parentData = d3.select(this.parentNode).datum();
            console.log(parentData.endAngle);
            var randomer = parentData.endAngle - ((parentData.endAngle - parentData.startAngle)) * getRandomArbitrary(0.5, 0.85);
            var cx = getX(radius * getRandomArbitrary(0.5, 0.85), randomer);
            var cy = getY(radius * getRandomArbitrary(0.5, 0.85), randomer);
            return 'translate(' + cx + ',' + height / 2 + ')';
          });

      dot.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', function(d) { return 10; })
        .style('stroke', '#fff')
        .style('fill', 'steelblue')
        .on('click', function(d) { console.log('clicked on point ' + d.key); })

      dot.append('text')
        .attr("y", 5)
        .attr("x", 10)
        .style('text-anchor', 'start')
        .text(function(d) { return d.key; });


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

    var r = d3.scale.linear()
        .domain ([0, 1])
        .range([3, 25]);

    var circles = d3.select('.svg-chart')
                  .append('g')
                  .attr('class', 'spots')
                  .selectAll('circle')
                  .data(relevances)
                .enter().append('g')
                  .attr('class', 'symptomSpot')
                  .append('circle')
                  .on('click', function(d,i) { console.log('Hello world', d, i); })
                  .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
                  .attr('cx', function() { return getRandomInt(-radius / 2, radius / 2); } )
                  .attr('cy', function() { return getRandomInt(-radius / 2, radius / 2); } )
                  .attr('r', function(d) { return r(d.rating); })
                  .tooltip(function(d, i) {
                      var r, svg;
                      r = +d3.select(this).attr('r');
                      svg = d3.select(document.createElement('svg')).attr('height', 50)
                              .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
                      g = svg.append('g');
                      //g.append('rect').attr('width', r * 10).attr('height', 10);
                      //g.append('text').text('10 times the radius of the cirlce').attr('dy', '25');

                      var cx = +d3.select(this).attr('cx');
                      var cy = +d3.select(this).attr('cy');

                      var key = d.key;

                      return {
                        type: 'popover',
                        title: key,
                        content: svg,
                        detection: 'shape',
                        placement: 'fixed',
                        gravity: 'right',
                        position: [width / 2 + cx, height / 2 + cy],
                        displacement: [r + 2, -72],
                        mousemove: false
                      };
                    });

  })





}

var resizer;

$(function () {
  makePie();
  //drawCircles();
  $(window).resize(function() {
    clearTimeout(resizer);
    resizer = setTimeout(function () {
      console.log('finished resize');
      makePie();
      //drawCircles();
    }, 500);
  });
});

