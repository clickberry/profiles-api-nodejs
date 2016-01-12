var app = require('..');
var request = require('supertest');
var uuid = require('node-uuid');
var jwt = require('jsonwebtoken');

function getAuthToken(userId) {
  return jwt.sign({ userId: userId }, process.env.TOKEN_ACCESSSECRET);
}

function createProfile(id, name, email, avatarUrl, fn) {
  var auth_token = getAuthToken(id);

  request(app)
    .post('/' + id + '?auth_token=' + auth_token)
    .send({id: id, name: name, email: email, avatarUrl: avatarUrl})
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201)
    .end(function (err, res) {
      fn(err, {body: res.body, auth_token: auth_token});
    });
}

describe('GET /', function () {
  var id = uuid.v4();
  it('get unauthorized profile', function (done) {
    request(app)
      .get('/' + id)
      .expect(401, done);
  });
});

describe('GET /', function () {
  var id = uuid.v4();
  it('get unexisting profile', function (done) {
    request(app)
      .get('/public/' + id)
      .expect(404, done);
  });
});

describe('POST /', function () {
  var profile = {};
  var profile_auth_token;

  after(function (done) {
    request(app)
      .del('/' + profile.id + '?auth_token=' + profile_auth_token)
      .expect(200, done);
  });

  it('create profile without authorization', function (done) {
    var id = uuid.v4();
    request(app)
      .post('/' + id)
      .send({})
      .expect(401, done);
  });

  it('create profile for different user', function (done) {
    var id = uuid.v4();
    var differentId = uuid.v4();
    var userId = uuid.v4();
    var auth_token = getAuthToken(differentId);

    request(app)
      .post('/' + id + '?auth_token=' + auth_token)
      .send({})
      .expect(403, done);
  });

  it('create profile', function (done) {
    var id = uuid.v4();
    var name = 'name' + id;
    var email = id + '@clickberry.com';
    var avatarUrl = id;
    createProfile(id, name, email, avatarUrl, function (err, data) {
      if (err) { return done(err); }
      profile = data.body;
      profile_auth_token = data.auth_token;
      done();
    });
  });

  it('create for already existing email', function (done) {
    var id = uuid.v4();
    var auth_token = getAuthToken(id);
    var email = profile.email;
    var name = 'name' + id;

    request(app)
      .post('/' + id + '?auth_token=' + auth_token)
      .send({id: id, name: name, email: email})
      .expect(409, done);
  });

  it('query by id', function (done) {
    request(app)
      .get('/' + profile.id + '?auth_token=' + profile_auth_token)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(profile, done);
  });
});

describe('PUT /', function () {
  var id = uuid.v4();
  var name = 'name' + id;
  var email = id + '@clickberry.com';
  var avatarUrl = id;
  var profile = {};
  var profile_auth_token;

  after(function (done) {
    request(app)
      .del('/' + profile.id + '?auth_token=' + profile_auth_token)
      .expect(200)
      .end(done);
  });

  it('create profile', function (done) {
    createProfile(id, name, email, avatarUrl, function (err, data) {
      if (err) { return done(err); }
      profile = data.body;
      profile_auth_token = data.auth_token;
      done();
    });
  });

  it('update non-owned profile', function (done) {
    request(app)
      .put('/' + uuid.v4() + '?auth_token=' + profile_auth_token)
      .send(profile)
      .expect(403)
      .end(done);
  });

  it('update profile name', function (done) {
    profile.name = "new name";
    request(app)
      .put('/' + profile.id + '?auth_token=' + profile_auth_token)
      .send(profile)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);
  });

  it('update profile email', function (done) {
    profile.email = "new_email@clickberry.com";
    request(app)
      .put('/' + profile.id + '?auth_token=' + profile_auth_token)
      .send(profile)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);
  });

  it('update profile avatar url', function (done) {
    profile.avatarUrl = "http://clickberry.tv/favicon.png";
    request(app)
      .put('/' + profile.id + '?auth_token=' + profile_auth_token)
      .send(profile)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);
  }); 

  it('get updated profile', function (done) {
    request(app)
      .get('/' + profile.id + '?auth_token=' + profile_auth_token)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(profile, done);
  });
});

describe('DELETE /', function () {
  var id = uuid.v4();
  var name = 'name' + id;
  var email = id + '@clickberry.com';
  var avatarUrl = id;
  var profile = {};
  var profile_auth_token;

  it('create profile', function (done) {
    createProfile(id, name, email, avatarUrl, function (err, data) {
      if (err) { return done(err); }
      profile = data.body;
      profile_auth_token = data.auth_token;
      done();
    });
  });

  it('delete profile without authorization', function (done) {
    request(app)
      .del('/' + profile.id)
      .expect(401, done);
  });

  it('delete profile by non-owner', function (done) {
    var auth_token = getAuthToken(uuid.v4());
    request(app)
      .del('/' + profile.id + '?auth_token=' + auth_token)
      .expect(403, done);
  });

  it('delete profile', function (done) {
    request(app)
      .del('/' + profile.id + '?auth_token=' + profile_auth_token)
      .expect(200, done);
  });
});
