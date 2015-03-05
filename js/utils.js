// Tween stuff for scroll to funcitons

function doScroll(el){
    var elScroll = d3.select(el)[0][0].offsetTop;
    d3.transition()
        .delay(200)
        .duration(1500)
        .tween("scroll", scrollTween(elScroll));
};

function scrollTween(scrollTop) {
  return function() {
    var i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, scrollTop);
    return function(t) { scrollTo(0, i(t)) };
 };
};


// choropleth-erizer
function numtohex(num){
    var color;

    if(num<25){
        color="#1a9850";
    }
    else if(num<50){
        color="#66bd63";
    }
    else if(num<80){
        color="#a6d96a";
    }
    else if(num<120){
        color="#d9ef8b";
    }
    else if(num<170){
        color="#ffffbf";
    }
    else if(num<250){
        color="#fee08b";
    }
    else if(num<350){
        color="#fdae61";
    }
    else if(num<500){
        color="#f46d43";
    }
    else if(num>=500){
        color="#d73027";
    }
    return color;

}   


// center and scale to features
function fitProjection(projection, data, box, center) {
/////////////////////////////////////////////////////////////
// thanks, https://gist.github.com/nrabinowitz/1756257 !!! //
/////////////////////////////////////////////////////////////

    // get the bounding box for the data - might be more efficient approaches
    var left = Infinity,
        bottom = -Infinity,
        right = -Infinity,
        top = Infinity;
    // reset projection
    projection
        .scale(1)
        .translate([0, 0]);
    data.features.forEach(function(feature) {
        d3.geo.bounds(feature).forEach(function(coords) {
            coords = projection(coords);
            var x = coords[0],
                y = coords[1];
            if (x < left) left = x;
            if (x > right) right = x;
            if (y > bottom) bottom = y;
            if (y < top) top = y;
        });
    });
    // project the bounding box, find aspect ratio
    function width(bb) {
        return (bb[1][0] - bb[0][0])
    }
    function height(bb) {
        return (bb[1][1] - bb[0][1]);
    }
    function aspect(bb) {
        return width(bb) / height(bb);
    }
    var startbox = [[left, top],  [right, bottom]],
        a1 = aspect(startbox),
        a2 = aspect(box),
        widthDetermined = a1 > a2,
        scale = widthDetermined ?
            // scale determined by width
            width(box) / width(startbox) :
            // scale determined by height
            height(box) / height(startbox),
        // set x translation
        transX = box[0][0] - startbox[0][0] * scale,
        // set y translation
        transY = box[0][1] - startbox[0][1] * scale;
        // console.log(startbox);
    // center if requested
    if (center) {
        if (widthDetermined) {
            transY = transY - (transY + startbox[1][1] * scale - box[1][1])/2;
        } else {
            transX = transX - (transX + startbox[1][0] * scale - box[1][0])/2;
        }
    }
    return projection.scale(scale).translate([transX, transY])
};
