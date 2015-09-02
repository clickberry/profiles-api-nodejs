var express = require('express');
var router = express.Router();
var Profile = require('../lib/profile');
var Bus = require('../lib/bus');
var bus = new Bus();
var passport = require('passport');
require('../config/jwt')(passport);

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
      res.json(profile);
    });
  });

router.get('/public/:profile_id',
  function (req, res, next) {
    Profile.get(req.params.profile_id, function (err, profile) {
      if (err) { return next(err); }
      if (!profile) {
        return res.status(404).send({ message: 'Resource not found' });
      }
      res.json({
        id: profile.id,
        name: profile.name
      });
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
      email: req.body.email
    });

    if (!profile.id ||
        !profile.name ||
        !profile.email) {
      return res.status(400).send();
    }

    profile.update(function (err) {
      if (err) {
        if (err.type === 'conflict') {
          return res.status(409).send();
        }
        return next(err);
      }

      bus.publishUpdateProfile(profile);
      res.send();
    });
  });

module.exports = router;
