/**
 * Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Feb 2015     jyeh             Initial
 * 2.00       04 Sep 2015     rwong            Disabled focus on selection in grid
 * 3.00       05 May 2018     jmarimla         Format client script labels
 * 4.00       29 Jun 2018     jmarimla         Translation readiness
 * 5.00       06 Jul 2018     jmarimla         Polishing translation
 * 6.00       26 Jul 2018     jmarimla         FRHT link
 * 7.00       18 Oct 2018     jmarimla         Redirect to profiler
 * 8.00       26 Oct 2018     jmarimla         Frht label
 * 9.00       08 Jan 2019     jmarimla         Translation
 * 10.00      07 Mar 2019     jmarimla         Client scripts disable frht
 * 11.00      12 Apr 2019     jmarimla         Move Profiler link
 * 12.00      08 Jul 2019     erepollo         Translation changes
 * 13.00      17 Jan 2020     jmarimla         Customer debug changes
 * 14.00      03 Apr 2020     earepollo        Added custom GL lines scripts
 * 15.00      21 Apr 2020     earepollo        ExtJS to jQuery
 * 16.00      15 Jun 2020     earepollo        Fixed Plug-In capitalization
 * 17.00      18 Jun 2020     earepollo        Translation readiness
 * 18.00      27 Jul 2020     lemarcelo        Added chart zoom feature
 * 19.00      30 Jul 2020     jmarimla         r2020a strings
 * 20.00      17 Sep 2020     lemarcelo        Added Highcharts.setOptions
 *
 */
APMPTD = APMPTD || {};

APMPTD._Highcharts = function() {
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

    function renderInstanceChartData(chartData) {
        var $container = APMPTD.Components.$TimelineChartContainer.find('.chart');

        var chartCategories = [];
        var chartSeries = [];

        var chartConfig = {
            chart: {
                zoomType: 'xy',
                animation: false,
                type: 'columnrange',
                inverted: true,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
            },
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            legend: {
                text: ''
            },
            xAxis: {
                type: 'Categories (s)',
                id: 'Categories',
                categories: chartData.categories,
                crosshair: true,
                labels: {
                    formatter: function() {
                        var text = this.value;
                        var formatted = '';
                        var title = '';
                        if (text.indexOf('Network') == 0) {
                            formatted = text.replace('Network', APMTranslation.apm.common.label.network());
                            title = formatted;
                        } else if (text.indexOf('Client : Header') == 0) {
                            formatted = text.replace('Client : Header', APMTranslation.apm.ptd.label.clientheader());
                            title = formatted;
                        } else if (text.indexOf('Client : Render') == 0) {
                            formatted = text.replace('Client : Render', APMTranslation.apm.ptd.label.clientrender());
                            title = formatted;
                        } else if (text.indexOf('Client : Init') == 0) {
                            formatted = text.replace('Client : Init', APMTranslation.apm.ptd.label.clientinit());
                            title = formatted;
                        } else if (text.indexOf('Workflow') == 0) {
                            formatted = text.replace('Workflow', APMTranslation.apm.ns.context.workflow());
                            title = formatted;
                            formatted = formatted.length > 25 ? formatted.substring(0, 25) + '<b> ...  <b>' : formatted;
                        } else if (text.indexOf('Script') == 0) {
                            formatted = text.replace('Script', APMTranslation.apm.ptd.label.script());
                            title = formatted;
                            formatted = formatted.length > 25 ? formatted.substring(0, 25) + '<b> ...  <b>' : formatted;
                        } else if (text.indexOf('Plug-in') == 0) {
                            formatted = text.replace('Plug-in', APMTranslation.apm.r2020a.plugin());
                            title = formatted;
                            formatted = formatted.length > 25 ? formatted.substring(0, 25) + '<b> ...  <b>' : formatted;
                        } else if (text.indexOf('ClientScript') == 0) {
                            formatted = text.replace('ClientScript', APMTranslation.apm.ptd.label.script());
                            title = formatted;
                            formatted = formatted.length > 25 ? formatted.substring(0, 25) + '<b> ...  <b>' : formatted;
                            formatted = '&nbsp;&nbsp;&nbsp;&nbsp;' + formatted;
                        } else {
                            title = formatted;
                            formatted = text.length > 25 ? text.substring(0, 25) + '<b> ...  <b>' : text;
                        }

                        return '<div class="standard" style="width:150px; overflow:hidden" title="' + title + '">' + formatted + '</div>';
                    },
                    useHTML: true
                }
            },
            yAxis: {
                title: APMTranslation.apm.common.label.datetime() + ' (s)',
                min: 0,
                max: chartData.totaltime,
            },
            tooltip: {
                formatter: function () {
                    var text = this.x;
                    var formatted = '';
                    var addFrhtLink = false;
                    if (text.indexOf('Network') == 0) {
                        formatted = text.replace('Network', APMTranslation.apm.common.label.network());
                    } else if (text.indexOf('Client : Header') == 0) {
                        formatted = text.replace('Client : Header', APMTranslation.apm.ptd.label.clientheader());
                    } else if (text.indexOf('Client : Render') == 0) {
                        formatted = text.replace('Client : Render', APMTranslation.apm.ptd.label.clientrender());
                    } else if (text.indexOf('Client : Init') == 0) {
                        formatted = text.replace('Client : Init', APMTranslation.apm.ptd.label.clientinit());
                    } else if (text.indexOf('Workflow') == 0) {
                        formatted = text.replace('Workflow', APMTranslation.apm.ns.context.workflow());
                        addFrhtLink = true;
                    } else if (text.indexOf('Script') == 0) {
                        formatted = text.replace('Script', APMTranslation.apm.ptd.label.script());
                        addFrhtLink = true;
                    } else if (text.indexOf('Plug-in') == 0) {
                        formatted = text.replace('Plug-in', APMTranslation.apm.r2020a.plugin());
                        addFrhtLink = true;
                    } else if (text.indexOf('ClientScript') == 0) {
                        formatted = text.replace('ClientScript', APMTranslation.apm.ptd.label.script());
                        addFrhtLink = false;
                    }
                    var totalTime = Number(this.point.high - this.point.low).toFixed(3);

                    var markUp = '<table>';
                    markUp += '<tr><td>' + formatted + ' : ' + totalTime + 's' + '</td></tr>';
                    markUp += '</table>'

                    return markUp;
                },
                useHTML: true
            },
            series: [
                {
                    name : 'Time (s)',
                    id: 'Time',
                    color: 'rgba(96, 119, 153, 0.8)',
                    pointPadding: 0.1,
                    groupPadding: 0,
                    pointWidth: 20,
                    height: 0.75,
                    data: chartData.series
                }
            ],
            plotOptions: {
                columnrange: {
                    allowPointSelect: false,
                    animation: false,
                    borderWidth: 0,
                    slicedOffset: 20,
                    showInLegend: false,
                    dataLabels: {
                        enabled: false,
                        allowOverlap: false,
                        formatter: function () {
                            return this.y + 's';
                        },
                        style: {
                            color : '#666',
                            fontFamily : 'Arial',
                            fontSize : '11px',
                            fontWeight: 'normal'
                        },
                        overflow: 'justify',
                        crop: false
                    }
                }
            }
        };

        $container.highcharts(chartConfig);
    }

    return {
        renderInstanceChartData: renderInstanceChartData
    }

};