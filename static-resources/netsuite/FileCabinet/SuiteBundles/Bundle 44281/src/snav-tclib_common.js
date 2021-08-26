/**
 * @fileOverview Common library used by client and server
 * @author tcaguioa
 */
// 
/**
 * @namespace Global object for storing global variables
 */
var tcobjGlobal = tcobjGlobal || {};
tcobjGlobal.TITLE = 'Subsidiary Navigator';

// 
/**
 * @constant
 * @description System field script ids
 */
var SYSTEM_FIELDS = [ 'nsapiCT', 'nameorig', 'owner', 'entryformquerystring', '_eml_nkey_', '_multibtnstate_', 'externalid', 'wfSR', 'customwhence', 'wfVF', 'ownerid', 'nsapiSR', 'nsapiFC', 'isinactive', 'customform', 'templatestored', 'selectedtab', 'baserecordtype', 'nsapiRC', 'nsapiPS', 'nldept', 'nlrole', 'nsapiLI', 'nsapiVL', 'wfinstances', 'nsapiVI', 'nsapiVF', 'nsapiVD', 'wfPI', 'whence', 'nsbrowserenv', 'linenumber', 'type', 'wfPS', 'nsapiPI', 'nluser', 'rectype', 'nlsub', 'wfFC',
        'nsapiLC', 'nlloc' ];

/**
 * returns true if using the new ui
 * 
 * @returns {Boolean}
 */
function snavIsNewUI() {
    return true;
}

/**
 * Returns the "_oldui" suffix if old ui
 * 
 * @returns
 */
function snavAddSuffixIfOldUI() {
    return snavIsNewUI() ? '' : '_oldui';
}

/**
 * Creates a random unique number
 */
function snavRandom() {
    return (new Date()).getTime() + Math.floor((Math.random() * 1000) + 1);
}

/**
 * Obtains debugging information from the built in object arguments
 * 
 * @param {object}
 *        args Built-in arguments object from a function
 * @return {string} The details of a function's arguments
 */
function snavGetArgumentDetails(args) {
    var details = '';
    try {
        // get the function name and parameters
        var fullFunc = args.callee.toString();
        var funcAndArgs = fullFunc.substr(0, fullFunc.indexOf('{')).replace('function ', '');
        // get array of argument name
        var paramsStr = funcAndArgs.replace(args.callee.name, '').replace(')', '').replace('(', '');
        var params = paramsStr.split(',');
        details = snavGetNewLine(1) + 'Function=' + funcAndArgs.replace('\n', ' ');
        if (args.length > 0) {
            details += snavGetNewLine() + 'ARGUMENTS:' + snavGetNewLine(1);
            for (var i = 0; i < args.length; i++) {
                var paramName = 'arg' + i;
                if (snavHasValue(params[i])) {
                    paramName = params[i].trim();
                }
                var arg = '';
                if (typeof args[i] == 'object') {
                    // is it an array
                    if (args[i] instanceof Array) {
                        for (var x = 0; x < args[i].length; x++) {
                            // // arg += args[i][x];
                            // // arg += JSON.stringify((args[i][x]));
                            // var obj = (args[i])[x];
                            // if (obj instanceof nlobjSearchFilter) {
                            // arg += JSON.stringify(args[i]) ;
                            arg += snavGetObjectDetail(args[i]);
                        }
                    }

                    else {
                        try {
                            // arg += JSON.stringify(args[i]);
                            arg += args[i];
                        } catch (e) {
                            arg += args[i];
                        }

                        // nlapiLogExecution('debug', 'haller', '8 ' + i);
                    }
                } else {
                    arg = args[i];
                }
                details += paramName + '=' + arg + '<br />';
            }
        }
    } catch (e) {
        nlapiLogExecution('error', 'Subsidiary Navigator', 'error in snavGetArgumentDetails');
        return '';
    }
    return details;
}

/**
 * Error handling routine
 * 
 * @param {Object}
 *        e Exception
 * @param {Object}
 *        customMessage Any message you want included
 */
function snavHandleError(e, customMessage) {
    try {
        var fullMessage = 'EXECUTION CONTEXT' + snavGetNewLine() + snavGetContextDetails() + snavGetNewLine(1) + 'customMessage=' + customMessage + snavGetNewLine(2);
        var isInBrowser = (typeof document != 'undefined');
        if (snavHasNoValue(customMessage)) {
            customMessage = '';
        }

        fullMessage += snavGetErrorDetails(e);
        // =====================================================================================================
        // client-side stack trace
        // =====================================================================================================
        if (isInBrowser) {
            var clientStackTrace = '';
            if (snavHasValue(Error)) {
                var err = new Error();
                clientStackTrace = err.stack;
                fullMessage += 'CLIENT STACK TRACE=' + clientStackTrace + snavGetNewLine(2);
            }
            if (typeof console != 'undefined') {
                if (typeof console.error != 'undefined') {
                    console.error(tcobjGlobal.TITLE + ' Error: ' + fullMessage);
                    return fullMessage;
                }

                if (typeof console.log != 'undefined') {
                    console.log(tcobjGlobal.TITLE + ' Error: ' + fullMessage);
                    return fullMessage;
                }
            }
            nlapiLogExecution('error', tcobjGlobal.TITLE, 'Error in snavHandleError(); fullMessage=' + fullMessage);
            return fullMessage;

        } else {
            // =====================================================================================================
            // server-side stack trace
            // =====================================================================================================
            var html = fullMessage.replace(new RegExp('\n', 'gi'), '<br />');
            nlapiLogExecution('error', tcobjGlobal.TITLE + ' Error', html);
        }
        return fullMessage;
    } catch (e) {
        nlapiLogExecution('error', tcobjGlobal.TITLE, 'Error in snavHandleError(); e=' + e);
        // comment line below when released
        // throw e;
    }
}

/**
 * Returns true is the param is undefined or null or empty
 * 
 * @param {any}
 *        param
 * @return {boolean}
 */
function snavHasNoValue(param) {
    if (typeof param == 'undefined') {
        return true;
    }
    if (param === null) {
        return true;
    }
    if (param === '') {
        return true;
    }
    return false;
}

/**
 * Returns true is the param is undefined or null or empty
 * 
 * @param {any}
 *        param
 * @return {boolean}
 */
function snavHasValue(param) {
    return !snavHasNoValue(param);
}

/**
 * Returns newlines depending on the execution context
 * 
 * @param {integer}
 *        repeat Number of newlines to return
 */
function snavGetNewLine(repeat) {
    if (typeof repeat == 'undefined') {
        repeat = 1;
    }
    var newline = '';
    for (var i = 1; i <= repeat; i++) {
        // if (snavHasValue(console)) {
        if (typeof console !== 'undefined') {
            newline += '\n';
        } else {
            newline += '\n';
        }
    }
    return newline;
}

/**
 * Returns details about the execution context
 * 
 * @return {string}
 */
function snavGetContextDetails() {
    var detail = '';
    try {
        var userId = nlapiGetUser();
        var context = nlapiGetContext();
        detail += 'Company: ' + context.getCompany() + snavGetNewLine();
        try {
            if (context.getFeature('departments')) {
                detail += 'Department: ' + nlapiGetDepartment() + snavGetNewLine();
            }
        } catch (e) {
            detail += 'Department: error ' + e + snavGetNewLine();
        }

        try {
            if (context.getFeature('locations')) {
                detail += 'Location: ' + nlapiGetLocation() + snavGetNewLine();
            }
        } catch (e) {
            detail += 'Location: error ' + e + snavGetNewLine();
        }

        try {
            if (context.getFeature('subsidiaries')) {
                detail += 'Subsidiary: ' + nlapiGetSubsidiary() + snavGetNewLine();
            }
        } catch (e) {
            detail += 'Subsidiary: error ' + e + snavGetNewLine();
        }

        detail += 'User Id: ' + userId + snavGetNewLine();
        detail += 'User Name: ' + context.getName() + snavGetNewLine();
        detail += 'Role: ' + nlapiGetRole() + snavGetNewLine();
        detail += 'Role Center: ' + context.getRoleCenter() + snavGetNewLine();
        try {
            detail += 'DeploymentId: ' + context.getDeploymentId() + snavGetNewLine();
        } catch (e) {
            detail += 'DeploymentId: error ' + e + snavGetNewLine();
        }

        detail += 'User Email: ' + context.getEmail() + snavGetNewLine();
        detail += 'Environment: ' + context.getEnvironment() + snavGetNewLine();
        detail += 'ExecutionContext: ' + context.getExecutionContext() + snavGetNewLine();
        detail += 'Name: ' + context.getName() + snavGetNewLine();
        detail += 'ScriptId: ' + context.getScriptId() + snavGetNewLine();
        detail += 'Version: ' + context.getVersion() + snavGetNewLine();

    } catch (e) {
        detail = 'Error in snavGetContextDetails(); ' + e;
    }
    return detail;
}

/**
 * @class Object used in logging. Used in both client and server
 * @example // sample 1 var logger = new tcobjlogger(arguments); // sample 2 var
 *          logger = new tcobjlogger(arguments, false, 'getData()');
 * @param {Object}
 *        args 'arguments' is a built-in object in functions. Pass 'arguments'
 *        always.
 * @param {Boolean}
 *        (optional) isDisabled Set to true to temporarily disable logging.
 *        Default to false.
 * @param {String}
 *        commonLog (optional) All succeeding calls to log will prepend the
 *        commonLog .
 * @return {void}
 */
function tcobjLogger(args, isDisabled, commonLog) {

    commonLog = commonLog || '';
    var sw = new tcobjStopWatch();
    // this is an array of commonLog values. If a commonLog is in this list, it
    // is disabled
    var disabledCommonLogs = [ 'snavGetFieldPropertiesByText', 'snavGetOptionsRecordSelectFieldsByName' ];

    var _disabled = false;
    if (snavHasValue(isDisabled)) {
        _disabled = isDisabled;
    }

    /**
     * @deprecated Use the class public function setDisabled instead
     * @description (deprecated) Enable or disables logging
     * @param {Boolean}
     *        isDisabled
     */
    function setDisabled(isDisabled) {
        _disabled = isDisabled;
    }
    var _commonLog;
    var _argumentsDetails = '';
    if (typeof args == 'object') {
        _commonLog = (args.callee.name || commonLog) + '()';
        _argumentsDetails = snavGetArgumentDetails(args);// snavGetArgumentDetailsTableFormat(args);
    } else {
        _commonLog = commonLog + ' ' + args + '()';
    }
    // _commonLog = snavPadRight(_commonLog, 45);

    this.auditReset = function(msg) {
        return sw.measureSegment();
    };

    this.audit = function(msg) {
        if (_disabled === false) {
            var MAX_ARG_LENGTH = 100;
            if (snavHasValue(msg)) {
                msg = msg + '; ' + _argumentsDetails;
            } else {
                msg = _argumentsDetails;
            }

            if (msg.length > MAX_ARG_LENGTH) {
                msg = msg.substr(0, MAX_ARG_LENGTH);
            }

            // if (snavArrayIndexOf(disabledCommonLogs, _commonLog) > -1) {
            // return;
            // }
            var finalMsg = _commonLog + ' ';
            finalMsg += snavPad(snavAddCommas(sw.measureFromScript()), 6) + ' ms; &nbsp;&nbsp;';
            finalMsg += snavPad(snavAddCommas(sw.measureFromFunction()), 6) + ' ms; &nbsp;&nbsp;';
            finalMsg += snavPad(snavAddCommas(sw.measureSegment()), 6) + ' ms; &nbsp;&nbsp;';
            finalMsg += msg;

            finalMsg = '<span style="font-family: courier new">' + finalMsg + '</span>';
            snavLog(finalMsg, null, null, 'audit');
        }
    };

    this.log = function(msg) {
        if (_disabled === false) {
            if (snavArrayIndexOf(disabledCommonLogs, _commonLog) > -1) {
                return;
            }
            snavLog(_commonLog + ' ' + sw.measure() + 'ms; ' + msg);
        }
    };
    /**
     * @public
     * @description Logs everytime even if _disabled is true
     * @param {Object}
     *        msg
     */
    this.logAlways = function(msg) {
        snavLog(_commonLog + ' ' + sw.measure() + 'ms; ' + msg);
    };

    /**
     * @public
     * @description Logs an error. In NetSuite, error log entries have red
     *              background.
     * @param {Object}
     *        msg
     */
    this.error = function(msg) {
        if (_disabled === false) {
            if (snavArrayIndexOf(disabledCommonLogs, _commonLog) > -1) {
                return;
            }
            snavLogError(_commonLog + ' ' + sw.measure() + 'ms; ' + msg);
        }
    };
    /**
     * @public
     * @description Logs a warning. In NetSuite, warning log entries have yellow
     *              background.
     * @param {Object}
     *        msg
     */
    this.warn = function(msg) {
        if (_disabled === false) {
            if (snavArrayIndexOf(disabledCommonLogs, _commonLog) > -1) {
                return;
            }
            snavLogWarn(_commonLog + ' ' + sw.measure() + 'ms; ' + msg);
        }
    };
    /**
     * @public
     * @description Logs a successful activity. In NetSuite, 'successful' log
     *              entries have green background.
     * @param {Object}
     *        msg
     */
    this.ok = function(msg) {
        if (_disabled === false) {
            if (snavArrayIndexOf(disabledCommonLogs, _commonLog) > -1) {
                return;
            }
            snavLogOk(_commonLog + ' ' + sw.measure() + 'ms; ' + msg);
        }
    };

    this.end = function(msg) {
        // var MAX_ARG_LENGTH =70;
        // var shortArgumentsDetails = _argumentsDetails;
        // if(shortArgumentsDetails.length > MAX_ARG_LENGTH){
        // shortArgumentsDetails = shortArgumentsDetails.substr(0,
        // MAX_ARG_LENGTH);
        // }
        var shortArgumentsDetails = '';
        if (snavHasValue(msg)) {
            msg = 'END ' + shortArgumentsDetails + '; ' + msg;
        } else {
            msg = 'END ' + shortArgumentsDetails;
        }

        if (_disabled === false) {
            // if (snavArrayIndexOf(disabledCommonLogs, _commonLog) > -1) {
            // return;
            // }
            this.log(msg);
        }
    };

    /**
     * @public
     * @description Enable or disables logging
     * @param {Boolean}
     *        isDisabled
     */
    this.setDisabled = function(isDisabled) {
        _disabled = isDisabled;
    };

    this.log(_argumentsDetails);

}

/**
 * @class This is used in measuring execution time in milli-seconds
 */
function tcobjStopWatch() {

    tcobjGlobal = tcobjGlobal || {};
    if (snavHasNoValue(tcobjGlobal.startOfScriptMilliseconds)) {
        tcobjGlobal.startOfScriptMilliseconds = (new Date()).getTime();
    }

    var startMilliSeconds = (new Date()).getTime();
    var lastCallToMeasure = (new Date()).getTime();

    /**
     * @public
     * @description Starts the timer
     */
    this.start = function() {
        startMilliSeconds = (new Date()).getTime();
    };

    /**
     * @public
     * @description Returns the current elapsed time (in ms) and resets the
     *              start time
     */
    this.stop = function() {
        var currentMilliSeconds = (new Date()).getTime();
        var ms = currentMilliSeconds - startMilliSeconds;
        startMilliSeconds = currentMilliSeconds;
        return ms;
    };

    /**
     * @public
     * @description Returns the current elapsed time (in ms) WITHOUT resetting
     *              the start time (from the last call to start or stop)
     */
    this.measure = function() {
        var currentMilliSeconds = (new Date()).getTime();
        var ms = currentMilliSeconds - startMilliSeconds;
        return ms;
    };

    /**
     * Returns the current elapsed time (in ms) from start of the script call
     */
    this.measureFromScript = function() {
        var currentMilliSeconds = (new Date()).getTime();
        var ms = currentMilliSeconds - tcobjGlobal.startOfScriptMilliseconds;
        return ms;
    };

    /**
     * Returns the current elapsed time (in ms) from start of the function call
     */
    this.measureFromFunction = function() {
        var currentMilliSeconds = (new Date()).getTime();
        var ms = currentMilliSeconds - startMilliSeconds;
        return ms;
    };

    /**
     * Returns the current elapsed time (in ms) starting from the last call to
     * measureSegment but WITHOUT resetting the start time (from the last call
     * to start or stop)
     */
    this.measureSegment = function() {
        var currentMilliSeconds = (new Date()).getTime();
        var ms = currentMilliSeconds - lastCallToMeasure;
        lastCallToMeasure = currentMilliSeconds;
        return ms;
    };
}

/**
 * Browser and server independent implementation of indexOf since IE does not
 * support it
 * 
 * @param {object[]}
 *        arr
 * @param {object}
 *        obj
 */
function snavArrayIndexOf(arr, obj) {
    if (arr.indexOf) {
        return arr.indexOf(obj);
    }
    // no support
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == obj) {
            return i;
        }
    }
    return -1;
}

/**
 * Used in logging
 * 
 * @param {string}
 *        msg
 * @param {string}
 *        otherDetails Not being used?
 * @param {string}
 *        source Not being used?
 */
function snavLog(msg, otherDetails, source, type) {
    var completeMsg = msg;// + ': ' + eval(msg);
    if (snavHasNoValue(type)) {
        type = 'debug';
    }

    if (!snavHasNoValue(otherDetails)) {
        completeMsg = completeMsg + ' otherDetails=' + otherDetails;
    }
    if (!snavHasNoValue(source)) {
        completeMsg = source + '() ' + completeMsg;
    }
    if (typeof document !== 'undefined') {
        if (typeof console !== 'undefined') {
            console.log(completeMsg);
        }
    } else {
        completeMsg = '(' + nlapiGetContext().getRemainingUsage() + ') ' + completeMsg;
        nlapiLogExecution(type, 'tcobjLogger', completeMsg);
    }
    return completeMsg;
}

/**
 * Logs an error
 * 
 * @param {Object}
 *        msg
 * @param {Object}
 *        otherDetails
 * @param {Object}
 *        source
 */
function snavLogError(msg, otherDetails, source) {
    if (typeof document !== 'undefined' && typeof console !== 'undefined') {
        snavLog('ERROR: ' + msg);
    } else {
        snavLog('<span style="background-color: pink">' + msg + '</span>', otherDetails, source, 'error');
    }
}

/**
 * Logs a successful activity
 * 
 * @param {Object}
 *        msg
 * @param {Object}
 *        otherDetails
 * @param {Object}
 *        source
 */
function snavLogOk(msg, otherDetails, source) {
    if (typeof document !== 'undefined' && typeof console !== 'undefined') {
        snavLog('SUCCESS: ' + msg);
    } else {
        snavLog('<span style="background-color: lightgreen">' + msg + '</span>', otherDetails, source, 'debug');
    }
}

/**
 * Logs a warning
 * 
 * @param {Object}
 *        msg
 * @param {Object}
 *        otherDetails
 * @param {Object}
 *        source
 */
function snavLogWarn(msg, otherDetails, source) {
    if (typeof document !== 'undefined' && typeof console !== 'undefined') {
        snavLog('WARNING: ' + msg);
    } else {
        snavLog('<span style="background-color: yellow">' + msg + '</span>', otherDetails, source, 'debug');
    }
}

function snavPad(s, length) {
    var diff = length - s.length;
    if (diff > 0) {
        for (var i = 1; i <= diff; i++) {
            s = '&nbsp;' + s;
        }
    } else {
        s = s.substr(0, length);
    }
    return s;
}

function snavAddCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}