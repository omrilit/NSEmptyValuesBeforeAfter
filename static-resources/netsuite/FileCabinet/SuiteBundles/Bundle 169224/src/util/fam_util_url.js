/**
 * © 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 *
 */
define(['../adapter/fam_adapter_url'], 

function(url) {
    var module = {};
    
    module.resolveCustomRecordList = function(options) {
        var listURL = '';
        if (options && options.recordType) {
            try {
                listURL = url.resolveRecord({
                    recordType: options.recordType
                });
                if (listURL.indexOf('custrecordentry.nl') !== -1) {
                    listURL = listURL.replace('custrecordentry.nl', 'custrecordentrylist.nl');
                }
                else {
                    listURL = '';
                }
            }
            catch(ex) {
                log.error('resolveRecordList', 'cannot resolve url: ' + JSON.stringify(ex));
            }
        }
        return listURL;
    };

    return module;
});
