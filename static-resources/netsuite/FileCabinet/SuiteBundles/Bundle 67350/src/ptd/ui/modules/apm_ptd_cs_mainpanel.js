/**
 * Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Feb 2015     jyeh             Initial
 * 2.00       24 Mar 2015     jmarimla         Changed portlet name
 * 3.00       28 Mar 2015     jyeh
 * 4.00       09 Apr 2015     jyeh
 * 5.00       22 Apr 2015     jmarimla         callPerfInstanceChartRESTlet in afterrender of container
 * 6.00       25 Aug 2015     jmarimla         Create title toolbar
 * 7.00       04 Sep 2015     rwong            Added Suitescripttime and Workflowtime
 * 8.00       19 May 2016     rwong            Added loading mask to the timeline chart
 * 9.00       29 Jun 2018     jmarimla         Translation readiness
 * 10.00      12 Apr 2019     jmarimla         Move profiler link
 * 11.00      17 Apr 2019     rwong            Adjusted profiler link
 * 12.00      24 May 2019     erepollo         Changed portlet container
 * 13.00      28 Jun 2019     erepollo         Translation for new texts
 * 14.00      11 Oct 2019     jmarimla         Search by operationid
 * 15.00      07 Jan 2020     earepollo        Translation readiness for new strings
 * 16.00      16 Jan 2020     lemarcelo        Remove loading mask to the timeline chart
 * 17.00      17 Jan 2020     jmarimla         Hide profiler link onload
 * 18.00      21 Apr 2020     earepollo        ExtJS to jQuery
 * 19.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 *
 */
APMPTD = APMPTD || {};

APMPTD._MainPanel = function() {

    function render() {
        var $mainContent = $('#apm-ptd-main-content').addClass('psgp-main-content');

        $mainContent
            .append(APMPTD.Components.$SuiteAppNote)
            .append(APMPTD.Components.$TitleBar)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMPTD.Components.$OperationIdSearch)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMPTD.Components.$ColumnPanel);


            APMPTD.Components.$ColumnPanel.find('.psgp-column-panel-1')
                .append(APMPTD.Components.$OverviewPortlet);

        $mainContent.removeClass('psgp-loading-mask');

        //resize event
        $(window).resize(function() {
            var delay = 250;
            setTimeout(function() {
                var charts = [

                ];

                for (var i in charts) {
                    if (charts[i]) charts[i].reflow();
                }
            }, delay);
        });

        var globalSettings = APMPTD.Services.getGlobalSettings();
        globalSettings.endDateMS = new Date().setMinutes(0, 0, 0);
        globalSettings.startDateMS = globalSettings.endDateMS - 1000*60*60*24*7;
        globalSettings.compfil = PTD_PARAMS.compfil;
        globalSettings.operationId = PTD_PARAMS.operationId;

        APMPTD.Components.$CustomerDebuggingDialog.find('.field-customer .psgp-textbox').val(PTD_PARAMS.compfil);
        APMPTD.Components.$OperationIdSearch.find('.field-operationid .psgp-textbox').val(PTD_PARAMS.operationId);

        APMPTD.Services.refreshData();
    }

    function adjustCSS() {
        var themeColor = $('#ns_navigation').css('background-color');
        themeColor = themeColor || '#DDDDDD';
        var fontFamily = $('.uir-record-type').css('font-family');
        fontFamily = fontFamily || '#Serif';
        var cssStyle = '' +
            '<style type="text/css">' +
            '.psgp-main-content *, .psgp-dialog *, .psgp-settings-dialog *, .psgp-dialog input, .psgp-settings-dialog input { font-family: ' + fontFamily + ';}' +
            '.psgp-dialog .ui-dialog-titlebar { background-color: ' + themeColor + ';}' +
            '</style>';
        $(cssStyle).appendTo($('#apm-ptd-main-content'));
    }

    return {
        adjustCSS: adjustCSS,
        render: render
    };
};