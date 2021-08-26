/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 * @NModuleScope Public
 */

define(['N/log'],
    adapterLog);

function adapterLog(log) {
    return {
        error: function(options) {
            return log.error(options);
        },
        debug: function(options) {
            return log.debug(options);
        }, 
        audit: function(options) {
            return log.audit(options);
        },
        emergency: function(options) {
            return log.emergency(options);
        }
    }
}