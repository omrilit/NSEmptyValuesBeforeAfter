/**
 * � 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

FAM.AssetType_Record = function () {
    var _crtName = 'customrecord_ncfar_assettype';
    var _fields = {
        internalid          : 'internalid',
        isinactive          : 'isinactive',
        asset_account       : 'custrecord_assettypeassetacc',
        last_checked        : 'custrecord_assettypelastchecked',
        depr_method         : 'custrecord_assettypeaccmethod',
        rv_percent          : 'custrecord_assettyperesidperc',
        lifetime            : 'custrecord_assettypelifetime',
        depr_active         : 'custrecord_assettypedepractive',
        include_report      : 'custrecord_assettypeinclreports',
        revision_rules      : 'custrecord_assettyperevisionrules',
        depr_rules          : 'custrecord_assettypedeprrules',
        depr_period         : 'custrecord_assettypedeprperiod',
        custodian           : 'custrecord_assettypecaretaker',
        supplier            : 'custrecord_assettypesupplier',
        disposal_item       : 'custrecord_assettypedisposalitem',
        depr_account        : 'custrecord_assettypedepracc',
        depr_charge_account : 'custrecord_assettypedeprchargeacc',
        writeoff_account    : 'custrecord_assettypewriteoffacc',
        writedown_account   : 'custrecord_assettypewritedownacc',
        disposal_account    : 'custrecord_assettypedisposalacc',
        inspection          : 'custrecord_assettypeinspection',
        inspection_period   : 'custrecord_assettypeinspectionperiod',
        warranty            : 'custrecord_assettypewarranty',
        warranty_period     : 'custrecord_assettypewarrantyperiod',
        financial_year_start: 'custrecord_assettypefinancialyear'
    };

    FAM.Record.apply(this, [_crtName, _fields]);
};

FAM.AssetTypeLifetime = function () {
    var _crtName = 'customrecord_assetlifetimes';
    var _fields = {
        internalid  : 'internalid',
        asset_type  : 'custrecord_ncfar_lifetimeassettype',
        location    : 'custrecord_ncfar_lifetimelocation',
        depr_method : 'custrecord_lifetimedeprmethod',
        lifetime    : 'custrecord_ncfar_lifetimelifetime'
    };

    FAM.Record.apply(this, [_crtName, _fields]);
};

FAM.DeprMethod_Record = function () {

    var crtName = 'customrecord_ncfar_deprmethod',
        // finalConventionList = FAM.getCustomList('customlist_fam_list_final_convention'),
        // deprPeriodList = FAM.getCustomList('customlist_ncfar_deprperiod'),
        finalConventionList = {
            'Fully Depreciate' : 1,
            'Retain Balance' : 2
        },
        deprPeriodList = {
            'Monthly' : 1,
            'Annually' : 2,
            'Fiscal Period' : 3,
            'Fiscal Year' : 4
        },
        fields = {
            internalid         : 'internalid',
            description        : 'custrecord_deprmethoddescription',
            depr_period        : 'custrecord_deprmethoddeprperiod',
            end_period         : 'custrecord_deprmethodendperiod',
            next_method        : 'custrecord_deprmethodnextmethod',
            formula            : 'custrecord_deprmethodformula',
            inline_help        : 'custrecord_deprmethodinlinehelp',
            html_formula       : 'custrecord_deprmethodhtmlformula',
            accrual_convention : 'custrecord_deprmethod_accrual_convention',
            final_convention   : 'custrecord_deprmethod_final_convention'
        };

    FAM.Record.apply(this, [crtName, fields]);
    //to be deprecated - convert to use FAM.Lists
    this.getFinalConventionId = function(name) {
        return finalConventionList[name] || null;
    };
    //to be deprecated - use FAM.Lists
    this.getDeprPeriodId = function(name) {
        return deprPeriodList[name] || null;
    };
};

FAM.AltDeprMethod_Record = function () {

    var _crtName = 'customrecord_ncfar_altdepreciation',
        statusList = {
            'New' : 1,
            'Depreciating' : 2,
            'Fully Depreciated' : 3,
            'Disposed' : 4
        },
        deprPeriodList = {
                'Monthly' : 1,
                'Annually' : 2,
                'Fiscal Period' : 3,
                'Fiscal Year' : 4
        },
        annualMethodList = {
            'Anniversary' : 1,
            'Fiscal Year' : 2
        },
        periodConvention = {
            '12Months'  : 1,
            '365Days'   : 2,
            'LeapYear'  : 3 //This option is not yet in use
        };

    var _fields = {
        internalid           : 'internalid',
        isinactive           : 'isinactive',
        is_group_master      : 'custrecord_altdepr_groupmaster',
        is_group_depr        : 'custrecord_altdepr_groupdepreciation',
        subsidiary           : 'custrecord_altdepr_subsidiary',
        alternate_method     : 'custrecord_altdepraltmethod',
        current_cost         : 'custrecord_altdepr_currentcost',
        original_cost        : 'custrecord_altdepr_originalcost',
        residual_value       : 'custrecord_altdeprrv',
        book_value           : 'custrecord_altdeprnbv',
        prior_year_nbv       : 'custrecord_altdeprpriornbv',
        last_depr_amount     : 'custrecord_altdeprld',
        cumulative_depr      : 'custrecord_altdeprcd',
        asset_life           : 'custrecord_altdeprlifetime',
        parent_asset         : 'custrecord_altdeprasset',
        depr_method          : 'custrecord_altdeprmethod',
        convention           : 'custrecord_altdeprconvention',
        forecast_amount      : 'custrecord_altdeprfc',
        financial_year_start : 'custrecord_altdeprfinancialyear',
        period_convention    : 'custrecord_altdeprperiodconvention',
        override_flag        : 'custrecord_altdeproverride',
        allow_override       : 'custrecord_altdepr_allowoverride',
        annual_entry         : 'custrecord_altdeprannualentry',
        depr_period          : 'custrecord_altdepr_depreciationperiod',
        depr_start_date      : 'custrecord_altdeprstartdeprdate',
        last_depr_date       : 'custrecord_altdeprlastdeprdate',
        last_depr_period     : 'custrecord_altdeprcurrentage',
        status               : 'custrecord_altdeprstatus',
        enddate              : 'custrecord_altdepr_deprenddate',
        revision_rules       : 'custrecord_altdepr_revisionrules',
        depr_rules           : 'custrecord_altdepr_deprrules',
        depr_active          : 'custrecord_altdepr_depractive',
        rv_percentage        : 'custrecord_altdeprrv_perc',
        booking_id           : 'custrecord_altdepr_accountingbook',
        asset_account        : 'custrecord_altdepr_assetaccount',
        depr_account         : 'custrecord_altdepr_depraccount',
        charge_account       : 'custrecord_altdepr_chargeaccount',
        write_off_account    : 'custrecord_altdepr_writeoffaccount',
        write_down_account   : 'custrecord_altdepr_writedownaccount',
        disposal_account     : 'custrecord_altdepr_disposalaccount',
        fixed_rate           : 'custrecord_altdepr_fixedrate',
        currency             : 'custrecord_altdepr_currency',
        asset_type           : 'custrecord_altdepr_assettype',
        taxValues            : 'custrecord_altdepr_assetvals',
        createdFrom          : 'custrecord_altdepr_createdfrom',
        isPosting            : 'custrecord_altdepr_isposting'
    };
    
    //to be deprecated - use FAM.Lists instead
    this.getStatusId = function(name) {
        return statusList[name] || null;
    };
    //to be deprecated - use FAM.Lists instead
    this.getDeprPeriodId = function(name) {
        return deprPeriodList[name] || null;
    };
    //to be deprecated - use FAM.Lists instead
    this.getAnnualMethodId = function (name) {
        return annualMethodList[name] || null;
    };
    //to be deprecated - use FAM.Lists instead
    this.getPeriodConvention = function (name) {
        return periodConvention[name] || null;
    };

    FAM.Record.apply(this, [_crtName, _fields]);
};

FAM.AlternateMethod_Record = function (){

    var _crtName = 'customrecord_ncfar_altmethods',
        convention = {
            'None'      : 1,
            'Half-Year' : 2,
            'Mid-Quarter': 3,
            'Mid-Month' : 4
        };

    var _fields = {
        description          : 'custrecord_altmethoddescription',
        depreciation_method  : 'custrecord_altmethoddepmethod',
        convention           : 'custrecord_altmethodconvention',
        asset_life           : 'custrecord_altmethodlifetime',
        financial_year_start : 'custrecord_altmethodfinancialyear',
        subsidiary           : 'custrecord_altmethodsubsidiary',
        pool_flag            : 'custrecord_altmethodpool',
        override_flag        : 'custrecord_altmethodoverride',
        period_convention    : 'custrecord_altmethod_periodconvention'
    };
    //to be deprecated - use FAM.Lists instead
    this.getConvention = function(name) {
        return convention[name] || null;
    };

    FAM.Record.apply(this, [_crtName, _fields]);
};

FAM.Asset_Record = function () {

    var crtName = 'customrecord_ncfar_asset',
        // statusList = FAM.getCustomList('customlist_ncfar_assetstatus'),
        statusList = {
            'Depreciating' : 2,
            'Fully Depreciated' : 3,
            'Disposed' : 4,
            'Disposed (Write Off)' : 5,
            'New' : 6,
            'Spiltting' : 7,
            'Partially Disposed' : 8
        },
        deprActiveList = {
            'True' : 1,
            'False' : 2,
            'On Project Completion': 3
        },
        disposalTypeList = {
            'Sale' : 1,
            'Write-off' : 2,
            'Intercompany Transfer' : 3
        },
        deprRuleList = {
                'Acquisition' : 1,
                'Disposal' : 2,
                'Pro-Rata' : 3,
                'Mid-Month' : 4
        },
        fields = {
            internalid          : 'internalid',
            name                : 'name',
            isinactive          : 'isinactive',
            altname             : 'altname',
            current_cost        : 'custrecord_assetcurrentcost',
            book_value          : 'custrecord_assetbookvalue',
            is_acquisition      : 'custrecord_assetacqstatus', // deprecated
            proposal_id         : 'custrecord_asset_propid',
            store_depr_hist     : 'custrecord_storedeprhist',
            subsidiary          : 'custrecord_assetsubsidiary',
            currency            : 'custrecord_assetcurrency',
            department          : 'custrecord_assetdepartment',
            location            : 'custrecord_assetlocation',
            classfld            : 'custrecord_assetclass',
            transaction         : 'custrecord_assetsourcetrn',
            description         : 'custrecord_assetdescr',
            serialno            : 'custrecord_assetserialno',
            alternateno         : 'custrecord_assetalternateno',
            parent_id           : 'custrecord_assetparent',
            depr_method         : 'custrecord_assetaccmethod',
            initial_cost        : 'custrecord_assetcost',
            rv                  : 'custrecord_assetresidualvalue',
            rv_percent          : 'custrecord_assetresidualperc',
            lifetime            : 'custrecord_assetlifetime',
            asset_type          : 'custrecord_assettype',
            asset_account       : 'custrecord_assetmainacc',
            status              : 'custrecord_assetstatus',
            depr_active         : 'custrecord_assetdepractive',
            include_report      : 'custrecord_assetinclreports',
            revision_rules      : 'custrecord_assetrevisionrules',
            depr_rules          : 'custrecord_assetdeprrules',
            depr_period         : 'custrecord_assetdeprperiod',
            custodian           : 'custrecord_assetcaretaker',
            supplier            : 'custrecord_assetsupplier',
            disposal_item       : 'custrecord_assetdisposalitem',
            depr_account        : 'custrecord_assetdepracc',
            depr_charge_account : 'custrecord_assetdeprchargeacc',
            writeoff_account    : 'custrecord_assetwriteoffacc',
            writedown_account   : 'custrecord_assetwritedownacc',
            disposal_account    : 'custrecord_assetdisposalacc',
            inspection          : 'custrecord_assetmaintneedsinsp',
            inspection_period   : 'custrecord_assetmaintinspinterval',
            warranty            : 'custrecord_assetmaintwarranty',
            warranty_period     : 'custrecord_assetmaintwarrantyperiod',
            quantity            : 'custrecord_ncfar_quantity',
            quantity_disposed   : 'custrecord_ncfar_quantitydisposed',
            purchase_date       : 'custrecord_assetpurchasedate',
            depr_start_date     : 'custrecord_assetdeprstartdate',
            depr_end_date       : 'custrecord_assetdeprenddate',
            fixed_rate          : 'custrecord_assetfixedexrate',
            purchase_order_id   : 'custrecord_assetpurchaseorder',
            last_depr_date      : 'custrecord_assetlastdeprdate',
            repair_main_cat     : 'custrecord_assetrepairmaintcategory',
            repair_main_sub_a   : 'custrecord_assetrepairmaintsubcategory',
            last_depr_period    : 'custrecord_assetcurrentage',
            cummulative_depr    : 'custrecord_assetdeprtodate',
            lifetime_usage      : 'custrecord_assetlifeunits',
            disposal_date       : 'custrecord_assetdisposaldate',
            disposal_type       : 'custrecord_assetdisposaltype',
            customer            : 'custrecord_assetsalecustomer',
            sales_amount        : 'custrecord_assetsaleamount',
            sales_invoice       : 'custrecord_assetsalesinvoice',
            isleased            : 'custrecord_assetisleased',
            prior_nbv           : 'custrecord_assetpriornbv',
            annual_entry        : 'custrecord_assetannualentry',
            fyscal_year_start   : 'custrecord_assetfinancialyear',
            lastDeprAmount      : 'custrecord_assetlastdepramt',
            createdFrom         : 'custrecord_assetcreatedfrom',
            component_of        : 'custrecord_componentof',
            is_compound         : 'custrecord_is_compound',
            project             : 'custrecord_assetproject',
            assetValues         : 'custrecord_assetvals'
        };

    FAM.Record.apply(this, [crtName, fields]);
    //to be deprecated - use FAM.Lists instead
    this.getStatusId = function(name) {
        return statusList[name] || null;
    };
    //to be deprecated - use FAM.Lists instead
    this.getDeprActiveId = function(name) {
        return deprActiveList[name] || null;
    };
    //to be deprecated - use FAM.Lists instead
    this.getDisposalTypeId = function(name) {
        return disposalTypeList[name] || null;
    };
    //to be deprecated - use FAM.Lists instead
    this.getDepreciationRule = function(name) {
        return deprRuleList[name] || null;
    };
};

FAM.AssetProposal_Record = function () {

    var crtName = 'customrecord_ncfar_assetproposal',
        // statusList = FAM.getCustomList('customlist_ncfar_proposalstatus'),
        statusList = {
            'New' : 1,
            'Pending' : 2,
            'Created' : 3,
            'Rejected' : 4,
            'Combined' : 5
        },
        fields = {
            internalid          : 'internalid',
            isinactive          : 'isinactive',
            subsidiary          : 'custrecord_propsubsidiary',
            department          : 'custrecord_propdepartment',
            location            : 'custrecord_proplocation',
            classfld            : 'custrecord_propclass',
            transaction         : 'custrecord_propsourceid',
            line                : 'custrecord_propsourceline',
            description         : 'custrecord_propassetdescr',
            parent_id           : 'custrecord_propparent',
            depr_method         : 'custrecord_propaccmethod',
            initial_cost        : 'custrecord_propassetcost',
            rv                  : 'custrecord_propresidvalue',
            rv_percent          : 'custrecord_propresidperc',
            lifetime            : 'custrecord_propassetlifetime',
            asset_type          : 'custrecord_propassettype',
            asset_id            : 'custrecord_propasset',
            asset_account       : 'custrecord_propmainacc',
            status              : 'custrecord_propstatus',
            depr_active         : 'custrecord_propdepractive',
            include_report      : 'custrecord_propinclreports',
            revision_rules      : 'custrecord_proprevisionrules',
            depr_rules          : 'custrecord_propdeprrules',
            depr_period         : 'custrecord_propdeprperiod',
            custodian           : 'custrecord_propcaretaker',
            supplier            : 'custrecord_propsupplier',
            disposal_item       : 'custrecord_propdisposalitem',
            depr_account        : 'custrecord_propdepracc',
            depr_charge_account : 'custrecord_propdeprchargeacc',
            writeoff_account    : 'custrecord_propwriteoffacc',
            writedown_account   : 'custrecord_propwritedownacc',
            disposal_account    : 'custrecord_propwritedownacc',
            inspection          : 'custrecord_propinspection',
            inspection_period   : 'custrecord_propinspectionperiod',
            warranty            : 'custrecord_propwarranty',
            warranty_period     : 'custrecord_propwarrantyperiod',
            quantity            : 'custrecord_propquantity',
            purchase_date       : 'custrecord_proppurchasedate',
            depr_start_date     : 'custrecord_propdeprstartdate',
            currency_id         : 'custrecord_propcurrencyid',
            currency_name       : 'custrecord_propcurrencyname',
            fixed_rate          : 'custrecord_propfixedexrate',
            purchase_order_id   : 'custrecord_proppurchaseorder',
            financial_year_start: 'custrecord_propfinancialyear',
            createdFrom         : 'custrecord_propcreatedfrom'
        };

    FAM.Record.apply(this, [crtName, fields]);
    //to be deprecated - use FAM.Lists instead
    this.getStatusId = function(name) {
        return statusList[name] || null;
    };
};

FAM.DepreciationHistory_Record = function () {
    var crtName = 'customrecord_ncfar_deprhistory',
        fields = {
            asset : 'custrecord_deprhistasset',
            subsidiary : 'custrecord_deprhistsubsidiary',
            asset_type : 'custrecord_deprhistassettype',
            transaction_type : 'custrecord_deprhisttype',
            date : 'custrecord_deprhistdate',
            depreciation_method : 'custrecord_deprhistmethod',
            period : 'custrecord_deprhistperiod',
            transaction_amount : 'custrecord_deprhistamount',
            net_book_value : 'custrecord_deprhistbookvalue',
            posting_reference : 'custrecord_deprhistjournal',
            quantity : 'custrecord_deprhistquantity',
            schedule : 'custrecord_deprhistory_schedule',
            scheduled_amount : 'custrecord_deprhistory_scheduled_amount',
            scheduled_nbv : 'custrecord_deprhistory_scheduled_nbv',
            alternate_depreciation : 'custrecord_deprhistaltdepr',
            alternate_method : 'custrecord_deprhistaltmethod',
            actual_depreciation_method : 'custrecord_deprhistdeprmethod',
            writeToJournal : 'custrecord_deprhistory_write_journal',
            summaryJournal : 'custrecord_deprhistory_summjournal',
            summaryRecord : 'custrecord_deprhistory_summary_link',
            bookId : 'custrecord_deprhistaccountingbook',
            parentSlave : 'custrecord_deprhistassetslave'
        };
    //to be deprecated - use FAM.Lists instead
    this.getTrnTypeId = function(name) {
        return FAM.TransactionType[name] || null;
    };

    FAM.Record.apply(this, [crtName, fields]);
};

FAM.LastProposalDate = function() {
    var _crtName = 'customrecord_ncfar_proposaldates',
        _fields = {
            internalid   : 'internalid',
            asset_type   : 'custrecord_propdatesassettype',
            subsidiary   : 'custrecord_propdatessubsidiary',
            last_checked : 'custrecord_propdateslast'
        };

    FAM.Record.apply(this, [_crtName, _fields]);

    this.allRecordIds = null;
    this.allRecords   = null;
};

FAM.AssetUsage_Record = function() {
    var _crtName = 'customrecord_ncfar_assetusage';
    var _fields = {
            asset       : 'custrecord_usageassetid',
            date        : 'custrecord_usagedate',
            period      : 'custrecord_usageperiod',
            units_used  : 'custrecord_usageunits',
            comments    : 'custrecord_usagecomments'
    };
    FAM.Record.apply(this, [_crtName, _fields]);
};

FAM.AccountingPeriod = function() {
    var crtName = 'accountingperiod',
        fields = {
            period_name : 'periodname',
            start_date  : 'startDate',
            end_date    : 'endDate',
            all_closed  : 'closed',
            is_adjust   : 'isAdjust',
            is_quarter  : 'isQuarter',
            is_year     : 'isYear',
            ap_locked   : 'aplocked',
            ar_locked   : 'arlocked',
            all_locked  : 'alllocked'
        };

    FAM.Record.apply(this, [crtName, fields]);
};

FAM.BGProcessLog = function () {
    var crtName = 'customrecord_bg_proclog',
        // typeList = FAM.getCustomList('customlist_bg_processlogmsgtype'),
        typeList = {
            'Error' : 1,
            'Warning' : 2,
            'Message' : 3
        },
        fields = {
            process_instance : 'custrecord_far_prolog_procinstance',
            message_type     : 'custrecord_far_prolog_type',
            log_message      : 'custrecord_far_prolog_msg',
            related_record   : 'custrecord_far_prolog_recordname'
        };

    FAM.Record.apply(this, [crtName, fields]);
    //to be deprecated - use FAM.Lists instead
    this.getMessageTypeId = function(name) {
        return typeList[name] || null;
    };
};

FAM.Queue = function () {
    var crtName = 'customrecord_bg_queueinstance',
        fields = {
            procInstance  : 'custrecord_fam_queue_processinstance',
            deployment    : 'custrecord_fam_queue_deployment',
            recsProcessed : 'custrecord_fam_queue_recsprocessed',
            recsFailed    : 'custrecord_fam_queue_recsfailed',
            state         : 'custrecord_fam_queue_state'
        };

    FAM.Record.apply(this, [crtName, fields]);

    this.stateValues = null;
};

FAM.SummaryRecord = function () {
    var crtName = 'customrecord_bg_summaryrecord',
        fields  = {
            assetType         : 'custrecord_summary_assettype',
            summaryValue      : 'custrecord_summary_value',
            posting_reference : 'custrecord_summary_histjournal',
            status            : 'custrecord_summary_status',
            groupInfo         : 'custrecord_summary_groupinfo',
            deprDate          : 'custrecord_summary_deprdate',
            deprAcc           : 'custrecord_summary_depracc',
            chargeAcc         : 'custrecord_summary_chargeacc',
            subsidiary        : 'custrecord_summary_subsidiary',
            department        : 'custrecord_summary_department',
            classid           : 'custrecord_summary_class',
            location          : 'custrecord_summary_location',
            currid            : 'custrecord_summary_currency',
            fixedrate         : 'custrecord_summary_fixedrate',
            histcount         : 'custrecord_summary_histcount',
            journalMemo       : 'custrecord_summary_journalmemo',
            acctBook          : 'custrecord_summary_accountingbook',
            project           : 'custrecord_summary_project'
        };

    this.parseStateValues = function () {
        var i, names, values;

        if (!this.record) {
            this.loadRecord();
        }
        this.stateValues = {};

        names  = this.getFieldValue('jlinesDef') || '';
        values = this.getFieldValue('jlinesHash') || '';

        names  = names && names.split(',');
        values = values && values.split(',');

        if (names) {
            for (i = 0; i < names.length; i++) {
                this.stateValues[names[i]] = (typeof values[i] == 'undefined') ? null : values[i];
            }
        }
    };

    FAM.Record.apply(this, [crtName, fields]);
};

FAM.TransferAccount = function () {
    var crtName = 'customrecord_ncfar_transferaccounts',
    fields = {
        origin_subsidiary       : 'custrecord_xferoriginsub',
        destination_subsidiary  : 'custrecord_xferdestsub',
        origin_account          : 'custrecord_xferoriginacc',
        destination_account     : 'custrecord_xferdestacc'
    };

    FAM.Record.apply(this, [crtName, fields]);
};

FAM.DefaultValuesBook_Record = function () {
    var recName = 'customrecord_ncfar_altdeprdef',
        fields = {
            assetType : 'custrecord_altdeprdef_assettype',
            bookId : 'custrecord_altdeprdef_accountingbook',
            altMethod : 'custrecord_altdeprdef_altmethod',
            deprMethod : 'custrecord_altdeprdef_deprmethod',
            lifetime : 'custrecord_altdeprdef_lifetime',
            override : 'custrecord_altdeprdef_override',
            rvPercent : 'custrecord_altdeprdef_rv_perc',
            convention : 'custrecord_altdeprdef_convention',
            periodCon : 'custrecord_altdeprdef_periodconvention',
            fiscalYear : 'custrecord_altdeprdef_financialyear',
            deprPeriod : 'custrecord_altdeprdef_depreciationperiod',
            subsidiary : 'custrecord_altdeprdef_subsidiary',
            assetAcc : 'custrecord_altdeprdef_assetaccount',
            deprAcc : 'custrecord_altdeprdef_depraccount',
            chargeAcc : 'custrecord_altdeprdef_chargeaccount',
            writeOffAcc : 'custrecord_altdeprdef_writeoffaccount',
            writeDownAcc : 'custrecord_altdeprdef_writedownaccount',
            dispAcc : 'custrecord_altdeprdef_disposalaccount',
            isPosting : 'custrecord_altdeprdef_isposting'
        };

    FAM.Record.apply(this, [recName, fields]);
};

FAM.ProposalValuesBook_Record = function () {
    var recName = 'customrecord_ncfar_altdepr_proposal',
        fields = {
            proposal : 'custrecord_propaltdepr_propid',
            deprAcc : 'custrecord_propaltdepr_depraccount',
            assetAcc : 'custrecord_propaltdepr_assetaccount',
            chargeAcc : 'custrecord_propaltdepr_chargeaccount',
            writeOffAcc : 'custrecord_propaltdepr_writeoffaccount',
            writeDownAcc : 'custrecord_propaltdepr_writedownaccount',
            dispAcc : 'custrecord_propaltdepr_disposalaccount',
            bookId : 'custrecord_propaltdepr_accountingbook',
            altMethod : 'custrecord_propaltdepr_altmethod',
            deprMethod : 'custrecord_propaltdepr_deprmethod',
            convention : 'custrecord_propaltdepr_convention',
            lifetime : 'custrecord_propaltdepr_lifetime',
            fiscalYear : 'custrecord_propaltdepr_financialyear',
            periodCon : 'custrecord_propaltdepr_periodconvention',
            deprPeriod : 'custrecord_propaltdepr_deprperiod',
            override : 'custrecord_propaltdepr_override',
            subsidiary : 'custrecord_propaltdepr_subsidiary',
            rvPercent : 'custrecord_propaltdepr_residperc',
            isPosting : 'custrecord_propaltdepr_isposting'
        };

    FAM.Record.apply(this, [recName, fields]);
};

FAM.AssetSummaryReport_Record = function () {
    var recName = 'customrecord_fam_assetsummaryrep';
    
    var fields = {
        startDate   :   "custrecord_assetsummaryrep_startdate",
        endDate     :   "custrecord_assetsummaryrep_enddate",
        assetsSel   :   "custrecord_assetsummaryrep_selected"
    };

    FAM.Record.apply(this, [recName, fields]);
};

FAM.AssetSummaryReportLine_Record = function () {
    var recName = 'customrecord_fam_assetsummaryrepline';
    
    var fields = {
        subsidiary          :   "custrecord_assetsummary_sub",
        currencyIso         :   "custrecord_assetsummary_currency",
        acctgBook           :   "custrecord_assetsummary_acctgbook",
        altDepr             :   "custrecord_assetsummary_altdep",       
        begBal              :   "custrecord_assetsummary_beginbal",
        additions           :   "custrecord_assetsummary_additions",
        sale                :   "custrecord_assetsummary_sale",
        disposals           :   "custrecord_assetsummary_disposals",
        transfers           :   "custrecord_assetsummary_transfers",
        endBal              :   "custrecord_assetsummary_endbal",
        lineType            :   "custrecord_assetsummary_linetype",
        repParent           :   "custrecord_assetsummary_repparent",
        repParentZeroVal    :   "custrecord_assetsummary_repparent_zerovl"
    };

    FAM.Record.apply(this, [recName, fields]);
};

FAM.DeprSchedReport_Record = function () {
    FAM.Record.apply(this, ['customrecord_fam_deprschedreport', {
        startDate : 'custrecord_fam_deprschedreport_startdate',
        endDate : 'custrecord_fam_deprschedreport_enddate',
        assetInc : 'custrecord_fam_deprschedreport_assetsinc',
        deprMet : 'custrecord_fam_deprschedreport_altmet',
        repType : 'custrecord_fam_deprschedreport_reptype'
    }]);
};

FAM.DeprSchedReportLine_Record = function () {
    FAM.Record.apply(this, ['customrecord_fam_deprschedreportline', {
        repParent : 'custrecord_fam_schedrepline_parent',
        subsidiary : 'custrecord_fam_schedrepline_subsidiary',
        book : 'custrecord_fam_schedrepline_book',
        year : 'custrecord_fam_schedrepline_year',
        assetType : 'custrecord_fam_schedrepline_type',
        assetId : 'custrecord_fam_schedrepline_assetid',
        depMet : 'custrecord_fam_schedrepline_method',
        currency : 'custrecord_fam_schedrepline_currency',
        assetName : 'custrecord_fam_schedrepline_assetname',
        assetLife : 'custrecord_fam_schedrepline_assetlife',
        period1: 'custrecord_fam_schedrepline_p1',
        period2: 'custrecord_fam_schedrepline_p2',
        period3: 'custrecord_fam_schedrepline_p3',
        period4: 'custrecord_fam_schedrepline_p4',
        period5: 'custrecord_fam_schedrepline_p5',
        period6: 'custrecord_fam_schedrepline_p6',
        period7: 'custrecord_fam_schedrepline_p7',
        period8: 'custrecord_fam_schedrepline_p8',
        period9: 'custrecord_fam_schedrepline_p9',
        period10: 'custrecord_fam_schedrepline_p10',
        period11: 'custrecord_fam_schedrepline_p11',
        period12: 'custrecord_fam_schedrepline_p12'
    }]);
};

FAM.AssetRegisterReport_Record = function () {
    var recName = 'customrecord_fam_assetregisterrep';
    
    var fields = {
        startDate   :   "custrecord_assetregisterrep_startdate",
        endDate     :   "custrecord_assetregisterrep_enddate",
        assetsSel   :   "custrecord_assetregisterrep_selected"
    };

    FAM.Record.apply(this, [recName, fields]);
};

FAM.AssetRegisterReportLine_Record = function () {
    var recName = 'customrecord_fam_assetregisterrepline';
    
    var fields = {
        subsidiary          :   "custrecord_assetregister_sub",
        currencyIso         :   "custrecord_assetregister_currency",
        acctgBook           :   "custrecord_assetregister_acctgbook",
        altDepr             :   "custrecord_assetregister_altdep",
        assetType           :   "custrecord_assetregister_assettype",
        assetId             :   "custrecord_assetregister_assetid",
        desc                :   "custrecord_assetregister_assetdesc",
        deprStartDate       :   "custrecord_assetregister_deprstartdate",
        assetLife           :   "custrecord_assetregister_assetlife",        
        begBal              :   "custrecord_assetregister_beginbal",
        sale                :   "custrecord_assetregister_sale",
        disposals           :   "custrecord_assetregister_disposals",
        depreciation        :   "custrecord_assetregister_depreciation",
        transfer            :   "custrecord_assetregister_transfer",
        revaluation         :   "custrecord_assetregister_revaluation",
        writedown           :   "custrecord_assetregister_writedown",
        netBookValue        :   "custrecord_assetregister_netbookvalue",
        lineType            :   "custrecord_assetregister_linetype",
        repParent           :   "custrecord_assetregister_repparent",
        repParentZeroVal    :   "custrecord_assetregister_repparent_zerov"
    };

    FAM.Record.apply(this, [recName, fields]);
};

FAM.AssetValues = function () {
    FAM.Record.apply(this, ['customrecord_fam_assetvalues', {
        parentAsset      : 'custrecord_slaveparentasset',
        parentTax        : 'custrecord_slaveparenttax',
        lastForecastDate : 'custrecord_slavelastforecastdate',
        forecastStatus   : 'custrecord_slaveforecaststatus',
        netBookValue     : 'custrecord_slavebookvalue',
        lastDeprAmount   : 'custrecord_slavelastdepramt',
        lastDeprDate     : 'custrecord_slavelastdeprdate',
        priorYearNBV     : 'custrecord_slavepriornbv',
        lastDeprPeriod   : 'custrecord_slavecurrentage'
    }]);
}
