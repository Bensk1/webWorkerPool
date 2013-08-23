webWorkerPool.js
=============

webWorkerPool.js a rudimentary implementation of a web worker pool (thread pool) and an easy way to execute your functions in a multithreaded manner

## Usage

Simply create a WorkerPool:

```javascript
var myPool = new WorkerPool(2);
```

add tasks to the pool:

```javascrip
myPool.fnExecute(yourFunction, callbackMethod, param);
myPool.fnExecute(yourOtherFunction, callbackMethod, paramOne, paramTwo);
myPool.fnExecute(yourFunction, callbackMethod, param);
```

Since we are adding three tasks to a pool containing only two threads it is likely that the workers are still busy when the third task is added. The pool will run this task as soon as one of the workers is available. 

You are able to close the pool whenever you want:

```javascript
myPool.fnClose();
```

If you close the pool and either tasks are waiting for execution or are being executed at the moment, the execution of all tasks will be finished before the pool gets closed. After calling fnClose no new tasks can be added.