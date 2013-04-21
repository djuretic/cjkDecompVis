
var width = 350,
    height = 500,
    decomp = {},
    nodeRadius = 12,
    animationDelay = 1000,
    horizontalTree = false;

var svg;

var link = d3.svg.diagonal();
if(horizontalTree){
	link = link.projection(function(d) { return [d.y, d.x]; });
}
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
		.insert("path", ":first-child")  //to avoid overlap with nodes
		.attr("class", "link")
		.attr("d", function(d){
			return link({
				source: {x: d.source.x - width, y: d.source.y},
				target: {x: d.target.x - width, y: d.target.y}
			});
		});
	linkSel.transition()
		.duration(animationDelay)
		.attr("d", link);
	linkSel.exit()
		.transition()
		.duration(animationDelay/2)
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
			return horizontalTree ?
				"translate(" + (d.y - width) + ","+ d.x +")" : "translate(" + (d.x - width) + ","+ d.y +")";
		})
		.on("click", function(d){
			update(d.character, d.id);
		});

	node.append("circle")
		.attr("class", "circle")
		.attr("r", nodeRadius);

	node.append("text")
		.attr("class", "text")
		.attr("dy", ".3em");

	node.append("title")
		.attr("class", "title");

	nodeSel.select(".text")
		.text(function(d) { return d.hasChar ? d.character : "?"; });
	nodeSel.select(".title")
		.text(function(d){ return d.typeFull; });
	nodeSel.select(".circle")
		.attr("stroke", function(d) { return scale(d.type); });

	nodeSel.transition()
		.duration(animationDelay)
		.attr("transform", function(d) {
			return horizontalTree ?
				"translate(" + d.y + ","+ d.x +")" : "translate(" + d.x + ","+ d.y +")";
		});

	nodeSel.exit()
		.transition()
		.duration(animationDelay/2)
		.style("opacity", 0.1)
		.remove();
}

function update(character, baseId){
	baseId = typeof baseId !== 'undefined' ? baseId : 1;

	var characterDecomp = getDecomposition(character, baseId);
	var depth = getDepth(characterDecomp);

	var tree = d3.layout.tree()
		.size([width, Math.min(40*depth, height - 2*(nodeRadius+1)) ]);
	var nodes = tree.nodes(characterDecomp);
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
	.append("g")
	.attr("transform", horizontalTree ?
		"translate(" +(nodeRadius+1) +",0)" : "translate(0,"+ (nodeRadius+1) +")");

	new DataParser("cjk-decomp-0.4.0.txt", function() {
		$("#submit")
			.prop('disabled', false)
			.click(function() {	update($("#char").val()[0]); });
	}).parse();
});


