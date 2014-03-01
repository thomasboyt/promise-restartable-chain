A restartable promise chain. Uses q internally.

Usage:

```js
// create a chain
var chain = new RestartableChain([firstFn, secondFn, thirdFn...]);

// run chain
chain.execute().done(function(payload) {
  console.log('chain succeeded!');
}, function(err) {
  console.log('a promise was rejected');
  console.log(chain.fns[chain.fnIndex]);  // the function that rejected

  // retry by just calling execute again. it will retry the function that rejected and continue from there
  chain.execute().then(...);
});
```

If the chain has been previously run & errored, this method will restart from the function that rejected. - i.e, if secondFn rejects, then rerunning chain.execute() will run secondFn and thirdFn
