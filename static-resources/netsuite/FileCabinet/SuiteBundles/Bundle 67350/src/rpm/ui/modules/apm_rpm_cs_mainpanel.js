/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       09 Dec 2014     jmarimla         Initial
 * 2.00       09 Jan 2015     jmarimla         Add components for Record Pages portlet
 * 3.00       15 Jan 2015     jmarimla         Update carousel on load
 * 4.00       28 Jan 2015     jmarimla         Added record chart panels
 * 5.00       07 Mar 2015     jmarimla         Added toolbar to record pages portlet
 * 6.00       10 Mar 2015     rwong            Added menu button for setup pages
 * 7.00       16 Mar 2015     jmarimla         Do not trigger sorting at initial load
 * 8.00       21 Mar 2015     jmarimla         Changed layout
 * 9.00       19 May 2015     jmarimla         Add component Ids
 * 10.00      29 Jul 2015     jmarimla         Trigger update record names on initial render
 * 11.00      25 Aug 2015     jmarimla         Create title toolbar
 * 12.00      04 Sep 2015     rwong            Rename suitelet settings to Customer Debug Settings
 * 13.00      05 Nov 2015     jmarimla         Added personalize panel; added dummy portlet
 * 14.00      26 Aug 2016     rwong            ScheduledScriptUsage portlet
 * 15.00      13 Sep 2016     rwong            Updated scheduled script usage portlet
 * 16.00      26 Jan 2017     jmarimla         Hidden personalize link
 * 17.00      02 Oct 2017     jmarimla         Remove sched script portlet
 * 18.00      29 Jun 2018     jmarimla         Translation readiness
 * 19.00      24 May 2019     erepollo         New portlet container
 * 20.00      24 Sep 2019     jmarimla         Page title
 * 21.00      07 Jan 2020     earepollo        Translation readiness for new strings
 * 22.00      21 Feb 2020     lemarcelo        Renamed title to Dashboard
 * 23.00      24 Jun 2020     earepollo        Changed title to Record Pages Monitor
 * 24.00      11 Aug 2020     earepollo        ExtJS to jQuery
 * 25.00      20 Aug 2020     lemarcelo        ExtJS to jQuery - Setup
 * 26.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 *
 */

APMRPM = APMRPM || {};

APMRPM._MainPanel = function () {
    function render() {
        var $mainContent = $("#apm-rpm-main-content").addClass(
            "psgp-main-content"
        );

        $mainContent
            .append(APMRPM.Components.$SuiteAppNote)
            .append(APMRPM.Components.$TitleBar)
            .append(
                $("<div>").psgpSpacer({
                    height: 15
                })
            )
            .append(APMRPM.Components.$RecordPagesPortlet);

        $mainContent.removeClass("psgp-loading-mask");

        //resize event
        $(window).resize(function () {
            var delay = 250;
            setTimeout(function () {
                var charts = [];

                for (var i in charts) {
                    if (charts[i]) charts[i].reflow();
                }
            }, delay);
        });

        var globalSettings = APMRPM.Services.getGlobalSettings();
        var initialDateRangeSelect = 1000 * 60 * 60 * 24;
        globalSettings.endDateMS = new Date().setSeconds(0, 0);
        globalSettings.dateRangeSelect = "" + initialDateRangeSelect;
        globalSettings.sorting = "logsTotal";
        globalSettings.compfil = RPM_PARAMS.compfil;

        APMRPM.Components.$RecordPagesPortlet
            .find(".apm-rpm-recordpages-toolbar .combo-sort .psgp-combobox")
            .val(globalSettings.sorting);
        APMRPM.Components.$RecordPagesPortlet
            .find(".apm-rpm-recordpages-toolbar .combo-sort .psgp-combobox")
            .selectmenu("refresh");

        APMRPM.Services.refreshRecordTypesData();
        APMRPM.Services.refreshSetupData();
    }

    function adjustCSS() {
        var themeColor = $("#ns_navigation").css("background-color");
        themeColor = themeColor || "#DDDDDD";
        var fontFamily = $(".uir-record-type").css("font-family");
        fontFamily = fontFamily || "#Serif";
        var cssStyle =
            "" +
            '<style type="text/css">' +
            ".psgp-main-content *, .psgp-dialog *, .psgp-settings-dialog *, .psgp-dialog input, .psgp-settings-dialog input { font-family: " +
            fontFamily +
            ";}" +
            ".psgp-dialog .ui-dialog-titlebar { background-color: " +
            themeColor +
            ";}" +
            ".psgp-tabs > .ui-widget-header, .psgp-tabs > .ui-tabs-nav li { background-color: " +
            themeColor +
            ";}" +
            "</style>";
        $(cssStyle).appendTo($("#apm-rpm-main-content"));
    }

    return {
        adjustCSS: adjustCSS,
        render: render
    };
};
