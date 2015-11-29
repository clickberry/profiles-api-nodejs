var express = require('express');
var router = express.Router();
var Profile = require('../lib/profile');
var Bus = require('../lib/bus');
var bus = new Bus();
var passport = require('passport');
require('../config/jwt')(passport);
var ProfileModel = require('../lib/profile-model');

router.get('/heartbeat', function (req, res) {
  res.send();
});

router.get('/:profile_id',
  passport.authenticate('access-token', { session: false, assignProperty: 'payload' }),
  function (req, res, next) {
    if (req.payload.userId !== req.params.profile_id) {
      return res.status(403).send();
    }

    Profile.get(req.params.profile_id, function (err, profile) {
      if (err) { return next(err); }
      if (!profile) {
        return res.status(404).send({ message: 'Resource not found' });
      }

      var profileModel = ProfileModel.create();
      profileModel.update(profile, '*');
      res.json(profileModel.toJSON(['default', 'private']));
    });
  });

router.get('/public/:profile_id',
  function (req, res, next) {
    Profile.get(req.params.profile_id, function (err, profile) {
      if (err) { return next(err); }
      if (!profile) {
        return res.status(404).send({ message: 'Resource not found' });
      }

      var profileModel = ProfileModel.create();
      profileModel.update(profile);
      res.json(profileModel.toJSON());
    });
  });

router.put('/:profile_id',
  passport.authenticate('access-token', { session: false, assignProperty: 'payload' }),
  function (req, res, next) {
    if (req.payload.userId !== req.params.profile_id) {
      return res.status(403).send();
    }

    var profile = new Profile({
      id: req.params.profile_id,
      name: req.body.name,
      email: req.body.email,
      avatarUrl: req.body.avatarUrl
    });

    // validate model
    var profileModel = ProfileModel.create();
    profileModel.update(profile, '*');

    profileModel.validate().then(function () {
      if (profileModel.isValid) {
        profile.update(function (err) {
          if (err) {
            if (err.type === 'notFound') {
              return res.status(404).send();
            } else if (err.type === 'conflict') {
              return res.status(409).send();
            }
            return next(err);
          }

          // emit event
          bus.publishUpdateProfile(profile, function (err) {
            if (err) { return next(err); }
            return res.json(profileModel.toJSON());
          });
        });
      } else {
        res.status(400).send({ errors: profileModel.errors });
      }
    });
  });

module.exports = router;
