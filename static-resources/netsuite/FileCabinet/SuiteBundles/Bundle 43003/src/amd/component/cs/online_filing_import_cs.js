/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define([
    '../../lib/FormView'
], function(
    FormView
) {

    function pageInit(context) {
        var formView = new FormView(context);
        formView.init();
    }

    return {
        pageInit: pageInit
    };
});
