/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       29 Oct 2014     jmarimla         Initial
 * 2.00       04 Nov 2014     jmarimla         Added filter panel
 * 3.00       07 Nov 2014     jmarimla         Added performance chart and suitescript detail panels
 * 4.00       11 Nov 2014     jmarimla         Commented out deployment name combobox
 * 5.00       20 Nov 2014     rwong            Added view all logs button
 * 6.00       28 Nov 2014     rwong            Implement support parameter setting of filters
 * 7.00       02 Dec 2014     jmarimla         Added components for performance chart portlet
 * 8.00       09 Jan 2015     rwong            Set psgp-apm-ssa-container-perfchart chart to be shown by default. Remove ExtJS Chart
 * 9.00       29 Jan 2015     rwong            Added height definition to psgp-apm-ssa-container-perfchart. Removed commented code.
 * 10.00      02 Feb 2015     jmarimla         Removed height in ssd summary portlet
 * ********************************************************************************
 * 1.00       23 Feb 2015     rwong            Ported SPM to APM.
 * 2.00       19 May 2015     jmarimla         Add component ids
 * 3.00       09 Jul 2015     jmarimla         Added summary fields in suitescript details
 * 4.00       06 Aug 2015     rwong            Added class url to links
 *                                             Renamed "View All Logs" to "View Logs"
 *                                             Filter Panel is collapsed on load
 * 5.00       25 Aug 2015     jmarimla         Create title toolbar; Added script id field for compid mode
 * 6.00       04 Sep 2015     rwong            Rename suitelet settings to Customer Debug Settings
 * 7.00       06 Jun 2016     jmarimla         Relayout filter fields to fix border issue
 * 8.00       05 Aug 2016     jmarimla         Support for suitescript context
 * 9.00       05 Apr 2018     rwong            Added support for client scripts
 * 10.00      11 May 2018     jmarimla         SuiteScript label
 * 11.00      29 Jun 2018     jmarimla         Translation readiness
 * 12.00      16 Jul 2018     jmarimla         Set translated time
 * 13.00      24 May 2019     erepollo         Removed header BG
 * 14.00      19 Aug 2019     jmarimla         Filters expand/collapse
 * 15.00      27 Nov 2019     lemarcelo        Remove display condition of error count
 * 16.00      15 Jan 2020     jmarimla         Customer debug changes
 * 17.00      03 Apr 2020     earepollo        Support for new script types.
 * 18.00      04 May 2020     earepollo        Add map/reduce stage filter
 * 19.00      19 May 2020     jmarimla         Payment processing plugin
 * 20.00      11 Jun 2020     earepollo        ExtJS to jQuery
 * 21.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 *
 */

APMSSA = APMSSA || {};

APMSSA._MainPanel = function() {

    function render() {
        var $mainContent = $('#apm-ssa-main-content').addClass('psgp-main-content');

        $mainContent
            .append(APMSSA.Components.$SuiteAppNote)
            .append(APMSSA.Components.$TitleBar)
            .append(APMSSA.Components.$BtnSearch)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMSSA.Components.$FilterPanel)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMSSA.Components.$ColumnPanel);

        APMSSA.Components.$ColumnPanel.find('.psgp-column-panel-1')
            .append(APMSSA.Components.$PerformanceChartPortlet);
        APMSSA.Components.$ColumnPanel.find('.psgp-column-panel-2')
            .append(APMSSA.Components.$SuiteScriptDetailsPortlet);

        $mainContent.removeClass('psgp-loading-mask');

        //resize event
        $(window).resize(function() {
            var delay = 250;
            setTimeout(function() {
                var charts = [

                ];

                for (var i in charts) {
                    if (charts[i]) charts[i].reflow();
                }
            }, delay);
        });

        var globalSettings = APMSSA.Services.getGlobalSettings();
        globalSettings.compfil = SSA_PARAMS.compfil;
        APMSSA.Components.$CustomerDebuggingDialog.find('.field-customer .psgp-textbox').val(SSA_PARAMS.compfil);
        APMSSA.Components.$CustomerDebuggingDialog.find('.psgp-combobox').selectmenu('refresh');

        params = convertParams(SSA_PARAMS);
        if (params.fparam == true) {
            //set global params
            globalSettings.startDate = SSA_PARAMS.startDate;
            globalSettings.endDate = SSA_PARAMS.endDate;
            globalSettings.scriptType = SSA_PARAMS.scriptType;
            globalSettings.scriptId = SSA_PARAMS.scriptId;
            globalSettings.scriptName = SSA_PARAMS.scriptName;
            globalSettings.context = SSA_PARAMS.context;
            globalSettings.clientEventType = SSA_PARAMS.clientEventType;
            globalSettings.mapReduceStage = SSA_PARAMS.mapReduceStage;
            globalSettings.drilldown = 'F';

            //set filter panel
            APMSSA.Components.$FilterPanel.psgpFilterPanel('collapse');
            APMSSA.Components.$StartDateTimeFilter.psgpDateTimeField('setDateValue', new Date(SSA_PARAMS.startDate));
            APMSSA.Components.$StartDateTimeFilter.psgpDateTimeField('setTimeValue', params.stime);
            APMSSA.Components.$EndDateTimeFilter.psgpDateTimeField('setDateValue', new Date(SSA_PARAMS.endDate));
            APMSSA.Components.$EndDateTimeFilter.psgpDateTimeField('setTimeValue', params.etime);
            APMSSA.Components.$TypeFilter.find('.psgp-combobox').val(SSA_PARAMS.scriptType);
            APMSSA.Components.$TypeFilter.find('.psgp-combobox').selectmenu('refresh');

            if (SSA_PARAMS.compfil == SSA_PARAMS.myCompany) {
                APMSSA.Services.refreshNameListData({
                    scriptType : SSA_PARAMS.scriptType
                });

                APMSSA.Components.$NameFilter.find('.psgp-combobox').val(SSA_PARAMS.scriptId);
                APMSSA.Components.$NameFilter.find('.psgp-combobox').selectmenu('refresh');
            } else {
                APMSSA.Components.$IdFilter.find('.psgp-textbox').val(SSA_PARAMS.scriptId);
                APMSSA.Components.$IdFilter.show();
                APMSSA.Components.$NameFilter.hide();
            }

            if (SSA_PARAMS.scriptType.indexOf('userevent') != -1) {
                APMSSA.Components.$ContextFilter.find('.psgp-combobox').val(SSA_PARAMS.context);
                APMSSA.Components.$ContextFilter.find('.psgp-combobox').selectmenu('refresh');
                APMSSA.Components.$ContextFilter.show();
            }

            if (SSA_PARAMS.scriptType == 'client'){
                APMSSA.Components.$ClientEventTypeFilter.find('.psgp-combobox').val(SSA_PARAMS.clientEventType);
                APMSSA.Components.$ClientEventTypeFilter.find('.psgp-combobox').selectmenu('refresh');
                APMSSA.Components.$ClientEventTypeFilter.show();
            }

            if (SSA_PARAMS.scriptType == 'mapreduce'){
                APMSSA.Components.$MapReduceStageFilter.find('.psgp-combobox').val(SSA_PARAMS.mapReduceStage);
                APMSSA.Components.$MapReduceStageFilter.find('.psgp-combobox').selectmenu('refresh');
                APMSSA.Components.$MapReduceStageFilter.show();
            }

            APMSSA.Services.refreshData();
        } else {
            var dateToday = new Date();
            var dateTomorrow = new Date(dateToday.getTime() + 24*60*60*1000);

            //set filter panel
            APMSSA.Components.$StartDateTimeFilter.psgpDateTimeField('setDateValue', dateToday);
            APMSSA.Components.$StartDateTimeFilter.psgpDateTimeField('setTimeValue', '00:00');
            APMSSA.Components.$EndDateTimeFilter.psgpDateTimeField('setDateValue', dateTomorrow);
            APMSSA.Components.$EndDateTimeFilter.psgpDateTimeField('setTimeValue', '00:00');
        }
    }

    function convertParams(params) {
        if(params.startDate != '' && params.endDate != '' && params.scriptType != '' && params.scriptId != ''){
            params.sdate = convertDate(params.startDate);
            params.edate = convertDate(params.endDate);
            params.stime = convertTime(params.startDate);
            params.etime = convertTime(params.endDate);
            params.fparam = true;
        } else {
            params.fparam = false;
        }
        return params;
    }

    function convertDate (dateStr) {
        if (!dateStr) return;
        var datetime = dateStr.replace('T', ',').replace(/-/g,'/').replace(' ', ',').split(',');
        var date = datetime[0].split('/');
        var convertedDate = new Date(date[0], date[1]-1, date[2], 0, 0, 0);
        return convertedDate;
    }

    function convertTime (dateStr) {
        if (!dateStr) return;
        var datetime = dateStr.replace('T', ',').replace(/-/g,'/').replace(' ', ',').split(',');
        var timeRaw = datetime[1];
        return timeRaw.substring(0, 5);
    }

    function adjustCSS() {
        var themeColor = $('#ns_navigation').css('background-color');
        themeColor = themeColor || '#DDDDDD';
        var fontFamily = $('.uir-record-type').css('font-family');
        fontFamily = fontFamily || '#Serif';
        var cssStyle = '' +
            '<style type="text/css">' +
            '.psgp-main-content *, .psgp-dialog *, .psgp-settings-dialog *, .psgp-dialog input, .psgp-settings-dialog input { font-family: ' + fontFamily + ';}' +
            '.psgp-dialog .ui-dialog-titlebar { background-color: ' + themeColor + ';}' +
            '</style>';
        $(cssStyle).appendTo($('#apm-ssa-main-content'));
    }

    return {
        adjustCSS: adjustCSS,
        render: render
    };
};

