var express = require('express');
var router = express.Router();
var Profile = require('../lib/profile');

router.get('/:profile_id', function (req, res, next) {
  Profile.get(req.params.profile_id, function (err, profile) {
    if (err) { return next(err); }
    if (!profile) {
      return res.status(404).send({ message: 'Resource not found' });
    }
    res.json(profile);
  });
});

router.put('/:profile_id', function (req, res, next) {
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

  profile.save(function (err) {
    if (err) {
      if (err.type === 'conflict') {
        return res.status(409).send();
      }
      return next(err);
    }
    res.send();
  });
});

module.exports = router;
