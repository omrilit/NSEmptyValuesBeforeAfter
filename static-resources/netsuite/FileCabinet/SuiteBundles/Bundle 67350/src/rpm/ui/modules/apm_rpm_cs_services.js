/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Jan 2015     jmarimla         Initial
 * 2.00       28 Jan 2015     jmarimla         Retrieve record charts data
 * 3.00       05 Feb 2015     jmarimla         Retrieve chart config
 * 4.00       03 Mar 2015     jmarimla         Enable sorting and date range for record tiles
 * 5.00       10 Mar 2015     rwong            Created store for setup record pages
 * 6.00       12 Mar 2015     jmarimla         Store recordchartsparams
 * 7.00       16 Mar 2015     jmarimla         Navigate to page 1 after refresh
 * 8.00       17 Mar 2015     jmarimla         load recordtype from suitelet, css changes
 * 9.00       23 Mar 2015     jmarimla         Exact search for recordtype, added sorting for delta from baseline
 * 10.00      27 Mar 2015     jmarimla         Removed seconds for SPM compatibility
 * 11.00      21 Apr 2015     jmarimla         Support for getting and saving general setup
 * 12.00      23 Apr 2015     rwong            Renamed setuprecordpages into watchlist and added support for custom date time
 * 13.00      27 Apr 2015     jmarimla         Include custom date range in date range dropdown
 * 14.00      29 Apr 2015     jmarimla         Adjusted resolution values
 * 15.00      15 May 2015     jmarimla         Pass testmode parameter
 * 16.00      01 Jul 2015     jmarimla         Updated loading masks
 * 17.00      02 Jul 2015     jmarimla         Modified date format for custom date
 * 18.00      23 Jul 2015     jmarimla         Update record names of tiles; Sorting for record type and operation
 * 19.00      06 Aug 2015     rwong            Clear refresh date text if custom date range is selected
 * 20.00      11 Aug 2015     jmarimla         Support for company filter
 * 21.00      28 Aug 2015     jmarimla         Passed compfil to store calls
 * 22.00      08 Sep 2015     jmarimla         Replaced Date.parse with custom function
 * 23.00      16 Sep 2015     jmarimla         Hide highest delta from baseline
 * 24.00      23 Nov 2015     jmarimla         Added personalize panel store
 * 25.00      03 Dec 2015     rwong            Fixed for incorrect offset during DST
 * 26.00      26 Aug 2016     rwong            ScheduledScriptUsage portlet
 * 27.00      02 Oct 2017     jmarimla         Remove sched script portlet
 * 28.00      29 Jun 2018     jmarimla         Translation readiness
 * 29.00      10 Jan 2020     jmarimla         Customer debug settings
 * 30.00      30 Jul 2020     jmarimla         r2020a strings
 * 31.00      11 Aug 2020     earepollo        ExtJS to jQuery
 * 32.00      20 Aug 2020     lemarcelo        ExtJS to jQuery - Setup
 * 33.00      19 Oct 2020     earepollo        Fixed bug in record types
 *
 */

APMRPM = APMRPM || {};

APMRPM._Services = function () {
    var _testModeParam = "&testmode=" + TEST_MODE;

    var _urls = {
        recordTypes:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_sl_recordtypes&deploy=customdeploy_apm_sl_recordtypes",
        recordTile:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_rpm_sl_record_tile&deploy=customdeploy_apm_rpm_sl_record_tile&testmode=" +
            TEST_MODE,
        recordCharts:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_rpm_sl_record_charts&deploy=customdeploy_apm_rpm_sl_record_charts&testmode=" +
            TEST_MODE,
        setupRecordPages:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_rpm_sl_setup_recordpage&deploy=customdeploy_apm_rpm_sl_setup_recordpage",
        setupGeneral:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_rpm_sl_setup_general&deploy=customdeploy_apm_rpm_sl_setup_general",
        setupDateRange:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_rpm_sl_setup_date_range&deploy=customdeploy_apm_rpm_sl_setup_date_range"
    };

    var _tilesData = {};
    var _tilesConfig = {};
    var _recordTypes = [];

    var _globalSettings = {
        dateRangeSelect: "" + 1000 * 60 * 60 * 24,
        startDateMS: "",
        endDateMS: "",
        compfil: ""
    };
    var _globalSetup = {
        chartpref: {},
        watchlist: {},
        daterange: {}
    };

    var _defaultRecordDateRange = [
        {
            name: APMTranslation.apm.common.label.last1hour(),
            id: 1000 * 60 * 60
        },
        {
            name: APMTranslation.apm.common.label.last3hours(),
            id: 1000 * 60 * 60 * 3
        },
        {
            name: APMTranslation.apm.common.label.last6hours(),
            id: 1000 * 60 * 60 * 6
        },
        {
            name: APMTranslation.apm.common.label.last12hours(),
            id: 1000 * 60 * 60 * 12
        },
        {
            name: APMTranslation.apm.common.label.last24hours(),
            id: 1000 * 60 * 60 * 24
        },
        {
            name: APMTranslation.apm.common.label.last3days(),
            id: 1000 * 60 * 60 * 24 * 3
        },
        {
            name: APMTranslation.apm.common.label.last7days(),
            id: 1000 * 60 * 60 * 24 * 7
        },
        {
            name: APMTranslation.apm.common.label.last14days(),
            id: 1000 * 60 * 60 * 24 * 14
        },
        {
            name: APMTranslation.apm.common.label.last30days(),
            id: 1000 * 60 * 60 * 24 * 30
        }
    ];

    function getGlobalSettings() {
        return _globalSettings;
    }

    function getRPMSettings() {
        return _globalSetup;
    }

    function getRecordTypes() {
        return _recordTypes;
    }

    function getRecordName(recId) {
        var typeMatch = _recordTypes.filter(function (obj) {
            return obj.id == recId;
        });
        if (!typeMatch || typeMatch.length < 1) return "";
        var recordName = typeMatch[0].name;
        return recordName ? recordName : "";
    }

    function getTilesData() {
        return _tilesData;
    }

    function getTilesConfig() {
        return _tilesConfig;
    }

    function _getRecordTypesData(params) {
        var $xhr = $.ajax({
            url: _urls.recordTypes,
            type: "GET",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }

    function _getGeneralSetupData(params) {
        var $xhr = $.ajax({
            url: _urls.setupGeneral,
            type: "GET",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }

    function _saveGeneralSetupData(params) {
        var $xhr = $.ajax({
            url: _urls.setupGeneral,
            type: "POST",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }

    function _getRecordPagesSetupData(params) {
        var $xhr = $.ajax({
            url: _urls.setupRecordPages,
            type: "GET",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }

    function _saveRecordPagesSetupData(params) {
        var $xhr = $.ajax({
            url: _urls.setupRecordPages,
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json"
        });
        return $xhr;
    }

    function _deleteRecordPagesSetupData(params) {
        var $xhr = $.ajax({
            url: _urls.setupRecordPages,
            type: "DELETE",
            data: JSON.stringify(params),
            dataType: "json"
        });
        return $xhr;
    }

    function _getDateRangeSetupData(params) {
        var $xhr = $.ajax({
            url: _urls.setupDateRange,
            type: "GET",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }

    function _saveDateRangeSetupData(params) {
        var $xhr = $.ajax({
            url: _urls.setupDateRange,
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json"
        });
        return $xhr;
    }

    function _deleteDateRangeSetupData(params) {
        var $xhr = $.ajax({
            url: _urls.setupDateRange,
            type: "DELETE",
            data: JSON.stringify(params),
            dataType: "json"
        });
        return $xhr;
    }

    function _getRecordTileData(params) {
        var $xhr = $.ajax({
            url: _urls.recordTile,
            type: "GET",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }

    function _getRecordChartsData(params) {
        var $xhr = $.ajax({
            url: _urls.recordCharts,
            type: "GET",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }

    function refreshRecordTypesData() {
        var params = {
            compfil: _globalSettings.compfil
        };
        $.when(
            _getRecordTypesData(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    //console.log(response);
                    _recordTypes = response.data;
                    _recordTypes.sort(function (a, b) {
                        return a.name.localeCompare(b.name);
                    });
                })
                .fail(function (response) {
                    //console.log(response);
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                })
        ).then(function () {});
    }

    function refreshSetupData() {
        showLoading();
        var params = {};
        $.when(
            _getGeneralSetupData(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    _globalSetup.chartpref = response.data;
                })
                .fail(function (response) {
                    //console.log(response);
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                }),

            _getRecordPagesSetupData(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    _globalSetup.watchlist = response;
                })
                .fail(function (response) {
                    //console.log(response);
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                }),

            _getDateRangeSetupData(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    _globalSetup.daterange = response;
                })
                .fail(function (response) {
                    //console.log(response);
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                })
        ).then(function () {
            refreshRecordDateRangeDropdown(_globalSetup.daterange.data);
            refreshTilesData();
            hideLoading();
        });
    }

    function refreshTilesData() {
        var maskHeight = $(window).height() - 100;
        APMRPM.Components.$RecordPagesPortlet.addClass("psgp-loading-mask");
        APMRPM.Components.$RecordTileCharts.hide();

        var startDateMS, endDateMS;
        if (_globalSettings.dateRangeSelect.indexOf("custom_") !== -1) {
            var dateSplit = _globalSettings.dateRangeSelect.split("_");
            endDateMS = dateSplit[2];
            startDateMS = dateSplit[1];
        } else {
            endDateMS = parseInt(_globalSettings.endDateMS);
            startDateMS = endDateMS - parseInt(_globalSettings.dateRangeSelect);
        }

        _globalSettings.endDateMS = endDateMS;
        _globalSettings.startDateMS = startDateMS;

        var params = {
            compfil: _globalSettings.compfil,
            startDateMS: _globalSettings.startDateMS,
            endDateMS: _globalSettings.endDateMS
        };

        $.when(
            _getRecordTileData(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    //console.log(response);

                    _tilesData = response.data;
                    _tilesConfig = response.config;

                    $.each(_tilesData, function (index, tileData) {
                        var recordName = APMRPM.Services.getRecordName(
                            tileData.record
                        );
                        recordName = recordName ? recordName : "" + tileData.record;
                        tileData.recordName = recordName;
                    });

                    if (_globalSetup.chartpref.histogramInterval) {
                        _tilesConfig.histogramTicks = parseInt(
                            _globalSetup.chartpref.histogramInterval
                        );
                    }

                    APMRPM.Highcharts.setRecordConfigData(_tilesConfig);
                })
                .fail(function (response) {
                    //console.log(response);
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                })
        ).then(function () {
            $(".apm-rpm-recordpages-toolbar .text-date").text(
                APMTranslation.apm.common.label.asof({
                    params: [_tilesConfig.endDateStr]
                })
            );

            APMRPM.Components.renderTiles();
            APMRPM.Components.$RecordPagesCarousel.psgpCarousel(
                "resetPagination"
            );
            APMRPM.Components.updatePagination();
            APMRPM.Components.$RecordPagesPortlet.removeClass(
                "psgp-loading-mask"
            );
        });
    }

    function refreshRecordDateRangeDropdown(dateRangeData) {
        var optionsMarkUp = "";
        for (var i in _defaultRecordDateRange) {
            var customValue = _defaultRecordDateRange[i].id;
            var customLabel = _defaultRecordDateRange[i].name;
            var markUp =
                '<option value="' +
                customValue +
                '">' +
                customLabel +
                "</option>";
            optionsMarkUp += markUp;
        }

        if (dateRangeData) {
            for (var i = 0; i < dateRangeData.length; i++) {
                var sDate = new Date(dateRangeData[i].startdate);
                var eDate = new Date(dateRangeData[i].enddate);
                var startDateMS = convertToPSTms(
                    sDate,
                    dateRangeData[i].starttime
                );
                var endDateMS = convertToPSTms(eDate, dateRangeData[i].endtime);
                var customValue = "custom_" + startDateMS + "_" + endDateMS;
                var customLabel =
                    convertMStoDateTimePST(sDate, dateRangeData[i].starttime) +
                    " - " +
                    convertMStoDateTimePST(eDate, dateRangeData[i].endtime);
                var markUp =
                    '<option value="' +
                    customValue +
                    '">' +
                    customLabel +
                    "</option>";
                optionsMarkUp += markUp;
            }
        }

        var prevValue = APMRPM.Components.$RecordDateRangeComboBox
            .find(".psgp-combobox")
            .val()
            ? APMRPM.Components.$RecordDateRangeComboBox
                  .find(".psgp-combobox")
                  .val()
            : _globalSettings.dateRangeSelect;
        APMRPM.Components.$RecordDateRangeComboBox.find("select").empty();
        APMRPM.Components.$RecordDateRangeComboBox
            .find("select")
            .append(optionsMarkUp);
        APMRPM.Components.$RecordDateRangeComboBox
            .find(".psgp-combobox")
            .val(prevValue);
        APMRPM.Components.$RecordDateRangeComboBox
            .find(".psgp-combobox")
            .selectmenu("refresh");
    }

    function renderRecordCharts(params) {
        APMRPM.Components.$RecordTileCharts.show();
        var maskHeight = $(window).height() - 100;
        APMRPM.Components.$RecordTileCharts.addClass("psgp-loading-mask");

        $.when(
            _getRecordChartsData(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    //console.log(response);

                    APMRPM.Highcharts.setRecordChartsData(response.data);
                    APMRPM.Highcharts.recordResponseTimeChart(params);
                    APMRPM.Highcharts.recordThroughputChart(params);
                    APMRPM.Highcharts.recordUEWFBreakdownChart(params);
                    APMRPM.Highcharts.recordHistogramChart(params);
                })
                .fail(function (response) {
                    //console.log(response);
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                })
        ).then(function () {
            APMRPM.Components.$RecordTileCharts.removeClass(
                "psgp-loading-mask"
            );
        });
    }

    function saveSetupData(params) {
        var saveDeferreds = [];
        var getDeferreds = [];
        var getDateRanges,
            getRecordPages = false;

        saveDeferreds.push(_saveGeneralSetupData(params.generalSetupParams));

        if (params.deleteRecordPagesParams.length > 0) {
            getRecordPages = true;
            saveDeferreds.push(
                _deleteRecordPagesSetupData(params.deleteRecordPagesParams)
                    .done(function (response) {
                        if (!response.success) {
                            alert(
                                APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                            );
                            return;
                        }
                    })
                    .fail(function (response) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                        );
                    })
            );
        }

        if (params.addRecordPagesParams.length > 0) {
            getRecordPages = true;
            saveDeferreds.push(
                _saveRecordPagesSetupData(params.addRecordPagesParams)
                    .done(function (response) {
                        if (!response.success) {
                            alert(
                                APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                            );
                            return;
                        }
                    })
                    .fail(function (response) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                        );
                    })
            );
        }

        if (params.deleteDateRangeParams.length > 0) {
            getDateRanges = true;
            saveDeferreds.push(
                _deleteDateRangeSetupData(params.deleteDateRangeParams)
                    .done(function (response) {
                        if (!response.success) {
                            alert(
                                APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                            );
                            return;
                        }
                    })
                    .fail(function (response) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                        );
                    })
            );
        }
        if (params.addDateRangeParams.length > 0) {
            getDateRanges = true;
            saveDeferreds.push(
                _saveDateRangeSetupData(params.addDateRangeParams)
                    .done(function (response) {
                        if (!response.success) {
                            alert(
                                APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                            );
                            return;
                        }
                    })
                    .fail(function (response) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                        );
                    })
            );
        }

        showLoading();
        $.when.apply($, saveDeferreds).then(function () {
            if (getRecordPages) {
                getDeferreds.push(
                    _getRecordPagesSetupData({})
                        .done(function (response) {
                            if (!response.success) {
                                alert(
                                    APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                                );
                                return;
                            }
                            _globalSetup.watchlist = response;
                        })
                        .fail(function (response) {
                            alert(
                                APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                            );
                        })
                );
            }

            if (getDateRanges) {
                getDeferreds.push(
                    _getDateRangeSetupData({})
                        .done(function (response) {
                            if (!response.success) {
                                alert(
                                    APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                                );
                                return;
                            }
                            _globalSetup.daterange = response;
                        })
                        .fail(function (response) {
                            alert(
                                APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                            );
                        })
                );
            }

            $.when.apply($, getDeferreds).then(function () {});

            refreshRecordDateRangeDropdown(params.dateRangeData);
            refreshTilesData();
            hideLoading();
        });
    }

    function convertToPSTms(dateObj, timeString) {
        var y, m, d, hr, min;
        y = dateObj.getFullYear();
        m = dateObj.getMonth() + 1;
        d = dateObj.getDate();
        hr = timeString.split(":")[0];
        min = timeString.split(":")[1];

        //format to YYYY-MM-DDThh:mm:00.000Z
        var ISOString =
            "" +
            y +
            "-" +
            (m < 10 ? "0" + m : m) +
            "-" +
            (d < 10 ? "0" + d : d) +
            "T" +
            hr +
            ":" +
            min +
            ":00.000Z";
        //convert to dateObj
        var ISOdateObj = new Date(Date.parse(ISOString));
        //convert to GMT netsuite string
        var GMTString = NSFORMAT.format({
            value: ISOdateObj,
            type: NSFORMAT.Type.DATETIME,
            timezone: NSFORMAT.Timezone.GMT
        });
        //convert to PST date object
        var PSTdateObj = NSFORMAT.parse({
            value: GMTString,
            type: NSFORMAT.Type.DATETIME,
            timezone: NSFORMAT.Timezone.AMERICA_LOS_ANGELES
        });
        //convert to MS
        var PSTdateMS = PSTdateObj.getTime();

        return PSTdateMS;
    }

    function convertMStoDateTimePST(dateObj, timeString) {
        var y, m, d, hr, min;
        y = dateObj.getFullYear();
        m = dateObj.getMonth();
        d = dateObj.getDate();
        hr = timeString.split(":")[0];
        min = timeString.split(":")[1];

        var dateStr = Highcharts.dateFormat(
            "%b %e",
            new Date(Date.UTC(y, m, d))
        );
        var timeStr = formatAMPM(parseInt(hr, 10), parseInt(min, 10));

        return dateStr + " " + timeStr;
    }

    function formatAMPM(hours, minutes) {
        var ampm =
            hours >= 12
                ? APMTranslation.apm.common.time.pm()
                : APMTranslation.apm.common.time.am();
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        var strTime = hours + ":" + minutes + " " + ampm;
        return strTime;
    }

    function showLoading() {
        var maskHeight = $(window).height();
        $(".psgp-main-content")
            .css({
                height: maskHeight + "px"
            })
            .addClass("psgp-loading-mask");
    }
    function hideLoading() {
        $(".psgp-main-content").removeClass("psgp-loading-mask");
    }

    return {
        getGlobalSettings: getGlobalSettings,
        getRPMSettings: getRPMSettings,
        getRecordTypes: getRecordTypes,
        getRecordName: getRecordName,
        getTilesData: getTilesData,
        getTilesConfig: getTilesConfig,
        refreshRecordTypesData: refreshRecordTypesData,
        refreshSetupData: refreshSetupData,
        refreshTilesData: refreshTilesData,
        refreshRecordDateRangeDropdown: refreshRecordDateRangeDropdown,
        renderRecordCharts: renderRecordCharts,
        saveSetupData: saveSetupData,
        showLoading: showLoading,
        hideLoading: hideLoading
    };
};
