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
  passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
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

router.get('/public/list/:profile_ids',
  function (req, res, next) {
    var ids = req.params.profile_ids.split(',');
    if (ids.length == 0) {
      return res.json([]);
    } else if (ids.length > 100) {
      ids.length = 100;
    }

    function loadProfileById(id, fn) {
      Profile.get(id, function (err, profile) {
        if (err) { return fn(); }
        if (!profile) {
          return fn();
        }

        var profileModel = ProfileModel.create();
        profileModel.update(profile);
        return fn(profileModel.toJSON());
      });
    }

    var i;
    var profiles = [];
    var done = 0;
    for (i = 0; i < ids.length; ++i) {
      (function (id) {
        loadProfileById(id, function (p) {
          done++;
          if (p != null) {
            profiles.push(p);
          }

          if (done == ids.length) {
            res.json(profiles);
          }
        });
      })(ids[i]);
    }
  });

router.post('/:profile_id',
  passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
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
        profile.save(function (err) {
          if (err) {
            if (err.type === 'conflict') {
              return res.status(409).send();
            }
            return next(err);
          }

          return res.status(201).json(profileModel.toJSON(['default', 'private']));
        });
      } else {
        res.status(400).send({ errors: profileModel.errors });
      }
    });
  });

router.put('/:profile_id',
  passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
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
            return res.json(profileModel.toJSON(['default', 'private']));
          });
        });
      } else {
        res.status(400).send({ errors: profileModel.errors });
      }
    });
  });

router.delete('/:profile_id',
  passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
  function (req, res, next) {
    if (req.payload.userId !== req.params.profile_id) {
      return res.status(403).send();
    }

    Profile.get(req.params.profile_id, function (err, data) {
      if (err) { return next(err); }
      if (!data) {
        return res.status(404).send({ message: 'Resource not found' });
      }

      Profile.del(req.params.profile_id, function (err) {
        if (err) { return next(err); }
        res.send();
      });
    });        
  });  

module.exports = router;
