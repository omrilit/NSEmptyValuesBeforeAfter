/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
 
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       04 Jan 2018     jmarimla         Initial
 * 2.00       11 Jun 2018     jmarimla         Translation engine
 * 3.00       06 Jul 2018     jmarimla         Widget library
 * 4.00       12 Dec 2018     jmarimla         Language restriction
 * 5.00       11 Jul 2019     jmarimla         Remove Language restriction
 *
 */

function waitDone() {
    (function (initApplication) {
        
        initApplication($, Highcharts, window, document);
        
    } ( function ($, Highcharts, window, document) {
        
        // load libraries
    	ApmJqWidgets();
        APMSPJD.Services = new APMSPJD._Services();
        APMSPJD.Components = new APMSPJD._Components();
        APMSPJD.Highcharts = new APMSPJD._Highcharts();
        APMSPJD.mainPanel = new APMSPJD._mainPanel();
            
        // load jquery
        $(function() {
            APMSPJD.mainPanel.adjustCSS();
            APMSPJD.mainPanel.render();
        });
        
    }) 
    );
}