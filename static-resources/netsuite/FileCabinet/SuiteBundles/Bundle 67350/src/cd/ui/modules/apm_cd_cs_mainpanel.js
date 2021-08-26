/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Feb 2018     jmarimla         Initial
 * 2.00       17 Apr 2018     jmarimla         Customer debugging
 * 3.00       11 Jun 2018     jmarimla         Translation engine
 * 4.00       24 May 2019     erepollo         Removed header BG
 * 5.00       11 Mar 2020     jmarimla         Overview Portlet
 * 6.00       23 Mar 2020     jmarimla         Concurrency chart
 * 7.00       15 Jun 2020     jmarimla         Tooltip init
 * 8.00       03 Jul 2020     jmarimla         Concurrency backend changes
 *
 */

APMCD = APMCD || {};

APMCD._mainPanel = function () {

    function render() {
        var $mainContent = $('#cd-main-content').addClass('psgp-main-content');

        $mainContent
            .append(APMCD.Components.$TitleBar)
            .append(APMCD.Components.$TimeBar)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMCD.Components.$ColumnPanel);


        APMCD.Components.$ColumnPanel.find('.psgp-column-panel-1')
            .append(APMCD.Components.$OverviewPortlet)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMCD.Components.$ConcurrencySection);
        
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

        APMCD.Components.initializeTooltips();
        
        var globalSettings = APMCD.Services.getGlobalSettings();
        globalSettings.startDateMS = CD_PARAMS.startDateMS;
        globalSettings.endDateMS = CD_PARAMS.endDateMS;
        globalSettings.compfil = CD_PARAMS.compfil;
        globalSettings.concurrencyMode = CD_PARAMS.concurrencyMode;
        globalSettings.integId = CD_PARAMS.integId;
        globalSettings.allocatedList = CD_PARAMS.allocatedList;
        
        APMCD.Services.refreshData();
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
        $(cssStyle).appendTo($('#cd-main-content'));
    }

    return {
        adjustCSS: adjustCSS,
        render: render
    };

};