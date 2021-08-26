/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/task',
    'N/crypto',
    'N/encode',
    'N/runtime',
    '../base/BaseController',
    '../OnlineFilingManager',
    '../module/environmentChecker',
    '../Constants',
    '../module/error',
    '../module/util',
    '../FormBuilder',
],
function(
    task,
    crypto,
    encode,
    runtime,
    BaseController,
    OnlineFilingManager,
    envCheck,
    Constants,
    error,
    filingUtil,
    FormBuilder
) {

    var OnlineFilingRunnerController = function(request) {
        BaseController.call(this);
        this.name = 'OnlineFilingRunnerController';
        this.request = request;
        this.runtime = runtime;
        this.isOneWorld = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' });
        this.onlineFilingManager = new OnlineFilingManager();
        this.envCheck = envCheck;
        this.task = task;
        this.filingUtil = filingUtil;
        this.formBuilder = new FormBuilder();
    }

    util.extend(OnlineFilingRunnerController.prototype, BaseController.prototype);

    OnlineFilingRunnerController.prototype.execute = function() {
        var fields = [];
        try {
            var parameters = this.request.parameters;
            this.envCheck.validateEnvironment();
            this.formBuilder.init({
                title: 'Online Filing'
            });
            var token;
            var onlineFiling;
            var requestHeaders;
            if (!parameters.onlineFilingId) {
                error.throw(
                    Constants.MESSAGE.ERROR.INVALID_PARAMETERS,
                    'OnlineFilingRunnerController.execute'
                );
            }
            onlineFiling = this.getOnlineFiling(parameters.onlineFilingId);
            token = this.getToken(onlineFiling);
            if (!token) {
                error.throw(
                    Constants.MESSAGE.ERROR.NOT_AUTHORIZED,
                    'OnlineFilingRunnerController.execute'
                );
            }
            requestHeaders = this.getRequestHeaders(onlineFiling);

            this.onlineFilingManager.updateStatus(parameters.onlineFilingId, Constants.Status.PENDING);
            var isTriggered = this.runOnlineFilingScheduledScript(parameters.onlineFilingId, token, requestHeaders);
            var isSubmitted = onlineFiling.action === Constants.ACTION.SUBMIT || onlineFiling.action === Constants.ACTION.SUBMIT_CSV;
            var onlineFilingAction = isSubmitted ? 'submission' : 'retrieval';
            var message = isTriggered ?
                    this.filingUtil.formatString(Constants.MESSAGE.ONLINE_FILING.IN_PROCESS, onlineFilingAction) :
                    this.filingUtil.formatString(Constants.MESSAGE.ONLINE_FILING.NOT_IN_PROCESS, onlineFilingAction);
            this.formBuilder.addField({ id: 'custpage_message', label: 'Message', type: this.ui.FieldType.INLINEHTML, value: message });
        } catch (ex) {
            var name = ex.name || ex.code || 'ERROR';
            var message = ex.message || 'An error occurred';
            log.error({ title: this.name + '.execute', details: name + ' - ' + message });
            this.onlineFilingManager.update(parameters.onlineFilingId, { status: Constants.Status.FAILED, result: message } );
            this.formBuilder.addField({ id: 'custpage_message', label: name, type: this.ui.FieldType.INLINEHTML, value: message });
        }

        return this.formBuilder.form;
    };

    OnlineFilingRunnerController.prototype.runOnlineFilingScheduledScript = function(onlineFilingId, token, requestHeaders) {
        var url = this.request.url;
        var ssParams = {
            onlineFilingId: onlineFilingId,
            headerData: requestHeaders,
            token: token.accessToken,
            baseURL: url.substring(0, url.indexOf('/app')) || Constants.BASE_URL
        };
        var ssTask = this.task.create({
            taskType: this.task.TaskType.SCHEDULED_SCRIPT,
            scriptId: 'customscript_online_filing_ss',
            deploymentId: 'customdeploy_online_filing_ss',
            params: {
                custscript_online_filing_data : JSON.stringify(ssParams)
            }
        });
        return !!ssTask.submit();
    };

    OnlineFilingRunnerController.prototype.getRequestHeaders = function(onlineFiling) {
        var clientHeaders = onlineFiling.metaData.clientHeaders;
    	var headers = {};
    	var compId = this.runtime.accountId;
    	var userId = this.runtime.getCurrentUser().id;

    	headers.encryptedUid = this.getEncryptedUserId(compId, userId);
    	headers.clientPublicIp = clientHeaders.publicIp || '';
    	headers.timezone = this.getTimezone(clientHeaders.tzOffset);
        headers.clientLocalIp = clientHeaders.localIp || '';
    	headers.nsVersion = encodeURI(this.getNSVersion());
    	headers.clientScreens = 'width=' + clientHeaders.screenWidth +
    	                        '&height=' + clientHeaders.screenHeight +
    	                        '&scaling-factor='  + clientHeaders.pixelRatio;
    	headers.windowSize = 'width=' + clientHeaders.innerWidth +
    	                     '&height=' + clientHeaders.innerHeight;
    	headers.jsUserAgent = clientHeaders.jsUserAgent;
    	headers.doNotTrack = !!clientHeaders.doNotTrack;
    	headers.browserPlugins = clientHeaders.browserPlugins;
    	
        return headers;
    };

    OnlineFilingRunnerController.prototype.getEncryptedUserId = function(compId, userId) {
    	var uidInput = '{' + compId + '-' + userId + '}';
    	
        var sKey = crypto.createSecretKey({
            guid: uidInput,
            encoding: encode.Encoding.UTF_8
        });
        var hashSHA256 = crypto.createHash({
            algorithm: crypto.HashAlg.SHA256,
            key: sKey
        });
        hashSHA256.update({
            input: uidInput,
        });
        var digestSHA256 = hashSHA256.digest({
            outputEncoding: encode.Encoding.HEX
        });
    	
    	return 'os=' + digestSHA256;
    };

    OnlineFilingRunnerController.prototype.getTimezone = function(tzOffset) {
    	var tzSign = tzOffset > 0 ? '-' : '+';
    	var tzHour = Math.abs(Math.floor(tzOffset / Constants.TIME.MINUTES)).toString();
    	var tzMinute = Math.abs(tzOffset % Constants.TIME.MINUTES).toString();
    	
    	tzHour = tzHour.replace(/^(\d)$/, '0$1');
    	tzMinute = tzMinute.replace(/^(\d)$/, '0$1');
    	
    	return 'UTC' + tzSign + tzHour + ':' + tzMinute;
    };

    OnlineFilingRunnerController.prototype.getNSVersion = function() {
    	var nsVersion = 'NetSuite ';
    	nsVersion += this.isOneWorld ? 'OneWorld' : 'Mid-market';
    	nsVersion += '=' + this.runtime.version;
    	
    	return nsVersion;
    };

    return OnlineFilingRunnerController;
});
