/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error'], function(error) {

    var module = {
        throw: function(ex, context) {
            var errorMsg = ex.message;
            if (ex.code) {
                errorMsg = context ? [ context, ex.message ].join(' : ') : ex.message;
            }
            log.error({
                title: context,
                details: [ex.code, ex.message, (ex.stack || '')].join(' : ')
            });
            throw error.create({
                name: ex.code || ex.name,
                message: errorMsg,
                notifyOff: true
            });
        }
    };

    return module;
});
