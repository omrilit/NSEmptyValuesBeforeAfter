/**
 * Copyright © 2016, 2018 Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.View = Tax.EU.Intrastat.View || {};

Tax.EU.Intrastat.View.OnlineView = function FormView() {
    Tax.Processor.call(this);
    this.Name = 'OnlineView';
};

Tax.EU.Intrastat.View.OnlineView.prototype = Object.create(Tax.Processor.prototype);

Tax.EU.Intrastat.View.OnlineView.prototype.process = function _process(result, params) {
    if (!result) {
        throw nlapiCreateError('MISSING_PARAMETER', 'result argument is required');
    }

    try {
        var formBuilder = new VAT.EU.FormBuilder('EU Intrastat Report');

        if (params.error && params.error.message) {
            formBuilder.addField(this.createErrorField(params.error));
        } else {
            var companyData = result.CompanyInfoAdapter[0];
            var onlineData = result.OnlineAdapter[0];
            formBuilder.setScript(CONSTANTS.SCRIPT.CLIENT);

            formBuilder.addFields(onlineData.fields);
            formBuilder.addButtons(onlineData.buttons);
            formBuilder.addField(this.createHTMLField('header', onlineData.template.header, companyData));
            formBuilder.addField(this.createHTMLField('body', onlineData.template.body, onlineData.body));
        }

        return formBuilder.getForm();
    } catch (ex) {
        logException(ex, 'VAT.EU.Intrastat.View.OnlineView.process');
        throw ex;
    }
};

Tax.EU.Intrastat.View.OnlineView.prototype.createErrorField = function _createErrorField(error) {
    return this.createHTMLField('message', '<div>{{message}}</div<>', error);
};

Tax.EU.Intrastat.View.OnlineView.prototype.createHTMLField = function _createHTMLField(id, template, data) {
    if (!id) {
        throw nlapiCreateError('MISSING_PARAMETER', 'id argument is required');
    }

    if (!template) {
        throw nlapiCreateError('MISSING_PARAMETER', 'template argument is required');
    }

    if (!data) {
        throw nlapiCreateError('MISSING_PARAMETER', 'data argument is required');
    }

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
