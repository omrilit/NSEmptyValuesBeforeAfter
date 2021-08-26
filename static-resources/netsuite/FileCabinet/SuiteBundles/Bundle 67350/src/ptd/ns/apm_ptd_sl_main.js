/**
 * Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00      23 Feb 2015      jyeh             Initial
 * 2.00      24 Mar 2015      jyeh
 * 3.00      28 Mar 2015      jyeh
 * 4.00      15 May 2015      jmarimla         Read config file
 * 5.00      27 May 2015      jmarimla         Catch exception on reading config file
 * 6.00      11 Aug 2015      jmarimla         Support for company filter
 * 7.00      25 Aug 2015      jmarimla         Set form name
 * 8.00      14 Sep 2015      jmarimla         Add compid_mode variable
 * 9.00      11 Jun 2018      jmarimla         Translation engine
 * 10.00     29 Jun 2018      jmarimla         Translation readiness
 * 11.00     16 Jul 2018      jmarimla         Ext translation
 * 12.00     11 Oct 2019      jmarimla         Search by operationid
 * 13.00     17 Jan 2020      jmarimla         Customer debug changes
 * 14.00     23 Jan 2020      jmarimla         Blank customer
 * 15.00     20 Apr 2020      earepollo        Moved from ExtJS to jQuery
 *
 */
/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define([
        './../../apm/ns/lib/apm_ss_library_ss2',
        './../../l10n/apm_translation',
        'N/ui/serverWidget',
        'N/url',
        'N/runtime'
    ],

    function(
        apmServLib2,
        translation,
        ui,
        url,
        runtime
    ) {

        function onRequest(context) {

            var translationStrings = translation.load();
            var params = context.request.parameters;

            var form = ui.createForm({
                title: translationStrings.apm.ptd.label.pagetimedetails()
            });
            form.addField({
                id: 'custpage_apm_ptd_inline_html',
                type: ui.FieldType.INLINEHTML,
                label: 'apm ptd inline html'
            });

            var inlineHTML = getInlineHTML(context, params);
            form.updateDefaultValues({
                custpage_apm_ptd_inline_html: inlineHTML,
            });

            context.response.writePage(form);
        }

        function getInlineHTML(context, params) {
            var bundlePath = apmServLib2.getBundlePath(context);
            var inlineHTML = '';

            var testmode = 'F';
            try {
                var apmConfig = JSON.parse(apmServLib2.getContentsFromFile('apm_config.json'));
                testmode = apmConfig.testmode;
                testmode = (testmode != 'T') ? 'F' : 'T';
            } catch (ex) {
                testmode = 'F';
            }

            var debugMode = apmServLib2.validateCompanyFilter('T');
            debugMode = (debugMode) ? true : false;

            var myCompany = runtime.accountId;

            if (debugMode && params.compfil != undefined) {
                var compfil = params.compfil;
            } else {
                var compfil = myCompany;
            }

            var operationId = params.operationId ? params.operationId : '';

            var PTD_PARAMS = {
                debugMode: debugMode,
                compfil: compfil,
                myCompany: myCompany,
                operationId: operationId
            };

            //NModules
            inlineHTML += '<script type="text/javascript">';
            inlineHTML += 'var NSFORMAT;';
            inlineHTML += 'window.onload = function () {require(["N/format"], function(format) {NSFORMAT = format;}) };';
            inlineHTML += '</script>';

            //CSS
            inlineHTML += '<link type="text/css" rel="stylesheet" href="' + bundlePath + '/apm/ui/css/apm-jquery-ui-1.11.4.min.css" />';
            inlineHTML += '<link type="text/css" rel="stylesheet" href="' + bundlePath + '/apm/ui/css/apm-jq.css" />';
            inlineHTML += '<link type="text/css" rel="stylesheet" href="' + bundlePath + '/apm/ui/css/apm-ptd.css" />';

            inlineHTML += '<div id="apm-ptd-main-content" class="psgp-loading-mask"></div>';

            inlineHTML += '<script type="text/javascript">';
            inlineHTML += 'var TEST_MODE = "' + testmode + '";';
            inlineHTML += 'var PTD_PARAMS = ' + JSON.stringify(PTD_PARAMS) + ';';
            inlineHTML += 'var jQueryNS = jQuery.noConflict(true);';
            inlineHTML += 'var APMPTD;';
            inlineHTML += '</script>';

            //Libraries
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm-jquery-1.11.1.min.js') + '"></script>';
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm-jquery-ui-1.11.4.min.js') + '"></script>';
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm-highcharts-5.0.2.js') + '"></script>';
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm-highcharts-more-5.0.2.js') + '"></script>';
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm-highcharts-heatmap-5.0.2.js') + '"></script>';

            //App Modules
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_cs_jqwidgets.js') + '"></script>';
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_ptd_cs_services.js') + '"></script>';
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_ptd_cs_components.js') + '"></script>';
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_ptd_cs_highcharts.js') + '"></script>';
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_ptd_cs_mainpanel.js') + '"></script>';

            //App Main
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_ptd_cs_main.js') + '"></script>';

            //Translation
            var locale = translation.identifyLocaleToUse();
            inlineHTML += '<script type="text/javascript">';
            inlineHTML += 'var APMLocale = "' + locale + '";';
            inlineHTML += 'var APMBundleId = "' + apmServLib2.getBundleId() + '";';
            inlineHTML += '</script>';
            inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_cs_translation.js') + '"></script>';

            return inlineHTML;
        }

        return {
            onRequest: onRequest
        };

    });