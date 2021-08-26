/**
 * Copyright © 2015, 2019, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.View = VAT.EU.ESL.View || {};

VAT.EU.ESL.View.FormView = function FormView() {
    var resMgr = new ResourceMgr(nlapiGetContext().getPreference('LANGUAGE'));
	var title = resMgr.GetString('FORM_TITLE_ESL_REPORT');
	this.formBuilder = new VAT.EU.FormBuilder(title);
};

VAT.EU.ESL.View.FormView.prototype.render = function _render(report) {
	if (!report) {
		throw nlapiCreateError('MISSING_PARAMETER', 'report argument is required');
	}
	
	try {
		var formBuilder = this.formBuilder;
		if (report.error.message) {
			var errorField = this.createErrorField(report.error);
			formBuilder.addField(errorField);
			
		} else {
			if (report.cs) {
				formBuilder.setScript(report.cs);
			}
			
			formBuilder.addButtons(report.buttons);
			formBuilder.addFields(report.fields);
			
			formBuilder.addField(this.createHTMLField('header', report.templates.header, report.data.header));
			var legendField = this.createHTMLField('legend', report.templates.legend, report.data.header.legend);
			legendField.breakType = 'startcol';
			formBuilder.addField(legendField);
			formBuilder.addField(this.createHTMLField('body', report.templates.body, report.data.body));
		}
		return formBuilder.getForm();
	} catch (ex) {
		logException(ex, 'VAT.EU.ESL.View.FormView.render');
		throw ex;
	}
};

VAT.EU.ESL.View.FormView.prototype.createHTMLField = function _createHTMLField(id, template, data) {
	var renderedTemplate = VAT.RenderHandlebarsTemplate(template, data);
	var field = {
		id: id,
		type: 'inlinehtml',
		label: '',
		data: renderedTemplate,
		layoutType: 'outsidebelow',
		breakType: 'startrow'
	};
	return field;
};

VAT.EU.ESL.View.FormView.prototype.createErrorField = function _createErrorField(error) {
	var field = {
		id: 'error',
		label: error.message,
		type: 'label'
	};
	return field;
};