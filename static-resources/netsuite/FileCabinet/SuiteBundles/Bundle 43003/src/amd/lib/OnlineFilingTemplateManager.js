/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    './module/error',
    './dao/OnlineFilingTemplateDAO'],
function(
    error,
    OnlineFilingTemplateDAO) {

    OnlineFilingTemplateManager = function() {
        this.name = 'OnlineFilingTemplateManager';
        this.onlineFilingTemplateDAO = new OnlineFilingTemplateDAO();
    }

    OnlineFilingTemplateManager.prototype.get = function(params) {
        if (!params) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'params is a required parameter' },
                this.name + '.get'
            );
        }
        var templateList = this.onlineFilingTemplateDAO.getList(params);
        var template = templateList && templateList.length > 0 ? templateList[0] : {};
        return template.content;
    };

    OnlineFilingTemplateManager.prototype.getByName = function(templateName) {
        return this.get({ name: templateName });
    };

    return OnlineFilingTemplateManager;
});
