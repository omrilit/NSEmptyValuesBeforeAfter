/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['../../../lib/module/error', 'N/https', '../../../lib/base/BaseProcess'], function(error, https, BaseProcess) {
	var RequestSender = function() {
        BaseProcess.apply(this, arguments);
		this.name = 'RequestSender';
		this.https = https;
	};

    util.extend(RequestSender.prototype, BaseProcess.prototype);

    RequestSender.prototype.process = function(context, processId) {
        log.debug({ title: this.name, details: 'process' });

        try {
            if (!this.canHandle(context)) {
                return context;
            }
            var requestObject = context.getVariable(processId);
            var requestFxn = requestObject.method === 'GET' ? this.https.get : this.https.post;
            var requestParams = {
                url: requestObject.url,
                headers: requestObject.headers,
                body: requestObject.body
            };
            var response = requestFxn(requestParams);
            context.setVariable(processId, response);
        } catch (ex) {
            var messageDetails = requestParams ? [requestParams.url, requestParams.body].join(' : ') : 'An error occurred';
            log.error({ title: this.name + '.process', details: messageDetails });
            throw ex;
        }

        return context;
	};

	return RequestSender;
});
