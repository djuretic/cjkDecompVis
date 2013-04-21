
var width = 350,
    height = 500,
    decomp = {},
    node_radius = 12,
    animation_delay = 1000,
    horizontal_tree = false;

var svg;

var link = d3.svg.diagonal();
if(horizontal_tree){
	link = link.projection(function(d) { return [d.y, d.x]; });
}
var scale = d3.scale.category10();

function get_decomposition(character, base_id){
	var character_decomp = decomp[character];
	if(!character_decomp){
		return {
			id: base_id,
			max_id: base_id,
			character: character,
			has_char: true
		};
	}
	var children = [],
		max_id = base_id;
	if(character_decomp.components){
		character_decomp.components.forEach(function(component){
			max_id++;
			child_decomp = get_decomposition(component, max_id);
			max_id = child_decomp.max_id;
			children.push(child_decomp);
		});
	}
	return {
		id: base_id,
		max_id: max_id,
		character: character,
		type: character_decomp.type,
		type_full: character_decomp.type_full,
		has_char: character.length <= 1,
		children: children
	};
}

function drawLinks(links){
	link_sel = svg.selectAll(".link")
		.data(links, function(d){ return d.source.id + "-" + d.target.id; });

	link_sel.enter()
		.insert("path", ":first-child")  //to avoid overlap with nodes
		.attr("class", "link")
		.attr("d", function(d){
			return link({
				source: {x: d.source.x - width, y: d.source.y},
				target: {x: d.target.x - width, y: d.target.y}
			});
		});
	link_sel.transition()
		.duration(animation_delay)
		.attr("d", link);
	link_sel.exit()
		.transition()
		.duration(animation_delay/2)
		.style("opacity", 0.1)
		.remove();
}

function drawNodes(nodes){
	var nodeSel = svg.selectAll(".node")
		.data(nodes, function(d){ return d.id; });

	var node = nodeSel.enter()
		.append("g")
		.attr("class", "node")
		.attr("transform", function(d) {
			return horizontal_tree ?
				"translate(" + (d.y - width) + ","+ d.x +")" : "translate(" + (d.x - width) + ","+ d.y +")";
		})
		.on("click", function(d){
			update(d.character, d.id);
		});

	node.append("circle")
		.attr("class", "circle")
		.attr("r", node_radius);

	node.append("text")
		.attr("class", "text")
		.attr("dy", ".3em");

	node.append("title")
		.attr("class", "title");

	nodeSel.select(".text")
		.text(function(d) { return d.has_char ? d.character : "?"; });
	nodeSel.select(".title")
		.text(function(d){ return d.type_full; });
	nodeSel.select(".circle")
		.attr("stroke", function(d) { return scale(d.type); });

	nodeSel.transition()
		.duration(animation_delay)
		.attr("transform", function(d) {
			return horizontal_tree ?
				"translate(" + d.y + ","+ d.x +")" : "translate(" + d.x + ","+ d.y +")";
		});

	nodeSel.exit()
		.transition()
		.duration(animation_delay/2)
		.style("opacity", 0.1)
		.remove();
}

function update(character, base_id){
	base_id = typeof base_id !== 'undefined' ? base_id : 1;

	var character_decomp = get_decomposition(character, base_id);
	var depth = getDepth(character_decomp);

	var tree = d3.layout.tree()
		.size([width, Math.min(40*depth, height - 2*(node_radius+1)) ]);
	var nodes = tree.nodes(character_decomp);
	var links = tree.links(nodes);
	drawLinks(links);
	drawNodes(nodes);
}

function getDepth(data){
	if(!data.children || data.children.length === 0){
		return 1;
	}
	return Math.max.apply(null, data.children.map(function(c) { return getDepth(c); })) + 1;
}

function clean_line(line){
	line = line.replace(":", ",");
	line = line.replace("(", ",");
	line = line.replace(")", "");
	return line;
}

function parse_decomposition_data(data){
	var lines = data.split('\r\n');
	for(var i=0;i<lines.length;i++){
		if(lines[i].length === 0) continue;

		var row_data = clean_line(lines[i]).split(",");
		var character = row_data[0];
		var decomposition_type = row_data[1];
		var components = [];
		for(var j=2; j<row_data.length; j++){
			if(row_data[j] !== ""){ // "c" decomposition
				components.push(row_data[j]);
			}
		}
		decomp[character] = {
			character: character,
			type: decomposition_type[0],
			type_full: decomposition_type,
			components: components
		};
	}
}


$(function(){
	svg = d3.select("#svg").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", horizontal_tree ?
		"translate(" +(node_radius+1) +",0)" : "translate(0,"+ (node_radius+1) +")");

	$.get("cjk-decomp-0.4.0.txt", function(data){
		parse_decomposition_data(data);
		$("#submit")
			.prop('disabled', false)
			.click(function() {	update($("#char").val()[0]); });
	});


});


