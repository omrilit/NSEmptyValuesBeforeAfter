/**
 * Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       21 Apr 2020     earepollo        ExtJS to jQuery
 * 2.00       29 Apr 2020     earepollo        Remove logging of response
 * 3.00       30 Jul 2020     jmarimla         r2020a strings
 *
 */
APMPTD = APMPTD || {};

APMPTD._Services = function() {
    var _testModeParam = '&testmode=' + TEST_MODE;
    var _urls = {
        instanceChartData: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ptd_sl_chart&deploy=customdeploy_apm_ptd_sl_chart' + _testModeParam,
        suiteScriptDetail: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ptd_sl_ssd&deploy=customdeploy_apm_ptd_sl_ssd' + _testModeParam
    };

    var _globalSettings = {
        startDateMS: '',
        endDateMS: '',
        compfil: '',
        operationId: ''
    };

    function getGlobalSettings() {
        return _globalSettings;
    }


    function getURL(name) {
        return _urls[name];
    }

    function _getInstanceChartData(params) {
        var $xhr = $.ajax({
            url: _urls.instanceChartData,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }

    function _getSuiteScriptDetail(params) {
        var $xhr = $.ajax({
            url: _urls.suiteScriptDetail,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }

    function showLoading() {
        var maskHeight = $(window).height();
        $('.psgp-main-content').css({
            height: maskHeight + 'px'
        }).addClass('psgp-loading-mask');
    }

    function hideLoading() {
        $('.psgp-main-content').removeClass('psgp-loading-mask');
    }

    function convertMSToPSTString(dateMS) {
        //convert to dateObj
        var ISOdateObj = new Date(dateMS);
        //convert to GMT netsuite string
        var GMTString = NSFORMAT.format({
            value: ISOdateObj,
            type: NSFORMAT.Type.DATETIME,
            timezone: NSFORMAT.Timezone.AMERICA_LOS_ANGELES
        });
        //convert to PST date object
        var PSTdateObj = NSFORMAT.parse({
            value: GMTString,
            type: NSFORMAT.Type.DATETIME,
            timezone: NSFORMAT.Timezone.GMT
        });
        //convert to MS
        var PSTdateMS = PSTdateObj.getTime();
        return PSTdateMS;
    }

    function refreshData() {
        var maskHeight = $(window).height() - 100;
        $('.psgp-main-content').css({
            height: maskHeight + 'px'
        }).addClass('psgp-loading-mask');

        var params = {
            startdate: _globalSettings.startdate,
            enddate: _globalSettings.enddate,
            operationId: _globalSettings.operationId,
            compfil: _globalSettings.compfil
        };

        $.when(
                _getInstanceChartData(params)
                .done(function(response) {
                    if (!response.success) {
                        alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                        return;
                    }
                    //console.log(response);

                    if (response.data && response.data.series && response.data.series.length > 0) {
                        _globalSettings.operationId = response.operationId;
                        APMPTD.Components.$NoRecordsToShow.hide();
                        APMPTD.Components.$TimelineChartContainer.find('.chart').show();
                        APMPTD.Components.$ProfilerLink.show();
                        APMPTD.Components.refreshKPI(response);
                        APMPTD.Highcharts.renderInstanceChartData(response.data);
                    } else {
                        APMPTD.Components.$NoRecordsToShow.show();
                        APMPTD.Components.$TimelineChartContainer.find('.chart').hide();
                        APMPTD.Components.$ProfilerLink.hide();
                        APMPTD.Components.refreshKPI(response);
                        if (params.operationId) {
                            //Alert if operation ID field is populated
                            var doNotRedirect = APMTranslation.apm.r2020a.thedatafortheoperationidisnotavailable();
                            alert(doNotRedirect);
                        }
                    }

                })
                .fail(function(response) {
                    //console.log(response);
                    alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
                }),

                _getSuiteScriptDetail(params)
                .done(function(response) {
                    if (!response.success) {
                        alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                        return;
                    }
                    //console.log(response);

                    APMPTD.Components.$SuiteScriptDetailGrid.psgpGrid('refreshData', response);
                })
                .fail(function(response) {
                    //console.log(response);
                    alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
                })

        ).then(
                function () {
                    $('.psgp-main-content').removeClass('psgp-loading-mask');
                }
        );
    }

    return {
        getGlobalSettings: getGlobalSettings,
        getURL: getURL,
        showLoading: showLoading,
        hideLoading: hideLoading,
        convertMSToPSTString: convertMSToPSTString,
        refreshData: refreshData
    };
};