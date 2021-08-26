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
 * 14.00      13 Aug 2020     lemarcelo        ExtJS to jQuery
 *
 */

function waitDone() {
    (function (initApplication) {
        initApplication($, Highcharts, window, document);
    })(function ($, Highcharts, window, document) {
        checkPermissions();
        // load libraries
        ApmJqWidgets();
        APMPTS.Services = new APMPTS._Services();
        APMPTS.Components = new APMPTS._Components();
        APMPTS.Highcharts = new APMPTS._Highcharts();
        APMPTS.MainPanel = new APMPTS._MainPanel();

        // load jquery
        $(function () {
            APMPTS.MainPanel.adjustCSS();
            APMPTS.MainPanel.render();
        });
    });
}

function checkPermissions() {
    var customRecords = nlapiGetContext().getFeature("customrecords");
    var clientScript = nlapiGetContext().getFeature("customcode");
    var serverScript = nlapiGetContext().getFeature("serversidescripting");

    if (!(customRecords && clientScript && serverScript)) {
        alert(APMTranslation.apm.common.alert.enablefeatures());
        window.location = "/app/center/card.nl?sc=-29";
    }
}
