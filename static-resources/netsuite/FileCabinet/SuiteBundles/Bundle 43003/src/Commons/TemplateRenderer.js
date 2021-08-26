/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};

Tax.TemplateRenderer = function TemplateRenderer() {
	Tax.Processor.call(this);
	this.Name = 'TemplateRenderer';
};
Tax.TemplateRenderer.prototype = Object.create(Tax.Processor.prototype);

Tax.TemplateRenderer.prototype.renderTemplate = function renderTemplate(templateName, data) {
	var template = getTaxTemplate(templateName).short;
	var renderedData = VAT.RenderHandlebarsTemplate(template, data);
	return renderedData;
};

Tax.TemplateRenderer.prototype.process = function process(result, params) {
	var templateName = params.meta.templates[params.format];
	var renderedData = this.renderTemplate(templateName, result);
	result.rendered = renderedData;
	return result;
};