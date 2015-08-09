'use strict';

var express = require('express');
var controller = require('./event.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/getMultiple/:id', controller.getMultiple);
router.post('/', auth.hasRole('core'), controller.create);
router.put('/:id', auth.hasRole('coord'), controller.update);
router.patch('/:id', auth.hasRole('coord'), controller.update);
router.patch('/toggleVisiblity/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('core'), controller.destroy);

module.exports = router;