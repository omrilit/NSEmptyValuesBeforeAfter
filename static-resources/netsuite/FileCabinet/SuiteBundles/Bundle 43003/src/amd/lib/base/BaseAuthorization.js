/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([], function() {

    BaseAuthorization = function() {
        this.name = 'BaseAuthorization';
    }

    BaseAuthorization.prototype.authorize = function(params) {
    };

    return BaseAuthorization;
});