var events = require('events');
var util = require('util');
var nsq = require('nsqjs');

function Bus(options) {
  options = options || {};
  options.nsqdAddress = options.nsqdAddress || process.env.NSQD_ADDRESS;
  options.nsqdPort = options.nsqdPort || process.env.NSQD_PORT || '4150';

  var bus = this;
  events.EventEmitter.call(this);

  // connect to the Bus
  var writer = new nsq.Writer(options.nsqdAddress, parseInt(options.nsqdPort, 10));
  writer.connect();
  writer.on('ready', function () {
    bus._writer = writer;
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
