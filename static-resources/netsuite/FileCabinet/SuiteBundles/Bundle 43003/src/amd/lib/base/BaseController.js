/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/ui/serverWidget',
    'N/runtime',
    'N/xml',
    '../module/error',
    '../OnlineFilingManager',
    '../Constants'],
function(
    ui,
    runtime,
    xml,
    error,
    OnlineFilingManager,
    Constants) {

    function BaseController() {
        this.name = 'BaseController';
        this.isOneWorld = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' });
        this.currentSession = runtime.getCurrentSession();
        this.onlineFilingManager = new OnlineFilingManager();
        this.ui = ui;
        this.xml = xml;
    };

    BaseController.prototype.getTokenId = function(onlineFiling) {
        if (!onlineFiling || !onlineFiling.user || !onlineFiling.nexus || !onlineFiling.vrn || (this.isOneWorld && !onlineFiling.subsidiary)) {
            error.throw(
                { code: 'INVALID_PARAMETER', message: 'onlineFiling parameter is invalid' },
                this.name + '.getTokenId'
            );
        }
        var id = [ onlineFiling.user, onlineFiling.nexus, onlineFiling.vrn ];
        if (this.isOneWorld) {
            id.push(onlineFiling.subsidiary);
        }
        return id.join('-');
    };

    BaseController.prototype.getToken = function(onlineFiling) {
        var id = this.getTokenId(onlineFiling) + '-' + Constants.TOKEN_ID;
        var token = this.currentSession.get({
            name: id
        });
        if (token) {
            return JSON.parse(token);
        } else {
            return null;
        }
    };

    BaseController.prototype.getOnlineFiling = function(onlineFilingId) {
        var onlineFiling = this.onlineFilingManager.get(onlineFilingId);
        return onlineFiling;
    };

    BaseController.prototype.buildForm = function(config) {
        var form = this.ui.createForm({
            title: config.title
        });
        var fields = config.fields;
        var fieldConfig;
        var fieldObj;

        if (config.clientScriptModulePath) {
            form.clientScriptModulePath = config.clientScriptModulePath;
        }
        for (var i = 0; i < fields.length; i++) {
            fieldConfig = fields[i];
            fieldObj = form.addField({
                id: fieldConfig.id,
                label: fieldConfig.label,
                type: fieldConfig.type,
            });
            if (fieldConfig.value) {
                fieldObj.defaultValue = this.xml.escape({
                    xmlText: fieldConfig.value
                });
            }
            if (fieldConfig.displayType) {
                fieldObj.updateDisplayType({ displayType: fieldConfig.displayType });
            }
        }

        return form;
    };

    return BaseController;
});
