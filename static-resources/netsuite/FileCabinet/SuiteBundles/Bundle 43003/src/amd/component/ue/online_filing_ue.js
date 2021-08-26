/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define([
    'N/runtime',
    'N/error',
    '../../lib/Constants'],
function(
    runtime,
    error,
    Constants) {

    function beforeLoad(context) {
        if (runtime.executionContext === runtime.ContextType.USER_INTERFACE) {
            if (isIllegalOperation(context)) {
                throw Error(Constants.MESSAGE.ERROR.ILLEGAL_OPERATION.message);
            } else if (context.type === context.UserEventType.VIEW) {
                context.form.removeButton('copy');
                context.form.removeButton('edit');
                context.form.removeButton('new');
            }
        }
    }
    
    function beforeSubmit(context) {
        if (runtime.executionContext === runtime.ContextType.USER_INTERFACE) {
            if (isIllegalOperation(context)) {
                throw Error(Constants.MESSAGE.ERROR.ILLEGAL_OPERATION.message);
            }
        }
    }

    function isIllegalOperation(context) {
        var illegalUIOperations = [
            context.UserEventType.CREATE,
            context.UserEventType.EDIT,
            context.UserEventType.XEDIT,
            context.UserEventType.COPY,
            context.UserEventType.DELETE
        ];
        return illegalUIOperations.indexOf(context.type) > -1;
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    };
});
