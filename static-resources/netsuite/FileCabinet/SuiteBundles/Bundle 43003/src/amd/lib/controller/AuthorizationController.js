/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/runtime',
    'N/config',
    'N/redirect',
    '../base/BaseController',
    '../OnlineFilingManager',
    '../ClientAppCredentialsManager',
    '../OAuth2',
    '../module/util',
    '../module/environmentChecker',
    '../Constants',
    '../module/error'],
function(
    runtime,
    config,
    redirect,
    BaseController,
    OnlineFilingManager,
    ClientAppCredentialsManager,
    OAuth2,
    filingUtil,
    envCheck,
    Constants,
    error) {

    var AuthorizationController = function(request) {
        BaseController.call(this);
        this.name = 'AuthorizationController';
        this.request = request;
        this.credentialsManager = new ClientAppCredentialsManager();
        this.onlineFilingManager = new OnlineFilingManager();
        this.filingUtil = filingUtil;
        this.OAuth2 = OAuth2;
        this.currentSession = runtime.getCurrentSession();
        this.runtime = runtime;
        this.config = config;
        this.redirect = redirect;
        this.envCheck = envCheck;
        this.authorization = null;
    }

    util.extend(AuthorizationController.prototype, BaseController.prototype);

    AuthorizationController.prototype.execute = function() {
        var form;
        var fields = [];
        try {
            var requestParameters = this.getParameters();

            this.envCheck.validateEnvironment();

            var onlineFiling = this.getOnlineFiling(requestParameters.onlineFilingId);
            var onlineFilingConfig = this.onlineFilingManager.getConfiguration({ nexus: onlineFiling.nexus }) || {};
            var id = this.getTokenId(onlineFiling);
            
            this.authorization = this.initAuthorization({
                id: id,
                requestParameters: requestParameters,
                onlineFilingConfig: onlineFilingConfig
            });
            
            var token = this.authorization.authorize();
            if (token) {
                this.redirectToOnlineFiling({
                    id: id,
                    token: token,
                    onlineFilingId: requestParameters.onlineFilingId
                });
                form = this.buildForm(fields);
            } else if (!requestParameters.guid) {
                var queryParams = this.request.parameters;
                var params = Object.keys(queryParams).map(function(key) {
                    return key + '=' + queryParams[key]
                });
                fields = this.createAuthorizationRedirectFields({
                    onlineFilingId: requestParameters.onlineFilingId,
                    onlineFilingConfigName: onlineFilingConfig.name,
                    redirectURI: this.request.url + '?' + params.join('&')
                });
                // form to generate the GUID
                form = this.buildAuthorizationGUIDForm(fields);
            } else {
                this.onlineFilingManager.updateStatus(requestParameters.onlineFilingId, Constants.Status.FOR_USER_AUTHORIZATION);
                var state = this.filingUtil.generateCryptographicallyRandomString(requestParameters.guid);
                fields = this.createAuthorizationRedirectFields({
                    onlineFilingId: requestParameters.onlineFilingId,
                    onlineFilingConfigName: onlineFilingConfig.name,
                    redirectURI: this.authorization.generateAuthorizationURI(state)
                });
                // form to redirect to authorization endpoint
                form = this.buildForm(fields);
            }
        } catch (ex) {
            var name = ex.name || ex.code || 'ERROR';
            var message = ex.message || 'An error occurred';
            log.error({ title: this.name + '.execute', details: name + ' - ' + message });
            fields = [{ id: 'custpage_message', label: name + ' ', value: message, type: this.ui.FieldType.INLINEHTML }];
            this.onlineFilingManager.update(requestParameters.onlineFilingId, { status: Constants.Status.FAILED, result: message } );
            form = this.buildForm(fields);
        }

        return form;
    };

    AuthorizationController.prototype.initAuthorization = function(params) {
        var clientCredentials = this.getClientCredentials();
        var auth = this.filingUtil.findInJSON(params.onlineFilingConfig, 'authorization');
        var config = {
            clientCredentials: clientCredentials,
            baseURI: params.onlineFilingConfig.config.common.baseURI,
            authorization: auth.authorize,
            token: auth.token,
            redirectURI: this.buildRedirectURI(params.requestParameters),
            scope: ['read:vat', 'write:vat'],
            id: params.id
        };
        return new this.OAuth2.AuthorizationCode(config, params.requestParameters);
    };

    AuthorizationController.prototype.redirectToOnlineFiling = function(params) {
        this.currentSession.set({
            name: [params.id, Constants.TOKEN_ID].join('-'),
            value: JSON.stringify(params.token)
        });
        this.redirect.toSuitelet({
            scriptId: 'customscript_online_filing_su',
            deploymentId: 'customdeploy_online_filing_su',
            parameters: {
                onlineFilingId: params.onlineFilingId,
            }
        });
    };

    AuthorizationController.prototype.createAuthorizationRedirectFields = function(params) {
        var fields = [];

        fields.push({
            id: 'custpage_message',
            label: 'Message',
            type: this.ui.FieldType.INLINEHTML,
            value: 'Please wait while we redirect you to ' + params.onlineFilingConfigName + '\'s login page...' });
        fields.push({
            id: 'custpage_redirect_uri',
            label: 'Redirect URI',
            type: this.ui.FieldType.TEXTAREA,
            value: params.redirectURI,
            displayType: this.ui.FieldDisplayType.HIDDEN});
        
        return fields;
    };

    AuthorizationController.prototype.getClientCredentials = function() {
        var isLiveProd = this.envCheck.isLiveEnvironment() && this.envCheck.isProductionEnvironment();
        var credentials = this.credentialsManager.get(isLiveProd ? Constants.ENVIRONMENT.LIVE : Constants.ENVIRONMENT.TEST);
        return credentials ? JSON.parse(credentials) : null;
    };

    AuthorizationController.prototype.getParameters = function() {
        var requestParams = this.request.parameters;
        var params = {
            onlineFilingId: requestParams.onlineFilingId,
            script: requestParams.script,
            deploy: requestParams.deploy,
        };
        if (requestParams.error) {
            params.error = {
                name: requestParams.error,
                code: requestParams.error_code,
                description: requestParams.error_description
            };
        } else {
            params.code = requestParams.code;
            params.state = requestParams.state;
        }
        if (requestParams.guid) {
            params.guid = requestParams.guid; 
        }
        return params;
    };

    AuthorizationController.prototype.buildRedirectURI = function(params) {
        var isDebugMode = this.request.url.indexOf('https://debugger') === 0; // TODO This is for testing only!
        var baseURI = isDebugMode ?
                'https://debugger.na3.netsuite.com/app/site/hosting/scriptlet.nl' :
                Constants.BASE_URL + Constants.BASE_REDIRECT_PATH;
        var compId = this.config.load({ type: this.config.Type.COMPANY_INFORMATION }).getValue('companyid');
        var urlParams = [
            'script=' + params.script,
            'deploy=' + params.deploy,
            'compid=' + compId,
            'onlineFilingId=' + params.onlineFilingId
        ].join('&');
        return [baseURI, urlParams].join('?');
    };

    AuthorizationController.prototype.buildForm = function(fields) {
        var config = {
            title: 'Authorization',
            fields: fields,
            clientScriptModulePath: '../../component/cs/authorization_cs'
        };
        return BaseController.prototype.buildForm.call(this, config);
    };

    AuthorizationController.prototype.buildAuthorizationGUIDForm = function(fields) {
        var config = {
            title: 'Authorization',
            fields: fields,
            clientScriptModulePath: '../../component/cs/authorization_cs'
        };
        var form = BaseController.prototype.buildForm.call(this, config);
        
        var secretKeyField = form.addSecretKeyField({
            id : 'custpage_authorization_guid',
            label : 'GUID',
            restrictToScriptIds: this.runtime.getCurrentScript().id,
            restrictToCurrentUser : false
        });
        secretKeyField.updateDisplayType({ displayType: this.ui.FieldDisplayType.HIDDEN });
        secretKeyField.defaultValue = this.filingUtil.generateRandomString();
        
        return form;
    };

    return AuthorizationController;
});
