var events = require('events');
var util = require('util');
var nsq = require('nsqjs');

function Bus(options) {
  options = options || {};
  options.nsqdAddress = options.nsqdAddress || process.env.NSQD_ADDRESS;
  options.nsqdPort = options.nsqdPort || process.env.NSQD_PORT || '4150';
  options.nsqlookupdAddresses = options.nsqlookupdAddresses || process.env.NSQLOOKUPD_ADDRESSES;

  var bus = this;
  events.EventEmitter.call(this);

  // connect to the Bus
  var writer = new nsq.Writer(options.nsqdAddress, parseInt(options.nsqdPort, 10));
  writer.connect();
  writer.on('ready', function () {
    bus._writer = writer;
  });

  // register readers
  var lookupdHTTPAddresses = options.nsqlookupdAddresses.split(',');

  var registrations_reader = new nsq.Reader('registrations', 'create-profile', {
    lookupdHTTPAddresses: lookupdHTTPAddresses
  });
  registrations_reader.connect();
  registrations_reader.on('message', function (msg) {
    bus.emit('registration', msg);
  });

  var deletes_reader = new nsq.Reader('account-deletes', 'delete-profile', {
    lookupdHTTPAddresses: lookupdHTTPAddresses
  });
  deletes_reader.connect();
  deletes_reader.on('message', function (msg) {
    bus.emit('delete', msg);
  });
}

util.inherits(Bus, events.EventEmitter);

Bus.prototype.publishUpdateProfile = function (profile, fn) {
  if (!fn) {
    fn = function () {};
  }

  this._writer.publish('profile-updates', profile, function (err) {
    if (err) { return fn(err); }
    fn();
  });
};

module.exports = Bus;
