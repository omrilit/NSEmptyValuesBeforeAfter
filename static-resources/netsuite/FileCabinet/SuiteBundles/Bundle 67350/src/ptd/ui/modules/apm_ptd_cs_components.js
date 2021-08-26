/**
 * Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Mar 2015     jyeh             Initial
 * 2.00       24 Mar 2015     jyeh
 * 3.00       28 Mar 2015     jyeh
 * 4.00       06 Apr 2015     rwong            Changed link to add support for trigger types
 * 5.00       09 Apr 2015     jyeh
 * 6.00       01 Jul 2015     jmarimla         Updated loading masks
 * 7.00       06 Aug 2015     rwong            Added url css class to links
 * 8.00       11 Aug 2015     rwong            Added url css class to script deployment
 * 9.00       28 Aug 2015     rwong            Added support for customer debugging
 * 10.00      04 May 2018     jmarimla         N/A client script columns
 * 11.00      16 May 2018     jmarimla         en dash
 * 12.00      29 Jun 2018     jmarimla         Translation readiness
 * 13.00      26 Jul 2018     jmarimla         FRHT column
 * 14.00      18 Oct 2018     jmarimla         Redirect to profiler
 * 15.00      26 Oct 2018     jmarimla         Frht label
 * 16.00      04 Jan 2019     rwong            Added translation to no records to show.
 * 17.00      12 Apr 2019     jmarimla         Move profiler link
 * 18.00      17 Jul 2019     erepollo         Converted to linux EOL
 * 19.00      17 Jul 2019     erepollo         Added script name in customer debug
 * 20.00      29 Jul 2019     erepollo         Changes in bundle and script names
 * 21.00      08 Aug 2019     erepollo         Moved script name handling to backend
 * 22.00      14 Aug 2019     erepollo         Changes in sorting script/workflow and deployment names
 * 23.00      11 Oct 2019     jmarimla         Search by operationid
 * 24.00      17 Jan 2020     jmarimla         Customer debug changes
 * 25.00      03 Apr 2020     earepollo        Added custom GL lines scripts
 * 26.00      21 Apr 2020     earepollo        ExtJS to jQuery
 * 27.00      29 Apr 2020     earepollo        Fixed bug in profiler link show/hide
 * 28.00      19 May 2020     jmarimla         Payment processing plugin
 * 29.00      21 May 2020     earepollo        Tax calculation plugin
 * 30.00      21 May 2020     lemarcelo        Revenue Management plugin (advancedrevrec)
 * 31.00      15 Jun 2020     earepollo        Label changes for plug-in and script types
 * 32.00      18 Jun 2020     earepollo        Translation readiness
 * 33.00      27 Jul 2020     lemarcelo        Added chart note
 * 34.00      30 Jul 2020     jmarimla         r2020a strings
 * 35.00      10 Sep 2020     lemarcelo        Financial Institution Connectivity plugin
 * 36.00      10 Sep 2020     earepollo        Email capture plugin
 * 37.00      21 Sep 2020     lemarcelo        Shipping Partners plugin
 * 38.00      06 Oct 2020     earepollo        Promotions plugin
 * 39.00      19 Nov 2020     lemarcelo        Added help link and icon
 * 40.00      23 Mar 2021     earepollo        Translation readiness
 * 41.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 *
 */
APMPTD = APMPTD || {};

APMPTD._Components = function() {

    var $SuiteAppNote = $("<div>").psgpNewSuiteAppNote();

    var $TitleBar = $('<div>').psgpSuiteletTitle({
        title: APMTranslation.apm.ptd.label.pagetimedetails()
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

    /*
     * Profiler Link
     */

    function redirectToProfiler() {
        var globalSettings = APMPTD.Services.getGlobalSettings();
        var params = {
                compfil: globalSettings.compfil,
                operationId: globalSettings.operationId
        }
        var paramString = $.param(params);
        var PRF_URL = '/app/site/hosting/scriptlet.nl?script=customscript_apm_prf_sl_main&deploy=customdeploy_apm_prf_sl_main';
        window.open(PRF_URL + '&' + paramString);
    }
    var $ProfilerLink = $('<a class="apm-redirectlink" onclick="APMPTD.Components.redirectToProfiler()" href="javascript:void(0);">' + APMTranslation.apm.r2019a.profilerdetails() + '</a>');

    /*
     * Customer Debugging
     */
    var $CustomerDebuggingDialog =  $('' +
            '<div class="apm-ptd-dialog-custdebug">' +
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
            var globalSettings = APMPTD.Services.getGlobalSettings();
            var $dialog = $(me).parents('.apm-ptd-dialog-custdebug');
            $dialog.dialog('close');

            var compfil = $dialog.find('.field-customer .psgp-textbox').val();
            globalSettings.compfil = compfil.trim();
            APMPTD.Services.refreshData();
        }
    });

    $CustomerDebuggingDialog.find('.btn-cancel').psgpGrayButton({
        text: APMTranslation.apm.common.button.cancel(),
        handler: function () {
            var me = this;
            var globalSettings = APMPTD.Services.getGlobalSettings();
            var $dialog = $(me).parents('.apm-ptd-dialog-custdebug');
            $dialog.dialog('close');

            var oldCompfil = globalSettings.compfil;
            $dialog.find('.field-customer .psgp-textbox').val(oldCompfil);
        }
    });

    var $CustomerDebuggingLabel = $('<div>').addClass('apm-ptd-settings-custdebug')
    .psgpSuiteletSettings({
        label: APMTranslation.apm.common.label.customerdebugsettings(),
        $dialog: $CustomerDebuggingDialog
    });

    if (PTD_PARAMS.debugMode) {
        $TitleBar.append($CustomerDebuggingLabel);
    }
    $TitleBar.append($ProfilerLink);
    $ProfilerLink.hide();

    /*
     * Search by Operation ID
     */
    var $OperationIdSearch =  $('' +
            '<div class="apm-ptd-operationid-search">' +
                '<div class="psgp-field-label">' + APMTranslation.apm.r2020a.operationid() + '</div>' +
                '<span class="field-operationid"></span>' +
                '<span class="btn-search"></div></span>' +
            '</div>');

    $OperationIdSearch.find('.btn-search').psgpBlueButton({
        text: APMTranslation.apm.common.button.refresh(),
        handler: function () {
            var me = this;
            var globalSettings = APMPTD.Services.getGlobalSettings();
            var $dialog = $(me).parents('.apm-ptd-operationid-search');
            var operationId = $dialog.find('.field-operationid .psgp-textbox').val();
            globalSettings.operationId = operationId;
            APMPTD.Services.refreshData();
        }
    });

    $OperationIdSearch.find('.field-operationid').psgpTextBox({
        width:  300
    });

    /*
     * Overview
     */
    var $OverviewPortlet = $('<div>').psgpPortlet({
        title: APMTranslation.apm.common.label.overview()
    });

    var $KPIDetails = $('<div>')

    function refreshKPI(kpiData) {

        var kpiConfig = [{
                id: 'operationId',
                label: APMTranslation.apm.r2020a.operationid()
            },
            {
                id: 'page',
                label: APMTranslation.apm.ptd.label.page()
            },
            {
                id: 'time',
                label: APMTranslation.apm.common.label.datetime()
            },
            {
                id: 'email',
                label: APMTranslation.apm.r2020a.emailaddress()
            },
            {
                id: 'suitescripttime',
                label: APMTranslation.apm.ns.context.suitescript()
            },
            {
                id: 'workflowtime',
                label: APMTranslation.apm.ns.context.workflow()
            }
        ];

        var blockMarkUp =
            '<div class="apm-ptd-kpi-block">' +
            '<div class="label"></div>' +
            '<div class="value"></div>' +
            '</div>';

        var rowMarkUp = '<div class="apm-ptd-kpi-row"></div>';

        var $kpiContainer = $('<div class="apm-ptd-kpi-container"></div>');

        var maxColumns = 3;
        for (var i = 0; i < kpiConfig.length; i = i + maxColumns) {
            var $row = $(rowMarkUp);

            for (var j = 0; j < maxColumns; j++) {
                if (i + j < kpiConfig.length) {
                    var $block = $(blockMarkUp);
                    $block.find('.label').text(kpiConfig[i + j].label);
                    $block.find('.value').text(kpiData[kpiConfig[i + j].id]);
                    $row.append($block);
                }
            }

            $kpiContainer.append($row);
        }

        $KPIDetails.empty();
        $KPIDetails.append($kpiContainer);
    }

    var $TimelineSubPanel = $('<div class="apm-ptd-subpanel-timeline">').psgpSubPanel({
        title: APMTranslation.apm.common.label.timeline(),
        helpLink : { hover : APMTranslation.apm.r2019a.moreinformation(), link: '/app/help/helpcenter.nl?fid=section_160316221937.html' }
    });

    var $NoRecordsToShow = $(
        '<div class="apm-ptd-no-records-container">' +
            '<div class="chart-warning"></div>' +
            '<div class="label">' + APMTranslation.apm.r2020a.norecordsareavailablefordisplay() + '</div>' +
        '</div>'
    );

    var $TimelineChartContainer =  $(
        '<div class="apm-ptd-timeline-chartcontainer">' +
            '<div class="chart-note">' + APMTranslation.apm.r2019a.clickanddragtozoom() + '</div>' +
            '<div class="chart"></div>' +
        '</div>'
    );

    $TimelineChartContainer.append($NoRecordsToShow);
    $TimelineSubPanel.psgpSubPanel('getBody').append($TimelineChartContainer);

    var $SuiteSciptDetailSubPanel = $('<div class="apm-ptd-subpanel-suitescriptdetail">').psgpSubPanel({
        title: APMTranslation.apm.r2020a.suitescriptandworkflowdetails(),
        helpLink : { hover : APMTranslation.apm.r2019a.moreinformation(), link: '/app/help/helpcenter.nl?fid=section_4304056396.html' }
    });

    var suiteSciptDetailOptions = {
        paging: false,
        columns: [{
                dataIndex: 'date',
                text: APMTranslation.apm.common.label.datetime()
            },
            {
                dataIndex: 'scripttype',
                text: APMTranslation.apm.common.label.type(),
                renderer: function(value, record) {
                    switch(value) {
                    case 'CLIENT': return APMTranslation.apm.ptd.label.script() + ': ' + APMTranslation.apm.common.label.client(); break;
                    case 'USEREVENT': return APMTranslation.apm.ptd.label.script() + ': ' + APMTranslation.apm.common.label.userevent(); break;
                    case 'WORKFLOW': return APMTranslation.apm.ns.context.workflow(); break;
                    case 'CUSTOMGLLINES': return APMTranslation.apm.r2020a.plugin() + ': ' + APMTranslation.apm.r2020a.customgllines(); break;
                    case 'EMAILCAPTURE': return APMTranslation.apm.r2020a.plugin() + ': ' + APMTranslation.apm_r2021a_emailcapture(); break;
                    case 'FICONNECTIVITY': return APMTranslation.apm.r2020a.plugin() + ': ' + APMTranslation.apm_r2021a_financialinstitutionconnectivity(); break;
                    case 'PAYMENTGATEWAY': return APMTranslation.apm.r2020a.plugin() + ': ' + APMTranslation.apm.r2020a.paymentgateway(); break;
                    case 'PROMOTIONS': return APMTranslation.apm.r2020a.plugin() + ': ' + APMTranslation.apm_r2021a_promotions(); break;
                    case 'ADVANCEDREVREC': return APMTranslation.apm.r2020a.plugin() + ': ' + APMTranslation.apm.r2020a.revenuemanagement(); break;
                    case 'SHIPPINGPARTNERS': return APMTranslation.apm.r2020a.plugin() + ': ' + APMTranslation.apm_r2021a_shippingpartners(); break;
                    case 'TAXCALCULATION': return APMTranslation.apm.r2020a.plugin() + ': ' + APMTranslation.apm.r2020a.taxcalculation(); break;
                    default: return value;
                    }
                }
            },
            {
                dataIndex: 'script',
                text: APMTranslation.apm.common.label.name(),
                renderer: function(value, record) {
                    var url = record.scriptwfurl;
                    var scriptName = record.scriptName;
                    var scriptId = record.scriptid;
                    var customScriptId = record.customscriptid;
                    var script = (customScriptId && scriptId != customScriptId) ? scriptId + ' ' + customScriptId : scriptId;

                    if (!((PTD_PARAMS.debugMode) && (PTD_PARAMS.compfil != PTD_PARAMS.myCompany))) {
                        script = scriptName ? scriptName : script;
                    }

                    if (url != '') {
                        return '<a href="' + url + '" target="_blank" class="apm-a">'
                            + script + '</a>';
                    } else {
                        return script;
                    }
                }
            },
            {
                dataIndex: 'triggertype',
                text: APMTranslation.apm.common.label.executioncontext(),
            },
            {
                dataIndex: 'deployment',
                text: APMTranslation.apm.spjd.label.deployment(),
                renderer: function(value, record) {
                    var url = record.deploymenturl;
                    var deploymentName = record.deploymentName;
                    var deploymentId = record.deploymentId;
                    var customDeploymentId = record.customDeploymentId;
                    var deployment = customDeploymentId ? deploymentId + ' ' + customDeploymentId : deploymentId;

                    if (!((PTD_PARAMS.debugMode) && (PTD_PARAMS.compfil != PTD_PARAMS.myCompany))) {
                        deployment = deploymentName ? deploymentName : deployment;
                    }

                    if (url != '')
                    {
                        return '<a href="'+url+'" target="_blank" class="apm-a">'
                            + deployment +'</a>';
                    }
                    return deployment;
                }
            },
            {
                dataIndex: 'totaltime',
                text: APMTranslation.apm.common.label.totaltime()
            },
            {
                dataIndex: 'usagecount',
                text: APMTranslation.apm.r2020a.usageunits(),
                renderer: function(value,record) {
                    var scriptType = record.scripttype;
                    if (scriptType == 'CLIENT') {
                        return '\u2013';
                    }
                    return value;
                }
            },
            {
                dataIndex: 'records',
                text: APMTranslation.apm.common.label.recordoperations(),
                renderer: function(value,record) {
                    var scriptType = record.scripttype;
                    if (scriptType == 'CLIENT') {
                        return '\u2013';
                    }
                    return value;
                }
            },
            {
                dataIndex: 'urlrequests',
                text: APMTranslation.apm.common.label.urlrequests(),
                renderer: function(value,record) {
                    var scriptType = record.scripttype;
                    if (scriptType == 'CLIENT') {
                        return '\u2013';
                    }
                    return value;
                }
            },
            {
                dataIndex: 'searches',
                text: APMTranslation.apm.ptd.label.searches(),
                renderer: function(value,record) {
                    var scriptType = record.scripttype;
                    if (scriptType == 'CLIENT') {
                        return '\u2013';
                    }
                    return value;
                }
            }
        ],
        listeners: {
            afterRefreshData: function(grid) {
            }
        }
    };

    var $SuiteScriptDetailGrid = $('<div class="apm-ptd-suitescriptdetail-grid">').psgpGrid(suiteSciptDetailOptions);
    $SuiteSciptDetailSubPanel.psgpSubPanel('getBody').append($SuiteScriptDetailGrid);

    $OverviewPortlet.psgpPortlet('getBody')
        .append($KPIDetails)
        .append($TimelineSubPanel)
        .append($SuiteSciptDetailSubPanel);

    return {
        $SuiteAppNote: $SuiteAppNote,
        $TitleBar: $TitleBar,
        $ColumnPanel: $ColumnPanel,
        $CustomerDebuggingDialog: $CustomerDebuggingDialog,
        $OperationIdSearch: $OperationIdSearch,
        $OverviewPortlet: $OverviewPortlet,
        refreshKPI: refreshKPI,
        redirectToProfiler: redirectToProfiler,
        $ProfilerLink: $ProfilerLink,
        $TimelineChartContainer: $TimelineChartContainer,
        $NoRecordsToShow: $NoRecordsToShow,
        $SuiteScriptDetailGrid: $SuiteScriptDetailGrid
    };
};