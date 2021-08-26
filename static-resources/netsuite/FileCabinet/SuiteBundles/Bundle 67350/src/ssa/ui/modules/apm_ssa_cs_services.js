/**
 * Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 Jun 2020     earepollo        ExtJS to jQuery
 * 2.00       15 Jun 2020     earepollo        Removed unused function
 * 3.00       22 Jun 2020     earepollo        Fixed drilldown
 * 4.00       24 Jun 2020     earepollo        Label changes
 * 5.00       30 Jul 2020     jmarimla         r2020a strings
 * 6.00       10 Sep 2020     lemarcelo        Financial Institution Connectivity plugin
 * 7.00       10 Sep 2020     earepollo        Email capture plugin
 * 8.00       21 Sep 2020     lemarcelo        Shipping Partners plugin
 * 9.00       06 Oct 2020     earepollo        Promotions plugin
 *
 */
APMSSA = APMSSA || {};

APMSSA._Services = function() {
    var _testModeParam = '&testmode=' + TEST_MODE;

    var _urls = {
        scripts: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ssa_sl_scripts&deploy=customdeploy_apm_ssa_sl_scripts',
        scripts2: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ssa_sl_newscripts&deploy=customdeploy_apm_ssa_sl_newscripts',
        perfChartData: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ssa_sl_perfchart&deploy=customdeploy_apm_ssa_sl_perfchart&testmode='+TEST_MODE,
        suiteScriptData: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ssa_sl_ss_summary&deploy=customdeploy_apm_ssa_sl_ss_summary&testmode='+TEST_MODE,
        suiteScriptLogs: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ssa_sl_ss_detail&deploy=customdeploy_apm_ssa_sl_ss_detail&testmode='+TEST_MODE
    };

    var _globalSettings = {
        startDate : '',
        endDate : '',
        scriptType : '',
        scriptId: '',
        scriptName: '',
        drilldown: 'F',
        drilldownStartDate: '',
        drilldownEndDate: '',
        context: '',
        clientEventType: '',
        mapReduceStage: '',
        compfil: ''
    };

    var _scriptNames2Types = [
        'customgllines',
        'emailcapture',
        'ficonnectivity',
        'paymentgateway',
        'promotions',
        'advancedrevrec',
        'shippingpartners',
        'taxcalculation'
    ];

    function getGlobalSettings() {
        return _globalSettings;
    }


    function getURL(name) {
        return _urls[name];
    }

    function _getScripts(params) {
        var $xhr = $.ajax({
            url: (_scriptNames2Types.indexOf(params.scriptType) > -1) ? _urls.scripts2 : _urls.scripts,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }

    function _getPerfChartData(params) {
        var $xhr = $.ajax({
            url: _urls.perfChartData,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }

    function _getSuiteScriptData(params) {
        var $xhr = $.ajax({
            url: _urls.suiteScriptData,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }

    function refreshNameListData(params) {
        if (!params.scriptType) {
            APMSSA.Components.$NameFilter.find('option').remove();
            APMSSA.Components.$NameFilter.find('select').append('<option value="' + '' + '">' + '' +'</option>');
            APMSSA.Components.$NameFilter.find('.psgp-combobox').val('');
            APMSSA.Components.$NameFilter.find('.psgp-combobox').selectmenu('refresh');
            return;
        }

        APMSSA.Components.$NameFilter.find('option').remove();
        APMSSA.Components.$NameFilter.find('select').append('<option value="' + '' + '">' + APMTranslation.apm.r2020a.scriptorpluginnamesareloading() +'</option>');
        APMSSA.Components.$NameFilter.find('.psgp-combobox').val('');
        APMSSA.Components.$NameFilter.find('.psgp-combobox').selectmenu('refresh');

        var params = {
            scriptType: params.scriptType
        };

        $.when(
                _getScripts(params)
                .done(function(response) {
                    if (!response.success) {
                        alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                        return;
                    }

                    //update script dropdown
                    if (response.data && response.data.length > 0) {
                        APMSSA.Components.$NameFilter.find('option').remove();
                        var optionsMarkUp = '';
                        for (var i in response.data) {
                            var customValue = response.data[i].id;
                            var customLabel = response.data[i].name;
                            var markUp = '<option value="' + customValue + '">' + customLabel +'</option>';
                            optionsMarkUp += markUp;
                        }
                        APMSSA.Components.$NameFilter.find('select').append(optionsMarkUp);
                        APMSSA.Components.$NameFilter.find('.psgp-combobox').selectmenu('refresh');
                    } else {
                        APMSSA.Components.$NameFilter.find('option').remove();
                        APMSSA.Components.$NameFilter.find('select').append('<option value="' + '' + '">' + '' +'</option>');
                        APMSSA.Components.$NameFilter.find('.psgp-combobox').val('');
                        APMSSA.Components.$NameFilter.find('.psgp-combobox').selectmenu('refresh');
                    }
                })
                .fail(function(response) {
                    alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
                })
        ).then(
                function () {
                    // Set dropdown if onload params are present
                    if (SSA_PARAMS.scriptId) {
                        APMSSA.Components.$NameFilter.find('.psgp-combobox').val(SSA_PARAMS.scriptId);
                        APMSSA.Components.$NameFilter.find('.psgp-combobox').selectmenu('refresh');
                        SSA_PARAMS.scriptId = null;
                    }
                }
        );
    }

    function refreshData(chart, point) {
        $('.apm-ssa-performance-chartcontainer').addClass('psgp-loading-mask');
        $('.apm-ssa-suiteScriptDetails-portlet').find('.psgp-portlet-body').addClass('psgp-loading-mask');

        var perfChartParams = _globalSettings;
        var ssDetailParams = {
            startDate: (_globalSettings.drilldown == 'T') ? _globalSettings.drilldownStartDate : _globalSettings.startDate,
            endDate: (_globalSettings.drilldown == 'T') ? _globalSettings.drilldownEndDate : _globalSettings.endDate,
            scriptType: _globalSettings.scriptType,
            scriptId: _globalSettings.scriptId,
            context: _globalSettings.context,
            clientEventType: _globalSettings.clientEventType,
            mapReduceStage: _globalSettings.mapReduceStage,
            compfil: _globalSettings.compfil
        };

        $.when(
                _getPerfChartData(perfChartParams)
                .done(function(response) {
                    if (!response.success) {
                        alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                        return;
                    }

                    if (_globalSettings.drilldown == 'F') {
                        if (response.data.length > 0) {
                            APMSSA.Components.$NoRecordsToShow.hide();
                            APMSSA.Components.$PerformanceChartPortlet.find('.chart').show();
                            var perfChartConfig = APMSSA.Highcharts.getPerfChartConfig();
                            perfChartConfig.pointInterval = response.config.pointInterval;
                            APMSSA.Highcharts.renderPerformanceChart(response.data, response.config);
                        } else {
                            APMSSA.Components.$NoRecordsToShow.show();
                            APMSSA.Components.$PerformanceChartPortlet.find('.chart').hide();
                        }
                    } else {
                        //async drilldown
                        if (response.data.length > 0) {
                            var series = { data: response.data };
                            var perfChartConfig = APMSSA.Highcharts.getPerfChartConfig();
                            perfChartConfig.pointInterval = response.config.pointInterval;
                            chart.addSeriesAsDrilldown(point, series);

                            setTimeout(function () {
                                chart.xAxis[0].setExtremes(new Date(response.config.xAxis.min), new Date(response.config.xAxis.max));
                            }, 100);
                        } else {
                            alert(APMTranslation.apm.r2020a.detailedinformationfromyouraccountisnotavailable());
                        }
                    }

                })
                .fail(function(response) {
                    alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
                }),

                _getSuiteScriptData(ssDetailParams)
                .done(function(response) {
                    if (!response.success) {
                        alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                        return;
                    }

                    var suiteScriptKeys = [
                        "logsTotal",
                        "usersTotal",
                        "totaltimeMed",
                        "usagecountMed",
                        "urlrequestsMed",
                        "searchesMed",
                        "recordsMed",
                        "errorCount"
                    ];

                    var responseData = response.data;
                    var suiteScriptData = [];

                    for (var i in suiteScriptKeys){
                        suiteScriptData.push({
                            name: suiteScriptKeys[i],
                            value: (responseData.hasOwnProperty(suiteScriptKeys[i]) ? responseData[suiteScriptKeys[i]] : 0)
                        });
                    }

                    response.data = suiteScriptData;
                    APMSSA.Components.refreshSummary();
                    APMSSA.Components.$SuiteScriptDetailGrid.psgpGrid('refreshData', response);
                })
                .fail(function(response) {
                    alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
                })
        ).then(
            function () {
                $('.apm-ssa-performance-chartcontainer').removeClass('psgp-loading-mask');
                $('.apm-ssa-suiteScriptDetails-portlet').find('.psgp-portlet-body').removeClass('psgp-loading-mask');
            }
        );
    }

    return {
        getGlobalSettings: getGlobalSettings,
        getURL: getURL,
        refreshNameListData: refreshNameListData,
        refreshData: refreshData
    };
};