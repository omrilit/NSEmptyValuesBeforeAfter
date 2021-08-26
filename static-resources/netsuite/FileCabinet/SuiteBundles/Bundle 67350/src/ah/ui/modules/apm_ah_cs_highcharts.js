/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 Mar 2019     alaurito         Initial
 * 2.00       18 Jul 2019     jmarimla         Expandable chart
 * 3.00       02 Aug 2019     jmarimla         Grid contents
 * 4.00       04 Mar 2019     jmarimla         Error rate tooltip
 * 5.00       24 Aug 2020     earepollo        Translation issues
 * 6.00       17 Sep 2020     lemarcelo        Added Highcharts.setOptions
 *
 */
APMAH = APMAH || {};

APMAH._Highcharts = function() {
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

    function renderExpandableRowChart ($container, chartType, chartData) {

        var chartConfig = null;

        switch (chartType) {
        case 'daily-error-rates':

            chartConfig = {
                chart: {
                    zoomType: 'xy',
                    plotBorderColor: '#555555',
                    plotBorderWidth: 0,
                    backgroundColor:'rgba(255, 255, 255, 0.0)'
                },
                title: {
                    text: '',
                    style: {
                        color: '#666666',
                        fontFamily: 'Arial',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    crosshairs: {
                        width: 1,
                        color: '#bbbbbb',
                        dashStyle: 'solid'
                    },
                    formatter: function() {
                        if (this.y == 0) return false;

                        var pointIndex = chartData.indices[this.x];

                        var errorRate = chartData['series'][pointIndex][1];
                        errorRate = errorRate.toFixed(2) + '%';

                        var groupAggMS = chartData.config.groupAggMS;
                        var groupAggString = '';
                        if (groupAggMS < 1000 * 60 * 60) {
                            var value = groupAggMS / (1000 * 60);
                            groupAggString = (value > 1) ? APMTranslation.apm.common.label.mins({params: [value]}) : APMTranslation.apm.common.label.min({params: [value]});
                        } else {
                            var value = groupAggMS / (1000 * 60 * 60);
                            groupAggString = (value > 1) ? APMTranslation.apm.common.label.hrs({params: [value]}) : APMTranslation.apm.common.label.hr({params: [value]});
                        }

                        var fromDate = Highcharts.dateFormat('%l:%M %p', this.x);
                        if (fromDate.endsWith('AM')) {
                            fromDate = fromDate.replace(/AM$/, APMTranslation.apm.common.time.am());
                        }
                        if (fromDate.endsWith('PM')) {
                            fromDate = fromDate.replace(/PM$/, APMTranslation.apm.common.time.pm());
                        }
                        var toDate = Highcharts.dateFormat('%l:%M %p', this.x + groupAggMS);
                        if (toDate.endsWith('AM')) {
                            toDate = toDate.replace(/AM$/, APMTranslation.apm.common.time.am());
                        }
                        if (toDate.endsWith('PM')) {
                            toDate = toDate.replace(/PM$/, APMTranslation.apm.common.time.pm());
                        }
                        var pointDate = Highcharts.dateFormat('%b %d %Y', this.x);

                        var table = '<div align="center"><b>' + pointDate + '</b></div>';
                        table += '<div align="center"><b>' + '(' + fromDate + ' - ' + toDate + ')' + '</b></div>';
                        table += '<div align="center">' + errorRate + '</div>';

                        return table;
                    },
                    shared: true,
                    useHTML: true
                },
                xAxis: {
                    type: 'datetime',
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
                        formatter: function() {
                            var label = this.axis.defaultLabelFormatter.call(this);
                            if (label.endsWith('AM')) {
                                label = label.replace(/AM$/, APMTranslation.apm.common.time.am());
                            }
                            if (label.endsWith('PM')) {
                                label = label.replace(/PM$/, APMTranslation.apm.common.time.pm());
                            }
                            return label;
                        },
                        style: {
                            color: '#666',
                            fontFamily: 'Arial',
                            fontSize: '11px',
                            fontWeight: 'normal'
                        }
                    },
                    tickLength: 5,
                    tickColor: '#555555',
                    lineColor: '#555555',
                    lineWidth: 0,
                    dateTimeLabelFormats: {
                        second: '%l:%M:%S %p',
                        minute: '%l:%M %p',
                        hour: '%l:%M %p',
                        day: '%m/%d<br>%l:%M %p',
                        week: '%m/%d<br>%l:%M %p',
                        month: '%m/%d<br>%l:%M %p',
                        year: '%l:%M %p'
                    },
                    minRange: 60 * 1000,
                    startOnTick: false,
                    endOnTick: false
                },
                yAxis: {
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
                    min: 0
                },
                series: [{
                    name: '',
                    type: 'column',
                    animation: false,
                    color: 'rgba(217, 94, 94, 0.7)',
                    fillColor: 'rgba(217, 94, 94, 0.7)',
                    lineColor: 'rgba(217, 94, 94, 0.7)',
                    lineWidth: 0,
                    data: chartData.series
                }]
            };

            break;

        default:

        }

        if (chartConfig) $container.highcharts(chartConfig);
    }

    return {
        renderExpandableRowChart: renderExpandableRowChart
    }

};