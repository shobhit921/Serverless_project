const fs = require('fs');
const request = require('request');
var PORT = process.env.PORT | '3000';


const providers = require('../providers');

let config = {
    provider: {},
    function: {},
    test: {}
  };
  
  let latencyTest = {
    type: 'latency',
    delayCallback: i => 60000 * (Math.floor((i - 1) / 5) + 1),
    maxDelay: 180000
  };
  
  let throughputTest = {
    type: 'throughput',
    width: 15,
    duration: 10000,
  };
  
  let keepAliveTest = {
    type: 'latency',
    delayCallback: i => i ,
    maxDelay: 101
  };


function run(config, verifyRemoval, callback) {
    providers.prepareFunctions(config.provider, () => {
      providers.removeFunctions(config.provider, removeCode => {
        if (verifyRemoval && removeCode != 0) {
          throw new Error('Function removal failed with code ' + removeCode);
        }
        providers.deployFunctions(config.provider, (deployCode, uri) => {
          if (deployCode != 0) {
            throw new Error('Function deployment failed with code ' + deployCode);
          }
  
          switch (config.test.type) {
            case 'latency':
              executeLatencyTest(
                [],
                0,
                config.test.delayCallback,
                config.test.maxDelay,
                config.function.duration,
                uri,
                callback);
              break;
            case 'throughput':
              executeThroughputTest(
                [],
                1,
                config.test.width,
                config.test.duration,
                config.function.duration,
                uri,
                callback);
              break;
          }
        });
      });
    });
  }
  
  function executeLatencyTest(results, delay, delayCallback, maxDelay, functionDuration, uri, callback) {
    executeFunction(uri, functionDuration, result => {
      results.delay = delay;
      results.push(result);
  
      if (delay >= maxDelay) {
        callback(results);
        return;
      }
  
      let nextDelay = delay + delayCallback(results.length);
      console.log(`Delaying for ${nextDelay}ms`);
  
      setTimeout(
        executeLatencyTest,
        nextDelay,
        results, nextDelay, delayCallback, maxDelay, functionDuration, uri, callback);
    });
  }
  
  function executeThroughputTest(results, currentWidth, maxWidth, testDuration, functionDuration, uri, callback) {
    if (currentWidth > maxWidth) {
      callback(results);
      return;
    }
    console.log(`Execution throughput test with width: ${currentWidth}`);
    results[currentWidth] = results[currentWidth] || [];
  
    let startTime = null;
    let stageCompleted = false;
  
    for (let i = 0; i < currentWidth; i++) {
      executeFunction(uri, functionDuration, function processResult(result) {
        if (startTime == null) {
          startTime = Date.now();
        }
  
        results[currentWidth].push(result);
  
        if (Date.now() - startTime > testDuration) {
          if (!stageCompleted) {
            stageCompleted = true;
  
            executeThroughputTest(
              results,
              currentWidth + 1,
              maxWidth,
              testDuration,
              functionDuration,
              uri,
              callback);
          }
        } else {
          executeFunction(uri, functionDuration, processResult);
        }
      });
    }
  }
  
  function executeFunction(uri, duration, callback) {
    request.post({
      url: uri,
      body: JSON.stringify({ duration: duration }),
      headers: { 'Content-Type': 'application/json' },
      time: true
    }, (err, res, body) => {
      if (err) throw err;
      if (res.statusCode != 200) {
        throw new Error('Unexpected response. Status code: ' + res.statusCode + '. Body: ' + body);
      }
  
      let parsedBody = JSON.parse(body);
  
      let actualDuration = parsedBody.duration != undefined ? parsedBody.duration : parsedBody.output.duration;
      let instanceId = parsedBody.id || parsedBody.output.id;
  
      let overhead = res.elapsedTime - actualDuration;
  
      console.log(`Execution latency of ${overhead}ms`);
  
      callback({
        executionOverhead: overhead,
        requestStart: res.request.startTime,
        requestDuration: res.elapsedTime,
        functionDuration: actualDuration,
        instanceId: instanceId,
        body: parsedBody
      });
    });
  }


module.exports.init = function (next)  {
  // if(process.env.name==='amazon'|| process.env.name==='ibm'){
          // config.provider.name = process.env.process;    
          // next();
  // }else{
      // console.log("provider name is missing"+ process.env.NAME);
  // }
  process.argv.forEach(function (val, index, array) {
    config.provider.name = array[index];
});
  if(config.provider.name==="amazon")
  {
    config.provider.credentials = "sls config credentials -o -p aws --key  --secret ";
  }else if(config.provider.name==="ibm"){
     config.provider.credentials = "sls config credentials --provider openwhisk --apihost XXXXXX --auth username:password";
  } else {
    console.log("Incorrect Provider name. Choose between amazon or ibm");
  }
    config.function.duration = 10; //time in ms;
    config.test = throughputTest;
    //throughputTest
    // keepAliveTest
    config.test.iterations = 1; //int number of iteration



    run(config,false,function (result){
        console.log("result is "+JSON.stringify(result));
    })
}


this.init();