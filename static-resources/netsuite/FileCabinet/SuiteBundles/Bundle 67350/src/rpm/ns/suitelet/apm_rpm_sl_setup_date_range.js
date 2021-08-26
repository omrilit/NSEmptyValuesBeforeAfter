/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       30 Mar 2015     rwong            Initial
 * 2.00       11 Aug 2020     earepollo        ExtJS to jQuery
 *
 *
 */
var onServerLog = true;
var MSG_TITLE = "APM_RPM_SETUP_DATE_RANGE";
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);

function suitelet(request, response) {
    MSG_TITLE = "suitelet Start";
    if (onServerLog) {
        logger.enable();
    }

    var isReplyInJSON = "";
    var jsonReturnData = new Object();

    try {
        if (request) {
            isReplyInJSON =
                apmServLib.isValidObject(request.getParameter("is_json")) &&
                request.getParameter("is_json") == "T"
                    ? request.getParameter("is_json")
                    : "F";
        }

        logger.debug(
            "suitelet Parameters",
            "getRemainingUsage(): " +
                nlapiGetContext().getRemainingUsage() +
                "\r\n" +
                "************************" +
                "\r\n" +
                "Body    : " +
                JSON.stringify(request.getBody()) +
                "\r\n"
        );

        switch (request.getMethod()) {
            case "GET":
                jsonReturnData = getData(request, jsonReturnData);
                MSG_TITLE = "getData Return";
                break;
            case "POST":
                jsonReturnData = postData(request, jsonReturnData);
                MSG_TITLE = "postData Return";
                break;
            case "PUT":
                jsonReturnData = putData(request, jsonReturnData);
                MSG_TITLE = "putData Return";
                break;
            case "DELETE":
                jsonReturnData = deleteData(request, jsonReturnData);
                MSG_TITLE = "deleteData Return";
                break;
        }

        /*
         * Return format: Json or String
         */
        logger.debug(
            MSG_TITLE,
            "getRemainingUsage(): " +
                nlapiGetContext().getRemainingUsage() +
                "\r\n" +
                "is_json          : " +
                isReplyInJSON +
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

function getData(request, jsonReturnData) {
    MSG_TITLE = "getData start main";
    jsonReturnData = {
        success: true,
        message: "setup date range loaded"
    };

    var sf = new Array();
    var sc = new Array();

    var userId = nlapiGetContext().getUser();
    sf.push(
        new nlobjSearchFilter(
            "custrecord_apm_db_date_range_user",
            null,
            "anyof",
            [userId]
        )
    );

    sc.push(new nlobjSearchColumn("custrecord_apm_db_date_range_start_date"));
    sc.push(new nlobjSearchColumn("custrecord_apm_db_date_range_start_time"));
    sc.push(new nlobjSearchColumn("custrecord_apm_db_date_range_end_date"));
    sc.push(new nlobjSearchColumn("custrecord_apm_db_date_range_end_time"));

    var results = nlapiSearchRecord(
        "customrecord_apm_db_setup_date_range",
        null,
        sf,
        sc
    );

    for (var i in results) {
        MSG_TITLE = "getData format data";
        if (i == 0) {
            jsonReturnData.data = new Array();
        }
        var startdate = results[i].getValue(
            "custrecord_apm_db_date_range_start_date"
        );
        var starttime = results[i].getValue(
            "custrecord_apm_db_date_range_start_time"
        );
        var enddate = results[i].getValue(
            "custrecord_apm_db_date_range_end_date"
        );
        var endtime = results[i].getValue(
            "custrecord_apm_db_date_range_end_time"
        );
        jsonReturnData.data.push({
            internalid: results[i].getId(),
            startdate: startdate,
            starttime: starttime,
            enddate: enddate,
            endtime: endtime
        });
    }

    return jsonReturnData;
}

function postData(request, jsonReturnData) {
    MSG_TITLE = "postData Param Set-up";
    var requestBody = new Array();
    if (request) {
        requestBody = apmServLib.toJson(request.getBody());
    }

    logger.debug(
        "postData Parameters",
        "getRemainingUsage(): " +
            nlapiGetContext().getRemainingUsage() +
            "\r\n" +
            "************************" +
            "\r\n" +
            "Request Body     : " +
            JSON.stringify(request.getBody()) +
            "\r\n"
    );

    MSG_TITLE = "postData start main";
    jsonReturnData = {
        success: true,
        message: "setup date range added"
    };

    var recIds = new Array();

    for (var i in requestBody) {
        var record = nlapiCreateRecord("customrecord_apm_db_setup_date_range");
        record.setFieldValue(
            "custrecord_apm_db_date_range_user",
            nlapiGetContext().getUser()
        );
        record.setFieldValue(
            "custrecord_apm_db_date_range_start_date",
            requestBody[i].startdate
        );
        record.setFieldValue(
            "custrecord_apm_db_date_range_start_time",
            requestBody[i].starttime
        );
        record.setFieldValue(
            "custrecord_apm_db_date_range_end_date",
            requestBody[i].enddate
        );
        record.setFieldValue(
            "custrecord_apm_db_date_range_end_time",
            requestBody[i].endtime
        );

        recIds.push(nlapiSubmitRecord(record));
    }

    logger.debug(MSG_TITLE + " Setup Date Range", "recIds: " + recIds);
    jsonReturnData.data = recIds;

    return jsonReturnData;
}

function putData(request, jsonReturnData) {
    MSG_TITLE = "putData Param Set-up";
    var requestBody = new Array();
    if (request) {
        requestBody = apmServLib.toJson(request.getBody());
    }

    logger.debug(
        "putData Parameters",
        "getRemainingUsage(): " +
            nlapiGetContext().getRemainingUsage() +
            "\r\n" +
            "************************" +
            "\r\n" +
            "Request Body     : " +
            JSON.stringify(request.getBody()) +
            "\r\n"
    );

    MSG_TITLE = "putData start main";
    jsonReturnData = {
        success: true,
        message: "setup date range updated"
    };

    var recIds = new Array();

    for (var i in requestBody) {
        var record = nlapiLoadRecord(
            "customrecord_apm_db_setup_date_range",
            requestBody[i].internalid
        );
        record.setFieldValue(
            "custrecord_apm_db_date_range_start_date",
            requestBody[i].startdate
        );
        record.setFieldValue(
            "custrecord_apm_db_date_range_start_time",
            requestBody[i].starttime
        );
        record.setFieldValue(
            "custrecord_apm_db_date_range_end_date",
            requestBody[i].enddate
        );
        record.setFieldValue(
            "custrecord_apm_db_date_range_end_time",
            requestBody[i].endtime
        );
        recIds.push(nlapiSubmitRecord(record));
    }

    logger.debug(MSG_TITLE + " Setup Date Range", "recIds: " + recIds);
    jsonReturnData.data = recIds;

    return jsonReturnData;
}

function deleteData(request, jsonReturnData) {
    MSG_TITLE = "deleteData Variables";
    var requestBody = new Array();
    if (request) {
        requestBody = apmServLib.toJson(request.getBody());
    }

    logger.debug(
        "deleteData Parameters",
        "getRemainingUsage(): " +
            nlapiGetContext().getRemainingUsage() +
            "\r\n" +
            "************************" +
            "\r\n" +
            "Request Body     : " +
            JSON.stringify(request.getBody()) +
            "\r\n"
    );

    MSG_TITLE = "deleteData start main";
    jsonReturnData = {
        success: true,
        message: "setup date range deleted"
    };

    var internalIds = new Array();
    for (var i in requestBody) {
        internalIds.push(requestBody[i].internalid);
    }

    var sf = new Array();
    sf.push(new nlobjSearchFilter("internalid", null, "anyof", internalIds));

    var results = nlapiSearchRecord(
        "customrecord_apm_db_setup_date_range",
        null,
        sf,
        null
    );

    for (var i in results) {
        nlapiDeleteRecord(results[i].getRecordType(), results[i].getId());
    }

    jsonReturnData.data = internalIds;

    return jsonReturnData;
}
