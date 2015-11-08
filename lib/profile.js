// env
if (!process.env.REDIS_ADDRESS) {
  console.log("REDIS_ADDRESS environment variable required.");
  process.exit(1);
}

var redis = require('redis');
var db = redis.createClient(parseInt(process.env.REDIS_PORT, 10) || 6379, process.env.REDIS_ADDRESS);

function Profile(obj) {
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      this[key] = obj[key];
    }
  }
}

function setProfileData(id, profile, fn) {
  db.hmset('profile:' + id, profile, function (err) {
    fn(err);
  });
}

function unindexProfileByEmail(id, profile, fn) {
  db.del('profile:id:' + profile.email, id, function (err) {
    fn(err);
  });
}

function indexProfileByEmail(id, profile, fn) {
  db.set('profile:id:' + profile.email, id, function (err) {
    fn(err);
  });
}

Profile.prototype.update = function (fn) {
  var profile = this;
  var id = profile.id;

  Profile.get(id, function (err, original) {
    if (err) { return fn(err); }
    if (!original) {
      err = new Error('Profile with id ' + id + ' does not exist.');
      err.type = 'notFound';
      return fn(err);
    }

    // check if email not occupied
    Profile.getId(profile.email, function (err, email_id) {
      if (err) { return fn(err); }
      if (email_id && email_id !== id) {
        err = new Error('Email already occupied.');
        err.type = 'conflict';
        return fn(err);
      }

      if (original.email) {
        // remove old profile email index
        unindexProfileByEmail(id, original, function (err) {
          if (err) { return fn(err); }
          // index profile id by email
          indexProfileByEmail(id, profile, function (err) {
            if (err) { return fn(err); }
            setProfileData(id, profile, fn);
          });
        });
      } else {
        // index profile id by email
        indexProfileByEmail(id, profile, function (err) {
          if (err) { return fn(err); }
          setProfileData(id, profile, fn);
        });
      }
    });
  });
};

Profile.getId = function (email, fn) {
  db.get('profile:id:' + email, fn);
};

Profile.get = function (id, fn) {
  db.hgetall('profile:' + id, function (err, profile) {
    if (err) { return fn(err); }
    if (!profile) { return fn(); }
    fn(null, new Profile(profile));
  });
};

Profile.prototype.toJSON = function () {
  return {
    id: this.id,
    name: this.name,
    email: this.email
  };
};

module.exports = Profile;