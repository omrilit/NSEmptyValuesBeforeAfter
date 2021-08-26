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
 * 4.00       02 Feb 2018     jmarimla         Concurrency details
 * 5.00       09 Feb 2018     jmarimla         Instance popup
 * 6.00       19 Feb 2018     rwong            Violation chart
 * 7.00       23 Feb 2018     jmarimla         Remove concurrency details
 * 8.00       23 Mar 2018     jmarimla         Daterange options
 * 9.00       04 Apr 2018     jmarimla         Labels
 * 10.00      17 Apr 2018     jmarimla         Customer debugging
 * 11.00      11 May 2018     jmarimla         Chart Legend and footnote
 * 12.00      11 Jun 2018     jmarimla         Translation engine
 * 13.00      02 Jul 2018     justaris         Translation Readiness
 * 14.00      12 Mar 2020     lemarcelo        Overview portlet
 * 15.00      12 Mar 2020     earepollo        Allocated/Unallocated tabs
 * 16.00      13 Mar 2020     lemarcelo        Update overview
 * 17.00      13 Mar 2020     jmarimla         Utilization chart
 * 18.00      20 Apr 2020     jmarimla         Minor ui changes
 * 19.00      08 Jun 2020     jmarimla         UI changes
 * 20.00      15 Jun 2020     jmarimla         UI changes
 * 21.00      17 Jun 2020     jmarimla         Translation
 * 22.00      18 Jun 2020     earepollo        Label changes
 * 23.00      03 Jul 2020     jmarimla         Concurrency backend changes
 * 24.00      30 Jul 2020     jmarimla         r2020a strings
 * 25.00      06 Aug 2020     jmarimla         Removed '(%)'
 * 26.00      21 Sep 2020     earepollo        Hide average concurrency and custom date range
 * 27.00      23 Sep 2020     jmarimla         Remove integ url and fixed bugs
 * 28.00      29 Sep 2020     jmarimla         Hide average concurrency
 * 29.00      07 Oct 2020     jmarimla         Switch to unallocated when compid changes
 * 30.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 */

APMCM = APMCM || {};

APMCM._Components = function() {

    var $SuiteAppNote = $("<div>").psgpNewSuiteAppNote();

    var $TitleBar = $('<div>').psgpSuiteletTitle({
        title: APMTranslation.apm.cm.label.concurrencymonitor()
    });

    var $CustomDateRangeDialog = $('' +
            '<div class="apm-cm-dialog-customdaterange">' +
                '<div class="buttons"><div class="btn-save"></div><div class="btn-cancel"></div></div>' +
                '<div class="field-startdate"></div>' +
                '<div class="field-enddate"></div>' +
            '</div>'
            ).psgpDialog({
                title: APMTranslation.apm.common.label.customdaterange(),
                width: 400,
                autoOpen: false,
                closeOnEscape: false,
                close: function( event, ui ) {
                    //console.log('close');
                }
            });
        $CustomDateRangeDialog.parents('.ui-dialog').find('.ui-dialog-titlebar-close').click(function () {
            var me = this;
            var $dialog = $(me).parents('.ui-dialog');
            var $btnCancel =$dialog.find('.btn-cancel');
            $btnCancel.find('.psgp-btn-default').click();
        });
        $CustomDateRangeDialog.find('.btn-save').psgpBlueButton({
            text: APMTranslation.apm.common.button.set(),
            handler: function () {
                var me = this;
                var $dialog = $(me).parents('.apm-cm-dialog-customdaterange');

                var $startDateTimeField = $dialog.find('.field-startdate');
                var $endDateTimeField = $dialog.find('.field-enddate');

                var stDate = $startDateTimeField.psgpDateTimeField('getDateValue');
                var stTime = $startDateTimeField.psgpDateTimeField('getTimeValue');
                var etDate = $endDateTimeField.psgpDateTimeField('getDateValue');
                var etTime = $endDateTimeField.psgpDateTimeField('getTimeValue');

                //validate dates
                if (!$startDateTimeField.psgpDateTimeField('isDateValid')) {
                    alert(APMTranslation.apm.r2020a.pickastartdate());
                    return;
                }
                if (!$endDateTimeField.psgpDateTimeField('isDateValid')) {
                    alert(APMTranslation.apm.r2020a.pickanenddate());
                    return;
                }

                var startDateMS = APMCM.Services.convertToPSTms(stDate, stTime);
                var endDateMS = APMCM.Services.convertToPSTms(etDate, etTime);

                //validate date range
                if(startDateMS > endDateMS) {
                    alert(APMTranslation.apm.r2020a.pickastartdatethatisearlierthantheenddate());
                    return;
                }

                //min 3 days
                if(endDateMS - startDateMS < 1000*60*60*24*3) {
                    alert(APMTranslation.apm.r2020a.pickastartandenddatethatismorethanthreedays());
                    return false;
                }

                //max 30 days
                if(endDateMS - startDateMS > 1000*60*60*24*30) {
                    alert(APMTranslation.apm.r2020a.pickastartandenddatethatislessthanorequalto30days());
                    return false;
                }

                var customValue = 'custom_' + startDateMS + '_' + endDateMS;
                var customLabel = APMTranslation.apm.common.label.custom() + ' (' + APMCM.Services.convertMStoDateTimePST(stDate, stTime) + ' - ' + APMCM.Services.convertMStoDateTimePST(etDate, etTime) + ')';
                var markUp = '<option value="' + customValue + '">' + customLabel +'</option>';
                var $settingsDateRangeDialog =  $('.apm-cm-settings-daterange-dialog');
                $settingsDateRangeDialog.find('.field-daterange option[value*="custom_"]').remove();
                var $customOption = $settingsDateRangeDialog.find('.field-daterange option').last();
                $(markUp).insertBefore($customOption);
                $settingsDateRangeDialog.find('.field-daterange .psgp-combobox').val(customValue);
                $settingsDateRangeDialog.find('.field-daterange .psgp-combobox').selectmenu('refresh');

                $dialog.dialog('close');
            }
        });
        $CustomDateRangeDialog.find('.btn-cancel').psgpGrayButton({
            text: APMTranslation.apm.common.button.cancel(),
            handler: function () {
                var me = this;
                var $dialog = $(me).parents('.apm-cm-dialog-customdaterange');

                var globalSettings = APMCM.Services.getGlobalSettings();
                var oldValue = globalSettings.dateRangeSelect;
                $('.apm-cm-settings-daterange-dialog').find('.field-daterange .psgp-combobox').val(oldValue);
                $('.apm-cm-settings-daterange-dialog').find('.field-daterange .psgp-combobox').selectmenu('refresh');

                $dialog.dialog('close');
            }
        });
        $CustomDateRangeDialog.find('.field-startdate').psgpDateTimeField({
            label: APMTranslation.apm.r2020a.startdateandtime()
        });
        $CustomDateRangeDialog.find('.field-enddate').psgpDateTimeField({
            label: APMTranslation.apm.r2020a.enddateandtime()
        });

    var $SettingsDateRangeDialog =  $('' +
            '<div class="apm-cm-settings-daterange-dialog">' +
                '<div><span class="psgp-field-label">' + APMTranslation.apm.common.label.daterange() + '</span><div class="field-daterange"></div></div>' +
                '<div class="container-field-customer"><span class="psgp-field-label">' + APMTranslation.apm.common.label.companyid() + '</span><div class="field-customer"></div></div>' +
                '<div class="note">' + APMTranslation.apm.r2020a.selectionsapplytoallportlets() + '</div>' +
                '<div class="buttons"><div class="btn-save"></div><div class="btn-cancel"></div></div>' +
            '</div>')
            .psgpSettingsDialog({

            });

    if (!CM_PARAMS.debugMode) {
        $SettingsDateRangeDialog.find('.container-field-customer').hide();
    }

    $SettingsDateRangeDialog.find('.field-customer').psgpTextBox({
        width:  250
    });

    $SettingsDateRangeDialog.find('.field-daterange').psgpComboBox({
        list: [
                { 'name': APMTranslation.apm.common.label.last3days(), 'id': 1000*60*60*24*3 }
              , { 'name': APMTranslation.apm.common.label.last7days(), 'id': 1000*60*60*24*7 }
              , { 'name': APMTranslation.apm.common.label.last14days(), 'id': 1000*60*60*24*14 }
              , { 'name': APMTranslation.apm.common.label.last30days(), 'id': 1000*60*60*24*30 }
              // , { 'name': APMTranslation.apm.common.label.custom(), 'id': 'custom' }
                ],
        width:  190,
        change: function( event, ui ) {
            var newValue = ui.item.value;
            if (newValue == 'custom') {
                var $dialog = $CustomDateRangeDialog;
                $dialog
                    .dialog('option', 'position', {my: 'right top', at: 'left bottom', of: $('.apm-cm-settings-daterange')})
                    .dialog('open');
            }
        }
    });
    $SettingsDateRangeDialog.find('.btn-save').psgpBlueButton({
        text: APMTranslation.apm.r2020a.apply(),
        handler: function () {
            var me = this;
            var $dialog = $(me).parents('.apm-cm-settings-daterange-dialog');
            $dialog.dialog('close');
            var newValue = $dialog.find('.field-daterange .psgp-combobox').val();
            var globalSettings = APMCM.Services.getGlobalSettings();
            globalSettings.dateRangeSelect = newValue;
            if (newValue.indexOf('custom_') == -1) {
                globalSettings.endDateMS = '' + new Date().setSeconds(0, 0);
            }

            var compfil = $dialog.find('.field-customer .psgp-textbox').val().trim();

            if (globalSettings.compfil != compfil) {
                //Switch to unallocated tab (default)
                globalSettings.compfil = compfil;
                globalSettings.integId = '';
                if (!$AllocationsTab.find('.apm-cm-unallocated-tab .apm-cm-tab').hasClass('selected')) {
                    $AllocationsTab.find('.apm-cm-unallocated-tab .apm-cm-tab').addClass('selected');
                    $AllocationsTab.find('.apm-cm-allocated-tab .apm-cm-tab').removeClass('selected');
    
                    $IntegrationFilter.hide();
                    $BtnRefresh.hide();
                }
            }
            
            APMCM.Services.refreshData();
        }
    });
    $SettingsDateRangeDialog.find('.btn-cancel').psgpGrayButton({
        text: APMTranslation.apm.common.button.cancel(),
        handler: function () {
            var me = this;
            var $dialog = $(me).parents('.apm-cm-settings-daterange-dialog');
            $dialog.dialog('close');
            var globalSettings = APMCM.Services.getGlobalSettings();
            var oldValue = globalSettings.dateRangeSelect;
            $dialog.find('.field-daterange .psgp-combobox').val(oldValue);
            $dialog.find('.field-daterange .psgp-combobox').selectmenu('refresh');
            $dialog.find('.field-customer .psgp-textbox').val(globalSettings.compfil);
        }
    });

    var $SettingsDateRange = $('<div>').addClass('apm-cm-settings-daterange')
        .psgpSuiteletSettings({
            label: '',
            $dialog: $SettingsDateRangeDialog
        });
    $SettingsDateRange.on('updateLabel', function(){
        var $dialog = $('.apm-cm-settings-daterange-dialog');
        $dialog.dialog('close');
        var newValue = $dialog.find('.field-daterange .psgp-combobox').val();
        var newText = $dialog.find('.field-daterange .psgp-combobox').find(':selected').text();
        var globalSettings = APMCM.Services.getGlobalSettings();

        var newSettingsLabel = APMTranslation.apm.common.label.daterange() + ': ';
        if (newValue.indexOf('custom_') !== -1) {
            globalSettings.endDateMS = '';
            newSettingsLabel = newSettingsLabel + newText;
        } else {
            newSettingsLabel = newSettingsLabel + newText + ' ' + APMTranslation.apm.common.label.asof({params: [globalSettings.asOf]}) + ')';
        }
        $('.apm-cm-settings-daterange').psgpSuiteletSettings('updateLabel', newSettingsLabel);

    });

    $TitleBar.append($SettingsDateRange);

    var $Header = $('<div class="apm-cm-header"></div>');

    var $AllocationsTab = $('' +
        '<div class="apm-cm-tabs">' +
            '<div class="apm-cm-unallocated-tab"><div class="apm-cm-tab">' + APMTranslation.apm.r2020a.unallocatedlimit() + '</div></div>' +
            '<div class="apm-cm-allocated-tab"><div class="apm-cm-tab">' + APMTranslation.apm.r2020a.allocatedlimit() + '</div></div>' +
        '</div>'
    );

    $AllocationsTab.find('.apm-cm-unallocated-tab').click(function() {
        if (!$AllocationsTab.find('.apm-cm-unallocated-tab .apm-cm-tab').hasClass('selected')) {
            $AllocationsTab.find('.apm-cm-unallocated-tab .apm-cm-tab').addClass('selected');
            $AllocationsTab.find('.apm-cm-allocated-tab .apm-cm-tab').removeClass('selected');

            $IntegrationFilter.hide();
            $BtnRefresh.hide();

            var globalSettings = APMCM.Services.getGlobalSettings();
            globalSettings.integId = '';
            APMCM.Services.refreshData();
        }
    });

    $AllocationsTab.find('.apm-cm-allocated-tab').click(function() {
        if (!$AllocationsTab.find('.apm-cm-allocated-tab .apm-cm-tab').hasClass('selected')) {
            $AllocationsTab.find('.apm-cm-allocated-tab .apm-cm-tab').addClass('selected');
            $AllocationsTab.find('.apm-cm-unallocated-tab .apm-cm-tab').removeClass('selected');

            $IntegrationFilter.show();
            $BtnRefresh.show();

            var globalSettings = APMCM.Services.getGlobalSettings();
            var integId = $IntegrationFilter.find('.filter-integration .psgp-combobox').val();
            globalSettings.integId = integId;
            APMCM.Services.refreshData();
        }
    });

    var $IntegrationFilter = $('<div class="apm-cm-filter-integration psgp-filter-combo"><div class="label">' + APMTranslation.apm.common.label.integration() + '</div><div class="filter-integration"></div></div></div>');
    $IntegrationFilter.find('.filter-integration').psgpComboBox({
        list: [],
        width: 190
    });

    var $BtnRefresh = $('<div>').psgpBlueButton({
        text: APMTranslation.apm.common.button.refresh(),
        handler: function () {
            var $dialog = $('.apm-cm-settings-daterange-dialog');
            $dialog.dialog('close');
            var newValue = $dialog.find('.field-daterange .psgp-combobox').val();
            var integId = $IntegrationFilter.find('.filter-integration .psgp-combobox').val();
            var globalSettings = APMCM.Services.getGlobalSettings();
            globalSettings.integId = integId;
            if (newValue.indexOf('custom_') !== -1) {

            } else {
                globalSettings.endDateMS = '' + new Date().setSeconds(0, 0);
            }

            APMCM.Services.refreshData();
        }
    });

    $AllocationsTab.append($IntegrationFilter)
        .append($BtnRefresh);
    $Header.append($AllocationsTab);
    $AllocationsTab.hide();

    var $ColumnPanel = $('<div>').psgpColumnPanel({
        columndef: [{
            width: '99%',
            padding: '0px 0px 0px 0px'
        }, {
            width: '1%',
            padding: '0px 0px 0px 0px'
        }]
    });

    var $OverviewPortlet = $('<div>').psgpPortlet({
        title: APMTranslation.apm.common.label.overview()
    });

    var $OverviewKPI = $(
            '<div class="apm-cm-overviewdata">' +
            '<div class="section conclimit">' +
                '<div class="title">' +
                    '<a href="" target="_blank">' + APMTranslation.apm.cm.label.concurrencylimit() + '</a>' +
                '</div>' +
                '<div class="content">' +
                    '<div class="value">' +
                    '</div>' +
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
            //         '<div class="value">' +
            //         '</div>' +
            //     '</div>' +
            // '</div>' +
            // '<div class="divider">' +
            // '</div>' +
            '<div class="section closelimit">' +
                '<div class="title">' + APMTranslation.apm.r2020a.closetothelimitrate() +
                '</div>' +
                '<div class="content">' +
                    '<div class="value">' +
                    '</div>' +
                    '<div class="range">' +
                    '</div>' +
            '</div>' +
            '</div>' +
            '<div class="divider">' +
            '</div>' +
            '<div class="section overlimit">' +
                '<div class="title">' + APMTranslation.apm.r2020a.overthelimitrate() +
                '</div>' +
                '<div class="content">' +
                    '<div class="value">' +
                    '</div>' +
                    '<div class="range">' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="divider">' +
            '</div>' +
            '<div class="section errorrate">' +
                '<div class="title">' + APMTranslation.apm.common.label.errorrate() +
                '</div>' +
                '<div class="content">' +
                    '<div class="value">' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'
);

    $OverviewPortlet.psgpPortlet('getBody')
    .css('overflow', 'auto')
    .append($OverviewKPI);

    var $ConcurrencySection = $(
            '<div class="apm-cm-concurrency-section">' +
                '<div class="chart-title">' +
                    '<div class="text">' + APMTranslation.apm.r2020a.estimatedconcurrencyrates() +
                    '</div>' +
                    '<div class="icon">' +
                    '</div>' +
                '</div>' +
                // '<div class="tabs">' +
                //     '<div class="tab peak selected">' + APMTranslation.apm.r2020a.peakusage() + '</div>' +
                //     '<div class="tab average">' + APMTranslation.apm.r2020a.averageusage() + '</div>' +
                // '</div>' +
                '<div class="chart">' +
                '</div>' +
                '<div class="legend">' +
                    '<div class="legend-block-1">' +
                        '<div class="legend-1-title">' + APMTranslation.apm.r2020a.concurrencyrateswithouterrors() +
                        '</div>' +
                        '<div class="legend-1">' +
                            '<div class="row-1">' +
                                '<div class="box box-1"></div>' +
                                '<div class="box box-2"></div>' +
                                '<div class="box box-3"></div>' +
                                '<div class="box box-4"></div>' +
                                '<div class="box box-5"></div>' +
                            '</div>' +
                            '<div class="row-2">' +
                                '<div class="box label">0</div>' +
                                '<div class="box label">25</div>' +
                                '<div class="box label">50</div>' +
                                '<div class="box label">75</div>' +
                                '<div class="box label">100</div>' +
                                '<div class="box label">100+</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="legend-block-2">' +
                        '<div class="legend-2-title">' + APMTranslation.apm.r2020a.concurrencyrateswitherrors() +
                        '</div>' +
                        '<div class="legend-2">' +
                            '<div class="box"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
    );

    $ConcurrencySection.find('.tabs .tab').click(function() {
        var me = this;
        var globalSettings = APMCM.Services.getGlobalSettings();

        if (!$(me).hasClass('selected')) {
            $(me).addClass('selected');

            if ($(me).hasClass('peak')) {
                $ConcurrencySection.find('.tab.average').removeClass('selected');
                globalSettings.utilizationTab = 'peak';

            } else if ($(me).hasClass('average')) {
                $ConcurrencySection.find('.tab.peak').removeClass('selected');
                globalSettings.utilizationTab = 'average';
            }

            APMCM.Highcharts.renderUtilizationChart();

        }
    });


    function updateOverviewPanel (overview) {
        var globalSettings = APMCM.Services.getGlobalSettings();
        var $OverviewPanel = $('.apm-cm-overviewdata');
        var concurrencyLimit = overview.concurrencyLimit ? overview.concurrencyLimit : '-';
        var peakConcurrencyValue = overview.peakConcurrency.value ? overview.peakConcurrency.value : '-';
        var peakConcurrencyDateMS = overview.peakConcurrency.dateMS;
        var peakConcurrencyDate = Highcharts.dateFormat('%b %d %Y %l:%M %p', peakConcurrencyDateMS);
        if (peakConcurrencyDate.endsWith('AM')) {
            peakConcurrencyDate = peakConcurrencyDate.replace(/AM$/, APMTranslation.apm.common.time.am());
        }
        if (peakConcurrencyDate.endsWith('PM')) {
            peakConcurrencyDate = peakConcurrencyDate.replace(/PM$/, APMTranslation.apm.common.time.pm());
        }
        // var averageConcurrency = overview.averageConcurrency ? overview.averageConcurrency : '-';

        if (overview.timeCloseToLimit){
            var timeCloseToLimitValue = overview.timeCloseToLimit.value ? overview.timeCloseToLimit.value + '%' : '-';
            var timeCloseToLimitRange = '';
            timeCloseToLimitRange = APMTranslation.apm.r2020a.requestsbetween0and1({params: [overview.timeCloseToLimit.lowerRange,overview.timeCloseToLimit.upperRange]});
        }

        if(overview.timeOverLimit) {
            var timeOverLimitValue = overview.timeOverLimit.value ? overview.timeOverLimit.value + '%' : '-';
            var timeOverLimitRange = '';
            if (overview.timeOverLimit.range) {
                timeOverLimitRange = APMTranslation.apm.r2020a.requestsover0({params: [overview.timeOverLimit.range]});
            }
        }

        var errorRate = (overview.totalRequests) ? (overview.totalViolations / overview.totalRequests) * 100: 0;
        var errorRate = errorRate ? errorRate.toFixed(2) + '%' : '-';
        if (errorRate != '-') {
            $OverviewPanel.find('.errorrate').addClass('highlight');
        } else {
            $OverviewPanel.find('.errorrate').removeClass('highlight');
        }

        if (peakConcurrencyValue > concurrencyLimit) {
            $OverviewPanel.find('.peakconc').addClass('highlight');
        } else {
            $OverviewPanel.find('.peakconc').removeClass('highlight');
        }

        $OverviewPanel.find('.conclimit .content .value').html(concurrencyLimit);
        $OverviewPanel.find('.peakconc .content .value').html(peakConcurrencyValue);
        $OverviewPanel.find('.peakconc .content .date').html(peakConcurrencyDate);
        // $OverviewPanel.find('.averageconc .content .value').html(averageConcurrency);
        $OverviewPanel.find('.closelimit .content .value').html(timeCloseToLimitValue);
        $OverviewPanel.find('.closelimit .content .range').html(timeCloseToLimitRange);
        $OverviewPanel.find('.overlimit .content .value').html(timeOverLimitValue);
        $OverviewPanel.find('.overlimit .content .range').html(timeOverLimitRange);
        $OverviewPanel.find('.errorrate .content .value').html(errorRate);

        if (globalSettings.compfil == CM_PARAMS.myCompany) {
            var url = '/app/webservices/governance/governance.nl?';
            // if (globalSettings.integId) {
            //     url = '/app/common/integration/integrapp.nl?id=' + globalSettings.integId;
            // }
            $OverviewPanel.find('.conclimit .title a').attr("href", url);
        } else {
            $OverviewPanel.find('.conclimit .title a').removeAttr('href');
        }
    }

    function initializeTooltips () {
        var selectors = [
            '.apm-cm-concurrency-section .chart-title .icon'
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

                if ($element.is('.apm-cm-concurrency-section .chart-title .icon')) {
                    var note = APMTranslation.apm.r2020a.concurrencymonitornote();
                    var linkText = APMTranslation.apm.r2020a.usingtheconcurrencymonitordashboard();
                    var linkUrl = '/app/help/helpcenter.nl?fid=section_1526957048.html';
                    var markUp = '<div class="concurrency-section">' +
                                    '<div>' + note + '</div>' +
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
        $SuiteAppNote: $SuiteAppNote,
        $TitleBar: $TitleBar,
        $SettingsDateRange: $SettingsDateRange,
        $SettingsDateRangeDialog: $SettingsDateRangeDialog,
        $Header: $Header,
        $BtnRefresh: $BtnRefresh,
        $IntegrationFilter: $IntegrationFilter,
        $AllocationsTab: $AllocationsTab,
        $ColumnPanel: $ColumnPanel,
        $OverviewPortlet: $OverviewPortlet,
        $OverviewKPI: $OverviewKPI,
        $ConcurrencySection: $ConcurrencySection,
        updateOverviewPanel: updateOverviewPanel,
        initializeTooltips: initializeTooltips
    };

 };