/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       27 Oct 2017     jmarimla         Initial
 * 2.00       10 Nov 2017     jmarimla         Status and queue/processor charts
 * 3.00       11 Dec 2017     jmarimla         Elevated status
 * 4.00       14 Dec 2017     jmarimla         Utilization, concurrency
 * 5.00       18 Dec 2017     jmarimla         Scripts by priority
 * 6.00       28 Dec 2017     jmarimla         Concurrency count label
 * 7.00       12 Jan 2018     jmarimla         Update labels
 * 8.00       23 Jan 2018     jmarimla         Utilization instances chart
 * 9.00       25 Jan 2018     jmarimla         Update tooltip and disable legend
 * 10.00      09 Feb 2018     jmarimla         Label changes
 * 11.00      04 Apr 2018     jmarimla         Labels
 * 12.00      04 May 2018     jmarimla         Heatmap cursor
 * 13.00      11 Jun 2018     jmarimla         Translation engine
 * 14.00      02 Jul 2018     rwong            Translation strings
 * 15.00      26 Jul 2018     rwong            Highcharts translation
 * 16.00      18 Aug 2019     jmarimla         Remove pointer cursor
 * 17.00      18 Mar 2020     earepollo        Missing translation in pie chart tooltip
 * 18.00      27 Jul 2020     lemarcelo        Added chart note
 * 19.00      30 Jul 2020     jmarimla         r2020a strings
 * 20.00      24 Aug 2020     earepollo        Translation issues
 *
 */
APMSCPM = APMSCPM || {};

APMSCPM._Highcharts = function() {

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

    var _statusesData = {};
    var _queueInstancesData = {};
    var _queueWaitTimeData = {};
    var _utilizationData = {};
    var _elevatedPrioData = {};
    var _concurrencyHMData = {};
    var _concurrencyDetData = {};
    var _scriptPriorityData = {};

    function renderStatusesChart(chartData) {
        _statusesData = chartData;

        var $container = APMSCPM.Components.$StatusPortlet.psgpPortlet('getBody');

        var chartConfig = {
            chart: {
                type: 'pie',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            title: {
                text: '',
                style: {
                    color: '#666',
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            },
            credits: {
                enabled: false
            },
            legend: {
                layout: 'horizontal',
                maxHeight: 60,
                itemStyle: {
                    width: 80
                },
                labelFormatter: function() {
                    var name = this.name;
                    switch (name) {
                        case "Complete":
                            return APMTranslation.apm.common.label.completed();
                        case "Processing":
                            return APMTranslation.apm.scpm.label.processing();
                        case "Pending":
                            return APMTranslation.apm.scpm.label.pending();
                        case "Deferred":
                            return APMTranslation.apm.scpm.label.deferred();
                        case "Retry":
                            return APMTranslation.apm.scpm.label.retry();
                        case "Failed":
                            return APMTranslation.apm.common.label.failed();
                        case "Cancelled":
                            return APMTranslation.apm.scpm.label.cancelled();
                        default:
                            return name;
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    var name = this.point.name;
                    switch (name) {
                        case "Complete":
                            name = APMTranslation.apm.common.label.completed();
                            break;
                        case "Processing":
                            name = APMTranslation.apm.scpm.label.processing();
                            break;
                        case "Pending":
                            name = APMTranslation.apm.scpm.label.pending();
                            break;
                        case "Deferred":
                            name = APMTranslation.apm.scpm.label.deferred();
                            break;
                        case "Retry":
                            name = APMTranslation.apm.scpm.label.retry();
                            break;
                        case "Failed":
                            name = APMTranslation.apm.common.label.failed();
                            break;
                        case "Cancelled":
                            name = APMTranslation.apm.scpm.label.cancelled();
                            break;
                        default:
                            return name;
                    }
                    var table = '<table>';
                    table += '<tr><td colspan="3" align="center"><b>' + name + ' (' + this.percentage.toFixed(2) + ' %)' + '</b></td></tr>';
                    table += '<tr><td align="left">' + APMTranslation.apm.scpm.label.jobs() + '</td><td>:</td><td align="left">' + this.point.y + '</td></tr>';
                    table += '</table>';

                    return table;
                },
                useHTML: true
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    animation: false,
                    borderWidth: 1,
                    slicedOffset: 20,
                    showInLegend: true,
                    dataLabels: {
                        enabled: false,
                        formatter: function() {
                            return Math.round(this.percentage * 100) / 100 + ' %';
                        },
                        distance: 10,
                        style: {
                            color: '#666',
                            fontFamily: 'Arial',
                            fontSize: '11px',
                            fontWeight: 'normal'
                        },
                        connectorColor: '#666'
                    },
                    colors: chartData.colors,
                    states: {
                        hover: {
                            enabled: true,
                            halo: false
                        }
                    }
                }
            },
            series: [{
                data: chartData.instances
            }]
        }

        $container.highcharts(chartConfig);
    }

    function renderQueueInstancesChart(chartData) {
        _queueInstancesData = chartData;

        var $container = $('.apm-scpm-queuedetails-chart.panel-1');

        var chartConfig = {
            chart: {
                type: 'pie',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            title: {
                text: APMTranslation.apm.scpm.label.jobs(),
                style: {
                    color: '#666',
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            },
            credits: {
                enabled: false
            },
            legend: {
                layout: 'horizontal',
                maxHeight: 60,
                itemStyle: {
                    width: 80
                }
            },
            tooltip: {
                formatter: function() {
                    var table = '<table>';
                    table += '<tr><td colspan="3" align="center"><b>' + this.point.name + ' (' + this.percentage.toFixed(2) + ' %)' + '</b></td></tr>';
                    table += '<tr><td align="left">' + APMTranslation.apm.scpm.label.jobs() + '</td><td>:</td><td align="left">' + this.point.y + '</td></tr>';
                    table += '</table>';

                    return table;
                },
                useHTML: true
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    animation: false,
                    borderWidth: 1,
                    slicedOffset: 20,
                    showInLegend: true,
                    dataLabels: {
                        enabled: false,
                        formatter: function() {
                            return Math.round(this.percentage * 100) / 100 + ' %';
                        },
                        distance: 10,
                        style: {
                            color: '#666',
                            fontFamily: 'Arial',
                            fontSize: '11px',
                            fontWeight: 'normal'
                        },
                        connectorColor: '#666'
                    },
                    colors: ["rgba(250, 182, 93, 0.8)", "rgba(122, 176, 217, 0.8)"],
                    states: {
                        hover: {
                            enabled: true,
                            halo: false
                        }
                    }
                }
            },
            series: [{
                data: [
                    [APMTranslation.apm.scpm.label.queues(), chartData.queues ? chartData.queues : 0],
                    [APMTranslation.apm.scpm.label.processors(), chartData.processors ? chartData.processors : 0]
                ]
            }]
        }

        $container.highcharts(chartConfig);
    }

    function renderQueueWaitTimeChart(chartData) {
        _queueWaitTimeData = chartData;

        var $container = $('.apm-scpm-queuedetails-chart.panel-2');

        var chartConfig = {
            chart: {
                zoomType: 'xy',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                plotBorderColor: '#555555',
                plotBorderWidth: 0,
                marginRight: 25,
                marginLeft: 75,
                events: {
                    load: function() {
                        var render = this.renderer;
                        this.chartNote = render.label(APMTranslation.apm.r2019a.clickanddragtozoom())
                        .css({
                            color: '#666666',
                            fontSize: '12px'
                         })
                         .add();

                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 32,
                            y: 27
                          })
                    },
                    redraw: function()
                    {
                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 32,
                            y: 27
                          })
                    }
                }
            },
            title: {
                text: APMTranslation.apm.scpm.label.averagewaittime(),
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
                    if (this.y === 0) return false;

                    var type = this.x;
                    var waitTime = this.y;

                    var table = '<table>';
                    table += '<tr><td align="center" colspan="3"><b>' + type + '</b></td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.label.waittime() + '</td><td>:</td><td align="center">' + waitTime + ' s</td></tr>';
                    table += '</table>';

                    return table;
                },
                shared: true,
                useHTML: true
            },
            xAxis: {
                type: 'category',
                labels: {
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
                categories: [APMTranslation.apm.scpm.label.queues(), APMTranslation.apm.scpm.label.processors()]
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
                    },
                    format: '{value} s'
                },
                min: 0
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        color: 'rgba(102,102,102)'
                    }
                }
            },
            series: [{
                name: APMTranslation.apm.common.label.waittime(),
                type: 'column',
                animation: false,
                color: 'rgba(33, 113, 181, 0.7)',
                fillColor: 'rgba(33, 113, 181, 0.7)',
                lineColor: 'rgba(33, 113, 181, 0.7)',
                lineWidth: 0,
                data: [{
                        "y": chartData.queues ? chartData.queues : 0,
                        "color": "rgba(250, 182, 93, 0.8)"
                    },
                    {
                        "y": chartData.processors ? chartData.processors : 0,
                        "color": "rgba(122, 176, 217, 0.8)"
                    }
                ]
            }]
        };

        $container.highcharts(chartConfig);
    }

    function renderUtilizationChart(chartData) {
        _utilizationData = chartData;

        var $container1 = $('.apm-scpm-utilization-chart.panel-1');

        var chartConfig1 = {
            chart: {
                zoomType: 'xy',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                plotBorderColor: '#555555',
                plotBorderWidth: 0,
                marginTop: 25,
                events: {
                    load: function() {
                        var render = this.renderer;
                        this.chartNote = render.label(APMTranslation.apm.r2019a.clickanddragtozoom())
                        .css({
                            color: '#666666',
                            fontSize: '12px'
                         })
                         .add();

                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 16,
                            y: 3
                          })
                    },
                    redraw: function()
                    {
                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 16,
                            y: 3
                          })
                    }
                }
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
                borderWidth: 0
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
                    var pointIndex = chartData.indices[this.x];

                    var utilized = chartData.utilized[pointIndex][1];
                    if (!utilized) return false;

                    var available = chartData.available[pointIndex][1];
                    var utilization = (utilized && available) ? utilized / (utilized + available) * 100 : 0;
                    utilization = utilization.toFixed(2);

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

                    var table = '<table>';
                    table += '<tr><td align="center" colspan="3"><b>' + pointDate + '</b></td></tr>';
                    table += '<tr><td align="center" colspan="3"><b>' + groupAggString + ' (' + fromDate + ' - ' + toDate + ')</b></td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.scpm.label.utilization() + '</td><td>:</td><td align="center">' + utilization + ' %</td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.r2020a.usedtime() + '</td><td>:</td><td align="center">' + utilized + ' s</td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.scpm.label.availabletime() + '</td><td>:</td><td align="center">' + available + ' s</td></tr>';
                    table += '</table>';

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
                    text: APMTranslation.apm.scpm.label.utilization(),
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
                    },
                    format: '{value} %'
                },
                min: 0
            },
            plotOptions: {
                series: {
                    events: {
                        mouseOut: function() {
                            hideTooltip();
                        },
                        legendItemClick: function() {
                            return false;
                        }
                    },
                    point: {
                        events: {
                            mouseOver: function() {
                                var pointIndex = chartData.indices[this.x];
                                syncToolTip('utilization', 'utilization', pointIndex);
                            }
                        }
                    }
                }
            },
            series: [{
                    name: APMTranslation.apm.scpm.label.available(),
                    legendIndex: 0,
                    type: 'column',
                    stacking: 'percent',
                    animation: false,
                    color: '#75ADDD',
                    fillColor: 'rgba(117, 173, 221, 0.8)',
                    lineColor: 'rgba(117, 173, 221, 0.8)',
                    lineWidth: 0,
                    data: chartData.available
                },
                {
                    name: APMTranslation.apm.r2020a.inuse(),
                    legendIndex: 1,
                    type: 'column',
                    stacking: 'percent',
                    animation: false,
                    color: '#FAB65D',
                    fillColor: 'rgba(250, 182, 93, 0.8)',
                    lineColor: 'rgba(250, 182, 93, 0.8)',
                    lineWidth: 0,
                    data: chartData.utilized
                }
            ]
        };

        $container1.highcharts(chartConfig1);


        var $container2 = $('.apm-scpm-utilization-chart.panel-2');

        var chartConfig2 = {
            chart: {
                zoomType: 'xy',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                plotBorderColor: '#555555',
                plotBorderWidth: 0,
                marginRight: 25,
                marginTop: 25,
                events: {
                    load: function() {
                        var render = this.renderer;
                        this.chartNote = render.label(APMTranslation.apm.r2019a.clickanddragtozoom())
                        .css({
                            color: '#666666',
                            fontSize: '12px'
                         })
                         .add();

                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 32,
                            y: 3
                          })
                    },
                    redraw: function()
                    {
                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 32,
                            y: 3
                          })
                    }
                }
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
                borderWidth: 0
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
                    var pointIndex = chartData.indices[this.x];

                    var low = chartData.instances.low[pointIndex][1];
                    var standard = chartData.instances.standard[pointIndex][1];
                    var high = chartData.instances.high[pointIndex][1];
                    var total = low + standard + high;

                    if (total == 0) return false;

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

                    var table = '<table>';
                    table += '<tr><td align="center" colspan="3"><b>' + pointDate + '</b></td></tr>';
                    table += '<tr><td align="center" colspan="3"><b>' + groupAggString + ' (' + fromDate + ' - ' + toDate + ')</b></td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.priority.low() + '</td><td>:</td><td align="center">' + low + '</td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.priority.standard() + '</td><td>:</td><td align="center">' + standard + '</td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.priority.high() + '</td><td>:</td><td align="center">' + high + '</td></tr>';
                    table += '<tr><td align="center"><b>' + APMTranslation.apm.common.label.total() + '</b></td><td>:</td><td align="center">' + total + '</td></tr>';
                    table += '</table>';

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
                    text: APMTranslation.apm.scpm.label.jobs(),
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
            plotOptions: {
                series: {
                    events: {
                        mouseOut: function() {
                            hideTooltip();
                        }
                    },
                    point: {
                        events: {
                            mouseOver: function() {
                                var pointIndex = chartData.indices[this.x];
                                syncToolTip('utilization', 'instances', pointIndex);
                            }
                        }
                    }
                }
            },
            series: [{
                name: APMTranslation.apm.common.priority.high(),
                legendIndex: 2,
                type: 'column',
                stacking: 'normal',
                animation: false,
                color: '#75ADDD',
                fillColor: 'rgba(117, 173, 221, 0.8)',
                lineColor: 'rgba(117, 173, 221, 0.8)',
                lineWidth: 0,
                data: chartData.instances.high
            }, {
                name: APMTranslation.apm.common.priority.standard(),
                legendIndex: 1,
                type: 'column',
                stacking: 'normal',
                animation: false,
                color: '#83D97A',
                fillColor: 'rgba(131, 217, 122, 0.8)',
                lineColor: 'rgba(131, 217, 122, 0.8)',
                lineWidth: 0,
                data: chartData.instances.standard
            }, {
                name: APMTranslation.apm.common.priority.low(),
                legendIndex: 0,
                type: 'column',
                stacking: 'normal',
                animation: false,
                color: '#FAB65D',
                fillColor: 'rgba(250, 182, 93, 0.8)',
                lineColor: 'rgba(250, 182, 93, 0.8)',
                lineWidth: 0,
                data: chartData.instances.low
            }]
        };

        $container2.highcharts(chartConfig2);
    }

    function renderElevatedPrioChart(chartData) {
        _elevatedPrioData = chartData;

        var $container = APMSCPM.Components.$ElevatedPrioPortlet.psgpPortlet('getBody');

        var chartConfig = {
            chart: {
                type: 'pie',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            title: {
                text: '',
                style: {
                    color: '#666',
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            },
            credits: {
                enabled: false
            },
            legend: {
                layout: 'horizontal',
                maxHeight: 60,
                itemStyle: {
                    width: 80
                }
            },
            tooltip: {
                formatter: function() {

                    var table = '<table>';
                    table += '<tr><td colspan="3" align="center"><b>' + this.point.name + ' (' + this.percentage.toFixed(2) + ' %)' + '</b></td></tr>';
                    table += '<tr><td align="left">' + APMTranslation.apm.scpm.label.jobs() + '</td><td>:</td><td align="left">' + this.point.y + '</td></tr>';
                    table += '</table>';

                    return table;
                },
                useHTML: true
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    animation: false,
                    borderWidth: 1,
                    slicedOffset: 20,
                    showInLegend: true,
                    dataLabels: {
                        enabled: false,
                        formatter: function() {
                            return Math.round(this.percentage * 100) / 100 + ' %';
                        },
                        distance: 10,
                        style: {
                            color: '#666',
                            fontFamily: 'Arial',
                            fontSize: '11px',
                            fontWeight: 'normal'
                        },
                        connectorColor: '#666'
                    },
                    colors: ["rgba(250, 182, 93, 0.8)", "rgba(122, 176, 217, 0.8)"],
                    states: {
                        hover: {
                            enabled: true,
                            halo: false
                        }
                    }
                }
            },
            series: [{
                data: [
                    [APMTranslation.apm.scpm.label.elevated(), chartData.elevated ? chartData.elevated : 0],
                    [APMTranslation.apm.scpm.label.original(), chartData.original ? chartData.original : 0]
                ]
            }]
        }

        $container.highcharts(chartConfig);
    }

    function renderConcurrencyHMChart(chartData) {
        _concurrencyHMData = chartData;

        var $container = APMSCPM.Components.$ConcurrencyPortlet.psgpPortlet('getBody');

        //determine height based on number of yCategories
        var xLabelHeight = 180;
        var yHeight = 25 * (chartData.yCategories.length ? chartData.yCategories.length : 0)
        var totalHeight = xLabelHeight + yHeight;
        $container.height(totalHeight);

        var chartConfig = {
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
                max: chartData.config.procCount || 2,
                minColor: '#FFFFFF',
                maxColor: '#75ADDD'
            },
            legend: {
                align: 'center',
                layout: 'horizontal'
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

                                APMSCPM.Components.showConcurrencyDetailsPopup(params);
                            }
                        }
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    //if (this.point.value === 0) return false;

                    var chartData = _concurrencyHMData;

                    var pointDate = chartData.xCategories[this.point.x];
                    var fromDate = chartData.yCategories[this.point.y];
                    if (fromDate.endsWith('AM')) {
                        fromDate = fromDate.replace(/AM$/, APMTranslation.apm.common.time.am());
                    }
                    if (fromDate.endsWith('PM')) {
                        fromDate = fromDate.replace(/PM$/, APMTranslation.apm.common.time.pm());
                    }
                    var toDate = chartData.endTime[this.point.y];
                    if (toDate.endsWith('AM')) {
                        toDate = toDate.replace(/AM$/, APMTranslation.apm.common.time.am());
                    }
                    if (toDate.endsWith('PM')) {
                        toDate = toDate.replace(/PM$/, APMTranslation.apm.common.time.pm());
                    }
                    var concurrency = this.point.value;

                    var groupAggMS = chartData.config.resolutionMS;
                    var groupAggString = '';
                    if (groupAggMS < 1000 * 60 * 60) {
                        var value = groupAggMS / (1000 * 60);
                        var label = (value > 1) ? 'mins' : 'min';
                        groupAggString = '' + value + ' ' + label;
                    } else {
                        var value = groupAggMS / (1000 * 60 * 60);
                        var label = (value > 1) ? 'hrs' : 'hr';
                        groupAggString = '' + value + ' ' + label;
                    }

                    var table = '<table>';
                    table += '<tr><td align="center" colspan="3"><b>' + pointDate + '</b></td></tr>';
                    table += '<tr><td align="center" colspan="3"><b>' + groupAggString + ' (' + fromDate + ' - ' + toDate + ')</b></td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.label.concurrency() + '</td><td>:</td><td align="center">' + concurrency + '</td></tr>';
                    table += '</table>';

                    return table;
                },
                useHTML: true
            },
            series: [{
                name: APMTranslation.apm.common.label.concurrency(),
                borderWidth: .5,
                borderColor: '#EEEEEE',
                data: chartData.series,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return this.point.value ? this.point.value : '';
                    },
                    style: {
                        color: '#666',
                        fontFamily: 'Arial',
                        fontSize: '11px',
                        fontWeight: 'normal',
                        textShadow: false
                    }
                }
            }]

        };

        $container.highcharts(chartConfig);
    }

    function renderConcurrencyDetChart(chartData, $container) {
        _concurrencyDetData = chartData;

        var chartConfig = {
            chart: {
                zoomType: 'xy',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                plotBorderColor: '#555555',
                plotBorderWidth: 0,
                marginTop: 25,
                events: {
                    load: function() {
                        var render = this.renderer;
                        this.chartNote = render.label(APMTranslation.apm.r2019a.clickanddragtozoom())
                        .css({
                            color: '#666666',
                            fontSize: '12px'
                         })
                         .add();

                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 16,
                            y: 3
                          })
                    },
                    redraw: function()
                    {
                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 16,
                            y: 3
                          })
                    }
                }
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
                enabled: false,
                borderWidth: 0
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
                    var pointIndex = chartData.indices[this.x];

                    var concurrency = chartData.concurrency[pointIndex][1];

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

                    var table = '<table>';
                    table += '<tr><td align="center" colspan="3"><b>' + pointDate + '</b></td></tr>';
                    table += '<tr><td align="center" colspan="3"><b>' + groupAggString + ' (' + fromDate + ' - ' + toDate + ')</b></td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.label.concurrency() + '</td><td>:</td><td align="center">' + concurrency + '</td></tr>';
                    table += '</table>';

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
                    text: APMTranslation.apm.common.label.concurrencycount(),
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
            plotOptions: {
                series: {
                    events: {
                        mouseOut: function() {}
                    },
                    point: {
                        events: {}
                    }
                }
            },
            series: [{
                name: APMTranslation.apm.common.label.concurrency(),
                type: 'spline',
                color: '#FC8D59',
                animation: false,
                fillColor: 'rgba(252, 141, 89, 0.8)',
                lineColor: 'rgba(252, 141, 89, 1.0)',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            fillColor: '#FFFFFF',
                            lineColor: '#FC8D59',
                            radiusPlus: 2,
                            lineWidthPlus: 1
                        }
                    }
                },
                data: chartData.concurrency
            }]
        };

        $container.highcharts(chartConfig);
    }

    function renderScriptPriorityChart(chartData) {
        var _scriptPriorityData = chartData;

        var $container1 = $('.apm-scpm-scriptpriority-chart.panel-1')

        var chartConfig1 = {
            chart: {
                zoomType: 'xy',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                plotBorderColor: '#555555',
                plotBorderWidth: 0,
                marginRight: 25,
                marginTop: 25,
                events: {
                    load: function() {
                        var render = this.renderer;
                        this.chartNote = render.label(APMTranslation.apm.r2019a.clickanddragtozoom())
                        .css({
                            color: '#666666',
                            fontSize: '12px'
                         })
                         .add();

                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 32,
                            y: 3
                          })
                    },
                    redraw: function()
                    {
                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 32,
                            y: 3
                          })
                    }
                }
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
                borderWidth: 0
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
                    var pointIndex = chartData.indices[this.x];

                    var low = chartData.waitTime.low[pointIndex][1];
                    var standard = chartData.waitTime.standard[pointIndex][1];
                    var high = chartData.waitTime.high[pointIndex][1];
                    var total = low + standard + high;

                    if (total == 0) return false;

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

                    var table = '<table>';
                    table += '<tr><td align="center" colspan="3"><b>' + pointDate + '</b></td></tr>';
                    table += '<tr><td align="center" colspan="3"><b>' + groupAggString + ' (' + fromDate + ' - ' + toDate + ')</b></td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.priority.low() + '</td><td>:</td><td align="center">' + low + ' s</td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.priority.standard() + '</td><td>:</td><td align="center">' + standard + ' s</td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.priority.high() + '</td><td>:</td><td align="center">' + high + ' s</td></tr>';
                    table += '</table>';

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
                    text: APMTranslation.apm.scpm.label.totalwaittime(),
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
                    },
                    format: '{value} s'
                },
                min: 0
            },
            plotOptions: {
                series: {
                    events: {
                        mouseOut: function() {
                            hideTooltip();
                        }
                    },
                    point: {
                        events: {
                            mouseOver: function() {
                                var pointIndex = chartData.indices[this.x];
                                syncToolTip('scriptPriority', 'waitTime', pointIndex);
                            }
                        }
                    }
                }
            },
            series: [{
                    name: APMTranslation.apm.common.priority.high(),
                    legendIndex: 2,
                    type: 'spline',
                    color: '#75ADDD',
                    animation: false,
                    fillColor: 'rgba(117, 173, 221, 0.8)',
                    lineColor: 'rgba(117, 173, 221, 0.8)',
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                fillColor: '#FFFFFF',
                                lineColor: '#75ADDD',
                                radiusPlus: 2,
                                lineWidthPlus: 1
                            }
                        }
                    },
                    data: chartData.waitTime.high
                },
                {
                    name: APMTranslation.apm.common.priority.standard(),
                    legendIndex: 1,
                    type: 'spline',
                    color: '#83D97A',
                    animation: false,
                    fillColor: 'rgba(131, 217, 122, 0.8)',
                    lineColor: 'rgba(131, 217, 122, 0.8)',
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                fillColor: '#FFFFFF',
                                lineColor: '#83D97A',
                                radiusPlus: 2,
                                lineWidthPlus: 1
                            }
                        }
                    },
                    data: chartData.waitTime.standard
                },
                {
                    name: APMTranslation.apm.common.priority.low(),
                    legendIndex: 0,
                    type: 'spline',
                    color: '#FAB65D',
                    animation: false,
                    fillColor: 'rgba(250, 182, 93, 0.8)',
                    lineColor: 'rgba(250, 182, 93, 0.8)',
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                fillColor: '#FFFFFF',
                                lineColor: '#83D97A',
                                radiusPlus: 2,
                                lineWidthPlus: 1
                            }
                        }
                    },
                    data: chartData.waitTime.low
                }
            ]
        };

        $container1.highcharts(chartConfig1);


        var $container2 = $('.apm-scpm-scriptpriority-chart.panel-2');

        var chartConfig2 = {
            chart: {
                zoomType: 'xy',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                plotBorderColor: '#555555',
                plotBorderWidth: 0,
                marginRight: 25,
                marginTop: 25,
                events: {
                    load: function() {
                        var render = this.renderer;
                        this.chartNote = render.label(APMTranslation.apm.r2019a.clickanddragtozoom())
                        .css({
                            color: '#666666',
                            fontSize: '12px'
                         })
                         .add();

                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 32,
                            y: 3
                          })
                    },
                    redraw: function()
                    {
                        this.chartNote.attr({
                            x: this. chartWidth - this.chartNote.width - 32,
                            y: 3
                          })
                    }
                }
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
                borderWidth: 0
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
                    var pointIndex = chartData.indices[this.x];

                    var low = chartData.instances.low[pointIndex][1];
                    var standard = chartData.instances.standard[pointIndex][1];
                    var high = chartData.instances.high[pointIndex][1];
                    var total = low + standard + high;

                    if (total == 0) return false;

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

                    var table = '<table>';
                    table += '<tr><td align="center" colspan="3"><b>' + pointDate + '</b></td></tr>';
                    table += '<tr><td align="center" colspan="3"><b>' + groupAggString + ' (' + fromDate + ' - ' + toDate + ')</b></td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.priority.low() + '</td><td>:</td><td align="center">' + low + '</td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.priority.standard() + '</td><td>:</td><td align="center">' + standard + '</td></tr>';
                    table += '<tr><td align="center">' + APMTranslation.apm.common.priority.high() + '</td><td>:</td><td align="center">' + high + '</td></tr>';
                    table += '<tr><td align="center"><b>' + APMTranslation.apm.common.label.total() + '</b></td><td>:</td><td align="center">' + total + '</td></tr>';
                    table += '</table>';

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
                    text: APMTranslation.apm.scpm.label.jobs(),
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
            plotOptions: {
                series: {
                    events: {
                        mouseOut: function() {
                            hideTooltip();
                        }
                    },
                    point: {
                        events: {
                            mouseOver: function() {
                                var pointIndex = chartData.indices[this.x];
                                syncToolTip('scriptPriority', 'instances', pointIndex);
                            }
                        }
                    }
                }
            },
            series: [{
                name: APMTranslation.apm.common.priority.high(),
                legendIndex: 2,
                type: 'column',
                stacking: 'normal',
                animation: false,
                color: '#75ADDD',
                fillColor: 'rgba(117, 173, 221, 0.8)',
                lineColor: 'rgba(117, 173, 221, 0.8)',
                lineWidth: 0,
                data: chartData.instances.high
            }, {
                name: APMTranslation.apm.common.priority.standard(),
                legendIndex: 1,
                type: 'column',
                stacking: 'normal',
                animation: false,
                color: '#83D97A',
                fillColor: 'rgba(131, 217, 122, 0.8)',
                lineColor: 'rgba(131, 217, 122, 0.8)',
                lineWidth: 0,
                data: chartData.instances.standard
            }, {
                name: APMTranslation.apm.common.priority.low(),
                legendIndex: 0,
                type: 'column',
                stacking: 'normal',
                animation: false,
                color: '#FAB65D',
                fillColor: 'rgba(250, 182, 93, 0.8)',
                lineColor: 'rgba(250, 182, 93, 0.8)',
                lineWidth: 0,
                data: chartData.instances.low
            }]
        };

        $container2.highcharts(chartConfig2);
    }

    function syncToolTip(chartGroup, chartId, point) {

        function showWaitTimeTooltip() {
            var chart = $('.apm-scpm-scriptpriority-chart.panel-1').highcharts();
            chart.tooltip.refresh([chart.series[0].data[point]]);
        }

        function showWaitTimeInstancesTooltip() {
            var chart = $('.apm-scpm-scriptpriority-chart.panel-2').highcharts();
            chart.tooltip.refresh([chart.series[0].data[point]]);
        }

        function showUtilizationTooltip() {
            var chart = $('.apm-scpm-utilization-chart.panel-1').highcharts();
            chart.tooltip.refresh([chart.series[0].data[point]]);
        }

        function showUtilizationInstancesTooltip() {
            var chart = $('.apm-scpm-utilization-chart.panel-2').highcharts();
            chart.tooltip.refresh([chart.series[0].data[point]]);
        }

        switch (chartGroup) {
            case 'scriptPriority':
                switch (chartId) {

                    case 'waitTime':
                        showWaitTimeInstancesTooltip();
                        break;

                    case 'instances':
                        showWaitTimeTooltip();
                        break;

                    default:
                        return;
                }

                break;

            case 'utilization':
                switch (chartId) {

                    case 'utilization':
                        showUtilizationInstancesTooltip();
                        break;

                    case 'instances':
                        showUtilizationTooltip();
                        break;

                    default:
                        return;
                }

                break;

            default:
                return;
        }
    }

    function hideTooltip() {
        var charts = [
            $('.apm-scpm-scriptpriority-chart.panel-1').highcharts(),
            $('.apm-scpm-scriptpriority-chart.panel-2').highcharts(),
            $('.apm-scpm-utilization-chart.panel-1').highcharts(),
            $('.apm-scpm-utilization-chart.panel-2').highcharts()
        ];

        for (var i in charts) {
            var chart = charts[i];
            if (chart) {
                chart.tooltip.hide();
            }
        }
    }

    return {
        renderStatusesChart: renderStatusesChart,
        renderQueueInstancesChart: renderQueueInstancesChart,
        renderQueueWaitTimeChart: renderQueueWaitTimeChart,
        renderUtilizationChart: renderUtilizationChart,
        renderElevatedPrioChart: renderElevatedPrioChart,
        renderConcurrencyHMChart: renderConcurrencyHMChart,
        renderConcurrencyDetChart: renderConcurrencyDetChart,
        renderScriptPriorityChart: renderScriptPriorityChart
    };
};