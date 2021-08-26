/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 Mar 2019     alaurito         Initial
 * 2.00       21 Feb 2020     lemarcelo        Added permisson checking
 * 3.00       24 Jun 2020     earepollo        Exposed account health
 *
 */

function waitDone() {
    (function (initApplication) {

        initApplication($, Highcharts, window, document);

    } ( function ($, Highcharts, window, document) {
        // load libraries
        ApmJqWidgets();
        APMAH.Services = new APMAH._Services();
        APMAH.Components = new APMAH._Components();
        APMAH.Highcharts = new APMAH._Highcharts();
        APMAH.MainPanel = new APMAH._MainPanel();

        // load jquery
        $(function() {
            APMAH.MainPanel.adjustCSS();
            APMAH.MainPanel.render();
        });

    })
    );
}