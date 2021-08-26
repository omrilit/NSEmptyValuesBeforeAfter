/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/xml',
    '../../lib/module/error',
    '../../lib/base/BaseProcess',
    '../../lib/Constants'],
function(
    xml,
    error,
    BaseProcess,
    Constants) {

	var SubmitVATResponseParser = function () {
        BaseProcess.apply(this, arguments);
		this.name = 'SubmitVATResponseParser';
		this.xml = xml;
	};

    util.extend(SubmitVATResponseParser.prototype, BaseProcess.prototype);

    SubmitVATResponseParser.prototype.process = function(context, processId) {
        log.debug({ title: this.name, details: 'process' });
        if (!this.canHandle(context)) {
            return context;
        }
        var responseObj = context.getVariable(processId);
        context.setVariable('status', Constants.Status.SUBMITTED);
        context.setVariable('result', JSON.stringify(responseObj));
        context.setVariable('formattedResult', this.formatResult(responseObj));

        return context;
	};

    SubmitVATResponseParser.prototype.formatResult = function(rawData) {
        var formattedData = [];
        var spacer = '&nbsp;&nbsp;&nbsp;&nbsp;';
        var sanitizedValue;
        for (var key in rawData) {
            sanitizedValue = this.xml.escape({
                xmlText: rawData[key]
            });
            formattedData.push(spacer + key + ' : ' + sanitizedValue);
        }

        return formattedData.join('<br>');
    };

	return SubmitVATResponseParser;
});
