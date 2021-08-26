/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/runtime',
    'N/redirect',
    '../base/BaseController',
    '../OnlineFilingManager',
    '../FormBuilder',
    '../OAuth2',
    '../module/util',
    '../module/environmentChecker',
    '../Constants'
],
function(
    runtime,
    redirect,
    BaseController,
    OnlineFilingManager,
    FormBuilder,
    OAuth2,
    filingUtil,
    envCheck,
    Constants
) {

    var OnlineFilingController = function(request) {
        BaseController.call(this);
        this.name = 'OnlineFilingController';
        this.request = request;
        this.onlineFilingManager = new OnlineFilingManager();
        this.currentUser = runtime.getCurrentUser();
        this.currentSession = runtime.getCurrentSession();
        this.redirect = redirect;
        this.filingUtil = filingUtil;
        this.envCheck = envCheck;
        this.OAuth2 = OAuth2;
        this.formBuilder = new FormBuilder();
    }

    util.extend(OnlineFilingController.prototype, BaseController.prototype);

    OnlineFilingController.prototype.execute = function() {
        try {
            this.envCheck.validateEnvironment();
            this.formBuilder.init({
                title: 'Online Filing'
            });
            var params = this.getParameters();
            var onlineFiling = params.onlineFilingId ? this.getOnlineFiling(params.onlineFilingId) : this.createOnlineFiling(params);
            var token = this.getToken(onlineFiling);
            if (token && !this.OAuth2.token.isExpired(token)) {
                this.triggerOnlineFilingRunner(onlineFiling.id);
            } else {
                this.triggerAuthorization(onlineFiling);
            }
        } catch (ex) {
            var name = ex.name || ex.code || 'ERROR';
            var message = ex.message || 'An error occurred';
            log.error({ title: this.name + '.execute', details: name + ' - ' + message });
            this.formBuilder.addField({ id: 'custpage_message', label: name, type: this.ui.FieldType.INLINEHTML, value: message });
        }

        return this.formBuilder.form;
    };

    OnlineFilingController.prototype.getParameters = function() {
        var requestParams = this.request.parameters;
        var params = {};
        if (requestParams.onlineFilingId) {
            params.onlineFilingId = requestParams.onlineFilingId;
        } else if (requestParams.data) {
            params = JSON.parse(requestParams.data);
        }
        return params;
    };

    OnlineFilingController.prototype.createOnlineFiling = function(params) {
        var onlineFiling = this.onlineFilingManager.create({
            user: this.currentUser.id,
            nexus: params.nexus,
            subsidiary: params.subsidiary,
            vrn: params.vrn,
            periodFrom: params.periodFrom,
            periodTo: params.periodTo,
            data: params.data,
            accountingBook: params.accountingBook,
            metaData: {
                reportLink: params.reportLink,
                outputFolder: params.outputFolder,
                clientHeaders: params.clientHeaders
            },
            action: params.action,
            salesCacheId: params.salesCacheId,
            purchaseCacheId: params.purchaseCacheId
        });
        return this.getOnlineFiling(onlineFiling.id);
    };

    OnlineFilingController.prototype.triggerAuthorization = function(onlineFiling) {
        var onlineFilingConfig = this.onlineFilingManager.getConfiguration({ nexus: onlineFiling.nexus });
        // Run authorization process if configured
        var auth = this.filingUtil.findInJSON(onlineFilingConfig, 'authorization');
        if (auth) {
            this.onlineFilingManager.updateStatus(onlineFiling.id, Constants.Status.FOR_USER_AUTHORIZATION);
            this.redirect.toSuitelet({
                scriptId: 'customscript_authorization_su',
                deploymentId: 'customdeploy_authorization_su',
                parameters: {
                    onlineFilingId: onlineFiling.id
                }
            });
        }
    };

    OnlineFilingController.prototype.triggerOnlineFilingRunner = function(onlineFilingId) {
        this.redirect.toSuitelet({
            scriptId: 'customscript_online_filing_runner_su',
            deploymentId: 'customdeploy_online_filing_runner_su',
            parameters: { onlineFilingId: onlineFilingId }
        });
    };

    return OnlineFilingController;
});
