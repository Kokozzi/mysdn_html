$(function(){
    var data = {
        "nodes": [
            { "id": 0, "name": "Switch 1", "icon": "switch.svg", "IpAddress": "10.30.1.1" },
            { "id": 1, "name": "Switch 2", "icon": "switch.svg", "IpAddress": "10.20.1.1" },
            { "id": 2, "name": "Switch 3", "icon": "switch.svg", "IpAddress": "10.31.1.1" },
            { "id": 3, "name": "Switch 4", "icon": "switch.svg", "IpAddress": "10.36.2.1" },
            { "id": 4, "name": "Switch 5", "icon": "switch.svg", "IpAddress": "10.31.5.1" }
        ],
        "links": [     
            { "source": 0, "target": 1, "name": "A-B" },
            { "source": 0, "target": 2, "name": "A-C-1" },
            { "source": 0, "target": 2, "name": "A-C-2" },
            { "source": 0, "target": 3, "name": "A-D-1" },
            { "source": 0, "target": 4, "name": "A-E-1" },
            { "source": 0, "target": 4, "name": "A-E-2" },
        ]
    };          

    // used to store the number of links between two nodes. 
    // mLinkNum[data.links[i].source + "," + data.links[i].target] = data.links[i].linkindex;
    var mLinkNum = {};

    // sort links first
    sortLinks();                                

    // set up linkIndex and linkNumer, because it may possible multiple links share the same source and target node
    setLinkIndexAndNum();
    
    var w = document.getElementById('page-wrapper').offsetWidth - 40,
        h = document.documentElement.clientHeight - 150;

    var force = d3.layout.force()
                  .nodes(d3.values(data.nodes))
                  .links(data.links)
                  .size([w, h])
                  .linkDistance(400)
                  .charge(-1050)
                  .on("tick", tick)
                  .start();
    
    var svg = d3.select(".graphContainer").append("svg:svg")
                .attr("width", w)
                .attr("height", h);
    
    var path = svg.append("svg:g")
                  .selectAll("path")
                  .data(force.links())
                  .enter().append("svg:path")
                  .attr("class", "link")
                  .on("click", onClickLink);

    var circle = svg.selectAll(".circle")
                    .data(force.nodes())
                    .enter().append("g")
                    .attr("class", "circle")
                    .on("click", OnClickNode)
                    .call(force.drag);
        circle.append("svg:image")
                    //.attr("r", 5);
                    .attr("xlink:href", function(d) { return d.icon; })
                    .attr("x", "-25px")
                    .attr("y", "-25px")
                    .attr("width", "75px")
                    .attr("height", "75px");

    var text = svg.append("svg:g")                                
                  .selectAll("g")
                  .data(force.nodes())
                  .enter().append("svg:g");

    // A copy of the text with a thick white stroke for legibility.
    text.append("svg:text")
        .attr("x", 50)
        .attr("y", ".51em")
        .attr("class", "shadow")
        .style("font-size", 12)
        .style("font-family", "sans-serif")
        .text(function(d) { return d.name; });  

    text.append("svg:text")
        .attr("x", 50)
        .attr("y", ".51em")
        .style("font-size", 12)
        .style("font-family", "sans-serif")
        .text(function(d) { return d.name; });

    // Overlay panel with node information (top-right corner)
    var overlay = d3.select(".graphContainer").append("div")
                    .attr("class", "njg-overlay");
    
    var closeOverlay = overlay.append("a")
                        .attr("class", "njg-close")
                        .on("click", function() {
                            removeOpenClass();
                            overlay.classed("njg-hidden", true);
                        });
    
    var overlayInner = overlay.append("div")
                       .attr("class", "njg-inner");
    
    
    // Use elliptical arc path segments to doubly-encode directionality.
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            // get the total link numbers between source and target node
            var lTotalLinkNum = mLinkNum[d.source.id + "," + d.target.id] || mLinkNum[d.target.id + "," + d.source.id];
            if(lTotalLinkNum > 1)
            {
                // if there are multiple links between these two nodes, we need generate different dr for each path
                dr = dr/(1 + (1/lTotalLinkNum) * (d.linkindex - 1));
            }       
            // generate svg path
            return "M" + d.source.x + "," + d.source.y + 
                "A" + dr + "," + dr + " 0 0 1," + d.target.x + "," + d.target.y + 
                "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y;    
        });

        // Add tooltip to the connection path
        path.append("svg:title")
            .text(function(d, i) { return d.name; });

        circle.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        text.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    } 
    
    function OnClickNode(d) {
        var overlay = d3.select(".njg-overlay"),
            overlayInner = d3.select(".njg-overlay > .njg-inner"),
            html = "<p><b>Название</b>: " + d.name + "</p>";
        if(d.IpAddress) { html += "<p><b>IP Address</b>: " + d.IpAddress + "</p>"; }
        overlayInner.html(html);
        overlay.classed("njg-hidden", false);
        overlay.style("display", "block");
        // set "open" class to current node
        removeOpenClass();
        d3.select(this).classed("njg-open", true);
    } 
    
    function onClickLink(d) {
        var overlay = d3.select(".njg-overlay"),
            overlayInner = d3.select(".njg-overlay > .njg-inner"),
            html = "<p><b>Source</b>: " + (d.source.name || d.source.id) + "</p>";
        html += "<p><b>Target</b>: " + (d.target.name || d.target.id) + "</p>";
        html += "<p><b>Route ID</b>: " + d.name + "</p>";
        overlayInner.html(html);
        overlay.classed("njg-hidden", false);
        overlay.style("display", "block");
        // set "open" class to current link
        removeOpenClass();
        d3.select(this).classed("njg-open", true);
    }
    
    /*function OnMouseNode() {
        d3.select(this).select("image").transition()
        .duration(750)
        .attr("x", 22)
        .style("fill", "steelblue")
        .style("stroke", "lightsteelblue")
        .style("stroke-width", ".5px")
        .style("font", "20px sans-serif");
    }*/
    
    removeOpenClass = function () {
        d3.selectAll("svg .njg-open").classed("njg-open", false);
    };
    
    // sort the links by source, then target
    function sortLinks()
    {                               
        data.links.sort(function(a,b) {
            if (a.source > b.source) 
            {
                return 1;
            }
            else if (a.source < b.source) 
            {
                return -1;
            }
            else 
            {
                if (a.target > b.target) 
                {
                    return 1;
                }
                if (a.target < b.target) 
                {
                    return -1;
                }
                else 
                {
                    return 0;
                }
            }
        });
    }

    //any links with duplicate source and target get an incremented 'linknum'
    function setLinkIndexAndNum()
    {                               
        for (var i = 0; i < data.links.length; i++) 
        {
            if (i != 0 &&
                data.links[i].source == data.links[i-1].source &&
                data.links[i].target == data.links[i-1].target) 
            {
                data.links[i].linkindex = data.links[i-1].linkindex + 1;
            }
            else 
            {
                data.links[i].linkindex = 1;
            }
            // save the total number of links between two nodes
            if(mLinkNum[data.links[i].target + "," + data.links[i].source] !== undefined)
            {
                mLinkNum[data.links[i].target + "," + data.links[i].source] = data.links[i].linkindex;
            }
            else
            {
                mLinkNum[data.links[i].source + "," + data.links[i].target] = data.links[i].linkindex;
            }
        }
    }   
});         