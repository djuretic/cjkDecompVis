var cjkApp = angular.module('cjkApp', []);

cjkApp.controller('AppCtrl', function($scope) {
	$scope.hanzi = '阿';
	$scope.buttonLabel = 'Loading...';
	$scope.data = {};
	$scope.dataLoaded = function() {
		return $scope.data !== {};
	}

	new DataParser("data/cjk-decomp-0.4.0.txt", function(data) {
		$scope.buttonLabel = 'Show';
		$scope.data = data;
		$scope.$apply();
	}).parse();

	$scope.update = function(hanzi){
		$scope.$broadcast('updateHanzi', hanzi);
	}
});

cjkApp.directive('decompVisualization', function() {
	return {
		restrict: 'E',
		replace: true,
		template: '<div id="svg"></div>',
		link: function(scope, element, attr){
			//TODO don't use global variable
			svg = d3.select(element[0]).append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g");

			scope.$on('updateHanzi', function(e, hanzi) {
				updateGraph(hanzi);
			});
		}
	}
});