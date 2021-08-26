/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Sep 2014     jmarimla         Initial
 * 2.00       26 Sep 2014     jmarimla         Added components for filters and grid panels
 * 3.00       01 Oct 2014     jmarimla         Added Total Time column for performance logs grid
 * 4.00       03 Oct 2014     jmarimla         Added components for performance logs summary
 * 5.00       03 Oct 2014     rwong            Change the columns of the SuitescriptDetail grid.
 * 6.00       09 Oct 2014     jmarimla         Added components for set up summary pop up window
 * 7.00       09 Oct 2014     rwong            Added suitescript chart definition
 * 8.00       10 Oct 2014     jmarimla         Enabled saving of summary set up
 * 9.00       13 Oct 2014     jmarimla         Added pagination components for performance logs grid
 * 10.00      21 Oct 2014     jmarimla         Added color set for pie chart slices
 * 11.00      23 Oct 2014     jmarimla         Set height for set up summary grid
 *                                             Modified reset button function to revert to default
 * 12.00      24 Oct 2014     jmarimla         Enable subpanel collapsible
 * 13.00      29 Oct 2014     jmarimla         Moved reusable components to spm_cs_classes
 * 14.00      04 Nov 2014     rwong            Added support for hiding of pagination controls and default empty text for grid.
 * 15.00      05 Nov 2014     rwong            Remove script deployment from results and no data available default from chart.
 * 16.00      07 Nov 2014     rwong            Implement partial reskin of pie chart to be similar to NS pie chart, update color setting.
 * 17.00      11 Nov 2014     rwong            Updated css of tooltips
 * 18.00      13 Nov 2014     rwong            Rename Search to Refresh; turn off legends in chart; defined minwidth for the columns
 * 19.00      19 Nov 2014     jmarimla         Added summary grid
 * 20.00      21 Nov 2014     jmarimla         Enable set up summary window
 * 21.00      26 Nov 2014     rwong            Added support for color display in suitescript detail grid panel.
 * 22.00      03 Dec 2014     rwong            Updated aggregate column labels and made them unsortable
 * 23.00      04 Dec 2014     rwong            Remove time in endtoendtime grid column labels
 ****************************************************************************************************************
 * 1.00       23 Feb 2015     jmarimla         Porting to APM
 * 2.00       03 Mar 2015     jmarimla         90th to 95th percentile
 * 3.00       21 Mar 2015     jmarimla         Edited parameter to recordtype
 * 4.00       22 Mar 2015     jyeh             Action details column
 * 5.00       23 Mar 2015     jyeh             Pass email and date to PTD
 * 6.00       27 Mar 2015     jmarimla         Response time filter components
 * 7.00       01 Apr 2015     rwong            Added workflow time
 * 8.00       09 Apr 2015     jyeh
 * 9.00       29 Apr 2015     jmarimla         Auto trigger first row of grid
 * 10.00      19 Jun 2015     rwong            Added link from Page Time Summary to SSA.
 * 11.00      25 Jun 2015     jmarimla         Added role combo box component
 * 12.00      01 Jul 2015     jmarimla         Updated loading masks
 * 13.00      03 Jul 2015     rwong            Added role in endtoendtime grid.
 * 14.00      05 Aug 2015     rwong            Remove role in endtoendtime grid.
 * 15.00      06 Aug 2015     rwong            Added url class to suitescriptdetail links
 * 16.00      25 Aug 2015     jmarimla         Comp id dropdown components
 * 17.00      28 Aug 2015     rwong            Added functionality to handle customer debugging
 * 18.00      12 Oct 2015     jmarimla         Date range validation
 * 19.00      01 Dec 2015     jmarimla         Added csv export button
 * 20.00      21 Dec 2015     rwong            Adjust the spacing of the export button
 * 21.00      29 Jun 2018     jmarimla         Translation readiness
 * 22.00      20 Sep 2018     jmarimla         FRHT Column
 * 23.00      18 Oct 2018     jmarimla         Redirect to profiler
 * 24.00      26 Oct 2018     jmarimla         Frht label
 * 25.00      28 Jun 2019     erepollo         Translation for new texts
 * 26.00      30 Jul 2019     rwong            Added workflowtime in ajax call
 * 27.00      11 Oct 2019     jmarimla         Search by operationid
 * 28.00      14 Jan 2020     jmarimla         Customer debug changes
 * 29.00      29 Apr 2020     earepollo        Changed suitelet for Page Time Details
 * 30.00      30 Jul 2020     jmarimla         r2020a strings
 * 31.00      13 Aug 2020     lemarcelo        ExtJS to jQuery
 * 32.00      28 Oct 2020     earepollo        Refresh record types list when debugging customer
 * 33.00      30 Oct 2020     lemarcelo        Add csv export button to details grid
 * 34.00      19 Nov 2020     lemarcelo        Added help link and icon
 * 35.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 *
 */

APMPTS = APMPTS || {};

APMPTS._Components = function () {

    var $SuiteAppNote = $("<div>").psgpNewSuiteAppNote();

    var $TitleBar = $("<div>").psgpSuiteletTitle({
        title: APMTranslation.apm.pts.label.pagetimesummary()
    });

    var $ColumnPanel = $("<div>").psgpColumnPanel({
        columndef: [
            {
                width: "75%",
                padding: "0px 5px 0px 0px"
            },
            {
                width: "25%",
                padding: "0px 0px 0px 5px"
            }
        ]
    });

    /*
     * Customer Debugging
     */
    //Preserve markup indention
    //prettier-ignore
    var $CustomerDebuggingDialog =  $('' +
            '<div class="apm-pts-dialog-custdebug">' +
                '<div class="container-field-customer"><span class="psgp-field-label">' + APMTranslation.apm.common.label.companyid() + '</span><div class="field-customer"></div></div>' +
                '<div class="buttons"><div class="btn-save"></div><div class="btn-cancel"></div></div>' +
            '</div>')
            .psgpSettingsDialog({width: 240});

    $CustomerDebuggingDialog.find(".field-customer").psgpTextBox({
        width: 250
    });

    $CustomerDebuggingDialog.find(".btn-save").psgpBlueButton({
        text: APMTranslation.apm.r2020a.apply(),
        handler: function () {
            var me = this;
            var globalSettings = APMPTS.Services.getGlobalSettings();
            var $dialog = $(me).parents(".apm-pts-dialog-custdebug");
            $dialog.dialog("close");

            var compfil = $dialog.find(".field-customer .psgp-textbox").val();
            globalSettings.compfil = compfil.trim();

            APMPTS.Services.refreshRecordTypeList();
            APMPTS.Services.refreshData();
        }
    });

    $CustomerDebuggingDialog.find(".btn-cancel").psgpGrayButton({
        text: APMTranslation.apm.common.button.cancel(),
        handler: function () {
            var me = this;
            var globalSettings = APMPTS.Services.getGlobalSettings();
            var $dialog = $(me).parents(".apm-pts-dialog-custdebug");
            $dialog.dialog("close");

            var oldCompfil = globalSettings.compfil;
            $dialog.find(".field-customer .psgp-textbox").val(oldCompfil);
        }
    });

    var $CustomerDebuggingLabel = $("<div>")
        .addClass("apm-pts-settings-custdebug")
        .psgpSuiteletSettings({
            label: APMTranslation.apm.common.label.customerdebugsettings(),
            $dialog: $CustomerDebuggingDialog
        });

    if (PTS_PARAMS.debugMode) {
        $TitleBar.append($CustomerDebuggingLabel);
    }

    /*
     * Filters
     */
    var $FilterPanel = $("<div>").psgpFilterPanel({});

    var $RecordTypeFilter = $(
        '<div class="psgp-filter-combo"><div><span class="psgp-field-label">' +
            APMTranslation.apm.common.label.recordtype() +
            '</span><div class="filter-recordtype"></div></div></div>'
    );
    $RecordTypeFilter.find(".filter-recordtype").psgpComboBox({
        list: [],
        width: 158
    });

    var $OperationFilter = $(
        '<div class="psgp-filter-combo"><div><span class="psgp-field-label">' +
            APMTranslation.apm.common.label.operation() +
            '</span><div class="filter-operator"></div></div></div>'
    );
    $OperationFilter.find(".filter-operator").psgpComboBox({
        list: [
            { name: APMTranslation.apm.common.label.view(), id: "v" },
            { name: APMTranslation.apm.common.label.edit(), id: "e" },
            { name: APMTranslation.apm.common.label.new(), id: "n" },
            { name: APMTranslation.apm.common.label.save(), id: "s" }
        ],
        width: 78
    });

    var $EmailFilter = $(
        '<div class="psgp-filter-text"><div><span class="psgp-field-label">' +
            APMTranslation.apm.r2020a.emailaddress() +
            '</span><div class="filter-email"></div></div></div>'
    );
    $EmailFilter.find(".filter-email").psgpTextBox({
        width: 190
    });

    var $StartDateTimeFilter = $("<div>").psgpDateTimeField({
        label: APMTranslation.apm.r2020a.startdateandtime()
    });

    var $EndDateTimeFilter = $("<div>").psgpDateTimeField({
        label: APMTranslation.apm.r2020a.enddateandtime()
    });

    var $ResponseTimeFilter = $("<div>").psgpNumberRangeFilter({
        label: APMTranslation.apm.r2020a.responsetimes()
    });

    $FilterPanel.psgpFilterPanel("addFilterField", $RecordTypeFilter);
    $FilterPanel.psgpFilterPanel("addFilterField", $OperationFilter);
    $FilterPanel.psgpFilterPanel("addFilterField", $EmailFilter);
    $FilterPanel.psgpFilterPanel("addFilterField", $StartDateTimeFilter);
    $FilterPanel.psgpFilterPanel("addFilterField", $EndDateTimeFilter);
    $FilterPanel.psgpFilterPanel("addFilterField", $ResponseTimeFilter);

    /*
     * Refresh Button
     */
    var $BtnRefresh = $("<div>").psgpBlueButton({
        text: APMTranslation.apm.common.button.refresh(),
        handler: function () {
            var startdate = $StartDateTimeFilter.psgpDateTimeField(
                "getDateValue"
            );
            var starttime = $StartDateTimeFilter.psgpDateTimeField(
                "getTimeValue"
            );
            starttime = starttime.split(":", 2);

            var enddate = $EndDateTimeFilter.psgpDateTimeField("getDateValue");
            var endtime = $EndDateTimeFilter.psgpDateTimeField("getTimeValue");
            endtime = endtime.split(":", 2);

            var startDateObj = new Date(
                startdate.getFullYear(),
                startdate.getMonth(),
                startdate.getDate(),
                starttime[0],
                starttime[1],
                0,
                0
            );
            var endDateObj = new Date(
                enddate.getFullYear(),
                enddate.getMonth(),
                enddate.getDate(),
                endtime[0],
                endtime[1],
                0,
                0
            );

            //validate dates
            if (!$StartDateTimeFilter.psgpDateTimeField("isDateValid")) {
                alert(APMTranslation.apm.r2020a.pickastartdate());
                return;
            }
            if (!$EndDateTimeFilter.psgpDateTimeField("isDateValid")) {
                alert(APMTranslation.apm.common.alert.entervalidenddate());
                return;
            }

            //validate date range
            if (startDateObj > endDateObj) {
                alert(
                    APMTranslation.apm.r2020a.pickastartdatethatisearlierthantheenddate()
                );
                return;
            }
            //max 30 days
            if (
                endDateObj.getTime() - startDateObj.getTime() >
                1000 * 60 * 60 * 24 * 30
            ) {
                alert(
                    APMTranslation.apm.r2020a.pickastartandenddatethatislessthanorequalto30days()
                );
                return false;
            }

            var responseTime = $ResponseTimeFilter.psgpNumberRangeFilter(
                "getValue"
            );
            if (!responseTime.isNumRangeValid) {
                alert(APMTranslation.apm.r2020a.enteravalidresponsetime());
                return;
            }

            APMPTS.Services.showLoading();

            var tzoffset = new Date().getTimezoneOffset() * 60 * 1000; //offset in milliseconds
            var startDate = new Date(startDateObj.getTime() - tzoffset)
                .toISOString()
                .slice(0, -5);
            var endDate = new Date(endDateObj.getTime() - tzoffset)
                .toISOString()
                .slice(0, -5);

            var recordType = $RecordTypeFilter.find(".psgp-combobox").val();
            var operation = $OperationFilter.find(".psgp-combobox").val();
            var email = $EmailFilter.find(".psgp-textbox").val();

            var globalSettings = APMPTS.Services.getGlobalSettings();

            globalSettings.recordtype = recordType;
            globalSettings.oper = operation;
            globalSettings.email = email;
            globalSettings.startDate = startDate;
            globalSettings.endDate = endDate;
            globalSettings.responseTimeOper = responseTime.operatorValue;
            globalSettings.responseTime1 = responseTime.val1Value;
            globalSettings.responseTime2 = responseTime.val2Value;

            APMPTS.Services.refreshData();
        }
    });

    /*
     * Performance Logs Portlet
     */
    var $PerformanceLogsPortletMenuBtn = $("<div>").psgpPortletMenuBtn({
        items: [
            {
                text: APMTranslation.apm.common.label.setup(),
                handler: function () {
                    showSetupDialog();
                }
            }
        ]
    });

    var $PerformanceLogsPortlet = $("<div>").psgpPortlet({
        title: APMTranslation.apm.pts.label.performancelogs(),
        helpLink : { hover : APMTranslation.apm.r2019a.moreinformation(), link: '/app/help/helpcenter.nl?fid=section_4304063537.html' },
        buttons: [$PerformanceLogsPortletMenuBtn]
    });

    //   Summary Section
    //   -----------------
    var $SummaryColumnPanel = $("<div>").psgpColumnPanel({
        columndef: [
            {
                width: "15%",
                padding: "10px 10px 0px 22px"
            },
            {
                width: "85%",
                padding: "10px 0px 0px 10px"
            }
        ]
    });
    var $SummarySubPanel = $('<div class="apm-pts-subpanel">').psgpSubPanel({
        title: APMTranslation.apm.pts.label.summary()
    });

    //Preserve markup indention
    //prettier-ignore
    var $SummarySidePanel = $(
            '<div class="summary-side-panel">' +
                '<div class="label">' + APMTranslation.apm.common.label.recordtype() + '</div>' +
                '<div class="content">' +
                    '<div class="recordtype">' + '0' + '</div>' +
                '</div>' +

                '<div class="label">' + APMTranslation.apm.common.label.operation() + '</div>' +
                '<div class="content">' +
                    '<div class="operation">' + '0' + '</div>' +
                '</div>' +

                '<div class="label">' + APMTranslation.apm.common.label.numberoflogs() + '</div>' +
                '<div class="content">' +
                    '<div class="numberoflogs">' + '0' + '</div>' +
                '</div>' +

                '<div class="label">' + APMTranslation.apm.common.label.user() + '</div>' +
                '<div class="content">' +
                    '<div class="user">' + '0' + '</div>' +
                '</div>' +
            '</div>'
    );

    var summaryGrid = {
        url: APMPTS.Services.getURL("summary"),
        paging: false,
        columns: [
            {
                dataIndex: "name",
                text: APMTranslation.apm.pts.label.aggregation(),
                sortable: false
            },
            {
                dataIndex: "clienttime",
                text: APMTranslation.apm.common.label.client(),
                sortable: false,
                renderer: function (value, record) {
                    return "<div>" + value + "</div>";
                }
            },
            {
                dataIndex: "networktime",
                text: APMTranslation.apm.common.label.network(),
                sortable: false,
                renderer: function (value, record) {
                    return "<div>" + value + "</div>";
                }
            },
            {
                dataIndex: "suitescripttime",
                text: APMTranslation.apm.ns.context.suitescript(),
                sortable: false,
                renderer: function (value, record) {
                    return "<div>" + value + "</div>";
                }
            },
            {
                dataIndex: "workflowtime",
                text: APMTranslation.apm.ns.context.workflow(),
                sortable: false,
                renderer: function (value, record) {
                    return "<div>" + value + "</div>";
                }
            },
            {
                dataIndex: "servertime",
                text: APMTranslation.apm.common.label.server(),
                sortable: false,
                renderer: function (value, record) {
                    return "<div>" + value + "</div>";
                }
            },
            {
                dataIndex: "totaltime",
                text: APMTranslation.apm.common.label.total(),
                sortable: false,
                renderer: function (value, record) {
                    return "<div>" + value + "</div>";
                }
            }
        ],
        listeners: {
            afterRefreshData: function (grid) {}
        }
    };
    var $SummaryGrid = $('<div class="apm-pts-grid">').psgpGrid(summaryGrid);
    var $PerfLogSummaryContainer = $(
        '<div class="apm-pts-summary-container"></div>'
    );
    $SummaryColumnPanel.find(".psgp-column-panel-1").append($SummarySidePanel);
    $SummaryColumnPanel.find(".psgp-column-panel-2").append($SummaryGrid);
    $PerfLogSummaryContainer.append($SummaryColumnPanel);
    $SummarySubPanel.psgpSubPanel("getBody").append($PerfLogSummaryContainer);

    //   Details Section
    //   -----------------
    var $DetailsSubPanel = $('<div class="apm-pts-subpanel">').psgpSubPanel({
        title: APMTranslation.apm.pts.label.details()
    });

    var detailsGrid = {
        url: APMPTS.Services.getURL("details"),
        sort: {
            dataIndex: "date",
            dir: false,
            remote: true
        },
        paging: {
            pageLimit: 10
        },
        exportCSV: true,
        columns: [
            {
                dataIndex: "date",
                text: APMTranslation.apm.common.label.datetime()
            },
            {
                dataIndex: "email",
                text: APMTranslation.apm.r2020a.emailaddress()
            },
            {
                dataIndex: "clienttime",
                text: APMTranslation.apm.common.label.client()
            },
            {
                dataIndex: "networktime",
                text: APMTranslation.apm.common.label.network()
            },
            {
                dataIndex: "suitescripttime",
                text: APMTranslation.apm.ns.context.suitescript()
            },
            {
                dataIndex: "workflowtime",
                text: APMTranslation.apm.ns.context.workflow()
            },
            {
                dataIndex: "servertime",
                text: APMTranslation.apm.common.label.server()
            },
            {
                dataIndex: "totaltime",
                text: APMTranslation.apm.common.label.total()
            },
            {
                dataIndex: "",
                text: APMTranslation.apm.ptd.label.pagetimedetails(),
                renderer: function (value, record) {
                    var $markUp = $(
                        '<div><div class="apm-pts-viewptddetails-icon"></div></div>'
                    );
                    return $markUp.html();
                },
                resizable: false,
                sortable: false
            },
            {
                dataIndex: "",
                text: APMTranslation.apm.r2019a.profilerdetails(),
                renderer: function (value, record) {
                    var $markUp = $(
                        '<div><div class="apm-pts-viewprofilerdetails-icon"></div></div>'
                    );
                    return $markUp.html();
                },
                resizable: false,
                sortable: false
            }
        ],
        listeners: {
            afterRefreshData: function (grid, response) {
                var rows = grid.element.find("tbody tr");
                var gData = grid.options.data;
                var me = this;
                rows.each(function (index) {
                    var me = this;
                    $(me)
                        .find(".apm-pts-viewptddetails-icon")
                        .attr("param-rowIndex", $(this).index());
                    $(me)
                        .find(".apm-pts-viewprofilerdetails-icon")
                        .attr("param-rowIndex", $(this).index());

                    //onclick of row
                    $(me).click(function () {
                        var globalSettings = APMPTS.Services.getGlobalSettings();
                        var me = this;
                        rows.removeClass("selected");
                        $(me).addClass("selected");

                        var rData = gData[$(me).index()];

                        var params = {
                            compfil: globalSettings.compfil,
                            threadid: rData.id,
                            threadid2: rData.id2,
                            servertime: rData.servertime,
                            suitescripttime: rData.suitescripttime,
                            workflowtime: rData.workflowtime,
                            startdate: globalSettings.startDate,
                            enddate: globalSettings.endDate
                        };

                        APMPTS.Services.refreshSsDetails(params);
                    });
                });
                rows.hover(
                    function () {
                        $(this)
                            .find(".apm-pts-viewptddetails-icon")
                            .addClass("showicon");
                        $(this)
                            .find(".apm-pts-viewprofilerdetails-icon")
                            .addClass("showicon");
                    },
                    function () {
                        $(this)
                            .find(".apm-pts-viewptddetails-icon")
                            .removeClass("showicon");
                        $(this)
                            .find(".apm-pts-viewprofilerdetails-icon")
                            .removeClass("showicon");
                    }
                );

                rows.find(".apm-pts-viewptddetails-icon").click(function () {
                    var globalSettings = APMPTS.Services.getGlobalSettings();
                    var me = this;
                    var operationId =
                        gData[$(me).attr("param-rowIndex")].operationId;
                    var operationId2 = gData[$(me).attr("param-rowIndex")]
                        .operationId2
                        ? "|" + gData[$(me).attr("param-rowIndex")].operationId2
                        : "";

                    var params = {
                        compfil: globalSettings.compfil,
                        operationId: operationId + operationId2,
                        frhtId: ""
                    };

                    var paramString = $.param(params);
                    var PTD_URL =
                        "/app/site/hosting/scriptlet.nl?script=customscript_apm_ptd_sl_main&deploy=customdeploy_apm_ptd_sl_main";
                    window.open(PTD_URL + "&" + paramString);
                    return;
                });
                rows.find(".apm-pts-viewprofilerdetails-icon").click(
                    function () {
                        var globalSettings = APMPTS.Services.getGlobalSettings();
                        var me = this;
                        var operationId =
                            gData[$(me).attr("param-rowIndex")].operationId;
                        var operationId2 = gData[$(me).attr("param-rowIndex")]
                            .operationId2
                            ? "|" +
                              gData[$(me).attr("param-rowIndex")].operationId2
                            : "";

                        var params = {
                            compfil: globalSettings.compfil,
                            operationId: operationId + operationId2,
                            frhtId: ""
                        };

                        var paramString = $.param(params);
                        var PRF_URL =
                            "/app/site/hosting/scriptlet.nl?script=customscript_apm_prf_sl_main&deploy=customdeploy_apm_prf_sl_main";
                        window.open(PRF_URL + "&" + paramString);
                        return;
                    }
                );

                grid.element.find("tbody tr:first").trigger("click");
            }
        }
    };
    var $DetailsGrid = $('<div class="apm-pts-grid-details">').psgpGrid(
        detailsGrid
    );
    var $PerfLogDetailsContainer = $(
        '<div class="apm-pts-details-container"></div>'
    );
    $PerfLogDetailsContainer.append($DetailsGrid);

    $DetailsSubPanel
        .psgpSubPanel("getBody")
        .append($("<div>").psgpSpacer({ height: 15 }))
        .append($PerfLogDetailsContainer);

    $PerformanceLogsPortlet
        .psgpPortlet("getBody")
        .append($SummarySubPanel)
        .append($DetailsSubPanel);

    /*
     * Script/Workflow Time Breakdown Portlet
     */
    var $ScriptWorkflowPortlet = $("<div>").psgpPortlet({
        title: APMTranslation.apm.r2020a.scriptandworkflowtimebreakdown(),
        helpLink : { hover : APMTranslation.apm.r2019a.moreinformation(), link: '/app/help/helpcenter.nl?fid=section_4304062976.html' },
    });
    var $ChartContainer = $(
        '<div class="apm-pts-scriptworkflow-container"></div>'
    );
    var $Chart = $('<div class="chart"></div>');

    //Preserve markup indention
    //prettier-ignore
    var $NoDataAvailable = $(
            '<div class="apm-pts-no-data-container">' +
                '<div class="chart-warning"></div>' +
                '<div class="label">' + APMTranslation.apm.r2020a.datafromyouraccountisnotavailablefordisplay() + '</div>' +
            '</div>'
        );

    var $SsDetailsSubPanel = $('<div class="apm-pts-subpanel">').psgpSubPanel({
        title: APMTranslation.apm.pts.label.details()
    });

    var ssDetailsGrid = {
        paging: false,
        columns: [
            {
                dataIndex: "script",
                text: APMTranslation.apm.common.label.name(),
                renderer: function (value, record) {
                    var script = value;
                    var url = record.scriptwfurl;

                    if (url != "" && url != undefined) {
                        script =
                            '<a href="' +
                            url +
                            '" target="_blank" class="apm-a">' +
                            value +
                            "</a>";
                    }

                    var markUp =
                        '<div class="apm-pts-ssdetails-grid-script">' +
                        '<div class="icon" style="background-color:' +
                        record.color +
                        '"></div>' +
                        script +
                        "</div>";
                    return markUp;
                }
            },
            {
                dataIndex: "totaltime",
                text: APMTranslation.apm.common.label.responsetime()
            },
            {
                dataIndex: "bundle",
                text: APMTranslation.apm.r2020a.suiteapp()
            }
        ],
        listeners: {
            afterRefreshData: function (grid) {}
        }
    };
    var $SsDetailsGrid = $('<div class="apm-pts-grid-ssdetails">').psgpGrid(
        ssDetailsGrid
    );

    $ChartContainer.append($Chart).append($NoDataAvailable);

    $SsDetailsSubPanel.psgpSubPanel("getBody").append($SsDetailsGrid);

    $ScriptWorkflowPortlet
        .psgpPortlet("getBody")
        .append($ChartContainer)
        .append($SsDetailsSubPanel);

    /*
     * Section Column Layout
     */
    var $SectionColumnPanel = $("<div>").psgpColumnPanel({
        columndef: [
            {
                width: "76%",
                padding: "10px 10px 0px 0px"
            },
            {
                width: "24%",
                padding: "10px 0px 0px 10px"
            }
        ]
    });
    $SectionColumnPanel
        .find(".psgp-column-panel-2")
        .append($ScriptWorkflowPortlet);
    $SectionColumnPanel
        .find(".psgp-column-panel-1")
        .append($PerformanceLogsPortlet);

    /*
     * Methods
     */
    function showSetupDialog() {
        $(".apm-pts-dialog-setup").dialog("destroy");

        //Preserve markup indention
        //prettier-ignore
        var $SetupDialog = $('' +
                '<div class="apm-pts-dialog-setup">' +
                    '<div class="buttons"><div class="btn-save"></div><div class="btn-cancel"></div><div class="btn-reset"></div></div>' +
                    '<div class="grid"></div>' +
                    '<div class="buttons"><div class="btn-save"></div><div class="btn-cancel"></div><div class="btn-reset"></div></div>' +
                '</div>'
            ).psgpDialog({
                title: APMTranslation.apm.pts.label.setupsummary(),
                width: 800,
                closeOnEscape: false,
                close: function(event, ui) {
                    //console.log('close');
                }
            });
        $SetupDialog
            .parents(".ui-dialog")
            .find(".ui-dialog-titlebar-close")
            .click(function () {
                var me = this;
                var $dialog = $(me).parents(".ui-dialog");
                var $btnCancel = $dialog.find(".btn-cancel");
                $btnCancel.find(".psgp-btn-default").click();
            });
        $SetupDialog.find(".btn-save").psgpBlueButton({
            text: APMTranslation.apm.common.label.save(),
            handler: function () {
                var params = {};
                for (var i = 0; i < index; i++) {
                    globalSummarySetup.data[i].show = $("#checkbox" + i).is(
                        ":checked"
                    )
                        ? "T"
                        : "F";
                    params[globalSummarySetup.data[i].key] =
                        globalSummarySetup.data[i].show;
                }
                APMPTS.Services.saveSummarySetup(params);
                APMPTS.Services.updateSummaryGrid();

                var me = this;
                var $dialog = $(me).parents(".apm-pts-dialog-setup");
                $dialog.dialog("close");
            }
        });
        $SetupDialog.find(".btn-cancel").psgpGrayButton({
            text: APMTranslation.apm.common.button.cancel(),
            handler: function () {
                var me = this;
                var $dialog = $(me).parents(".apm-pts-dialog-setup");
                $dialog.dialog("close");
            }
        });
        $SetupDialog.find(".btn-reset").psgpBlueButton({
            text: APMTranslation.apm.common.button.reset(),
            handler: function () {
                for (var i = 0; i < index; i++) {
                    $("#checkbox" + i).prop("checked", true);
                }
            }
        });

        var index = 0;
        var globalSummarySetup = APMPTS.Services.getGlobalSummarySetup();
        var setupGrid = {
            paging: false,
            columns: [
                {
                    dataIndex: "name",
                    text: APMTranslation.apm.pts.label.columnname(),
                    sortable: false,
                    width: 165
                },
                {
                    dataIndex: "description",
                    text: APMTranslation.apm.pts.label.description(),
                    sortable: false,
                    width: 453
                },
                {
                    dataIndex: "show",
                    text: APMTranslation.apm.pts.label.show(),
                    sortable: false,
                    width: 113,
                    renderer: function (value, record) {
                        var checked = value == "T" ? "checked" : "";

                        //Preserve markup indention
                        //prettier-ignore
                        var $markUp = $('<div align="center" class="setup-checkbox">' +
                                                '<input type="checkbox" id="checkbox' + index + '" ' + checked + '>' +
                                            '</div>');
                        index++;
                        return $markUp.html();
                    }
                }
            ],
            listeners: {
                afterRefreshData: function (grid) {}
            }
        };

        $SetupDialog.find(".grid").psgpGrid(setupGrid);
        $SetupDialog.parents(".ui-dialog").css({
            position: "absolute",
            top:
                ($(window).height() -
                    $SetupDialog.parents(".ui-dialog").height()) /
                    2 +
                $(window).scrollTop() +
                "px",
            left:
                ($(window).width() -
                    $SetupDialog.parents(".ui-dialog").width()) /
                    2 +
                $(window).scrollLeft() +
                "px"
        });
        $SetupDialog
            .find(".grid")
            .psgpGrid("refreshData", APMPTS.Services.getGlobalSummarySetup());
    }

    function updateDateTimeField($DateTime, date, time) {
        $DateTime.psgpDateTimeField("setDateValue", new Date(date));
        $DateTime.psgpDateTimeField("setTimeValue", time);
    }

    function updateSummarySidePanelDetails(data) {
        var recordtype = data.recordtype
            ? APMPTS.Services.getRecordName(data.recordtype)
            : "0";
        var operation = data.operation
            ? $OperationFilter.find(".psgp-combobox").find(":selected").text()
            : "";
        var logsTotal = data.logsTotal ? data.logsTotal : "0";
        var usersTotal = data.usersTotal ? data.usersTotal : "0";

        $(".summary-side-panel .content .recordtype").html(recordtype);
        $(".summary-side-panel .content .operation").html(operation);
        $(".summary-side-panel .content .numberoflogs").html(logsTotal);
        $(".summary-side-panel .content .user").html(usersTotal);
    }

    return {
        $SuiteAppNote: $SuiteAppNote,
        $TitleBar: $TitleBar,
        $BtnRefresh: $BtnRefresh,
        $FilterPanel: $FilterPanel,
        $RecordTypeFilter: $RecordTypeFilter,
        $OperationFilter: $OperationFilter,
        $StartDateTimeFilter: $StartDateTimeFilter,
        $EndDateTimeFilter: $EndDateTimeFilter,
        $PerformanceLogsPortlet: $PerformanceLogsPortlet,
        $SummaryColumnPanel: $SummaryColumnPanel,
        $SummaryGrid: $SummaryGrid,
        $DetailsGrid: $DetailsGrid,
        $ScriptWorkflowPortlet: $ScriptWorkflowPortlet,
        $NoDataAvailable: $NoDataAvailable,
        $Chart: $Chart,
        $ChartContainer: $ChartContainer,
        $SsDetailsGrid: $SsDetailsGrid,
        $SectionColumnPanel: $SectionColumnPanel,
        $CustomerDebuggingDialog: $CustomerDebuggingDialog,
        updateSummarySidePanelDetails: updateSummarySidePanelDetails,
        updateDateTimeField: updateDateTimeField
    };
};
