/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax = Tax || {};

Tax.EmailManager = function EmailManager() {
	Tax.Processor.call(this);
	this.Name = 'EmailManager';
};
Tax.EmailManager.prototype = Object.create(Tax.Processor.prototype);

Tax.EmailManager.prototype.sendEmail = function sendEmail(emailObj) {
	if (!emailObj) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'emailObj is null or undefined');
	}

	if (!emailObj.sender) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'emailObj.sender is null or undefined');
	}

	if (!emailObj.recipient) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'emailObj.recipient is null or undefined');
	}

	if (!emailObj.subject) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'emailObj.subject is null or undefined');
	}

	try {
		nlapiSendEmail(emailObj.sender, emailObj.recipient, emailObj.subject, emailObj.body);
	} catch (ex) {
		nlapiLogExecution('ERROR', 'Tax.EmailManager.sendEmail', ex);
		throw ex;
	}
};

Tax.EmailManager.prototype.process = function process(result, params) {
	var userId = nlapiGetContext().getUser();
	params.fileUrl = result.fileUrl;
	params.filename = result.filename || params.filename;
	var emailSuccess = params.meta.email.success;
	var emailProperties = {
		sender: userId,
		recipient: userId,
		subject: VAT.RenderHandlebarsTemplate(emailSuccess.subject, params),
		body: VAT.RenderHandlebarsTemplate(emailSuccess.message, params)
	};
	this.sendEmail(emailProperties);
	return result;
};
