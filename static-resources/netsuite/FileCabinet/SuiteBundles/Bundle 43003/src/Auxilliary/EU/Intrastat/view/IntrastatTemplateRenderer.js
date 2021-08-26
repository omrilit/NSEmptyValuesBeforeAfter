/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.TemplateRenderer = function TemplateRenderer() {
	Tax.TemplateRenderer.call(this);
	this.Name = 'TemplateRenderer';
};
Tax.EU.Intrastat.TemplateRenderer.prototype = Object.create(Tax.TemplateRenderer.prototype);

Tax.EU.Intrastat.TemplateRenderer.prototype.process = function process(result, params) {
    if (!result) {
        throw nlapiCreateError('MISSING_PARAMETER', 'result argument is required');
    }
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }
    if (!params.filetype) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.filetype argument is required');
    }
    if (!params.meta || !params.meta.templates) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.templates argument is required');
    }

	try {
		var templateName = params.meta.templates[params.filetype];
		var renderedData = this.renderTemplate(templateName, result);
		result.rendered = renderedData;
		return result;
	} catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.TemplateRenderer.process');
        throw ex;
	}
};
