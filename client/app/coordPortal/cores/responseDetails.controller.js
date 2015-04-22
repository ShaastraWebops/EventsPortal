'use strict';

angular.module('erp2015App')
  // .controller('CoordPortalDashboardCtrl', function ($scope, $location, $http, CoordPortalService, Auth, FileUploader) {
  .controller('CoordPortalResponseDetailsCtrl', function ($scope, $state, $location, $stateParams, $http, CoordPortalService, Auth) {

    $scope.responseDetails = 0;
    $scope.user = Auth.getCurrentUser();
    $scope.showAll = false;

    if ($scope.user.role === 'user')
      $state.go('coordPortalCoresCtrl');
    if (!$scope.user)
      $state.go('LoginCtrl');

    CoordPortalService.showResponse($stateParams.id)
      .then(function (data) {
        // console.log(data);
        $scope.response = data;
      });

    $scope.getApplications = function(id) {
      $scope.showAll = true;
      CoordPortalService.userAppliedFor(id)
      .then(function (data) {
        // console.log(data);
        $scope.forms = data;
      });
    };

    $scope.saveFeedback = function() {
      var backupResponse = angular.copy($scope.response);
      $scope.response.form = $scope.response.form._id;
      $scope.response.user = $scope.response.user._id;
      console.log($scope.response);
      if (!$scope.response.status) $scope.response.status = "Pending";
      $http.put('/api/coordForms/response/' + $scope.response._id + '/', $scope.response)
        .success(function (response) {
          console.log(response);
          $scope.response = angular.copy(backupResponse);
          $scope.showSaved = 1;
        })
        .error(function (err) {
          console.log(err);
        })
    };

  });