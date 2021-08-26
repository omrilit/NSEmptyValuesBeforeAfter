/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['../module/error', '../Constants'], function(error, Constants) {
    function BaseProcess() {
        this.name = 'BaseProcess';
    };

    BaseProcess.prototype.process = function(context) {
        error.throw({ code: 'NOT_IMPLEMENTED_EXCEPTION', messasge: 'Implementation for this function is required.' }, this.name + '.process');
    };

    BaseProcess.prototype.canHandle = function(context) {
        return context.getVariable('status') !== Constants.Status.FAILED
    };

    return BaseProcess;
});
