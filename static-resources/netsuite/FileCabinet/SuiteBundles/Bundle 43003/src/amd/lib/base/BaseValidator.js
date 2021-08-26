/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['../module/error'], function(error) {

    BaseValidator = function() {
        this.name = 'BaseValidator';
    }

    BaseValidator.prototype.validate = function() {
        error.throw({ code: 'NOT_IMPLEMENTED_EXCEPTION', messasge: 'Implementation for this function is required.' }, this.name + '.validate');
    };

    BaseValidator.prototype.isNumber = function(value) {
        return !isNaN(value);
    };

    BaseValidator.prototype.isAlphaNumeric = function(value) {
        var regExp = /^[a-zA-Z0-9-]+$/;
        return value.search(regExp) > -1;
    };

    BaseValidator.prototype.isValidRegExp = function(regExp, value) {
        return value.search(regExp) > -1;
    };

    return BaseValidator;
});
