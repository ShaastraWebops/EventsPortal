'use strict';

angular.module('erp2015App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('departments', {
        url: '/departments',
        templateUrl: 'app/departments/departments.html',
        controller: 'DepartmentsCtrl'
      });
  });