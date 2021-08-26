/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       05 Dec 2014     jmarimla         Initial
 * 2.00       09 Dec 2014     jmarimla         Loads js files
 * 3.00       09 Jan 2015     jmarimla         Loads dashboard css and components files
 * 4.00       15 Jan 2015     jmarimla         Loads highcharts, models, stores files
 * 5.00       07 Mar 2015     jmarimla         Retrieve javascript urls
 * 6.00       12 Mar 2015     jmarimla         Added application variables
 * 7.00       08 Apr 2015     rwong            Renamed Title to Dashboard
 * 8.00       15 May 2015     jmarimla         Read config file
 * 9.00       27 May 2015     jmarimla         Catch exception on reading config file
 * 10.00      11 Aug 2015     jmarimla         Support for company filter
 * 11.00      08 Aug 2015     jmarimla         Return compid_mode
 * 12.00      11 Jun 2018     jmarimla         Translation engine
 * 13.00      29 Jun 2018     jmarimla         Translation readiness
 * 14.00      16 Jul 2018     jmarimla         Ext translation
 * 15.00      24 Sep 2019     jmarimla         Page title
 * 16.00      07 Jan 2020     earepollo        Translation readiness for new strings
 * 17.00      10 Jan 2020     jmarimla         Customer debug changes
 * 18.00      23 Jan 2020     jmarimla         Blank customer
 * 19.00      21 Feb 2020     lemarcelo        Renamed title to Dashboard
 * 20.00      24 Jun 2020     earepollo        Changed title to Record Pages Monitor
 * 21.00      11 Aug 2020     earepollo        ExtJS to jQuery
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
            title: translationStrings.apm.r2020a.recordpagesmonitor()
        });
        form.addField({
            id: "custpage_apm_rpm_inline_html",
            type: ui.FieldType.INLINEHTML,
            label: "apm rpm inline html"
        });

        var inlineHTML = getInlineHTML(context, params);
        form.updateDefaultValues({
            custpage_apm_rpm_inline_html: inlineHTML
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

        var RPM_PARAMS = {
            debugMode: debugMode,
            compfil: compfil,
            myCompany: myCompany
        };

        var OFFSET_MS = new Date().getTimezoneOffset() * 60 * 1000;

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
            '/apm/ui/css/apm-rpm.css" />';

        inlineHTML +=
            '<div id="apm-rpm-main-content" class="psgp-loading-mask"></div>';

        inlineHTML += '<script type="text/javascript">';
        inlineHTML += 'var TEST_MODE = "' + testmode + '";';
        inlineHTML += "var RPM_PARAMS = " + JSON.stringify(RPM_PARAMS) + ";";
        inlineHTML += "var OFFSET_MS = " + OFFSET_MS + ";";
        inlineHTML += "var jQueryNS = jQuery.noConflict(true);";
        inlineHTML += "var APMRPM;";
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

        //App Modules
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_cs_jqwidgets.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_rpm_cs_services.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_rpm_cs_components.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_rpm_cs_highcharts.js") +
            '"></script>';
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_rpm_cs_mainpanel.js") +
            '"></script>';

        //App Main
        inlineHTML +=
            '<script type="text/javascript" src="' +
            apmServLib2.getFileURL("apm_rpm_cs_main.js") +
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
