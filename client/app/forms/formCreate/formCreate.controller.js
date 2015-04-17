'use strict';

angular.module('erp2015App')
  .controller('FormCreateCtrl', function ($scope, CoordPortalService, FormService, Auth, $http, $filter) {

    // messages for alerting purpose
    $scope.message = '';

    // preview form mode
    $scope.previewMode = false;

    $scope.options = CoordPortalService.options;
    $scope.subs = [];
    $scope.positions = [{name: 'Coordinator', value: 'coord'},
                        {name: 'Super Coordinator', value: 'superCoord'},
                       ];
    
    $http.get('/api/departments/').then(function (response) {
        $scope.departments = response.data;
    })
    // new form
    $scope.form = {};
    $scope.form.name = '';
    $scope.form.department = '';
    $scope.form.position = '';
    $scope.form.fields = [];

    // is executed if $scope.form.department is changed to get the values for the subDepartments
    $scope.change = function() {
        $scope.subs = $filter('filter')($scope.departments, function (d) {return d._id === $scope.form.department;})[0];
        $scope.subs = $scope.subs.subDepartments;
    }
    $scope.form.subDepartment = $scope.subs[0];

    // previewForm - for preview purposes, form will be copied into this
    // otherwise, actual form might get manipulated in preview mode
    $scope.previewForm = {};
    $scope.createForm = {};

    // add new field drop-down:
    $scope.addField = {};
    $scope.addField.types = FormService.fields;
    $scope.addField.new = $scope.addField.types[0].name;
    $scope.addField.lastAddedID = 0;

    // create new field button click
    $scope.addNewField = function() {

        // incr field_id counter
        $scope.addField.lastAddedID++;

        var newField = {
            'field_id' : $scope.addField.lastAddedID,
            'field_title' : 'New field - ' + ($scope.addField.lastAddedID),
            'field_type' : $scope.addField.new,
            'field_value' : '',
            'field_required' : true,
			'field_disabled' : false
        };

        // put newField into fields array
        $scope.form.fields.push(newField);
    };

    // deletes particular field on button click
    $scope.deleteField = function (field_id) {
        for(var i = 0; i < $scope.form.fields.length; i++) {
            if($scope.form.fields[i].field_id === field_id) {
                $scope.form.fields.splice(i, 1);
                break;
            }
        }
    };

    // add new option to the field
    $scope.addOption = function (field) {
        if(field.field_type === 'radio' || field.field_type === 'dropdown' || field.field_type === 'checkbox') {
            if(!field.field_options) {
                field.field_options = [];
            }
                
            var lastOptionID = 0;

            if(field.field_options[field.field_options.length-1]) {
                lastOptionID = field.field_options[field.field_options.length-1].option_id;
            }

            // new option's id
            var option_id = lastOptionID + 1;

            var newOption = {
                'option_id' : option_id,
                'option_title' : 'Option ' + option_id,
                'option_value' : field.field_type + '_' + field.field_id + '_' + option_id
            };

            // put new option into field_options array
            field.field_options.push(newOption);
        } else {
            window.alert('Nice try! But you cannot add an option for this field type!');
        }
    };

    // delete particular option
    $scope.deleteOption = function (field, option){
        for(var i = 0; i < field.field_options.length; i++){
            if(field.field_options[i].option_id === option.option_id){
                field.field_options.splice(i, 1);
                break;
            }
        }
    };

    // preview form
    $scope.previewOn = function() {
        if($scope.form.fields === null || $scope.form.fields.length === 0) {
            var title = 'Error';
            var msg = 'No fields added yet, please add fields to the form before preview.';
            // var btns = [{result:'ok', label: 'OK', cssClass: 'btn-primary'}];

            window.alert(title + ' : ' + msg);
            // $dialog.messageBox(title, msg, btns).open();
        }
        else {
            $scope.previewMode = !$scope.previewMode;
            $scope.form.submitted = false;
            angular.copy($scope.form, $scope.previewForm);
        }
    };

    // hide preview form, go back to create mode
    $scope.previewOff = function() {
        $scope.previewMode = !$scope.previewMode;
        $scope.form.submitted = false;
    };

    // decides whether field options block will be shown (true for dropdown and radio fields)
    $scope.showAddOptions = function (field){
        if(field.field_type === 'radio' || field.field_type === 'dropdown' || field.field_type === 'checkbox'){
            return true;
        }
        else{
            return false;
        }
    };

    // deletes all the fields
    $scope.reset = function (){
        $scope.form.fields.splice(0, $scope.form.fields.length);
        $scope.addField.lastAddedID = 0;
    };

    // creates the form
    $scope.createForm = function() {
        console.log($scope.form);
        alert($scope.form);
        if($scope.form.fields === null || $scope.form.fields.length === 0) {
            window.alert('Please choose some fields to save!');
        } else if($scope.form.role === '' || $scope.form.department === '') {
            window.alert('Please select the "role", "department" and "sub-department"');
        } else {
            angular.copy($scope.form, $scope.createForm);
            // need to do some stuff here
            console.log($scope.form);
            $http.post('/api/coordForms', $scope.form).success(function (message) {
                    $scope.message = message;
                    console.log('Form Saved');
                })
                .error(function (message) {
                    $scope.message = 'error';
                    console.log('Error');
                });
                
            $scope.form = {};            
        }
    };

    // deletes the alert
    $scope.closeAlert = function() {
        $scope.message = '';
    };

});
