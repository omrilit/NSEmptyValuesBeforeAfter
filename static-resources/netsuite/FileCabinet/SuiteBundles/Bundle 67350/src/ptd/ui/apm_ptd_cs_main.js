/**
 * Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       25 Feb 2015     jyeh             Initial
 * 2.00       24 Mar 2015     jyeh
 * 3.00       28 Mar 2015     jyeh
 * 4.00       22 Apr 2015     jmarimla         Removed wait for elements
 * 5.00       23 Apr 2015     jmarimla         Added feature checking
 * 6.00       29 Apr 2015     jmarimla         Check workflow
 * 7.00       30 Apr 2015     jmarimla         Remove workflow check
 * 8.00       01 Jul 2015     jmarimla         Updated splashscreen
 * 9.00       11 Aug 2015     rwong            Added default color in case headercolor is null; clean up of unused code.
 * 10.00      11 Jun 2018     jmarimla         Translation engine
 * 11.00      29 Jun 2018     jmarimla         Translation readiness
 * 12.00      01 Jan 2019     rwong            Translation strings replacement
 * 13.00      11 Oct 2019     jmarimla         Search by operationid
 * 14.00      17 Jan 2020     jmarimla         Customer debug changes
 * 15.00      23 Jan 2020     jmarimla         Blank customer
 * 16.00      21 Apr 2020     earepollo        ExtJS to jQuery
 *
 */

function waitDone() {
    (function (initApplication) {

        initApplication($, Highcharts, window, document);

    } ( function ($, Highcharts, window, document) {

        // load libraries
        ApmJqWidgets();
        APMPTD.Services = new APMPTD._Services();
        APMPTD.Components = new APMPTD._Components();
        APMPTD.Highcharts = new APMPTD._Highcharts();
        APMPTD.MainPanel = new APMPTD._MainPanel();

        // load jquery
        $(function() {
            APMPTD.MainPanel.adjustCSS();
            APMPTD.MainPanel.render();
        });

    })
    );
}