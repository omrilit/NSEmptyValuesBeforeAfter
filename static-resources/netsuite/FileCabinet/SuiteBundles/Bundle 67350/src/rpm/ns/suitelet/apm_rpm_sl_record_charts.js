/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       27 Feb 2015     jmarimla         Initial
 * 2.00       12 Mar 2015     jmarimla         Added filters for userevent
 * 3.00       16 Mar 2015     jmarimla         Modified return data for ui changes
 * 4.00       21 Mar 2015     jmarimla         Fixed networktime and filter by recordtype
 * 5.00       23 Mar 2015     jmarimla         Return data for suitescript and workflow time
 * 6.00       27 Mar 2015     jmarimla         Return histogram resolution
 * 7.00       31 Mar 2015     jmarimla         Return totaltime data; Adjusted end of histogram data
 * 8.00       21 Apr 2015     jmarimla         Setting-based histogram interval
 * 9.00       15 May 2015     jmarimla         Static data when in test mode
 * 10.00      26 Jun 2015     jmarimla         Return EtE median and 95th percentile
 * 11.00      20 Jul 2015     jmarimla         Additional debug logs
 * 12.00      29 Jul 2015     jmarimla         Return number of users data
 * 13.00      31 Jul 2015     jmarimla         Filter out negative endtoendtime
 * 14.00      11 Aug 2015     jmarimla         Support for company filter
 * 15.00      04 Sep 2015     jmarimla         Added logging; Removed unused code
 * 16.00      03 Dec 2015     rwong            Fixed for incorrect offset during DST
 * 17.00      10 Jan 2020     jmarimla         Customer debug changes
 * 18.00      11 Aug 2020     earepollo        ExtJS to jQuery
 * 19.00      21 Dec 2020     earepollo        Handling for NaN return values from API
 *
 *
 */

var onServerLog = true;
var MSG_TITLE = "APM_RPM_RECORD_CHARTS";
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);

var MAX_UEWF = 10;
var colorSet = [
    "rgba(138,193,68,0.8)",
    "rgba(232,255,183,0.8)",
    "rgba(193,244,193,0.8)",
    "rgba(146,214,179,0.8)",
    "rgba(121,189,154,0.8)",
    "rgba(59,134,134,0.8)",
    "rgba(60,109,137,0.8)",
    "rgba(36,56,91,0.8)",
    "rgba(90,105,132,0.8)",
    "rgba(145,155,173,0.8)",
    "rgba(200,205,214,0.8)",
    "rgba(175,188,203,0.8)",
    "rgba(135,154,177,0.8)",
    "rgba(96,121,152,0.8)",
    "rgba(149,145,173,0.8)",
    "rgba(163,145,173,0.8)",
    "rgba(173,145,169,0.8)",
    "rgba(173,145,155,0.8)",
    "rgba(173,149,145,0.8)",
    "rgba(173,163,145,0.8)",
    "rgba(169,173,145,0.8)",
    "rgba(155,173,145,0.8)",
    "rgba(145,173,149,0.8)",
    "rgba(145,173,163,0.8)",
    "rgba(145,169,173,0.8)",
    "rgba(145,155,173,0.8)",
    "rgba(33,44,60,0.8)",
    "rgba(57,74,98,0.8)",
    "rgba(66,88,121,0.8)",
    "rgba(90,118,159,0.8)",
    "rgba(99,132,182,0.8)",
    "rgba(51,51,51,0.8)",
    "rgba(36,56,91,0.8)",
    "rgba(90,105,132,0.8)",
    "rgba(145,155,173,0.8)",
    "rgba(200,205,214,0.8)",
    "rgba(175,188,203,0.8)",
    "rgba(135,154,177,0.8)",
    "rgba(96,121,152,0.8)",
    "rgba(149,145,173,0.8)",
    "rgba(163,145,173,0.8)",
    "rgba(173,145,169,0.8)",
    "rgba(173,145,155,0.8)",
    "rgba(173,149,145,0.8)",
    "rgba(173,163,145,0.8)",
    "rgba(169,173,145,0.8)",
    "rgba(155,173,145,0.8)",
    "rgba(145,173,149,0.8)",
    "rgba(145,173,163,0.8)",
    "rgba(145,169,173,0.8)"
];

function suitelet(request, response) {
    MSG_TITLE = "suitelet Test Mode";
    if (request.getParameter("testmode") == "T") {
        var testData = apmServLib.getFileHtmlCode(
            "apm_rpm_sl_record_charts.json"
        );
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
    var startDateMS = "";
    var endDateMS = "";
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
            startDateMS = apmServLib.isValidObject(
                request.getParameter("startDateMS")
            )
                ? request.getParameter("startDateMS")
                : "";
            endDateMS = apmServLib.isValidObject(
                request.getParameter("endDateMS")
            )
                ? request.getParameter("endDateMS")
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
                "startDateMS      : " +
                startDateMS +
                "\r\n" +
                "endDateMS        : " +
                endDateMS +
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
            startDateMS: parseInt(startDateMS),
            endDateMS: parseInt(endDateMS),
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
                indexData: new Array(),
                responseTime: {
                    clientTime: new Array(),
                    networkTime: new Array(),
                    serverTime: new Array(),
                    totalTime: new Array(),
                    totalTimeMed: 0,
                    totalTime95p: 0
                },
                throughput: {
                    logsTotal: new Array(),
                    usersTotal: new Array()
                },
                UEWFBreakdown: {
                    suitescriptTime: new Array(),
                    workflowTime: new Array()
                },
                histogram: {
                    threshold: 0,
                    resolution: 0,
                    total: 0,
                    frequency: new Array()
                }
            }
        };

        getEndToEndTimeData(jsonReturnData, params);

        jsonReturnData.message = "record charts data loaded";

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

function getEndToEndTimeData(jsonReturnData, params) {
    var sf = new Array();
    var sc = new Array();
    var search = null;
    var results = null;

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
            params.startDateMS,
            params.endDateMS
        )
    );
    sf.push(
        new nlobjPerformanceDataSearchFilter("actiontype", "is", params.oper)
    );
    sf.push(
        new nlobjPerformanceDataSearchFilter("endtoendtime", "greaterthan", 0)
    );
    if (params.compfil) {
        sf.push(
            new nlobjPerformanceDataSearchFilter("compid", "anyof", [
                params.compfil
            ])
        );
    }

    /*
     * Response Time and Throughput Search Columns
     */
    var dateDiff = apmServLib.getDateDiff(
        params.endDateMS,
        params.startDateMS,
        ONE_MILLISECOND
    );
    var dateAggregation = apmServLib.getTimeRangeResolution(dateDiff);
    var startMSRounded =
        params.startDateMS - (params.startDateMS % pointInterval);
    var endMSRounded = params.endDateMS - (params.endDateMS % pointInterval);

    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "date",
            "dateGroup",
            dateAggregation
        )
    );
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
            "endtoendtime",
            "totaltimeMed",
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

    sc[0].setSort();

    MSG_TITLE = "EndToEndTime Search Median";
    logger.debug(
        "record charts search start",
        "params: " + JSON.stringify(params) + "\r\n"
    );
    search = nlapiCreatePerformanceDataSearch("endtoendtime", sf, sc);
    results = search.getResults();
    logger.debug("record charts search end", "results: " + results + "\r\n");

    MSG_TITLE = "Format EndToEndTime Search";
    var indexData = new Object();
    var logsTotalData = new Array();
    var usersTotalData = new Array();
    var clientTimeData = new Array();
    var networkTimeData = new Array();
    var serverTimeData = new Array();
    var totalTimeData = new Array();
    var suitescriptTimeData = new Array();
    var workflowTimeData = new Array();
    if (results) {
        var lastStartMS = 0;
        for (var i = 0; i < results.length; i++) {
            var dateUTC = results[i].getValue("dateGroup");

            var dateStartPadding = 0;
            if (i == 0) {
                //padding before first data point
                dateStartPadding = startMSRounded;
            } else {
                //padding between data points
                dateStartPadding = lastStartMS;
            }
            while (dateStartPadding < dateUTC) {
                var dateOffsetMS =
                    dateStartPadding -
                    new Date(dateUTC).getTimezoneOffset() * 60 * 1000;
                logsTotalData.push([dateOffsetMS, 0]);
                usersTotalData.push([dateOffsetMS, 0]);
                clientTimeData.push([dateOffsetMS, 0]);
                networkTimeData.push([dateOffsetMS, 0]);
                serverTimeData.push([dateOffsetMS, 0]);
                totalTimeData.push([dateOffsetMS, 0]);
                suitescriptTimeData.push([dateOffsetMS, 0]);
                workflowTimeData.push([dateOffsetMS, 0]);
                dateStartPadding += pointInterval;
            }
            lastStartMS = dateUTC + pointInterval;

            var dateOffsetMS =
                dateUTC - new Date(dateUTC).getTimezoneOffset() * 60 * 1000;
            var logsTotal = results[i].getValue("logsTotal");
            logsTotal = (logsTotal) ? parseInt(logsTotal) : 0;
            var usersTotal = results[i].getValue("usersTotal");
            usersTotal = (usersTotal) ? parseInt(usersTotal) : 0;
            var clientTimeMed = results[i].getValue("clienttimeMed");
            clientTimeMed = (clientTimeMed && !isNaN(clientTimeMed)) ? parseFloat(clientTimeMed) / 1000.0 : 0;
            var networkTimeMed = results[i].getValue("networktimeMed");
            networkTimeMed = (networkTimeMed && !isNaN(networkTimeMed)) ? parseFloat(networkTimeMed) / 1000.0 : 0;
            var serverTimeMed = results[i].getValue("servertimeMed");
            serverTimeMed = (serverTimeMed && !isNaN(serverTimeMed)) ? parseFloat(serverTimeMed) / 1000.0 : 0;
            var totalTimeMed = results[i].getValue("totaltimeMed");
            totalTimeMed = (totalTimeMed && !isNaN(totalTimeMed)) ? parseFloat(totalTimeMed) / 1000.0 : 0;
            var suitescriptTimeMed = results[i].getValue("suitescripttimeMed");
            suitescriptTimeMed = (suitescriptTimeMed && !isNaN(suitescriptTimeMed)) ? parseFloat(suitescriptTimeMed) / 1000.0 : 0;
            var workflowTimeMed = results[i].getValue("workflowtimeMed");
            workflowTimeMed = (workflowTimeMed && !isNaN(workflowTimeMed)) ? parseFloat(workflowTimeMed) / 1000.0 : 0;

            indexData[dateOffsetMS] = clientTimeData.length;
            logsTotalData.push([dateOffsetMS, logsTotal]);
            usersTotalData.push([dateOffsetMS, usersTotal]);
            clientTimeData.push([
                dateOffsetMS,
                parseFloat(clientTimeMed.toFixed(3))
            ]);
            networkTimeData.push([
                dateOffsetMS,
                parseFloat(networkTimeMed.toFixed(3))
            ]);
            serverTimeData.push([
                dateOffsetMS,
                parseFloat(serverTimeMed.toFixed(3))
            ]);
            totalTimeData.push([
                dateOffsetMS,
                parseFloat(totalTimeMed.toFixed(3))
            ]);
            suitescriptTimeData.push([
                dateOffsetMS,
                parseFloat(suitescriptTimeMed.toFixed(3))
            ]);
            workflowTimeData.push([
                dateOffsetMS,
                parseFloat(workflowTimeMed.toFixed(3))
            ]);

            //padding after data points
            if (i == results.length - 1) {
                var dateEndPadding = dateUTC + pointInterval;
                while (dateEndPadding <= endMSRounded) {
                    var dateOffsetMS =
                        dateEndPadding -
                        new Date(dateUTC).getTimezoneOffset() * 60 * 1000;
                    logsTotalData.push([dateOffsetMS, 0]);
                    usersTotalData.push([dateOffsetMS, 0]);
                    clientTimeData.push([dateOffsetMS, 0]);
                    networkTimeData.push([dateOffsetMS, 0]);
                    serverTimeData.push([dateOffsetMS, 0]);
                    totalTimeData.push([dateOffsetMS, 0]);
                    suitescriptTimeData.push([dateOffsetMS, 0]);
                    workflowTimeData.push([dateOffsetMS, 0]);
                    dateEndPadding += pointInterval;
                }
            }
        }
    }

    sc = new Array();
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "endtoendtime",
            "totaltimeMed",
            "percentiles.50"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "endtoendtime",
            "totaltime95p",
            "percentiles.95"
        )
    );
    MSG_TITLE = "EndToEndTime Search Summary";
    logger.debug(
        "record aggregate search start",
        "params: " + JSON.stringify(params) + "\r\n"
    );
    search = nlapiCreatePerformanceDataSearch("endtoendtime", sf, sc);
    results = search.getResults();
    logger.debug("record aggregate search end", "results: " + results + "\r\n");
    var totalTimeMed = 0;
    var totalTime95p = 0;
    if (results) {
        totalTimeMed = parseFloat(results[0].getValue("totaltimeMed")) / 1000.0;
        totalTime95p = parseFloat(results[0].getValue("totaltime95p")) / 1000.0;
    }

    jsonReturnData.data.throughput.logsTotal = logsTotalData;
    jsonReturnData.data.throughput.usersTotal = usersTotalData;
    jsonReturnData.data.indexData = indexData;
    jsonReturnData.data.responseTime.clientTime = clientTimeData;
    jsonReturnData.data.responseTime.networkTime = networkTimeData;
    jsonReturnData.data.responseTime.serverTime = serverTimeData;
    jsonReturnData.data.responseTime.totalTime = totalTimeData;
    jsonReturnData.data.responseTime.totalTimeMed = totalTimeMed.toFixed(2);
    jsonReturnData.data.responseTime.totalTime95p = totalTime95p.toFixed(2);
    jsonReturnData.data.UEWFBreakdown.suitescriptTime = suitescriptTimeData;
    jsonReturnData.data.UEWFBreakdown.workflowTime = workflowTimeData;

    /*
     * Histogram Search Columns
     */

    sc = new Array();

    var threshold = 7000; //default threshold, in ms
    var resolution = 1000; //string format, in ms
    var totalTicks = 8; //default totalticks

    MSG_TITLE = "Search General Setup";
    var setupGeneral = getSetupGeneral();

    if (setupGeneral) {
        logger.debug(
            MSG_TITLE,
            "setupGeneral: " + setupGeneral.length + "\r\n"
        );
        var histogramInterval = parseInt(
            setupGeneral[0].getValue("custrecord_apm_db_general_hist_interval")
        );
        if (histogramInterval && !isNaN(histogramInterval)) {
            resolution = histogramInterval * 1000; //in ms
            threshold = resolution * (totalTicks - 1);
        }
    }

    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "endtoendtime",
            "totaltimeGroup",
            resolution
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn("threadid", "frequency", "count")
    );

    sc[0].setSort();

    MSG_TITLE = "EndToEndTime Search Histogram";
    search = null;
    results = null;
    logger.debug(
        "record histogram search start",
        "params: " + JSON.stringify(params) + "\r\n"
    );
    search = nlapiCreatePerformanceDataSearch("endtoendtime", sf, sc);
    results = search.getResults();
    logger.debug("record histogram search end", "results: " + results + "\r\n");
    var frequencyDataLength = threshold / resolution + 1;
    var frequencyData = new Array();
    for (var i = 0; i <= frequencyDataLength; i++) {
        frequencyData.push([i * (resolution / 1000), 0]);
    }
    logger.debug(
        MSG_TITLE,
        "threshold: " +
            threshold +
            "\r\n" +
            "resolution : " +
            resolution +
            "\r\n" +
            "totalTicks : " +
            totalTicks +
            "\r\n" +
            "frequencyData : " +
            frequencyData +
            "\r\n" +
            "results : " +
            results +
            "\r\n"
    );

    MSG_TITLE = "Format Histogram";
    var frequencyTotal = 0;
    if (results) {
        for (var i = 0; i < results.length; i++) {
            var totaltimeGroup = parseInt(
                results[i].getValue("totaltimeGroup")
            );
            var frequency = parseInt(results[i].getValue("frequency"));

            if (totaltimeGroup < threshold) {
                var index =
                    (totaltimeGroup - (totaltimeGroup % resolution)) /
                    resolution;
                logger.debug(
                    MSG_TITLE,
                    "totaltimeGroup : " +
                        totaltimeGroup +
                        "\r\n" +
                        "threshold : " +
                        threshold +
                        "\r\n" +
                        "frequency : " +
                        frequency +
                        "\r\n" +
                        "index : " +
                        index +
                        "\r\n"
                );
                frequencyData[index][1] = frequencyData[index][1] + frequency;
            } else {
                logger.debug(
                    MSG_TITLE,
                    "totaltimeGroup : " +
                        totaltimeGroup +
                        "\r\n" +
                        "threshold : " +
                        threshold +
                        "\r\n" +
                        "frequency : " +
                        frequency +
                        "\r\n" +
                        "frequencyData.length : " +
                        frequencyData.length +
                        "\r\n"
                );
                frequencyData[frequencyData.length - 2][1] =
                    frequencyData[frequencyData.length - 2][1] + frequency;
            }
            frequencyTotal += frequency;
        }
    }

    jsonReturnData.data.histogram.total = frequencyTotal;
    jsonReturnData.data.histogram.frequency = frequencyData;
    jsonReturnData.data.histogram.threshold = threshold / 1000;
    jsonReturnData.data.histogram.resolution = resolution / 1000;
}

function getSetupGeneral() {
    var sf = new Array();
    var sc = new Array();

    var userId = nlapiGetContext().getUser();
    sf.push(
        new nlobjSearchFilter("custrecord_apm_db_general_user", null, "anyof", [
            userId
        ])
    );

    sc.push(new nlobjSearchColumn("custrecord_apm_db_general_hist_interval"));

    var results = nlapiSearchRecord(
        "customrecord_apm_db_setup_general",
        null,
        sf,
        sc
    );

    return results;
}
