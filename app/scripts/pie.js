
var width, height, radius;

function getRandomInt (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function makePie () {

  $('.svg-chart').empty();

  width = $(window).width() - 50;
  height = $(window).height() < 500 ? $(window).height() : 500;
  radius = Math.min(width, height) / 2;



  var color = d3.scale.ordinal()
      .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);


  /*
  var color = function (color) {
    var nr = +color;
    return '#' + nr.toString(16);
  }
   */

  var outerArc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius / 2);

  var innerArc = d3.svg.arc()
      .outerRadius(radius / 2)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });


  var r = d3.scale.linear()
      .domain ([0, 1])
      .range([3, 25]);


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

      data.forEach(function(d) {
        d.value = (2 * Math.PI) / d.angleWidth * 100;

        // todo: check which relevances belong to which data / segment and attach them

      });


      var g = svg.selectAll('.arc')
          .data(pie(data))
        .enter().append('g')
          .attr('class', 'arc');

      var inner = svg.selectAll('.inner-arc')
          .data(pie(data))
        .enter().append('g')
          .attr('class', 'inner-arc');


      g.append('path')
        .attr('d', outerArc)
        .on('click', function(d) { console.log('clicked on segment ' + d.data.key); })
        .style('fill', function(d) { return color(d.data.name); });


      g.selectAll('.pie-spot')
        .data(relevances)
        .enter().append('circle')
          .attr('class', 'pie-spot')
          .attr('cx', function(d) {
            var parentData = d3.select(this.parentNode).datum();
            console.log(parentData);
            var randomer = parentData.endAngle - ((parentData.endAngle - parentData.startAngle) * getRandomArbitrary(0.75, 1.25)) / 2;
            return getX(radius * getRandomArbitrary(0.6, 0.9), randomer);
          })
          .attr('cy', function(d) {
            var parentData = d3.select(this.parentNode).datum();
            console.log(parentData);
            var randomer = parentData.endAngle - ((parentData.endAngle - parentData.startAngle) * getRandomArbitrary(0.75, 1.25)) / 2;
            return getY(radius * getRandomArbitrary(0.6, 0.9), randomer);
          })
          .attr('r', function(d) { return r(d.rating); })
          .style('stroke', '#fff')
          .on('click', function(d) { console.log('clicked on point ' + d.key); })



      inner.append('path')
          .attr('d', innerArc)
          .style('fill', '#ccc')
          .style('stroke', '#fff');

      g.append('text')
        .attr('transform', function(d) { return 'translate(' + outerArc.centroid(d) + ')'; })
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .style('fill', '#fff')
        .text(function(d) { return d.data.name; });

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
      drawCircles();
    }, 500);
  });
});

