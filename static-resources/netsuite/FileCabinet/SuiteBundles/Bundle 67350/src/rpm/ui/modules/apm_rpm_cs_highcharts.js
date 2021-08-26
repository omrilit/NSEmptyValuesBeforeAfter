/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Jan 2015     jmarimla         Initial
 * 2.00       28 Jan 2015     jmarimla         Record Tile Charts
 * 3.00       05 Feb 2015     jmarimla         Modified chart axes config
 * 4.00       07 Mar 2015     jmarimla         Set startontick and endontick to false
 * 5.00       12 Mar 2015     jmarimla         Added onclick triggers for url redirect
 *                                             TODO: enable redirect url when ported to new record type API
 * 6.00       16 Mar 2015     jmarimla         Add hover to record charts and other chart UI changes
 * 7.00       21 Mar 2015     jmarimla         Remove chart borders, enable linking to SPM
 * 8.00       23 Mar 2015     jmarimla         User event and workflow stacked chart; fixed zooming
 * 9.00       24 Mar 2015     jmarimla         Disable clicking for zero values, set minimum range to .01
 * 10.00      27 Mar 2015     jmarimla         Linking of histogram to SPM
 * 11.00      31 Mar 2015     jmarimla         Fixed totaltime in response time chart; x-axis formatting in histogram
 * 12.00      10 Apr 2015     rwong            Change line width and color of the plotoptions for the recordtilechart.
 *                                             Added date in the tooltip of certain charts.
 *                                             Added synchronize mouseOver
 * 13.00      29 Apr 2015     jmarimla         Removed 'Over Time', removed 'Timeline' title
 *                                             Changed response time chart colors
 * 14.00      26 Jun 2015     jmarimla         Add plotlines in response time chart
 * 15.00      02 Jul 2015     jmarimla         Added mouseout event
 * 16.00      28 Jul 2015     rwong            Added zIndex to ensure that plotline is shown,
 *                                             Added plotline labels, change plotline color and
 *                                             Added minRange to ensure that 95th is always shown
 * 17.00      29 Jul 2015     jmarimla         Show number of users in throughput chart
 * 18.00      06 Aug 2015     rwong            Change number of users into bar chart
 *                                             Change no of instances in spline chart
 *                                             Change color of y axis
 * 19.00      28 Aug 2015     jmarimla         Add compfil in url redirect
 * 20.00      11 Sep 2015     jmarimla         Allow zoom in below 95th percentile
 * 21.00      26 Aug 2016     rwong            ScheduledScriptUsage portlet
 * 22.00      13 Sep 2016     rwong            Updated scheduled script usage portlet
 * 23.00      02 Oct 2017     jmarimla         Remove sched script portlet
 * 24.00      07 Jun 2018     jmarimla         Label change
 * 25.00      29 Jun 2018     jmarimla         Translation readiness
 * 26.00      26 Jul 2018     rwong            Highcharts translation
 * 27.00      10 Jan 2020     jmarimla         Customer debug changes
 * 28.00      27 Jul 2020     lemarcelo        Added chart note
 * 29.00      30 Jul 2020     jmarimla         r2020a strings
 * 30.00      06 Aug 2020     jmarimla         Changed note offset
 * 31.00      11 Aug 2020     earepollo        ExtJS to jQuery
 * 32.00      19 Oct 2020     earepollo        Fixed bug in customer debugging
 *
 */

APMRPM = APMRPM || {};

APMRPM._Highcharts = function () {
    Highcharts.wrap(Highcharts.Axis.prototype, "getPlotLinePath", function (
        proceed
    ) {
        var path = proceed.apply(
            this,
            Array.prototype.slice.call(arguments, 1)
        );
        if (path) {
            path.flat = false;
        }
        return path;
    });
    Highcharts.setOptions({
        lang: {
            drillUpText: APMTranslation.apm.r2020a.backtopreviousview(),
            loading: APMTranslation.apm.common.label.loading() + "...",
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
            ]
        }
    });

    var _recordConfigData = {};
    var _recordChartsData = {};

    function setRecordConfigData(configData) {
        _recordConfigData = configData;
    }

    function setRecordChartsData(chartsData) {
        _recordChartsData = chartsData;
    }

    function recordTileChart($container, chartData, threshold) {
        var chartData = chartData ? JSON.parse(chartData) : [[0, 0]];
        var chartConfig = {
            chart: {
                type: "line",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                plotBorderColor: "#555555",
                plotBorderWidth: 0
            },
            title: {
                text: ""
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            tooltip: {
                enabled: false
            },
            xAxis: {
                type: "datetime",
                labels: {
                    formatter: function () {
                        var label = this.axis.defaultLabelFormatter.call(this);
                        if (label.endsWith("AM")) {
                            label = label.replace(
                                /AM$/,
                                APMTranslation.apm.common.time.am()
                            );
                        }
                        if (label.endsWith("PM")) {
                            label = label.replace(
                                /PM$/,
                                APMTranslation.apm.common.time.pm()
                            );
                        }
                        return label;
                    },
                    enabled: false
                },
                tickLength: 0,
                lineColor: "#555555",
                lineWidth: 0,
                tickInterval: _recordConfigData.intervalMS,
                min: _recordConfigData.startDateMS,
                max: _recordConfigData.endDateMS,
                startOnTick: false,
                endOnTick: false
            },
            yAxis: {
                title: {
                    text: ""
                },
                labels: {
                    style: {
                        color: "#999999",
                        fontFamily: "Arial",
                        fontSize: "8px"
                    }
                },
                plotLines: [
                    {
                        color: "#666666",
                        width: 1,
                        dashStyle: "Dash",
                        value: threshold,
                        zIndex: 5
                    }
                ],
                min: 0,
                minRange: threshold
            },
            plotOptions: {
                series: {
                    lineWidth: 0.75,
                    color: "#2b78e4",
                    animation: false,
                    marker: {
                        enabled: false
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }
            },
            series: [
                {
                    data: chartData
                }
            ]
        };

        $container.highcharts(chartConfig);
    }

    function recordResponseTimeChart(chartParams) {
        var $container = $(".apm-rpm-recordtile-charts .execution");
        var chartData = _recordChartsData.responseTime;
        var chartConfig = {
            chart: {
                type: "area",
                zoomType: "xy",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                plotBorderColor: "#555555",
                plotBorderWidth: 0,
                events: {
                    load: function () {
                        var render = this.renderer;
                        this.chartNote = render
                            .label(
                                APMTranslation.apm.r2019a.clickanddragtozoom()
                            )
                            .css({
                                color: "#666666",
                                fontSize: "12px"
                            })
                            .add();

                        this.chartNote.attr({
                            x: this.chartWidth - this.chartNote.width - 16,
                            y: 17
                        });
                    },
                    redraw: function () {
                        this.chartNote.attr({
                            x: this.chartWidth - this.chartNote.width - 16,
                            y: 17
                        });
                    }
                }
            },
            title: {
                text: APMTranslation.apm.common.label.responsetime(),
                style: {
                    color: "#666666",
                    fontFamily: "Arial",
                    fontSize: "16px",
                    fontWeight: "bold"
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
                    color: "#bbbbbb",
                    dashStyle: "solid"
                },
                formatter: function () {
                    if (this.y == 0) return false;
                    var pointIndex = _recordChartsData.indexData[this.x];
                    if (typeof pointIndex === "undefined") return false;

                    var clientTime = chartData.clientTime[pointIndex][1];
                    var networkTime = chartData.networkTime[pointIndex][1];
                    var serverTime = chartData.serverTime[pointIndex][1];
                    var totalTime = chartData.totalTime[pointIndex][1];

                    var groupAggMS = _recordConfigData.groupAggMS;
                    var groupAggString = "";
                    if (groupAggMS < 1000 * 60 * 60) {
                        var value = groupAggMS / (1000 * 60);
                        groupAggString =
                            value > 1
                                ? APMTranslation.apm.common.label.mins({
                                      params: [value]
                                  })
                                : APMTranslation.apm.common.label.min({
                                      params: [value]
                                  });
                    } else {
                        var value = groupAggMS / (1000 * 60 * 60);
                        groupAggString =
                            value > 1
                                ? APMTranslation.apm.common.label.hrs({
                                      params: [value]
                                  })
                                : APMTranslation.apm.common.label.hr({
                                      params: [value]
                                  });
                    }

                    var fromDate = Highcharts.dateFormat("%l:%M %p", this.x);
                    if (fromDate.endsWith("AM")) {
                        fromDate = fromDate.replace(
                            /AM$/,
                            APMTranslation.apm.common.time.am()
                        );
                    }
                    if (fromDate.endsWith("PM")) {
                        fromDate = fromDate.replace(
                            /PM$/,
                            APMTranslation.apm.common.time.pm()
                        );
                    }
                    var toDate = Highcharts.dateFormat(
                        "%l:%M %p",
                        this.x + groupAggMS
                    );
                    if (toDate.endsWith("AM")) {
                        toDate = toDate.replace(
                            /AM$/,
                            APMTranslation.apm.common.time.am()
                        );
                    }
                    if (toDate.endsWith("PM")) {
                        toDate = toDate.replace(
                            /PM$/,
                            APMTranslation.apm.common.time.pm()
                        );
                    }
                    var pointDate = Highcharts.dateFormat("%b %d %Y", this.x);

                    var table = "<table>";
                    table +=
                        '<tr><td align="center" colspan="3"><b>' +
                        pointDate +
                        "</b></td></tr>";
                    table +=
                        '<tr><td align="center" colspan="3"><b>' +
                        groupAggString +
                        " (" +
                        fromDate +
                        " - " +
                        toDate +
                        ")</b></td></tr>";
                    table +=
                        '<tr><td align="center">' +
                        APMTranslation.apm.common.label.total() +
                        '</td><td>:</td><td align="center">' +
                        totalTime.toFixed(3) +
                        " s</td></tr>";
                    table +=
                        '<tr><td align="center">' +
                        APMTranslation.apm.common.label.client() +
                        '</td><td>:</td><td align="center">' +
                        clientTime.toFixed(3) +
                        " s</td></tr>";
                    table +=
                        '<tr><td align="center">' +
                        APMTranslation.apm.common.label.network() +
                        '</td><td>:</td><td align="center">' +
                        networkTime.toFixed(3) +
                        " s</td></tr>";
                    table +=
                        '<tr><td align="center">' +
                        APMTranslation.apm.common.label.server() +
                        '</td><td>:</td><td align="center">' +
                        serverTime.toFixed(3) +
                        " s</td></tr>";
                    table += "</table>";

                    return table;
                },
                shared: true,
                useHTML: true
            },
            xAxis: {
                type: "datetime",
                title: {
                    text: "",
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "14px",
                        fontWeight: "normal"
                    }
                },
                labels: {
                    formatter: function () {
                        var label = this.axis.defaultLabelFormatter.call(this);
                        if (label.endsWith("AM")) {
                            label = label.replace(
                                /AM$/,
                                APMTranslation.apm.common.time.am()
                            );
                        }
                        if (label.endsWith("PM")) {
                            label = label.replace(
                                /PM$/,
                                APMTranslation.apm.common.time.pm()
                            );
                        }
                        return label;
                    },
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "11px",
                        fontWeight: "normal"
                    }
                },
                tickLength: 5,
                //tickColor : '#555555',
                lineColor: "#555555",
                lineWidth: 0,
                dateTimeLabelFormats: {
                    second: "%l:%M:%S %p",
                    minute: "%l:%M %p",
                    hour: "%l:%M %p",
                    day: "%m/%d<br>%l:%M %p",
                    week: "%m/%d<br>%l:%M %p",
                    month: "%m/%d<br>%l:%M %p",
                    year: "%l:%M %p"
                },
                //tickInterval: _recordConfigData.intervalMS,
                minRange: 60 * 1000,
                min: _recordConfigData.startDateMS,
                max: _recordConfigData.endDateMS,
                startOnTick: false,
                endOnTick: false
            },
            yAxis: {
                title: {
                    text: APMTranslation.apm.common.label.responsetime(),
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "14px",
                        fontWeight: "normal"
                    }
                },
                labels: {
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "11px",
                        fontWeight: "normal"
                    }
                },
                plotLines: [
                    {
                        color: "#4F5ED6",
                        width: 1,
                        dashStyle: "Dash",
                        zIndex: 5,
                        label: {
                            align: "left",
                            text:
                                APMTranslation.apm.common.label
                                    .median()
                                    .toUpperCase() +
                                " - " +
                                chartData.totalTimeMed,
                            style: {
                                color: "#4F5ED6",
                                fontWeight: "bold",
                                fontSize: "10px",
                                fontFamily: "Open Sans,Helvetica,sans-serif"
                            },
                            x: 10,
                            y: 10
                        },
                        value: chartData.totalTimeMed
                    },
                    {
                        color: "#FA3424",
                        width: 1,
                        dashStyle: "Dash",
                        zIndex: 5,
                        label: {
                            align: "left",
                            text:
                                APMTranslation.apm.common.label
                                    ._95thpercentile()
                                    .toUpperCase() +
                                " - " +
                                chartData.totalTime95p,
                            style: {
                                color: "#FA3424",
                                fontWeight: "bold",
                                fontSize: "10px",
                                fontFamily: "Open Sans,Helvetica,sans-serif"
                            },
                            x: 10
                        },
                        value: chartData.totalTime95p
                    }
                ],
                min: 0
            },
            plotOptions: {
                area: {
                    stacking: "normal",
                    animation: false,
                    states: {
                        hover: {
                            lineWidth: 0,
                            lineWidthPlus: 0
                        }
                    },
                    events: {
                        mouseOut: function () {
                            hideTooltip();
                        }
                    },
                    cursor: "pointer",
                    point: {
                        events: {
                            click: function () {
                                var pointIndex =
                                    _recordChartsData.indexData[this.x];
                                if (typeof pointIndex === "undefined")
                                    return false;

                                var clientTime =
                                    chartData.clientTime[pointIndex][1];
                                var networkTime =
                                    chartData.networkTime[pointIndex][1];
                                var serverTime =
                                    chartData.serverTime[pointIndex][1];

                                if (
                                    clientTime == 0 &&
                                    networkTime == 0 &&
                                    serverTime == 0
                                )
                                    return;

                                var rectype = chartParams.recordtype;
                                var oper = chartParams.oper.substr(0, 1);
                                var compfil = chartParams.compfil;
                                var sdatetime = new Date(this.x)
                                    .toISOString()
                                    .substr(0, 19);
                                var dateDiffMS = _recordConfigData.groupAggMS;
                                var edatetime = new Date(this.x + dateDiffMS)
                                    .toISOString()
                                    .substr(0, 19);
                                var params = {
                                    rectype: rectype,
                                    oper: oper,
                                    sdatetime: sdatetime,
                                    edatetime: edatetime,
                                    compfil: compfil
                                };
                                //console.log(params);
                                redirectToPTS(params);
                            },
                            mouseOver: function () {
                                var pointIndex =
                                    _recordChartsData.indexData[this.x];
                                if (typeof pointIndex === "undefined")
                                    return false;

                                syncTooltip(
                                    "record",
                                    "responsetime",
                                    pointIndex
                                );
                            }
                        }
                    }
                }
            },
            series: [
                {
                    name: APMTranslation.apm.common.label.client(),
                    color: "#fc8d59",
                    fillColor: "rgba(252,141,89,0.8)",
                    lineColor: "rgba(252,141,89,1.0)",
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                fillColor: "#FFFFFF",
                                lineColor: "#fc8d59",
                                radiusPlus: 2,
                                lineWidthPlus: 1
                            }
                        }
                    },
                    data: chartData.clientTime
                },
                {
                    name: APMTranslation.apm.common.label.network(),
                    color: "#ffffbf",
                    fillColor: "rgba(255,255,180,0.8)",
                    lineColor: "rgba(255,255,180,1.0)",
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                fillColor: "#FFFFFF",
                                lineColor: "#ffffbf",
                                radiusPlus: 2,
                                lineWidthPlus: 1
                            }
                        }
                    },
                    data: chartData.networkTime
                },
                {
                    name: APMTranslation.apm.common.label.server(),
                    color: "#91bfdb",
                    fillColor: "rgba(145,191,219,0.8)",
                    lineColor: "rgba(145,191,219,1.0)",
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                fillColor: "#FFFFFF",
                                lineColor: "#91bfdb",
                                radiusPlus: 2,
                                lineWidthPlus: 1
                            }
                        }
                    },
                    data: chartData.serverTime
                },
                {
                    name: "95p",
                    type: "column",
                    color: "rgba(255,255,255,0)",
                    borderColor: "rgba(255,255,255,0)",
                    marker: {
                        enabled: false
                    },
                    showInLegend: false,
                    data: [
                        [
                            chartData.clientTime[0][0],
                            Math.round(chartData.totalTime95p)
                        ]
                    ]
                }
            ]
        };

        $container.highcharts(chartConfig);
    }

    function recordThroughputChart(chartParams) {
        var $container = $(".apm-rpm-recordtile-charts .requests");
        var chartData = _recordChartsData.throughput;
        var chartConfig = {
            chart: {
                zoomType: "xy",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                plotBorderColor: "#555555",
                plotBorderWidth: 0,
                events: {
                    load: function () {
                        var render = this.renderer;
                        this.chartNote = render
                            .label(
                                APMTranslation.apm.r2019a.clickanddragtozoom()
                            )
                            .css({
                                color: "#666666",
                                fontSize: "12px"
                            })
                            .add();

                        this.chartNote.attr({
                            x: this.chartWidth - this.chartNote.width - 60,
                            y: 17
                        });
                    },
                    redraw: function () {
                        this.chartNote.attr({
                            x: this.chartWidth - this.chartNote.width - 60,
                            y: 17
                        });
                    }
                }
            },
            title: {
                text: APMTranslation.apm.db.label.throughput(),
                style: {
                    color: "#666666",
                    fontFamily: "Arial",
                    fontSize: "16px",
                    fontWeight: "bold"
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
                    color: "#bbbbbb",
                    dashStyle: "solid"
                },
                formatter: function () {
                    if (this.y == 0) return false;

                    var pointIndex = _recordChartsData.indexData[this.x];
                    var logsTotal = chartData.logsTotal[pointIndex][1];
                    var usersTotal = chartData.usersTotal[pointIndex][1];

                    var groupAggMS = _recordConfigData.groupAggMS;
                    var groupAggString = "";
                    if (groupAggMS < 1000 * 60 * 60) {
                        var value = groupAggMS / (1000 * 60);
                        groupAggString =
                            value > 1
                                ? APMTranslation.apm.common.label.mins({
                                      params: [value]
                                  })
                                : APMTranslation.apm.common.label.min({
                                      params: [value]
                                  });
                    } else {
                        var value = groupAggMS / (1000 * 60 * 60);
                        groupAggString =
                            value > 1
                                ? APMTranslation.apm.common.label.hrs({
                                      params: [value]
                                  })
                                : APMTranslation.apm.common.label.hr({
                                      params: [value]
                                  });
                    }

                    var fromDate = Highcharts.dateFormat("%l:%M %p", this.x);
                    if (fromDate.endsWith("AM")) {
                        fromDate = fromDate.replace(
                            /AM$/,
                            APMTranslation.apm.common.time.am()
                        );
                    }
                    if (fromDate.endsWith("PM")) {
                        fromDate = fromDate.replace(
                            /PM$/,
                            APMTranslation.apm.common.time.pm()
                        );
                    }
                    var toDate = Highcharts.dateFormat(
                        "%l:%M %p",
                        this.x + groupAggMS
                    );
                    if (toDate.endsWith("AM")) {
                        toDate = toDate.replace(
                            /AM$/,
                            APMTranslation.apm.common.time.am()
                        );
                    }
                    if (toDate.endsWith("PM")) {
                        toDate = toDate.replace(
                            /PM$/,
                            APMTranslation.apm.common.time.pm()
                        );
                    }
                    var pointDate = Highcharts.dateFormat("%b %d %Y", this.x);

                    var recordsText =
                        logsTotal == 1
                            ? APMTranslation.apm.db.label
                                  .recordinstance()
                                  .toLowerCase()
                            : APMTranslation.apm.db.label
                                  .recordinstances()
                                  .toLowerCase();
                    var usersText =
                        usersTotal == 1
                            ? APMTranslation.apm.common.label
                                  .user()
                                  .toLowerCase()
                            : APMTranslation.apm.common.label
                                  .users()
                                  .toLowerCase();

                    var table = "<table>";
                    table +=
                        '<tr><td align="center"><b>' +
                        pointDate +
                        "</b></td></tr>";
                    table +=
                        "<tr><td><b>" +
                        groupAggString +
                        " (" +
                        fromDate +
                        " - " +
                        toDate +
                        ")</b></td></tr>";
                    table +=
                        "<tr><td>" +
                        logsTotal +
                        " " +
                        recordsText +
                        "</td></tr>";
                    table +=
                        "<tr><td>" +
                        usersTotal +
                        " " +
                        usersText +
                        "</td></tr>";
                    table += "</table>";

                    return table;
                },
                shared: true,
                useHTML: true
            },
            xAxis: {
                type: "datetime",
                title: {
                    text: "",
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "14px",
                        fontWeight: "normal"
                    }
                },
                labels: {
                    formatter: function () {
                        var label = this.axis.defaultLabelFormatter.call(this);
                        if (label.endsWith("AM")) {
                            label = label.replace(
                                /AM$/,
                                APMTranslation.apm.common.time.am()
                            );
                        }
                        if (label.endsWith("PM")) {
                            label = label.replace(
                                /PM$/,
                                APMTranslation.apm.common.time.pm()
                            );
                        }
                        return label;
                    },
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "11px",
                        fontWeight: "normal"
                    }
                },
                tickLength: 5,
                //tickColor : '#555555',
                lineColor: "#555555",
                lineWidth: 0,
                dateTimeLabelFormats: {
                    second: "%l:%M:%S %p",
                    minute: "%l:%M %p",
                    hour: "%l:%M %p",
                    day: "%m/%d<br>%l:%M %p",
                    week: "%m/%d<br>%l:%M %p",
                    month: "%m/%d<br>%l:%M %p",
                    year: "%l:%M %p"
                },
                //tickInterval: _recordConfigData.intervalMS,
                minRange: 60 * 1000,
                min: _recordConfigData.startDateMS,
                max: _recordConfigData.endDateMS,
                startOnTick: false,
                endOnTick: false
            },
            yAxis: [
                {
                    title: {
                        text: APMTranslation.apm.db.label.recordinstances(),
                        style: {
                            color: "#FC8D59",
                            fontFamily: "Arial",
                            fontSize: "14px",
                            fontWeight: "normal"
                        }
                    },
                    labels: {
                        style: {
                            color: "#FC8D59",
                            fontFamily: "Arial",
                            fontSize: "11px",
                            fontWeight: "normal"
                        }
                    },
                    allowDecimals: false,
                    min: 0,
                    minRange: 0.01
                },
                {
                    opposite: true,
                    title: {
                        text: APMTranslation.apm.common.label.numberofusers(),
                        style: {
                            color: "#91BFDB",
                            fontFamily: "Arial",
                            fontSize: "14px",
                            fontWeight: "normal"
                        }
                    },
                    labels: {
                        style: {
                            color: "#91BFDB",
                            fontFamily: "Arial",
                            fontSize: "11px",
                            fontWeight: "normal"
                        }
                    },
                    allowDecimals: false,
                    min: 0,
                    minRange: 0.01
                }
            ],
            plotOptions: {
                series: {
                    animation: false,
                    states: {
                        hover: {
                            lineWidth: 0,
                            lineWidthPlus: 0
                        }
                    },
                    events: {
                        mouseOut: function () {
                            hideTooltip();
                        }
                    },
                    cursor: "pointer",
                    point: {
                        events: {
                            click: function () {
                                if (this.y == 0) return false;

                                var rectype = chartParams.recordtype;
                                var oper = chartParams.oper.substr(0, 1);
                                var compfil = chartParams.compfil;
                                var sdatetime = new Date(this.x)
                                    .toISOString()
                                    .substr(0, 19);
                                var dateDiffMS = _recordConfigData.groupAggMS;
                                var edatetime = new Date(this.x + dateDiffMS)
                                    .toISOString()
                                    .substr(0, 19);
                                var params = {
                                    rectype: rectype,
                                    oper: oper,
                                    sdatetime: sdatetime,
                                    edatetime: edatetime,
                                    compfil: compfil
                                };
                                //console.log(params);
                                redirectToPTS(params);
                            },
                            mouseOver: function () {
                                var pointIndex =
                                    _recordChartsData.indexData[this.x];
                                if (typeof pointIndex === "undefined")
                                    return false;

                                syncTooltip("record", "throughput", pointIndex);
                            }
                        }
                    }
                }
            },
            series: [
                {
                    name: APMTranslation.apm.common.label.numberofusers(),
                    type: "column",
                    color: "#91BFDB",
                    fillColor: "rgba(145, 191, 219, 0.8)",
                    lineColor: "rgba(145, 191, 219, 1.0)",
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                fillColor: "#FFFFFF",
                                lineColor: "#3366ff",
                                radiusPlus: 2,
                                lineWidthPlus: 1
                            }
                        }
                    },
                    data: chartData.usersTotal,
                    yAxis: 1
                },
                {
                    name: APMTranslation.apm.db.label.recordinstances(),
                    type: "spline",
                    color: "#FC8D59",
                    fillColor: "rgba(252, 141, 89, 0.8)",
                    lineColor: "rgba(252, 141, 89, 1.0)",
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                fillColor: "#FFFFFF",
                                lineColor: "#83D97A",
                                radiusPlus: 2,
                                lineWidthPlus: 1
                            }
                        }
                    },
                    data: chartData.logsTotal
                }
            ]
        };

        $container.highcharts(chartConfig);
    }

    function recordUEWFBreakdownChart(chartParams) {
        var $container = $(".apm-rpm-recordtile-charts .context");
        var chartData = _recordChartsData.UEWFBreakdown;
        var chartConfig = {
            chart: {
                type: "area",
                zoomType: "xy",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                plotBorderColor: "#555555",
                plotBorderWidth: 0,
                events: {
                    load: function () {
                        var render = this.renderer;
                        this.chartNote = render
                            .label(
                                APMTranslation.apm.r2019a.clickanddragtozoom()
                            )
                            .css({
                                color: "#666666",
                                fontSize: "12px"
                            })
                            .add();

                        this.chartNote.attr({
                            x: this.chartWidth - this.chartNote.width - 16,
                            y: 17
                        });
                    },
                    redraw: function () {
                        this.chartNote.attr({
                            x: this.chartWidth - this.chartNote.width - 16,
                            y: 17
                        });
                    }
                }
            },
            title: {
                text: APMTranslation.apm.db.label.usereventworkflow(),
                style: {
                    color: "#666666",
                    fontFamily: "Arial",
                    fontSize: "16px",
                    fontWeight: "bold"
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
                    color: "#bbbbbb",
                    dashStyle: "solid"
                },
                formatter: function () {
                    var pointIndex = _recordChartsData.indexData[this.x];
                    if (typeof pointIndex === "undefined") return false;

                    var suitescriptTime =
                        chartData.suitescriptTime[pointIndex][1];
                    var workflowTime = chartData.workflowTime[pointIndex][1];

                    if (suitescriptTime == 0 && workflowTime == 0) return false;

                    var groupAggMS = _recordConfigData.groupAggMS;
                    var groupAggString = "";
                    if (groupAggMS < 1000 * 60 * 60) {
                        var value = groupAggMS / (1000 * 60);
                        groupAggString =
                            value > 1
                                ? APMTranslation.apm.common.label.mins({
                                      params: [value]
                                  })
                                : APMTranslation.apm.common.label.min({
                                      params: [value]
                                  });
                    } else {
                        var value = groupAggMS / (1000 * 60 * 60);
                        groupAggString =
                            value > 1
                                ? APMTranslation.apm.common.label.hrs({
                                      params: [value]
                                  })
                                : APMTranslation.apm.common.label.hr({
                                      params: [value]
                                  });
                    }

                    var fromDate = Highcharts.dateFormat("%l:%M %p", this.x);
                    if (fromDate.endsWith("AM")) {
                        fromDate = fromDate.replace(
                            /AM$/,
                            APMTranslation.apm.common.time.am()
                        );
                    }
                    if (fromDate.endsWith("PM")) {
                        fromDate = fromDate.replace(
                            /PM$/,
                            APMTranslation.apm.common.time.pm()
                        );
                    }
                    var toDate = Highcharts.dateFormat(
                        "%l:%M %p",
                        this.x + groupAggMS
                    );
                    if (toDate.endsWith("AM")) {
                        toDate = toDate.replace(
                            /AM$/,
                            APMTranslation.apm.common.time.am()
                        );
                    }
                    if (toDate.endsWith("PM")) {
                        toDate = toDate.replace(
                            /PM$/,
                            APMTranslation.apm.common.time.pm()
                        );
                    }
                    var pointDate = Highcharts.dateFormat("%b %d %Y", this.x);

                    var table = "<table>";
                    table +=
                        '<tr><td align="center" colspan="3"><b>' +
                        pointDate +
                        "</b></td></tr>";
                    table +=
                        '<tr><td align="center" colspan="3"><b>' +
                        groupAggString +
                        " (" +
                        fromDate +
                        " - " +
                        toDate +
                        ")</b></td></tr>";
                    table +=
                        '<tr><td align="center">' +
                        APMTranslation.apm.common.label.userevent() +
                        '</td><td>:</td><td align="center">' +
                        suitescriptTime.toFixed(3) +
                        " s</td></tr>";
                    table +=
                        '<tr><td align="center">' +
                        APMTranslation.apm.ns.context.workflow() +
                        '</td><td>:</td><td align="center">' +
                        workflowTime.toFixed(3) +
                        " s</td></tr>";
                    table += "</table>";

                    return table;
                },
                shared: true,
                useHTML: true
            },
            xAxis: {
                type: "datetime",
                title: {
                    text: "",
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "14px",
                        fontWeight: "normal"
                    }
                },
                labels: {
                    formatter: function () {
                        var label = this.axis.defaultLabelFormatter.call(this);
                        if (label.endsWith("AM")) {
                            label = label.replace(
                                /AM$/,
                                APMTranslation.apm.common.time.am()
                            );
                        }
                        if (label.endsWith("PM")) {
                            label = label.replace(
                                /PM$/,
                                APMTranslation.apm.common.time.pm()
                            );
                        }
                        return label;
                    },
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "11px",
                        fontWeight: "normal"
                    }
                },
                tickLength: 5,
                //tickColor : '#555555',
                lineColor: "#555555",
                lineWidth: 0,
                dateTimeLabelFormats: {
                    second: "%l:%M:%S %p",
                    minute: "%l:%M %p",
                    hour: "%l:%M %p",
                    day: "%m/%d<br>%l:%M %p",
                    week: "%m/%d<br>%l:%M %p",
                    month: "%m/%d<br>%l:%M %p",
                    year: "%l:%M %p"
                },
                //tickInterval: _recordConfigData.intervalMS,
                minRange: 60 * 1000,
                min: _recordConfigData.startDateMS,
                max: _recordConfigData.endDateMS,
                startOnTick: false,
                endOnTick: false
            },
            yAxis: {
                title: {
                    text: APMTranslation.apm.common.label.executiontime(),
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "14px",
                        fontWeight: "normal"
                    }
                },
                labels: {
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "11px",
                        fontWeight: "normal"
                    }
                },
                min: 0,
                minRange: 0.01
            },
            plotOptions: {
                area: {
                    stacking: "normal",
                    animation: false,
                    states: {
                        hover: {
                            lineWidth: 0,
                            lineWidthPlus: 0
                        }
                    },
                    events: {
                        mouseOut: function () {
                            hideTooltip();
                        }
                    },
                    cursor: "pointer",
                    point: {
                        events: {
                            click: function () {
                                var pointIndex =
                                    _recordChartsData.indexData[this.x];
                                if (typeof pointIndex === "undefined")
                                    return false;

                                var suitescriptTime =
                                    chartData.suitescriptTime[pointIndex][1];
                                var workflowTime =
                                    chartData.workflowTime[pointIndex][1];

                                if (suitescriptTime == 0 && workflowTime == 0)
                                    return;

                                var rectype = chartParams.recordtype;
                                var oper = chartParams.oper.substr(0, 1);
                                var compfil = chartParams.compfil;
                                var sdatetime = new Date(this.x)
                                    .toISOString()
                                    .substr(0, 19);
                                var dateDiffMS = _recordConfigData.groupAggMS;
                                var edatetime = new Date(this.x + dateDiffMS)
                                    .toISOString()
                                    .substr(0, 19);
                                var params = {
                                    rectype: rectype,
                                    oper: oper,
                                    sdatetime: sdatetime,
                                    edatetime: edatetime,
                                    compfil: compfil
                                };
                                //console.log(params);
                                redirectToPTS(params);
                            },
                            mouseOver: function () {
                                var pointIndex =
                                    _recordChartsData.indexData[this.x];
                                if (typeof pointIndex === "undefined")
                                    return false;

                                syncTooltip(
                                    "record",
                                    "uewfbreakdown",
                                    pointIndex
                                );
                            }
                        }
                    }
                }
            },
            series: [
                {
                    name: APMTranslation.apm.common.label.userevent(),
                    color: "#7bccc4",
                    fillColor: "rgba(123, 204, 196, 0.8)",
                    lineColor: "rgba(123, 204, 196, 0.8)",
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                fillColor: "#FFFFFF",
                                lineColor: "#7bccc4",
                                radiusPlus: 2,
                                lineWidthPlus: 1
                            }
                        }
                    },
                    data: chartData.suitescriptTime
                },
                {
                    name: APMTranslation.apm.ns.context.workflow(),
                    color: "#0868ac",
                    fillColor: "rgba(8, 104, 172, 0.8)",
                    lineColor: "rgba(8, 104, 172, 0.8)",
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                fillColor: "#FFFFFF",
                                lineColor: "#0868ac",
                                radiusPlus: 2,
                                lineWidthPlus: 1
                            }
                        }
                    },
                    data: chartData.workflowTime
                }
            ]
        };

        $container.highcharts(chartConfig);
    }

    function recordHistogramChart(chartParams) {
        var $container = $(".apm-rpm-recordtile-charts .histogram");
        var chartData = _recordChartsData.histogram;
        var chartConfig = {
            chart: {
                type: "column",
                zoomType: "xy",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                plotBorderColor: "#555555",
                plotBorderWidth: 0,
                events: {
                    load: function () {
                        var render = this.renderer;
                        this.chartNote = render
                            .label(
                                APMTranslation.apm.r2019a.clickanddragtozoom()
                            )
                            .css({
                                color: "#666666",
                                fontSize: "12px"
                            })
                            .add();

                        this.chartNote.attr({
                            x: this.chartWidth - this.chartNote.width - 16,
                            y: 17
                        });
                    },
                    redraw: function () {
                        this.chartNote.attr({
                            x: this.chartWidth - this.chartNote.width - 16,
                            y: 17
                        });
                    }
                }
            },
            title: {
                text: APMTranslation.apm.r2020a.executiontimedistribution(),
                style: {
                    color: "#666666",
                    fontFamily: "Arial",
                    fontSize: "16px",
                    fontWeight: "bold"
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            tooltip: {
                formatter: function () {
                    if (this.y == 0) return false;

                    var total = _recordChartsData.histogram.total;
                    var percentage = (this.y / total) * 100;

                    var table = "<table>";
                    table +=
                        '<tr><td style="color:#2F7ED8">' +
                        APMTranslation.apm.db.label.recordinstances() +
                        "</td>" +
                        "<td>:</td>" +
                        "<td>" +
                        this.y +
                        "</td></tr>";
                    table +=
                        '<tr><td style="color:#2F7ED8">' +
                        APMTranslation.apm.r2020a.percentfromtotalinstances() +
                        "</td>" +
                        "<td>:</td>" +
                        "<td>" +
                        parseFloat(percentage.toFixed(2)) +
                        "%</td></tr>";
                    table += "</table>";

                    return table;
                },
                shared: true,
                useHTML: true
            },
            xAxis: {
                type: "linear",
                title: {
                    text: APMTranslation.apm.common.label.responsetime(),
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "14px",
                        fontWeight: "normal"
                    }
                },
                labels: {
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "11px",
                        fontWeight: "normal"
                    },
                    formatter: function () {
                        var label = this.value;
                        if (this.value == chartData.threshold)
                            label = ">" + chartData.threshold;
                        else if (this.value > chartData.threshold) label = "";
                        return label;
                    }
                },
                tickLength: 5,
                //tickColor : '#555555',
                lineColor: "#555555",
                lineWidth: 0,
                tickInterval: _recordConfigData.histogramTicks
            },
            yAxis: {
                title: {
                    text: APMTranslation.apm.db.label.recordinstances(),
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "14px",
                        fontWeight: "normal"
                    }
                },
                labels: {
                    style: {
                        color: "#666",
                        fontFamily: "Arial",
                        fontSize: "11px",
                        fontWeight: "normal"
                    }
                },
                allowDecimals: false,
                min: 0,
                minRange: 0.01
            },
            plotOptions: {
                series: {
                    color: "rgba(47, 126, 216, 0.8)",
                    animation: false,
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    cursor: "pointer",
                    point: {
                        events: {
                            click: function () {
                                if (this.y == 0) return false;

                                var rectype = chartParams.recordtype;
                                var oper = chartParams.oper.substr(0, 1);
                                var compfil = chartParams.compfil;
                                var sdatetime = new Date(
                                    _recordConfigData.startDateMS - OFFSET_MS
                                )
                                    .toISOString()
                                    .substr(0, 19);
                                var edatetime = new Date(
                                    _recordConfigData.endDateMS - OFFSET_MS
                                )
                                    .toISOString()
                                    .substr(0, 19);
                                var threshold =
                                    _recordChartsData.histogram.threshold;
                                var resolution =
                                    _recordChartsData.histogram.resolution;

                                var responsetimeoper = null;
                                var responsetime1 = null;
                                var responsetime2 = null;

                                if (this.x < threshold) {
                                    responsetimeoper = "bw";
                                    responsetime1 = this.x;
                                    responsetime2 = this.x + resolution;
                                } else {
                                    responsetimeoper = "gt";
                                    responsetime1 = threshold;
                                }

                                var params = {
                                    rectype: rectype,
                                    oper: oper,
                                    sdatetime: sdatetime,
                                    edatetime: edatetime,
                                    responsetimeoper: responsetimeoper,
                                    responsetime1: responsetime1,
                                    responsetime2: responsetime2,
                                    compfil: compfil
                                };
                                //console.log(params);
                                redirectToPTS(params);
                            }
                        }
                    }
                },
                column: {
                    groupPadding: 0,
                    pointPadding: 0.03,
                    borderColor: "#FFFFFF",
                    borderWidth: 0,
                    pointPlacement: 0.5
                }
            },
            series: [
                {
                    data: chartData.frequency
                }
            ]
        };

        $container.highcharts(chartConfig);
    }

    function syncTooltip(chartGroup, chartId, point) {
        function showResponseTimeTooltip() {
            var responseTimeChart = $(
                ".apm-rpm-recordtile-charts .execution"
            ).highcharts();
            responseTimeChart.tooltip.refresh([
                responseTimeChart.series[0].data[point]
            ]);
        }

        function showThroughputTooltip() {
            var throughputChart = $(
                ".apm-rpm-recordtile-charts .requests"
            ).highcharts();
            throughputChart.tooltip.refresh([
                throughputChart.series[0].data[point]
            ]);
        }

        function showUEWFBreakdownChart() {
            var UEWFBreakdownChart = $(
                ".apm-rpm-recordtile-charts .context"
            ).highcharts();
            UEWFBreakdownChart.tooltip.refresh([
                UEWFBreakdownChart.series[0].data[point]
            ]);
        }

        switch (chartGroup) {
            case "record":
                switch (chartId) {
                    case "responsetime":
                        showThroughputTooltip();
                        showUEWFBreakdownChart();
                        break;
                    case "throughput":
                        showResponseTimeTooltip();
                        showUEWFBreakdownChart();
                        break;
                    case "uewfbreakdown":
                        showResponseTimeTooltip();
                        showThroughputTooltip();
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
            $(".apm-rpm-recordtile-charts .execution").highcharts(),
            $(".apm-rpm-recordtile-charts .requests").highcharts(),
            $(".apm-rpm-recordtile-charts .context").highcharts()
        ];

        for (var i in charts) {
            var chart = charts[i];
            if (chart) {
                chart.tooltip.hide();
            }
        }
    }

    function redirectToPTS(params) {
        var paramString = $.param(params);
        var PTS_URL =
            "/app/site/hosting/scriptlet.nl?script=customscript_apm_pts_sl_main&deploy=customdeploy_apm_pts_sl_main";

        window.open(PTS_URL + "&" + paramString);
    }

    return {
        setRecordConfigData: setRecordConfigData,
        setRecordChartsData: setRecordChartsData,
        recordTileChart: recordTileChart,
        recordResponseTimeChart: recordResponseTimeChart,
        recordThroughputChart: recordThroughputChart,
        recordUEWFBreakdownChart: recordUEWFBreakdownChart,
        recordHistogramChart: recordHistogramChart
    };
};
