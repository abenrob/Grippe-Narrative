
function generateParagraphs(id,data){
    var narrative = d3.select(".viz-content").append("div").attr("class","scrolling-center");
    var scroll_div = d3.select(".scrolling-center")[0][0];
    var ch_margin = {top: 10, right: 30, bottom: 20, left: 130};
    var narrwidth = scroll_div.clientWidth-20;
    var chartwidth = narrwidth - ch_margin.left - ch_margin.right;
    var chartheight = data[0].counts.length*20 - ch_margin.top - ch_margin.bottom;
    
    var x = d3.scale.linear()
        .domain([0,2500])
        .range([0, chartwidth]);
    var barHeight = 10;

    var week = narrative.selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .attr("class","narrative-content")
        .attr("id", function(d,i){
            return "narr_"+i;
        });

    var week_date = week.append("div")
        .text(function(d){
            return d.year+', semaine '+d.week;
        })
        .attr("class","narative-date");

    var week_header = week.append("h3")
        .text(function(d){
            return d.headline;
        });

    var week_text = week.append("p")
        .text(function(d){
            return d.narrative;
        });

    var svg = week.append("svg")
        .attr("width", narrwidth)
        .attr("height", chartheight)
        .append("g")
        .attr("transform", "translate(" + ch_margin.left + "," + ch_margin.top + ")");

    var bar = svg.selectAll("g")
        .data(function(d){ 
            var s = d.counts.sort(function(a,b){
                return d3.descending(a.cases,b.cases);
            });

            var top10 = s.slice(0,10);
            //return top10; 
            return s;
        })
        .enter()
        .append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * (barHeight+10) + ")"; });

    bar.append("rect")
        .attr("width", function(d) { ;return x(d.cases); })
        .attr("height", barHeight)
        .attr("class","cases")
        .attr("fill",function(d){
            return numtohex(d.cases);
        });

    bar.append("text")
        .attr("x", function(d) { return x(d.cases)+3; })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .attr("class","barlabel")
        .text(function(d) { return d.cases; });

                
    bar.append("text")
    .attr("text-anchor","end")
        .attr("x", -5)
        .attr("y", 0)
        .attr("dy", ".8em")
        .attr("class","barregion")
        .text(function(d,i){ return d.region; });  

}
    
function generateTimeline(id,data){

    tl_margin = {top: 10, right: 10, bottom: 30, left: 10};
    tl_width = 50;
    tl_height = $(window).height()-tl_margin.top-tl_margin.bottom-header_height;
    var svg = d3.select("#timeline")
            .append("svg")
            .attr("width", tl_width)
            .attr("height", tl_height+tl_margin.top+tl_margin.bottom)
            .append("g")
      
    var scale = d3.scale.linear()
            .range([tl_margin.top, tl_height])    
            .domain([1,data.length])
        
    svg.selectAll("g1")
        .data(data)
        .enter()
        .append("text")
        .attr("y", function(d,i) {
            return scale(i+1)+3+tl_margin.top; // scoot it over to center text
        })
        .attr("x", 25)
        .attr("dx", ".35em")
        .attr("class","barlabel")
        .text(function(d,i) {
                return d['week'] < 10 ? 's0'+d.week : 's'+d.week;
        });              

    svg.append("line")
        .attr("y1", tl_margin.top+tl_margin.top)
        .attr("x1", 20)
        .attr("y2", tl_height+tl_margin.top)
        .attr("x2", 20)
        .attr("stroke-width", .5) 
        .attr("class","tl_line")         
    
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cy", function(d,i) {
             return scale(i+1)+tl_margin.top;
        })
        .attr("cx", function(d) {
             return 20;
        })
        .attr("r", 3.5)
        .attr("id",function(d,i){return "time_"+i;})
        .attr("class","tl_circle")
        .attr("pos",function(d,i){return i;})
        .on("click",function(e){
            //updateinfographic(e.pos);
            updatenarrative(e.pos);
        });
        
    svg.append("circle")
        .attr("cy", tl_margin.top+tl_margin.top)
        .attr("cx", function(d) {
             return 20;
        })
        .attr("r", 8)
        .attr("id","selectedcircle")
        .attr("stroke-width", .5 )
        .attr("stroke", "rgb(50,160,160)") 
        .attr("fill-opacity","0.3")
        .attr("fill","rgb(50,160,160)");         
}

function generateMap(id){
    var margin = {top: 10, right: 0, bottom: 10, left: 0},
    width = $(id).width() - margin.left - margin.right,
    height = $(id).height() - margin.top - margin.bottom, sc=1500, center=[12.5, 47.6];
    var projection = d3.geo.mercator()
        .center(center)
        .scale(sc);
        
    var svg = d3.select(id).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", function(d) { return "translate(10,10)";});

    var path = d3.geo.path()
        .projection(projection);

    var g = svg.append("g");
    
    g.selectAll("path")
        .data(fr_regions.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id",function(d,i){return d.properties.ADM1_NAME;})
        .attr("class","region")
        .attr("fill","transparent");        
}

function highlighttimeline(id,num){ 
    
    var scale = d3.scale.linear()
            .range([tl_margin.top, tl_height])    
            .domain([1,data.length]) 
       
    d3.select('#selectedcircle')
        .transition()
        .attr("cy", function(d,i) {
             return scale(num+1)+tl_margin.top;
        })
        
}

function highlightmap(num){
    var d = data[num].counts;
    d.forEach(function(element){
       d3.select("#"+element.region).transition().attr("fill",numtohex(element.cases,2100))
    });
}

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

// Tween stuff for scroll to funcitons

function doScroll(wkNum){
    var elScroll = d3.select("#narr_"+wkNum)[0][0].offsetTop;
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
}
   

// functions for paragraph scroll
$(window).scroll(function(){
    updateinfographic(getParagraphInView(data.length,125));
});    
            
function getParagraphInView(numparas,mar){
    var parainview=0;

    for(i=0;i<numparas;i++){
        var ot = d3.select('#narr_'+i)[0][0].offsetTop;
        var st = $(window).scrollTop();
        if(ot-mar<=st && Math.abs(st-mar)>200){
            parainview=i;
        }
    }
    return parainview;
}


// Transition infogrpahic functions

function updateinfographic(temppara){
    if(currentpara!==temppara){
        highlighttimeline('#timeline',temppara);
        highlightmap(temppara);
        currentpara=temppara;
    }
}
function updatenarrative(temppara){
    if(currentpara!==temppara){
        doScroll(temppara);
        //currentpara=temppara;
    }
}



// initialization

var currentpara = -1;
var tl_width, tl_height,tl_margin;
var header_height = 75;
          
generateParagraphs('#text',data);
generateTimeline('#timeline',data);
generateMap('#map');
updateinfographic(0);



