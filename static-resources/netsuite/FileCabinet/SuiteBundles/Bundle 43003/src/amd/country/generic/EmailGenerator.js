/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/email',
    '../../lib/base/BaseProcess',
    '../../lib/OnlineFilingTemplateManager',
    '../../lib/module/util',
    '../../lib/Constants'],
function(
    email,
    BaseProcess,
    OnlineFilingTemplateManager,
    filingUtil,
    Constants) {

	var EmailGenerator = function() {
        BaseProcess.apply(this, arguments);
		this.name = 'EmailGenerator';
		this.email = email;
		this.filingUtil = filingUtil;
		this.templateMgr = new OnlineFilingTemplateManager();
	};

    util.extend(EmailGenerator.prototype, BaseProcess.prototype);

    EmailGenerator.prototype.process = function(context, processId) {
        log.debug({ title: this.name, details: 'process' });
        var status = context.getVariable('status');
        var config = context.getConfigurations(processId);
        var loadedTemplate = this.getTemplate(status, config);
        var parsedTemplate = JSON.parse(loadedTemplate);
        var data = context.getVariables();
        var renderedSubject = this.filingUtil.render(parsedTemplate.subject, data);
        var renderedBody = this.filingUtil.render(parsedTemplate.body, data);
        this.email.send({
            author: context.getVariable('user'),
            recipients: context.getVariable('user'),
            subject: renderedSubject,
            body: renderedBody
        });
        return context;
	};

    EmailGenerator.prototype.getTemplate = function(status, config) {
        return status === Constants.Status.FAILED ? this.templateMgr.getByName(config.fail) : this.templateMgr.getByName(config.success);
    }

	return EmailGenerator;
});
