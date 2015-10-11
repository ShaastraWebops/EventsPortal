'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');

var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var Visitor = require('../api/visitor/visitor.model');

var validateJwt = expressJwt({ secret: config.secrets.session });

/**
 * Attaches the visitor object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Attach visitor to request
    .use(function(req, res, next) {
      Visitor.findById(req.visitor._id, function (err, visitor) {
        if (err) return next(err);
        if (!visitor) return res.send(401);

        visitor.lastSeen = Date.now();
        visitor.save(function(err) {
          if(err) return res.send(err);
        });
        req.visitor = visitor;
        next();
      });
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*5 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.visitor) return res.json(404, { message: 'Something went wrong, please try again.'});
  var token = signToken(req.visitor._id, 'visitor');
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;