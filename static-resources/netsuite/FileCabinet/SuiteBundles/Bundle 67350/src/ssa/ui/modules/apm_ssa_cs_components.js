/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       29 Oct 2014     jmarimla         Initial
 * 2.00       04 Nov 2014     jmarimla         Added filter comboboxes
 * 3.00       07 Nov 2014     jmarimla         Added SuiteScript details grid
 *                                             Added search button functionality
 * 4.00       11 Nov 2014     jmarimla         Commented out references to deployment name combobox
 * 5.00       20 Nov 2014     rwong            Added SSD grid and window component definition
 * 6.00       21 Nov 2014     rwong            Updated suitescript detail grid columns and increase size of ssd window.
 * 7.00       28 Nov 2014     rwong            Added support for parameter passing.
 * 8.00       02 Dec 2014     jmarimla         Added performance chart
 * 9.00       29 Jan 2015     rwong            Updated call to perfchart
 * 10.00      02 Feb 2015     jmarimla         Removed instruction count from SSD window
 * ********************************************************************************
 * 1.00       20 Feb 2015     rwong            Ported SPM to APM
 * 2.00       07 Apr 2015     rwong            Added urlrequests, searches and records column
 * 3.00       19 May 2015     jmarimla         Removed unused code
 * 4.00       01 Jul 2015     jmarimla         Updated loading masks
 * 5.00       09 Jul 2015     jmarimla         Retrieve script name
 * 6.00       13 Aug 2015     jmarimla         Passed date parameters as string
 * 7.00       25 Aug 2015     jmarimla         Compid dropdown components; support for compid mode
 * 8.00       12 Oct 2015     jmarimla         Date range validation
 * 9.00       01 Dec 2015     jmarimla         Added csv export button
 * 10.00      21 Dec 2015     rwong            Adjust the spacing of the export button
 * 11.00      05 Aug 2016     jmarimla         Support for suitescript context
 * 12.00      05 Apr 2018     rwong            Added support for client scripts
 * 13.00      04 May 2018     jmarimla         N/A client script columns
 * 14.00      16 May 2018     jmarimla         en dash
 * 15.00      29 Jun 2018     jmarimla         Translation readiness
 * 16.00      23 Aug 2018     jmarimla         FRHT link
 * 17.00      18 Oct 2018     jmarimla         Redirect to profiler
 * 18.00      26 Oct 2018     jmarimla         Frht label
 * 19.00      04 Jan 2019     rwong            Client Script Event Type translation field
 * 20.00      12 Feb 2019     rwong            Fix issue with client csv export
 * 21.00      07 Mar 2019     jmarimla         Client script disable frht
 * 22.00      28 Jun 2019     erepollo         Translation for new texts
 * 23.00      13 Nov 2019     lemarcelo        Added Error Code column
 * 24.00      27 Nov 2019     lemarcelo        Update error code label and remove error count display condition
 * 25.00      07 Jan 2020     earepollo        Translation readiness for new strings
 * 26.00      15 Jan 2020     jmarimla         Customer debug changes
 * 27.00      03 Apr 2020     earepollo        Support for new script types. Separate comboBox for customgllines (SS2.0 Backend)
 * 28.00      04 May 2020     earepollo        Add map/reduce stage filter
 * 29.00      19 May 2020     jmarimla         Payment processing plugin
 * 30.00      11 Jun 2020     earepollo        ExtJS to jQuery
 * 31.00      15 Jun 2020     earepollo        Group combo box
 * 32.00      18 Jun 2020     earepollo        Translation readiness
 * 33.00      22 Jun 2020     earepollo        Fixed drilldown
 * 34.00      24 Jun 2020     earepollo        Label changes
 * 35.00      30 Jul 2020     jmarimla         r2020a strings
 * 36.00      10 Sep 2020     lemarcelo        Financial Institution Connectivity plugin
 * 37.00      10 Sep 2020     earepollo        Email capture plugin
 * 38.00      21 Sep 2020     lemarcelo        Shipping Partners plugin
 * 39.00      06 Oct 2020     earepollo        Promotions plugin
 * 40.00      19 Nov 2020     lemarcelo        Added help link and icon
 * 41.00      23 Mar 2021     earepollo        Translation readiness
 * 42.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 *
 */

APMSSA = APMSSA || {};

APMSSA._Components = function() {

    var $SuiteAppNote = $("<div>").psgpNewSuiteAppNote();

    var $TitleBar = $('<div>').psgpSuiteletTitle({
        title: APMTranslation.apm.ssa.label.suitescriptanalysis()
    });

    /*
     * Customer Debugging
     */
    var $CustomerDebuggingDialog =  $('' +
            '<div class="apm-ssa-dialog-custdebug">' +
                '<div class="container-field-customer"><span class="psgp-field-label">' + APMTranslation.apm.common.label.companyid() + '</span><div class="field-customer"></div></div>' +
                '<div class="buttons"><div class="btn-save"></div><div class="btn-cancel"></div></div>' +
            '</div>')
            .psgpSettingsDialog({width: 240});

    $CustomerDebuggingDialog.find('.field-customer').psgpTextBox({
        width:  250
    });

    $CustomerDebuggingDialog.find('.btn-save').psgpBlueButton({
        text: APMTranslation.apm.r2020a.apply(),
        handler: function () {
            var me = this;
            var globalSettings = APMSSA.Services.getGlobalSettings();
            var $dialog = $(me).parents('.apm-ssa-dialog-custdebug');
            $dialog.dialog('close');

            var compfil = $dialog.find('.field-customer .psgp-textbox').val();
            globalSettings.compfil = compfil.trim();

            if (globalSettings.compfil == SSA_PARAMS.myCompany) {
                $IdFilter.hide();
                $NameFilter.show();

                var type = $TypeFilter.find('.psgp-combobox').val();
                APMSSA.Services.refreshNameListData({
                    scriptType : type
                });

                $NameFilter.find('.psgp-combobox').val(0);
                $NameFilter.find('.psgp-combobox').selectmenu('refresh');
            } else {
                $NameFilter.hide();
                $IdFilter.show();
                $IdFilter.find('.psgp-textbox').val('');
            }
        }
    });

    $CustomerDebuggingDialog.find('.btn-cancel').psgpGrayButton({
        text: APMTranslation.apm.common.button.cancel(),
        handler: function () {
            var me = this;
            var globalSettings = APMSSA.Services.getGlobalSettings();
            var $dialog = $(me).parents('.apm-ssa-dialog-custdebug');
            $dialog.dialog('close');

            var oldCompfil = globalSettings.compfil;
            $dialog.find('.field-customer .psgp-textbox').val(oldCompfil);
        }
    });

    var $CustomerDebuggingLabel = $('<div>').addClass('apm-ssa-settings-custdebug')
    .psgpSuiteletSettings({
        label: APMTranslation.apm.common.label.customerdebugsettings(),
        $dialog: $CustomerDebuggingDialog
    });

    if (SSA_PARAMS.debugMode) {
        $TitleBar.append($CustomerDebuggingLabel);
    }

    /*
     * Search Button
     */
    var $BtnSearch = $('<div>').psgpBlueButton({
        text: APMTranslation.apm.common.button.refresh(),
        handler: function () {
            //validate date
            if (!$StartDateTimeFilter.psgpDateTimeField('isDateValid')) {
                alert(APMTranslation.apm.r2020a.pickastartdate());
                return;
            }
            if (!$EndDateTimeFilter.psgpDateTimeField('isDateValid')) {
                alert(APMTranslation.apm.r2020a.pickanenddate());
                return;
            }

            var startdate = $StartDateTimeFilter.psgpDateTimeField('getDateValue');
            var starttime = $StartDateTimeFilter.psgpDateTimeField('getTimeValue');
            starttime = starttime.split(":", 2);
            var enddate = $EndDateTimeFilter.psgpDateTimeField('getDateValue');
            var endtime = $EndDateTimeFilter.psgpDateTimeField('getTimeValue');
            endtime = endtime.split(":", 2);
            var startDateObj = new Date(startdate.getFullYear(), startdate.getMonth(), startdate.getDate(), starttime[0], starttime[1], 0, 0);
            var endDateObj = new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate(), endtime[0], endtime[1], 0, 0);

            //validate date range
            if(startDateObj > endDateObj) {
                alert(APMTranslation.apm.r2020a.pickastartdatethatisearlierthantheenddate());
                return false;
            }

            //max 30 days
            if(endDateObj.getTime() - startDateObj.getTime() > 1000*60*60*24*30) {
                alert(APMTranslation.apm.r2020a.pickastartandenddatethatislessthanorequalto30days());
                return false;
            }

            var tzoffset = (new Date()).getTimezoneOffset() * 60* 1000; //offset in milliseconds
            var startDate = (new Date(startDateObj.getTime() - tzoffset)).toISOString().slice(0,-5);
            var endDate = (new Date(endDateObj.getTime() - tzoffset)).toISOString().slice(0,-5);

            //get filter values
            //required filter
            var type = $TypeFilter.find('.psgp-combobox').val();
            if (type == '') {
                alert(APMTranslation.apm.r2020a.selectapluginorscripttype());
                return false;
            }

            //required filter for all script types
            var id = '';
            var name = '';
            var globalSettings = APMSSA.Services.getGlobalSettings();
            if (globalSettings.compfil == SSA_PARAMS.myCompany) {
                var id = $NameFilter.find('.psgp-combobox').val();
                var name = $NameFilter.find('.psgp-combobox option:selected').text();

                if (!id && id == '' || id == 0) {
                    alert(APMTranslation.apm.r2020a.selectapluginorscriptname());
                    return false;
                }
            } else {
                var id = $IdFilter.find('.psgp-textbox').val();

                if (!id && id == '' || id == 0) {
                    alert(APMTranslation.apm.r2020a.enterascriptid());
                    return false;
                }
            }

            //allow blank context for user event scripts
            var context = '';
            if (type.indexOf('userevent') != -1) {
                var context = $ContextFilter.find('.psgp-combobox').val();
                context = (context) ? context : '';
            }

            //required filter for client scripts
            var clientEventType = '';
            if (type == 'client'){
                clientEventType = $ClientEventTypeFilter.find('.psgp-combobox').val();
                if (clientEventType == '') {
                    alert(APMTranslation.apm.r2020a.selectaclienteventtype());
                    return false;
                }
            }

            //required filter for map/reduce scripts
            var mapReduceStage = '';
            if (type == 'mapreduce'){
                mapReduceStage = $MapReduceStageFilter.find('.psgp-combobox').val();
                mapReduceStage = (mapReduceStage) ? mapReduceStage : '';
                if (mapReduceStage  == '') {
                    alert(APMTranslation.apm.r2020a.selectastageinthemapreduce());
                    return false;
                }
            }

            //set global variables
            var globalSettings = APMSSA.Services.getGlobalSettings();
            globalSettings.startDate = startDate;
            globalSettings.endDate = endDate;
            globalSettings.scriptType = type;
            globalSettings.scriptId = id;
            globalSettings.scriptName = name;
            globalSettings.drilldown = 'F';
            globalSettings.context = context;
            globalSettings.clientEventType = clientEventType;
            globalSettings.mapReduceStage = mapReduceStage;

            //refresh data
            APMSSA.Services.refreshData();
        }
    });

    /*
     * Filters
     */
    var $FilterPanel = $('<div>').psgpFilterPanel({});

    var $StartDateTimeFilter = $('<div>').psgpDateTimeField({
        label: APMTranslation.apm.r2020a.startdateandtime()
    });

    var $EndDateTimeFilter = $('<div>').psgpDateTimeField({
        label: APMTranslation.apm.r2020a.enddateandtime()
    });

    var $TypeFilter = $('<div class="psgp-filter-combo"><div><span class="psgp-field-label">' + APMTranslation.apm.common.label.type() + '</span><div class="filter-type"></div></div></div>');
    $TypeFilter.find('.filter-type').psgpGroupComboBox({
        list: [
            {
                //default: blank
                'label': '',
                'grouplist': [
                    { 'name': '', 'id': ''}
                ]
            },
            {
                'label': APMTranslation.apm.r2020a.plugin(),
                'grouplist': [
                    { 'name': APMTranslation.apm.r2020a.customgllines(), 'id': 'customgllines'},
                    { 'name': APMTranslation.apm_r2021a_emailcapture(), 'id': 'emailcapture'},
                    { 'name': APMTranslation.apm_r2021a_financialinstitutionconnectivity(), 'id': 'ficonnectivity'},
                    { 'name': APMTranslation.apm.r2020a.paymentgateway(), 'id': 'paymentgateway'},
                    { 'name': APMTranslation.apm_r2021a_promotions(), 'id': 'promotions'},
                    { 'name': APMTranslation.apm.r2020a.revenuemanagement(), 'id': 'advancedrevrec'},
                    { 'name': APMTranslation.apm_r2021a_shippingpartners(), 'id': 'shippingpartners'},
                    { 'name': APMTranslation.apm.r2020a.taxcalculation(), 'id': 'taxcalculation' }
                ]
            },
            {
                'label': APMTranslation.apm.ptd.label.script(),
                'grouplist': [
                    { 'name': APMTranslation.apm.r2020a.bundleinstallation(), 'id': 'bundleinstallation'},
                    { 'name': APMTranslation.apm.common.label.client(), 'id': 'client'},
                    { 'name': APMTranslation.apm.common.label.mapreduce(), 'id': 'mapreduce'},
                    { 'name': APMTranslation.apm.r2020a.massupdate(), 'id': 'massupdate'},
                    { 'name': APMTranslation.apm.r2020a.portlet(), 'id': 'portlet'},
                    { 'name': APMTranslation.apm.common.label.restlet(), 'id': 'restlet' },
                    { 'name': APMTranslation.apm.common.label.scheduled(), 'id': 'scheduled' },
                    { 'name': APMTranslation.apm.r2020a.sdfinstallation(), 'id': 'sdfinstallation'},
                    { 'name': APMTranslation.apm.ssa.label.suitelet(), 'id': 'suitelet' },
                    { 'name': APMTranslation.apm.ssa.label.usereventaftersubmit(), 'id': 'usereventaftersubmit' },
                    { 'name': APMTranslation.apm.ssa.label.usereventbeforeload(), 'id': 'usereventbeforeload' },
                    { 'name': APMTranslation.apm.ssa.label.usereventbeforesubmit(), 'id': 'usereventbeforesubmit' },
                    { 'name': APMTranslation.apm.r2020a.workflowaction(), 'id': 'workflowaction'}
                ]
            }
        ],
        width:  240,
        change: function( event, ui ) {
            var scriptType = ui.item.value;
            var globalSettings = APMSSA.Services.getGlobalSettings();

            if (globalSettings.compfil == SSA_PARAMS.myCompany) {
                APMSSA.Services.refreshNameListData({
                    scriptType : scriptType
                });
            }

            if (scriptType.indexOf('userevent') < 0) {
                $ContextFilter.hide();
            } else {
                $ContextFilter.show();
            }

            if (scriptType == 'client') {
                $ClientEventTypeFilter.show();
            } else {
                $ClientEventTypeFilter.hide();
            }

            if (scriptType == 'mapreduce') {
                $MapReduceStageFilter.show();
            } else {
                $MapReduceStageFilter.hide();
            }
        }
    });

    var $NameFilter = $('<div class="psgp-filter-combo"><div><span class="psgp-field-label">' + APMTranslation.apm.common.label.name() + '</span><div class="filter-name"></div></div></div>');
    $NameFilter.find('.filter-name').psgpComboBox({
        list: [
            { 'name': '', 'id': 0 }
        ],
        width:  258
    });

    var $IdFilter = $('<div class="apm-ssa-filter-id psgp-filter-text"><div><span class="psgp-field-label">' + APMTranslation.apm.ssa.label.scriptid() + '</span><div class="filter-id"></div></div></div>');
    $IdFilter.find('.filter-id').psgpTextBox({
        width: 54
    });
    $IdFilter.hide();

    var $ContextFilter = $('<div class="psgp-filter-combo"><div><span class="psgp-field-label">' + APMTranslation.apm.common.label.context() + '</span><div class="filter-context"></div></div></div>');
    $ContextFilter.find('.filter-context').psgpComboBox({
        list: [
            { 'name': '', 'id': '' },
            { 'name': APMTranslation.apm.ssa.label.userinterface(), 'id': 'userinterface' },
            { 'name': APMTranslation.apm.ns.context.workflow(), 'id': 'workflow' },
            { 'name': APMTranslation.apm.ssa.label.suitelet(), 'id': 'suitelet' },
            { 'name': APMTranslation.apm.common.label.webservice(), 'id': 'webservices' },
            { 'name': APMTranslation.apm.common.label.csvimport(), 'id': 'csvimport' },
            { 'name': APMTranslation.apm.ssa.label.webstore(), 'id': 'webstore' }
        ],
        width:  150
    });
    $ContextFilter.hide();

    var $ClientEventTypeFilter = $('<div class="psgp-filter-combo"><div><span class="psgp-field-label">' + APMTranslation.apm.ssa.label.clienteventtype() + '</span><div class="filter-clienteventtype"></div></div></div>');
    $ClientEventTypeFilter.find('.filter-clienteventtype').psgpComboBox({
        list: [
            { 'name': '', 'id': '' },
            {'name': 'pageInit', 'id': 'pageInit'},
            {'name': 'saveRecord', 'id': 'saveRecord'},
            {'name': 'validateField', 'id': 'validateField'},
            {'name': 'fieldChanged', 'id': 'fieldChanged'},
            {'name': 'postSourcing', 'id': 'postSourcing'},
            {'name': 'lineInit', 'id': 'lineInit'},
            {'name': 'validateLine', 'id': 'validateLine'},
            {'name': 'recalc', 'id': 'recalc'},
            {'name': 'validateInsert', 'id': 'validateInsert'},
            {'name': 'validateDelete', 'id': 'validateDelete'}
        ],
        width:  208
    });
    $ClientEventTypeFilter.hide();

    var $MapReduceStageFilter = $('<div class="psgp-filter-combo"><div><span class="psgp-field-label">' + APMTranslation.apm.spjd.label.mapreducestage() + '</span><div class="filter-mapreducestage"></div></div></div>');
    $MapReduceStageFilter.find('.filter-mapreducestage').psgpComboBox({
        list: [
            {'name': '', 'id': ''},
            {'name': APMTranslation.apm.r2020a.getinputdata(), 'id': 'getInputData'},
            {'name': APMTranslation.apm.r2020a.map(), 'id': 'map'},
            {'name': APMTranslation.apm.r2020a.reduce(), 'id': 'reduce'},
            {'name': APMTranslation.apm.r2020a.summarize(), 'id': 'summarize'}
        ],
        width:  150
    });
    $MapReduceStageFilter.hide();

    $FilterPanel.psgpFilterPanel('addFilterField', $StartDateTimeFilter);
    $FilterPanel.psgpFilterPanel('addFilterField', $EndDateTimeFilter);
    $FilterPanel.psgpFilterPanel('addFilterField', $TypeFilter);
    $FilterPanel.psgpFilterPanel('addFilterField', $NameFilter);
    $FilterPanel.psgpFilterPanel('addFilterField', $IdFilter);
    $FilterPanel.psgpFilterPanel('addFilterField', $ContextFilter);
    $FilterPanel.psgpFilterPanel('addFilterField', $ClientEventTypeFilter);
    $FilterPanel.psgpFilterPanel('addFilterField', $MapReduceStageFilter);

    /*
     * Column Panel
     */

    var $ColumnPanel = $('<div>').psgpColumnPanel({
        columndef: [{
            width: '75%',
            padding: '0px 0px 0px 0px'
        }, {
            width: '25%',
            padding: '0px 0px 0px 0px'
        }]
    });

    /*
     * Performance Chart Portlet
     */
    var $PerformanceChartPortlet = $('<div>').addClass('apm-ssa-perfchart-portlet').psgpPortlet({
        title: APMTranslation.apm.ssa.label.performancechart(),
        helpLink : { hover : APMTranslation.apm.r2019a.moreinformation(), link: '/app/help/helpcenter.nl?fid=section_4304077929.html' }
    });

    var $PerformanceChartContainer =  $(
        '<div class="apm-ssa-performance-chartcontainer">' +
            '<div class="chart"></div>' +
        '</div>'
    );

    var $NoRecordsToShow = $(
        '<div class="apm-ssa-no-records-container">' +
            '<div class="chart-warning"></div>' +
            '<div class="label">' + APMTranslation.apm.r2020a.norecordsareavailablefordisplay() + '</div>' +
        '</div>'
    );

    $PerformanceChartContainer.append($NoRecordsToShow);
    $PerformanceChartPortlet.psgpPortlet('getBody').append($PerformanceChartContainer);
    $PerformanceChartContainer.find('.chart').hide();

    /*
     * SuiteScript Details Portlet
     */
    var $SuiteScriptDetailsPortlet = $('<div>').addClass('apm-ssa-suiteScriptDetails-portlet').psgpPortlet({
        title:  APMTranslation.apm.ssa.label.suitescriptdetails(),
        helpLink : { hover : APMTranslation.apm.r2019a.moreinformation(), link: '/app/help/helpcenter.nl?fid=section_4304077994.html' }
    });

    var $SummarySection = $(
        '<div class="apm-ssa-summary-fields">' +
            '<div class="apm-ssa-summary-scriptname">' +
                '<div class="label">' + APMTranslation.apm.common.label.name() + '</div>' +
                '<div class="value">-</div>' +
            '</div>' +
            '<div class="apm-ssa-summary-scripttype">' +
                '<div class="label">' + APMTranslation.apm.common.label.type() + '</div>' +
                '<div class="value">-</div>' +
            '</div>' +
            '<div class="apm-ssa-summary-context" style="display: none;">' +
                '<div class="label">' + APMTranslation.apm.common.label.context() + '</div>' +
                '<div class="value">-</div>' +
            '</div>' +
            '<div class="apm-ssa-summary-date">' +
                '<div class="from">' +
                    '<div class="label">' + APMTranslation.apm.r2020a.startdateandtime() + '</div>' +
                    '<div class="value">-</div>' +
                '</div>' +
                '<div class="to">' +
                    '<div class="label">' + APMTranslation.apm.r2020a.enddateandtime() + '</div>' +
                    '<div class="value">-</div>' +
                '</div>' +
            '</div>' +
        '</div>'
    );

    function refreshSummary() {
        var globalSettings = APMSSA.Services.getGlobalSettings();

        //Set initial values
        $SummarySection.find('.apm-ssa-summary-scriptname .value').text('-');
        $SummarySection.find('.apm-ssa-summary-scripttype .value').text('-');
        $SummarySection.find('.apm-ssa-summary-context .value').text('-');
        $SummarySection.find('.apm-ssa-summary-date .from .value').text('-');
        $SummarySection.find('.apm-ssa-summary-date .to .value').text('-');
        $SummarySection.find('.apm-ssa-summary-context').hide();

        //Set script name
        if (globalSettings.compfil == SSA_PARAMS.myCompany) {
            var script = globalSettings.scriptName ? globalSettings.scriptName : globalSettings.scriptId;
            $SummarySection.find('.apm-ssa-summary-scriptname .value').text(globalSettings.scriptName);
        } else {
            //[Internal ID] [Custom scriptname]
            //Make sure scriptId and scriptName are not the same
            var script = (globalSettings.scriptName && globalSettings.scriptName != globalSettings.scriptId) ? globalSettings.scriptId + ' ' + globalSettings.scriptName : globalSettings.scriptId;
            $SummarySection.find('.apm-ssa-summary-scriptname .value').text(script);
        }

        //Set script type
        var type = $TypeFilter.find('.psgp-combobox option[value="'+globalSettings.scriptType+'"]').text();
        $SummarySection.find('.apm-ssa-summary-scripttype .value').text(type);

        //If user event, set context
        if (globalSettings.scriptType.indexOf('userevent') != -1) {
            var context = $ContextFilter.find('.psgp-combobox option[value="'+globalSettings.context+'"]').text();
            context = context ? context : '-';
            $SummarySection.find('.apm-ssa-summary-context .value').text(context);
            $SummarySection.find('.apm-ssa-summary-context').show();
        }

        if (globalSettings.drilldown == 'T') {
            var startDateObj = new Date(globalSettings.drilldownStartDate);
            var endDateObj = new Date(globalSettings.drilldownEndDate);
        } else {
            var startDateObj = new Date(globalSettings.startDate);
            var endDateObj = new Date(globalSettings.endDate);
        }

        var tzoffset = (new Date()).getTimezoneOffset() * 60* 1000; //offset in milliseconds
        var startDateMS = new Date(startDateObj.getTime() - tzoffset);
        var endDateMS = new Date(endDateObj.getTime() - tzoffset);

        var startDateStr = Highcharts.dateFormat('%b %e, %l:%M %p', startDateMS);
        var endDateStr = Highcharts.dateFormat('%b %e, %l:%M %p', endDateMS);

        //Set from/to dates
        $SummarySection.find('.apm-ssa-summary-date .from .value').text(startDateStr);
        $SummarySection.find('.apm-ssa-summary-date .to .value').text(endDateStr);
    }

    var suiteSciptDetailOptions = {
        paging: false,
        data: [
            { "name": "logsTotal", "value": 0 },
            { "name": "usersTotal", "value": 0 },
            { "name": "totaltimeMed", "value": 0 },
            { "name": "usagecountMed", "value": 0 },
            { "name": "urlrequestsMed", "value": 0 },
            { "name": "searchesMed", "value": 0 },
            { "name": "recordsMed", "value": 0 },
            { "name": "errorCount", "value": 0 }
        ],
        columns: [{
                dataIndex: 'name',
                text: APMTranslation.apm.common.label.name(),
                renderer: function(value, record) {
                    switch (value) {
                        case 'logsTotal': return APMTranslation.apm.common.label.numberoflogs();
                        case 'usersTotal': return APMTranslation.apm.common.label.users();
                        case 'totaltimeMed': return APMTranslation.apm.common.label.totaltime();
                        case 'usagecountMed': return APMTranslation.apm.ssa.label.usagecount();
                        case 'urlrequestsMed': return APMTranslation.apm.common.label.urlrequests();
                        case 'searchesMed': return APMTranslation.apm.ssa.label.searchcalls();
                        case 'recordsMed': return APMTranslation.apm.common.label.recordoperations();
                        case 'errorCount': return APMTranslation.apm.ssa.label.errorcount();
                        default: return '';
                    }
                }
            },
            {
                dataIndex: 'value',
                text: APMTranslation.apm.ssa.label.value(),
                renderer: function(value, record) {
                    return (value ? value : 0)
                }
            }
        ],
        listeners: {
            afterRefreshData: function(grid) {
            }
        }
    };

    var $SuiteScriptDetailGrid = $('<div class="apm-ssa-suitescriptdetail-grid">').psgpGrid(suiteSciptDetailOptions);

    var $BtnViewLogs = $('<div class="btn-viewlogs">').psgpGrayButton({
        text: APMTranslation.apm.ssa.label.viewlogs(),
        handler: function () {
            var globalSettings = APMSSA.Services.getGlobalSettings();
            var params = {
                startDate: (globalSettings.drilldown == 'T') ? globalSettings.drilldownStartDate : globalSettings.startDate,
                endDate: (globalSettings.drilldown == 'T') ? globalSettings.drilldownEndDate : globalSettings.endDate,
                scriptType: globalSettings.scriptType,
                scriptId: globalSettings.scriptId,
                context: globalSettings.context,
                clientEventType: globalSettings.clientEventType,
                mapReduceStage: globalSettings.mapReduceStage,
                compfil: globalSettings.compfil
            };

            showSsLogsPopup(params);
        }
    });

    $SuiteScriptDetailsPortlet.psgpPortlet('getBody')
        .append($SummarySection)
        .append($SuiteScriptDetailGrid)
        .append($BtnViewLogs);

    function showSsLogsPopup(params) {
        var suiteScriptLogOptions = {
            url: APMSSA.Services.getURL('suiteScriptLogs'),
            sort: {
                dataIndex: 'date',
                dir: false,
                remote: true
            },
            paging: {
                pageLimit: 10
            },
            exportCSV: true,
            columns: [
                {
                    dataIndex: 'date',
                    text: APMTranslation.apm.common.label.datetime(),
                    width: '15%'
                },
                {
                    dataIndex: 'entityname',
                    text: APMTranslation.apm.common.label.name(),
                    sortable: false
                },
                {
                    dataIndex: 'email',
                    text: APMTranslation.apm.r2020a.emailaddress(),
                },
                {
                    dataIndex: 'role',
                    text: APMTranslation.apm.r2020a.roleid()
                },
                {
                    dataIndex: 'recordid',
                    text: APMTranslation.apm.ssa.label.recordid()
                },
                {
                    dataIndex: 'context',
                    text: APMTranslation.apm.common.label.context(),
                    renderer: function(value) {
                        var context = $ContextFilter.find('.psgp-combobox option[value="'+value+'"]').text();
                        context = context ? context : value;
                        return context;
                    }
                },
                {
                    dataIndex: 'totaltime',
                    text: APMTranslation.apm.common.label.totaltime()
                },
                {
                    dataIndex: 'usagecount',
                    text: APMTranslation.apm.ssa.label.usagecount(),
                    renderer: function(value) {
                        var globalSettings = APMSSA.Services.getGlobalSettings();
                        if (globalSettings.scriptType == 'client') {
                            return '\u2013';
                        }
                        return value;
                    }
                },
                {
                    dataIndex: 'urlrequests',
                    text: APMTranslation.apm.common.label.urlrequests(),
                    renderer: function(value) {
                        var globalSettings = APMSSA.Services.getGlobalSettings();
                        if (globalSettings.scriptType == 'client') {
                            return '\u2013';
                        }
                        return value;
                    }
                },
                {
                    dataIndex: 'searches',
                    text: APMTranslation.apm.ssa.label.searchcalls(),
                    renderer: function(value) {
                        var globalSettings = APMSSA.Services.getGlobalSettings();
                        if (globalSettings.scriptType == 'client') {
                            return '\u2013';
                        }
                        return value;
                    }
                },
                {
                    dataIndex: 'records',
                    text: APMTranslation.apm.common.label.recordoperations(),
                    renderer: function(value) {
                        var globalSettings = APMSSA.Services.getGlobalSettings();
                        if (globalSettings.scriptType == 'client') {
                            return '\u2013';
                        }
                        return value;
                    }
                },
                {
                    dataIndex: 'errorcode',
                    text: APMTranslation.apm.r2020a.includeserrors(),
                },
                {
                    dataIndex: 'viewDetails',
                    text: APMTranslation.apm.r2019a.profilerdetails(),
                    renderer: function(value, record) {
                        var $markUp = $('<div><div class="apm-ssa-sslogs-viewdetails-icon"></div></div>');
                        return $markUp.html();
                    },
                    resizable: false,
                    sortable: false
                }
            ],
            listeners: {
                afterRefreshData: function (grid, response) {
                    var rows = grid.element.find('tbody tr');
                    var gData = grid.options.data;
                    var gParams = grid.options.params;
                    rows.each(function(index) {
                        var me = this;
                        $(me).find('.apm-ssa-sslogs-viewdetails-icon').attr('param-rowIndex', $(this).index());
                    });
                    rows.hover(
                        function() {
                            $(this).find('.apm-ssa-sslogs-viewdetails-icon').addClass('showicon');
                        },
                        function() {
                            $(this).find('.apm-ssa-sslogs-viewdetails-icon').removeClass('showicon');
                        }
                    );
                    rows.find('.apm-ssa-sslogs-viewdetails-icon').click(function() {
                        var globalSettings = APMSSA.Services.getGlobalSettings();
                        //do not redirect if clientscript
                        if (globalSettings.scriptType == 'client') {
                            alert(APMTranslation.apm.r2019a.profilerdetailsalert());
                            return;
                        }

                        var me = this;
                        var rData = gData[$(me).attr('param-rowIndex')];
                        var params = {
                            compfil: globalSettings.compfil,
                            operationId: rData.operationId,
                            frhtId: rData.frhtId
                        }

                        var paramString = $.param(params);
                        var PRF_URL = '/app/site/hosting/scriptlet.nl?script=customscript_apm_prf_sl_main&deploy=customdeploy_apm_prf_sl_main';
                        window.open(PRF_URL + '&' + paramString);
                    });
                }
            }
        };

        var $SuiteScriptLogs = $('<div class="apm-ssa-suitescript-logs">' +
                '<div class="grid"></div>' +
            '</div>');

        $SuiteScriptLogs.psgpDialog({
            title: APMTranslation.apm.ssa.label.suitescriptdetails().toUpperCase(),
            width: 900
        });

        $SuiteScriptLogs.parents('.ui-dialog').css({
            "position": "absolute",
            "top": ( $(window).height() - $SuiteScriptLogs.parents('.ui-dialog').height() ) / 2 + "px",
            "left": ( $(window).width() - $SuiteScriptLogs.parents('.ui-dialog').width() ) / 2 + $(window).scrollLeft() + "px"
        });

        var $grid = $SuiteScriptLogs.find('.grid').psgpGrid(suiteScriptLogOptions);
        $grid.psgpGrid('refreshDataRemote', params);
    }

    return {
        $SuiteAppNote: $SuiteAppNote,
        $TitleBar: $TitleBar,
        $CustomerDebuggingDialog: $CustomerDebuggingDialog,
        $BtnSearch: $BtnSearch,
        $FilterPanel: $FilterPanel,
        $StartDateTimeFilter: $StartDateTimeFilter,
        $EndDateTimeFilter: $EndDateTimeFilter,
        $TypeFilter: $TypeFilter,
        $NameFilter: $NameFilter,
        $IdFilter: $IdFilter,
        $ContextFilter: $ContextFilter,
        $ClientEventTypeFilter: $ClientEventTypeFilter,
        $MapReduceStageFilter: $MapReduceStageFilter,
        $ColumnPanel: $ColumnPanel,
        $PerformanceChartPortlet: $PerformanceChartPortlet,
        $PerformanceChartContainer: $PerformanceChartContainer,
        $NoRecordsToShow: $NoRecordsToShow,
        $SuiteScriptDetailsPortlet: $SuiteScriptDetailsPortlet,
        refreshSummary: refreshSummary,
        $SuiteScriptDetailGrid: $SuiteScriptDetailGrid
    };
};
