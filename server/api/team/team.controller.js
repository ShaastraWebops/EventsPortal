'use strict';

var _ = require('lodash');
var Team = require('./team.model');
var User = require('../user/user.model');

// Get list of teams of a user
exports.index = function(req, res) {
  User.findById(req.user._id)
  .populate('teams', 'teamMembers eventsRegistered teamName teamLeader selfTeam')
  .exec(function (err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.sendStatus(404); }
    else {
      var name = {
        path: 'teams.teamLeader teams.teamMembers',
        model: 'User',
        select: 'name'
      };
      User.populate(user, name, function (err, teams) {
        console.log(teams.teams);
        return res.json(teams.teams);
      });
    }
  });
};

// Get a single team
exports.show = function(req, res) {
  Team.findById(req.params.id, function (err, team) {
    if(err) { return handleError(res, err); }
    if(!team) { return res.sendStatus(404); }
    return res.json(team);
  });
};

// Creates a new team in the DB.
exports.create = function(req, res) {
  req.body.teamLeader = req.user._id;
  var numMembers = req.body.teamMembers.length;
  for(var i=0; i<numMembers; i++) {
    req.body.teamMembers[i] = req.body.teamMembers[i].toUpperCase();
  }

  User.find({ festID: {$in: req.body.teamMembers}}, '_id', function (err, results) {
    if(err) { return handleError(res, err); }
    req.body.teamMembers = results;
    // check if the req.body.teamMembers is an array or not
    if(Object.prototype.toString.call(req.body.teamMembers) != '[object Array]') {
      req.body.teamMembers = [];
    }

    req.body.teamMembers.push(req.user._id);

    if(req.body.teamMembers.length > 1) {
      Team.create(req.body, function (err, team) {
        if(err) { return handleError(res, err); }
        else {
          User.findById(req.user._id, function (err, currUser) {
            currUser.teams.push(team._id);
            currUser.save(function (err) {
              if(err) { return handleError(res, err); }
              else {
                return res.status(201).json(team);
              }
            });
          });
        }
      });
    } else {
      res.sendStatus(400);
    }
  });
};

// Updates an existing team in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Team.findById(req.params.id, function (err, team) {
    if (err) { return handleError(res, err); }
    if(!team) { return res.send(404); }
    else {
      if(team.teamLeader.equals(req.user._id) && !team.selfTeam) {
        var updated = _.extend(team, req.body);
        updated.save(function (err) {
          if (err) { return handleError(res, err); }
          return res.status(200).json(team);
        });
      } else {
        return res.send(403).json('Only team leader can update the team');
      }
    }
  });
};

exports.leave = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  console.log(req.params.id);
  Team.findById(req.params.id, function (err, team) {
    if (err) { return handleError(res, err); }
    if(!team) { return res.sendStatus(404); }
    else {
      if(team.selfTeam) { return res.sendStatus(400); }
      var index = team.teamMembers.indexOf(req.user._id);
      if(index > -1) {
        team.teamMembers.splice(index, 1);
      }
      var updated = _.extend(team, { teamMembers: team.teamMembers });
      updated.save(function (err) {
        if (err) { return handleError(res, err); }
        else {
          User.findById(req.user._id, function (err, user) {
            if (err) { return handleError(res, err); }
            if(!user) { return res.sendStatus(404); }
            var index = user.teams.indexOf(req.params.id);
            if(index > -1) {
              user.teams.splice(index, 1);
            }
            var updated = _.extend(user, { teams: user.teams });
            updated.save(function (err) {
              if (err) { return handleError(res, err); }
              return res.sendStatus(200);
            });
          });
        }
      });
    }  
  });
};

// Deletes a team from the DB.
exports.destroy = function(req, res) {
  Team.findById(req.params.id, function (err, team) {
    if(err) { return handleError(res, err); }
    if(!team) { return res.sendStatus(404); }
    else {
      if(team.teamLeader.equals(req.user._id)) {
        team.remove(function (err) {
          if(err) { return handleError(res, err); }
          return res.sendStatus(204);
        });
      } else {
        return res.send(403).json('Only team leader can delete the team');
      }
    }
  });
};

function handleError(res, err) {
  return res.status(500).json(err);
}