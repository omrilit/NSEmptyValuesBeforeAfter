/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Sep 2014     jmarimla         Initial
 * 2.00       26 Sep 2014     jmarimla         Added references to new files
 * 3.00       16 Oct 2014     rwong            Support for parameter input
 * 4.00       29 Oct 2014     jmarimla         Included spm_cs_classes
 * 5.00       09 Feb 2015     jmarimla         Included highcharts files
 ****************************************************************************************************************
 * 1.00       23 Feb 2015     jmarimla         Porting to APM
 * 2.00       12 Mar 2015     jmarimla         Modified parameters
 * 3.00       24 Mar 2015     jmarimla         Changed page name
 * 4.00       27 Mar 2015     jmarimla         Added response time parameters
 * 5.00       15 May 2015     jmarimla         Read config file
 * 6.00       27 May 2015     jmarimla         Catch exception on reading config file
 * 7.00       11 Aug 2015     jmarimla         Support for company filter
 * 8.00       25 Aug 2015     jmarimla         Return compid_mode
 * 9.00       11 Jun 2018     jmarimla         Translation engine
 * 10.00      29 Jun 2018     jmarimla         Translation readiness
 * 11.00      16 Jul 2018     jmarimla         Ext translation
 * 12.00      14 Jan 2020     jmarimla         Customer debug changes
 * 13.00      23 Jan 2020     jmarimla         Blank customer
 * 14.00      20 Aug 2020     lemarcelo        ExtJs to JQuery
 *
 */

/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define([
    "./../../apm/ns/lib/apm_ss_library_ss2",
    "./../../l10n/apm_translation",
    "N/ui/serverWidget",
    "N/url",
    "N/runtime"
], function (apmServLib2, translation, ui, url, runtime) {
    function onRequest(context) {
        var translationStrings = translation.load();
        var params = context.request.parameters;

        var form = ui.createForm({
            title: translationStrings.apm.pts.label.pagetimesummary()
        });
        form.addField({
            id: "custpage_apm_pts_inline_html",
            type: ui.FieldType.INLINEHTML,
            label: "apm pts inline html"
        });

        var inlineHTML = getInlineHTML(context, params);
        form.updateDefaultValues({
            custpage_apm_pts_inline_html: inlineHTML
        });

        context.response.writePage(form);
    }

    function getInlineHTML(context, params) {
        var bundlePath = apmServLib2.getBundlePath(context);
        var inlineHTML = "";

        var testmode = "F";
        try {
            var apmConfig = JSON.parse(
                apmServLib2.getContentsFromFile("apm_config.json")
            );
            testmode = apmConfig.testmode;
            testmode = testmode != "T" ? "F" : "T";
        } catch (ex) {
            testmode = "F";
        }

        var debugMode = apmServLib2.validateCompanyFilter("T");
        debugMode = debugMode ? true : false;

        var myCompany = runtime.accountId;

        if (debugMode && params.compfil != undefined) {
            var compfil = params.compfil;
        } else {
            var compfil = myCompany;
        }

        var PTS_PARAMS = {
            debugMode: debugMode,
            compfil: compfil,
            myCompany: myCompany,
            recordtype: params.rectype,
            oper: params.oper,
            email: params.email,
            sdatetime: params.sdatetime,
            edatetime: params.edatetime,
            responseTimeOper: params.responsetimeoper,
            responseTime1: params.responsetime1,
            responseTime2: params.responsetime2
        };

        //NModules
        inlineHTML += '<script type="text/javascript">';
        inlineHTML += "var NSFORMAT;";
        inlineHTML +=
            'window.onload = function () {require(["N/format"], function(format) {NSFORMAT = format;}) };';
        inlineHTML += "</script>";

        //CSS
        inlineHTML +=
            '<link type="text/css" rel="stylesheet" href="' +
            bundlePath +
            '/apm/ui/css/apm-jquery-ui-1.11.4.min.css" />';
        inlineHTML +=
            '<link type="text/css" rel="stylesheet" href="' +
            bundlePath +
            '/apm/ui/css/apm-jq.css" />';
        inlineHTML +=
            '<link type="text/css" rel="stylesheet" href="' +
            bundlePath +
            '/apm/ui/css/apm-pts.css" />';

        inlineHTML +=
            '<div id="apm-pts-main-content" class="psgp-loading-mask"></div>';

        inlineHTML += '<script type="text/javascript">';
        inlineHTML += 'var TEST_MODE = "' + testmode + '";';
        inlineHTML += "var PTS_PARAMS = " + JSON.stringify(PTS_PARAMS) + ";";
        inlineHTML += "var jQueryNS = jQuery.noConflict(true);";
        inlineHTML += "var APMPTS;";
        inlineHTML += "</script>";

        //Libraries
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm-jquery-1.11.1.min.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm-jquery-ui-1.11.4.min.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm-highcharts-5.0.2.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm-highcharts-more-5.0.2.js") +
            '"></script>';

        //App Modules
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_cs_jqwidgets.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_pts_cs_services.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_pts_cs_components.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_pts_cs_highcharts.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_pts_cs_mainpanel.js") +
            '"></script>';

        //App Main
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_pts_cs_main.js") +
            '"></script>';

        //Translation
        var locale = translation.identifyLocaleToUse();
        inlineHTML += '<script type="text/javascript">';
        inlineHTML += 'var APMLocale = "' + locale + '";';
        inlineHTML += 'var APMBundleId = "' + apmServLib2.getBundleId() + '";';
        inlineHTML += "</script>";
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_cs_translation.js") +
            '"></script>';

        return inlineHTML;
    }

    return {
        onRequest: onRequest
    };
});
