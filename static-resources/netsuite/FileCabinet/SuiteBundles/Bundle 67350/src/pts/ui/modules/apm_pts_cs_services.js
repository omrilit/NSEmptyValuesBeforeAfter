/**
 * Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       13 Aug 2020     lemarcelo        ExtJS to jQuery
 *
 */
APMPTS = APMPTS || {};

APMPTS._Services = function () {
    var _testModeParam = "&testmode=" + TEST_MODE;
    var _urls = {
        recordTypes:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_sl_recordtypes&deploy=customdeploy_apm_sl_recordtypes",
        summarySetup:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_pts_sl_setup_summary&deploy=customdeploy_apm_pts_sl_setup_summary",
        summary:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_pts_sl_etesummary&deploy=customdeploy_apm_pts_sl_etesummary" +
            _testModeParam,
        details:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_pts_sl_etetime&deploy=customdeploy_apm_pts_sl_etetime" +
            _testModeParam,
        ssdetails:
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_pts_sl_ssdetail&deploy=customdeploy_apm_pts_sl_ssdetail" +
            _testModeParam
    };

    var _globalSettings = {
        compfil: "",
        recordtype: "",
        oper: "",
        email: "",
        startDate: "",
        endDate: "",
        responseTimeOper: "",
        responseTime1: "",
        responseTime2: ""
    };

    var _globalSummarySetup = {
        data: []
    };

    var _globalSummaryGridData = {
        data: [
            {
                id: "setup_ave",
                name: APMTranslation.apm.r2020a.meanoraverage(),
                clienttime: 0,
                networktime: 0,
                suitescripttime: 0,
                workflowtime: 0,
                servertime: 0,
                totaltime: 0
            },
            {
                id: "setup_med",
                name: APMTranslation.apm.common.label.median(),
                clienttime: 0,
                networktime: 0,
                suitescripttime: 0,
                workflowtime: 0,
                servertime: 0,
                totaltime: 0
            },
            {
                id: "setup_sd",
                name: APMTranslation.apm.pts.label.standarddeviation(),
                clienttime: 0,
                networktime: 0,
                suitescripttime: 0,
                workflowtime: 0,
                servertime: 0,
                totaltime: 0
            },
            {
                id: "setup_95p",
                name: APMTranslation.apm.common.label._95thpercentile(),
                clienttime: 0,
                networktime: 0,
                suitescripttime: 0,
                workflowtime: 0,
                servertime: 0,
                totaltime: 0
            }
        ]
    };

    function getGlobalSettings() {
        return _globalSettings;
    }

    function getGlobalSummarySetup() {
        return _globalSummarySetup;
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

    function _getSummarySetup(params) {
        var $xhr = $.ajax({
            url: _urls.summarySetup,
            type: "GET",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }
    function saveSummarySetup(params) {
        var $xhr = $.ajax({
            url: _urls.summarySetup,
            type: "POST",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }

    function _getSummary(params) {
        var $xhr = $.ajax({
            url: _urls.summary,
            type: "GET",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }

    function _getDetails(params) {
        var $xhr = $.ajax({
            url: _urls.details,
            type: "GET",
            data: params,
            dataType: "json"
        });
        return $xhr;
    }

    function _getSsDetails(params) {
        var $xhr = $.ajax({
            url: _urls.ssdetails,
            type: "GET",
            data: params,
            dataType: "json"
        });
        return $xhr;
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

    function getURL(name) {
        return _urls[name];
    }

    function getRecordName(recId) {
        var typeMatch = _recordTypes.filter(function (obj) {
            return obj.id == recId;
        });
        if (!typeMatch || typeMatch.length < 1) return recId;
        var recordName = typeMatch[0].name;
        return recordName ? recordName : "";
    }

    function refreshData() {
        var maskHeight = $(window).height() - 100;
        $(".psgp-main-content")
            .css({
                height: maskHeight + "px"
            })
            .addClass("psgp-loading-mask");

        var params = {
            compfil: _globalSettings.compfil,
            recordtype: _globalSettings.recordtype,
            oper: _globalSettings.oper,
            email: _globalSettings.email,
            startDate: _globalSettings.startDate,
            endDate: _globalSettings.endDate,
            responseTimeOper: _globalSettings.responseTimeOper,
            responseTime1: _globalSettings.responseTime1,
            responseTime2: _globalSettings.responseTime2
        };

        $.when(
            _getSummary(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    _globalSummaryGridData = response.data.stats;
                    updateSummaryGrid();

                    APMPTS.Components.updateSummarySidePanelDetails(
                        response.data
                    );
                })
                .fail(function (response) {
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                }),
            _getDetails(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    APMPTS.Components.$DetailsGrid.psgpGrid(
                        "refreshDataRemote",
                        params
                    );
                })
                .fail(function (response) {
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                }),
            _getSsDetails(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    if (response.data && response.data.length > 0) {
                        var chartData = new Array();
                        var records = response.data;
                        for (i = 0; i < response.data.length; i++) {
                            var record = response.data[i];
                            chartData.push({
                                name: record.script,
                                y: parseFloat(record.totaltime),
                                scripttype: record.scripttype,
                                triggertype: record.triggertype
                            });
                        }

                        APMPTS.Components.$NoDataAvailable.hide();
                        APMPTS.Components.$Chart.show();
                        APMPTS.Highcharts.renderSuiteScriptDetailChart(
                            chartData
                        );
                        APMPTS.Components.$SsDetailsGrid.psgpGrid(
                            "refreshData",
                            response
                        );
                    } else {
                        APMPTS.Components.$NoDataAvailable.show();
                        APMPTS.Components.$Chart.hide();
                        APMPTS.Components.$SsDetailsGrid.psgpGrid(
                            "refreshData",
                            { data: [] }
                        );
                    }
                })
                .fail(function (response) {
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                })
        ).then(function () {
            $(".psgp-main-content").removeClass("psgp-loading-mask");
        });
    }

    function refreshRecordTypeList() {
        var params = {
            compfil: _globalSettings.compfil,
            recordtype: _globalSettings.recordtype,
            oper: _globalSettings.oper,
            email: _globalSettings.email,
            startDate: _globalSettings.startDate,
            endDate: _globalSettings.endDate,
            responseTimeOper: _globalSettings.responseTimeOper,
            responseTime1: _globalSettings.responseTime1,
            responseTime2: _globalSettings.responseTime2
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
                    _recordTypes = response.data;
                    _recordTypes.sort(function (a, b) {
                        return a.name.localeCompare(b.name);
                    });

                    if (response.data && response.data.length > 0) {
                        APMPTS.Components.$RecordTypeFilter
                            .find("option")
                            .remove();
                        var optionsMarkUp = "";
                        for (var i in response.data) {
                            var customValue = response.data[i].id;
                            var customLabel = response.data[i].name;
                            var markUp =
                                '<option value="' +
                                customValue +
                                '">' +
                                customLabel +
                                "</option>";
                            optionsMarkUp += markUp;
                        }
                        var selectedRecordType = PTS_PARAMS.recordtype
                            ? PTS_PARAMS.recordtype
                            : _recordTypes[0].id;
                        APMPTS.Components.$RecordTypeFilter
                            .find("select")
                            .append(optionsMarkUp);
                        APMPTS.Components.$RecordTypeFilter
                            .find(".psgp-combobox")
                            .val(selectedRecordType);
                        APMPTS.Components.$RecordTypeFilter
                            .find(".psgp-combobox")
                            .selectmenu("refresh");
                    } else {
                        APMPTS.Components.$RecordTypeFilter
                            .find("option")
                            .remove();
                        APMPTS.Components.$RecordTypeFilter
                            .find("select")
                            .append(
                                '<option value="' + "" + '">' + "" + "</option>"
                            );
                        APMPTS.Components.$RecordTypeFilter
                            .find(".psgp-combobox")
                            .val("");
                        APMPTS.Components.$RecordTypeFilter
                            .find(".psgp-combobox")
                            .selectmenu("refresh");
                    }
                })
                .fail(function (response) {
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                })
        ).then(function () {});
    }

    function refreshSummarySetup() {
        var params = {};
        $.when(
            _getSummarySetup(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    if (response.data) {
                        _globalSummarySetup.data = [
                            {
                                name: APMTranslation.apm.r2020a.meanoraverage(),
                                description: APMTranslation.apm.pts.description.average(),
                                show: response.data.setup_ave,
                                key: Object.keys(response.data)[0]
                            },
                            {
                                name: APMTranslation.apm.common.label.median(),
                                description: APMTranslation.apm.pts.description.median(),
                                show: response.data.setup_med,
                                key: Object.keys(response.data)[1]
                            },
                            {
                                name: APMTranslation.apm.pts.label.standarddeviation(),
                                description: APMTranslation.apm.pts.description.standarddeviation(),
                                show: response.data.setup_sd,
                                key: Object.keys(response.data)[2]
                            },
                            {
                                name: APMTranslation.apm.common.label._95thpercentile(),
                                description: APMTranslation.apm.pts.description._95thpercentile(),
                                show: response.data.setup_95p,
                                key: Object.keys(response.data)[3]
                            }
                        ];
                    }
                    var displayedrows = {
                        data: []
                    };

                    for (
                        var index = 0;
                        index < _globalSummarySetup.data.length;
                        index++
                    ) {
                        if (_globalSummarySetup.data[index].show == "T") {
                            for (
                                var i = 0;
                                i < _globalSummaryGridData.data.length;
                                i++
                            ) {
                                if (
                                    _globalSummaryGridData.data[i].name ==
                                    _globalSummarySetup.data[index].name
                                ) {
                                    displayedrows.data.push(
                                        _globalSummaryGridData.data[i]
                                    );
                                }
                            }
                        }
                    }
                    APMPTS.Components.$SummaryGrid.psgpGrid(
                        "refreshData",
                        displayedrows
                    );
                })
                .fail(function (response) {
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                })
        ).then(function () {});
    }

    function refreshSsDetails(params) {
        APMPTS.Components.$SsDetailsGrid.addClass("psgp-loading-mask");

        $.when(
            _getSsDetails(params)
                .done(function (response) {
                    if (!response.success) {
                        alert(
                            APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch()
                        );
                        return;
                    }
                    if (response.data && response.data.length > 0) {
                        var chartData = new Array();
                        var records = response.data;
                        for (i = 0; i < response.data.length; i++) {
                            var record = response.data[i];
                            chartData.push({
                                name: record.script,
                                y: parseFloat(record.totaltime),
                                scripttype: record.scripttype,
                                triggertype: record.triggertype
                            });
                        }

                        APMPTS.Components.$NoDataAvailable.hide();
                        APMPTS.Components.$Chart.show();
                        APMPTS.Highcharts.renderSuiteScriptDetailChart(
                            chartData
                        );
                        APMPTS.Components.$SsDetailsGrid.psgpGrid(
                            "refreshData",
                            response
                        );
                    } else {
                        APMPTS.Components.$NoDataAvailable.show();
                        APMPTS.Components.$Chart.hide();
                    }
                })
                .fail(function (response) {
                    alert(
                        APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage()
                    );
                })
        ).then(function () {
            APMPTS.Components.$SsDetailsGrid.removeClass("psgp-loading-mask");
        });
    }

    function updateSummaryGrid() {
        var displayedrows = {
            data: []
        };
        for (var index = 0; index < _globalSummarySetup.data.length; index++) {
            if (_globalSummarySetup.data[index].show == "T") {
                for (var i = 0; i < _globalSummaryGridData.data.length; i++) {
                    if (
                        _globalSummaryGridData.data[i].name ==
                        _globalSummarySetup.data[index].name
                    ) {
                        displayedrows.data.push(_globalSummaryGridData.data[i]);
                    }
                }
            }
        }
        APMPTS.Components.$SummaryGrid.psgpGrid("refreshData", displayedrows);
    }

    return {
        getURL: getURL,
        getGlobalSettings: getGlobalSettings,
        getGlobalSummarySetup: getGlobalSummarySetup,
        getRecordName: getRecordName,
        saveSummarySetup: saveSummarySetup,
        showLoading: showLoading,
        hideLoading: hideLoading,
        refreshRecordTypeList: refreshRecordTypeList,
        refreshSummarySetup: refreshSummarySetup,
        refreshData: refreshData,
        refreshSsDetails: refreshSsDetails,
        updateSummaryGrid: updateSummaryGrid
    };
};
