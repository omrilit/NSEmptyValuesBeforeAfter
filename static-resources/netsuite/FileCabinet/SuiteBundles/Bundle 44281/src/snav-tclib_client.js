/**
 * @author tcaguioa
 *
 *
 *
 *
 */
/**
 * Hi all, As you probably know, UI code refactoring is currently going on in
 * order to enable mobile view of records in our upcoming iPhone app. As a part
 * of this refactoring we had to make a few changes to the internal UI api used
 * by other developer teams. In particular, the following javascript variables
 * and functions are no longer supported: - window.ischanged - window.isvalid -
 * window.isinited and window.setIsInited() The variables were encapsulated in a
 * new NS.form javascript object that is defined in NLUtil.jsp. To access them
 * please use the following methods: - NS.form.setChanged(boolean) and
 * NS.form.isChanged() - NS.form.setValid(boolean) and NS.form.isValid() -
 * NS.form.setInited(boolean) and NS.form.isInited() In case you need to change
 * the state of parent window, it is possible prepend the calls with �parent.�
 * or �opener.� prefixes (e.g., parent.NS.form.setInited(true)). The main motive
 * for this change is to be able to perform actions in response to the change of
 * these attributes in the mobile app. IMPORTANT: All occurrences of the
 * deprecated variables in ML and NetLedger_Release_George were replaced. Please
 * check you feature branches and update them appropriately. Please let me or
 * the UI team know if you have any questions or comments regarding this change.
 * Thanks, Ondrej
 */
if (typeof NS == 'undefined') {
    NS = {};
    NS.form = {};
    NS.form.setChanged = function(bool) {
        window.ischanged = bool;
    };

    NS.form.isChanged = function(bool) {
        return window.ischanged;
    };
}

function snavGetParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function snavStopPropagation(e) {
    var logger = new tcobjLogger(arguments);
    e = e || window.event;

    if (e.preventDefault) {
        e.preventDefault();
    }

    if (Ext.isIE) {
        e.cancelBubble = true;
        e.returnValue = false;
    } else {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    }
    return false;
}

/**
 * Displays a warning
 * 
 * @param {Object}
 *        info
 * @param {Object}
 *        title
 */
function uiShowWarning(info, title) {

    if (snavHasNoValue(title)) {
        title = 'Warning';
    }

    Ext.MessageBox.show({
        title : title,
        msg : info,
        buttons : Ext.MessageBox.OK,
        icon : Ext.MessageBox.WARNING
    });
}

/**
 * @author user
 */
// add indexOf() for Array object since not all browsers support it
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    };
}

function snavTemplateApply(tmpId, data) {
    var tmpPost = document.getElementById(tmpId).innerHTML;
    var myTplPost = new Ext.XTemplate('<tpl for=".">' + tmpPost + '</tpl>');
    return myTplPost.apply(data, false);
}

function snavTemplateAppend(tmpId, targetId, data) {
    var logger = new tcobjLogger(arguments);

    var tmp = document.getElementById(tmpId);
    if (snavHasNoValue(tmp)) {
        throw 'tmp is null; tmpId=' + tmpId;
    }

    var target = document.getElementById(targetId);
    if (snavHasNoValue(target)) {
        throw 'target is null; targetId=' + targetId;
    }

    var tmpPost = tmp.innerHTML;
    var myTplPost = new Ext.XTemplate('<tpl for=".">' + tmpPost + '</tpl>');
    myTplPost.append(target, data, false);
    logger.log('end');
}

function addTrimFunctions() {

    // add trim functions if browser has no support
    if (typeof String.trim == 'undefined') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }

    if (typeof String.ltrim == 'undefined') {
        String.prototype.ltrim = function() {
            return this.replace(/^\s+/, "");
        };
    }

    if (typeof String.rtrim == 'undefined') {
        String.prototype.rtrim = function() {
            return this.replace(/\s+$/, "");
        };
    }
}

addTrimFunctions();

/**
 * Hides the New option in a select field
 */
function snavHideNewInOptionList() {
    var logger = new tcobjLogger('snavHideNewInOptionList', true);
    // S3 Issue 240819 : [timeline] the option -New- should be hidden even in
    // other languages
    // drop down item
    var els = document.getElementsByTagName('div');
    for (var i = 0; i < els.length; i++) {
        var text = els[i].innerHTML;
        if (text.length < 2) {
            continue;
        }
        // for the 'New' options, it is in the format '- New -' where the New
        // changes per language
        if (text.substr(0, 2) == '- ') {
            els[i].style.display = 'none';
        }
    }
    logger.log('DONE');
}

function snavHandleResponse(xmlRequest) {
    // alert('socialHandleResponse');
    // alert('socialHandleResponse ' + xmlRequest.responseText);
    if (xmlRequest.status !== 200) {
        // error
        alert('An unexpected error occurred. xmlRequest.status=' + xmlRequest.status);
        return null;
    }
    if (xmlRequest.responseText.indexOf('ERROR:') > -1) {
        alert(JSON.parse(xmlRequest.responseText));
        return false;
    }

    // <!--
    /**
     * For some reasons, the returned string sometimes contains debug
     * information from core. This debugging information start with <!--. If
     * this string is found, process only the string before this.
     */
    var responseText = xmlRequest.responseText;
    var position = responseText.indexOf('<!--');
    if (position > -1) {
        responseText = responseText.substr(0, position);
    }

    try {
        var returnObject = JSON.parse(responseText);
    } catch (e) {
        alert('xmlRequest.responseText=' + xmlRequest.responseText);
        return false;
    }

    return returnObject;
}

/**
 * Executes a suitelet asynchronously and returns the response as object.
 * 
 * @param {Object}
 *        action
 * @param {Object}
 *        values
 */
function socialSuiteletProcessAsync(action, values, callback, useAdminCredentials) {
    var logger = new tcobjLogger(arguments, true);
    if (typeof useAdminCredentials == 'undefined') {
        useAdminCredentials = true;
    }
    var xmlRequest = new XMLHttpRequest();
    try {
        // var logger = new tcobjLogger(arguments);
        window.status = 'Processing ' + action + '... ';
        // logger.log('action=' + action);
        var data = {};
        data.action = action;
        data.values = values;
        var url = null;
        // logger.log('useAdminCredentials=' + useAdminCredentials);

        if (useAdminCredentials) {
            if (snavHasNoValue(tcobjGlobal.socialSuiteletProcessAsyncUrl)) {
                url = nlapiResolveURL('SUITELET', 'customscript_suitewall_generic_suitelet', 'customdeploy_suitewall_generic_suitelet');
                tcobjGlobal.socialSuiteletProcessAsyncUrl = url;
            } else {
                url = tcobjGlobal.socialSuiteletProcessAsyncUrl;
            }
        } else {
            if (snavHasNoValue(tcobjGlobal.socialSuiteletProcessAsyncUrlUser)) {
                url = nlapiResolveURL('SUITELET', 'customscript_ss_sw_generic_user_cred_sl', 'customdeploy_ss_sw_generic_user_cred_sl');
                tcobjGlobal.socialSuiteletProcessAsyncUrlUser = url;
            } else {
                url = tcobjGlobal.socialSuiteletProcessAsyncUrlUser;
            }
        }

        xmlRequest.onreadystatechange = function() {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    // success
                    var returnValue = socialHandleResponse(xmlRequest);
                    callback(returnValue);
                } else {
                    var text = xmlRequest.responseText;
                    if (text.indexOf('Please provide more detailed keywords so your search does not return too many results') > -1) {
                        setTimeout("Ext.get('placeHolderColleagueOthers').update('Please provide more detailed keywords so your search does not return too many results', 'timeline');", 500);
                        callback([]);
                        return;

                    }
                    // uiShowError(text, 'Unexpected Error');
                    callback([]);
                    return;
                    // if(text.indexOf('Could not determine customer compid') >
                    // -1){
                    // uiShowError('Check if you are still logged into
                    // NetSuite.', 'Unexpected Error');
                    // return;
                    // }
                }
                window.status = 'Ready';
            }
        };
        // parameters
        logger.log('url=' + url);
        xmlRequest.open('POST', url, true /* async */);
        xmlRequest.setRequestHeader("Content-Type", "application/json");
        xmlRequest.send(JSON.stringify(data));
        return;
    } catch (e) {
        alert('socialSuiteletProcessAsync(). action=' + JSON.stringify(action) + '; values=' + JSON.stringify(values) + snavGetErrorDetails(e) + '<br />xmlRequest.responseText=' + xmlRequest.responseText);
    }
}

function socialSuiteletProcessAsyncUser(action, values, callback) {
    socialSuiteletProcessAsync(action, values, callback, false /* useAdminCredentials */);
}

/**
 * Executes a suitelet synchronously and returns the response as object.
 * 
 * @param {Object}
 *        action
 * @param {Object}
 *        values
 */
function socialSuiteletProcessEncoded(action, values) {
    var xmlRequest = new XMLHttpRequest();
    try {
        var logger = new tcobjLogger(arguments);
        logger.log('action=' + action);
        var data = {};
        data.action = action;
        data.values = values;
        if (snavHasNoValue(tcobjGlobal.socialSuiteletProcessEncodedUrl)) {
            tcobjGlobal.socialSuiteletProcessEncodedUrl = nlapiResolveURL('SUITELET', 'customscript_suitewall_generic_suitelet', 'customdeploy_suitewall_generic_suitelet');
        }
        //
        var url = tcobjGlobal.socialSuiteletProcessEncodedUrl;
        // parameters
        xmlRequest.open('POST', url, false /* async */);
        xmlRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        // xmlRequest.send(data);

        xmlRequest.send(data);
        // alert(xmlRequest.status)
        if (xmlRequest.status !== 200) {
            // error
            alert('socialSuiteletProcessEncoded() An unexpected error occurred.');
            return false;
        }

        if (xmlRequest.responseText.indexOf('ERROR:') > -1) {
            alert('socialSuiteletProcessEncoded() ' + JSON.parse(xmlRequest.responseText));
            return false;
        }

        // <!--
        /**
         * For some reasons, the returned string sometimes contains debug
         * information from core. This debugging information start with <!--. If
         * this string is found, process only the string before this.
         */
        var responseText = xmlRequest.responseText;
        var position = responseText.indexOf('<!--');
        if (position > -1) {
            responseText = responseText.substr(0, position);
        }
        var returnObject = JSON.parse(responseText);
        return returnObject;

    } catch (e) {
        alert(e.toString() + '\n\n\nxmlRequest.responseText=' + xmlRequest.responseText);
    }
}

/**
 * Executes a suitelet synchronously and returns the response as object.
 * 
 * @param {Object}
 *        action
 * @param {Object}
 *        values
 */
function socialSuiteletProcess(action, values) {
    var xmlRequest = new XMLHttpRequest();
    try {
        var logger = new tcobjLogger('socialSuiteletProcess');
        logger.log('action=' + action);
        var data = {};
        data.action = action;
        data.values = values;
        if (snavHasNoValue(tcobjGlobal.socialSuiteletProcessAsyncUrl)) {
            tcobjGlobal.socialSuiteletProcessAsyncUrl = nlapiResolveURL('SUITELET', 'customscript_suitewall_generic_suitelet', 'customdeploy_suitewall_generic_suitelet');
        }
        //
        var url = tcobjGlobal.socialSuiteletProcessAsyncUrl;
        // parameters
        xmlRequest.open('POST', url, false /* async */);
        xmlRequest.setRequestHeader("Content-Type", "application/json");
        // xmlRequest.send(data);

        xmlRequest.send(JSON.stringify(data));
        // alert(xmlRequest.status)
        if (xmlRequest.status !== 200) {
            // error
            alert('socialSuiteletProcess() An unexpected error occurred.');
            return false;
        }

        if (xmlRequest.responseText.indexOf('ERROR:') > -1) {
            alert('socialSuiteletProcess() ' + JSON.parse(xmlRequest.responseText));
            return false;
        }

        // <!--
        /**
         * For some reasons, the returned string sometimes contains debug
         * information from core. This debugging information start with <!--. If
         * this string is found, process only the string before this.
         */
        var responseText = xmlRequest.responseText;
        var position = responseText.indexOf('<!--');
        if (position > -1) {
            responseText = responseText.substr(0, position);
        }
        var returnObject = JSON.parse(responseText);
        return returnObject;

    } catch (e) {
        alert(e.toString() + '\n\n\nxmlRequest.responseText=' + xmlRequest.responseText);
    }
}

/**
 * Hides a netsuite button
 * 
 * @param {Object}
 *        label The label of the button
 */
function snavHideNsButton(label) {
    var el = Ext.select('input[value="' + label + '"]').elements[0];
    if (snavHasNoValue(el)) {
        return;
    }
    if (snavHasNoValue(el.parentNode)) {
        return;
    }
    if (snavHasNoValue(el.parentNode.parentNode)) {
        return;
    }
    el.parentNode.parentNode.style.display = 'none';
}

/**
 * TODO: not working consistently This is used in hiding the row where the Add
 * button is located in sublists
 * 
 * @param {Object}
 *        formElementIds Array of form ids of sublists. The ids can be obtained
 *        by using firebug
 */
function snavHideAddButtonRow(formElementId) {
    var logger = new tcobjLogger(arguments);
    // logger.log('formElementIds.length=' + formElementIds.length);
    // for (var i = 0; i < formElementIds.length; i++) {

    var id = formElementId;

    // alert(id);
    var tb = Ext.get(id).dom.children[0];
    // tb.children[0].style.visibility = 'hidden';
    // tb.children[0].style.display = 'none';
    // tb.children[0].children[0].style.visibility = 'hidden';
    tb.children[0].children[0].style.display = 'none';
    // logger.log(tb.children[0].children[0].innerHTML);
    // alert(tb.children[0].children[0].innerHTML);
    // tb.children[0].children[0].innerHTML = '';

    // }
}

function getFirefoxNotice() {
    if (Ext.isGecko) {
        // browser = "Firefox";
        return '<br /><br />If a dialog box displays with the message below, check "Don\'t ask me again" and click "Continue" button in the displayed dialog box.<br /><br /><i>"A script on this page may be busy, or it may have stopped responding. You can stop the script now, open the script in the debugger, or let the script continue."</i><br />';
    }
    return '';
}

function outerHTML(node) {
    return node.outerHTML || new XMLSerializer().serializeToString(node);
}

/*
 * removes all lines ina sublist
 */
function uiClearSublist(sublistId) {
    var logger = new tcobjLogger('uiClearSublist');
    if (snavHasNoValue(sublistId)) {
        throw ' snavHasNoValue(sublistId)';
    }
    // Issue: 212985 [timeline] Confirm deletions in assistant sublists
    // do not show the confirm delete in multiple deletions
    batchDeletion = true;

    var loop = 0;
    logger.log('nlapiGetLineItemCount(sublistId)=' + nlapiGetLineItemCount(sublistId));
    if (nlapiGetLineItemCount(sublistId) == -1) {
        throw 'nlapiGetLineItemCount(sublistId) == -1';
    }
    while (nlapiGetLineItemCount(sublistId) > 0) {

        nlapiSelectLineItem(sublistId, 1);
        nlapiRemoveLineItem(sublistId);

        loop++;
        if (loop > 1000) {
            throw 'loop > 100';
        }
    }
    // Issue: 212985 [timeline] Confirm deletions in assistant sublists
    batchDeletion = false;
}

/*
 * browser independent implementation of indexOf since IE does not support it
 */
function uiArrayIndexOf(arr, obj) {
    if (Array.indexOf) {
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

function uiImplementMissingFunctions() {
    // //*** Array.indexOf implementation
    // if (!Array.indexOf) {
    // Array.prototype.indexOf = function(obj){
    // for (var i = 0; i < this.length; i++) {
    // if (this[i] == obj) {
    // return i;
    // }
    // }
    // return -1;
    // };
    // }

    // jSOn implementation
    var JSON = JSON || {};
    // // implement JSON.stringify serialization
    JSON.stringify = JSON.stringify || Ext.encode;
    JSON.parse = JSON.parse || Ext.decode;

}

// jSOn implementation
var JSON = JSON || {};
// // implement JSON.stringify serialization
JSON.stringify = JSON.stringify || Ext.encode;
JSON.parse = JSON.parse || Ext.decode;

/**
 * Displays an information
 * 
 * @param {Object}
 *        info
 * @param {Object}
 *        title
 */
function uiShowInfo(info, title) {

    if (snavHasNoValue(title)) {
        title = 'Information';
    }

    Ext.MessageBox.show({
        title : title,
        msg : info,
        buttons : Ext.MessageBox.OK,
        icon : Ext.MessageBox.INFO
    });
}

/**
 * Displays a warning
 * 
 * @param {Object}
 *        info
 * @param {Object}
 *        title
 */
function uiShowWarning(info, title) {

    if (snavHasNoValue(title)) {
        title = 'Warning';
    }

    Ext.MessageBox.show({
        title : title,
        msg : info,
        buttons : Ext.MessageBox.OK,
        icon : Ext.MessageBox.WARNING
    });
}

/**
 * Displays an error such as run-time errors and validation errors
 * 
 * @deprecated Use uiShowError
 * @param {Object}
 *        error
 * @param {Object}
 *        title
 */
function showError(error, title) {

    if (snavHasNoValue(title)) {
        title = 'Error';
    }

    Ext.MessageBox.show({
        title : title,
        msg : error,
        buttons : Ext.MessageBox.OK,
        icon : Ext.MessageBox.ERROR
    });
}

function uiShowError(error, title) {
    showError(error, title);
}

function uiGetErrorDetails(ex) {
    var errorDetails;
    if (ex instanceof nlobjError) {
        errorDetails = 'System error. code: ' + ex.getCode() + '<br />Details: ' + ex.getDetails();
        errorDetails += '<br />StackTrace: ' + ex.getStackTrace();
    } else if (snavHasValue(ex.rhinoException)) {
        errorDetails = 'System error. rhinoException: ' + ex.rhinoException.toString();
    } else {
        errorDetails = 'System error. ex: ' + ex.toString();
    }

    return errorDetails;
}

var gsnavWaitPeriods = '.';
function snavWait(message) {
    if (!document) {
        // should run only on browsers
        return;
    }
    gsnavWaitPeriods += '.';
    if (gsnavWaitPeriods == '....') {
        gsnavWaitPeriods = '.';
    }
    if (snavHasNoValue(message)) {
        message = 'Processing';
    }
    Ext.Msg.wait(message, 'Please wait' + gsnavWaitPeriods);
}

function snavSaveOk() {
    Ext.Msg.hide();
    // Ext.Msg.alert('Save', 'Save succeeded');
    // NS.form.setChanged(false); needs to be placed here since it seems
    // window.ischanged is set to true after the recalc event
    Ext.MessageBox.show({
        title : 'Save'.tl(),
        msg : 'Save succeeded'.tl(),
        buttons : Ext.MessageBox.OK,
        icon : Ext.MessageBox.INFO,
        fn : function() {
            NS.form.setChanged(false);
        }
    });
}

// var t = typeof (obj);
// if (t != "object" || obj === null) {
// // simple data type
// if (t == "string")
// obj = '"' + obj + '"';
// return String(obj);
// } else {
// // recurse array or object
// var n, v, json = [], arr = (obj && obj.constructor == Array);
// for (n in obj) {
// v = obj[n];
// t = typeof (v);
// if (t == "string")
// v = '"' + v + '"';
// else if (t == "object" && v !== null)
// v = JSON.stringify(v);
// json.push((arr ? "" : '"' + n + '":') + String(v));
// }
// return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
// }
// };
// // implement JSON.parse de-serialization
// JSON.parse = JSON.parse || function() {
// var r = "(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)", k
// = '(?:[^\\0-\\x08\\x0a-\\x1f"\\\\]|\\\\(?:["/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';
// k = '(?:"' + k + '*")';
// var s = new RegExp(
// "(?:false|true|null|[\\{\\}\\[\\]]|" + r + "|" + k + ")", "g"), t = new
// RegExp(
// "\\\\(?:([^u])|u(.{4}))", "g"), u = {
// '"' : '"',
// "/" : "/",
// "\\" : "\\",
// b : "\u0008",
// f : "\u000c",
// n : "\n",
// r : "\r",
// t : "\t"
// };
// function v(h, j, e) {
// return j ? u[j] : String.fromCharCode(parseInt(e, 16));
// }
// var w = new String(""), x = Object.hasOwnProperty;
// return function(h, j) {
// h = h.match(s);
// var e, c = h[0], l = false;
// if ("{" === c)
// e = {};
// else if ("[" === c)
// e = [];
// else {
// e = [];
// l = true;
// }
// for ( var b, d = [ e ], m = 1 - l, y = h.length; m = 0;)
// delete f[i[g]];
// }
// return j.call(n, o, f);
// };
// e = p({
// "" : e
// }, "");
// }
// return e;
// };
// }();

/*
 * An entity here is composed of multiple name-value pairs. Example entity:
 * {name: 'teddy', age: 33} @param {nlobjSubList} sublist. Not sure what the API
 * requires this @param {string} sublistId @param {string[]} columnIds An array
 * of column ids from the sublist @return {object[]} An array of entities
 */
function uiConvertSublistItemToEntity(sublistId, columnIds, lineNumber) {
    // snavWait();
    // var logger = new tcobjLogger('uiConvertSublistItemToEntity');
    var entity = {};
    for ( var j in columnIds) {
        var columnId = columnIds[j];
        // logger.log('columnId=' + columnId);
        entity[columnId] = nlapiGetLineItemValue(sublistId, columnId, lineNumber);
    }
    return entity;
}

/*
 * An entity here is composed of multiple name-value pairs. Example entity:
 * {name: 'teddy', age: 33} @param {nlobjSubList} sublist. Not sure what the API
 * requires this @param {string} sublistId @param {string[]} columnIds An array
 * of column ids from the sublist @return {object[]} An array of entities
 */
function uiConvertSublistItemsToEntities(sublistId, columnIds) {

    var logger = new tcobjLogger('uiConvertSublistItemsToEntities');
    logger.log('sublistId=' + sublistId + '; columnIds=' + columnIds);
    var lineCount = nlapiGetLineItemCount(sublistId);
    logger.log('sublistId=' + sublistId + '; lineCount=' + lineCount);
    var entities = [];
    for (var lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
        var entity = {};
        entity = uiConvertSublistItemToEntity(sublistId, columnIds, lineNumber);
        entities.push(entity);
    }
    logger.log('entities.length=' + entities.length);
    return entities;
}

/*
 * An entity here is composed of multiple name-value pairs. Example entity:
 * {name: 'teddy', age: 33} @param {nlobjSubList} sublist. Not sure what the API
 * requires this @param {string} sublistId @param {string[]} columnIds An array
 * of column ids from the sublist @return {object[]} An array of entities
 */
function uiConvertSublistItemToEntityText(sublistId, columnIds, lineNumber) {
    var logger = new tcobjLogger('uiConvertSublistItemToEntity', true);
    var entity = {};
    for ( var j in columnIds) {
        var columnId = columnIds[j];
        logger.log('columnId=' + columnId);
        var fld = nlapiGetLineItemField(sublistId, columnId, lineNumber);
        if (fld.getType() == 'select') {
            entity[columnId] = nlapiGetLineItemText(sublistId, columnId, lineNumber);
        } else {
            entity[columnId] = nlapiGetLineItemValue(sublistId, columnId, lineNumber);
        }
    }
    return entity;
}

/*
 * This is the same as uiConvertSublistItemsToEntities except that for select
 * columns, the text is obtained instead of the value An entity here is composed
 * of multiple name-value pairs. Example entity: {name: 'teddy', age: 33} @param
 * {nlobjSubList} sublist. Not sure what the API requires this @param {string}
 * sublistId @param {string[]} columnIds An array of column ids from the sublist
 * @return {object[]} An array of entities
 */
function uiConvertSublistItemsToEntitiesText(sublistId, columnIds) {

    var logger = new tcobjLogger('uiConvertSublistItemsToEntities', true);
    logger.log('sublistId=' + sublistId + '; columnIds=' + columnIds);
    var lineCount = nlapiGetLineItemCount(sublistId);
    logger.log('sublistId=' + sublistId + '; lineCount=' + lineCount);
    var entities = [];
    for (var lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
        var entity = {};
        entity = uiConvertSublistItemToEntityText(sublistId, columnIds, lineNumber);
        entities.push(entity);
    }
    logger.log('entities.length=' + entities.length);
    return entities;
}
