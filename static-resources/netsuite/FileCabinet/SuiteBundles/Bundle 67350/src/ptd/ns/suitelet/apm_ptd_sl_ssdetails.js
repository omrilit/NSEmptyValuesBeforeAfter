/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Single Analysis Page Data Retrieval.
 * Retrieves endtoendtime data
 *
 * @dataIn : threadid
 * @output : JSON array w/ SS related entries
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Feb 2015     jyeh             Initial
 * 2.00       13 Mar 2015     jmarimla         Validate 'ids' in getNameIdMap
 * 3.00       22 Apr 2015     jmarimla         Additional validation in getNameIdMap
 * 4.00       30 Apr 2015     jmarimla         Check workflow feature and return script/wf id if name does not exist
 * 5.00       15 May 2015     jmarimla         Static data when in testmode
 * 6.00       16 Jul 2015     jmarimla         Include script name in redirect url; Modified date format returned
 * 7.00       11 Aug 2015     jmarimla         Support for company filter
 * 8.00       28 Aug 2015     rwong            Added support for customer debugging
 * 9.00       04 Sep 2015     jmarimla         Added logging
 * 10.00      19 May 2016     rwong            Added seconds to the date field
 * 11.00      06 Aug 2016     jmarimla         Support for suitescript context
 * 12.00      20 Mar 2018     jmarimla         Client scripts
 * 13.00      04 Sep 2018     jmarimla         Filter threadid2
 * 14.00      18 Oct 2018     jmarimla         Frht id
 * 15.00      26 Oct 2018     jmarimla         Uncomment frht
 * 16.00      04 Jan 2019     rwong            Remove date filters
 * 17.00      17 Jul 2019     erepollo         Added script name in customer debug
 * 18.00      29 Jul 2019     erepollo         Changes in bundle and script names
 * 19.00      08 Aug 2019     erepollo         Added deployment name and changes in handling script/workflow names
 * 20.00      14 Aug 2019     erepollo         Changes in sorting script/workflow and deployment names
 * 21.00      11 Oct 2019     jmarimla         Search by operationid
 * 22.00      17 Jan 2020     jmarimla         Customer debug changes
 * 23.00      03 Apr 2020     earepollo        Added custom GL lines scripts
 * 24.00      20 Apr 2020     earepollo        ExtJS to jQuery
 * 25.00      21 Apr 2020     earepollo        Fixed null deployment
 * 26.00      19 May 2020     jmarimla         Payment processing plugin
 * 27.00      21 May 2020     earepollo        Tax calculation plugin
 * 28.00      21 May 2020     lemarcelo        Revenue Management plugin (advancedrevrec)
 * 29.00      06 Aug 2020     jmarimla         Json return
 * 30.00      10 Sep 2020     lemarcelo        Financial Institution Connectivity plugin
 * 31.00      10 Sep 2020     earepollo        Email capture plugin
 * 32.00      21 Sep 2020     lemarcelo        Shipping Partners plugin
 * 33.00      06 Oct 2020     earepollo        Promotions plugin
 * 44.00      28 Oct 2020     earepollo        Fixed starttime is null parameter for SSA. Roundoff time values
 *
 */

var onServerLog = true;
var MSG_TITLE = 'APM_PTD_SUITESCRIPTDETAIL';
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);
var columnIdx = {
          'date' : 0
        , 'scripttype' : 1
        , 'script' : 2
        , 'triggertype' : 3
        , 'deployment' : 4
        , 'totaltime' : 5
        , 'usagecount': 6
        , 'records' : 7
        , 'urlrequests' : 8
        , 'searches' : 9
        , 'threadid' : 10
        , 'workflowid' : 11
        , 'operationId' : 12
        , 'frhtId' : 13
        , 'customScriptId' : 14
        , 'customDeploymentId' : 15
};
var debugMode = false;
var compfil = "";

function suitelet(request, response){

    MSG_TITLE = 'suitelet Test Mode';
    if (request.getParameter('testmode') == 'T') {
        var testData = apmServLib.getFileHtmlCode('apm_ptd_sl_ssdetails.json');
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
    var startdate = '';
    var enddate = '';
    var operationId = '';

    try {
        /*
         * Parameters Set-up
         */
        MSG_TITLE = 'suitelet Param Set-up';
        if (request) {
            isReplyInJSON = (apmServLib.isValidObject(request.getParameter('is_json')) && request.getParameter('is_json') == 'T') ? request.getParameter('is_json') : 'F';
            startdate = apmServLib.isValidObject(request.getParameter('startdate')) ? request.getParameter('startdate') : '';
            enddate = apmServLib.isValidObject(request.getParameter('enddate')) ? request.getParameter('enddate') : '';
            operationId = apmServLib.isValidObject(request.getParameter('operationId')) ? request.getParameter('operationId') : '';
            compfil = apmServLib.isValidObject(request.getParameter('compfil')) ? request.getParameter('compfil') : '';

        }

        debugMode = ((apmServLib.validateCompanyFilter('T')) && (nlapiGetContext().getCompany() != compfil));

        logger.debug('suitelet Parameters',
                'getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n'
                + 'is_json          : ' + isReplyInJSON + '\r\n'
                + 'startdate         : ' + startdate + '\r\n'
                + 'enddate         : ' + enddate + '\r\n'
                + 'operationId     : ' + operationId + '\r\n'
                + 'compfil         : ' + compfil + '\r\n'
                + '************************' + '\r\n'
                + 'jsonInputData    : ' + JSON.stringify(jsonInputData) + '\r\n'
        );
        /*
         * Set-up search parameters
         */
        params = {
                startdate : startdate
              , enddate : enddate
              , compfil : compfil
              , operationId : operationId
          };
        /*
         * Main
         */
        MSG_TITLE = 'suitelet start main';
        jsonReturnData = {
            success : true
            , message : ''
            , total : 0
            , data : []
        };
        if (apmServLib.isValidObject(params.operationId)) {
            getSuiteScriptDetailRecords(jsonReturnData, params);
        }
        jsonReturnData.message = 'suitescript detail loaded';
        /*
         * Return format: Json or String
         */
        MSG_TITLE = 'suitelet postProcesing';
        logger.debug(MSG_TITLE,
                'getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n'
                + '************************' + '\r\n'
                + 'jsonReturnData   : ' + JSON.stringify(jsonReturnData) + '\r\n'
        );
    } catch (ex) {
        var body_message = '';
        if (ex instanceof nlobjError){
            body_message = 'System Error: ' + MSG_TITLE + ': ' + ex.getCode() + ': ' + ex.getDetails();
            logger.error(MSG_TITLE, body_message);
        }else {
            body_message = 'Unexpected Error: ' + MSG_TITLE + ': ' + ex;
            logger.error(MSG_TITLE, body_message);
        }
        jsonReturnData = apmServLib.toJson(apmServLib.getFailMessage (body_message));
    }

    response.setContentType('JSON');
    response.write(JSON.stringify(jsonReturnData));
}

function getSuiteScriptDetailRecords(jsonReturnData, params) {
    var filters = new Array();
    var columns = new Array();

    var operationIdArray = params.operationId.split('|'); //for multiple operationIds
    filters.push( new nlobjPerformanceDataSearchFilter('operationid', 'anyof', operationIdArray) );
    filters.push( new nlobjPerformanceDataSearchFilter('scripttype', 'anyof',
            ['WORKFLOW', 'USEREVENT', 'CLIENT', 'CUSTOMGLLINES', 'EMAILCAPTURE', 'FICONNECTIVITY', 'PAYMENTGATEWAY', 'PROMOTIONS', 'ADVANCEDREVREC', 'SHIPPINGPARTNERS', 'TAXCALCULATION']));
    if(params.compfil) {
        filters.push(new nlobjPerformanceDataSearchFilter('compid', 'anyof', [params.compfil]));
    }

    columns[columnIdx.date] =  new nlobjPerformanceDataSearchColumn('date').setSort();
    columns[columnIdx.scripttype] =  new nlobjPerformanceDataSearchColumn('scripttype');
    columns[columnIdx.script] =  new nlobjPerformanceDataSearchColumn('script');
    columns[columnIdx.triggertype] =  new nlobjPerformanceDataSearchColumn('triggertype');
    columns[columnIdx.deployment] =  new nlobjPerformanceDataSearchColumn('deployment');
    columns[columnIdx.totaltime] = new nlobjPerformanceDataSearchColumn('totaltime');
    columns[columnIdx.usagecount] = new nlobjPerformanceDataSearchColumn('usagecount');
    columns[columnIdx.records] = new nlobjPerformanceDataSearchColumn('records');
    columns[columnIdx.urlrequests] =  new nlobjPerformanceDataSearchColumn('urlrequests');
    columns[columnIdx.searches] =  new nlobjPerformanceDataSearchColumn('searches');
    columns[columnIdx.threadid] = new nlobjPerformanceDataSearchColumn('threadid');
    columns[columnIdx.workflowid] = new nlobjPerformanceDataSearchColumn('workflowid');
    columns[columnIdx.operationId] = new nlobjPerformanceDataSearchColumn('operationid');
    columns[columnIdx.frhtId] = new nlobjPerformanceDataSearchColumn('frhtoperationid');
    columns[columnIdx.customScriptId] = new nlobjPerformanceDataSearchColumn('scriptid');
    columns[columnIdx.customDeploymentId] = new nlobjPerformanceDataSearchColumn('deploymentid');

    logger.debug('suitescript search start',
            'params: ' + JSON.stringify(params) + '\r\n'
    );
    var search = nlapiCreatePerformanceDataSearch('suitescriptdetail', filters, columns);
    var resultObj = search.runSearch();
    var searchResult =resultObj.getResults(0,1000);
    logger.debug('suitescript search end',
            'results: ' + searchResult + '\r\n'
    );
    var suiteScriptDetailData = new Array();
    if (searchResult.length > 0)
    {
        var idManager = getIdManager(searchResult);
        var scriptKeyNameMap = getNameIdMap('script', idManager['SCRIPT']);
        var workflowKeyNameMap = getNameIdMap('workflow', idManager['WORKFLOW']);
        var deploymentKeyNameMap = getNameIdMap('scriptdeployment', idManager['SCRIPTDEPLOYMENT']);
        for (var i = 0 ; i < searchResult.length; i++) {
            var date = nlapiDateToString(new Date(Date.parse(searchResult[i][columnIdx.date])), 'datetimetz');
            var scripttype = searchResult[i][columnIdx.scripttype];
            var scriptid = scripttype=='WORKFLOW'? searchResult[i][columnIdx.workflowid] : searchResult[i][columnIdx.script];
            var scriptName = scripttype=='WORKFLOW' ? workflowKeyNameMap[scriptid] : scriptKeyNameMap[scriptid];
            var customscriptid = searchResult[i][columnIdx.customScriptId];
            var triggertype = searchResult[i][columnIdx.triggertype] != null ? searchResult[i][columnIdx.triggertype].toLowerCase() : null;
            var deploymentId = searchResult[i][columnIdx.deployment] > 0 ? searchResult[i][columnIdx.deployment] : '';
            var deploymentName = deploymentKeyNameMap[deploymentId];
            var customDeploymentId = searchResult[i][columnIdx.customDeploymentId];
            var totaltime = searchResult[i][columnIdx.totaltime] / 1000.0;
            var usagecount = searchResult[i][columnIdx.usagecount];
            var records = searchResult[i][columnIdx.records];
            var urlrequests = searchResult[i][columnIdx.urlrequests];
            var searches = searchResult[i][columnIdx.searches];
            var threadid = searchResult[i][columnIdx.threadid];
            var id = 'ssdEntry'+i;
            var currdate = new Date(new Date().getTime() - (new Date().getTimezoneOffset()*60*1000));
            currdate.setMinutes(0);
            currdate.setSeconds(0);
            var ssaend = currdate.toISOString().substr(0, 19);
            var previousdate = new Date(currdate.setDate(currdate.getDate()-1));
            var ssastart = previousdate.toISOString().substr(0, 19);
            var scriptwfurl = getScriptWorkflowUrl(scriptid, triggertype, scripttype, ssastart, ssaend, scriptName, customscriptid);
            var deploymenturl  = debugMode ? '' : getDeploymentUrl(scriptid, deploymentId);
            var operationId = searchResult[i][columnIdx.operationId];
            var frhtId = searchResult[i][columnIdx.frhtId];

            suiteScriptDetailData.push({
                date : date
                , scripttype : scripttype
                , script : scriptName ? scriptName : customscriptid
                , scriptid : scriptid
                , scriptName : scriptName
                , customscriptid : customscriptid
                , triggertype : triggertype
                , deployment : deploymentName ? deploymentName : customDeploymentId
                , deploymentId : deploymentId
                , deploymentName : deploymentName
                , customDeploymentId : customDeploymentId
                , totaltime : totaltime
                , usagecount : usagecount
                , records : records
                , urlrequests : urlrequests
                , searches : searches
                , threadid : threadid
                , id : id
                , scriptwfurl : scriptwfurl
                , deploymenturl : deploymenturl
                , operationId: operationId
                , frhtId: frhtId
            });
        }
    }
    jsonReturnData.total = searchResult.length;
    jsonReturnData.data = suiteScriptDetailData;
}

function getIdManager(results)
{
    var toRet = {};
    var scriptIds= {};
    var wfIds = {};
    var deploymentIds = {};
    for (var i = 0 ; i < results.length; i++)
    {
        if (results[i][columnIdx.scripttype] == "WORKFLOW")
        {
            wfIds[results[i][columnIdx.workflowid]] = '';
        }
        else
        {
            scriptIds[results[i][columnIdx.script]] = '';
        }

        if(results[i][columnIdx.deployment] > 0) {
            deploymentIds[results[i][columnIdx.deployment]] = '';
        }
    }
    toRet['WORKFLOW'] = Object.keys(wfIds);
    toRet['SCRIPT'] = Object.keys(scriptIds);
    toRet['SCRIPTDEPLOYMENT'] = Object.keys(deploymentIds);
    return toRet;
}

function getNameIdMap(recordtype, ids)
{
    if ((recordtype == 'workflow')&&(!nlapiGetContext().getFeature('workflow'))) {
        return {};
    }
    if (!ids || ids.length==0) return {};
    var toRet= {};
    var columns = [];
    var filters = [];
    if(recordtype == 'scriptdeployment') {
        columns.push(new nlobjSearchColumn('title'));
    } else {
        columns.push(new nlobjSearchColumn('name'));
    }
    columns[1] = new nlobjSearchColumn('internalid');
    filters.push(new nlobjSearchFilter('internalid', null, 'anyof', ids));
    var searchResults = nlapiSearchRecord(recordtype, null, filters, columns);
    if (searchResults) {
        for (var i = 0 ; i < searchResults.length; i++)
        {
            toRet[searchResults[i].getValue('internalid')] = searchResults[i].getValue(columns[0]);
        }
    }
    return toRet;
}

function getScriptWorkflowUrl(id, triggertype, scripttype, startdate, enddate, scriptname, customscriptid)
{
    switch(triggertype){
        case 'beforeload':
            scripttype = 'usereventbeforeload';
            break;
        case 'beforesubmit':
            scripttype = 'usereventbeforesubmit';
            break;
        case 'aftersubmit':
            scripttype = 'usereventaftersubmit';
            break;
    }
    if(debugMode){
        if (scripttype != 'WORKFLOW')
        {
            var baseurl ="/app/site/hosting/scriptlet.nl?script=customscript_apm_ssa_sl_main&deploy=customdeploy_apm_ssa_sl_main";
            return baseurl+'&scripttype='+scripttype.toLowerCase()+'&scriptid='+id+'&sdatetime='+startdate+'&edatetime='+enddate+'&scriptname='+customscriptid+'&compfil='+compfil+'&context='+'userinterface';
        }
        else
        {
            return ''
        }
    } else {
        if (scripttype != 'WORKFLOW')
        {
            var baseurl ="/app/site/hosting/scriptlet.nl?script=customscript_apm_ssa_sl_main&deploy=customdeploy_apm_ssa_sl_main";
            if (!scriptname) {
                scriptname = id + ' ' + customscriptid;
            }
            return baseurl+'&scripttype='+scripttype.toLowerCase()+'&scriptid='+id+'&sdatetime='+startdate+'&edatetime='+enddate+'&scriptname='+scriptname+'&context='+'userinterface';
        }
        else
        {
            return "/app/common/workflow/setup/workflowmanager.nl?id="+id;
        }
    }
}

function getDeploymentUrl(id, deployment)
{
    if (deployment != null)
    {
        return "/app/common/scripting/scriptrecord.nl?scripttype="+id+"&id="+deployment;
    }
    return null;
}
