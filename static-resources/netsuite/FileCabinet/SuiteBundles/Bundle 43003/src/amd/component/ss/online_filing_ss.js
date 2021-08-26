/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define([
    'N/runtime',
    '../../lib/OnlineFilingManager',
    '../../lib/OnlineFilingRunner',
    '../../lib/Constants',
    '../../lib/module/environmentChecker'],
function(
    runtime,
    OnlineFilingManager,
    OnlineFilingRunner,
    Constants,
    envCheck) {

    function execute(context) {
        try {
            envCheck.validateEnvironment();

            var params = buildParams();
            var onlineFilingRunner = new OnlineFilingRunner();
            onlineFilingRunner.run(params);
        } catch (ex) {
            if (params && params.onlineFiling && params.onlineFiling.id) {
                new OnlineFilingManager().updateStatus(params.onlineFiling.id, Constants.Status.FAILED);
            }
            log.error({ title: 'Online Filing Scheduled Script - execute', details: ex });
        }
    }

    function buildParams() {
        var ssParams = JSON.parse(runtime.getCurrentScript().getParameter('custscript_online_filing_data'));
        var onlineFilingMgr = new OnlineFilingManager();
        var onlineFiling = onlineFilingMgr.get(ssParams.onlineFilingId);
        var onlineFilingConfiguration = onlineFilingMgr.getConfiguration({ nexus: onlineFiling.nexus });
        var params;

        onlineFiling.accessToken = ssParams.token;
        onlineFiling.headerData = ssParams.headerData;
        onlineFiling.baseURL = ssParams.baseURL;
        onlineFiling.drillDownCache = ssParams.drillDownCache;
        onlineFiling.outputFolder = ssParams.outputFolder;
        params = {
            action: ssParams.action,
            onlineFiling: onlineFiling,
            onlineFilingConfiguration: onlineFilingConfiguration
        };
        if (envCheck.isTestEnvironment()) {
            log.debug({ title: 'ACCESS_TOKEN', details: onlineFiling.accessToken });
        }

        return params;
    }

    return {
        execute: execute
    };
});
