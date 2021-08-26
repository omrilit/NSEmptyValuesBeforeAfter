/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       18 Jan 2018     jmarimla         Initial
 * 2.00       25 Jan 2018     rwong            Added kpi
 * 3.00       29 Jan 2018     rwong            Added concurrency heatmap
 * 4.00       23 Mar 2018     jmarimla         Default daterange
 * 5.00       11 Jun 2018     jmarimla         Translation engine
 * 6.00       24 May 2019     erepollo         Removed header BG
 * 7.00       17 Sep 2019     erepollo         Parameter passing
 * 8.00       23 Sep 2019     erepollo         Added compfil parameter
 * 9.00       12 Mar 2020     earepollo        Allocated/Unallocated tabs
 * 10.00      13 Mar 2020     jmarimla         Utilization chart
 * 11.00      15 Jun 2020     jmarimla         Tooltip init
 * 12.00      22 Sep 2020     jmarimla         Remove integ url and fixed bugs
 * 13.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 *
 */

APMCM = APMCM || {};

APMCM._mainPanel = function () {

    function render() {
        var $mainContent = $('#cm-main-content').addClass('psgp-main-content');

        $mainContent
            .append(APMCM.Components.$SuiteAppNote)
            .append(APMCM.Components.$TitleBar)
            .append(APMCM.Components.$Header)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMCM.Components.$ColumnPanel);


        APMCM.Components.$ColumnPanel.find('.psgp-column-panel-1')
        .append(APMCM.Components.$OverviewPortlet)
        .append($('<div>').psgpSpacer({
            height: 15
        }));

        APMCM.Components.$ColumnPanel.find('.psgp-column-panel-1')
        .append(APMCM.Components.$ConcurrencySection)
        .append($('<div>').psgpSpacer({
            height: 15
        }));

        $mainContent.removeClass('psgp-loading-mask');

        //resize event
        $(window).resize(function() {
            var delay = 250;
            setTimeout(function () {
                var charts = [

                ];

                for (var i in charts) {
                    if (charts[i]) charts[i].reflow();
                }
            }, delay);
        });
        
        APMCM.Components.initializeTooltips();

        var globalSettings = APMCM.Services.getGlobalSettings();
        var initialDateRangeSelect = CM_PARAMS.endDateMS ? 1000*60*60*24*7 : 1000*60*60*24 *3; //default: last 3 days
        globalSettings.endDateMS = '' + new Date().setSeconds(0, 0);
        globalSettings.dateRangeSelect = '' + initialDateRangeSelect;
        globalSettings.compfil = CM_PARAMS.compfil;
        APMCM.Components.$SettingsDateRangeDialog.find('.field-customer .psgp-textbox').val(globalSettings.compfil);
        APMCM.Components.$SettingsDateRangeDialog.find('.field-daterange .psgp-combobox').val(globalSettings.dateRangeSelect);
        APMCM.Components.$SettingsDateRangeDialog.find('.field-daterange .psgp-combobox').selectmenu('refresh');
        APMCM.Components.$AllocationsTab.find('.apm-cm-unallocated-tab .apm-cm-tab').addClass('selected');
        APMCM.Components.$IntegrationFilter.hide();
        APMCM.Components.$BtnRefresh.hide();

        APMCM.Services.refreshData();

    };

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
        $(cssStyle).appendTo($('#cm-main-content'));
    }

    return {
        adjustCSS: adjustCSS,
        render: render
    };

};