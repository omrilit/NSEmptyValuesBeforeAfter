/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Scheduler = function Scheduler () {
  function scheduleScript (scriptId, deploymentId, params) {
    return nlapiScheduleScript(scriptId, deploymentId, params);
  }

  function setRecoveryPoint () {
    return nlapiSetRecoveryPoint();
  }

  function yieldScript () {
    return nlapiYieldScript();
  }

  return {
    scheduleScript: scheduleScript,
    setRecoveryPoint: setRecoveryPoint,
    yieldScript: yieldScript
  };
};
