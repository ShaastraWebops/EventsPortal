'use strict';

var FormViewCtrl = angular.module('erp2015App').controller('FormViewCtrl', function ($scope, CoordPortalService, $stateParams, $http) {
    $scope.form = {};
	// read form with given id
	CoordPortalService.formById($stateParams.id).then(function (form) {
		$scope.form = form;
		console.log(form);
	});
});
