/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/format',
    '../../lib/base/BaseProcess',
    '../../lib/module/error',
    '../../lib/module/util',
    '../../lib/Constants'],
function(
    format,
    BaseProcess,
    error,
    filingUtil,
    Constants) {

	var ViewVATResponseParser = function FileWriter(context, config) {
        BaseProcess.apply(this, arguments);
		this.name = 'ViewVATResponseParser';
	};

    util.extend(ViewVATResponseParser.prototype, BaseProcess.prototype);

    ViewVATResponseParser.prototype.process = function(context, processId) {
        log.debug({ title: this.name, details: 'process' });
        if (!this.canHandle(context)) {
            return context;
        }
        var data = context.getVariable(processId);
        if (data.periodKey) {
            delete data.periodKey;
        }
        data.periodFrom = context.getVariable('formattedPeriodFrom');
        data.periodTo = context.getVariable('formattedPeriodTo');
        data.vrn = context.getVariable('vrn');
        context.setVariable(processId, data);
        context.setVariable('result', JSON.stringify(data));
        context.setVariable('status', Constants.Status.RETRIEVED);
        return context;
	};

	return ViewVATResponseParser;
});
