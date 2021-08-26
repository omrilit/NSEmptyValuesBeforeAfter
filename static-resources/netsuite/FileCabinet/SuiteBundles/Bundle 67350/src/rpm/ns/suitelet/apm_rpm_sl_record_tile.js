/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2015     jmarimla         Initial
 * 2.00       11 Mar 2015     rwong            Implement support for watchlist
 * 3.00       12 Mar 2015     jmarimla         Return all search results; added top 10 counter
 * 4.00       16 Mar 2015     jmarimla         Padding of zero values in chart
 * 5.00       21 Mar 2015     jmarimla         Fixed networktime, return recordtype, return pseudo baseline
 * 6.00       23 Mar 2015     jmarimla         Removed unused code, fixed pseudo baseline function
 * 7.00       27 Apr 2015     jmarimla         Retrieve performance stats
 * 8.00       15 May 2015     jmarimla         Static data when in test mode
 * 9.00       31 Jul 2015     jmarimla         Filter out negative endtoendtime
 * 10.00      11 Aug 2015     jmarimla         Support for company filter
 * 11.00      28 Aug 2015     jmarimla         Filter out non standard record types in compid mode
 * 12.00      04 Sep 2015     jmarimla         Move calls to baseline median; Added logging
 * 13.00      10 Sep 2015     jmarimla         Return watchlist only based on setup
 * 14.00      16 Sep 2015     jmarimla         Exclude accounting transaction
 * 15.00      21 Oct 2015     jmarimla         Check role access
 * 16.00      06 Nov 2015     jmarimla         Check employee access
 * 17.00      03 Dec 2015     rwong            Fixed for incorrect offset during DST
 * 18.00      21 Dec 2015     rwong            Added export functionality to the record pages portlet
 * 19.00      21 Dec 2015     rwong            Added support for testdata
 * 20.00      10 Jan 2020     jmarimla         Customer debug changes
 * 21.00      11 Aug 2020     earepollo        ExtJS to jQuery
 * 22.00      21 Dec 2020     earepollo        Handling for NaN return values from API
 *
 */

var onServerLog = true;
var MSG_TITLE = "APM_RPM_RECORD_TILE";
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);
var CAROUSEL_LIMIT = 20;

function suitelet(request, response) {
    MSG_TITLE = "suitelet Test Mode";
    if (request.getParameter("testmode") == "T") {
        var testData = apmServLib.getFileHtmlCode(
            "apm_rpm_sl_record_tile.json"
        );
        if (request.getParameter("getcsv") == "T") {
            var jsonData = JSON.parse(testData);
            formatCSV(jsonData.data, response);
        } else {
            response.write(testData);
        }
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

    var startDateMS = "";
    var endDateMS = "";
    var compfil = "";

    var getCSV = "";

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
            getCSV =
                apmServLib.isValidObject(request.getParameter("getcsv")) &&
                request.getParameter("getcsv") == "T"
                    ? request.getParameter("getcsv")
                    : "F";
        }

        logger.debug(
            "suitelet Parameters",
            "getRemainingUsage(): " +
                nlapiGetContext().getRemainingUsage() +
                "\r\n" +
                "is_json          : " +
                isReplyInJSON +
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
        var dateDiff = apmServLib.getDateDiff(
            parseInt(endDateMS),
            parseInt(startDateMS),
            ONE_MILLISECOND
        );
        var dateAggregation = apmServLib.getTimeRangeResolution(dateDiff);

        params = {
            startDateMS: parseInt(startDateMS),
            endDateMS: parseInt(endDateMS),
            dateAggregation: dateAggregation,
            compfil: compfil,
            getCSV: getCSV
        };

        /*
         * Main
         */
        MSG_TITLE = "suitelet start main";
        jsonReturnData = {
            success: true,
            message: "",
            config: {
                startDateMS: getDateRange(params.startDateMS, pointInterval),
                endDateMS: getDateRange(params.endDateMS, pointInterval),
                intervalMS: (endDateMS - startDateMS) / 6,
                groupAggMS: pointInterval,
                histogramTicks: 1, //1 second as default
                endDateStr: nlapiDateToString(
                    new Date(params.endDateMS),
                    "datetime"
                )
            },
            data: new Array()
        };

        jsonReturnData.message = "record tile results loaded";

        getRecordTileSummary(jsonReturnData, params);

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

    if (getCSV == "T") {
        formatCSV(jsonReturnData.data, response);
    } else {
        response.setContentType("JSON");
        response.write(JSON.stringify(jsonReturnData));
    }
}

function getRecordTileSummary(jsonReturnData, params) {
    var recordTilesSetup = "all";

    MSG_TITLE = "Search General Setup";
    var setupGeneral = getSetupGeneral();

    if (setupGeneral) {
        logger.debug(
            MSG_TITLE,
            "setupGeneral: " + setupGeneral.length + "\r\n"
        );
        var setup = setupGeneral[0].getValue(
            "custrecord_apm_db_general_recordtiles"
        );
        recordTilesSetup = setup == "wlonly" ? "wlonly" : "all";
    }

    var top10AccessSetup = "F";
    MSG_TITLE = "Search Roles Setup";
    var setupRoles = getSetupRoles();
    var roleAccessTop10 = "F";
    if (setupRoles) {
        logger.debug(MSG_TITLE, "setupRoles: " + setupRoles.length + "\r\n");
        var setup = setupRoles[0].getValue("custrecord_apm_setup_ra_top10");
        roleAccessTop10 = setup == "T" ? "T" : "F";
    }
    var setupEmployees = getSetupEmployees();
    var employeeAccessTop10 = "F";
    if (setupEmployees) {
        logger.debug(
            MSG_TITLE,
            "setupEmployees: " + setupEmployees.length + "\r\n"
        );
        var setup = setupEmployees[0].getValue("custrecord_apm_setup_ea_top10");
        employeeAccessTop10 = setup == "T" ? "T" : "F";
    }
    top10AccessSetup =
        roleAccessTop10 == "T" || employeeAccessTop10 == "T" ? "T" : "F";
    recordTilesSetup = top10AccessSetup == "T" ? recordTilesSetup : "wlonly";

    var sf = new Array();
    var sc = new Array();

    var watchListResults = getWatchList();
    var watchList = new Array();
    var watchListSF = new Array();

    if (watchListResults) {
        for (var i = 0; i < watchListResults.length; i++) {
            var recordtype = watchListResults[i].getValue(
                "custrecord_apm_db_setup_record_type"
            );
            var operation = watchListResults[i].getValue(
                "custrecord_apm_db_setup_operation"
            );

            watchList.push(recordtype + operation);
            watchListSF.push(recordtype);
            jsonReturnData.data.push({
                id: i + 1,
                record: recordtype,
                oper: operation,
                totaltimeMed: 0,
                usersTotal: 0,
                logsTotal: 0,
                baselineMed: 0,
                baselineMedPercent: 0,
                totaltimeData: "[[0,0]]"
            });
        }
    }

    /*
     * Search Filters
     */
    sf.push(
        new nlobjPerformanceDataSearchFilter(
            "date",
            "range",
            params.startDateMS,
            params.endDateMS
        )
    );
    sf.push(
        new nlobjPerformanceDataSearchFilter("endtoendtime", "greaterthan", 0)
    );
    if (recordTilesSetup == "wlonly") {
        sf.push(
            new nlobjPerformanceDataSearchFilter(
                "recordtype",
                "anyof",
                watchListSF
            )
        );
    }
    if (params.compfil) {
        sf.push(
            new nlobjPerformanceDataSearchFilter("compid", "anyof", [
                params.compfil
            ])
        );
    }
    sf.push(new nlobjPerformanceDataSearchFilter("recordtype", "isnot", -149)); //exclude accounting transaction = -149

    /*
     * Search Columns
     */
    sc.push(
        new nlobjPerformanceDataSearchColumn("threadid", "logsTotal", "count")
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "recordtype",
            "recordtypeGroup",
            "group"
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
            "email",
            "usersTotal",
            "cardinality"
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn("actiontype", "operGroup", "group")
    );

    sc[0].setSort(true);

    logger.debug(
        "record tiles search start",
        "params: " + JSON.stringify(params) + "\r\n"
    );
    search = nlapiCreatePerformanceDataSearch("endtoendtime", sf, sc);
    results = search.getResults();
    logger.debug("record tiles search end", "results: " + results + "\r\n");

    if (results) {
        var top10count = 0;

        for (var i = 0; i < results.length; i++) {
            var recordtype = results[i].getValue("recordtypeGroup");
            var oper = results[i].getValue("operGroup");
            var totaltimeMed = results[i].getValue("totaltimeMed") / 1000.0;
            var usersTotal = results[i].getValue("usersTotal");
            var logsTotal = results[i].getValue("logsTotal");

            var recordTileDetailsParams = {
                startDateMS: params.startDateMS,
                endDateMS: params.endDateMS,
                recordtype: recordtype,
                oper: oper,
                dateAggregation: params.dateAggregation,
                compfil: params.compfil
            };

            if (watchList.indexOf(recordtype + oper) >= 0) {
                logger.debug("WatchList Match", recordtype + ":" + oper);
                var jsonReturnRecord = searchArray(
                    recordtype,
                    oper,
                    jsonReturnData.data
                );
                jsonReturnRecord.totaltimeMed = totaltimeMed.toFixed(3);
                jsonReturnRecord.usersTotal = usersTotal;
                jsonReturnRecord.logsTotal = logsTotal;
                jsonReturnRecord.baselineMed = getBaselineMed(recordtype, oper);
                jsonReturnRecord.baselineMedPercent = getBaselinePercent(
                    jsonReturnRecord.baselineMed,
                    totaltimeMed
                );
                jsonReturnRecord.totaltimeData = getRecordTileDetails(
                    recordTileDetailsParams
                );
            } else {
                if (top10count < 10 && recordTilesSetup == "all") {
                    var baselineMed = getBaselineMed(recordtype, oper);
                    jsonReturnData.data.push({
                        //'id': i + 1
                        id: Object.keys(jsonReturnData.data).length + 1,
                        record: recordtype,
                        oper: oper,
                        totaltimeMed: totaltimeMed.toFixed(3),
                        usersTotal: usersTotal,
                        logsTotal: logsTotal,
                        baselineMed: baselineMed,
                        baselineMedPercent: getBaselinePercent(
                            baselineMed,
                            totaltimeMed
                        ),
                        totaltimeData: getRecordTileDetails(
                            recordTileDetailsParams
                        )
                    });

                    top10count++;
                }
            }
        }
    }
}

function getRecordTileDetails(params) {
    var sf = new Array();
    var sc = new Array();

    var startMSRounded =
        params.startDateMS - (params.startDateMS % pointInterval);
    var endMSRounded = params.endDateMS - (params.endDateMS % pointInterval);
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
    if (apmServLib.validateCompanyFilter(params.compfil)) {
        sf.push(
            new nlobjPerformanceDataSearchFilter("compid", "anyof", [
                apmServLib.validateCompanyFilter(params.compfil)
            ])
        );
    }

    /*
     * Search Columns
     */
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "date",
            "dateGroup",
            params.dateAggregation
        )
    );
    sc.push(
        new nlobjPerformanceDataSearchColumn(
            "endtoendtime",
            "totaltimeMed",
            "percentiles.50"
        )
    );

    sc[0].setSort();

    logger.debug(
        "record tile mini search start",
        "params: " + JSON.stringify(params) + "\r\n"
    );
    var search = nlapiCreatePerformanceDataSearch("endtoendtime", sf, sc);
    var results = search.getResults();
    logger.debug("record tile mini search end", "results: " + results + "\r\n");

    var totalTimeData = new Array();

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
                totalTimeData.push([dateOffsetMS, 0]);
                dateStartPadding += pointInterval;
            }
            lastStartMS = dateUTC + pointInterval;

            var dateOffsetMS =
                dateUTC - new Date().getTimezoneOffset() * 60 * 1000;
            var totaltime = results[i].getValue("totaltimeMed");
            totaltime = (totaltime && !isNaN(totaltime)) ? parseFloat(totaltime) / 1000.0 : 0;

            totalTimeData.push([
                dateOffsetMS,
                parseFloat(totaltime.toFixed(3))
            ]);

            //padding after data points
            if (i == results.length - 1) {
                var dateEndPadding = dateUTC + pointInterval;
                while (dateEndPadding <= endMSRounded) {
                    var dateOffsetMS =
                        dateEndPadding -
                        new Date(dateUTC).getTimezoneOffset() * 60 * 1000;
                    totalTimeData.push([dateOffsetMS, 0]);
                    dateEndPadding += pointInterval;
                }
            }
        }
    }

    return JSON.stringify(totalTimeData);
}

function getDateRange(dateMS, aggregationMS) {
    if (!dateMS) return null;

    var dateRangeMS = dateMS - (dateMS % aggregationMS);
    var dateOffsetMS = dateRangeMS - new Date().getTimezoneOffset() * 60 * 1000;
    return dateOffsetMS;
}

function getWatchList() {
    var sf = new Array();
    var sc = new Array();

    var userId = nlapiGetContext().getUser();
    sf.push(
        new nlobjSearchFilter("custrecord_apm_db_setup_user", null, "anyof", [
            userId
        ])
    );

    sc.push(new nlobjSearchColumn("custrecord_apm_db_setup_record_type"));
    sc.push(new nlobjSearchColumn("custrecord_apm_db_setup_operation"));

    var results = nlapiSearchRecord(
        "customrecord_apm_db_setup_recordpages",
        null,
        sf,
        sc
    );

    return results;
}

function searchArray(key1, key2, myArray) {
    logger.debug(
        "searchArray params",
        "key1:" + key1 + "key2:" + key2 + "myArray" + JSON.stringify(myArray)
    );
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].record == key1 && myArray[i].oper == key2) {
            return myArray[i];
        }
    }
}

function getBaselineMed(recordType, oper) {
    try {
        //default: no date input, last 25 hours
        logger.debug(
            "perf stat start",
            "recordType: " + recordType + "\r\n" + "oper: " + oper + "\r\n"
        );
        var perfStats = nlapiGetPerformanceStats(
            parseInt(recordType),
            oper,
            "FARM"
        );
        var endtoendtime_med = perfStats.endtoendtime_50 / 1000.0;
        logger.debug(
            "perf stat end",
            "perfStats: " + endtoendtime_med + "\r\n"
        );
        return parseFloat(endtoendtime_med.toFixed(3));
    } catch (ex) {
        if (
            ex instanceof nlobjError &&
            ex.getCode() == "SSS_MEDIAN_API_BLOCKED"
        ) {
            return 0; //API switch is turned off, return 0 by default
        } else {
            throw ex;
        }
    }
}

function getBaselinePercent(baseline, recordValue) {
    if (!baseline) return 0;
    var percent = ((recordValue - baseline) / baseline) * 100;
    return parseFloat(percent.toFixed(2));
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

    sc.push(new nlobjSearchColumn("custrecord_apm_db_general_recordtiles"));

    var results = nlapiSearchRecord(
        "customrecord_apm_db_setup_general",
        null,
        sf,
        sc
    );

    return results;
}

function getSetupRoles() {
    var sf = new Array();
    var sc = new Array();

    var role = nlapiGetContext().getRole();
    sf.push(
        new nlobjSearchFilter("custrecord_apm_setup_ra_role", null, "is", role)
    );

    sc.push(new nlobjSearchColumn("custrecord_apm_setup_ra_top10"));

    var results = nlapiSearchRecord(
        "customrecord_apm_setup_roles_access",
        null,
        sf,
        sc
    );

    return results;
}

function getSetupEmployees() {
    var sf = new Array();
    var sc = new Array();

    var user = nlapiGetContext().getUser();
    sf.push(
        new nlobjSearchFilter(
            "custrecord_apm_setup_ea_employee",
            null,
            "is",
            user
        )
    );

    sc.push(new nlobjSearchColumn("custrecord_apm_setup_ea_top10"));

    var results = nlapiSearchRecord(
        "customrecord_apm_setup_employees_access",
        null,
        sf,
        sc
    );

    return results;
}

function formatCSV(dataArray, response) {
    response.setContentType("CSV", "recordtileslogs.csv");
    response.write(
        "RECORD TYPE ID,OPERATION,RESPONSE TIME,NUMBER OF USERS,NUMBER OF INSTANCES\r\n"
    );
    if (dataArray) {
        for (var i in dataArray) {
            response.write(
                dataArray[i].record +
                    "," +
                    dataArray[i].oper +
                    "," +
                    dataArray[i].totaltimeMed +
                    "," +
                    dataArray[i].usersTotal +
                    "," +
                    dataArray[i].logsTotal +
                    "\r\n"
            );
        }
    }
}
