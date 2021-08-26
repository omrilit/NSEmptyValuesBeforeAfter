/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       26 Feb 2015     jmarimla         Initial
 * 2.00       03 Mar 2015     rwong            Corrected spelling error
 * 3.00       12 Mar 2015     jmarimla         90th to 95th percentile
 * 4.00       16 Mar 2015     jmarimla         Temporarily commented out standard deviation to avoid errors
 * 5.00       21 Mar 2015     jmarimla         Filtered by recordtype, fixed standard deviation
 * 6.00       27 Mar 2015     jmarimla         Added response time filter
 * 7.00       01 Apr 2015     rwong            Added workflowtime to summary results
 * 8.00       10 Apr 2015     rwong            Added record type to json return.
 * 9.00       15 Mar 2015     jmarimla         Static data when in testmode
 * 10.00      31 Jul 2015     jmarimla         Filter out negative endtoendtime
 * 11.00      11 Aug 2015     jmarimla         Support for company filter
 * 12.00      04 Sep 2015     jmarimla         Added logging
 * 13.00      29 Jun 2018     jmarimla         Translation readiness
 * 14.00      06 Jul 2018     jmarimla         Polishing translation
 * 15.00      18 Jan 2019     jmarimla         Change date format function
 * 16.00      14 Jan 2020     jmarimla         Customer debug changes
 * 17.00      30 Jul 2020     jmarimla         r2020a strings
 * 18.00      24 Aug 2020     lemarcelo        ExtJS to jQuery
 *
 */

var translationStrings = psgp_apm.translation10.load();
var onServerLog = true;
var MSG_TITLE = "APM_PTS_ENDTOEND_SUMMARY";
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);

function suitelet(request, response) {
    MSG_TITLE = "suitelet Test Mode";
    if (request.getParameter("testmode") == "T") {
        var testData = apmServLib.getFileHtmlCode("apm_pts_sl_etesummary.json");
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

    var recordtype = "";
    var oper = "";
    var email = "";
    var startDate = "";
    var endDate = "";
    var responseTimeOper = "";
    var responseTime1 = "";
    var responseTime2 = "";
    var compfil = "";

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

            recordtype = apmServLib.isValidObject(
                request.getParameter("recordtype")
            )
                ? request.getParameter("recordtype")
                : "";
            oper = apmServLib.isValidObject(request.getParameter("oper"))
                ? request.getParameter("oper")
                : "";
            email = apmServLib.isValidObject(request.getParameter("email"))
                ? request.getParameter("email")
                : "";
            startDate = apmServLib.isValidObject(
                request.getParameter("startDate")
            )
                ? request.getParameter("startDate")
                : "";
            endDate = apmServLib.isValidObject(request.getParameter("endDate"))
                ? request.getParameter("endDate")
                : "";
            responseTimeOper = apmServLib.isValidObject(
                request.getParameter("responseTimeOper")
            )
                ? request.getParameter("responseTimeOper")
                : "";
            responseTime1 = apmServLib.isValidObject(
                request.getParameter("responseTime1")
            )
                ? request.getParameter("responseTime1")
                : "";
            responseTime2 = apmServLib.isValidObject(
                request.getParameter("responseTime2")
            )
                ? request.getParameter("responseTime2")
                : "";
            compfil = apmServLib.isValidObject(request.getParameter("compfil"))
                ? request.getParameter("compfil")
                : "";
        }

        logger.debug(
            "suitelet Parameters",
            "getRemainingUsage(): " +
                nlapiGetContext().getRemainingUsage() +
                "\r\n" +
                "is_json          : " +
                isReplyInJSON +
                "\r\n" +
                "recordtype       : " +
                recordtype +
                "\r\n" +
                "oper             : " +
                oper +
                "\r\n" +
                "email            : " +
                email +
                "\r\n" +
                "startDate        : " +
                startDate +
                "\r\n" +
                "endDate          : " +
                endDate +
                "\r\n" +
                "responseTimeOper : " +
                responseTimeOper +
                "\r\n" +
                "responseTime1    : " +
                responseTime1 +
                "\r\n" +
                "responseTime2    : " +
                responseTime2 +
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
            recordtype: recordtype,
            oper: oper,
            email: email,
            startDate: startDate,
            endDate: endDate,
            responseTimeOper: responseTimeOper,
            responseTime1: responseTime1,
            responseTime2: responseTime2,
            compfil: compfil
        };

        /*
         * Main
         */
        MSG_TITLE = "suitelet start main";
        jsonReturnData = {
            success: true,
            message: "",
            data: {
                recordtype: recordtype,
                logsTotal: 0,
                usersTotal: 0,
                operation: oper,
                stats: {
                    data: [
                        {
                            id: "setup_ave",
                            name: translationStrings.apm.r2020a.meanoraverage(),
                            clienttime: 0,
                            networktime: 0,
                            suitescripttime: 0,
                            workflowtime: 0,
                            servertime: 0,
                            totaltime: 0
                        },
                        {
                            id: "setup_med",
                            name: translationStrings.apm.common.label.median(),
                            clienttime: 0,
                            networktime: 0,
                            suitescripttime: 0,
                            workflowtime: 0,
                            servertime: 0,
                            totaltime: 0
                        },
                        {
                            id: "setup_sd",
                            name: translationStrings.apm.pts.label.standarddeviation(),
                            clienttime: 0,
                            networktime: 0,
                            suitescripttime: 0,
                            workflowtime: 0,
                            servertime: 0,
                            totaltime: 0
                        },
                        {
                            id: "setup_95p",
                            name: translationStrings.apm.common.label._95thpercentile(),
                            clienttime: 0,
                            networktime: 0,
                            suitescripttime: 0,
                            workflowtime: 0,
                            servertime: 0,
                            totaltime: 0
                        }
                    ]
                }
            }
        };

        jsonReturnData.message = "endtoendtime summary results loaded";

        if (recordtype && oper && startDate && endDate) {
            getEndToEndSummary(jsonReturnData, params);
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

function getEndToEndSummary(jsonReturnData, params) {
    var sf = new Array();
    var sc = new Array();

    var startDate = apmServLib.convertStringToDateWithMillisecond(
        params.startDate
    );
    var endDate = apmServLib.convertStringToDateWithMillisecond(params.endDate);

    /*
     * Search Filters
     */
    sf.push(
        new nlobjPerformanceDataSearchFilter("recordtype", "anyof", [
            params.recordtype
        ])
    );
    sf.push(
        new nlobjPerformanceDataSearchFilter(
            "date",
            "range",
            startDate.getTime(),
            endDate.getTime()
        )
    );
    sf.push(
        new nlobjPerformanceDataSearchFilter("endtoendtime", "greaterthan", 0)
    );
    if (params.email)
        sf.push(
            new nlobjPerformanceDataSearchFilter("email", "is", params.email)
        );
    switch (params.oper) {
        case "v":
            sf.push(
                new nlobjPerformanceDataSearchFilter("actiontype", "is", "view")
            );
            break;
        case "e":
            sf.push(
                new nlobjPerformanceDataSearchFilter("actiontype", "is", "edit")
            );
            break;
        case "n":
            sf.push(
                new nlobjPerformanceDataSearchFilter("actiontype", "is", "new")
            );
            break;
        case "s":
            sf.push(
                new nlobjPerformanceDataSearchFilter("actiontype", "is", "save")
            );
            break;
    }
    switch (params.responseTimeOper) {
        case "gt":
            sf.push(
                new nlobjPerformanceDataSearchFilter(
                    "endtoendtime",
                    "greaterthan",
                    parseFloat(params.responseTime1) * 1000
                )
            );
            break;
        case "lt":
            sf.push(
                new nlobjPerformanceDataSearchFilter(
                    "endtoendtime",
                    "lessthan",
                    parseFloat(params.responseTime1) * 1000
                )
            );
            break;
        case "bw":
            sf.push(
                new nlobjPerformanceDataSearchFilter(
                    "endtoendtime",
                    "within",
                    parseFloat(params.responseTime1) * 1000,
                    parseFloat(params.responseTime2) * 1000
                )
            );
            break;
    }
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
    sc.push(
        new nlobjPerformanceDataSearchColumn("threadid", "logsTotal", "count")
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "email",
            "usersTotal",
            "cardinality"
        )
    );
    //average
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "pageloadtime",
            "clienttimeAve",
            "avg"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "networktime",
            "networktimeAve",
            "avg"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "suitescripttime",
            "suitescripttimeAve",
            "avg"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "workflowtime",
            "workflowtimeAve",
            "avg"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "servertime",
            "servertimeAve",
            "avg"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "endtoendtime",
            "totaltimeAve",
            "avg"
        )
    );
    //median
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "pageloadtime",
            "clienttimeMed",
            "percentiles.50"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "networktime",
            "networktimeMed",
            "percentiles.50"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "suitescripttime",
            "suitescripttimeMed",
            "percentiles.50"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "workflowtime",
            "workflowtimeMed",
            "percentiles.50"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "servertime",
            "servertimeMed",
            "percentiles.50"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "endtoendtime",
            "totaltimeMed",
            "percentiles.50"
        )
    );
    //standard deviation
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "pageloadtime",
            "clienttimeSD",
            "std_deviation"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "networktime",
            "networktimeSD",
            "std_deviation"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "suitescripttime",
            "suitescripttimeSD",
            "std_deviation"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "workflowtime",
            "workflowtimeSD",
            "std_deviation"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "servertime",
            "servertimeSD",
            "std_deviation"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "endtoendtime",
            "totaltimeSD",
            "std_deviation"
        )
    );
    //95th percentile
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "pageloadtime",
            "clienttime95P",
            "percentiles.95"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "networktime",
            "networktime95P",
            "percentiles.95"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "suitescripttime",
            "suitescripttime95P",
            "percentiles.95"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "workflowtime",
            "workflowtime95P",
            "percentiles.95"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "servertime",
            "servertime95P",
            "percentiles.95"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "endtoendtime",
            "totaltime95P",
            "percentiles.95"
        )
    );

    logger.debug(
        "endtoend search start",
        "params: " + JSON.stringify(params) + "\r\n"
    );
    var search = nlapiCreatePerformanceDataSearch("endtoendtime", sf, sc);
    var results = search.getResults();
    logger.debug("endtoend search end", "results: " + results + "\r\n");

    if (results) {
        var logsTotal = parseInt(results[0].getValue("logsTotal"));
        var usersTotal = parseInt(results[0].getValue("usersTotal"));
        //average
        var clienttimeAve =
            parseFloat(results[0].getValue("clienttimeAve")) / 1000.0;
        var networktimeAve =
            parseFloat(results[0].getValue("networktimeAve")) / 1000.0;
        var suitescripttimeAve =
            parseFloat(results[0].getValue("suitescripttimeAve")) / 1000.0;
        var workflowtimeAve =
            parseFloat(results[0].getValue("workflowtimeAve")) / 1000.0;
        var servertimeAve =
            parseFloat(results[0].getValue("servertimeAve")) / 1000.0;
        var totaltimeAve =
            parseFloat(results[0].getValue("totaltimeAve")) / 1000.0;
        //median
        var clienttimeMed =
            parseFloat(results[0].getValue("clienttimeMed")) / 1000.0;
        var networktimeMed =
            parseFloat(results[0].getValue("networktimeMed")) / 1000.0;
        var suitescripttimeMed =
            parseFloat(results[0].getValue("suitescripttimeMed")) / 1000.0;
        var workflowtimeMed =
            parseFloat(results[0].getValue("workflowtimeMed")) / 1000.0;
        var servertimeMed =
            parseFloat(results[0].getValue("servertimeMed")) / 1000.0;
        var totaltimeMed =
            parseFloat(results[0].getValue("totaltimeMed")) / 1000.0;
        //standard deviation
        var clienttimeSD =
            parseFloat(results[0].getValue("clienttimeSD")) / 1000.0;
        var networktimeSD =
            parseFloat(results[0].getValue("networktimeSD")) / 1000.0;
        var suitescripttimeSD =
            parseFloat(results[0].getValue("suitescripttimeSD")) / 1000.0;
        var workflowtimeSD =
            parseFloat(results[0].getValue("workflowtimeSD")) / 1000.0;
        var servertimeSD =
            parseFloat(results[0].getValue("servertimeSD")) / 1000.0;
        var totaltimeSD =
            parseFloat(results[0].getValue("totaltimeSD")) / 1000.0;
        //95th percentile
        var clienttime95P =
            parseFloat(results[0].getValue("clienttime95P")) / 1000.0;
        var networktime95P =
            parseFloat(results[0].getValue("networktime95P")) / 1000.0;
        var suitescripttime95P =
            parseFloat(results[0].getValue("suitescripttime95P")) / 1000.0;
        var workflowtime95P =
            parseFloat(results[0].getValue("workflowtime95P")) / 1000.0;
        var servertime95P =
            parseFloat(results[0].getValue("servertime95P")) / 1000.0;
        var totaltime95P =
            parseFloat(results[0].getValue("totaltime95P")) / 1000.0;

        jsonReturnData.data.logsTotal = logsTotal;
        jsonReturnData.data.usersTotal = usersTotal;

        jsonReturnData.data.stats.data = new Array();
        //average
        jsonReturnData.data.stats.data.push({
            id: "setup_ave",
            name: translationStrings.apm.r2020a.meanoraverage(),
            clienttime: isNaN(clienttimeAve) ? 0 : clienttimeAve.toFixed(3),
            networktime: isNaN(networktimeAve) ? 0 : networktimeAve.toFixed(3),
            suitescripttime: isNaN(suitescripttimeAve)
                ? 0
                : suitescripttimeAve.toFixed(3),
            workflowtime: isNaN(workflowtimeAve)
                ? 0
                : workflowtimeAve.toFixed(3),
            servertime: isNaN(servertimeAve) ? 0 : servertimeAve.toFixed(3),
            totaltime: isNaN(totaltimeAve) ? 0 : totaltimeAve.toFixed(3)
        });
        //median
        jsonReturnData.data.stats.data.push({
            id: "setup_med",
            name: translationStrings.apm.common.label.median(),
            clienttime: isNaN(clienttimeMed) ? 0 : clienttimeMed.toFixed(3),
            networktime: isNaN(networktimeMed) ? 0 : networktimeMed.toFixed(3),
            suitescripttime: isNaN(suitescripttimeMed)
                ? 0
                : suitescripttimeMed.toFixed(3),
            workflowtime: isNaN(workflowtimeMed)
                ? 0
                : workflowtimeMed.toFixed(3),
            servertime: isNaN(servertimeMed) ? 0 : servertimeMed.toFixed(3),
            totaltime: isNaN(totaltimeMed) ? 0 : totaltimeMed.toFixed(3)
        });
        //standard deviation
        jsonReturnData.data.stats.data.push({
            id: "setup_sd",
            name: translationStrings.apm.pts.label.standarddeviation(),
            clienttime: isNaN(clienttimeSD) ? 0 : clienttimeSD.toFixed(3),
            networktime: isNaN(networktimeSD) ? 0 : networktimeSD.toFixed(3),
            suitescripttime: isNaN(suitescripttimeSD)
                ? 0
                : suitescripttimeSD.toFixed(3),
            workflowtime: isNaN(workflowtimeSD) ? 0 : workflowtimeSD.toFixed(3),
            servertime: isNaN(servertimeSD) ? 0 : servertimeSD.toFixed(3),
            totaltime: isNaN(totaltimeSD) ? 0 : totaltimeSD.toFixed(3)
        });
        //95th percentile
        jsonReturnData.data.stats.data.push({
            id: "setup_95p",
            name: translationStrings.apm.common.label._95thpercentile(),
            clienttime: isNaN(clienttime95P) ? 0 : clienttime95P.toFixed(3),
            networktime: isNaN(networktime95P) ? 0 : networktime95P.toFixed(3),
            suitescripttime: isNaN(suitescripttime95P)
                ? 0
                : suitescripttime95P.toFixed(3),
            workflowtime: isNaN(workflowtime95P)
                ? 0
                : workflowtime95P.toFixed(3),
            servertime: isNaN(servertime95P) ? 0 : servertime95P.toFixed(3),
            totaltime: isNaN(totaltime95P) ? 0 : totaltime95P.toFixed(3)
        });
    }
}
