/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       29 Oct 2014     jmarimla         Initial
 * 2.00       04 Nov 2014     jmarimla         Added reference to ssa_cs_stores.js
 * 3.00       20 Nov 2014     rwong            Added reference to ssa_cs_models.js
 * 4.00       28 Nov 2014     rwong            Added support for parameter passing.
 * 5.00       09 Jan 2015     rwong            Added reference to spm-highcharts-all.js and ssa_cs_highcharts.js
 * 6.00       29 Jan 2015     rwong            Added reference to spm-highcharts-drilldown.js
 * ********************************************************************************
 * 1.00       18 Feb 2015     rwong            Ported code to APM
 * 2.00       03 Mar 2015     jmarimla         Modified parameter passing
 * 3.00       15 May 2015     jmarimla         Read config file
 * 4.00       27 May 2015     jmarimla         Catch exception on reading config file
 * 5.00       16 Jul 2015     jmarimla         Added script name in parameter passing
 * 6.00       11 Aug 2015     jmarimla         Support for company filter
 * 7.00       25 Aug 2015     jmarimla         Return compid_mode
 * 8.00       05 Aug 2016     jmarimla         Support for suitescript context
 * 9.00       05 Apr 2018     rwong            Added support for client scripts
 * 10.00      11 Jun 2018     jmarimla         Translation engine
 * 11.00      29 Jun 2018     jmarimla         Translation readiness
 * 12.00      16 Jul 2018     jmarimla         Ext translation
 * 13.00      15 Jan 2020     jmarimla         Customer debug changes
 * 14.00      23 Jan 2020     jmarimla         Blank customer
 * 15.00      04 May 2020     earepollo        Add map/reduce stage filter
 * 16.00      11 Jun 2020     earepollo        ExtJS to jQuery
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
            title: translationStrings.apm.ssa.label.suitescriptanalysis()
        });
        form.addField({
            id: 'custpage_apm_ssa_inline_html',
            type: ui.FieldType.INLINEHTML,
            label: 'apm ssa inline html'
        });

        var inlineHTML = getInlineHTML(context, params);
        form.updateDefaultValues({
            custpage_apm_ssa_inline_html: inlineHTML,
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

        var startDate = params.sdatetime ? params.sdatetime : '';
        var endDate = params.edatetime ? params.edatetime : '';
        var scriptType = params.scripttype ? params.scripttype : '';
        scriptType = (scriptType == 'CLIENT') ? 'client' : scriptType;
        var scriptId = params.scriptid ? params.scriptid : '';
        var scriptName = params.scriptname ? params.scriptname : '';
        var context = params.context ? params.context : '';
        var clientEventType = params.clientEventType ? params.clientEventType : '';
        var mapReduceStage = params.mapReduceStage ? params.mapReduceStage : '';

        var SSA_PARAMS = {
            debugMode: debugMode,
            compfil: compfil,
            myCompany: myCompany,
            startDate: startDate,
            endDate: endDate,
            scriptType: scriptType,
            scriptId: scriptId,
            scriptName: scriptName,
            context: context,
            clientEventType: clientEventType,
            mapReduceStage: mapReduceStage
        };

        //NModules
        inlineHTML += '<script type="text/javascript">';
        inlineHTML += 'var NSFORMAT;';
        inlineHTML += 'window.onload = function () {require(["N/format"], function(format) {NSFORMAT = format;}) };';
        inlineHTML += '</script>';

        //CSS
        inlineHTML += '<link type="text/css" rel="stylesheet" href="' + bundlePath + '/apm/ui/css/apm-jquery-ui-1.11.4.min.css" />';
        inlineHTML += '<link type="text/css" rel="stylesheet" href="' + bundlePath + '/apm/ui/css/apm-jq.css" />';
        inlineHTML += '<link type="text/css" rel="stylesheet" href="' + bundlePath + '/apm/ui/css/apm-ssa.css" />';

        inlineHTML += '<div id="apm-ssa-main-content" class="psgp-loading-mask"></div>';

        inlineHTML += '<script type="text/javascript">';
        inlineHTML += 'var TEST_MODE = "' + testmode + '";';
        inlineHTML += 'var SSA_PARAMS = ' + JSON.stringify(SSA_PARAMS) + ';';
        inlineHTML += 'var jQueryNS = jQuery.noConflict(true);';
        inlineHTML += 'var APMSSA;';
        inlineHTML += '</script>';

        //Libraries
        inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm-jquery-1.11.1.min.js') + '"></script>';
        inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm-jquery-ui-1.11.4.min.js') + '"></script>';
        inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm-highcharts-5.0.2.js') + '"></script>';
        inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm-highcharts-drilldown-5.0.2.js') + '"></script>';

        //App Modules
        inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_cs_jqwidgets.js') + '"></script>';
        inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_ssa_cs_services.js') + '"></script>';
        inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_ssa_cs_components.js') + '"></script>';
        inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_ssa_cs_highcharts.js') + '"></script>';
        inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_ssa_cs_mainpanel.js') + '"></script>';

        //App Main
        inlineHTML += '<script type="text/javascript" src="' + apmServLib2.getFileURL('apm_ssa_cs_main.js') + '"></script>';

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