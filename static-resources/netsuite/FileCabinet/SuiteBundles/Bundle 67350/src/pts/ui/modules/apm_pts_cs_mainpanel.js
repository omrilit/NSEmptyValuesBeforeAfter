/**
 * Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Sep 2014     jmarimla         Initial
 * 2.00       24 Sep 2014     jmarimla         Added filters and grid panels
 * 3.00       03 Oct 2014     jmarimla         Added summary panel in performance logs
 * 4.00       09 Oct 2014     jmarimla         Added portlet menu button, show on hover of panel
 * 5.00       09 Oct 2014     rwong            Added suitescript detail chart
 * 6.00       10 Oct 2014     jmarimla         Set summary fields before render
 * 7.00       16 Oct 2014     rwong            Added parameter to handle
 * 8.00       21 Oct 2014     jmarimla         Set height for suitescript grid
 * 9.00       23 Oct 2014     jmarimla         Added rows for summary fields
 * 10.00      05 Nov 2014     rwong            Move the SuiteScript Detail Panel to the right
 *                                             Added field for No data found.
 *                                             Implemented minimum width to whole panel.
 * 11.00      11 Nov 2014     rwong            Added warning icon to No data available message.
 * 12.00      13 Nov 2014     rwong            Updated margins of suitescript detail grid panel.
 * 13.00      17 Nov 2014     jmarimla         Changed SuiteScript Detail from extjs panel to SPM subpanel class
 * 14.00      19 Nov 2014     jmarimla         Changed layout of summary panel
 * 15.00      21 Nov 2014     jmarimla         Added call to filter summary grid on load;
 * 16.00      27 Nov 2014     rwong            Execution Time is hidden by default.
 * 17.00      09 Feb 2015     jmarimla         Removed extjs chart
 ****************************************************************************************************************
 * 1.00       23 Feb 2014     jmarimla         Porting to APM
 * 2.00       21 Mar 2015     jmarimla         Set default recordtype
 * 3.00       27 Mar 2015     jmarimla         Added response time filter
 * 4.00       08 Apr 2015     rwong            Change title from Suitescript Performance to Server Time Breakdown
 *                                             Change title from Suitescript Details to Details
 *                                             Added Record Type field to Summary
 * 5.00       19 May 2015     jmarimla         Add component ids
 * 6.00       25 Jun 2015     jmarimla         Added role combo box; Fixed spacing in filters
 * 7.00       03 Jul 2015     rwong            Added role field in the summary page.
 * 8.00       05 Aug 2015     rwong            Remove role combobox and role field
 * 9.00       06 Aug 2015     rwong            Set filter panel to be collapsed on load
 * 10.00      25 Aug 2015     jmarimla         Create title toolbar
 * 11.00      04 Sep 2015     rwong            Rename suitelet settings to Customer Debug Settings
 * 12.00      01 Jun 2016     jmarimla         Relayout filter fields to fix border issue
 * 13.00      09 May 2018     jmarimla         Rename portlet
 * 14.00      29 Jun 2018     jmarimla         Translation readiness
 * 15.00      16 Jul 2018     jmarimla         Set translated time
 * 16.00      24 May 2019     erepollo         New portlet container
 * 17.00      01 Aug 2019     erepollo         Collapsible end to end time grid
 * 18.00      01 Aug 2019     erepollo         Adjusted summary subpanel
 * 19.00      14 Aug 2019     jmarimla         Filters expand/collapse
 * 20.00      30 Jul 2020     jmarimla         r2020a strings
 * 21.00      13 Aug 2020     lemarcelo        ExtJS to jQuery
 * 22.00      30 Oct 2020     lemarcelo        Refresh details grid on page load
 * 23.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 *
 */
APMPTS = APMPTS || {};

APMPTS._MainPanel = function () {
    function render() {
        var $mainContent = $("#apm-pts-main-content").addClass(
            "psgp-main-content"
        );
        $mainContent
            .append(APMPTS.Components.$SuiteAppNote)
            .append(APMPTS.Components.$TitleBar)
            .append(APMPTS.Components.$BtnRefresh)
            .append(
                $("<div>").psgpSpacer({
                    height: 15
                })
            )
            .append(APMPTS.Components.$FilterPanel)
            .append(
                $("<div>").psgpSpacer({
                    height: 15
                })
            )
            .append(APMPTS.Components.$SectionColumnPanel)
            .append(
                $("<div>").psgpSpacer({
                    height: 15
                })
            );

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

        // Update Filter panel

        var globalSettings = APMPTS.Services.getGlobalSettings();
        globalSettings.compfil = PTS_PARAMS.compfil;
        APMPTS.Components.$CustomerDebuggingDialog
            .find(".field-customer .psgp-textbox")
            .val(PTS_PARAMS.compfil);
        APMPTS.Components.$CustomerDebuggingDialog
            .find(".psgp-combobox")
            .selectmenu("refresh");

        APMPTS.Services.refreshRecordTypeList();
        APMPTS.Services.refreshSummarySetup();

        params = convertParams(PTS_PARAMS);
        if (params.fparam == true) {
            globalSettings.recordtype = PTS_PARAMS.recordtype;
            globalSettings.oper = PTS_PARAMS.oper;
            globalSettings.email = PTS_PARAMS.email;
            globalSettings.responseTimeOper = PTS_PARAMS.responseTimeOper;
            globalSettings.responseTime1 = PTS_PARAMS.responseTime1;
            globalSettings.responseTime2 = PTS_PARAMS.responseTime2;
            globalSettings.endDate = PTS_PARAMS.edatetime;
            globalSettings.startDate = PTS_PARAMS.sdatetime;

            APMPTS.Components.$OperationFilter
                .find(".psgp-combobox")
                .val(PTS_PARAMS.oper);
            APMPTS.Components.$OperationFilter
                .find(".psgp-combobox")
                .selectmenu("refresh");

            APMPTS.Components.updateDateTimeField(
                APMPTS.Components.$StartDateTimeFilter,
                PTS_PARAMS.sdatetime,
                PTS_PARAMS.stime
            );
            APMPTS.Components.updateDateTimeField(
                APMPTS.Components.$EndDateTimeFilter,
                PTS_PARAMS.edatetime,
                PTS_PARAMS.etime
            );
            APMPTS.Components.$FilterPanel.psgpFilterPanel("collapse");
            APMPTS.Services.refreshData();
        } else {
            var dateToday = new Date();
            var dateTomorrow = new Date(
                dateToday.getTime() + 24 * 60 * 60 * 1000
            );

            //set filter panel
            APMPTS.Components.updateDateTimeField(
                APMPTS.Components.$StartDateTimeFilter,
                dateToday,
                "00:00"
            );
            APMPTS.Components.updateDateTimeField(
                APMPTS.Components.$EndDateTimeFilter,
                dateTomorrow,
                "00:00"
            );
            APMPTS.Components.$DetailsGrid.psgpGrid(
                "refreshDataRemote",
                { }
            );
        }
    }

    function convertParams(params) {
        if (
            params.recordtype &&
            params.recordtype != "" &&
            params.oper &&
            params.oper != "" &&
            params.sdatetime &&
            params.sdatetime != "" &&
            params.edatetime &&
            params.edatetime != ""
        ) {
            params.sdate = convertDate(params.sdatetime);
            params.edate = convertDate(params.edatetime);
            params.stime = convertTime(params.sdatetime);
            params.etime = convertTime(params.edatetime);
            params.fparam = true;
        } else {
            params.fparam = false;
        }
        return params;
    }

    function convertDate(dateStr) {
        if (!dateStr) return;
        var datetime = dateStr
            .replace("T", ",")
            .replace(/-/g, "/")
            .replace(" ", ",")
            .split(",");
        var date = datetime[0].split("/");
        var convertedDate = new Date(date[0], date[1] - 1, date[2], 0, 0, 0);
        return convertedDate;
    }

    function convertTime(dateStr) {
        if (!dateStr) return;
        var datetime = dateStr
            .replace("T", ",")
            .replace(/-/g, "/")
            .replace(" ", ",")
            .split(",");
        var timeRaw = datetime[1];
        return timeRaw.substring(0, 5);
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
            "</style>";
        $(cssStyle).appendTo($("#apm-pts-main-content"));
    }

    return {
        adjustCSS: adjustCSS,
        render: render
    };
};
