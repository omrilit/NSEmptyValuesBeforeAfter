/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       26 Feb 2015     jmarimla         Initial
 * 2.00       03 Mar 2015     jmarimla         Fix date formatting, return script names
 * 3.00       01 Apr 2015     rwong            Added workflowname
 * 4.00       09 Apr 2015     jyeh
 * 5.00       29 Apr 2015     jmarimla         Return scripttype and triggertype
 * 6.00       30 Apr 2015     jmarimla         Check workflow feature
 * 7.00       15 May 2015     jmarimla         Static data when in testmode
 * 8.00       19 Jun 2015     rwong            Update to support returning the url for page time summary
 * 9.00       16 Jul 2015     jmarimla         Include script name in redirect url
 * 10.00      24 Jul 2015     jmarimla         Filter scriptcontext = userinterface
 * 11.00      11 Aug 2015     jmarimla         Support for company filter
 * 12.00      27 Aug 2015     rwong            Added support for customer debugging
 * 13.00      04 Sep 2015     jmarimla         Added logging
 * 14.00      05 Aug 2016     jmarimla         Support for suitescript context
 * 15.00      20 Mar 2018     jmarimla         Client scripts
 * 16.00      04 May 2018     jmarimla         User interface filter
 * 17.00      26 Jul 2018     jmarimla         Translation string
 * 18.00      04 Sep 2018     jmarimla         Filter threadid2
 * 19.00      17 Jul 2019     erepollo         Added script name in customer debug
 * 20.00      29 Jul 2019     erepollo         Changes in bundle and script names
 * 21.00      30 Jul 2019     rwong            Added workflowtime
 * 22.00      08 Aug 2019     erepollo         Added logic in sorting script names
 * 23.00      14 Aug 2019     erepollo         Changes in sorting script names
 * 24.00      16 Aug 2019     erepollo         Disregard id in sorting script/workflow names
 * 25.00      14 Jan 2020     jmarimla         Customer debug changes
 * 26.00      27 Jan 2020     jmarimla         Try catch metadataapi
 * 27.00      15 Jun 2020     erepollo         Modified handling of scripttype param in SSA link
 * 28.00      18 Jun 2020     earepollo        Label change
 * 29.00      30 Jul 2020     jmarimla         r2020a strings
 * 30.00      24 Aug 2020     lemarcelo        ExtJS to jQuery
 *
 */

var translationStrings = psgp_apm.translation10.load();
var onServerLog = true;
var MSG_TITLE = "APM_PTS_SUITESCRIPT_DETAIL";
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);
var debugMode = false;

var scIdx = {
    threadid: 0,
    totaltime: 1,
    script: 2,
    bundle: 3,
    workflow: 4,
    scripttype: 5,
    triggertype: 6,
    customScriptId: 7
};

var colorSet = [
    "#8ac144",
    "#E8FFB7",
    "#C1F4C1",
    "#92D6B3",
    "#79bd9a",
    "#3b8686",
    "#3c6d89",
    "#24385B",
    "#5a6984",
    "#919bad",
    "#c8cdd6",
    "#afbccb",
    "#879ab1",
    "#607998",
    "#9591ad",
    "#a391ad",
    "#ad91a9",
    "#ad919b",
    "#ad9591",
    "#ada391",
    "#a9ad91",
    "#9bad91",
    "#91ad95",
    "#91ada3",
    "#91a9ad",
    "#919bad",
    "#212c3c",
    "#394a62",
    "#425879",
    "#5a769f",
    "#6384b6",
    "#333333",
    "#24385B",
    "#5a6984",
    "#919bad",
    "#c8cdd6",
    "#afbccb",
    "#879ab1",
    "#607998",
    "#9591ad",
    "#a391ad",
    "#ad91a9",
    "#ad919b",
    "#ad9591",
    "#ada391",
    "#a9ad91",
    "#9bad91",
    "#91ad95",
    "#91ada3",
    "#91a9ad"
];

function suitelet(request, response) {
    MSG_TITLE = "suitelet Test Mode";
    if (request.getParameter("testmode") == "T") {
        var testData = apmServLib.getFileHtmlCode("apm_pts_sl_ssdetail.json");
        response.write(testData);
        return;
    }

    MSG_TITLE = "suitelet Start";
    if (onServerLog) {
        logger.enable();
    }

    MSG_TITLE = "suitelet Variables";
    var isReplyInJSON = "";

    var jsonReturnData = new Object();
    var params = new Object();

    var threadid = "";
    var threadid2 = "";
    var servertime = "";
    var suitescripttime = "";
    var workflowtime = "";

    var sort = "";
    var dir = "";
    var compfil = "";
    var myCompany = nlapiGetContext().getCompany();

    try {
        /*
         * Parameters Set-up
         */
        MSG_TITLE = "suitelet Param Set-up";
        if (request) {
            isReplyInJSON =
                apmServLib.isValidObject(request.getParameter("is_json")) &&
                request.getParameter("is_json") == "T"
                    ? request.getParameter("is_json")
                    : "F";

            threadid = apmServLib.isValidObject(
                request.getParameter("threadid")
            )
                ? request.getParameter("threadid")
                : "";
            threadid2 = apmServLib.isValidObject(
                request.getParameter("threadid2")
            )
                ? request.getParameter("threadid2")
                : "";
            servertime = apmServLib.isValidObject(
                request.getParameter("servertime")
            )
                ? request.getParameter("servertime")
                : "";
            suitescripttime = apmServLib.isValidObject(
                request.getParameter("suitescripttime")
            )
                ? request.getParameter("suitescripttime")
                : "";
            workflowtime = apmServLib.isValidObject(
                request.getParameter("workflowtime")
            )
                ? request.getParameter("workflowtime")
                : "";
            startdate = apmServLib.isValidObject(
                request.getParameter("startdate")
            )
                ? request.getParameter("startdate")
                : "";
            enddate = apmServLib.isValidObject(request.getParameter("enddate"))
                ? request.getParameter("enddate")
                : "";

            sort = apmServLib.isValidObject(request.getParameter("sort"))
                ? request.getParameter("sort")
                : "threadid";
            dir = apmServLib.isValidObject(request.getParameter("dir"))
                ? request.getParameter("dir")
                : "ASC";
            dir = dir == "ASC" ? (dir = false) : (dir = true);
            compfil = apmServLib.isValidObject(request.getParameter("compfil"))
                ? request.getParameter("compfil")
                : "";
        }

        debugMode =
            apmServLib.validateCompanyFilter("T") &&
            nlapiGetContext().getCompany() != compfil;

        logger.debug(
            "suitelet Parameters",
            "getRemainingUsage(): " +
                nlapiGetContext().getRemainingUsage() +
                "\r\n" +
                "is_json          : " +
                isReplyInJSON +
                "\r\n" +
                "threadid         : " +
                threadid +
                "\r\n" +
                "threadid2        : " +
                threadid2 +
                "\r\n" +
                "servertime       : " +
                servertime +
                "\r\n" +
                "suitescripttime  : " +
                suitescripttime +
                "\r\n" +
                "workflowtime     : " +
                workflowtime +
                "\r\n" +
                "sort             : " +
                sort +
                "\r\n" +
                "dir              : " +
                dir +
                "\r\n" +
                "************************" +
                "\r\n" +
                "request          : " +
                JSON.stringify(request.getAllParameters()) +
                "\r\n"
        );

        /*
         * Set-up search parameters
         */
        params = {
            threadid: threadid,
            threadid2: threadid2,
            servertime: parseFloat(servertime),
            suitescripttime: parseFloat(suitescripttime),
            workflowtime: parseFloat(workflowtime),
            sort: sort,
            dir: dir,
            startdate: startdate,
            enddate: enddate,
            myCompany: myCompany,
            compfil: compfil
        };

        /*
         * Main
         */
        MSG_TITLE = "suitelet start main";
        jsonReturnData = {
            success: true,
            message: "",
            total: 0,
            pages: new Array(),
            data: new Array()
        };

        jsonReturnData.message = "suitescript detail results loaded";

        if (threadid) {
            getSuiteScriptDetailRecords(jsonReturnData, params);
        }

        /*
         * Return format: Json or String
         */
        MSG_TITLE = "suitelet Return";
        logger.debug(
            MSG_TITLE,
            "getRemainingUsage(): " +
                nlapiGetContext().getRemainingUsage() +
                "\r\n" +
                "is_json          : " +
                isReplyInJSON +
                "\r\n" +
                "request          : " +
                JSON.stringify(request.getAllParameters()) +
                "\r\n" +
                "************************" +
                "\r\n" +
                "jsonReturnData   : " +
                JSON.stringify(jsonReturnData) +
                "\r\n"
        );
    } catch (ex) {
        var body_message = "";
        if (ex instanceof nlobjError) {
            body_message =
                "System Error: " +
                MSG_TITLE +
                ": " +
                ex.getCode() +
                ": " +
                ex.getDetails();
            logger.error(MSG_TITLE, body_message);
        } else {
            body_message = "Unexpected Error: " + MSG_TITLE + ": " + ex;
            logger.error(MSG_TITLE, body_message);
        }
        jsonReturnData = apmServLib.toJson(
            apmServLib.getFailMessage(body_message)
        );
    }

    response.setContentType("JSON");
    response.write(JSON.stringify(jsonReturnData));
}

function getSuiteScriptDetailRecords(jsonReturnData, params) {
    var sf = new Array();
    var sc = new Array();

    /*
     * Search Filters
     */
    if (apmServLib.isValidObject(params.threadid2) && params.threadid2 != 0) {
        sf.push(
            new nlobjPerformanceDataSearchFilter(
                "threadid",
                "anyof",
                params.threadid,
                params.threadid2
            )
        );
    } else {
        sf.push(
            new nlobjPerformanceDataSearchFilter(
                "threadid",
                "anyof",
                params.threadid
            )
        );
    }
    sf.push(
        new nlobjPerformanceDataSearchFilter("scripttype", "anyof", [
            "WORKFLOW",
            "USEREVENT",
            "CLIENT"
        ])
    );
    sf.push(
        new nlobjPerformanceDataSearchFilter(
            "scriptcontext",
            "is",
            "userinterface"
        )
    );
    if (params.compfil) {
        sf.push(
            new nlobjPerformanceDataSearchFilter("compid", "anyof", [
                params.compfil
            ])
        );
    }

    /*
     * Search Columns
     */
    sc[scIdx.threadid] = new nlobjPerformanceDataSearchColumn("threadid");
    sc[scIdx.totaltime] = new nlobjPerformanceDataSearchColumn("totaltime");
    sc[scIdx.script] = new nlobjPerformanceDataSearchColumn("script");
    sc[scIdx.bundle] = new nlobjPerformanceDataSearchColumn("bundle");
    sc[scIdx.workflow] = new nlobjPerformanceDataSearchColumn("workflowid");
    sc[scIdx.scripttype] = new nlobjPerformanceDataSearchColumn("scripttype");
    sc[scIdx.triggertype] = new nlobjPerformanceDataSearchColumn("triggertype");
    sc[scIdx.customScriptId] = new nlobjPerformanceDataSearchColumn("scriptid");

    sc[scIdx[params.sort]].setSort(params.dir);

    logger.debug(
        "suitescript search start",
        "params: " + JSON.stringify(params) + "\r\n"
    );
    var search = nlapiCreatePerformanceDataSearch("suitescriptdetail", sf, sc);
    var results = search.getResults();
    logger.debug("suitescript search end", "results: " + results + "\r\n");

    var recordsData = new Array();
    var scriptHashTable = getScriptHashTable();
    var workflowHashTable = getWorkFlowHashTable();
    var bundleHashTable = {};
    try {
        bundleHashTable = nlapiGetPerformanceMetaData(params.compfil, "bundle");
    } catch (err) {
        //if has no farmwide access
        bundleHashTable = nlapiGetPerformanceMetaData(
            params.myCompany,
            "bundle"
        );
    }

    if (results) {
        for (var i = 0; i < results.length; i++) {
            var threadid = results[i].getValue("threadid");
            var totaltime =
                parseFloat(results[i].getValue("totaltime")) / 1000.0;
            var workflowId = results[i].getValue("workflowid");
            var scriptId = results[i].getValue("script");
            var scriptWorkflowId = workflowId ? workflowId : scriptId;
            var scriptWorkflowName = workflowId
                ? workflowHashTable[workflowId]
                : scriptHashTable[scriptId];
            var customScriptId = results[i].getValue("scriptid");
            var scripttype = results[i].getValue("scripttype");
            var triggertype =
                results[i].getValue("triggertype") != null
                    ? results[i].getValue("triggertype").toLowerCase()
                    : null;
            var bundleId = results[i].getValue("bundle");
            var color = "#00000";
            var scriptwfurl = "";
            var script =
                customScriptId && scriptWorkflowId != customScriptId
                    ? scriptWorkflowId + " " + customScriptId
                    : scriptWorkflowId;

            if (bundleId > 0) {
                var bundleName = bundleHashTable[bundleId]
                    ? bundleHashTable[bundleId]
                    : translationStrings.apm.r2020a.uninstalledsuiteapp();
                var bundle = bundleName
                    ? bundleId + " " + bundleName
                    : bundleId;
            } else {
                //Non-bundle
                bundle = translationStrings.apm.r2019a.nonbundledcomponents();
            }

            var scriptTypeParam = scripttype;
            switch (triggertype) {
                case "beforeload":
                    scriptTypeParam = "usereventbeforeload";
                    break;
                case "beforesubmit":
                    scriptTypeParam = "usereventbeforesubmit";
                    break;
                case "aftersubmit":
                    scriptTypeParam = "usereventaftersubmit";
                    break;
            }

            if (debugMode) {
                if (scripttype != "WORKFLOW") {
                    var baseurl =
                        "/app/site/hosting/scriptlet.nl?script=customscript_apm_ssa_sl_main&deploy=customdeploy_apm_ssa_sl_main";
                    scriptwfurl =
                        baseurl +
                        "&scripttype=" +
                        scriptTypeParam +
                        "&scriptid=" +
                        scriptId +
                        "&sdatetime=" +
                        params.startdate +
                        "&edatetime=" +
                        params.enddate +
                        "&scriptname=" +
                        customScriptId +
                        "&context=" +
                        "userinterface" +
                        "&compfil=" +
                        params.compfil;
                } else {
                    scriptwfurl = "";
                }
            } else {
                //Replace with actual script name
                script = scriptWorkflowName ? scriptWorkflowName : script;
                if (scripttype != "WORKFLOW") {
                    var baseurl =
                        "/app/site/hosting/scriptlet.nl?script=customscript_apm_ssa_sl_main&deploy=customdeploy_apm_ssa_sl_main";
                    if (!scriptWorkflowName) {
                        scriptWorkflowName =
                            scriptWorkflowId + " " + customScriptId;
                    }
                    scriptwfurl =
                        baseurl +
                        "&scripttype=" +
                        scriptTypeParam +
                        "&scriptid=" +
                        scriptWorkflowId +
                        "&sdatetime=" +
                        params.startdate +
                        "&edatetime=" +
                        params.enddate +
                        "&scriptname=" +
                        scriptWorkflowName +
                        "&context=" +
                        "userinterface" +
                        "&compfil=" +
                        params.compfil;
                } else {
                    scriptwfurl =
                        "/app/common/workflow/setup/workflowmanager.nl?id=" +
                        scriptWorkflowId;
                }
            }

            if (i + 1 <= colorSet.length) {
                color = colorSet[i + 1];
            }

            recordsData.push({
                threadid: threadid,
                totaltime: totaltime,
                script: script,
                scriptId: scriptWorkflowId,
                customScriptId: customScriptId,
                sortScriptKey: scriptWorkflowName
                    ? scriptWorkflowName
                    : customScriptId,
                scripttype: scripttype,
                triggertype: triggertype,
                bundle: bundle == -1 ? "" : bundle,
                color: color,
                scriptwfurl: scriptwfurl
            });
        }

        if (params.sort == "script") {
            recordsData.sort(function (a, b) {
                if (!params.dir) {
                    //Sort ascending
                    if (a.sortScriptKey === b.sortScriptKey) {
                        return 0;
                    }
                    if (typeof a.sortScriptKey === typeof b.sortScriptKey) {
                        return a.sortScriptKey < b.sortScriptKey ? -1 : 1;
                    } else {
                        return typeof a.sortScriptKey < typeof b.sortScriptKey
                            ? -1
                            : 1;
                    }
                } else {
                    //Sort descending
                    if (a.sortScriptKey === b.sortScriptKey) {
                        return 0;
                    }
                    if (typeof b.sortScriptKey === typeof a.sortScriptKey) {
                        return a.sortScriptKey > b.sortScriptKey ? -1 : 1;
                    } else {
                        return typeof a.sortScriptKey > typeof b.sortScriptKey
                            ? -1
                            : 1;
                    }
                }
            });
        }
    }

    var netsuitetime =
        Math.round(
            (params.servertime - params.suitescripttime - params.workflowtime) *
                1000
        ) / 1000;

    //Add netsuite time to top of array
    recordsData.unshift({
        threadid: -1,
        totaltime: netsuitetime,
        script: translationStrings.apm.pts.label.netsuitesystem(),
        scripttype: "",
        triggertype: "",
        bundle: "",
        color: colorSet[0]
    });

    jsonReturnData.total = recordsData.length;
    jsonReturnData.data = recordsData;
}

function getScriptHashTable() {
    var sf = new Array();
    var sc = new Array();

    sf.push(
        new nlobjSearchFilter("scripttype", null, "anyof", [
            "USEREVENT",
            "CLIENT"
        ])
    );

    sc.push(new nlobjSearchColumn("name"));

    var results = nlapiSearchRecord("script", null, sf, sc);

    var scriptHashTable = new Object();
    if (results) {
        for (var i = 0; i < results.length; i++) {
            scriptHashTable[results[i].getId()] = results[i].getValue("name");
        }
    }

    return scriptHashTable;
}

function getWorkFlowHashTable() {
    if (!nlapiGetContext().getFeature("workflow")) return {};

    var sc = new Array();

    sc.push(new nlobjSearchColumn("name"));

    var results = nlapiSearchRecord("workflow", null, null, sc);

    var workflowHashTable = new Object();
    if (results) {
        for (var i = 0; i < results.length; i++) {
            workflowHashTable[results[i].getId()] = results[i].getValue("name");
        }
    }

    return workflowHashTable;
}
