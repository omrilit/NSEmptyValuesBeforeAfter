/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['../../lib/controller/OnlineFilingController'], function(OnlineFilingController) {

    function onRequest(context) {
        var controller = new OnlineFilingController(context.request);
        var form = controller.execute();
        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    };

});
