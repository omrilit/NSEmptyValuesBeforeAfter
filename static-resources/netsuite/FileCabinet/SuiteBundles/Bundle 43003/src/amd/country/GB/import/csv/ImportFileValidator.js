/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    '../../../../lib/base/BaseValidator',
    '../../../../lib/Constants',
    '../../../../lib/module/error',
    '../../../../lib/module/util',
], function(
    BaseValidator,
    Constants,
    error,
    filingUtil
) {

    var ImportFileValidator = function(context) {
        this.name = 'ImportFileValidator';
        this.VALIDATION_MAP = {
            'VRN': 'validateVRN',
            'BOX 1': 'validateBoxValue',
            'BOX 2': 'validateBoxValue',
            'BOX 3': 'validateBoxValue',
            'BOX 4': 'validateBoxValue',
            'BOX 5': 'validateBoxValue',
            'BOX 6': 'validateBoxValue',
            'BOX 7': 'validateBoxValue',
            'BOX 8': 'validateBoxValue',
            'BOX 9': 'validateBoxValue'
        };
        this.filingUtil = filingUtil;
    };

    util.extend(ImportFileValidator.prototype, BaseValidator.prototype);

    ImportFileValidator.prototype.validate = function(parameters) {
        var data = parameters.data;
        var expectedValues = parameters.expectedValues;
        var field;
        var validateFxn;

        for (var key in this.VALIDATION_MAP) {
            validateFxn = this.VALIDATION_MAP[key];
            this[validateFxn](data, expectedValues[key], key);
        }
    };

    ImportFileValidator.prototype.validateVRN = function(data, expectedValue) {
        if (!data || !data.VRN || !this.isValidRegExp(/^[a-zA-Z0-9-]+$/, data.VRN) || data.VRN !== expectedValue) {
            this.throwInvalidValueError(Constants.MESSAGE.ERROR.INVALID_VAT_VALUE);
        }
    };

    ImportFileValidator.prototype.validateBoxValue = function(data, expectedValue, boxKey) {
        if (!boxKey) {
            error.throw(
                { code: 'MISSING_PARAMETER', message: 'boxKey is a required parameter' }
            );
        }
        if (!data || !data[boxKey] || !this.isNumber(data[boxKey])) {
            this.throwInvalidValueError(Constants.MESSAGE.ERROR.INVALID_VALUE, boxKey);
        }
    };

    ImportFileValidator.prototype.throwInvalidValueError = function(errorObj, fieldName) {
        error.throw(
            { code: errorObj.code, message: this.filingUtil.formatString(errorObj.message, fieldName) }
        );
    };

    return ImportFileValidator;
});
