
var width = 350,
    height = 500,
    decomp = {},
    node_radius = 12;

var svg;

var tree = d3.layout.tree()
	.size([width, height - 2*(node_radius+1) ]);

var link = d3.svg.diagonal();
var scale = d3.scale.category10();

function get_decomposition(character){
	var character_decomp = decomp[character];
	var children = [];
	if(character_decomp.components){
		character_decomp.components.forEach(function(component){
			children.push(get_decomposition(component));
		});
	}
	return {
		character: character,
		type: character_decomp.type,
		has_char: character.length <= 1,
		children: children
	};
}

function drawLinks(links){
	link_sel = svg.selectAll(".link")
		.data(links);

	link_sel.enter()
		.insert("path", ":first-child")  //to avoid overlap with nodes
		.attr("class", "link");
	link_sel.attr("d", link);
	link_sel.exit().remove();
}

function drawNodes(nodes){
	var node_sel = svg.selectAll(".node")
		.data(nodes);

	var node = node_sel.enter()
		.append("g")
		.attr("class", "node")
		.on("click", function(d){
			update(d.character);
		});

	node.append("circle")
		.attr("class", "circle")
		.attr("r", node_radius);

	node.append("text")
		.attr("class", "text")
		.attr("dy", ".3em");

	node_sel.select(".text")
		.text(function(d) { return d.has_char ? d.character : "?"; });
	node_sel.select(".circle")
		.attr("stroke", function(d) { return scale(d.type); });

	node_sel.attr("transform", function(d) { return "translate(" + d.x + ","+ d.y +")"; });
	node_sel.exit().remove();
}

function update(character){
	var nodes = tree.nodes(get_decomposition(character));
	var links = tree.links(nodes);
	drawLinks(links);
	drawNodes(nodes);
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
	.attr("transform", "translate(0,"+ (node_radius+1) +")");

	$.get("cjk-decomp-0.4.0.txt", function(data){
		parse_decomposition_data(data);
		$("#submit")
			.prop('disabled', false)
			.click(function() {	update($("#char").val()); });
	});


});


