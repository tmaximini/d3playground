var width = 1024,
    height = 768,
    margin = { left: 50, top: 50 },
    svg = d3.select('.svg-chart');

    svg.attr({width: width, height: height})
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var eases = ['linear', 'poly(4)', 'quad', 'cubic', 'sin', 'exp',
   'circle', 'elastic(10, -5)', 'back(0.5)', 'bounce', 'cubic-in',
   'cubic-out', 'cubic-in-out', 'cubic-out-in'];

var y = d3.scale.ordinal().domain(eases).rangeBands([50, 500]);


eases.forEach(function (ease) {
     var transition = svg.append('circle')
       .attr({cx: 130,
         cy: y(ease),
         r: y.rangeBand()/2-5})
       .transition()
       .delay(400)
       .duration(1500)
       .attr({cx: 400});

      if (ease.indexOf('(') > -1) {
        var args = ease.match(/[0-9]+/g),
            type = ease.match(/^[a-z]+/);
            transition.ease(type, args[0], args[1]);
        } else {
          transition.ease(ease);
        }

      svg.append('text')
          .text(ease)
          .attr({x: 100,
              y: y(ease)+5});
});
