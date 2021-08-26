/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Feb 2018     jmarimla         Initial
 * 2.00       22 Feb 2018     jmarimla         Drilldown
 * 3.00       03 Apr 2018     jmarimla         Modify grid
 * 4.00       04 Apr 2018     jmarimla         Labels
 * 5.00       05 May 2018     jmarimla         Status column
 * 6.00       24 May 2018     jmarimla         Append LIMITEXCEEDED
 * 7.00       07 Jun 2018     jmarimla         Hide back button
 * 8.00       11 Jun 2018     jmarimla         Translation engine
 * 9.00       02 Jul 2018     justaris         Translation Readiness
 * 10.00      27 Nov 2018     jmarimla         CSV export
 * 11.00      15 Jan 2019     jmarimla         Translation
 * 12.00      11 Mar 2020     jmarimla         Overview portlet
 * 13.00      23 Mar 2020     jmarimla         Concurrency chart
 * 14.00      20 Apr 2020     earepollo        UI improvements
 * 15.00      01 Jun 2020     lemarcelo        Added chart note
 * 16.00      08 Jun 2020     jmarimla         UI changes
 * 17.00      15 Jun 2020     jmarimla         UI changes
 * 18.00      17 Jun 2020     jmarimla         Translation
 * 19.00      18 Jun 2020     earepollo        Label change
 * 20.00      22 Jun 2020     jmarimla         Translation
 * 21.00      03 Jul 2020     jmarimla         Concurrency backend changes
 * 22.00      30 Jul 2020     jmarimla         r2020a strings
 * 23.00      21 Sep 2020     earepollo        Hide average concurrency
 * 24.00      22 Sep 2020     jmarimla         Remove integ url
 * 25.00      19 Nov 2020     lemarcelo        Added help link and icon
 *
 */

APMCD = APMCD || {};

APMCD._Components = function() {

    var $TitleBar = $('<div>').psgpSuiteletTitle({
        title: APMTranslation.apm.cd.label.concurrencydetails()
    });

    var $ColumnPanel = $('<div>').psgpColumnPanel({
        columndef: [{
            width: '99%',
            padding: '0px 0px 0px 0px'
        }, {
            width: '1%',
            padding: '0px 0px 0px 0px'
        }]
    });

    var $TimeBar = $('<div class="apm-cd-timebar">' +
                        '<div class="mode">' +
                        '</div>' +
                        '<div class="integration">' +
                        '</div>' +
                        '<div class="timepaging">' +
                            '<div class="btn prev">' +
                            '</div>' +
                            '<div class="timelabel">' +
                            '</div>' +
                            '<div class="btn next">' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                    );

    $TimeBar.find('.timepaging .btn').click(function() {
        var me = this;
        var $btn = $(me);
        var globalSettings = APMCD.Services.getGlobalSettings();
        var startDateMS = globalSettings.startDateMS;
        var endDateMS = globalSettings.endDateMS;
        var diffMS = endDateMS - startDateMS;

        if ($btn.hasClass('prev')) {
            globalSettings.startDateMS = parseInt(startDateMS) - diffMS;
            globalSettings.endDateMS = parseInt(endDateMS) - diffMS;
        } else if ($btn.hasClass('next')) {
            globalSettings.startDateMS = parseInt(startDateMS) + diffMS;
            globalSettings.endDateMS = parseInt(endDateMS) + diffMS;
        }

        APMCD.Services.refreshData();

    });

    var $OverviewPortlet = $('<div>').psgpPortlet({
        title: APMTranslation.apm.common.label.overview()
    });

    var $OverviewDataPanel = $(
            '<div class="apm-cd-overviewdata">' +
                '<div class="section conclimit">' +
                    '<div class="title">' +
                        '<a href="" target="_blank">' + APMTranslation.apm.cm.label.concurrencylimit() + '</a>' +
                    '</div>' +
                    '<div class="content">' +
                    '</div>' +
                '</div>' +
                '<div class="divider">' +
                '</div>' +
                '<div class="section peakconc">' +
                    '<div class="title">' + APMTranslation.apm.cm.label.peakconcurrency() +
                    '</div>' +
                    '<div class="content">' +
                        '<div class="value">' +
                        '</div>' +
                        '<div class="date">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="divider">' +
                '</div>' +
                //hide average concurrency due to pending backend implementation
                // '<div class="section averageconc">' +
                //     '<div class="title">' + APMTranslation.apm.r2020a.averageconcurrency() +
                //     '</div>' +
                //     '<div class="content">' +
                //     '</div>' +
                // '</div>' +
                // '<div class="divider">' +
                // '</div>' +
                '<div class="section errorrate">' +
                    '<div class="title">' + APMTranslation.apm.common.label.errorrate() +
                    '</div>' +
                    '<div class="content">' +
                    '</div>' +
                '</div>' +
                '<div class="divider topinteg">' +
                '</div>' +
                '<div class="section topinteg">' +
                    '<div class="title">' + APMTranslation.apm.r2020a.topintegrationswithunallocatedlimits() +
                    '</div>' +
                    '<div class="content">' +
                    '</div>' +
                '</div>' +
            '</div>'
    );

    $OverviewPortlet.psgpPortlet('getBody')
        .append($OverviewDataPanel);

    var $BtnDrillUp = $('<div class="apm-cd-btn-drillup"></div>').psgpGrayButton({
        text: APMTranslation.apm.r2020a.backtopreviousview(),
        handler: function () {
            APMCD.Services.refreshData();
        }
    }).hide();

    $ConcurrencySection = $(
            '<div class="apm-cd-concurrency-section">' +
                '<div class="title">' +
                    '<div class="text">' +
                        APMTranslation.apm.common.label.concurrencycount() +
                    '</div>' +
                    '<div class="icon">' +
                    '</div>' +
                '</div>' +
                '<div class="toolbar">' +
                '</div>' +
                '<div class="chart-note">' +
                    APMTranslation.apm.r2019a.clickanddragtozoom() +
                '</div>' +
                '<div class="chart">' +
                '</div>' +
            '</div>'
    )
    $ConcurrencySection.find('.toolbar').append($BtnDrillUp);

    function showInstancesPopup(params) {
        var $obj;

        var markUp = '' +
            '<div class="apm-cd-popup-instances">' +
                '<div class="apm-cd-info-container">' +
                    '<div class="apm-cd-info"></div>' +
                    '<div class="text" style="text-transform:uppercase">' + APMTranslation.apm.r2019a.moreinformation() + '</div>' +
                '</div>' +
                '<div class="grid">' +
                '</div>' +
            '</div>';
        $obj = $(markUp);

        $obj.find('.apm-cd-info-container .apm-cd-info').click(function() {
            var helpUrl = '/app/help/helpcenter.nl?fid=section_160311627583.html';
            window.open(helpUrl);
        });

        var gridOptions = {
                url: APMCD.Services.getURL('instances'),
                sort: {
                    dataIndex: 'startDate',
                    dir: false,
                    remote: true
                },
                paging: {
                    pageLimit: 10
                },
                exportCSV: true,
                columns: [{
                    dataIndex: 'startDate',
                    width: '15%',
                    text: APMTranslation.apm.common.label.startdate()
                }, {
                    dataIndex: 'endDate',
                    width: '15%',
                    text: APMTranslation.apm.common.label.enddate()
                }, {
                    dataIndex: 'type',
                    text: APMTranslation.apm.common.label.type(),
                    renderer: function (value, record) {
                        if(value == "WEBSERVICE"){
                        return value = APMTranslation.apm.common.label.webservice().toUpperCase();
                        }
                        if(value == "RESTLET"){
                        return value = APMTranslation.apm.common.label.restlet().toUpperCase();
                        }
                        else{
                        return value;
                        }
                    }
                }, {
                    dataIndex: 'integration',
                    text: APMTranslation.apm.common.label.integration(),
                    sortable: false,
                    renderer: function (value, record) {
                        return (value) ? value : '-';
                    }
                }, {
                    dataIndex: 'operation',
                    text: APMTranslation.apm.common.label.operation(),
                    renderer: function (value, record) {
                        return (value) ? value : '-';
                    }
                }, {
                    dataIndex: 'scriptName',
                    text: APMTranslation.apm.common.label.scriptname(),
                    sortable: false,
                    renderer: function (value, record) {
                        return (value) ? value : '-';
                    }
                }, {
                    dataIndex: 'status',
                    width: '20%',
                    text: APMTranslation.apm.common.label.status(),
                    renderer: function (value, record) {
                        var translated = '';
                        switch (value) {
                        case 'FINISHED':
                            translated = APMTranslation.apm.ns.status.finished();
                            break;
                        case 'FAILED':
                            translated = APMTranslation.apm.common.label.failed();
                            break;
                        case 'REJECTEDACCOUNTCONCURRENCY':
                            translated = APMTranslation.apm.common.label.rejectedaccountconcurrency();
                            break;
                        case 'REJECTEDUSERCONCURRENCY':
                            translated = APMTranslation.apm.common.label.rejecteduserconcurrency();
                            break;
                        default: translated = value;
                        }
                        if (record.wouldBeRejected && value != 'REJECTEDACCOUNTCONCURRENCY' && value != 'REJECTEDUSERCONCURRENCY' ) {
                            return translated + '-LIMITEXCEEDED';
                        }
                        return translated;
                    }
                }]
            };

        $obj.psgpDialog({
            title: APMTranslation.apm.r2020a.concurrencyrequestlogs(),
            width: 1000
        });
        $obj.parents('.ui-dialog').css({
            "position": "absolute",
            "top": ( $(window).height() - $obj.parents('.ui-dialog').height() ) / 2+$(window).scrollTop() + "px",
            "left": ( $(window).width() - $obj.parents('.ui-dialog').width() ) / 2+$(window).scrollLeft() + "px"
        });

        var $grid = $obj.find('.grid').psgpGrid(gridOptions);

        $grid.psgpGrid('refreshDataRemote', params);
    }

    function updateOverviewPanel (data) {
        var $OverviewPanel = $('.apm-cd-overviewdata');
        var $TimeBar = $('.apm-cd-timebar');

        var globalSettings = APMCD.Services.getGlobalSettings();
        var integrationName = data.integrationName ? data.integrationName : '-';
        var pagingStartDateMS = data.pagingStartDateMS;
        var pagingEndDateMS = data.pagingEndDateMS;
        var concurrencyLimit = data.concurrencyLimit ? data.concurrencyLimit : '-';
        var peakConcurrencyValue = data.peakConcurrency.value ? data.peakConcurrency.value : '-';
        var peakConcurrencyDateMS = data.peakConcurrency.dateMS;
        var peakConcurrencyDate = Highcharts.dateFormat('%b %d %Y %l:%M %p', peakConcurrencyDateMS);
        if (peakConcurrencyDate.endsWith('AM')) {
            peakConcurrencyDate = peakConcurrencyDate.replace(/AM$/, APMTranslation.apm.common.time.am());
        }
        if (peakConcurrencyDate.endsWith('PM')) {
            peakConcurrencyDate = peakConcurrencyDate.replace(/PM$/, APMTranslation.apm.common.time.pm());
        }
        // var averageConcurrency = data.averageConcurrency ? data.averageConcurrency : '-';
        var errorRate = (data.totalRequests) ? (data.totalViolations / data.totalRequests) * 100: 0;
        errorRate = errorRate ? errorRate.toFixed(2) + '%' : '-';
        var topIntegrations = data.topIntegrations;
        var topIntegMarkUp = '';
        topIntegMarkUp += '<table class="topinteg-table">';
        for (var i in topIntegrations) {
            var integName = topIntegrations[i].name;
            var integrationId = topIntegrations[i].id;
            var requests = topIntegrations[i].value;
            var percent = (data.totalRequests) ? (requests / data.totalRequests) * 100: 0;
            percent = percent ? percent.toFixed(2) + '%' : 0;

            var integration = integName;
            // if (globalSettings.compfil == CD_PARAMS.myCompany) {
            //     integration =  '<a href="/app/common/integration/integrapp.nl?id=' + integrationId + '" target="_blank">' + integrationName + '</a>'
            // } else {
            //     integration = integrationName;
            // }

            topIntegMarkUp += '<tr><td class="integname">' + integration + '</td><td class="integpercent">' + percent + '</td>';
        }
        topIntegMarkUp += '</table>';
        var fromDate = Highcharts.dateFormat('%b %d %Y %l:%M %p', pagingStartDateMS);
        if (fromDate.endsWith('AM')) {
            fromDate = fromDate.replace(/AM$/, APMTranslation.apm.common.time.am());
        }
        if (fromDate.endsWith('PM')) {
            fromDate = fromDate.replace(/PM$/, APMTranslation.apm.common.time.pm());
        }
        var toDate = Highcharts.dateFormat('%b %d %Y %l:%M %p', pagingEndDateMS);
        if (toDate.endsWith('AM')) {
            toDate = toDate.replace(/AM$/, APMTranslation.apm.common.time.am());
        }
        if (toDate.endsWith('PM')) {
            toDate = toDate.replace(/PM$/, APMTranslation.apm.common.time.pm());
        }
        var timeLabel = fromDate + ' - ' + toDate;

        $TimeBar.find('.timelabel').html(timeLabel);

        if (globalSettings.concurrencyMode == 'unallocated') {

            $TimeBar.find('.integration').removeClass('hidden');
            $TimeBar.find('.mode').html( APMTranslation.apm.r2020a.unallocatedlimit() );
            $OverviewPanel.find('.topinteg').removeClass('hidden');

        } else if (globalSettings.concurrencyMode == 'allocated') {

            $TimeBar.find('.integration').removeClass('hidden');
            $TimeBar.find('.mode').html( APMTranslation.apm.r2020a.allocatedlimit() );
            $TimeBar.find('.integration').html(integrationName);
            $OverviewPanel.find('.topinteg').addClass('hidden');

        } else {

            $TimeBar.find('.mode').addClass('hidden');
            $TimeBar.find('.integration').addClass('hidden');
            $OverviewPanel.find('.topinteg').removeClass('hidden');

        }

        if (globalSettings.compfil == CD_PARAMS.myCompany) {
            if (globalSettings.concurrencyMode == 'noallocation' || globalSettings.concurrencyMode == 'unallocated' ) {
                var url = '/app/webservices/governance/governance.nl?';
                $OverviewPanel.find('.conclimit .title a').attr("href", url);
            } else if (globalSettings.concurrencyMode == 'allocated' && globalSettings.integId) {
                var url = '/app/common/integration/integrapp.nl?id=' + globalSettings.integId;
                $OverviewPanel.find('.conclimit .title a').attr("href", url);
            } else {
                $OverviewPanel.find('.conclimit .title a').removeAttr('href');
            }
        } else {
            $OverviewPanel.find('.conclimit .title a').removeAttr('href');
        }

        $OverviewPanel.find('.conclimit .content').html(concurrencyLimit);
        $OverviewPanel.find('.peakconc .content .value').html(peakConcurrencyValue);
        $OverviewPanel.find('.peakconc .content .date').html(peakConcurrencyDate);
        // $OverviewPanel.find('.averageconc .content').html(averageConcurrency);
        $OverviewPanel.find('.errorrate .content').html(errorRate);
        $OverviewPanel.find('.topinteg .content').html(topIntegMarkUp);

    }

    function initializeTooltips () {
        var selectors = [
            '.apm-cd-concurrency-section .title .icon'
        ];

        $( '.psgp-main-content' ).tooltip({
            tooltipClass: 'psgp-ui-tooltip',
            items: selectors.join(),
            position: { my: "left top", at: "left bottom", collision: "flipfit" },
            show: null,
            close: function (event, ui) {
                ui.tooltip.hover(
                    function () {
                        $(this).stop(true).fadeTo(400, 1);
                    },
                    function () {
                        $(this).fadeOut("400", function () {
                            $(this).remove();
                        })
                    }
                );
            },
            content: function() {
                var $element = $( this );

                if ($element.is('.apm-cd-concurrency-section .title .icon')) {
                    var note1 = APMTranslation.apm.r2020a.concurrencydetailsnote();
                    var note2 = APMTranslation.apm.r2020a.clickanitemonthelegendtoshoworhideitonthechart();
                    var linkText = APMTranslation.apm.r2020a.usingtheconcurrencydetailsdashboard();
                    var linkUrl = '/app/help/helpcenter.nl?fid=section_1526957070.html';
                    var markUp = '<div class="concurrency-section">' +
                                    '<div>' + note1 + '</div>' +
                                    '<br>' +
                                    '<div>' + note2 + '</div>' +
                                    '<br>' +
                                    '<div>' +
                                        APMTranslation.apm.r2020a.read() + ' ' + '<a target="_blank" href="'+ linkUrl +'">' + linkText + '</a>.' +
                                    '</div>' +
                                '</div>';
                    return markUp;
                }
            }
        });
    }

    return {
        $TitleBar: $TitleBar,
        $TimeBar: $TimeBar,
        $OverviewPortlet: $OverviewPortlet,
        $ColumnPanel: $ColumnPanel,
        $ConcurrencySection: $ConcurrencySection,

        showInstancesPopup: showInstancesPopup,
        updateOverviewPanel: updateOverviewPanel,
        initializeTooltips: initializeTooltips
    };

 };