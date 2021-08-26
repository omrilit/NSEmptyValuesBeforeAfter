/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       10 Oct 2014     jmarimla         Initial
 * 2.00       23 Oct 2014     jmarimla         Add settings for median, standard deviation, 90th percentile
 * 3.00       21 Nov 2014     jmarimla         changed setup fields to aggregated statistics
 ****************************************************************************************************************
 * 1.00       18 Feb 2014     jmarimla         Porting to APM
 * 2.00       12 Mar 2014     jmarimla         90th to 95th percentile
 * 3.00       28 Dec 2016     jmarimla         Fixed returned response
 * 4.00       24 Aug 2020     lemarcelo        ExtJS to jQuery
 *
 *
 */
var onServerLog = true;
var MSG_TITLE = "APM_PTS_SETUPSUMMARY";
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);

function suitelet(request, response) {
    if (request.getMethod() == "POST") {
        MSG_TITLE = "postSuitelet Start";
        if (onServerLog) {
            logger.enable();
        }

        MSG_TITLE = "postSuitelet Variables";

        var setup_ave = "";
        var setup_med = "";
        var setup_sd = "";
        var setup_95p = "";

        var jsonReturnData = new Object();

        try {
            /*
             * Parameters Set-up
             */
            MSG_TITLE = "postSuitelet Param Set-up";
            if (request) {
                setup_ave = apmServLib.isValidObject(
                    request.getParameter("setup_ave")
                )
                    ? request.getParameter("setup_ave")
                    : "";
                setup_med = apmServLib.isValidObject(
                    request.getParameter("setup_med")
                )
                    ? request.getParameter("setup_med")
                    : "";
                setup_sd = apmServLib.isValidObject(
                    request.getParameter("setup_sd")
                )
                    ? request.getParameter("setup_sd")
                    : "";
                setup_95p = apmServLib.isValidObject(
                    request.getParameter("setup_95p")
                )
                    ? request.getParameter("setup_95p")
                    : "";
            }

            logger.debug(
                "postSuitelet Parameters",
                "getRemainingUsage(): " +
                    nlapiGetContext().getRemainingUsage() +
                    "\r\n" +
                    "setup_ave        : " +
                    setup_ave +
                    "\r\n" +
                    "setup_med        : " +
                    setup_ave +
                    "\r\n" +
                    "setup_sd         : " +
                    setup_ave +
                    "\r\n" +
                    "setup_95p        : " +
                    setup_ave +
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
            var setUpSummary = getSetUpSummary();

            var record;
            var recId;
            if (setUpSummary) {
                MSG_TITLE = "postSuitelet Update";
                record = nlapiLoadRecord(
                    "customrecord_apm_spm_setupsummary",
                    setUpSummary[0].getId()
                );
            } else {
                MSG_TITLE = "postSuitelet Create";
                record = nlapiCreateRecord("customrecord_apm_spm_setupsummary");
                record.setFieldValue(
                    "custrecord_apm_spm_setupsummary_user",
                    nlapiGetContext().getUser()
                );
            }

            if (setup_ave)
                record.setFieldValue(
                    "custrecord_apm_spm_setupsummary_ave",
                    setup_ave
                );
            if (setup_med)
                record.setFieldValue(
                    "custrecord_apm_spm_setupsummary_med",
                    setup_med
                );
            if (setup_sd)
                record.setFieldValue(
                    "custrecord_apm_spm_setupsummary_sd",
                    setup_sd
                );
            if (setup_95p)
                record.setFieldValue(
                    "custrecord_apm_spm_setupsummary_95p",
                    setup_95p
                );

            recId = nlapiSubmitRecord(record);
            logger.debug(MSG_TITLE + " Setup Summary", "recId: " + recId);

            jsonReturnData = { success: true, message: "set up summary saved" };
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

        if (isReplyInJSON == "T") response.write(jsonReturnData);
        else response.write(JSON.stringify(jsonReturnData));
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
                message: "set up summary loaded",
                data: {
                    setup_ave: "T",
                    setup_med: "T",
                    setup_sd: "T",
                    setup_95p: "T"
                }
            };

            var setUpSummary = getSetUpSummary();

            if (setUpSummary) {
                MSG_TITLE = "getSuitelet format data";
                jsonReturnData.data["setup_ave"] = setUpSummary[0].getValue(
                    "custrecord_apm_spm_setupsummary_ave"
                );
                jsonReturnData.data["setup_med"] = setUpSummary[0].getValue(
                    "custrecord_apm_spm_setupsummary_med"
                );
                jsonReturnData.data["setup_sd"] = setUpSummary[0].getValue(
                    "custrecord_apm_spm_setupsummary_sd"
                );
                jsonReturnData.data["setup_95p"] = setUpSummary[0].getValue(
                    "custrecord_apm_spm_setupsummary_95p"
                );
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

function getSetUpSummary() {
    var sf = new Array();
    var sc = new Array();

    var userId = nlapiGetContext().getUser();
    sf.push(
        new nlobjSearchFilter(
            "custrecord_apm_spm_setupsummary_user",
            null,
            "anyof",
            [userId]
        )
    );

    sc.push(new nlobjSearchColumn("custrecord_apm_spm_setupsummary_ave"));
    sc.push(new nlobjSearchColumn("custrecord_apm_spm_setupsummary_med"));
    sc.push(new nlobjSearchColumn("custrecord_apm_spm_setupsummary_sd"));
    sc.push(new nlobjSearchColumn("custrecord_apm_spm_setupsummary_95p"));

    var results = nlapiSearchRecord(
        "customrecord_apm_spm_setupsummary",
        null,
        sf,
        sc
    );

    return results;
}
