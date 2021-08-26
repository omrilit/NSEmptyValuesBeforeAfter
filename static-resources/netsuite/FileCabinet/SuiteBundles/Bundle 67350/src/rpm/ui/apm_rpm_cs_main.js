/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       09 Dec 2014     jmarimla         Initial
 * 2.00       15 Jan 2015     jmarimla         Call store to load data
 * 3.00       28 Jan 2015     jmarimla         Pass dates to restlet on load; call highcharts resize
 * 4.00       10 Mar 2015     rwong            Added inital creation of setup record pages
 * 5.00       21 Mar 2015     jmarimla         Call to recordtypes store
 * 6.00       27 Mar 2015     jmarimla         Removed seconds for SPM compatibility
 * 7.00       21 Apr 2015     jmarimla         Load general setup; set css for tabs
 * 8.00       23 Apr 2015     jmarimla         Added feature checking
 * 9.00       23 Apr 2015     rwong            Added initial creation of add watchlist window and custom date time
 * 10.00      29 Apr 2015     jmarimla         Check workflow
 * 11.00      30 Apr 2015     jmarimla         Remove workflow check
 * 12.00      01 Jul 2015     jmarimla         Updated splashscreen
 * 13.00      11 Aug 2015     rwong            Added default color in case headercolor is null
 * 14.00      08 Aug 2015     jmarimla         Initialized Compid dropdown
 * 15.00      28 Aug 2015     jmarimla         Realigned compid selector
 * 16.00      26 Aug 2016     rwong            ScheduledScriptUsage portlet
 * 17.00      02 Oct 2017     jmarimla         Remove sched script portlet
 * 18.00      11 Jun 2018     jmarimla         Translation engine
 * 19.00      29 Jun 2018     jmarimla         Translation readiness
 * 20.00      08 Jan 2019     jmarimla         Translation
 * 21.00      24 May 2019     erepollo         Removed header BG
 * 22.00      10 Jan 2020     jmarimla         Customer debug changes
 * 23.00      23 Jan 2020     jmarimla         Blank customer
 * 24.00      11 Aug 2020     earepollo        ExtJS to jQuery
 *
 */

function waitDone() {
    (function (initApplication) {
        initApplication($, Highcharts, window, document);
    })(function ($, Highcharts, window, document) {
        // load libraries
        ApmJqWidgets();
        APMRPM.Services = new APMRPM._Services();
        APMRPM.Components = new APMRPM._Components();
        APMRPM.Highcharts = new APMRPM._Highcharts();
        APMRPM.MainPanel = new APMRPM._MainPanel();

        // load jquery
        $(function () {
            APMRPM.MainPanel.adjustCSS();
            APMRPM.MainPanel.render();
        });
    });
}
