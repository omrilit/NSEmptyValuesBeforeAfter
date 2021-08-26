/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['../../../lib/module/error', '../../../lib/base/BaseProcess', '../../../lib/Constants'], function(error, BaseProcess, Constants) {
	var ResponseValidator = function() {
        BaseProcess.apply(this, arguments);
		this.name = 'ResponseValidator';
	};

    util.extend(ResponseValidator.prototype, BaseProcess.prototype);

    ResponseValidator.prototype.process = function(context, processId) {
        log.debug({ title: this.name, details: 'process' });
        
        try {
            if (!this.canHandle(context)) {
                return context;
            }
            var responseObj = context.getVariable(processId);
            var formattedPeriodFrom = context.getVariable('formatterPeriodFrom');
            var formattedPeriodTo = context.getVariable('formatterPeriodTo');
            var responseBodyObj = responseObj && responseObj.body ? JSON.parse(responseObj.body) : {};
            var code = responseObj.code;
            var bodyCode = responseBodyObj.code || responseBodyObj.statusCode;
            if (code >= 300 || bodyCode) {
                result = responseObj.body || Constants.HTTP.Message[code];
                context.setVariable('status', Constants.Status.FAILED);
                context.setVariable('result', result);
            } else {
                context.setVariable(processId, responseBodyObj);
            }
        } catch (ex) {
            var messageDetails = code || '';
            messageDetails = messageDetails + ' : ' + (responseBodyObj || 'An error occurred');
            log.error({ title: this.name + '.process', details: messageDetails });
            throw ex;
        }

        return context;
    };
    
    

	return ResponseValidator;
});
