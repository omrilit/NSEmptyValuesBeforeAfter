/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       07 Jan 2015     jmarimla         Initial
 * 2.00       15 Jan 2015     jmarimla         Enable update for carousel and record tiles data
 * 3.00       28 Jan 2015     jmarimla         Enable record tile selection
 * 4.00       07 Mar 2015     jmarimla         Added components for record pages toolbar
 * 5.00       10 Mar 2015     rwong            Added components for setup record pages
 * 6.00       11 Mar 2015     rwong            Added check for more than 10 records in the watchlist.
 *                                             TODO: Add check for duplicate data entry in watchlist
 * 7.00       12 Mar 2015     jmarimla         Added refresh after save of watchlist
 * 8.00       16 Mar 2015     jmarimla         Remove page reset in updateData of carousel
 * 9.00       21 Mar 2015     jmarimla         New UI for record tiles
 * 10.00      22 Mar 2015     jmarimla         Exact search in record types
 * 11.00      21 Apr 2015     jmarimla         UI for setup tabs and setup histogram interval
 * 12.00      23 Apr 2015     rwong            Updated code for watchlist and custom date time
 * 13.00      27 Apr 2015     jmarimla         Changed formatting of dates in custom date & time set up
 * 14.00      28 Apr 2015     jmarimla         Add cancel button minor ui changes for addwatchlist and addcustomdate windows
 * 15.00      29 Apr 2015     jmarimla         Adjusted width of sorting dropdown
 * 16.00      19 May 2015     jmarimla         Add component id
 * 17.00      01 Jul 2015     jmarimla         Updated loading masks
 * 18.00      23 Jul 2015     jmarimla         Move sorting inside updateData function
 * 19.00      25 Aug 2015     jmarimla         Defined comp id dropdown
 * 20.00      28 Aug 2015     jmarimla         Compid mode ui changes
 * 21.00      10 Sep 2015     jmarimla         Add setup option for record tiles
 * 22.00      12 Oct 2015     jmarimla         Date range validation
 * 23.00      21 Oct 2015     jmarimla         Remove page when zero record tiles
 * 24.00      05 Nov 2015     jmarimla         Define personalize panel; Added remove portlet option
 * 25.00      03 Dec 2015     rwong            Fixed for incorrect offset during DST
 * 26.00      21 Dec 2015     rwong            Added export functionality to the record pages portlet
 * 27.00      06 Jan 2015     jmarimla         Hide 'remove portlet'; Added 'General' section in set up
 * 28.00      29 Jun 2018     jmarimla         Translation readiness
 * 29.00      06 Jul 2018     jmarimla         Polishing translation
 * 30.00      26 Jul 2018     jmarimla         Translation string
 * 31.00      02 Oct 2019     erepollo         Fixed 'as of date' alignment issue in chrome
 * 32.00      10 Jan 2020     jmarimla         Customer debug changes
 * 33.00      30 Jul 2020     jmarimla         r2020a strings
 * 34.00      11 Aug 2020     earepollo        ExtJS to jQuery
 * 35.00      20 Aug 2020     lemarcelo        ExtJS to jQuery - Setup
 * 36.00      19 Oct 2020     earepollo        Fixed bug in record types
 * 37.00      19 Nov 2020     lemarcelo        Added help link and icon
 * 38.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 *
 */

APMRPM = APMRPM || {};

APMRPM._Components = function () {

    var $SuiteAppNote = $("<div>").psgpNewSuiteAppNote();

    var $TitleBar = $("<div>").psgpSuiteletTitle({
        title: APMTranslation.apm.r2020a.recordpagesmonitor()
    });

    /*
     * Customer Debugging
     */
    //Preserve markup indention
    //prettier-ignore
    var $CustomerDebuggingDialog = $('' +
        '<div class="apm-rpm-dialog-custdebug">' +
            '<div class="container-field-customer"><span class="psgp-field-label">' + APMTranslation.apm.common.label.companyid() + '</span><div class="field-customer"></div></div>' +
            '<div class="buttons"><div class="btn-save"></div><div class="btn-cancel"></div></div>' +
        '</div>')
        .psgpSettingsDialog({
            width: 240
        });

    $CustomerDebuggingDialog.find(".field-customer").psgpTextBox({
        width: 160
    });

    $CustomerDebuggingDialog.find(".btn-save").psgpBlueButton({
        text: APMTranslation.apm.r2020a.apply(),
        handler: function () {
            var me = this;
            var globalSettings = APMRPM.Services.getGlobalSettings();
            var $dialog = $(me).parents(".apm-rpm-dialog-custdebug");
            $dialog.dialog("close");

            var compfil = $dialog.find(".field-customer .psgp-textbox").val();

            globalSettings.compfil = compfil.trim();
            globalSettings.endDateMS = "" + new Date().setSeconds(0, 0);

            APMRPM.Services.refreshRecordTypesData();
            APMRPM.Services.refreshTilesData();
        }
    });

    $CustomerDebuggingDialog.find(".btn-cancel").psgpGrayButton({
        text: APMTranslation.apm.common.button.cancel(),
        handler: function () {
            var me = this;
            var globalSettings = APMRPM.Services.getGlobalSettings();
            var $dialog = $(me).parents(".apm-rpm-dialog-custdebug");
            $dialog.dialog("close");

            var oldCompfil = globalSettings.compfil;
            $dialog.find(".field-customer .psgp-textbox").val(oldCompfil);
        }
    });

    var $CustomerDebuggingLabel = $("<div>")
        .addClass("apm-rpm-settings-custdebug")
        .psgpSuiteletSettings({
            label: APMTranslation.apm.common.label.customerdebugsettings(),
            $dialog: $CustomerDebuggingDialog
        });

    $CustomerDebuggingDialog
        .find(".field-customer .psgp-textbox")
        .val(RPM_PARAMS.compfil);

    if (RPM_PARAMS.debugMode) {
        $TitleBar.append($CustomerDebuggingLabel);
    }

    /*
     * Setup Dialogs
     */
    // SETUP DIALOG CONTROLS
    var _setupData = {
        chartpref: {},
        watchlist: {},
        daterange: {}
    };

    //Preserve markup indention
    //prettier-ignore
    var $SetupDialog = $('' +
        '<div class="apm-rpm-dialog-setup">' +
            '<div class="buttons"><div class="btn-save"></div><div class="btn-cancel"></div><div class="btn-reset"></div></div>' +
            '<div class="setup-info">' +
                '<div class="apm-rpm-info"></div>' +
                '<div class="text" style="text-transform:uppercase">' + APMTranslation.apm.r2019a.moreinformation() + '</div>' +
            '</div>' +
            '<div class="tab-section">' +
                '<div class="tabs"></div>' +
            '</div>' +
            '<div class="chartpref-container">' +
                '<div class="chartpref-section-title">' + APMTranslation.apm.r2020a.executiontimedistribution() +'</div>' +
                '<div class="executiontime-container">' +
                    '<div class="apm-rpm-setup-label">' + APMTranslation.apm.db.setup.interval() + '</div>' +
                    '<div class="executiontime-value" id="executiontime"></div>' +
                '</div>'+
                '<div class="chartpref-section-title">' + APMTranslation.apm.db.label.general() +'</div>' +
                '<div class="general-container">' +
                    '<div class="apm-rpm-setup-label">' + APMTranslation.apm.db.label.recordtiles() + '</div>' +
                    '<div class="general-value"></div>' +
                '</div>' +
            '</div>' +
            '<div class="tab-contents-container"></div>' +
            '<div class="buttons"><div class="btn-save"></div><div class="btn-cancel"></div><div class="btn-reset"></div></div>' +
        '</div>'
    ).psgpDialog({
        title: APMTranslation.apm.db.label.setuprecordpages(),
        width: 800,
        minHeight: 495,
        autoOpen: false,
        closeOnEscape: false,
        close: function(event, ui) {
            //console.log('close');
        }
    });

    $SetupDialog.find('.apm-rpm-info').click(function() {
        var helpUrl = '/app/help/helpcenter.nl?fid=section_4303424058.html';
        window.open(helpUrl);
    });

    $SetupDialog.find(".executiontime-value").psgpNumberBox({
        width: 50,
        allowDecimal: false
    });

    $SetupDialog.find(".general-value").psgpComboBox({
        list: [
            {
                name: APMTranslation.apm.db.label.showallrecordtiles(),
                id: "all"
            },
            {
                name: APMTranslation.apm.db.label.showwatchlistonly(),
                id: "wlonly"
            }
        ],
        width: 165
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
            var histogramInterval = $SetupDialog
                .find(".executiontime-value .psgp-textbox")
                .val();
            var globalSetup = APMRPM.Services.getRPMSettings();
            //validation
            if (histogramInterval < 1) {
                alert(
                    APMTranslation.apm.r2020a.enteranumberthatisequalormorethan1()
                );
                return false;
            }

            var generalSetupParams = {
                histogramInterval: $SetupDialog
                    .find(".executiontime-value .psgp-textbox")
                    .val(),
                recordTiles: $SetupDialog
                    .find(".general-value")
                    .find(".psgp-combobox")
                    .val()
            };

            globalSetup.chartpref = generalSetupParams;

            var deleteRecordPagesParams = [];
            var addRecordPagesParams = [];
            var deleteDateRangeParams = [];
            var addDateRangeParams = [];

            if (_setupData.watchlist.data) {
                for (var i = 0; i < _setupData.watchlist.data.length; i++) {
                    if (
                        _setupData.watchlist.data[i].request == "delete" &&
                        _setupData.watchlist.data[i].internalid != null
                    ) {
                        deleteRecordPagesParams.push({
                            internalid: _setupData.watchlist.data[i].internalid
                        });
                    }
                }

                for (var i = 0; i < _setupData.watchlist.data.length; i++) {
                    if (_setupData.watchlist.data[i].request == "post") {
                        addRecordPagesParams.push({
                            recordtype: _setupData.watchlist.data[i].recordtype,
                            operation: _setupData.watchlist.data[i].operation
                        });
                    }
                }
            }

            var dateRangeData = [];
            if (_setupData.daterange.data) {
                dateRangeData = _setupData.daterange.data
                    .slice()
                    .filter((val) => val.request != "delete");
                for (var i = 0; i < _setupData.daterange.data.length; i++) {
                    if (
                        _setupData.daterange.data[i].request == "delete" &&
                        _setupData.daterange.data[i].internalid != null
                    ) {
                        deleteDateRangeParams.push({
                            internalid: _setupData.daterange.data[i].internalid
                        });
                    }
                }

                for (var i = 0; i < _setupData.daterange.data.length; i++) {
                    if (_setupData.daterange.data[i].request == "post") {
                        addDateRangeParams.push({
                            startdate: _setupData.daterange.data[i].startdate,
                            starttime: _setupData.daterange.data[i].starttime,
                            enddate: _setupData.daterange.data[i].enddate,
                            endtime: _setupData.daterange.data[i].endtime
                        });
                    }
                }
            }

            var me = this;
            var $dialog = $(me).parents(".apm-rpm-dialog-setup");
            $dialog.dialog("close");

            var params = {
                generalSetupParams: generalSetupParams,
                deleteRecordPagesParams: deleteRecordPagesParams,
                addRecordPagesParams: addRecordPagesParams,
                deleteDateRangeParams: deleteDateRangeParams,
                addDateRangeParams: addDateRangeParams,
                dateRangeData: dateRangeData
            };
            APMRPM.Services.saveSetupData(params);
        }
    });
    $SetupDialog.find(".btn-cancel").psgpGrayButton({
        text: APMTranslation.apm.common.button.cancel(),
        handler: function () {
            var me = this;
            var $dialog = $(me).parents(".apm-rpm-dialog-setup");
            $dialog.dialog("close");
        }
    });
    $SetupDialog.find(".btn-reset").psgpBlueButton({
        text: APMTranslation.apm.common.button.reset(),
        handler: function () {
            var chartPrefData = APMRPM.Services.getRPMSettings().chartpref;
            if (chartPrefData != null || chartPrefData != undefined) {
                $SetupDialog
                    .find(".executiontime-value .psgp-textbox")
                    .val(chartPrefData.histogramInterval);
                $SetupDialog
                    .find(".general-value")
                    .find(".psgp-combobox")
                    .val(chartPrefData.recordTiles);
                $SetupDialog
                    .find(".general-value")
                    .find(".psgp-combobox")
                    .selectmenu("refresh");
            }

            $WatchListContainer
                .find(".grid")
                .psgpGrid(
                    "refreshData",
                    APMRPM.Services.getRPMSettings().watchlist
                );
            $CustomDateTimeContainer
                .find(".grid")
                .psgpGrid(
                    "refreshData",
                    APMRPM.Services.getRPMSettings().daterange
                );

            _setupData = JSON.parse(
                JSON.stringify(APMRPM.Services.getRPMSettings())
            );
        }
    });

    /***** SETUP TABS *****/
    var $SetupTabs = $SetupDialog.find(".tabs").psgpTabs({
        prefixId: "apm-rpm-setup-tab-",
        labels: [
            APMTranslation.apm.db.label.chartpreferences(),
            APMTranslation.apm.db.label.watchlist(),
            APMTranslation.apm.db.label.customdatetime()
        ],
        width: 800,
        listeners: {
            tabsActivate: function (event, ui) {
                $SetupDialog.find(".chartpref-container").hide();
                $WatchListContainer.detach();
                $CustomDateTimeContainer.detach();

                var $tab = $(event.target);
                var newTabIndex = $tab.tabs("option", "active");

                switch (newTabIndex) {
                    case 0:
                        $SetupDialog.find(".chartpref-container").show();
                        break;
                    case 1:
                        $SetupDialog
                            .find(".tab-contents-container")
                            .append($WatchListContainer);
                        break;
                    case 2:
                        $SetupDialog
                            .find(".tab-contents-container")
                            .append($CustomDateTimeContainer);
                        break;
                }
            }
        }
    });

    /***** WATCH LIST *****/
    //Preserve markup indention
    //prettier-ignore
    var $WatchListContainer = $(
        '<div class="apm-rpm-watchlist-container">' +
            '<div class="watchlist-buttons"><div class="btn-add-watchlist"></div><div class="btn-remove-all"></div></div>' +
            '<div class="grid"></div>' +
        '</div>'
    );

    $WatchListContainer.find(".btn-add-watchlist").psgpGrayButton({
        text: APMTranslation.apm.r2020a.addwatchlistitem(),
        handler: function () {
            var $dialog = $AddWatchListDialog;
            $dialog.dialog("open");

            $dialog.parents(".ui-dialog").css({
                position: "absolute",
                top:
                    ($(window).height() -
                        $dialog.parents(".ui-dialog").height()) /
                        2 +
                    $(window).scrollTop() +
                    "px",
                left:
                    ($(window).width() -
                        $dialog.parents(".ui-dialog").width()) /
                        2 +
                    $(window).scrollLeft() +
                    "px"
            });
            var recordtypelist = APMRPM.Services.getRecordTypes();
            if (recordtypelist && recordtypelist.length > 0) {
                $AddWatchListDialog
                    .find(".filter-recordtype")
                    .find("option")
                    .remove();
                var optionsMarkUp = "";
                for (var i in recordtypelist) {
                    var customValue = recordtypelist[i].id;
                    var customLabel = recordtypelist[i].name;
                    var markUp =
                        '<option value="' +
                        customValue +
                        '">' +
                        customLabel +
                        "</option>";
                    optionsMarkUp += markUp;
                }
                $AddWatchListDialog
                    .find(".filter-recordtype")
                    .find("select")
                    .append(optionsMarkUp);
                $AddWatchListDialog
                    .find(".filter-recordtype")
                    .find(".psgp-combobox")
                    .val(recordtypelist[0].id);
                $AddWatchListDialog
                    .find(".filter-recordtype")
                    .find(".psgp-combobox")
                    .selectmenu("refresh");
            } else {
                $AddWatchListDialog
                    .find(".filter-recordtype")
                    .find("option")
                    .remove();
                $AddWatchListDialog
                    .find(".filter-recordtype")
                    .find("select")
                    .append('<option value="' + "" + '">' + "" + "</option>");
                $AddWatchListDialog
                    .find(".filter-recordtype")
                    .find(".psgp-combobox")
                    .val("");
                $AddWatchListDialog
                    .find(".filter-recordtype")
                    .find(".psgp-combobox")
                    .selectmenu("refresh");
            }
        }
    });
    $WatchListContainer.find(".btn-remove-all").psgpGrayButton({
        text: APMTranslation.apm.db.label.removeall(),
        handler: function () {
            if (_setupData.watchlist.data) {
                for (var i = 0; i < _setupData.watchlist.data.length; i++) {
                    _setupData.watchlist.data[i].request = "delete";
                }
                var emptyData = { data: [] };
                $WatchListContainer
                    .find(".grid")
                    .psgpGrid("refreshData", emptyData);
            }
        }
    });

    var watchlistGrid = {
        paging: false,
        columns: [
            {
                dataIndex: "recordtype",
                text: APMTranslation.apm.common.label.recordtype(),
                sortable: false,
                width: 395,
                renderer: function (value, record) {
                    var recordName = APMRPM.Services.getRecordName(value);
                    var markUp = "<div>" + recordName + "</div>";
                    return markUp;
                }
            },
            {
                dataIndex: "operation",
                text: APMTranslation.apm.common.label.operation(),
                sortable: false,
                width: 165
            },
            {
                dataIndex: "actioncolumn",
                sortable: false,
                width: 113,
                renderer: function (value, record) {
                    var $markUp = $(
                        '<div align="center"><div class="rpm-setup-delete-icon"></div></div>'
                    );
                    return $markUp.html();
                }
            }
        ],
        listeners: {
            afterRefreshData: function (grid, response) {
                var rows = grid.element.find("tbody tr");
                var gData = grid.options.data;

                rows.each(function (index) {
                    var me = this;
                    $(me)
                        .find(".rpm-setup-delete-icon")
                        .attr("param-rowIndex", $(this).index());
                });

                rows.find(".rpm-setup-delete-icon").click(function () {
                    var data = gData[$(this).attr("param-rowIndex")];
                    for (var i = 0; i < _setupData.watchlist.data.length; i++) {
                        if (
                            _setupData.watchlist.data[i].internalid ==
                                undefined &&
                            data.recordtype ==
                                _setupData.watchlist.data[i].recordtype &&
                            data.operation ==
                                _setupData.watchlist.data[i].operation
                        ) {
                            _setupData.watchlist.data.splice(i, 1);
                            break;
                        } else if (
                            data.internalid ==
                                _setupData.watchlist.data[i].internalid &&
                            data.recordtype ==
                                _setupData.watchlist.data[i].recordtype &&
                            data.operation ==
                                _setupData.watchlist.data[i].operation
                        ) {
                            _setupData.watchlist.data[i].request = "delete";
                            break;
                        }
                    }
                    if ($(this).closest("tbody").find("tr").length == 1) {
                        var emptyData = { data: [] };
                        $WatchListContainer
                            .find(".grid")
                            .psgpGrid("refreshData", emptyData);
                    } else {
                        $(this).closest("tr").remove();
                    }

                    return;
                });
            }
        }
    };
    $WatchListContainer.find(".grid").psgpGrid(watchlistGrid);

    /***** CUSTOM DATE AND TIME *****/
    //Preserve markup indention
    //prettier-ignore
    var $CustomDateTimeContainer = $(
        '<div class="apm-rpm-customdatetime-container">' +
            '<div class="customdatetime-buttons"><div class="btn-add-datetime"></div><div class="btn-remove-all"></div></div>' +
            '<div class="grid"></div>' +
        '</div>'
    );

    $CustomDateTimeContainer.find(".btn-add-datetime").psgpGrayButton({
        text: APMTranslation.apm.r2020a.adddateandtime(),
        handler: function () {
            // $('.apm-rpm-dialog-customdaterange').dialog('destroy');
            var $dialog = $AddDateRangeDialog;
            $dialog.dialog("open");

            $dialog.parents(".ui-dialog").css({
                position: "absolute",
                top:
                    ($(window).height() -
                        $dialog.parents(".ui-dialog").height()) /
                        2 +
                    $(window).scrollTop() +
                    "px",
                left:
                    ($(window).width() -
                        $dialog.parents(".ui-dialog").width()) /
                        2 +
                    $(window).scrollLeft() +
                    "px"
            });
            var dateToday = new Date();
            var dateTomorrow = new Date(
                dateToday.getTime() + 24 * 60 * 60 * 1000
            );

            //set default date and time
            $AddDateRangeDialog
                .find(
                    ".field-startdatetime .psgp-field-datetime-date .psgp-date-picker"
                )
                .datepicker("setDate", dateToday);
            $AddDateRangeDialog
                .find(
                    ".field-startdatetime .psgp-field-datetime-time .psgp-combobox"
                )
                .val("00:00");
            $AddDateRangeDialog
                .find(
                    ".field-startdatetime .psgp-field-datetime-time .psgp-combobox"
                )
                .selectmenu("refresh");

            $AddDateRangeDialog
                .find(
                    ".field-enddatetime .psgp-field-datetime-date .psgp-date-picker"
                )
                .datepicker("setDate", dateTomorrow);
            $AddDateRangeDialog
                .find(
                    ".field-enddatetime .psgp-field-datetime-time .psgp-combobox"
                )
                .val("00:00");
            $AddDateRangeDialog
                .find(
                    ".field-enddatetime .psgp-field-datetime-time .psgp-combobox"
                )
                .selectmenu("refresh");
        }
    });
    $CustomDateTimeContainer.find(".btn-remove-all").psgpGrayButton({
        text: APMTranslation.apm.db.label.removeall(),
        handler: function () {
            if (_setupData.daterange.data) {
                for (var i = 0; i < _setupData.daterange.data.length; i++) {
                    _setupData.daterange.data[i].request = "delete";
                }
                var emptyData = { data: [] };
                $CustomDateTimeContainer
                    .find(".grid")
                    .psgpGrid("refreshData", emptyData);
            }
        }
    });

    var customDateTimeContainertGrid = {
        paging: false,
        columns: [
            {
                dataIndex: "startdate",
                text: APMTranslation.apm.common.label.startdate(),
                sortable: false,
                width: 155,
                renderer: function (value, record) {
                    var dateSplit = value.split("-");
                    var date =
                        dateSplit[1] + "/" + dateSplit[2] + "/" + dateSplit[0];

                    var $markUp = $("<div><div>" + date + "</div></div>");
                    return $markUp.html();
                }
            },
            {
                dataIndex: "starttime",
                text: APMTranslation.apm.db.label.starttime(),
                sortable: false,
                width: 155,
                renderer: function (value, record) {
                    if (value.split(":")[0] == 0) {
                        var convertedTime =
                            12 +
                            ":" +
                            value.split(":")[1] +
                            " " +
                            APMTranslation.apm.common.time.am();
                        var $markUp = $(
                            "<div><div>" + convertedTime + "</div></div>"
                        );
                    } else if (value.split(":")[0] > 12) {
                        var convertedTime =
                            (value.split(":")[0] % 12) +
                            ":" +
                            value.split(":")[1] +
                            " " +
                            APMTranslation.apm.common.time.pm();
                        var $markUp = $(
                            "<div><div>" + convertedTime + "</div></div>"
                        );
                    } else {
                        var convertedTime =
                            value + " " + APMTranslation.apm.common.time.am();
                        var $markUp = $(
                            "<div><div>" + convertedTime + "</div></div>"
                        );
                    }
                    return $markUp.html();
                }
            },
            {
                dataIndex: "enddate",
                text: APMTranslation.apm.common.label.enddate(),
                sortable: false,
                width: 155,
                renderer: function (value, record) {
                    var dateSplit = value.split("-");
                    var date =
                        dateSplit[1] + "/" + dateSplit[2] + "/" + dateSplit[0];

                    var $markUp = $("<div><div>" + date + "</div></div>");
                    return $markUp.html();
                }
            },
            {
                dataIndex: "endtime",
                text: APMTranslation.apm.db.label.endtime(),
                sortable: false,
                width: 155,
                renderer: function (value, record) {
                    if (value.split(":")[0] == 0) {
                        var convertedTime =
                            12 +
                            ":" +
                            value.split(":")[1] +
                            " " +
                            APMTranslation.apm.common.time.am();
                        var $markUp = $(
                            "<div><div>" + convertedTime + "</div></div>"
                        );
                    } else if (value.split(":")[0] > 12) {
                        var convertedTime =
                            (value.split(":")[0] % 12) +
                            ":" +
                            value.split(":")[1] +
                            " " +
                            APMTranslation.apm.common.time.pm();
                        var $markUp = $(
                            "<div><div>" + convertedTime + "</div></div>"
                        );
                    } else {
                        var convertedTime =
                            value + " " + APMTranslation.apm.common.time.am();
                        var $markUp = $(
                            "<div><div>" + convertedTime + "</div></div>"
                        );
                    }
                    return $markUp.html();
                }
            },
            {
                dataIndex: "actioncolumn",
                sortable: false,
                width: 90,
                renderer: function (value, record) {
                    // var $markUp = $('<div><div class="rpm-setup-delete-icon"></div></div>');
                    var $markUp = $(
                        '<div><div class="rpm-setup-delete-icon"></div></div>'
                    );
                    return $markUp.html();
                }
            }
        ],
        listeners: {
            afterRefreshData: function (grid, response) {
                var rows = grid.element.find("tbody tr");
                var gData = grid.options.data;

                rows.each(function (index) {
                    var me = this;
                    $(me)
                        .find(".rpm-setup-delete-icon")
                        .attr("param-rowIndex", $(this).index());
                });

                rows.find(".rpm-setup-delete-icon").click(function () {
                    var data = gData[$(this).attr("param-rowIndex")];
                    for (var i = 0; i < _setupData.daterange.data.length; i++) {
                        if (
                            _setupData.daterange.data[i].internalid ==
                                undefined &&
                            data.startdate ==
                                _setupData.daterange.data[i].startdate &&
                            data.starttime ==
                                _setupData.daterange.data[i].starttime &&
                            data.enddate ==
                                _setupData.daterange.data[i].enddate &&
                            data.endtime == _setupData.daterange.data[i].endtime
                        ) {
                            _setupData.daterange.data.splice(i, 1);
                            break;
                        } else if (
                            data.internalid ==
                                _setupData.daterange.data[i].internalid &&
                            data.startdate ==
                                _setupData.daterange.data[i].startdate &&
                            data.starttime ==
                                _setupData.daterange.data[i].starttime &&
                            data.enddate ==
                                _setupData.daterange.data[i].enddate &&
                            data.endtime == _setupData.daterange.data[i].endtime
                        ) {
                            _setupData.daterange.data[i].request = "delete";
                            break;
                        }
                    }
                    if ($(this).closest("tbody").find("tr").length == 1) {
                        var emptyData = { data: [] };
                        $CustomDateTimeContainer
                            .find(".grid")
                            .psgpGrid("refreshData", emptyData);
                    } else {
                        $(this).closest("tr").remove();
                    }

                    return;
                });
            }
        }
    };
    $CustomDateTimeContainer
        .find(".grid")
        .psgpGrid(customDateTimeContainertGrid);

    // ADD WATCHLIST DIALOG
    //Preserve markup indention
    //prettier-ignore
    var $AddWatchListDialog = $('' +
        '<div class="apm-rpm-dialog-watchlist">' +
            '<div><span class="psgp-field-label">' + APMTranslation.apm.common.label.recordtype() + '</span>' +
                '<div class="filter-recordtype"></div>' +
            '</div>' +
        '<div><span class="psgp-field-label">' + APMTranslation.apm.common.label.operation() + '</span>' +
            '<div class="watchlist-operator"></div>' +
        '</div>' +
        '<div class="buttons"><div class="btn-add"></div><div class="btn-cancel"></div></div>' +
        '</div>'
    ).psgpDialog({
        title: APMTranslation.apm.r2020a.addwatchlistitem(),
        autoOpen: false,
        closeOnEscape: false,
        close: function(event, ui) {
            //console.log('close');
        }
    });

    $AddWatchListDialog.parents(".ui-dialog").css({
        position: "absolute",
        top:
            ($(window).height() -
                $AddWatchListDialog.parents(".ui-dialog").height()) /
                2 +
            $(window).scrollTop() +
            "px",
        left:
            ($(window).width() -
                $AddWatchListDialog.parents(".ui-dialog").width()) /
                2 +
            $(window).scrollLeft() +
            "px"
    });

    $AddWatchListDialog
        .parents(".ui-dialog")
        .find(".ui-dialog-titlebar-close")
        .click(function () {
            var me = this;
            var $dialog = $(me).parents(".ui-dialog");
            var $btnCancel = $dialog.find(".btn-cancel");
            $btnCancel.find(".psgp-btn-default").click();
        });

    $AddWatchListDialog.find(".filter-recordtype").psgpComboBox({
        list: [],
        width: 250
    });

    $AddWatchListDialog.find(".watchlist-operator").psgpComboBox({
        list: [
            { name: APMTranslation.apm.common.label.view(), id: "v" },
            { name: APMTranslation.apm.common.label.edit(), id: "e" },
            { name: APMTranslation.apm.common.label.new(), id: "n" },
            { name: APMTranslation.apm.common.label.save(), id: "s" }
        ],
        width: 150
    });

    $AddWatchListDialog
        .parents(".ui-dialog")
        .find(".ui-dialog-titlebar-close")
        .click(function () {
            var me = this;
            var $dialog = $(me).parents(".ui-dialog");
            var $btnCancel = $dialog.find(".btn-cancel");
            $btnCancel.find(".psgp-btn-default").click();
        });

    $AddWatchListDialog.find(".btn-add").psgpBlueButton({
        text: APMTranslation.apm.ns.common.add(),
        handler: function () {
            var rectype = $AddWatchListDialog
                .find(".filter-recordtype")
                .find(".psgp-combobox")
                .val();
            var operator = "";
            switch (
                $AddWatchListDialog
                    .find(".watchlist-operator")
                    .find(".psgp-combobox")
                    .val()
            ) {
                case "v":
                    operator = "view";
                    break;
                case "e":
                    operator = "edit";
                    break;
                case "n":
                    operator = "new";
                    break;
                case "s":
                    operator = "save";
                    break;
            }
            var duplicate = false;
            if (_setupData.watchlist.data) {
                for (var i = 0; i < _setupData.watchlist.data.length; i++) {
                    if (
                        _setupData.watchlist.data[i].recordtype == rectype &&
                        _setupData.watchlist.data[i].operation == operator &&
                        (_setupData.watchlist.data[i].request == "post" ||
                            (_setupData.watchlist.data[i].request ==
                                undefined &&
                                _setupData.watchlist.data[i].internalid))
                    ) {
                        duplicate = true;
                        break;
                    }
                }
            }
            if (duplicate) {
                alert(
                    APMTranslation.apm.r2020a.therecordtypeoroperationisalreadyinthelist()
                );
                return;
            } else {
                if (!_setupData.watchlist.data) {
                    _setupData.watchlist.data = [];
                }
                _setupData.watchlist.data.push({
                    recordtype: rectype,
                    operation: operator,
                    request: "post"
                });
            }

            var gridData = { data: [] };
            for (var i = 0; i < _setupData.watchlist.data.length; i++) {
                if (_setupData.watchlist.data[i].request != "delete") {
                    gridData.data.push(_setupData.watchlist.data[i]);
                }
            }
            $WatchListContainer.find(".grid").psgpGrid("refreshData", gridData);
            var me = this;
            var $dialog = $(me).parents(".apm-rpm-dialog-watchlist");
            $dialog.dialog("close");
        }
    });

    $AddWatchListDialog.find(".btn-cancel").psgpGrayButton({
        text: APMTranslation.apm.common.button.cancel(),
        handler: function () {
            var me = this;
            var $dialog = $(me).parents(".apm-rpm-dialog-watchlist");
            $dialog.dialog("close");
        }
    });

    // ADD DATE RANGE DIALOG
    //Preserve markup indention
    //prettier-ignore
    var $AddDateRangeDialog = $('' +
        '<div class="apm-rpm-dialog-customdaterange">' +
            '<div class="field-startdatetime">' +
                '<div><span class="psgp-field-label">' + APMTranslation.apm.common.label.startdate() + '</span><div class="psgp-field-datetime-date" ></div></div>' +
                '<div><span class="psgp-field-label">' + APMTranslation.apm.db.label.starttime() + '</span><div class="psgp-field-datetime-time" ></div></div>' +
            '</div>' +
            '<div class="field-enddatetime">' +
                '<div><span class="psgp-field-label">' + APMTranslation.apm.common.label.enddate() + '</span><div class="psgp-field-datetime-date" ></div></div>' +
                '<div><span class="psgp-field-label">' + APMTranslation.apm.db.label.endtime() + '</span><div class="psgp-field-datetime-time" ></div></div>' +
            '</div>' +
            '<div class="buttons"><div class="btn-add"></div><div class="btn-cancel"></div></div>' +
        '</div>'
    ).psgpDialog({
        title: APMTranslation.apm.r2020a.adddateandtime(),
        width: 280,
        autoOpen: false,
        closeOnEscape: false,
        close: function(event, ui) {
            //console.log('close');
        }
    });
    $AddDateRangeDialog.parents(".ui-dialog").css({
        position: "absolute",
        top:
            ($(window).height() -
                $AddDateRangeDialog.parents(".ui-dialog").height()) /
                2 +
            $(window).scrollTop() +
            "px",
        left:
            ($(window).width() -
                $AddDateRangeDialog.parents(".ui-dialog").width()) /
                2 +
            $(window).scrollLeft() +
            "px"
    });
    $AddDateRangeDialog
        .parents(".ui-dialog")
        .find(".ui-dialog-titlebar-close")
        .click(function () {
            var me = this;
            var $dialog = $(me).parents(".ui-dialog");
            var $btnCancel = $dialog.find(".btn-cancel");
            $btnCancel.find(".psgp-btn-default").click();
        });
    $AddDateRangeDialog.find(".btn-add").psgpBlueButton({
        text: APMTranslation.apm.ns.common.add(),
        handler: function () {
            var adjustDate = function (date) {
                var ms = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
                var adjusted = new Date(ms);
                return adjusted.toISOString();
            };
            var startDate = $AddDateRangeDialog
                .find(
                    ".field-startdatetime .psgp-field-datetime-date .psgp-date-picker"
                )
                .datepicker("getDate");
            var endDate = $AddDateRangeDialog
                .find(
                    ".field-enddatetime .psgp-field-datetime-date .psgp-date-picker"
                )
                .datepicker("getDate");

            var sdate = adjustDate(startDate).substr(0, 10);
            var stime = $AddDateRangeDialog
                .find(
                    ".field-startdatetime .psgp-field-datetime-time .psgp-combobox"
                )
                .val();

            var edate = adjustDate(endDate).substr(0, 10);
            var etime = $AddDateRangeDialog
                .find(
                    ".field-enddatetime .psgp-field-datetime-time .psgp-combobox"
                )
                .val();

            //Validate date range
            var startDateObj = new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate(),
                stime.split(":", 2)[0],
                stime.split(":", 2)[1],
                0,
                0
            );
            var endDateObj = new Date(
                endDate.getFullYear(),
                endDate.getMonth(),
                endDate.getDate(),
                etime.split(":", 2)[0],
                etime.split(":", 2)[1],
                0,
                0
            );

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

            if (!_setupData.daterange.data) {
                _setupData.daterange.data = [];
            }

            _setupData.daterange.data.push({
                startdate: sdate,
                starttime: stime,
                enddate: edate,
                endtime: etime,
                request: "post"
            });

            var gridData = { data: [] };
            for (var i = 0; i < _setupData.daterange.data.length; i++) {
                if (_setupData.daterange.data[i].request != "delete") {
                    gridData.data.push(_setupData.daterange.data[i]);
                }
            }
            $CustomDateTimeContainer
                .find(".grid")
                .psgpGrid("refreshData", gridData);

            var me = this;
            var $dialog = $(me).parents(".apm-rpm-dialog-customdaterange");
            $dialog.dialog("close");
        }
    });
    $AddDateRangeDialog.find(".btn-cancel").psgpGrayButton({
        text: APMTranslation.apm.common.button.cancel(),
        handler: function () {
            var me = this;
            var $dialog = $(me).parents(".apm-rpm-dialog-customdaterange");
            $dialog.dialog("close");
        }
    });
    $AddDateRangeDialog
        .find(".field-startdatetime .psgp-field-datetime-date")
        .psgpDatePicker();
    $AddDateRangeDialog
        .find(".field-startdatetime .psgp-field-datetime-time")
        .psgpTimeComboBox();

    $AddDateRangeDialog
        .find(".field-enddatetime .psgp-field-datetime-date")
        .psgpDatePicker();
    $AddDateRangeDialog
        .find(".field-enddatetime .psgp-field-datetime-time")
        .psgpTimeComboBox();

    /*
     * Record Pages Portlet
     */
    var $RecordPagesPortletRefreshBtn = $("<div>").psgpPortletRefreshBtn({
        handler: function () {
            var globalSettings = APMRPM.Services.getGlobalSettings();
            globalSettings.endDateMS = "" + new Date().setSeconds(0, 0);

            APMRPM.Services.refreshTilesData();
        }
    });

    var $RecordPagesPortletMenuBtn = $("<div>").psgpPortletMenuBtn({
        items: [
            {
                text: APMTranslation.apm.common.label.setup(),
                handler: function () {
                    var $dialog = $SetupDialog;

                    var chartPrefData = APMRPM.Services.getRPMSettings()
                        .chartpref;
                    if (chartPrefData != null || chartPrefData != undefined) {
                        $SetupDialog
                            .find(".executiontime-value .psgp-textbox")
                            .val(chartPrefData.histogramInterval);
                        $SetupDialog
                            .find(".general-value")
                            .find(".psgp-combobox")
                            .val(chartPrefData.recordTiles);
                        $SetupDialog
                            .find(".general-value")
                            .find(".psgp-combobox")
                            .selectmenu("refresh");
                    }

                    $WatchListContainer
                        .find(".grid")
                        .psgpGrid(
                            "refreshData",
                            APMRPM.Services.getRPMSettings().watchlist
                        );
                    $CustomDateTimeContainer
                        .find(".grid")
                        .psgpGrid(
                            "refreshData",
                            APMRPM.Services.getRPMSettings().daterange
                        );
                    $SetupTabs.psgpTabs("selectTab", 0);

                    $dialog.dialog("open");

                    $dialog.parents(".ui-dialog").css({
                        position: "absolute",
                        top:
                            ($(window).height() -
                                $dialog.parents(".ui-dialog").height()) /
                                2 +
                            $(window).scrollTop() +
                            "px",
                        left:
                            ($(window).width() -
                                $dialog.parents(".ui-dialog").width()) /
                                2 +
                            $(window).scrollLeft() +
                            "px"
                    });
                    _setupData = JSON.parse(
                        JSON.stringify(APMRPM.Services.getRPMSettings())
                    );
                }
            },
            {
                text: APMTranslation.apm.db.label.export(),
                handler: function () {
                    var globalSettings = APMRPM.Services.getGlobalSettings();
                    var params = {
                        startDateMS: globalSettings.startDateMS,
                        endDateMS: globalSettings.endDateMS,
                        compfil: globalSettings.compfil
                    };
                    var paramString = $.param(params);
                    var REQUEST_URL =
                        "/app/site/hosting/scriptlet.nl?script=customscript_apm_rpm_sl_record_tile&deploy=customdeploy_apm_rpm_sl_record_tile&testmode=" +
                        TEST_MODE +
                        "&getcsv=T";
                    window.open(REQUEST_URL + "&" + paramString);
                }
            }
        ]
    });

    var $RecordPagesPortlet = $(
        '<div class="apm-rpm-recordpages-portlet">'
    ).psgpPortlet({
        title: APMTranslation.apm.db.label.recordpages(),
        helpLink : { hover : APMTranslation.apm.r2019a.moreinformation(), link: '/app/help/helpcenter.nl?fid=section_4302604339.html' },
        buttons: [$RecordPagesPortletRefreshBtn, $RecordPagesPortletMenuBtn]
    });

    /*
     * Record Pages Toolbar
     */
    var $RecordPagesToolbar = $(
        '<div class="apm-rpm-recordpages-toolbar"><div class="left"></div><div class="right"></div></div>'
    );

    var $RecordDateRangeComboBox = $(
        '<div class="combo-daterange"></div>'
    ).psgpComboBox({
        list: [],
        width: 280,
        change: function (event, ui) {
            var newValue = ui.item.value;
            var globalSettings = APMRPM.Services.getGlobalSettings();

            globalSettings.endDateMS = "" + new Date().setSeconds(0, 0);
            globalSettings.dateRangeSelect = "" + newValue;
        }
    });

    var $RecordSortCombobox = $('<div class="combo-sort"></div>').psgpComboBox({
        list: [
            {
                name: APMTranslation.apm.db.label.mostutilized(),
                id: "logsTotal"
            },
            {
                name: APMTranslation.apm.common.label.mostusers(),
                id: "usersTotal"
            },
            {
                name: APMTranslation.apm.db.label.highestresponsetime(),
                id: "totaltimeMed"
            },
            // {
            //     'name': 'Highest Delta From Baseline',
            //     'id': 'baselineMedPercent'
            // },
            {
                name: APMTranslation.apm.common.label.recordtype(),
                id: "recordName"
            },
            {
                name: APMTranslation.apm.common.label.operation(),
                id: "oper"
            }
        ],
        width: 200,
        change: function (event, ui) {
            var newValue = ui.item.value;

            var globalSettings = APMRPM.Services.getGlobalSettings();
            globalSettings.sorting = newValue;

            renderTiles();
            $RecordPagesCarousel.psgpCarousel("resetPagination");
            updatePagination();
        }
    });

    $RecordPagesToolbar
        .find(".left")
        .append($RecordDateRangeComboBox)
        .append('<div class="text-date"></div>');

    $RecordPagesToolbar
        .find(".right")
        .append(
            '<div class="label">' +
                APMTranslation.apm.common.label.sorting() +
                "</div>"
        )
        .append($RecordSortCombobox)
        .append('<div class="pagination"></div>');

    /*
     * Record Pages Carousel
     */
    var $RecordPagesCarousel = $(
        '<div class="apm-rpm-recordpages-carousel"></div>'
    ).psgpCarousel({
        contentArray: [],
        pageSize: 5
    });

    $RecordPagesCarousel.on("click", ".prev.btn", function () {
        updatePagination();
    });

    $RecordPagesCarousel.on("click", ".next.btn", function () {
        updatePagination();
    });

    $RecordPagesCarousel.on("click", ".apm-rpm-record-tile", function () {
        var $element = $(this);
        var tileData = $element.find(".main-tile").data("tileData");

        if (tileData.logsTotal > 0) {
            //unclick
            $.each($RecordTileArray, function (index, obj) {
                obj.removeClass("clicked");
            });
            $element.addClass("clicked");

            var recordName = APMRPM.Services.getRecordName(tileData.record);
            recordName = recordName ? recordName : tileData.record;
            var recordOperation = tileData.oper;

            switch (recordOperation) {
                case "new":
                    recordOperation = APMTranslation.apm.common.label.new();
                    break;
                case "edit":
                    recordOperation = APMTranslation.apm.common.label.edit();
                    break;
                case "save":
                    recordOperation = APMTranslation.apm.common.label.save();
                    break;
                case "view":
                    recordOperation = APMTranslation.apm.common.label.view();
                    break;
            }

            $RecordTileCharts.find(".record-name").text(recordName);
            $RecordTileCharts
                .find(".record-operation")
                .text(
                    recordOperation.charAt(0).toUpperCase() +
                        recordOperation.slice(1)
                );
            $RecordTileCharts.find('.tile .apm-rpm-info').prop('title', APMTranslation.apm.r2019a.moreinformation());
            $RecordTileCharts.find('.tile .apm-rpm-info').click(function() {
                var helpUrl = '/app/help/helpcenter.nl?fid=section_4303425856.html';
                window.open(helpUrl);
            });

            var globalSettings = APMRPM.Services.getGlobalSettings();
            var chartParams = {
                recordtype: tileData.record,
                oper: tileData.oper,
                startDateMS: globalSettings.startDateMS,
                endDateMS: globalSettings.endDateMS,
                compfil: globalSettings.compfil
            };

            APMRPM.Services.renderRecordCharts(chartParams);
        }
    });

    /*
     * Record Tile Charts
     */
    //Preserve markup indention
    //prettier-ignore
    var $RecordTileCharts = $(
        '<div class="apm-rpm-recordtile-charts">' +
            '<div class="tile">' +
                '<div class="record-name"></div>' +
                '<div class="record-operation"></div>' +
                '<div class="apm-rpm-info"></div>' +
            '</div>' +
            '<div class="chart-row">' +
                '<div class="chart-outer">' +
                    '<div class="chart execution"></div>' +
                '</div>' +
                '<div class="chart-outer">' +
                    '<div class="chart requests"></div>' +
                '</div>' +
            '</div>' +
            '<div class="chart-row">' +
                '<div class="chart-outer">' +
                    '<div class="chart context"></div>' +
                '</div>' +
                '<div class="chart-outer">' +
                    '<div class="chart histogram"></div>' +
                '</div>' +
            '</div>' +
        '</div>'
    ).hide();

    $RecordPagesPortlet
        .psgpPortlet("getBody")
        .append($RecordPagesToolbar)
        .append($RecordPagesCarousel)
        .append($RecordTileCharts);

    var $RecordTileArray = new Array();

    function renderTiles() {
        var globalSettings = APMRPM.Services.getGlobalSettings();
        var tilesData = APMRPM.Services.getTilesData();
        var configData = APMRPM.Services.getTilesConfig();
        var field = globalSettings.sorting;

        switch (field) {
            case "logsTotal":
            case "usersTotal":
            case "totaltimeMed":
            case "baselineMedPercent":
                tilesData.sort(function (a, b) {
                    //Descending
                    return b[field] - a[field];
                });
                break;
            case "recordName":
                tilesData.sort(function (a, b) {
                    var a_lowerCase = a["recordName"].toLowerCase();
                    var b_lowerCase = b["recordName"].toLowerCase();
                    var field1 = "";
                    var field2 = "";

                    //String comparison. Ascending recordName then ascending oper
                    if (a_lowerCase === b_lowerCase) {
                        field1 = 0;
                    } else if (typeof a_lowerCase === typeof b_lowerCase) {
                        field1 = a_lowerCase < b_lowerCase ? -1 : 1;
                    } else {
                        field1 =
                            typeof a_lowerCase < typeof b_lowerCase ? -1 : 1;
                    }

                    if (a.oper === b.oper) {
                        field2 = 0;
                    } else if (typeof a.oper === typeof b.oper) {
                        field2 = a.oper < b.oper ? -1 : 1;
                    } else {
                        field2 = typeof a.oper < typeof b.oper ? -1 : 1;
                    }

                    return field1 || field2;
                });
                break;
            case "oper":
                tilesData.sort(function (a, b) {
                    var a_lowerCase = a["recordName"].toLowerCase();
                    var b_lowerCase = b["recordName"].toLowerCase();
                    var field1 = "";
                    var field2 = "";

                    //String comparison. Ascending oper then ascending recordName
                    if (a.oper === b.oper) {
                        field1 = 0;
                    } else if (typeof a.oper === typeof b.oper) {
                        field1 = a.oper < b.oper ? -1 : 1;
                    } else {
                        field1 = typeof a.oper < typeof b.oper ? -1 : 1;
                    }

                    if (a_lowerCase === b_lowerCase) {
                        field2 = 0;
                    } else if (typeof a_lowerCase === typeof b_lowerCase) {
                        field2 = a_lowerCase < b_lowerCase ? -1 : 1;
                    } else {
                        field2 =
                            typeof a_lowerCase < typeof b_lowerCase ? -1 : 1;
                    }

                    return field1 || field2;
                });
                break;
            default:
                tilesData.sort(function (a, b) {
                    //Descending
                    return b.logsTotal - a.logsTotal;
                });
                break;
        }

        $RecordTileArray = new Array();
        var pageSize = 5;
        //Preserve markup indention
        //prettier-ignore
        var tileMarkUp = '<div class="apm-rpm-record-tile">' +
            '<div class="main-tile">' +
                '<div class="header">' +
                    '<div class="record-name"></div>' +
                    '<div class="record-operation"></div>' +
                '</div>' +
                '<div class="body">' +
                    '<div class="row-1">' +
                        '<div class="details col-1">' +
                            '<div class="total-time">' +
                                '<div class="value response-time"></div>' +
                                '<div class="label">' + APMTranslation.apm.common.label.responsetime().toLowerCase() + '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="details col-2">' +
                            '<div class="total-count">'+
                                '<div class="icon users"></div>' +
                                '<div class="value users"></div>' +
                            '</div>'+
                            '<div class="total-count">'+
                                '<div class="icon logs"></div>' +
                                '<div class="value logs"></div>' +
                            '</div>'+
                        '</div>' +
                    '</div>' +
                    '<div class="row-2">' +
                        '<div class="chart"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="body-nodata">' +
                    '<div class="message">' +
                        '<div class="icon"></div>' +
                        '<div class="text"><b>' + APMTranslation.apm.r2020a.datafromyouraccountisnotavailablefordisplay() + '</b></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        $.each(tilesData, function (index, tileData) {
            var recordOperation = tileData.oper;
            switch (recordOperation) {
                case "new":
                    recordOperation = APMTranslation.apm.common.label.new();
                    break;
                case "edit":
                    recordOperation = APMTranslation.apm.common.label.edit();
                    break;
                case "save":
                    recordOperation = APMTranslation.apm.common.label.save();
                    break;
                case "view":
                    recordOperation = APMTranslation.apm.common.label.view();
                    break;
            }

            var $RecordTile = $(tileMarkUp);
            $RecordTile.find(".main-tile").data("tileData", tileData);
            $RecordTile.find(".main-tile").data("configData", tileData);
            var recordTileTitleTrunc = tileData.recordName.substr(0, 13);
            if (tileData.recordName.length > 13)
                recordTileTitleTrunc = recordTileTitleTrunc + "...";
            $RecordTile
                .find(".header .record-name")
                .text(recordTileTitleTrunc)
                .attr("title", tileData.record);
            $RecordTile
                .find(".header .record-operation")
                .text(
                    recordOperation.charAt(0).toUpperCase() +
                        recordOperation.slice(1)
                )
                .attr("title", tileData.oper);
            $RecordTile
                .find(".value.response-time")
                .text(parseFloat(tileData.totaltimeMed).toFixed(2) + " s");
            $RecordTile.find(".value.users").text(tileData.usersTotal);
            $RecordTile.find(".value.logs").text(tileData.logsTotal);

            if (tileData.baselineMedPercent > 30) {
                //greater than 30%
                $RecordTile
                    .find(".total-time .value.response-time")
                    .addClass("warning");
                $RecordTile.find(".total-time .label").addClass("warning");
            } else {
                $RecordTile
                    .find(".total-time .value.response-time")
                    .removeClass("warning");
                $RecordTile.find(".total-time .label").removeClass("warning");
            }

            if (tileData.logsTotal > 0) {
                $RecordTile.find(".body").show();
                $RecordTile.find(".body-nodata").hide();
            } else {
                $RecordTile.find(".body").hide();
                $RecordTile.find(".body-nodata").show();
                $RecordTile.find(".main-tile").css("pointer-events", "none");
            }

            $RecordTileArray.push($RecordTile);
        });

        $RecordPagesCarousel.psgpCarousel("destroy");
        $RecordPagesCarousel.psgpCarousel({
            contentArray: $RecordTileArray,
            pageSize: pageSize,
            listeners: {
                afterItemRender: function ($Tile) {
                    //render chart when tile is shown
                    var $ChartContainer = $Tile.find(".chart");
                    var tileData = $Tile.find(".main-tile").data("tileData");
                    APMRPM.Highcharts.recordTileChart(
                        $ChartContainer,
                        tileData.totaltimeData,
                        tileData.baselineMed
                    );
                }
            }
        });
    }

    function updatePagination() {
        var pagination = $RecordPagesCarousel.psgpCarousel("pagination");
        var currentPage = pagination.currentPage - 1;
        var tilesPerPage = pagination.tilesPerPage;
        var totalTiles = pagination.totalTiles;
        var maxPages =
            totalTiles > 0 ? Math.ceil(totalTiles / tilesPerPage) : 1;
        var startPage = currentPage * tilesPerPage + 1;
        var endPage = "";

        if (currentPage < maxPages - 1) {
            endPage = startPage + tilesPerPage - 1;
        } else {
            var remaining = ((totalTiles - 1) % tilesPerPage) + 1;
            endPage = startPage + remaining - 1;
        }

        if (totalTiles > 0) {
            $RecordPagesToolbar
                .find(".pagination")
                .text(
                    APMTranslation.apm.r2020a._tooutoftiles({
                        params: [startPage, endPage, totalTiles]
                    })
                );
        } else {
            $RecordPagesToolbar.find(".pagination").text("");
        }
    }

    return {
        $SuiteAppNote: $SuiteAppNote,
        $TitleBar: $TitleBar,
        $RecordDateRangeComboBox: $RecordDateRangeComboBox,
        $RecordPagesPortlet: $RecordPagesPortlet,
        $RecordPagesCarousel: $RecordPagesCarousel,
        $RecordTileCharts: $RecordTileCharts,
        renderTiles: renderTiles,
        updatePagination: updatePagination
    };
};
