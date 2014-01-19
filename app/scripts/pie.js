
var width, height, radius;

function getRandomInt (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }


function makePie () {

  $('.svg-chart').empty();

  width = $(window).width() - 50;
  height = $(window).height() < 500 ? $(window).height() : 500;
  radius = Math.min(width, height) / 2;



  var color = d3.scale.ordinal()
      .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

  var outerArc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius / 2);

  var innerArc = d3.svg.arc()
      .outerRadius(radius / 2)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });

  var svg = d3.select('.svg-chart')
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  d3.json('data.json', function(error, data) {

    data.forEach(function(d) {
      d.value = 100 / data.length;
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
        .style('fill', function(d) { return color(d.data.name); });

    inner.append('path')
        .attr('d', innerArc)
        .style('fill', '#ccc')
        .style('stroke', '#fff');

    g.append('text')
        .attr('transform', function(d) { return 'translate(' + outerArc.centroid(d) + ')'; })
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .text(function(d) { return d.data.name; });

  });
}


function drawCircles () {
  console.log('radius is:' + radius);
  circleRadii = [5, 8, 10, 8, 12, 5, 17];
  var circles = d3.select('.svg-chart')
                .append('g')
                .attr('class', 'spots')
                .selectAll('circle')
                .data(circleRadii)
              .enter().append('g')
                .attr('class', 'symptomSpot')
                .append('circle')
                .on('click', function(d,i) { console.log('Hello world', d, i); })
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
                .attr('cx', function() { return getRandomInt(-radius / 2, radius / 2); } )
                .attr('cy', function() { return getRandomInt(-radius / 2, radius / 2); } )
                .attr('r', function (d) { return d; });



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

