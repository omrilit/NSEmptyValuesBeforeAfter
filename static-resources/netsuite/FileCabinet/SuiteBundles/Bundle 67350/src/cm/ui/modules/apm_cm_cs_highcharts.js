/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       18 Jan 2018     jmarimla         Initial
 * 2.00       29 Jan 2018     rwong            Added concurrency heatmap
 * 3.00       02 Feb 2018     rwong            Fixed tooltip display
 * 4.00       06 Feb 2018     jmarimla         Concurrency details
 * 5.00       19 Feb 2018     jmarimla         Heatmap onclick
 * 6.00       19 Feb 2018     rwong            Violation chart
 * 7.00       23 Feb 2018     jmarimla         Remove concurrency details
 * 8.00       03 Mar 2018     jmarimla         Violations data
 * 9.00       04 Apr 2018     jmarimla         Labels
 * 10.00      17 Apr 2018     jmarimla         Customer debugging
 * 11.00      04 May 2018     jmarimla         Heatmap cursor
 * 12.00      11 May 2018     jmarimla         Percentage buckets
 * 13.00      15 May 2018     jmarimla         Modified Notes
 * 14.00      11 Jun 2018     jmarimla         Translation engine
 * 15.00      29 Jun 2018     justaris         Translation Readiness
 * 16.00      26 Jul 2018     rwong            Highcharts translation
 * 17.00      07 Jan 2019     rwong            Added note to customer debugging for concurrency limit
 * 18.00      12 Feb 2019     rwong            Support concurrency limit for customer debugging
 * 19.00      03 Mar 2019     jmarimla         Footnote for invalid concurrency
 * 20.00      28 Jun 2019     erepollo         Translation for new texts
 * 21.00      13 Mar 2020     jmarimla         Utilization chart
 * 22.00      20 Apr 2020     jmarimla         Minor ui changes
 * 23.00      08 Jun 2020     jmarimla         UI changes
 * 24.00      17 Jun 2020     jmarimla         Translation
 * 25.00      03 Jul 2020     jmarimla         Concurrency backend changes
 * 26.00      30 Jul 2020     jmarimla         r2020a strings
 * 27.00      24 Aug 2020     earepollo        Translation issues
 * 28.00      21 Sep 2020     earepollo        Changed heatmap text color to black
 * 29.00      22 Sep 2020     jmarimla         Remove integ url and fixed bugs
 *
 */
APMCM = APMCM || {};

APMCM._Highcharts = function() {

    Highcharts.setOptions({
        lang: {
            drillUpText: APMTranslation.apm.r2020a.backtopreviousview(),
            loading: APMTranslation.apm.common.label.loading() + '...',
            months: [
                APMTranslation.apm.common.month.january(),
                APMTranslation.apm.common.month.february(),
                APMTranslation.apm.common.month.march(),
                APMTranslation.apm.common.month.april(),
                APMTranslation.apm.common.month.may(),
                APMTranslation.apm.common.month.june(),
                APMTranslation.apm.common.month.july(),
                APMTranslation.apm.common.month.august(),
                APMTranslation.apm.common.month.september(),
                APMTranslation.apm.common.month.october(),
                APMTranslation.apm.common.month.november(),
                APMTranslation.apm.common.month.december()
            ],
            noData: APMTranslation.apm.r2020a.datafromyouraccountisnotavailablefordisplay(),
            resetZoom: APMTranslation.apm.common.highcharts.resetzoom(),
            resetZoomTitle: APMTranslation.apm.common.highcharts.resetzoom(),
            shortMonths: [
                APMTranslation.apm.common.shortmonth.january(),
                APMTranslation.apm.common.shortmonth.february(),
                APMTranslation.apm.common.shortmonth.march(),
                APMTranslation.apm.common.shortmonth.april(),
                APMTranslation.apm.common.shortmonth.may(),
                APMTranslation.apm.common.shortmonth.june(),
                APMTranslation.apm.common.shortmonth.july(),
                APMTranslation.apm.common.shortmonth.august(),
                APMTranslation.apm.common.shortmonth.september(),
                APMTranslation.apm.common.shortmonth.october(),
                APMTranslation.apm.common.shortmonth.november(),
                APMTranslation.apm.common.shortmonth.december()
            ],
            weekdays: [
                APMTranslation.apm.common.weekday.sunday(),
                APMTranslation.apm.common.weekday.monday(),
                APMTranslation.apm.common.weekday.tuesday(),
                APMTranslation.apm.common.weekday.wednesday(),
                APMTranslation.apm.common.weekday.thursday(),
                APMTranslation.apm.common.weekday.friday(),
                APMTranslation.apm.common.weekday.saturday()
            ],
        }
    });

    var _concurrencyHMData = {};
    var _violationsHMData = {};

    function setConcurrencyHMChart(chartData) {
        _concurrencyHMData = chartData;
    }

    function setViolationsHMChart(chartData) {
        _violationsHMData = chartData;
    }

    function renderUtilizationChart() {
        var globalSettings = APMCM.Services.getGlobalSettings();
        var utilizationTab = globalSettings.utilizationTab;

        var $container = $('.apm-cm-concurrency-section .chart');

        var chartData = _concurrencyHMData;
        var violationsData = _violationsHMData;

        //determine height based on number of yCategories
        var xLabelHeight = 180;
        var yHeight = 25 * (chartData.yCategories.length ? chartData.yCategories.length : 0)
        var totalHeight = xLabelHeight + yHeight;
        $container.height(totalHeight);

        var chartSeries = null;
        if (utilizationTab == 'peak') {
            chartSeries = chartData.series.peak;
        } else {
            chartSeries = chartData.series.average;
        }

        var formattedChartSeries = [];
        for (var i in chartSeries) {
            var chartValue = chartSeries[i][2];
            var violations = violationsData.series.violation[i][2];
            var colorString = null;
            if (violations > 0) {
                colorString = '#B85B5B';
            } else {
                colorString = '#FFFFFF';
                if (chartValue >= 0 && chartValue <= 25) {
                    colorString = '#E8F1F9';
                } else if (chartValue > 25 && chartValue <= 50) {
                    colorString = '#D1E4F4';
                } else if (chartValue > 50 && chartValue <= 75) {
                    colorString = '#BAD6EE';
                } else if (chartValue > 75 && chartValue <= 100) {
                    colorString = '#A3C8E8';
                } else if (chartValue > 100) {
                    colorString = '#B87241';
                }
            }

            var dataPoint = {
                    x: chartSeries[i][0],
                    y: chartSeries[i][1],
                    z: chartValue,
                    color: colorString,
                    violations: violations,
                    peakConcurrency: chartData.series.peak[i][2],
                    averageConcurrency: chartData.series.average[i][2]
            }
            var dataPoint =
            formattedChartSeries.push(dataPoint);
        }


        var chartConfig = {};

        chartConfig = {
                chart: {
                    type: 'heatmap',
                    plotBorderWidth: 1
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: chartData.xCategories,
                    opposite: false,
                    title: {
                        text: '',
                        style: {
                            color: '#666',
                            fontFamily: 'Arial',
                            fontSize: '14px',
                            fontWeight: 'normal'
                        }
                    },
                    labels: {
                        style: {
                            color: '#666',
                            fontFamily: 'Arial',
                            fontSize: '11px',
                            fontWeight: 'normal'
                        }
                    },
                    tickLength: 0,
                    min: 0,
                    max: chartData.xCategories.length - 1
                },
                yAxis: {
                    categories: chartData.yCategories,
                    reversed: true,
                    title: {
                        text: '',
                        style: {
                            color: '#666',
                            fontFamily: 'Arial',
                            fontSize: '14px',
                            fontWeight: 'normal'
                        }
                    },
                    labels: {
                        style: {
                            color: '#666',
                            fontFamily: 'Arial',
                            fontSize: '11px',
                            fontWeight: 'normal'
                        }
                    }
                },
                colorAxis: {
                    min: 0,
                    max: 125,
                    minColor: '#FFFFFF',
                    maxColor: '#75ADDD'
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    formatter: function() {
                        var chartData = _concurrencyHMData;

                        var pointDate = chartData.yCategories[this.point.y];
                        var fromDate = chartData.xCategories[this.point.x];
                        if (fromDate.endsWith('AM')) {
                            fromDate = fromDate.replace(/AM$/, APMTranslation.apm.common.time.am());
                        }
                        if (fromDate.endsWith('PM')) {
                            fromDate = fromDate.replace(/PM$/, APMTranslation.apm.common.time.pm());
                        }
                        var toDate = chartData.endTime[this.point.x];
                        if (toDate.endsWith('AM')) {
                            toDate = toDate.replace(/AM$/, APMTranslation.apm.common.time.am());
                        }
                        if (toDate.endsWith('PM')) {
                            toDate = toDate.replace(/PM$/, APMTranslation.apm.common.time.pm());
                        }
                        var peakConcurrency = this.point.peakConcurrency;
                        var averageConcurrency = this.point.averageConcurrency;
                        var violations = this.point.violations;

                        var groupAggMS = chartData.config.resolutionMS;
                        var groupAggString = '';
                        if (groupAggMS < 1000 * 60 * 60) {
                            var value = groupAggMS / (1000 * 60);
                            groupAggString = (value > 1) ? APMTranslation.apm.common.label.mins({params: [value]}) : APMTranslation.apm.common.label.min({params: [value]});
                        } else {
                            var value = groupAggMS / (1000 * 60 * 60);
                            groupAggString = (value > 1) ? APMTranslation.apm.common.label.hrs({params: [value]}) : APMTranslation.apm.common.label.hr({params: [value]});
                        }

                        var table = '<table style="padding:8px;background-color:rgba(255,255,255,0.8)" class="apm-cm-heatmap-tooltip">';
                        //table += '<tr><td class="date" align="left">' + pointDate + '</td></tr>';
                        //table += '<tr><td class="date" align="left">' + groupAggString + ' (' + fromDate + ' - ' + toDate + ')</td></tr>';
                        table += '<tr><td class="peak value">' + peakConcurrency + '</td><td class="peak label">' + APMTranslation.apm.cm.label.peakconcurrency() + '</td></tr>';
                        // table += '<tr><td class="average value">' + averageConcurrency + '</td><td class="average label">' + APMTranslation.apm.r2020a.averageconcurrency() + '</td></tr>';
                        table += '<tr><td class="errorrate value">' + violations + ' %</td><td class="errorrate label">' + APMTranslation.apm.common.label.errorrate() + '</td></tr>';
                        table += '</table>';
                        return table;
                    },
                    padding: 0,
                    useHTML: true
                },
                plotOptions: {
                    heatmap: {
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function() {
                                    var chartData = _concurrencyHMData;

                                    var dateRange = chartData.dateRange[this.x][this.y];

                                    var params = {
                                        startDateMS: dateRange[0],
                                        endDateMS: dateRange[1]
                                    };

                                    redirectToCD(params);
                                }
                            }
                        }
                    }
                },
                series: [{
                    name: APMTranslation.apm.common.label.concurrency(),
                    borderWidth: .5,
                    borderColor: '#EEEEEE',
                    data: formattedChartSeries,
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: '#000',
                            fontFamily: 'Arial',
                            fontSize: '11px',
                            fontWeight: 'normal',
                            textShadow: false
                        },
                        formatter: function() {
                            var value = this.point.z;
                            var label = '0';
                            if (value > 0 && value <= 25) {
                                label = '25';
                            } else if (value > 25 && value <= 50) {
                                label = '50';
                            } else if (value > 50 && value <= 75) {
                                label = '75';
                            } else if (value > 75 && value <= 100) {
                                label = '100';
                            } else if (value > 100) {
                                label = '100+';
                            }
                            return label;
                        }
                    }
                }]

            };

        $container.highcharts(chartConfig);
    }

    function redirectToCD(heatmapParams) {
        var globalSettings = APMCM.Services.getGlobalSettings();
        var concurrencyMode = '';
        if (globalSettings.allocatedList) {
            concurrencyMode = (globalSettings.integId) ? 'allocated' : 'unallocated';
        } else {
            concurrencyMode = 'noallocation';
        }

        var params = {
            startDateMS: heatmapParams.startDateMS,
            endDateMS: heatmapParams.endDateMS,
            compfil: globalSettings.compfil,
            integId: globalSettings.integId,
            concurrencyMode: concurrencyMode,
            allocatedList: globalSettings.allocatedList
        }

        var paramString = $.param(params);
        var CD_URL = '/app/site/hosting/scriptlet.nl?script=customscript_apm_cd_sl_main&deploy=customdeploy_apm_cd_sl_main';
        window.open(CD_URL + '&' + paramString);
    }

    return {
        setConcurrencyHMChart: setConcurrencyHMChart,
        setViolationsHMChart: setViolationsHMChart,
        renderUtilizationChart: renderUtilizationChart
    };

};