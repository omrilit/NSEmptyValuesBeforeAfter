/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/cache',
    'N/format',
    '../../../lib/base/BaseValidator',
    '../../../lib/Constants',
    '../../../lib/module/error',
    '../../../lib/module/util',
    '../../../lib/dao/TaxPeriodDAO',
], function(
    cache,
    format,
    BaseValidator,
    Constants,
    error,
    filingUtil,
    TaxPeriodDAO
) {

    var ImportSetupValidator = function(response) {
        this.name = 'ImportSetupValidator';
        this.format = format;
        this.filingUtil = filingUtil;
        this.response = response;
        this.cache = cache.getCache({
            name: Constants.CACHE_ID,
            scope: cache.Scope.PRIVATE
        });
        this.taxPeriodDAO = new TaxPeriodDAO();
    };

    util.extend(ImportSetupValidator.prototype, BaseValidator.prototype);

    ImportSetupValidator.prototype.validateSetupFiling = function(params) {
        var isError = false;
        var message = [];
        var requiredParams = {};
        for(var i in Constants.CONFIG.SUBMIT_CSV) {
            requiredParams[i] = Constants.CONFIG.SUBMIT_CSV[i].toLowerCase();
        }
        
        if(!params[requiredParams.VRN]) {
            message.push(Constants.MESSAGE.IMPORT.ERROR.MISSING_VRN);
        }
        
        if(!params[requiredParams.PERIOD_TYPE]) {
            message.push(Constants.MESSAGE.IMPORT.ERROR.MISSING_PERIOD_TYPE);
        }

        if(!params[requiredParams.PERIOD_FROM] || !params[requiredParams.PERIOD_TO]) {
            message.push(Constants.MESSAGE.IMPORT.ERROR.MISSING_TAX_PERIOD);
        } else {
            this.validatReportingPeriod(params, message);
        }
        
        if(message && message.length) {
            var msgObj = {
                status: Constants.Status.ERROR,
                message: message.join('<br>')
            }
            this.cache.put({
                key: 'MESSAGE_CACHE',
                value:  msgObj
            });
            isError = true;
        }
        
        this.response.write(!isError ? Constants.Status.SUCCESS : Constants.Status.ERROR);
    };
    
    ImportSetupValidator.prototype.validatReportingPeriod = function(params, message) {
        var rs;
        var startDate;
        var endDate;
        
        rs = this.taxPeriodDAO.getList({ id: params.periodfrommtdcsv });
        startDate = rs && rs.length > 0 ? this.format.parse({ value: rs[0].startDate, type: format.Type.DATE }) : {};
        
        rs = this.taxPeriodDAO.getList({ id: params.periodtomtdcsv });
        endDate = rs && rs.length > 0 ? this.format.parse({ value: rs[0].endDate, type: format.Type.DATE }) : {};
        
        var monthCount = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
        switch(params.periodtypemtdcsv) {
            case 'QUARTERLY':
                if(monthCount != 3) {
                    message.push(Constants.MESSAGE.IMPORT.ERROR.INVALID_TAX_PERIOD);
                }
                break;
            case 'MONTHLY':
                if(monthCount != 1) {
                    message.push(Constants.MESSAGE.IMPORT.ERROR.INVALID_TAX_PERIOD);
                }
                break;
            default:
                message.push(Constants.MESSAGE.IMPORT.ERROR.INVALID_TAX_PERIOD);
                break;
        }
    };

    return ImportSetupValidator;
});
