/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Feb 2018     jmarimla         Initial
 * 2.00       22 Feb 2018     jmarimla         Drilldown
 * 3.00       17 Apr 2018     jmarimla         Customer debugging
 * 4.00       11 Jun 2018     jmarimla         Translation engine
 * 5.00       02 Jul 2018     justaris         Translation Readiness
 * 6.00       03 Aug 2018     jmarimla         Translate custom date
 * 7.00       11 Mar 2020     jmarimla         Overview portlet
 * 8.00       23 Mar 2020     jmarimla         Concurrency chart
 * 9.00       03 Jul 2020     jmarimla         Concurrency backend changes
 * 10.00      30 Jul 2020     jmarimla         r2020a strings
 *
 */

APMCD = APMCD || {};

APMCD._Services = function() {

    var _testModeParam = '&testmode=' + TEST_MODE;

    var _urls = {
            concurrencyDetails: '/app/site/hosting/scriptlet.nl?script=customscript_apm_cd_sl_concurrencydet&deploy=customdeploy_apm_cd_sl_concurrencydet' + _testModeParam,
            instances: '/app/site/hosting/scriptlet.nl?script=customscript_apm_cd_sl_instances&deploy=customdeploy_apm_cd_sl_instances' + _testModeParam,
            violations: '/app/site/hosting/scriptlet.nl?script=customscript_apm_cd_sl_violations&deploy=customdeploy_apm_cd_sl_violations' + _testModeParam
    };

    var _globalParams = {};

    var _globalSettings = {
        dateRangeSelect: '' + 1000 * 60 * 60 * 24,
        startDateMS: '',
        endDateMS: '',
        compfil: null,
        concurrencyMode: 'noallocation', //'noallocation', 'unallocated', 'allocated',
        integId : '',
        asOf: '',
        drilldown: false
    };
    
    var _overview1 = {};
    var _overview2 = {};
    var _concurrencyData = {};
    var _violationsData = {};

    function getGlobalSettings() {
        return _globalSettings;
    }

    function getURL(name) {
        return _urls[name];
    }

    function getGlobalParams() {
        return _globalParams;
    }
    
    function _getConcurrencyDetailsData(params) {
        var $xhr = $.ajax({
            url: _urls.concurrencyDetails,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }
    
    function _getViolationsData(params) {
        var $xhr = $.ajax({
            url: _urls.violations,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }

    function refreshData(isDrilldown, pointParams) {
        $('.psgp-main-content').addClass('psgp-loading-mask');

        var params = {};
        if (isDrilldown) {
           _globalSettings.drilldown = true;
           var startDateMS = APMCD.Services.offsetToPSTms(parseInt(pointParams.x));
           var endDateMS = startDateMS + parseInt(pointParams.groupAggMS);
            
           params = {
                    startDateMS: startDateMS,
                    endDateMS: endDateMS,
                    concurrencyMode: _globalSettings.concurrencyMode,
                    integId: _globalSettings.integId,
                    compfil: _globalSettings.compfil,
                    allocatedList: _globalSettings.allocatedList
           };
        } else {
            _globalSettings.drilldown = false;
            params = {
                    startDateMS: _globalSettings.startDateMS,
                    endDateMS: _globalSettings.endDateMS,
                    concurrencyMode: _globalSettings.concurrencyMode,
                    integId: _globalSettings.integId,
                    compfil: _globalSettings.compfil,
                    allocatedList: _globalSettings.allocatedList
            };
        }

        $.when(
                _getConcurrencyDetailsData(params)
                .done(function(response) {
                    if (!response.success) {
                        alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                        return;
                    }
                    //console.log(response);
                    _overview1 = response.data.overview;
                    _concurrencyData = response.data;
                })
                .fail(function(response) {
                    //console.log(response);
                    alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
                }),

                _getViolationsData(params)
                .done(function(response) {
                    if (!response.success) {
                        alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                        return;
                    }
                    //console.log(response);
                    _violationsData = response.data;
                    _overview2 = response.data.overview;
                })
                .fail(function(response) {
                    //console.log(response);
                    alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
                })

        ).then(
                function () {
                    APMCD.Highcharts.renderConcurrencyCountChart(_concurrencyData, _violationsData);
                    if (_globalSettings.drilldown) {
                        $('.apm-cd-btn-drillup').show();
                    } else {
                        $('.apm-cd-btn-drillup').hide();
                        var overview = {..._overview1, ..._overview2};
                        APMCD.Components.updateOverviewPanel(overview);
                    }
                    $('.psgp-main-content').removeClass('psgp-loading-mask');
                }
        );

    }

    function convertToPSTms(dateObj, timeString) {
        var y, m, d, hr, min;
        y = dateObj.getFullYear();
        m = dateObj.getMonth() + 1;
        d = dateObj.getDate();
        hr = timeString.split(':')[0];
        min = timeString.split(':')[1];
        //console.log(''+ y + ' ' + m + ' ' + d + ' ' + hr + ' ' + min);

        //format to YYYY-MM-DDThh:mm:00.000Z
        var ISOString = '' + y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d) + 'T' + hr + ':' + min + ':00.000Z';
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

    function formatAMPM(hours, minutes) {
        var ampm = hours >= 12 ? APMTranslation.apm.common.time.pm() : APMTranslation.apm.common.time.am();
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    function convertMStoDateTimePST(dateObj, timeString) {
        var y, m, d, hr, min;
        y = dateObj.getFullYear();
        m = dateObj.getMonth();
        d = dateObj.getDate();
        hr = timeString.split(':')[0];
        min = timeString.split(':')[1];

        var dateStr = Highcharts.dateFormat('%b %e', new Date(Date.UTC(y, m, d)));
        var timeStr = formatAMPM(parseInt(hr, 10), parseInt(min, 10));

        return dateStr + ' ' + timeStr;
    }
    
    //function used for highcharts dates 
    function offsetToPSTms(dateMS) {
        //convert to dateObj
        var ISOdateObj = new Date(dateMS);
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

    return {
        getURL: getURL,
        refreshData: refreshData,
        getGlobalSettings: getGlobalSettings,
        convertToPSTms: convertToPSTms,
        convertMStoDateTimePST: convertMStoDateTimePST,
        offsetToPSTms: offsetToPSTms
    };

 };