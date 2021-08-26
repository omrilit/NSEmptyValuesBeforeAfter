/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define([], function() {

    function pageInit(context) {
        var guid;
        var redirectURI;
        var queryParam;
        var rec = context.currentRecord;
        var guidField = rec.getField({ fieldId: 'custpage_authorization_guid' });
        if (guidField) {
            rec.setValue({ fieldId: 'custpage_authorization_guid', value: rec.getValue({ fieldId: 'custpage_authorization_guid' }) });
            guid = rec.getValue({ fieldId: 'custpage_authorization_guid' });
        }
        redirectURI = rec.getValue('custpage_redirect_uri');
        queryParam = '';
        if (redirectURI) {
            redirectURI += guid ? '&guid=' + guid : '';
            window.location = redirectURI;
        }
    }

    return {
        pageInit: pageInit
    };
});