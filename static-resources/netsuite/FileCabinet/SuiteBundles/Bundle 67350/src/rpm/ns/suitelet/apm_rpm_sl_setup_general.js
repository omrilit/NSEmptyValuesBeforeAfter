/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       20 Apr 2015     jmarimla         Initial
 * 2.00       10 Sep 2015     jmarimla         Retrieve general setup for record tiles
 * 3.00       28 Dec 2016     jmarimla         Fixed returned response
 * 4.00       11 Aug 2020     earepollo        ExtJS to jQuery
 *
 */

var onServerLog = true;
var MSG_TITLE = "APM_RPM_SETUPGENERAL";
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);

function suitelet(request, response) {
    if (request.getMethod() == "POST") {
        MSG_TITLE = "postSuitelet Start";
        if (onServerLog) {
            logger.enable();
        }

        MSG_TITLE = "postSuitelet Variables";

        var histogramInterval = "";
        var recordTiles = "";

        var jsonReturnData = new Object();

        try {
            /*
             * Parameters Set-up
             */
            MSG_TITLE = "postSuitelet Param Set-up";
            if (request) {
                histogramInterval = apmServLib.isValidObject(
                    request.getParameter("histogramInterval")
                )
                    ? request.getParameter("histogramInterval")
                    : 1;
                recordTiles = apmServLib.isValidObject(
                    request.getParameter("recordTiles")
                )
                    ? request.getParameter("recordTiles")
                    : "";
            }

            logger.debug(
                "postSuitelet Parameters",
                "getRemainingUsage(): " +
                    nlapiGetContext().getRemainingUsage() +
                    "\r\n" +
                    "histogramInterval: " +
                    histogramInterval +
                    "\r\n" +
                    "recordTiles: " +
                    recordTiles +
                    "\r\n" +
                    "************************" +
                    "\r\n" +
                    "request          : " +
                    JSON.stringify(request.getAllParameters()) +
                    "\r\n"
            );

            /*
             * Main
             */
            MSG_TITLE = "postSuitelet start main";
            var setupGeneral = getSetupGeneral();

            var record;
            var recId;
            if (setupGeneral) {
                MSG_TITLE = "postSuitelet Update";
                record = nlapiLoadRecord(
                    "customrecord_apm_db_setup_general",
                    setupGeneral[0].getId()
                );
            } else {
                MSG_TITLE = "postSuitelet Create";
                record = nlapiCreateRecord("customrecord_apm_db_setup_general");
                record.setFieldValue(
                    "custrecord_apm_db_general_user",
                    nlapiGetContext().getUser()
                );
            }

            record.setFieldValue(
                "custrecord_apm_db_general_hist_interval",
                histogramInterval
            );
            record.setFieldValue(
                "custrecord_apm_db_general_recordtiles",
                recordTiles == "wlonly" ? "wlonly" : "all"
            );

            recId = nlapiSubmitRecord(record);
            logger.debug(MSG_TITLE + " Setup General", "recId: " + recId);

            jsonReturnData = { success: true, message: "setup general saved" };
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
    } else {
        MSG_TITLE = "getSuitelet Start";
        if (onServerLog) {
            logger.enable();
        }

        MSG_TITLE = "getSuitelet Variables";
        var isReplyInJSON = "";

        var jsonReturnData = new Object();

        try {
            /*
             * Parameters Set-up
             */
            MSG_TITLE = "getSuitelet Param Set-up";
            if (request) {
                isReplyInJSON =
                    apmServLib.isValidObject(request.getParameter("is_json")) &&
                    request.getParameter("is_json") == "T"
                        ? request.getParameter("is_json")
                        : "F";
            }

            logger.debug(
                "getSuitelet Parameters",
                "getRemainingUsage(): " +
                    nlapiGetContext().getRemainingUsage() +
                    "\r\n" +
                    "************************" +
                    "\r\n" +
                    "request          : " +
                    JSON.stringify(request.getAllParameters()) +
                    "\r\n"
            );

            /*
             * Main
             */
            MSG_TITLE = "getSuitelet start main";
            jsonReturnData = {
                success: true,
                message: "set up general loaded",
                data: {
                    //default values
                    histogramInterval: 1,
                    recordTiles: "all"
                }
            };

            var setupGeneral = getSetupGeneral();

            if (setupGeneral) {
                MSG_TITLE = "getSuitelet format data";
                jsonReturnData.data[
                    "histogramInterval"
                ] = setupGeneral[0].getValue(
                    "custrecord_apm_db_general_hist_interval"
                );
                var recordTilesSetup = setupGeneral[0].getValue(
                    "custrecord_apm_db_general_recordTiles"
                );
                jsonReturnData.data["recordTiles"] =
                    recordTilesSetup == "wlonly" ? "wlonly" : "all";
            }

            /*
             * Return format: Json or String
             */
            MSG_TITLE = "getSuitelet Return";
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
    sc.push(new nlobjSearchColumn("custrecord_apm_db_general_recordtiles"));

    var results = nlapiSearchRecord(
        "customrecord_apm_db_setup_general",
        null,
        sf,
        sc
    );

    return results;
}
