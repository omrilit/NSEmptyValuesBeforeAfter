/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       25 Feb 2015     jmarimla         Initial
 * 2.00       03 Mar 2015     jmarimla         Fixed date formatting
 * 3.00       16 Mar 2015     jmarimla         Fixed date formatting in pagination
 * 4.00       21 Mar 2015     jmarimla         Filtered by recordtype, fixed networktime
 * 5.00       27 Mar 2015     jmarimla         Added response time filter; fixed getValue bug in pagination
 * 6.00       01 Apr 2015     rwong            Added workflow time to end to end time results
 * 7.00       09 Apr 2015     jyeh
 * 8.00       28 Apr 2015     jyeh
 * 9.00       15 May 2015     jmarimla         Static data when in testmode
 * 10.00      14 Jul 2015     jmarimla         Added total for truncated data
 * 11.00      11 Aug 2015     jmarimla         Support for company filter
 * 12.00      04 Sep 2015     jmarimla         Added logging
 * 13.00      01 Dec 2015     jmarimla         CSV export support
 * 14.00      04 Dec 2015     jmarimla         Get all results at once for csv export
 * 15.00      19 May 2016     rwong            Added seconds to the date field
 * 16.00      18 Oct 2018     jmarimla         Operation id
 * 17.00      26 Oct 2018     jmarimla         Uncomment frht
 * 18.00      18 Jan 2019     jmarimla         Change date format function
 * 19.00      14 Jan 2020     jmarimla         Customer debug changes
 * 20.00      24 Aug 2020     lemarcelo        ExtJS to jQuery
 * 21.00      28 Aug 2020     lemarcelo        Update pagination
 *
 */

var onServerLog = true;
var MSG_TITLE = "APM_PTS_ENDTOENDTIME";
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);

var scIdx = {
    id: 0,
    email: 1,
    clienttime: 2,
    networktime: 3,
    suitescripttime: 4,
    servertime: 5,
    workflowtime: 6,
    totaltime: 7,
    date: 8,
    id2: 9,
    operationId: 10,
    operationId2: 11
};

function suitelet(request, response) {
    MSG_TITLE = "suitelet Test Mode";
    if (request.getParameter("testmode") == "T") {
        var testData = apmServLib.getFileHtmlCode("apm_pts_sl_etetime.json");
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

    var recordtype = "";
    var oper = "";
    var email = "";
    var startDate = "";
    var endDate = "";
    var responseTimeOper = "";
    var responseTime1 = "";
    var responseTime2 = "";

    var startIndex = "";
    var pageLimit = "";
    var sort = "";
    var dir = "";
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
            startIndex = apmServLib.isValidObject(request.getParameter("start"))
                ? parseInt(request.getParameter("start"))
                : 0;
            pageLimit = apmServLib.isValidObject(request.getParameter("limit"))
                ? parseInt(request.getParameter("limit"))
                : 1000;
            sort = apmServLib.isValidObject(request.getParameter("sort"))
                ? request.getParameter("sort")
                : "date";
            dir = apmServLib.isValidObject(request.getParameter("dir"))
                ? request.getParameter("dir")
                : "ASC";
            dir = dir == "ASC" ? (dir = false) : (dir = true);
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
                "startIndex       : " +
                startIndex +
                "\r\n" +
                "pageLimit        : " +
                pageLimit +
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
            recordtype: recordtype,
            oper: oper,
            email: email,
            startDate: startDate,
            endDate: endDate,
            responseTimeOper: responseTimeOper,
            responseTime1: responseTime1,
            responseTime2: responseTime2,
            sort: sort,
            dir: dir,
            startIndex: startIndex,
            pageLimit: pageLimit,
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
            total: 0,
            totalTrunc: 0,
            pages: [{ id: 1, name: " " }],
            data: new Array()
        };

        jsonReturnData.message = "endtoendtime results loaded";

        if (recordtype && oper && startDate && endDate) {
            getEndToEndTimeRecords(jsonReturnData, params);
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

    if (getCSV == "T") {
        formatCSV(jsonReturnData.data, response);
    } else {
        response.setContentType("JSON");
        response.write(JSON.stringify(jsonReturnData));
    }
}

function getEndToEndTimeRecords(jsonReturnData, params) {
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
    sc[scIdx.id] = new nlobjPerformanceDataSearchColumn("threadid");
    sc[scIdx.email] = new nlobjPerformanceDataSearchColumn("email");
    sc[scIdx.clienttime] = new nlobjPerformanceDataSearchColumn("pageloadtime");
    sc[scIdx.networktime] = new nlobjPerformanceDataSearchColumn("networktime");
    sc[scIdx.suitescripttime] = new nlobjPerformanceDataSearchColumn(
        "suitescripttime"
    );
    sc[scIdx.servertime] = new nlobjPerformanceDataSearchColumn("servertime");
    sc[scIdx.workflowtime] = new nlobjPerformanceDataSearchColumn(
        "workflowtime"
    );
    sc[scIdx.totaltime] = new nlobjPerformanceDataSearchColumn("endtoendtime");
    sc[scIdx.date] = new nlobjPerformanceDataSearchColumn("date");
    sc[scIdx.id2] = new nlobjPerformanceDataSearchColumn("redirectthreadid");
    sc[scIdx.operationId] = new nlobjPerformanceDataSearchColumn("operationid");
    sc[scIdx.operationId2] = new nlobjPerformanceDataSearchColumn(
        "operationid2"
    );

    sc[scIdx[params.sort]].setSort(params.dir);

    jsonReturnData.total = getTotal(sf);

    logger.debug(
        "endtoend search start",
        "params: " + JSON.stringify(params) + "\r\n"
    );
    var search = nlapiCreatePerformanceDataSearch("endtoendtime", sf, sc);
    var results = new Array();
    if (params.getCSV == "T") {
        results = search.getResults();
    } else {
        results = search.getResults(
            params.startIndex,
            params.startIndex + params.pageLimit
        );
        var dataTableProperties = getDataTableProperties(params);
        apmServLib.getPages(search, dataTableProperties, jsonReturnData);
    }
    logger.debug("endtoend search end", "results: " + results + "\r\n");

    if (results) {
        var recordsData = new Array();

        for (var i = 0; i < results.length; i++) {
            var id = results[i][scIdx.id];
            var email = results[i][scIdx.email];
            var clienttime = parseFloat(results[i][scIdx.clienttime]) / 1000.0;
            var networktime =
                parseFloat(results[i][scIdx.networktime]) / 1000.0;
            var suitescripttime =
                parseFloat(results[i][scIdx.suitescripttime]) / 1000.0;
            var servertime = parseFloat(results[i][scIdx.servertime]) / 1000.0;
            var workflowtime =
                parseFloat(results[i][scIdx.workflowtime]) / 1000.0;
            var totaltime = parseFloat(results[i][scIdx.totaltime]) / 1000.0;
            var date = nlapiDateToString(
                new Date(Date.parse(results[i][scIdx.date])),
                "datetimetz"
            );
            var id2 = results[i][scIdx.id2];
            var operationId = results[i][scIdx.operationId];
            var operationId2 = results[i][scIdx.operationId2];

            recordsData.push({
                id: id,
                date: date,
                email: email,
                clienttime: clienttime,
                networktime: networktime,
                suitescripttime: suitescripttime,
                workflowtime: workflowtime,
                servertime: servertime,
                totaltime: totaltime,
                id2: id2,
                operationId: operationId,
                operationId2: operationId2
            });
        }

        jsonReturnData.data = recordsData;
    } else {
        jsonReturnData.pages = [{ id: 1, name: " " }];
        jsonReturnData.total = 0;
        jsonReturnData.totalTrunc = 0;
    }
}

function getTotal(sf) {
    var results = nlapiSearchPerformanceDataRecord("endtoendtime", sf, [
        new nlobjPerformanceDataSearchColumn(
            "threadid",
            "threadidcount",
            "count"
        )
    ]);
    if (results && results.length > 0) {
        return results[0].getValue("threadidcount");
    } else {
        return 0;
    }
}

function getDataTableProperties(params) {
    var properties = {
        pageLimit: params.pageLimit,
        colIndex: scIdx[params.sort]
    };

    switch (params.sort) {
        case "clienttime":
        case "networktime":
        case "suitescripttime":
        case "servertime":
        case "workflowtime":
        case "totaltime":
            properties.type = "ms";
            break;
        case "date":
            properties.type = "date";
            break;
        default:
            properties.type = "string";
            break;
    }
    return properties;
}

function formatCSV(dataArray, response) {
    response.setContentType("CSV", "performancelogs.csv");
    response.write(
        "DATE & TIME,EMAIL,CLIENT,NETWORK,SUITESCRIPT,WORKFLOW,SERVER,TOTAL\r\n"
    );
    if (dataArray) {
        for (var i in dataArray) {
            response.write(
                dataArray[i].date +
                    "," +
                    dataArray[i].email +
                    "," +
                    dataArray[i].clienttime +
                    "," +
                    dataArray[i].networktime +
                    "," +
                    dataArray[i].suitescripttime +
                    "," +
                    dataArray[i].workflowtime +
                    "," +
                    dataArray[i].servertime +
                    "," +
                    dataArray[i].totaltime +
                    "\r\n"
            );
        }
    }
}
