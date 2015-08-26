var redis = require('redis');
var db = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_ADDRESS);

function Profile(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

Profile.prototype.save = function (fn) {
    if (!this.id) {
        return fn(new Error('Profile id required!'));
    } 

    var original = Profile.get(this.id);
    if (original) {
      return this.update(fn);  
    }

    // register new profile
    
};

Profile.prototype.update = function (fn) {
    var profile = this;
    var id = profile.id;

    if (profile.email) {
      // index profile id by email
      db.set('profile:id:' + profile.email, id, function (err) {
        if (err) return fn(err);
        // update profile data
        db.hmset('profile:' + id, profile, function (err) {
            fn(err);
        });
      });
    } else {
      // update profile data
      db.hmset('profile:' + id, profile, function (err) {
        fn(err);
      });
    }
    
};

Profile.getByEmail = function (email, fn) {
    Profile.getId(email, function (err, id) {
        if (err) return fn(err);
        Profile.get(id, fn);
    });
};

Profile.getId = function (email, fn) {
    db.get('profile:id:' + email, fn);
};

Profile.get = function (id, fn) {
    db.hgetall('profile:' + id, function (err, user) {
        if (err) return fn(err);
        fn(null, new Profile(user));
    });
};

Profile.prototype.toJSON = function () {
    return {
        id: this.id,
        name: this.name,
        email: this.email
    }
};

module.exports = Profile;