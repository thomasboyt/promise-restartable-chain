/**
 * A restartable promise chain using q (tho it could be adapted for other libs).
 *
 * Usage:
 *   var chain = new RestartableChain([firstFn, secondFn, thirdFn...]);
 *
 * chain.execute() - run chain, returning an XHR that is resolved if all promises
 * in the chain resolve, otherwise rejects at first rejection.
 *
 * If the chain has been previously run & errored, this method will restart from the
 * function that rejected.
 * i.e, if secondFn rejects, then rerunning chain.execute() will run secondFn and thirdFn
 */

var q = require('q');

var RestartableChain = function(fns) {
  this.fns = fns;
  this.fnIndex = 0;
};

RestartableChain.prototype._next = function() {

  var idx = this.fnIndex;
  if ( idx >= this.fns.length ) {
    this.dfd.resolve(this.lastPayload);
    return;
  }

  this.fns[idx](this.lastPayload).then(function(payload) {
    this.fnIndex += 1;
    this.lastPayload = payload;
    this._next();
  }.bind(this), function(err) {
    this.dfd.reject(err);
  }.bind(this));

  return this.dfd.promise;
};

RestartableChain.prototype.execute = function() {
  // reset the promise
  this.dfd = q.defer();

  return this._next();
};

module.exports = RestartableChain;
