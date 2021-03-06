$(function(){

// used to store the number of links between two nodes. 
// mLinkNum[data.links[i].source + "," + data.links[i].target] = data.links[i].linkindex;
var mLinkNum = {};

// sort links first
sortLinks();                                

// set up linkIndex and linkNumer, because it may possible multiple links share the same source and target node
setLinkIndexAndNum();

var w = document.getElementById('page-wrapper').offsetWidth - 40,
    h = document.documentElement.clientHeight*0.80;

var force = d3.layout.force()
              .size([w, h])
              .linkDistance(250)
              .charge(-2500)
              .on("tick", tick);

var drag = force.drag()
                .on("dragstart", dragstart);

    force
        .nodes(d3.values(data.nodes))
        .links(data.links)
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
                .attr("xlink:href", function(d) { return d.icon; })
                .attr("x", "-25px")
                .attr("y", "-25px")
                .attr("cursor", "pointer")
                .attr("width", "75px")
                .attr("height", "75px");
    circle.append("svg:text")
                .attr("x", 50)
                .attr("y", ".51em")
                .style("font-size", 12)
                .style("font-family", "sans-serif")
                .text(function(d) { return d.name; });

var current_h = h,
    current_w = w-50;

// Overlay panel with node information (top-right corner)
var overlay = d3.select(".graphContainer").append("div")
                .attr("class", "njg-overlay");

var closeOverlay = overlay.append("a")
                    .attr("class", "njg-close")
                    .on("click", function() { 
                        overlay.classed("njg-hidden", true); 
                        current_w = w;
                    svg = d3.selectAll("svg")
                            .attr("width", current_w)
                            .attr("height", current_h);
                    force.size([current_w, current_h]);
                    });

var overlayInner = overlay.append("div")
                   .attr("class", "njg-inner");

var connlist = d3.select(".col-lg-12")
                 .attr("class", "njg-hidden")

var closeConnlist = d3.select(".panel")
                        .append("a")
                        .attr("class", "njg-close")
                        .on("click", function() {
                            connlist.attr("class", "njg-hidden");
                        current_h = h;
                        svg = d3.selectAll("svg")
                            .attr("width", current_w+50)
                            .attr("height", current_h);
                        force.size([current_w, current_h]);
                        });


function OnClickNode(d) {
    d3.selectAll("text")
        .style("font-size", 12)
        .style("font-weight", "normal");
    d3.select(this).select("text").transition()
        .style("font-size", 16)
        .style("font-weight", "bold");

    var overlay = d3.select(".njg-overlay"),
        overlayInner = d3.select(".njg-overlay > .njg-inner"),
        html = "<h4>" + d.name + "</h4>";
    html += '<table class="table table-striped"><tbody>';
    html += '<tr><th scope="row">Device Type</th><td>' + d.device_type + '</td></tr>';
    html += '<tr><th scope="row">Protocol ver.</th><td>' + d.protocol_vers + '</td></tr>';
    html += '<tr><th scope="row">Vendor</th><td>' + d.company + '</td></tr>';
    html += '<tr><th scope="row">IP Address</th><td>' + d.IpAddress + '</td></tr>';
    html += '<tr><th scope="row">IP Connection</th><td>' + d.ip_conn + '</td></tr>';
    html += '<tr><th scope="row">Port</th><td>' + d.port + '</td></tr>';
    html += '<tr><th scope="row">HW Address</th><td>' + d.hw_address + '</td></tr>';
    html += '<tr><th scope="row">Serial</th><td>' + d.serial + '</td></tr>';
    html += '</tbody></table>';
    overlayInner.html(html);
    overlay.classed("njg-hidden", false);
    overlay.style("display", "block");

    var connlist_label = d3.select(".ibox-title");
    html = "<h5>" + d.name + " Links</h5>";
    connlist_label.html(html);

    var connlist_device = d3.select("#link_inf");
    html = '<thead><tr><th>Active Port</th><th>Neighbour</th><th>Neighbour Port</th><th>Bandwidth</th><th>Link Found</th></tr></thead><tbody>';
    var flag = 0;
    for (var i = 0; i < data.links.length; i++) 
    {
        if (data.links[i].source.id == d.id)
        {
            html += '<tr><td>' + data.links[i].port_src + '</td><td>' + data.links[i].target.name + '</td><td>' + data.links[i].port_dst + '</td><td>' + data.links[i].Bandwidth + ' Mbit/s</td><td>' + data.links[i].Link_found + '</td></tr>';
            flag = 1;
        }
        if (data.links[i].target.id == d.id)
        {
            html += '<tr><td>' + data.links[i].port_dst + '</td><td>' + data.links[i].source.name + '</td><td>' + data.links[i].port_src + '</td><td>' + data.links[i].Bandwidth + ' Mbit/s</td><td>' + data.links[i].Link_found + '</td></tr>';
            flag = 1;
        }
    }
    if (flag == 0)
    {
        html += '<tr><td>No Active Links</td></tr>'
    }
    html += '</tbody>';
    connlist_device.html(html);
    connlist.attr("class", "connlist-visible");

    console.log("link_table: " + document.getElementById('link_table').offsetHeight);
    console.log("h: " + h);

    current_h = h - document.getElementById('link_table').offsetHeight + 25;
    current_w = w*0.8;

    console.log("current_h: " + current_h + " current_w: " + current_w);

    svg = d3.selectAll("svg")
            .attr("width", current_w+50)
            .attr("height", current_h);

    force.size([current_w, current_h]);

    d3.selectAll("path").attr("class", "link");
} 

function onClickLink(d) {
    d3.selectAll("text")
        .style("font-size", 12)
        .style("font-weight", "normal");

    d3.selectAll("path").attr("class", "link");
    d3.select(this).attr("class", "active_link");

    overlay.classed("njg-hidden", true);

    var connlist_label = d3.select(".ibox-title");
    var html = "<h5>Link: " + d.source.name + " - " + d.target.name + "</h5>";
    connlist_label.html(html);

    var connlist_link = d3.select("#link_inf");
    html = '<thead><tr><th>' + d.source.name + ' Port</th><th>' + d.target.name + ' Port</th><th>Bandwidth</th><th>Link Found</th></tr></thead>';
    html += '<tbody><tr><td>' + d.port_src + '</td><td>' + d.port_dst + '</td><td>' + d.Bandwidth + ' Mbit/s</td><td>' + d.Link_found + '</td></tr></tbody>';
    connlist_link.html(html);

    connlist.attr("class", "connlist-visible");

    current_h = h - document.getElementById('link_table').offsetHeight + 25;
    current_w = w*0.8;

    svg = d3.selectAll("svg")
            .attr("width", current_w+50)
            .attr("height", current_h);

    force.size([current_w, current_h]);
}


// Use elliptical arc path segments to doubly-encode directionality.
function tick() {

    circle.attr("x", function(d) { return d.x = Math.max(20, Math.min(current_w - 50, d.x)); })
          .attr("y", function(d) { return d.y = Math.max(20, Math.min(current_h - 50, d.y)); });

    path.attr("d", function(d) {
        // get the total link numbers between source and target node
        var lTotalLinkNum = mLinkNum[d.source.id + "," + d.target.id] || mLinkNum[d.target.id + "," + d.source.id];
        if(lTotalLinkNum > 1)
        {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
                // if there are multiple links between these two nodes, we need generate different dr for each path
            dr = dr/(1 + (1/lTotalLinkNum) * (d.linkindex - 1));
                // generate svg path
            return "M" + d.source.x + "," + d.source.y + 
                    "A" + dr + "," + dr + " 0 0 1," + d.target.x + "," + d.target.y + 
                    "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y; 
        }       
        // generate svg path
        return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;   
    });

    // Add tooltip to the connection path
    path.append("svg:title")
        .text(function(d, i) { return d.name; });

    circle.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
} 

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}


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