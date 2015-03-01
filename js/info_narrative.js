
function generateParagraphs(id,data){
    data.forEach(function(d,i) {
    $(id).append('<div id="para' + i + '" class="col-md-12 para">'+
            '<span class="paraDate">' + d['year']+', semaine '+d['week']+'</span>'+
            '<h4>' + d['headline'] + '</h4>' +
            d['narrative'] + '</div>');
    });
    $(id).append('<div id="endbuffer"></div>');
}
    
function generateTimeline(id,data){
    infowidth = $(id).width()-10;
    var height = 50;
    var svg = d3.select("#timeline")
            .append("svg")
            .attr("width", infowidth)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + 10 + ",0)");
      
    var scale = d3.scale.linear()
            .range([0, infowidth-50])    
            .domain([1,data.length])
        
    svg.selectAll("g1")
        .data(data)
        .enter()
        .append("text")
        .attr("x", function(d,i) {
            return scale(i+1)-7; // scoot it over to center text
        })
        .attr("y", 45)
        .attr("dy", ".35em")
        .attr("class","barlabel")
        .text(function(d,i) {
                return d['week'] < 10 ? '0'+d['week'] : ''+d['week'];
        });
            
    svg.selectAll("g1")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", function(d,i) {
          return scale(i+1);
        })
        .attr("y1", 30)
        .attr("x2", function(d,i) {
          return scale(i+1);
        })
        .attr("y2", 38)
        .attr("stroke-width", .5)
        .attr("stroke", "black");                 

    svg.append("line")
        .attr("x1", 0)
        .attr("y1", 30)
        .attr("x2", infowidth-50)
        .attr("y2", 30)
        .attr("stroke-width", .5)
        .attr("stroke", "black");           
    
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d,i) {
             return scale(i+1);
        })
        .attr("cy", function(d) {
             return 30;
        })
        .attr("r", 3.5)
        .attr("id",function(d,i){return "time_"+i;})
        .attr("pos",function(d,i){return i;})
        .attr("fill","#999999")
        .on("click",function(){
            if(compact){
                showParagraph(parseInt($(this).attr('pos')),data.length);
                updateinfographic(parseInt($(this).attr('pos')));
            } else {
                updateinfographic(parseInt($(this).attr('pos')));
            }
        });
        
    svg.append("circle")
        .attr("cx", 0)
        .attr("cy", function(d) {
             return 30;
        })
        .attr("r", 8)
        .attr("id","selectedcircle")
        .attr("opacity","0.5")
        .attr("fill","#d73027");
        
    
        
    svg.selectAll("g2")
        .data(data)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", 10)
        .attr("dy", ".35em")
        .attr("id",function(d,i){
            return "timelinedate"+i;
        })
        .attr("class","barlabel hidden")
        .text(function(d,i) {
                return d['year']+', semaine '+d['week'];
        });
         
}

function generateBarChart(id,datain){
    
    var data;
    var s = datain['counts'].sort(function(a,b){
        return d3.descending(a.cases,b.cases);
    })
    console.log(s);
    data = s.slice(0,10);

    var margin = {top: 10, right: 30, bottom: 20, left: 130},
    width = $(id).width() - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;    
    var barHeight = (height)/data.length-10;   

    var x = d3.scale.linear()
        .domain([0,2500])
        .range([0, width]);

    var svg  = d3.select(id)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * (barHeight+10) + ")"; });

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    bar.append("rect")
        .attr("width", function(d) { return x(d['cases']); })
        .attr("height", barHeight)
        .attr("class","cases");

    bar.append("text")
        .attr("x", function(d) { return x(d['cases'])+3; })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .attr("class","barlabel")
        .text(function(d) { return d['cases']; });

                
    bar.append("text")
        .attr("x", -130)
        .attr("y", 0)
        .attr("dy", ".58em")
        .attr("class","barregion")
        .text(function(d,i){ return d['region']; });                

    if (!compact){
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    }
    
}

function generateMap(id){
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = $(id).width() - margin.left - margin.right,
    height = 300;
    if(width<400){sc=900;center=[24, 43];} else {sc=1200;center=[15, 43.1];}
    var projection = d3.geo.mercator()
        .center(center)
        .scale(sc);

    var svg = d3.select(id).append("svg")
        .attr("width", width)
        .attr("height", height);

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
            .range([0, infowidth-50])    
            .domain([1,data.length]) 
       
    d3.select('#selectedcircle')
        .transition()
        .attr("cx", function(d,i) {
             return scale(num+1);
        })
        
}

function highlightmap(num){
    var d = data[num].counts;
    d.forEach(function(element){
       d3.select("#"+element.region).transition().attr("fill",numtohex(element.cases,2100))
    });
}

function numtohex(num,limit){
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
            
/////////////////////////////////////
//functions for expanded view only
////////////////////////////////////            
            
function getParagraphInView(numparas,mar){
    var parainview=0;
    for(i=0;i<numparas;i++){
        if($('#para'+i).offset().top-mar<=$(window).scrollTop()){
            parainview=i;
        }
    }
    return parainview;
}
            
function stickydiv(){
    var window_top = $(window).scrollTop();
    var div_top = $('#sticky-anchor').offset().top;
    if (window_top > div_top){
        $('#info-graphic').addClass('sticky');
    }
    else{
        $('#info-graphic').removeClass('sticky');
    }
};

///////////////////////////////////////
////// Functions for compact view
///////////////////////////////////////

function showParagraph(id,numparas){
    for(i=0;i<numparas;i++){
        $('#para'+i).hide();
    }
    $('#endbuffer').hide();
    $('#para'+id).show();
}

///////////////////////////////////////
////// Transition infogrpahic functions
///////////////////////////////////////

function updateinfographic(temppara){
    var match = data.filter(function(d,i) { return i == temppara; })[0];

    if(currentpara!==temppara){
        highlighttimeline('#timeline',temppara);
        d3.select('#timelinedate'+currentpara).classed('hidden', true);
        d3.select('#timelinedate'+temppara).classed('hidden', false);
        $('#timelinedate'+temppara).removeClass('hidden');
        $('#barcharttitle').html('Cas confirmés par 100 000 personnes (' + match.year+', semaine '+match.week+')');
        if(!compact){
            $('#para'+currentpara).removeClass('highlightedpara');
            $('#para'+temppara).addClass('highlightedpara');
        }
        transitionBarChart('#barchart',data[temppara]);
        highlightmap(temppara);
        currentpara=temppara;
        
    }
}

function transitionBarChart(id,datain){
    var data;
    var s = datain['counts'].sort(function(a,b){
        return d3.descending(a.cases,b.cases);
    })
    data = s.slice(0,10);

    var margin = {top: 10, right: 30, bottom: 20, left: 135},
    width = $(id).width() - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;    
    var barHeight = (height)/data.length-10;   

    var x = d3.scale.linear()
        .domain([0,2500])
        .range([0, width]);

    d3.select(id).selectAll("rect")
        .data(data).transition()
        .duration(1000)
        .attr("width", function(d) { return x(d['cases']); })
        .attr("height", barHeight);

    d3.select(id).selectAll(".barlabel")
        .data(data).transition()
        .duration(1000)
        .attr("x", function(d) { return x(d['cases'])+5; })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function(d) { return d['cases']; });

    d3.select(id).selectAll(".barregion")
        .data(data).transition()
        .duration(1000)
        .text(function(d,i){ return d['region']; }); 
}

/////////////////////////////////////////
////// Window resize events
////////////////////////////////////////

function resizedw(){
    if($(window).width()<768){compact = true;} else {compact = false;}
    if($(window).width()<currentwidth-20 || $(window).width()>currentwidth+20){
        currentwidth = $(window).width();
        $('#text').html('');
        $('#timeline').html('');
        $('#barchart').html('');
        $('#map').html('');
        $('#info-graphic').removeClass('sticky');
        generateParagraphs('#text',data);
        generateTimeline('#timeline',data);
        generateBarChart('#barchart',data[0]);
        generateMap('#map');
        var temppara=currentpara;
        currentpara=-1;
        updateinfographic(temppara);
        if(compact){
            showParagraph(temppara,42);
            $('html, body').animate({
                scrollTop: 0
            }, 500);
            $('#browse').show();
        } else {
            $('html, body').animate({
                scrollTop: $('#para'+temppara).offset().top
            }, 500);
            $('#browse').hide();
        }
        highlighttimeline('#timeline',temppara);
    }
}

//////////////////////////////
///// initialisation
/////////////////////////////

var compact = false;
var currentwidth=$(window).width();
var currentpara = -1;
var infowidth;

if($(window).width()<768){compact = true;}            
generateParagraphs('#text',data);
generateTimeline('#timeline',data);
generateBarChart('#barchart',data[0]);
generateMap('#map');
updateinfographic(0);



$(window).scroll(function(){
    if(!compact){
        stickydiv();
        updateinfographic(getParagraphInView(data.length,150));
    }
});

if(compact){    
    showParagraph(0,data.length);
} else {
    $('#browse').hide();
};

var doit;

window.onresize = function(){
  clearTimeout(doit);
  doit = setTimeout(resizedw, 100);
};

$('#Next').on("click",function(){
    if(currentpara<data.length){
        showParagraph(currentpara+1,data.length);
        updateinfographic(currentpara+1);
    }
});

$('#Previous').on("click",function(){
    if(currentpara>0){
        showParagraph(currentpara-1,data.length);
        updateinfographic(currentpara-1);
    }
});
