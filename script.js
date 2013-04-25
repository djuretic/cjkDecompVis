
var width = 900,
	height = 500,
	decomp = {},
	nodeRadius = 16,
	fontSize = 18,
	animationDelay = 250;

var svg, force;
var link = d3.svg.line();

var scale = d3.scale.category10();

function getDecomposition(character, baseId){
	var characterDecomp = decomp[character];
	if(!characterDecomp){
		return {
			id: baseId,
			maxId: baseId,
			character: character,
			hasChar: true
		};
	}
	var children = [],
		maxId = baseId;
	if(characterDecomp.components){
		characterDecomp.components.forEach(function(component){
			maxId++;
			childDecomp = getDecomposition(component, maxId);
			maxId = childDecomp.maxId;
			children.push(childDecomp);
		});
	}
	return {
		id: baseId,
		maxId: maxId,
		character: character,
		type: characterDecomp.type,
		typeFull: characterDecomp.typeFull,
		hasChar: character.length <= 1,
		children: children
	};
}

function drawLinks(links){
	linkSel = svg.selectAll(".link")
			.data(links, function(d){ return d.source.id + "-" + d.target.id; });
	linkSel.enter()
		.insert("line", ":first-child")  //to avoid overlap with nodes
		.attr("class", "link");
	linkSel.exit().remove();
}

function drawNodes(nodes){
	var nodeSel = svg.selectAll(".node")
		.data(nodes, function(d){ return d.id; });

	var node = nodeSel.enter()
		.append("g")
		.attr("class", "node")
		.call(force.drag);

	node.append("circle")
		.attr("class", "circle");

	node.append("text")
		.attr("class", "text")
		.attr("dy", ".3em");

	node.append("title")
		.attr("class", "title");

	nodeSel.select(".text")
		.style("font-size", function(d) { return (fontSize - d.depth) + "px"; })
		.text(function(d) { return d.hasChar ? d.character : "?"; });
	nodeSel.select(".title")
		.text(function(d){ return d.typeFull; });
	nodeSel.select(".circle")
		.attr("stroke", function(d) { return scale(d.type); })
		.attr("r", function(d) { return nodeRadius - d.depth; })
		.style("stroke-width", function(d) { return d.depth === 0 ? "2px" : "1.2px"; });

	nodeSel.exit()
		.transition()
		.duration(animationDelay)
		.style("opacity", 0.1)
		.remove();
}

function update(character, baseId){
	baseId = typeof baseId !== 'undefined' ? baseId : 1;

	var characterDecomp = getDecomposition(character, baseId);
	var depth = getDepth(characterDecomp);

	var tree = d3.layout.tree();
	var nodes = tree.nodes(characterDecomp);
	nodes.forEach(function(n) { delete n.x; delete n.y; delete n.px; delete n.py; });
	var links = tree.links(nodes);

	force = d3.layout.force()
		.size([width, height])
		.charge(-400)
		.friction(0.85)
		.nodes(nodes)
		.links(links)
		.linkDistance(function(d) { return 20 - 2*d.source.depth; })
		.on("tick", tick)
		.start();
	for (var i = 0; i < 100; i++) force.tick();

	drawLinks(links);
	drawNodes(nodes);
}

function tick(){
	svg.selectAll(".link")
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
	svg.selectAll(".node").attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function getDepth(data){
	if(!data.children || data.children.length === 0){
		return 1;
	}
	return Math.max.apply(null, data.children.map(function(c) { return getDepth(c); })) + 1;
}

function DataParser(url, callback){
	this.url = url;
	this.callback = callback;
}

DataParser.prototype.parse = function() {
	var parser = this;
	$.get(this.url, function(data){
		parser.parseDecompositionData(data);
		parser.callback();
	});
};

DataParser.prototype.cleanLine = function(line){
	line = line.replace(":", ",");
	line = line.replace("(", ",");
	line = line.replace(")", "");
	return line;
};

DataParser.prototype.parseDecompositionData = function(data){
	var lines = data.split('\r\n');
	for(var i=0;i<lines.length;i++){
		if(lines[i].length === 0) continue;

		var rowData = this.cleanLine(lines[i]).split(",");
		var character = rowData[0];
		var decompositionType = rowData[1];
		var components = [];
		for(var j=2; j<rowData.length; j++){
			if(rowData[j] !== ""){ // "c" decomposition
				components.push(rowData[j]);
			}
		}
		decomp[character] = {
			character: character,
			type: decompositionType[0],
			typeFull: decompositionType,
			components: components
		};
	}
};

$(function(){
	svg = d3.select("#svg").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g");

	new DataParser("cjk-decomp-0.4.0.txt", function() {
		$("#submit")
			.prop('disabled', false)
			.click(function() {	update($("#char").val()[0]); });
	}).parse();
});


