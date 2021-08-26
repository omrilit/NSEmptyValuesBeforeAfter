/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
 
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       27 Oct 2017     jmarimla         Initial
 * 2.00       11 Jun 2018     jmarimla         Translation engine
 * 3.00       06 Jul 2018     jmarimla         Widget library
 * 4.00       21 Dec 2018     jmarimla         Language restriction
 * 5.00       11 Jul 2019     jmarimla         Remove Language restriction
 *
 */

function waitDone() {
    (function (initApplication) {
        
        initApplication($, Highcharts, window, document);
        
    } ( function ($, Highcharts, window, document) {
        
        // load libraries
    	ApmJqWidgets();
        APMSCPM.Services = new APMSCPM._Services();
        APMSCPM.Components = new APMSCPM._Components();
        APMSCPM.Highcharts = new APMSCPM._Highcharts();
        APMSCPM.mainPanel = new APMSCPM._mainPanel();
            
        // load jquery
        $(function() {
            APMSCPM.mainPanel.adjustCSS();
            APMSCPM.mainPanel.render();
        });
        
    }) 
    );
}