/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.stacktrace = suite_l10n.stacktrace || {};

suite_l10n.stacktrace.StackTrace = (new function () {
  var logEntries = [];
  var logSequence = 0;

  this.initializeLogs = function initializeLogs (functionName) {
    logEntries = [];
    logSequence = 0;
  };

  this.addLogEntry = function addLogEntry (functionName) {
    if (logEntries.length > 20) {
      logEntries.splice(0, 1);
    }

    logEntries.push('Order: ' + (++logSequence) + ' | Function called: ' +
      functionName + '');
  };

  this.logAndShowError = function logAndShowError (exceptionObject, nsObjError) {
    var errorMsgLogForUser = '';
    var errorMsgLogForAdmin = '';
    var errorCode = 'PAYMENT GATEWAY ERROR';
    var errorHeading = ' [ERROR ENCOUNTERED] - ';
    var errorTriggeredByUser = 'TRIGGERED BY USER: ';
    var errorTriggeredByScript = 'SCRIPT ID: ';
    var userName = nlapiGetContext().getName();
    var scriptId = nlapiGetContext().getScriptId() || '';
    var scriptStackTrace = [
      'SCRIPT STACK TRACE: <br/>',
      logEntries.join('<br/>')].join('');

    if (exceptionObject instanceof nsObjError) {
      errorMsgLogForUser = [
        'CODE: ',
        exceptionObject.getCode(),
        '\n',
        'DETAILS: ',
        exceptionObject.getDetails(),
        '\n'].join('');
      errorMsgLogForAdmin = [
        'CODE: ',
        exceptionObject.getCode(),
        '<br/>',
        'DETAILS: ',
        exceptionObject.getDetails(),
        '<br/>',
        'STACK TRACE:\n',
        (exceptionObject.getStackTrace()),
        '<br/>'].join('');
    } else {
      errorMsgLogForUser = [
        'DETAILS: ',
        exceptionObject.rhinoException,
        '\n'].join('');
      errorMsgLogForAdmin = [
        'DETAILS: ',
        exceptionObject.rhinoException,
        '<br/>',
        'STACK:\n',
        (exceptionObject.stack)].join('');
    }

    // LOG error for administrator
    nlapiLogExecution('SYSTEM', errorCode, [
      errorHeading + errorCode,
      '<br/>',
      errorTriggeredByUser,
      userName,
      '<br/>',
      errorTriggeredByScript,
      scriptId,
      '<br/>',
      errorMsgLogForAdmin,
      scriptStackTrace].join(''));

    // THROW error for user
    throw nlapiCreateError(errorCode, [
      errorHeading + errorCode,
      '\n',
      errorTriggeredByUser,
      userName,
      '\n',
      errorTriggeredByScript,
      scriptId,
      '\n',
      errorMsgLogForUser].join(''));
  };

  return this;
}());
