/**
 * Copyright © 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.Main = TAF.Main || {};

TAF.Main.OnPageInit = function _OnPageInit(type) { new __AuditFileCS().OnPageInit(type); };
TAF.Main.OnValidateField = function _OnValidateField(type, name, linenum) { return new __AuditFileCS().OnValidateField(type, name, linenum); };
TAF.Main.OnFieldChanged = function _OnFieldChanged(type, name, linenum) { new __AuditFileCS().OnFieldChanged(type, name, linenum); };



function __AuditFileCS() {
    //Implement as singleton.
    //Client script handlers should be singletons to retain cached data.
    if (__AuditFileCS.SingletonInstance !== undefined) {
        return __AuditFileCS.SingletonInstance;
    }
    __AuditFileCS.SingletonInstance = this;


    var CONTEXT = nlapiGetContext();
    var IS_ONEWORLD = CONTEXT.getSetting("FEATURE", "SUBSIDIARIES") == "T";
    var IS_MULTIBOOK = CONTEXT.getSetting('FEATURE', 'MULTIBOOK') == 'T';
    var strMsgs = {};

    this.OnPageInit = _OnPageInit;
    this.OnValidateField = _OnValidateField;
    this.OnFieldChanged = _OnFieldChanged;

    function _OnPageInit(type) {
    	togglePeriodSelectDisplay();
        toggleGroupDisplay();
        toggleAccountingBookDisplay();
        toggleEngineOption();
        togglePostingDateDisplay();

        jQuery("a[name='delfile']").on('click', _OnDeleteFile);


        //Hook Refresh buttons
        var btnJobsRefresh = document.forms["custpage_audit_files_main_form"].elements["refreshcustpage_audit_files"];
        if (btnJobsRefresh != null) {
            btnJobsRefresh.onclick = _OnRefresh;
        }

        var btnNotesRefresh = document.forms["system_notes_main_form"].elements["refreshsystem_notes"];
        if (btnNotesRefresh != null) {
            btnNotesRefresh.onclick = _OnRefresh;
        }
        
        strMsgs = JSON.parse(nlapiGetFieldValue('custpage_cs_msgs'));

        showReportDesc();
    }





    function getUrl() {
        var url = nlapiResolveURL('SUITELET', TAF.CONSTANTS.SUITELET.MAIN.SUITELET_ID, TAF.CONSTANTS.SUITELET.MAIN.DEPLOYMENT_ID);
        var urlManager = new TAF.UrlManager(url);
        urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.REPORT, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.REPORT));
        urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.ACCOUNTING_PERIOD_FROM, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.ACCOUNTING_PERIOD_FROM));
        urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.ACCOUNTING_PERIOD_TO, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.ACCOUNTING_PERIOD_TO));
        urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.TAX_PERIOD_FROM, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.TAX_PERIOD_FROM));
        urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.TAX_PERIOD_TO, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.TAX_PERIOD_TO));
        urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.ACCOUNTING_CONTEXT, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.ACCOUNTING_CONTEXT));
        urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.START_DATE, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.START_DATE));
        urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.END_DATE, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.END_DATE));
        urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.POSTING_DATE, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.POSTING_DATE));

        if (IS_ONEWORLD) {
            urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.SUBSIDIARY, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.SUBSIDIARY));
            urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.INCLUDE_CHILD_SUBS, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.INCLUDE_CHILD_SUBS));
            urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.SUBSIDIARIES, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.SUBSIDIARIES));
        }

        if (IS_MULTIBOOK) {
            if (!isPrimaryBookSelected()) {
                urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.ACCOUNTING_BOOK, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.ACCOUNTING_BOOK));
            }
            urlManager.addUrlParameter(TAF.CONSTANTS.FIELDS.ACCOUNTING_BOOKS, nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.ACCOUNTING_BOOKS));
        }

        return urlManager;
    }





    function _OnRefresh() {
        var urlManager = getUrl();
        setWindowChanged(window, false);  //Undocumented NetSuite function
        window.location = urlManager.getFullUrl();

        return false;
    }





    function _OnDeleteFile() {
        var reportId = jQuery(this).attr('reportId');
        var urlManager = getUrl();
        urlManager.addUrlParameter('del', reportId);
        if (confirm(strMsgs["MSG_CONFIRM_DELETE"])) {
            setWindowChanged(window, false);  //Undocumented NetSuite function
            window.location = urlManager.getFullUrl();
        }
        return false;
    }





    function _OnValidateField(type, name, linenum) {
        if (name === "accountingperiod_from" ||
            name === "accountingperiod_to" ||
            name === "taxperiod_from" ||
            name === "taxperiod_to" ||
            name === 'start_date' ||
            name === 'end_date') {
            var repId = nlapiGetFieldValue("report");
            var repDef = _GetReportDef(repId);

            if (repDef.IsPeriodRange) {
                if (repDef.PeriodType === 'date') {
                    return _ValidateDateRange(repDef);
                } else {
                    return _ValidatePeriodRange(repDef);
                }
            }
        }

        return true;
    }

    function _ValidatePeriodRange(repDef) {
        var periodDates = getPeriodDates(repDef.PeriodType);
        var startPeriodId = nlapiGetFieldValue(repDef.PeriodType + '_from');
        var endPeriodId = nlapiGetFieldValue(repDef.PeriodType + '_to');

        if (periodDates[endPeriodId].end < periodDates[startPeriodId].start) {
            alert(strMsgs['MSG_PERIOD_NOT_CHRONOLOGICAL']);
            return false;
        }
        return true;
    }

    function _ValidateDateRange(repDef) {
        var result = true;
        var today = nlapiDateToString(new Date());
        var startDate = nlapiGetFieldValue('start_date');
        var endDate = nlapiGetFieldValue('end_date');

        if (!startDate) {
            alert(strMsgs['MSG_PERIOD_NOT_CHRONOLOGICAL']); // TODO
            nlapiSetFieldValue('start_date', nlapiGetFieldValue('end_date') || today);
            result = false;
        } else if (!endDate) {
            alert(strMsgs['MSG_PERIOD_NOT_CHRONOLOGICAL']); // TODO
            nlapiSetFieldValue('end_date', nlapiGetFieldValue('start_date') || today);
            result = false;
        } else if (nlapiStringToDate(endDate) < nlapiStringToDate(startDate)) {
            alert(strMsgs['MSG_PERIOD_NOT_CHRONOLOGICAL']); // TODO
            nlapiSetFieldValue('start_date', nlapiGetFieldValue('end_date') || today);
            result = false;
        }
        return result;
    }





    function _OnFieldChanged(type, name, linenum) {
        switch (name) {
            case TAF.CONSTANTS.FIELDS.REPORT:
                jQuery('.report_desc').hide('slow');
                showReportDesc();
                togglePeriodSelectDisplay();
                toggleGroupDisplay();
                toggleAccountingBookDisplay();
                toggleEngineOption();
                togglePostingDateDisplay();
                break;
            case TAF.CONSTANTS.FIELDS.SUBSIDIARY:
                if (IS_MULTIBOOK) {
                    // submit form to load list of applicable accounting books for the selected subsidiary
                    nlapiSetFieldValue(TAF.CONSTANTS.FIELDS.ACCOUNTING_BOOKS, '');
                    _OnRefresh();
                }
                break;
            case TAF.CONSTANTS.FIELDS.ACCOUNTING_BOOK:
                toggleGroupDisplay();
                break;
            default:
        }
        setWindowChanged(window, false);
    }





    function showReportDesc()
    {
        jQuery('.report_desc.' + nlapiGetFieldValue('report')).show('slow');
    }





    function togglePeriodSelectDisplay()
    {
        var repId = nlapiGetFieldValue("report");
        var repDef = _GetReportDef(repId);
        var currentPeriodType = repDef.PeriodType;

        //Show only fields for one type of period at a time
        if (currentPeriodType === 'date') {
            setDateFieldDisplay(true);
            jQuery('[id^="accountingperiod_"]').hide();
            jQuery('[id^="taxperiod_"]').hide();
        } else if (currentPeriodType == "accountingperiod") {
            jQuery('[id^="accountingperiod_"]').show();
            jQuery('[id^="taxperiod_"]').hide();
            setDateFieldDisplay(false);
        } else {
            jQuery('[id^="accountingperiod_"]').hide();
            jQuery('[id^="taxperiod_"]').show();
            setDateFieldDisplay(false);
        }

        //Show/hide end period dropdown
        var field = jQuery('[id^="' + currentPeriodType + '_to"]');
        if (repDef.IsPeriodRange) {
            field.show();
        } else {
            field.hide();
        }
    }

    function setDateFieldDisplay(isDisplayed) {
        setFieldDisplay('start_date', isDisplayed);
        setFieldDisplay('end_date', isDisplayed);

        if (!nlapiGetFieldValue('start_date') && !isDisplayed) {
            nlapiSetFieldValue('start_date', nlapiDateToString(new Date()));
        }

        if (!nlapiGetFieldValue('end_date') && !isDisplayed) {
            nlapiSetFieldValue('end_date', nlapiGetFieldValue('start_date'));
        }
    }





    function setFieldDisplay(fieldId, isDisplayed) {
        if (!fieldId) {
            return;
        }

        var field = nlapiGetField(fieldId);
        if (field) {
            field.setDisplayType(isDisplayed ? 'normal' : 'hidden');
        }
    }





    function toggleGroupDisplay() {
        var repDef = _GetReportDef(nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.REPORT));
        var displayField = repDef.IsGroupSub;

        if (IS_MULTIBOOK && !isPrimaryBookSelected()) {
            displayField = false;
            nlapiSetFieldValue(TAF.CONSTANTS.FIELDS.INCLUDE_CHILD_SUBS, false);
        }
        setFieldDisplay(TAF.CONSTANTS.FIELDS.INCLUDE_CHILD_SUBS, displayField);
    }





    function toggleAccountingBookDisplay() {
        if (IS_MULTIBOOK) {
            var repDef = _GetReportDef(nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.REPORT));
            var accountingBooksCount = parseInt(nlapiGetFieldValue('accountingbookscount')) || 0;
            setFieldDisplay(TAF.CONSTANTS.FIELDS.ACCOUNTING_BOOK, repDef.IsMultiBook && (accountingBooksCount > 1));

            if (!repDef.IsMultiBook || accountingBooksCount <= 1) {
                nlapiSetFieldValue(TAF.CONSTANTS.FIELDS.ACCOUNTING_BOOK, nlapiGetFieldValue('primaryaccountingbookid'));
            }
        }
    }


    function toggleEngineOption() {
        var repDef = _GetReportDef(nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.REPORT));
        var displayField = repDef.IsAllowedNewEngine;
        setFieldDisplay(TAF.CONSTANTS.FIELDS.ENGINE_OPTION, false);
        nlapiSetFieldValue(TAF.CONSTANTS.FIELDS.ENGINE_OPTION, displayField);
    }



    function togglePostingDateDisplay() {
        var repDef = _GetReportDef(nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.REPORT));
        var displayField = repDef.IsPostingDate;

        if (!displayField) {
            nlapiSetFieldValue(TAF.CONSTANTS.FIELDS.POSTING_DATE, false);
        }
        setFieldDisplay(TAF.CONSTANTS.FIELDS.POSTING_DATE, displayField);
    }



    function getPeriodDates(periodType)
    {
        var cache_field_id = {
            'accountingperiod': 'custpage_accounting_period_cache',
            'taxperiod': 'custpage_tax_period_cache'
        };

        if (getPeriodDates.PeriodCache === undefined)
        {
            getPeriodDates.PeriodCache = { accountingperiod: false, taxperiod: false };
        }

        if (!getPeriodDates.PeriodCache[periodType])
        {
            getPeriodDates.PeriodCache[periodType] = true;

            var period_object = JSON.parse(nlapiGetFieldValue(cache_field_id[periodType]));

            if (period_object && period_object.length > 0)
            {
                for (var i = 0; i < period_object.length; ++i)
                {
                    getPeriodDates.PeriodCache[period_object[i].id] = {
                        start: period_object[i].start_date,
                        end: period_object[i].end_date
                    };
                }
            }
        }

        return getPeriodDates.PeriodCache;
    }





    function isMultiBookSupportedByReport() {
        var report = _GetReportDef(nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.REPORT));
        return report.IsMultiBook;
    }





    function isPrimaryBookSelected() {
        var selectedAccountingBookId = nlapiGetFieldValue(TAF.CONSTANTS.FIELDS.ACCOUNTING_BOOK);
        var primaryAccountingBookId = nlapiGetFieldValue('primaryaccountingbookid');
        return selectedAccountingBookId == primaryAccountingBookId;
    }





    function _GetReportDefs() {
        if (_GetReportDefs.Cache === undefined) {
            _GetReportDefs.Cache = {};

            var s = nlapiGetFieldValue("custpage_taf_reportdefs");
            if (s == null) {
                return _GetReportDefs.Cache;
            }

            var raw = eval("(" + s + ")");
            var periodType = {
                0: 'taxperiod',
                1: 'accountingperiod',
                2: 'date'
            };

            for (var x in raw) {
                _GetReportDefs.Cache[x] = {
                    // PeriodType: raw[x][0] == 0 ? "taxperiod" : "accountingperiod",
                    PeriodType: periodType[raw[x][0]],
                    IsPeriodRange: raw[x][1],
                    IsGroupSub: raw[x][2],
                    IsMultiBook: raw[x][3],
                    IsAllowedNewEngine: raw[x][4],
                    IsPostingDate: raw[x][5]
                };
            }
        }

        return _GetReportDefs.Cache;
    }





    function _GetReportDef(repId)
    {
        var repDefs = _GetReportDefs();

        return repDefs[repId];
    }
}
