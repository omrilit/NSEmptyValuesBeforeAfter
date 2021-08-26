/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Single Analysis Page Data Retrieval.
 * Retrieves chart data series via e2e & ssd
 *
 * @input : threadid
 * @output : JSON array w/ Total, Client, Init, Header, Render, Script, NS Time (Total-Client-Network-SS, or the left over), Network(Total-Client-Server),  Method, URL
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Feb 2015     jyeh             Initial
 * 2.00       22 Apr 2015     jmarimla         Additional validations in getNameIdMap
 * 3.00       30 Apr 2015     jmarimla         Check workflow feature and return script/wf id if name does not exist
 * 4.00       15 May 2015     jmarimla         Static data when in testmode
 * 5.00       11 Aug 2015     jmarimla         Support for company filter
 * 6.00       28 Aug 2015     rwong            Added support for customer debugging.
 * 7.00       04 Sep 2015     jmarimla         Added logging
 * 8.00       04 Sep 2015     rwong            Added Suitescripttime and Workflowtime
 * 9.00       20 Mar 2018     jmarimla         Client scripts
 * 10.00      04 May 2018     jmarimla         Label Client Scripts
 * 11.00      04 Sep 2018     jmarimla         Filter threadid2
 * 12.00      18 Oct 2018     jmarimla         Frht id
 * 13.00      26 Oct 2018     jmarimla         Uncomment frht
 * 14.00      28 Dec 2018     rwong            Fix handling of empty endtoendtime data
 * 15.00      04 Jan 2019     rwong            Remove date filters
 * 16.00      12 Apr 2019     jmarimla         Operation ids
 * 17.00      29 Jul 2019     erepollo         Added scriptid
 * 18.00      11 Oct 2019     jmarimla         Search by operationid
 * 19.00      17 Jan 2020     jmarimla         Customer debug changes
 * 20.00      03 Apr 2020     earepollo        Added custom GL lines scripts
 * 21.00      20 Apr 2020     earepollo        ExtJS to jQuery
 * 22.00      21 Apr 2020     earepollo        Fixed handling of empty data
 * 23.00      29 Apr 2020     earepollo        Changed onload and empty values to '-'
 * 24.00      19 May 2020     jmarimla         Payment processing plugin
 * 25.00      21 May 2020     earepollo        Tax calculation plugin
 * 26.00      20 May 2020     lemarcelo        Revenue Management plugin (advancedrevrec)
 * 27.00      06 Aug 2020     jmarimla         Json return
 * 28.00      10 Sep 2020     lemarcelo        Financial Institution Connectivity plugin
 * 29.00      10 Sep 2020     earepollo        Email capture plugin
 * 30.00      21 Sep 2020     lemarcelo        Shipping Partners plugin
 * 31.00      06 Oct 2020     earepollo        Promotions plugin
 *
 */
var onServerLog = true;
var MSG_TITLE = 'APM_PTD_CHARTDATA';
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);

var series = [];
var categories = [];
//NS Standard Color Pellets
var colors = {
    'ns': '#f0f9e8',
    'client': '#bae4bc', //client
    'network': '#7bccc4', //network
    'workflow': '#43a2ca', //workflow
    'script': '#0868ac', //script
    'customgllines': '#0868ac',
    'emailcapture': '#0868ac',
    'ficonnectivity': '#0868ac',
    'paymentgateway': '#0868ac',
    'promotions': '#0868ac',
    'advancedrevrec': '#0868ac',
    'shippingpartners': '#0868ac',
    'taxcalculation': '#0868ac'
};

var columnIdx_e2e = {
    'date': 0,
    'totaltime': 1,
    'clienttime': 2,
    'inittime': 3,
    'headertime': 4,
    'servertime': 5,
    'url': 6,
    'suitescripttime': 7,
    'workflowtime': 8,
    'operationId' : 9,
    'operationId2' : 10,
    'email' : 11
//, 'redirectdate' : 9
//, 'actiontype' : 10
};

var columnIdx_ssd = {
    'date': 0,
    'scripttype': 1,
    'script': 2,
    'triggertype': 3,
    'deployment': 4,
    'totaltime': 5,
    'usagecount': 6,
    'records': 7,
    'urlrequests': 8,
    'searches': 9,
    'workflowid': 10,
    'operationId': 11,
    'frhtId': 12,
    'scriptId': 13
};

var debugMode = false;
var compfil = "";

function suitelet(request, response) {

    MSG_TITLE = 'suitelet Test Mode';
    if (request.getParameter('testmode') == 'T') {
        var testData = apmServLib.getFileHtmlCode('apm_ptd_sl_instancechartdata.json');
        response.write(testData);
        return;
    }

    MSG_TITLE = 'suitelet Start';
    if (onServerLog) {
        logger.enable();
    }
    MSG_TITLE = 'suitelet Variables';
    var isReplyInJSON = '';
    var jsonInputData = {};
    var jsonReturnData = {};
    var params = {};
    var operationId = '';

    try {
        /*
         * Parameters Set-up
         */
        MSG_TITLE = 'suitelet Param Set-up';
        if (request) {
            isReplyInJSON = (apmServLib.isValidObject(request.getParameter('is_json')) && request.getParameter('is_json') == 'T') ? request.getParameter('is_json') : 'F';
            operationId = apmServLib.isValidObject(request.getParameter('operationId')) ? request.getParameter('operationId') : '';
            compfil = apmServLib.isValidObject(request.getParameter('compfil')) ? request.getParameter('compfil') : '';
        }

        debugMode = ((apmServLib.validateCompanyFilter('T')) && (nlapiGetContext().getCompany() != compfil));

        logger.debug('getRESTlet Parameters',
            'getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n' +
            'is_json          : ' + isReplyInJSON + '\r\n' +
            'operationId     : ' + operationId + '\r\n' +
            'compfil         : ' + compfil + '\r\n' +
            '************************' + '\r\n' +
            'jsonInputData    : ' + JSON.stringify(jsonInputData) + '\r\n'
        );
        /*
         * Set-up search parameters
         */
        params = {
            compfil: compfil,
            operationId: operationId
        };
        /*
         * Main
         */
        MSG_TITLE = 'getRESTlet start main';
        jsonReturnData = {
            success: true,
            message: '',
            total: 0,
            data: {
                series: [],
                categories: [],
                redirectStart: -1,
                totaltime: 0
            },
            email: '-',
            page: '-',
            time: '-',
            suitescripttime: 0,
            workflowtime: 0,
            operationId: '-'
        };
        if (apmServLib.isValidObject(params.operationId)) {
            getChartData(jsonReturnData, params);
        }
        jsonReturnData.message = 'endtoendtime loaded';
        /*
         * Return format: Json or String
         */
        MSG_TITLE = 'getRESTlet postProcesing';
        logger.debug(MSG_TITLE,
            'getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n' +
            '************************' + '\r\n' +
            'jsonReturnData   : ' + JSON.stringify(jsonReturnData) + '\r\n'
        );
    } catch (ex) {
        var body_message = '';
        if (ex instanceof nlobjError) {
            body_message = 'System Error: ' + MSG_TITLE + ': ' + ex.getCode() + ': ' + ex.getDetails();
            logger.error(MSG_TITLE, body_message);
        } else {
            body_message = 'Unexpected Error: ' + MSG_TITLE + ': ' + ex;
            logger.error(MSG_TITLE, body_message);
        }
        jsonReturnData = apmServLib.toJson(apmServLib.getFailMessage(body_message));
    }

    response.setContentType('JSON');
    response.write(JSON.stringify(jsonReturnData));
}

function getChartData(jsonReturnData, params) {

    var filters_e2e = new Array();
    var columns_e2e = new Array();
    var filters_ssd = new Array();
    var columns_ssd = new Array();
    var endToEndTimeData = new Object();
    var suiteScriptDetailData = new Array();
    var chartData = {};

    var operationIdArray = params.operationId.split('|'); //for multiple operationIds

    if (params.compfil) {
        filters_e2e.push(new nlobjPerformanceDataSearchFilter('compid', 'anyof', [params.compfil]));
    }
    filters_e2e.push( new nlobjPerformanceDataSearchFilter('operationid', 'anyof', operationIdArray) );

    if (params.compfil) {
        filters_ssd.push(new nlobjPerformanceDataSearchFilter('compid', 'anyof', [params.compfil]));
    }

    filters_ssd.push( new nlobjPerformanceDataSearchFilter('operationid', 'anyof', operationIdArray) );
    filters_ssd.push(new nlobjPerformanceDataSearchFilter('scripttype', 'anyof',
            ['WORKFLOW', 'USEREVENT', 'CLIENT', 'CUSTOMGLLINES', 'EMAILCAPTURE', 'FICONNECTIVITY', 'PAYMENTGATEWAY', 'PROMOTIONS', 'ADVANCEDREVREC', 'SHIPPINGPARTNERS', 'TAXCALCULATION']));

    /*
     * Perf Search Columns--always sort by time
     */
    columns_e2e[columnIdx_e2e.date] = new nlobjPerformanceDataSearchColumn('date').setSort();
    columns_e2e[columnIdx_e2e.totaltime] = new nlobjPerformanceDataSearchColumn('endtoendtime');
    columns_e2e[columnIdx_e2e.clienttime] = new nlobjPerformanceDataSearchColumn('pageloadtime');
    columns_e2e[columnIdx_e2e.inittime] = new nlobjPerformanceDataSearchColumn('pageinittime');
    columns_e2e[columnIdx_e2e.headertime] = new nlobjPerformanceDataSearchColumn('headertime');
    columns_e2e[columnIdx_e2e.servertime] = new nlobjPerformanceDataSearchColumn('servertime');
    columns_e2e[columnIdx_e2e.url] = new nlobjPerformanceDataSearchColumn('url');
    columns_e2e[columnIdx_e2e.suitescripttime] = new nlobjPerformanceDataSearchColumn('suitescripttime');
    columns_e2e[columnIdx_e2e.workflowtime] = new nlobjPerformanceDataSearchColumn('workflowtime');
    columns_e2e[columnIdx_e2e.operationId] = new nlobjPerformanceDataSearchColumn('operationid');
    columns_e2e[columnIdx_e2e.operationId2] = new nlobjPerformanceDataSearchColumn('operationid2');
    columns_e2e[columnIdx_e2e.email] = new nlobjPerformanceDataSearchColumn('email');
    //columns_e2e[columnIdx_e2e.redirectstart] = new nlobjPerformanceDataSearchColumn('redirectdate');

    columns_ssd[columnIdx_ssd.date] = new nlobjPerformanceDataSearchColumn('date').setSort();
    columns_ssd[columnIdx_ssd.scripttype] = new nlobjPerformanceDataSearchColumn('scripttype');
    columns_ssd[columnIdx_ssd.script] = new nlobjPerformanceDataSearchColumn('script');
    columns_ssd[columnIdx_ssd.triggertype] = new nlobjPerformanceDataSearchColumn('triggertype');
    columns_ssd[columnIdx_ssd.deployment] = new nlobjPerformanceDataSearchColumn('deployment');
    columns_ssd[columnIdx_ssd.totaltime] = new nlobjPerformanceDataSearchColumn('totaltime');
    columns_ssd[columnIdx_ssd.usagecount] = new nlobjPerformanceDataSearchColumn('usagecount');
    columns_ssd[columnIdx_ssd.records] = new nlobjPerformanceDataSearchColumn('records');
    columns_ssd[columnIdx_ssd.urlrequests] = new nlobjPerformanceDataSearchColumn('urlrequests');
    columns_ssd[columnIdx_ssd.searches] = new nlobjPerformanceDataSearchColumn('searches');
    columns_ssd[columnIdx_ssd.workflowid] = new nlobjPerformanceDataSearchColumn('workflowid');
    columns_ssd[columnIdx_ssd.operationId] = new nlobjPerformanceDataSearchColumn('operationid');
    columns_ssd[columnIdx_ssd.frhtId] = new nlobjPerformanceDataSearchColumn('frhtoperationid');
    columns_ssd[columnIdx_ssd.scriptId] = new nlobjPerformanceDataSearchColumn('scriptid');

    /*
     * SSD Search
     */
    logger.debug('suitescript search start',
        'params: ' + JSON.stringify(params) + '\r\n'
    );
    var search = nlapiCreatePerformanceDataSearch('suitescriptdetail', filters_ssd, columns_ssd);
    var resultObj = search.runSearch();
    var searchresults = resultObj.getResults(0, 1000);
    logger.debug('suitescript search end',
        'results: ' + searchresults + '\r\n'
    );

    for (var i = 0; i < searchresults.length; i++) {
        var date_ssd = searchresults[i][columnIdx_ssd.date];
        var scripttype_ssd = searchresults[i][columnIdx_ssd.scripttype];
        var script_ssd = searchresults[i][columnIdx_ssd.script];
        var triggertype = searchresults[i][columnIdx_ssd.triggertype] != null ? searchresults[i][columnIdx_ssd.triggertype].toLowerCase() : null;
        var deployment_ssd = searchresults[i][columnIdx_ssd.deployment];
        var totaltime_ssd = searchresults[i][columnIdx_ssd.totaltime];
        var usagecount_ssd = searchresults[i][columnIdx_ssd.usagecount];
        var records_ssd = searchresults[i][columnIdx_ssd.records];
        var urlrequests_ssd = searchresults[i][columnIdx_ssd.urlrequests];
        var searches_ssd = searchresults[i][columnIdx_ssd.searches];
        var workflowid_ssd = searchresults[i][columnIdx_ssd.workflowid];
        var operationId_ssd = searchresults[i][columnIdx_ssd.operationId];
        var frhtId_ssd = searchresults[i][columnIdx_ssd.frhtId];
        var scriptId_ssd = searchresults[i][columnIdx_ssd.scriptId];

        suiteScriptDetailData.push({
            date: date_ssd,
            scripttype: scripttype_ssd,
            script: script_ssd,
            triggertype: triggertype,
            deployment: deployment_ssd,
            totaltime: totaltime_ssd,
            usagecount: usagecount_ssd,
            records: records_ssd,
            urlrequests: urlrequests_ssd,
            searches: searches_ssd,
            workflowid: workflowid_ssd,
            operationId: operationId_ssd,
            frhtId: frhtId_ssd,
            scriptId: scriptId_ssd
        });
    }

    /*
     * E2E Search  - Only 1 row always
     */
    logger.debug('endtoend search start',
        'params: ' + JSON.stringify(params) + '\r\n'
    );
    search = nlapiCreatePerformanceDataSearch('endtoendtime', filters_e2e, columns_e2e);
    resultObj = search.runSearch();
    searchresults = resultObj.getResults(0, 1);
    logger.debug('endtoend search end',
        'results: ' + searchresults + '\r\n'
    );
    if (searchresults.length > 0) {
        endToEndTimeData.date = searchresults[0][columnIdx_e2e.date];
        endToEndTimeData.url = searchresults[0][columnIdx_e2e.url];
        endToEndTimeData.totaltime = searchresults[0][columnIdx_e2e.totaltime];
        endToEndTimeData.clienttime = searchresults[0][columnIdx_e2e.clienttime];
        endToEndTimeData.inittime = searchresults[0][columnIdx_e2e.inittime];
        endToEndTimeData.headertime = searchresults[0][columnIdx_e2e.headertime];
        endToEndTimeData.servertime = searchresults[0][columnIdx_e2e.servertime];
        endToEndTimeData.networktime = endToEndTimeData.totaltime - endToEndTimeData.servertime - endToEndTimeData.clienttime;
        endToEndTimeData.suitescripttime = searchresults[0][columnIdx_e2e.suitescripttime];
        endToEndTimeData.workflowtime = searchresults[0][columnIdx_e2e.workflowtime];
        endToEndTimeData.operationId = searchresults[0][columnIdx_e2e.operationId];
        endToEndTimeData.operationId2 = searchresults[0][columnIdx_e2e.operationId2];
        endToEndTimeData.email = searchresults[0][columnIdx_e2e.email];
        //endToEndTimeData.actiontype = searchresults[0][columnIdx_e2e.actiontype];
        //endToEndTimeData.redirectdate = searchresults[0][columnIdx_e2e.redirectdate] > 0 ? searchresults[0][columnIdx_e2e.redirectdate] : '';
        computeSeries(endToEndTimeData, suiteScriptDetailData);
        chartData.series = series;
        chartData.categories = categories;
        chartData.redirectstart = apmServLib.isValidObject(endToEndTimeData.redirectstart) ? endToEndTimeData.redirectstart : -1;
        chartData.totaltime = endToEndTimeData.totaltime / 1000;
    } else {
        //if endtoendtime returns no data, throw error.
        //ssd can be empty
        chartData.redirectstart = -1;
        chartData.totaltime = 0;
    }

    jsonReturnData.total = chartData.length;
    jsonReturnData.data = chartData;
    jsonReturnData.email = endToEndTimeData.email ? endToEndTimeData.email : '-';
    jsonReturnData.page = endToEndTimeData.url ? endToEndTimeData.url : '-';
    jsonReturnData.time = endToEndTimeData.date ? (nlapiDateToString(new Date(Date.parse(endToEndTimeData.date)), 'datetime')) : '-';
    jsonReturnData.suitescripttime = endToEndTimeData.suitescripttime ? (endToEndTimeData.suitescripttime / 1000) : 0;
    jsonReturnData.workflowtime = endToEndTimeData.workflowtime ? (endToEndTimeData.workflowtime / 1000) : 0;
    jsonReturnData.operationId = endToEndTimeData.operationId ? (endToEndTimeData.operationId + ( (endToEndTimeData.operationId2) ? '|'+endToEndTimeData.operationId2 : '' )) : '-';
}

function computeSeries(endToEndTimeData, suiteScriptDetailData) {
    var startDateInMs = apmServLib.convertStringToDateWithMillisecond(endToEndTimeData.date).getTime();
    //if (apmServLib.isValidObject(endToEndTimeData.redirectdate) && endToEndTimeData.actiontype == 'save') {
        //endToEndTimeData.redirectstart = apmServLib.convertStringToDateWithMillisecond(endToEndTimeData.redirectdate).getTime() - startDateInMs;
    //}
    var totalTimeInMs = endToEndTimeData.totaltime;
    var pageLoadStart = totalTimeInMs - endToEndTimeData.clienttime; //gets to the beginning of first byte in ms.
    var pageInitStart = totalTimeInMs - endToEndTimeData.inittime;
    var pageHeaderEnd = pageLoadStart + endToEndTimeData.headertime;
    var networkStart = pageLoadStart - endToEndTimeData.networktime; //gets to the beginning of network.

    var clientCategories = [];
    var clientSeries = [];
    if (suiteScriptDetailData.length > 0) {
        //first grab all the ssd entry id in getIdManager.
        var idManager = getIdManager(suiteScriptDetailData);
        var scriptIDNameMap = {};
        var wfIdNameMap = {};
        if (idManager['SCRIPT'].length > 0) {
            scriptIDNameMap = getNameIdMap('script', idManager['SCRIPT']);
        }
        if (idManager["WORKFLOW"].length > 0) {
            wfIdNameMap = getNameIdMap('workflow', idManager['WORKFLOW']);
        }

        //SSD series
        for (var i = 0; i < suiteScriptDetailData.length; i++) {
            var name = '';
            var startComponent = apmServLib.convertStringToDateWithMillisecond(suiteScriptDetailData[i].date).getTime() - startDateInMs; //gets the time since start
            var endComponent = startComponent + suiteScriptDetailData[i].totaltime;
            var obj = {};
            obj['id'] = 'ssdEntry' + i;
            obj['operationId'] = suiteScriptDetailData[i].operationId;
            obj['frhtId'] = suiteScriptDetailData[i].frhtId;

            if (suiteScriptDetailData[i].scripttype == 'CUSTOMGLLINES') {
                var scriptName = (scriptIDNameMap[suiteScriptDetailData[i].script]) ? scriptIDNameMap[suiteScriptDetailData[i].script] : suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                if (debugMode) scriptName = suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                name = 'Plug-in : ' + suiteScriptDetailData[i].triggertype + ' : ' + scriptName;
                obj['color'] = colors.customgllines;
                obj['low'] = startComponent / 1000;
                obj['high'] = endComponent / 1000;
            } else if (suiteScriptDetailData[i].scripttype == 'EMAILCAPTURE') {
                var scriptName = (scriptIDNameMap[suiteScriptDetailData[i].script]) ? scriptIDNameMap[suiteScriptDetailData[i].script] : suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                if (debugMode) scriptName = suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                name = 'Plug-in : ' + suiteScriptDetailData[i].triggertype + ' : ' + scriptName;
                obj['color'] = colors.emailcapture;
                obj['low'] = startComponent / 1000;
                obj['high'] = endComponent / 1000;
            } else if (suiteScriptDetailData[i].scripttype == 'FICONNECTIVITY') {
                var scriptName = (scriptIDNameMap[suiteScriptDetailData[i].script]) ? scriptIDNameMap[suiteScriptDetailData[i].script] : suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                if (debugMode) scriptName = suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                name = 'Plug-in : ' + suiteScriptDetailData[i].triggertype + ' : ' + scriptName;
                obj['color'] = colors.ficonnectivity;
                obj['low'] = startComponent / 1000;
                obj['high'] = endComponent / 1000;
            } else if (suiteScriptDetailData[i].scripttype == 'PAYMENTGATEWAY') {
                var scriptName = (scriptIDNameMap[suiteScriptDetailData[i].script]) ? scriptIDNameMap[suiteScriptDetailData[i].script] : suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                if (debugMode) scriptName = suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                name = 'Plug-in : ' + suiteScriptDetailData[i].triggertype + ' : ' + scriptName;
                obj['color'] = colors.paymentgateway;
                obj['low'] = startComponent / 1000;
                obj['high'] = endComponent / 1000;
            } else if (suiteScriptDetailData[i].scripttype == 'PROMOTIONS') {
                var scriptName = (scriptIDNameMap[suiteScriptDetailData[i].script]) ? scriptIDNameMap[suiteScriptDetailData[i].script] : suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                if (debugMode) scriptName = suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                name = 'Plug-in : ' + suiteScriptDetailData[i].triggertype + ' : ' + scriptName;
                obj['color'] = colors.promotions;
                obj['low'] = startComponent / 1000;
                obj['high'] = endComponent / 1000;
            } else if (suiteScriptDetailData[i].scripttype == 'ADVANCEDREVREC') {
                var scriptName = (scriptIDNameMap[suiteScriptDetailData[i].script]) ? scriptIDNameMap[suiteScriptDetailData[i].script] : suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                if (debugMode) scriptName = suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                name = 'Plug-in : ' + suiteScriptDetailData[i].triggertype + ' : ' + scriptName;
                obj['color'] = colors.advancedrevrec;
                obj['low'] = startComponent / 1000;
                obj['high'] = endComponent / 1000;
            } else if (suiteScriptDetailData[i].scripttype == 'SHIPPINGPARTNERS') {
                var scriptName = (scriptIDNameMap[suiteScriptDetailData[i].script]) ? scriptIDNameMap[suiteScriptDetailData[i].script] : suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                if (debugMode) scriptName = suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                name = 'Plug-in : ' + suiteScriptDetailData[i].triggertype + ' : ' + scriptName;
                obj['color'] = colors.shippingpartners;
                obj['low'] = startComponent / 1000;
                obj['high'] = endComponent / 1000;
            } else if (suiteScriptDetailData[i].scripttype == 'TAXCALCULATION') {
                var scriptName = (scriptIDNameMap[suiteScriptDetailData[i].script]) ? scriptIDNameMap[suiteScriptDetailData[i].script] : suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                if (debugMode) scriptName = suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                name = 'Plug-in : ' + suiteScriptDetailData[i].triggertype + ' : ' + scriptName;
                obj['color'] = colors.taxcalculation;
                obj['low'] = startComponent / 1000;
                obj['high'] = endComponent / 1000;
            } else if (suiteScriptDetailData[i].scripttype != 'WORKFLOW') {
                var scriptName = (scriptIDNameMap[suiteScriptDetailData[i].script]) ? scriptIDNameMap[suiteScriptDetailData[i].script] : suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                if (debugMode) scriptName = suiteScriptDetailData[i].script + ' ' + suiteScriptDetailData[i].scriptId;
                name = 'Script : ' + suiteScriptDetailData[i].triggertype + ' : ' + scriptName;
                obj['color'] = colors.script;
                obj['low'] = startComponent / 1000;
                obj['high'] = endComponent / 1000;
            } else {
                var wfName = (wfIdNameMap[suiteScriptDetailData[i].workflowid]) ? wfIdNameMap[suiteScriptDetailData[i].workflowid] : suiteScriptDetailData[i].workflowid + ' ' + suiteScriptDetailData[i].scriptId;
                if (debugMode) wfName = suiteScriptDetailData[i].workflowid + ' ' + suiteScriptDetailData[i].scriptId;
                name = 'Workflow : ' + wfName; //no trigger type here.
                obj['color'] = colors.workflow;
                obj['low'] = startComponent / 1000;
                obj['high'] = endComponent / 1000;
            }

            if (suiteScriptDetailData[i].scripttype == 'CLIENT') {
                clientCategories.push('Client' + name);
                clientSeries.push(obj);
            } else {
                categories.push(name);
                series.push(obj);
            }
        }
    }
    //push network
    categories.push('Network');
    series.push({
        'color': colors.network,
        'low': networkStart / 1000,
        'high': pageLoadStart / 1000
    });
    //push client
    categories.push('Client : Header');
    series.push({
        'color': colors.client,
        'low': pageLoadStart / 1000,
        'high': pageHeaderEnd / 1000
    });
    categories.push('Client : Render');
    series.push({
        'color': colors.client,
        'low': pageHeaderEnd / 1000,
        'high': pageInitStart / 1000
    });
    categories.push('Client : Init');
    series.push({
        'color': colors.client,
        'low': pageInitStart / 1000,
        'high': totalTimeInMs / 1000
    });
    //client scripts
    categories = categories.concat(clientCategories);
    series = series.concat(clientSeries);
}

function getIdManager(results) {
    var toRet = {};
    var scriptIds = {};
    var wfIds = {};
    for (var i = 0; i < results.length; i++) {
        if (results[i].scripttype == "WORKFLOW") {
            wfIds[results[i].workflowid] = '';
        } else {
            scriptIds[results[i].script] = '';
        }
    }
    toRet['WORKFLOW'] = Object.keys(wfIds);
    toRet['SCRIPT'] = Object.keys(scriptIds);
    return toRet;
}

function getNameIdMap(recordtype, ids) {
    if ((recordtype == 'workflow') && (!nlapiGetContext().getFeature('workflow'))) {
        return {};
    }
    if (!ids || ids.length == 0) return {};
    var toRet = {};
    var columns = [];
    var filters = [];
    columns.push(new nlobjSearchColumn('name'));
    columns.push(new nlobjSearchColumn('internalid'));
    filters.push(new nlobjSearchFilter('internalid', null, 'anyof', ids));
    var searchResults = nlapiSearchRecord(recordtype, null, filters, columns);
    if (searchResults) {
        for (var i = 0; i < searchResults.length; i++) {
            toRet[searchResults[i].getValue('internalid')] = searchResults[i].getValue('name');
        }
    }
    return toRet;
}