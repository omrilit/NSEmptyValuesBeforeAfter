/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['../../lib/module/error', '../../lib/base/BaseProcess', '../../lib/Constants'], function(error, BaseProcess, Constants) {
	var ObligationsResponseValidator = function () {
        BaseProcess.apply(this, arguments);
		this.name = 'ObligationsResponseValidator';
	};

    util.extend(ObligationsResponseValidator.prototype, BaseProcess.prototype);

    ObligationsResponseValidator.prototype.process = function(context, processId) {
        if (!this.canHandle(context)) {
            return context;
        }
        var obligationForSubmission = context.getVariable(processId);
        if (!obligationForSubmission) {
            var periodFrom = context.getVariable('formattedPeriodFrom');
            var periodTo = context.getVariable('formattedPeriodTo');
            result = Constants.HTTP.Message['404'] + [periodFrom, periodTo].join(' to ');
            context.setVariable('status', Constants.Status.FAILED);
            context.setVariable('result', result);
        } else {
            var periodKey = obligationForSubmission.periodKey;
            context.setVariable('periodKey', periodKey);
        }
        return context;
	};

	return ObligationsResponseValidator;
});
