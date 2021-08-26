/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       08 Jan 2015     rwong            Initial
 * 2.00       29 Jan 2015     rwong            Updated highcharts definition and included support for drilldowns
 * 3.00       09 Feb 2015     rwong            Added min max configuration for datetime axis; Added min max for drilldowns
 *                                             Added support for resize of chart.
 **************************************************************************************************************************
 * 1.00       20 Feb 2015     rwong            Ported SPM to APM
 * 2.00       27 Feb 2015     rwong            Ported to Performance Search API
 * 4.00       03 Mar 2015     jmarimla         Fix date formatting
 * 5.00       10 Apr 2015     rwong            Updated tooltip format
 * 6.00       27 Apr 2015     jmarimla         Removed duplicate date on hover
 * 7.00       09 Jul 2015     jmarimla         Added drillup event, Added suitescript summary call on drilldown
 * 8.00       11 Aug 2015     rwong            Updated tooltip for SSA with support for drilldown
 * 9.00       29 Jun 2018     jmarimla         Translation readiness
 * 10.00      26 Jul 2018     rwong            Highcharts translation
 * 11.00      11 Jun 2020     earepollo        ExtJS to jQuery
 * 12.00      22 Jun 2020     earepollo        Fixed drilldown
 * 13.00      30 Jul 2020     jmarimla         r2020a strings
 * 14.00      24 Aug 2020     earepollo        Translation issues
 *
 */

APMSSA = APMSSA || {};

APMSSA._Highcharts = function() {

    var _perfChartConfig = {
        pointInterval: 1000
    }

    function getPerfChartConfig() {
        return _perfChartConfig;
    }

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

    function renderPerformanceChart(chartData, config) {
        var $container = APMSSA.Components.$PerformanceChartContainer.find('.chart');

        var chartConfig = {
            chart: {
                animation: false,
                type: 'column',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                events: {
                    drilldown: function(e) {
                        if (!e.seriesOptions) {
                            var chart = this;
                            var globalSettings = APMSSA.Services.getGlobalSettings();

                            globalSettings.drilldownStartDate = e.point.dateObj.substring(0, 19);
                            globalSettings.drilldownEndDate = e.point.nextDateObj.substring(0, 19);
                            globalSettings.drilldown = 'T';

                            APMSSA.Services.refreshData(chart, e.point);
                        }
                    },
                    drillup: function() {
                        var globalSettings = APMSSA.Services.getGlobalSettings();
                        globalSettings.drilldown = 'F';
                        _perfChartConfig.pointInterval = config.pointInterval;
                    },
                    load: function() {
                        var render = this.renderer;
                        this.chartNote = render.label(APMTranslation.apm.r2020a.clickbartodrilldown())
                        .css({
                            color: '#666666',
                            fontSize: '12px'
                         })
                         .add();

                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 16,
                            y: 25
                          })
                    },
                    redraw: function()
                    {
                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 16,
                            y: 25
                          })
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: APMTranslation.apm.ssa.label.suitescriptexecutionovertime(),
                style: {
                    color: '#666',
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fontWeight: 'normal'
                }
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: APMTranslation.apm.common.label.timeline(),
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
                min: config.xAxis.min,
                max: config.xAxis.max,
                dateTimeLabelFormats: {
                    second: '%l:%M:%S %p',
                    minute: '%l:%M %p',
                    hour: '%l:%M %p',
                    day: '%m/%d<br>%l:%M %p',
                    week: '%m/%d<br>%l:%M %p',
                    month: '%m/%d<br>%l:%M %p',
                    year: '%l:%M %p'
                },
                startOnTick: true,
                endOnTick: true
            },

            yAxis: {
                title: {
                    text: APMTranslation.apm.common.label.executiontime(),
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

            exporting: {
                enabled: false
            },

            legend: {
                enabled: false
            },

            tooltip: {
                crosshairs: {
                    width: 1,
                    color: '#bbbbbb',
                    dashStyle: 'solid'
                },
                formatter: function() {
                    if (this.y == 0)
                        return false;
                    var table = '<table>';
                    var groupAggMS = _perfChartConfig.pointInterval;
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

                    var logsTotal = '';
                    for (var i in this.points) {
                        if (this.points[i].x == this.x) {
                            logsTotal = this.points[i].point.logsTotal;
                        }
                    }

                    table += '<tr><td align="center" colspan="3"><b>' + pointDate + '</b></td></tr>';
                    table += '<tr><td align="center" colspan="3"><b>' + groupAggString + ' (' + fromDate + ' - ' + toDate + ')</b></td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.label.executiontime() + '</td><td>:</td><td align="center">' + this.y + 's</td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.label.instancecount() + '</td><td>:</td><td align="center">' + logsTotal + '</td></tr>';

                    table += '</table>';

                    return table;
                },
                shared: true,
                useHTML: true
            },

            plotOptions: {
                column: {
                    pointPadding: 0.1,
                    borderWidth: 0,
                    groupPadding: 0,
                    color: '#2f7ed8'
                }
            },

            series: [{
                name: 'Timeline',
                data: chartData
            }],

            drilldown: {
                series: []
            }
        };

        $container.highcharts(chartConfig);
    }

    return {
        getPerfChartConfig: getPerfChartConfig,
        renderPerformanceChart: renderPerformanceChart
    }

};