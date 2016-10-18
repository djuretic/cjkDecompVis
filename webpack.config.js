const path = require("path");

module.exports = {
	entry: path.resolve(".", "src", "main.ts"),
	// devtool: 'source-map',
	output: {
		path: 'dist',
		filename: 'app.bundle.js',
		publicPath: '/dist/'
	},
	resolve: {
		extensions: ["", ".js", ".ts"],
	},
	module: {
		loaders: [
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