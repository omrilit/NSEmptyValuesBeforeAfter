function foo(data) {
    alert(JSON.stringify(data));
}

/**
 * Refresh portlets
 */
function snavRefreshPortlets() {
    var logger = new tcobjLogger(arguments);
    var selector = '.ns-portlet-icon-refresh';
    var els = top.Ext.select(selector).elements;
    logger.log('els.length=' + els.length);
    if (els.length === 0) {
        alert('Error: No elements found. selector=' + selector);
        return;
    }
    // var ctr = 0;
    for (var i = 0; i < els.length; i++) {
        var el = els[i];

        // do not refresh subsidiary nav
        var headerContainerEl = Ext.get(el).findParent('.ns-portlet-header');
        if (snavHasNoValue(headerContainerEl)) {
            throw 'Parent table of el not found; el=' + el;
        }
        var titleEl = Ext.get(headerContainerEl).select('.ns-portlet-header-text').elements[0];
        if (snavHasNoValue(titleEl)) {
            throw 'Title of table not found; tableEl=' + headerContainerEl;
        }
        if (titleEl.innerHTML.indexOf('Subsidiary Navigator') > -1) {
            // do not refresh sub nav portlet
            continue;
        }
        // it seems no need to set an interval
        jQuery(el).click();
        // refresh
        // var command = el.getAttribute('href');
        // command = command.replace('javascript:', '');
        // logger.log('command=' + command);
        // // set an interval for each refresh since not all portlets are
        // refreshed
        // // when called simultaneously
        // top.setTimeout(command, (ctr * 1000) + 1);
        // ctr = ctr + 1;
    }
}

/**
 * Executes a suitelet asynchronously and returns the response as object.
 * 
 * @param {Object}
 *        action
 * @param {Object}
 *        values
 */
function snavSuiteletProcessAsync(action, values, callback, useAdminCredentials) {
    var logger = new tcobjLogger(arguments, true);
    if (typeof useAdminCredentials == 'undefined') {
        useAdminCredentials = true;
    }
    var xmlRequest = new XMLHttpRequest();
    try {
        window.status = 'Processing ' + action + '... ';
        var data = {};
        data.action = action;
        data.values = values;
        var url = null;

        if (useAdminCredentials) {
            if (snavHasNoValue(tcobjGlobal.snavSuiteletProcessAsyncUrl)) {
                url = nlapiResolveURL('SUITELET', 'customscript_snav_service_admin_sl', 'customdeploy_snav_service_admin_sl');
                tcobjGlobal.snavSuiteletProcessAsyncUrl = url;
            } else {
                url = tcobjGlobal.snavSuiteletProcessAsyncUrl;
            }
        } else {
            if (snavHasNoValue(tcobjGlobal.snavSuiteletProcessAsyncUrlUser)) {
                url = nlapiResolveURL('SUITELET', 'customscript_snav_service_user_sl', 'customdeploy_snav_service_user_sl');
                tcobjGlobal.snavSuiteletProcessAsyncUrlUser = url;
            } else {
                url = tcobjGlobal.snavSuiteletProcessAsyncUrlUser;
            }
        }

        xmlRequest.onreadystatechange = function() {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    // success
                    var returnValue = snavHandleResponse(xmlRequest);
                    callback(returnValue);
                } else {
                    var text = xmlRequest.responseText;
                    if (text.indexOf('Please provide more detailed keywords so your search does not return too many results') > -1) {
                        setTimeout("Ext.get('placeHolderColleagueOthers').update('Please provide more detailed keywords so your search does not return too many results', 'timeline');", 500);
                        callback([]);
                        return;
                    }
                    callback([]);
                    return;
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
        logger.log('snavSuiteletProcessAsync(). action=' + JSON.stringify(action) + '; values=' + JSON.stringify(values) + snavGetErrorDetails(e) + '<br />xmlRequest.responseText=' + xmlRequest.responseText);
    }
}

function snavSuiteletProcessAsyncUser(action, values, callback) {
    snavSuiteletProcessAsync(action, values, callback, false /* useAdminCredentials */);
}
