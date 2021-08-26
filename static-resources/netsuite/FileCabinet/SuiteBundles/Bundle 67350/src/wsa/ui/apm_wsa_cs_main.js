/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       07 Mar 2017     jmarimla         Initial
 * 2.00       11 Jun 2018     jmarimla         Translation engine
 * 3.00       06 Jul 2018     jmarimla         Widget library
 *
 */

function waitDone() {
    (function (initApplication) {
        
        initApplication($, Highcharts, window, document);
        
    } ( function ($, Highcharts, window, document) {
        
        // load libraries
        ApmJqWidgets();
        APMWSA.Services = new APMWSA._Services();
        APMWSA.Components = new APMWSA._Components();
        APMWSA.Highcharts = new APMWSA._Highcharts();
        APMWSA.mainPanel = new APMWSA._mainPanel();
            
        // load jquery
        $(function() {
            APMWSA.mainPanel.adjustCSS();
            APMWSA.mainPanel.render();
        });
        
    }) 
    );
}