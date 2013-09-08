function DataParser(url, callback){
	this.url = url;
	this.callback = callback;
}

DataParser.prototype.parse = function() {
	var parser = this;
	$.get(this.url, function(data){
		parser.parseDecompositionData(data);
		parser.callback(decomp);
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
