/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       29 Oct 2014     jmarimla         Initial
 * 2.00       20 Nov 2014     rwong            Added create for SSD pop-up window
 * 3.00       28 Nov 2014     rwong            Added support for parameter passing.
 * 4.00       02 Dec 2014     jmarimla         Added initial call for performance chart
 * 5.00       09 Feb 2015     rwong            Added perf chart resize event.
 * ********************************************************************************
 * 1.00       18 Feb 2015     rwong            Ported code to APM
 * 2.00       03 Mar 2015     jmarimla         Modified parameter passing
 * 3.00       24 Mar 2015     jmarimla         Fixed 12pm in parameter passing
 * 4.00       31 Mar 2015     jmarimla         Fixed parsing of hour value in convertTime
 * 5.00       23 Mar 2015     jmarimla         Added feature checking
 * 6.00       29 Apr 2015     jmarimla         Check workflow
 * 7.00       30 Apr 2015     jmarimla         Remove workflow check
 * 8.00       01 Jul 2015     jmarimla         Updated splashscreen
 * 9.00       09 Jul 2015     jmarimla         Added drilldown default on parameter passing
 * 10.00      16 Jul 2015     jmarimla         Added script name in parameter passing
 * 11.00      11 Aug 2015     rwong            Added default color in case headercolor is null; clean up of unused code.
 * 12.00      13 Aug 2015     jmarimla         Passed date parameters as string
 * 13.00      25 Aug 2015     jmarimla         Initialize comp id dropdown
 * 14.00      28 Aug 2015     jmarimla         Realign compid selector
 * 15.00      08 Sep 2015     jmarimla         Indicate radix for parseInt
 * 16.00      01 Dec 2015     jmarimla         Initialize tooltips
 * 17.00      05 Aug 2016     jmarimla         Suppport for suitescript context
 * 18.00      05 Apr 2018     rwong            Added support for client scripts
 * 19.00      11 Jun 2018     jmarimla         Translation engine
 * 20.00      29 Jun 2018     jmarimla         Translation readiness
 * 21.00      16 Jul 2018     jmarimla         Set translated time
 * 22.00      15 Jan 2020     jmarimla         Customer debug changes
 * 23.00      23 Jan 2020     jmarimla         Blank customer
 * 24.00      04 May 2020     earepollo        Add map/reduce stage filter
 * 25.00      11 Jun 2020     earepollo        ExtJS to jQuery
 *
 */

function waitDone() {
    (function (initApplication) {

        initApplication($, Highcharts, window, document);

    } ( function ($, Highcharts, window, document) {

        // load libraries
        ApmJqWidgets();
        APMSSA.Services = new APMSSA._Services();
        APMSSA.Components = new APMSSA._Components();
        APMSSA.Highcharts = new APMSSA._Highcharts();
        APMSSA.MainPanel = new APMSSA._MainPanel();

        // load jquery
        $(function() {
            APMSSA.MainPanel.adjustCSS();
            APMSSA.MainPanel.render();
        });

    })
    );
}
