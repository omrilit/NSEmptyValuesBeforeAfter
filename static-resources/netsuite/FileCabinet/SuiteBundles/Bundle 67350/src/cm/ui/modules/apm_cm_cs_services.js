/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       18 Jan 2018     jmarimla         Initial
 * 2.00       25 Jan 2018     rwong            Added kpi
 * 3.00       29 Jan 2018     rwong            Added concurrency heatmap
 * 4.00       06 Feb 2018     jmarimla         Concurrency details
 * 5.00       09 Feb 2018     jmarimla         Instance data
 * 6.00       19 Feb 2018     rwong            Violation chart
 * 7.00       23 Feb 2018     jmarimla         Remove concurrency details
 * 8.00       02 Mar 2018     jmarimla         Violations data
 * 9.00       12 Apr 2018     jmarimla         Concurrency data
 * 10.00      17 Apr 2018     jmarimla         Customer debugging
 * 11.00      11 Jun 2018     jmarimla         Translation engine
 * 12.00      02 Jul 2018     justaris         Translation Readiness
 * 13.00      03 Aug 2018     jmarimla         Translate custom date
 * 14.00      14 Dec 2018     jmarimla         Limit not available
 * 15.00      07 Jan 2019     rwong            Added note to customer debugging for concurrency limit
 * 16.00      12 Feb 2019     rwong            Support concurrency limit for customer debugging
 * 17.00      17 Sep 2019     erepollo         Parameter passing
 * 18.00      12 Mar 2020     lemarcelo        Overview portlet
 * 19.00      12 Mar 2020     earepollo        Allocated/Unallocated tabs
 * 20.00      13 Mar 2020     jmarimla         Utilization chart
 * 21.00      03 Jul 2020     jmarimla         Concurrency backend changes
 * 22.00      30 Jul 2020     jmarimla         r2020a strings
 * 23.00      22 Sep 2020     jmarimla         Remove integ url and fixed bugs
 */

APMCM = APMCM || {};

APMCM._Services = function() {

    var _testModeParam = '&testmode=' + TEST_MODE;

    var _urls = {
            kpi: '/app/site/hosting/scriptlet.nl?script=customscript_apm_cm_sl_kpi&deploy=customdeploy_apm_cm_sl_kpi' + _testModeParam,
            concurrencyHM: '/app/site/hosting/scriptlet.nl?script=customscript_apm_cm_sl_concurrencyhm&deploy=customdeploy_apm_cm_sl_concurrencyhm' + _testModeParam,
            violationsHM: '/app/site/hosting/scriptlet.nl?script=customscript_apm_cm_sl_violationshm&deploy=customdeploy_apm_cm_sl_violationshm' + _testModeParam,
    };

    var _kpi1 = [];
    var _kpi2 = [];

    var _globalParams = {};

    var _globalSettings = {
        dateRangeSelect: '' + 1000 * 60 * 60 * 24,
        startDateMS: '',
        endDateMS: '',
        asOf: '',
        integId: '',
        allocatedList: '',
        utilizationTab: 'peak',
        allocation: null
    };

    function getGlobalSettings() {
        return _globalSettings;
    }

    function getURL(name) {
        return _urls[name];
    }

    function getGlobalParams() {
        return _globalParams;
    }

    function _getKPIData(params) {
        var $xhr = $.ajax({
            url: _urls.kpi,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }

    function _getConcurrencyHMData(params) {
        var $xhr = $.ajax({
            url: _urls.concurrencyHM,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }

    function _getViolationsHMData(params) {
        var $xhr = $.ajax({
            url: _urls.violationsHM,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }
    
    function refreshData() {
        var maskHeight = $(window).height() - 100;
        APMCM.Components.$ColumnPanel.find('.psgp-column-panel-1').css({
            height: maskHeight + 'px'
        }).addClass('psgp-loading-mask');

        var startDateMS, endDateMS;
        if (_globalSettings.dateRangeSelect.indexOf('custom_') !== -1) {
            var dateSplit = _globalSettings.dateRangeSelect.split('_');
            endDateMS = dateSplit[2];
            startDateMS = dateSplit[1];
        } else {
            endDateMS = parseInt(_globalSettings.endDateMS);
            startDateMS = endDateMS - parseInt(_globalSettings.dateRangeSelect);
        }

        var params = {
            startDateMS: startDateMS,
            endDateMS: endDateMS,
            compfil: _globalSettings.compfil,
            integId: _globalSettings.integId
        };

        _globalParams = params;
        
        _getConcurrencyHMData(params)
        .done(function(response) {
            if (!response.success) {
                alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                return;
            }
            //console.log(response);
            
            APMCM.Highcharts.setConcurrencyHMChart(response.data);
            _globalSettings.asOf = response.data.config.refreshDate;
            _overview1 = response.data.overview;
            
            var allocations = response.data.allocations ? response.data.allocations : {} ;
            var allocatedList = '';
            for (var key in allocations) {
                if (allocations.hasOwnProperty(key)) {
                    if (allocatedList) allocatedList += '|';
                    allocatedList += key;
                }
            }
            _globalSettings.allocatedList = allocatedList;
            params.allocatedList = allocatedList;
            
            _getViolationsHMData(params)
                .done(function(response) {
                    if (!response.success) {
                        alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                        return;
                    }
                    //console.log(response);
                    APMCM.Highcharts.setViolationsHMChart(response.data);
                    _overview2 = response.data.overview;
                    
                    var integrations = response.data.integrations;
                    if (integrations && integrations.length > 0) {
                        APMCM.Components.$AllocationsTab.show();
                    } else {
                        APMCM.Components.$AllocationsTab.hide()
                    }
                    if (!params.integId && integrations && integrations.length > 0) {
                        $('.apm-cm-tabs .filter-integration option').remove();
                        var optionsMarkUp = '';
                        for (var i in integrations) {
                            var customValue = integrations[i].id;
                            var customLabel = integrations[i].name;
                            var markUp = '<option value="' + customValue + '">' + customLabel + '</option>';
                            optionsMarkUp += markUp;
                        }
                        $('.apm-cm-tabs .filter-integration select').append(optionsMarkUp);
                        $('.apm-cm-tabs .filter-integration .psgp-combobox').selectmenu('refresh');
                    }
                    
                    var overview = {..._overview1, ..._overview2};
                    APMCM.Components.updateOverviewPanel(overview);
                    APMCM.Highcharts.renderUtilizationChart();
                    APMCM.Components.$SettingsDateRange.trigger('updateLabel');
                    APMCM.Components.$ColumnPanel.find('.psgp-column-panel-1').removeClass('psgp-loading-mask');
                    _globalSettings.startDateMS = startDateMS;
                    _globalSettings.endDateMS = endDateMS;
                })
                .fail(function(response) {
                    //console.log(response);
                    alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
                })
        })
        .fail(function(response) {
            //console.log(response);
            alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
        })
        
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