var q = require('q');

require("mocha-as-promised")();
var chai = require('chai');
var expect = chai.expect;

var RestartableChain = require('../index');

describe('Restartable chain', function() {

  /*
   * Stubs
   */
  var oneCalled, twoCalled, errCalled, didError;

  var one = function() {
    oneCalled += 1;
    var dfd = q.defer();
    dfd.resolve();
    return dfd.promise;
  };

  var two = function() {
    twoCalled += 1;
    var dfd = q.defer();
    dfd.resolve('success');
    return dfd.promise;
  };

  var err = function() {
    errCalled += 1;
    var dfd = q.defer();
    if ( !didError ) {
      dfd.reject('error');
      didError = true;
    } else {
      dfd.resolve('success');
    }
    return dfd.promise;
  };

  beforeEach(function() {
    oneCalled = 0;
    twoCalled = 0;
    errCalled = 0;
    didError = false;
  });

  it('calls each fn in the chain', function() {
    var chain = new RestartableChain([one, two]);

    return chain.execute().then(function(payload) {
      expect(chain.fnIndex).to.equal(2);
      expect(payload).to.equal('success');
    });
  });

  it.only('can resume from a rejected handler', function() {
    var chain = new RestartableChain([one, err]);

    var makeRequest = function() {
      chain.execute().done(function(payload) {
        expect(oneCalled).to.equal(1);
        expect(errCalled).to.equal(2);
        expect(payload).to.equal('success');
      }, function(errPayload) {
        expect(errPayload).to.equal('error');
        return makeRequest();
      });
    };

    return makeRequest();
  });

});
