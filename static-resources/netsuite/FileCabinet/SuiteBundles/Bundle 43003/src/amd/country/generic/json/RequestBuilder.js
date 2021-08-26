/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    '../../../lib/base/BaseProcess',
    '../../../lib/OnlineFilingTemplateManager',
    '../../../lib/module/util'],
function(
    BaseProcess,
    OnlineFilingTemplateManager,
    filingUtil) {

    var RequestBuilder = function() {
        BaseProcess.apply(this, arguments);
		this.name = 'RequestBuilder';
		this.templateMgr = new OnlineFilingTemplateManager();
		this.filingUtil = filingUtil;
	};

    util.extend(RequestBuilder.prototype, BaseProcess.prototype);

    RequestBuilder.prototype.process = function(context, processId) {
        if (!this.canHandle(context)) {
            return context;
        }
        var data = context.getVariables();
        var config = context.getConfigurations(processId);
        var url = this.filingUtil.render(config.uri, data);
        var loadedTemplate = this.templateMgr.getByName(config.template);
        var renderedTemplate = this.filingUtil.render(loadedTemplate, data);
        var jsonTemplate = JSON.parse(renderedTemplate);
        var requestObject = {
            method: config.method,
            url: url,
            headers: jsonTemplate.headers,
            body: JSON.stringify(jsonTemplate.body)
        };
        context.setVariable(processId, requestObject);
        return context;
	};

	return RequestBuilder;
});
