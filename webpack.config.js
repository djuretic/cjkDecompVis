const path = require("path");

module.exports = {
	entry: path.resolve(".", "src", "main.ts"),
	output: {
		path: 'dist',
		filename: 'app.bundle.js'
	},
	resolve: {
		extensions: ["", ".js", ".ts"],
	},
	module: {
		loaders: [
			{
				test: /\.js/,
				exclude: /node_modules/,
				loader: 'raw'
			},
			{
				test: /\.html/,
				loader: 'raw'
			},
			{
				test: /\.ts/,
				exclude: /node_modules/,
				loader: 'ts'
			}
		]
	}
};