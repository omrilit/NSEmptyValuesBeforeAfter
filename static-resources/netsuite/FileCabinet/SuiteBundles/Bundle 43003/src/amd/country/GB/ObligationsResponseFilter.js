/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['require', '../../lib/module/error', '../../lib/base/BaseProcess', '../../lib/Constants'], function(require, error, BaseProcess, Constants) {
	var ObligationsResponseFilter = function () {
        BaseProcess.apply(this, arguments);
		this.name = 'ObligationsResponseFilter';
	};

    util.extend(ObligationsResponseFilter.prototype, BaseProcess.prototype);

    ObligationsResponseFilter.prototype.process = function(context, processId, nextProcessId) {
        if (!this.canHandle(context)) {
            return context;
        }
        var config = context.getConfigurations(processId);
        var responseObj = context.getVariable(processId);
        var obligations = responseObj.obligations || [];
        var periodFrom = context.getVariable('formattedPeriodFrom');
        var periodTo = context.getVariable('formattedPeriodTo');
        var submissionStatus = config.status;
        var result = obligations.filter(function(obligation) {
            return obligation.status === submissionStatus && obligation.start === periodFrom && obligation.end === periodTo;
        });
        if (result && result.length > 0) {
            context.setVariable(nextProcessId, result[0]);
        } else {
            context.setVariable(nextProcessId, null);
        }

        return context;
	};

	return ObligationsResponseFilter;
});
