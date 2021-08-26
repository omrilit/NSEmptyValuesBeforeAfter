/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function CN_GL_Report(state, params, output, job) {
	var _NCONTEXT = SFC.Context.GetContext();
	var _COMPANY_INFO = SFC.Context.GetCompanyInfo();
	var _IS_ONEWORLD = SFC.Context.GetContext().getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
	var _IS_MULTICURRENCY = _NCONTEXT.getFeature('MULTICURRENCY');
	var _HAS_CLASSES = _NCONTEXT.getFeature('CLASSES');
	var _HAS_DEPARTMENTS = _NCONTEXT.getFeature('DEPARTMENTS');
    var _HAS_LOCATIONS = _NCONTEXT.getFeature('LOCATIONS');
	
    var _Outline = {
        'Section': __AuditFile, 
        'SubSections': [
            {'Section': __SubTranIdCreation},
            {'Section': __GeneralLedger}
        ]
    };
    
	var _Job = job;
	var _Output = output;
	var _Params = params;
	var _State = state;
	var _Subsidiary = _IS_ONEWORLD ? SFC.Subsidiaries.Load(_Params.subsidiary) : null;
    var _Period = { 
    	Start: SFC.PostingPeriods.Load(_Params.periodFrom),
    	End: SFC.PostingPeriods.Load(_Params.periodTo)
    };
    this.GetOutline = function() { return _Outline; };
    
    
    function __AuditFile() {}
    __AuditFile.Name = "AuditFile";

    
    function __SubTranIdCreation() {
    	
    	this.On_Init = _OnInit;
    	this.On_Body = _OnBody;
    	this.On_CleanUp = _OnCleanUp;
    	
    	// for Unit Testing only
        this.___inspect = function(expr) { return eval("(" + expr + ")"); };
    	
        var _NodeName = __SubTranIdCreation.Name;
        var _SubsidiaryList = _IS_ONEWORLD ? _GetSubsidiaryList() : [];
        
        
        function _OnInit() {
        	
		    if(_State[_NodeName] == undefined) {
                _State[_NodeName] = {
                	CurrentSubIndex: null,
                	CurrentSubTranId: null
                };
            }
            
            _Output.SetPercent(10);
        }
        
        
        
        
        function _OnBody() {
        	_State[_NodeName].CurrentSubIndex = _State[_NodeName].CurrentSubIndex || 0;

        	do {
                if (!_State[_NodeName].CurrentSubTranId) {
                	_State[_NodeName].CurrentSubTranId = _GetMaxSubTranId(_SubsidiaryList[_State[_NodeName].CurrentSubIndex]) + 1;
                }
        		
        		var transactionsWithEmptySubTranId = _GetTransactionsWithEmptySubTranId(_SubsidiaryList[_State[_NodeName].CurrentSubIndex]);
        		
        		do {
        			
        			var sr = transactionsWithEmptySubTranId.getResults(0, 1000);
                    if (sr == null) {
                        return;
                    }
        			
                    for (var i = 0; i < sr.length; ++i) {
                        var tranInternalId = sr[i].getValue('internalid', null, 'GROUP');
                        _CreateSubTranId(tranInternalId, _State[_NodeName].CurrentSubTranId);
                        _State[_NodeName].CurrentSubTranId++;
                        if (_Job.IsThresholdReached()) {
                            return;
                        }
                    }
                    
                } while (sr.length >= 1000);
        		
        		_State[_NodeName].CurrentSubIndex++;
        		_State[_NodeName].CurrentSubTranId = null;
        		
        	} while (_State[_NodeName].CurrentSubIndex < _SubsidiaryList.length)
        	
            _Output.SetPercent(30);
		}
        
        
        function _OnCleanUp() {
            delete _State[_NodeName];
            _Output.SetPercent(100);
        }
        
        
        function _CreateSubTranId(tranInternalId, currentSubTranId) {
        	
        	var record = nlapiCreateRecord('customrecord_4599_tranchild');
            record.setFieldValue('custrecord_4599_tranchild_join', tranInternalId);
            record.setFieldValue('custrecord_4599_tranchild_subtranid', currentSubTranId);
            nlapiSubmitRecord(record);
        }
        
        
        function _GetMaxSubTranId(subsidiaryId) {
        	
        	var column = new nlobjSearchColumn('custrecord_4599_tranchild_subtranid', null, 'MAX');
        	var filter = _IS_ONEWORLD ? new nlobjSearchFilter('subsidiary', 'custrecord_4599_tranchild_join', 'is', subsidiaryId) : null;
        	var maxSubTranId = nlapiSearchRecord('customrecord_4599_tranchild', null, filter, column)[0].getValue(column);
        	
        	return parseInt(maxSubTranId, 10) || 0;
        }	
        
        
        function _GetSubsidiaryList() {
        	
        	var subsidiaryList = [];
    		subsidiaryList.push(_Params.subsidiary);

            if (_Params.include_child_subs) {
                var children = _Subsidiary.GetDescendants();
                
                for (var i = 0; i < children.length; i++) {
                    subsidiaryList.push(children[i].GetId());
                }
            }     		

        	
        	return subsidiaryList;
        }
        
        
        function _GetTransactionsWithEmptySubTranId(subsidiaryId) {
        	
        	var filters = [new nlobjSearchFilter('posting', null, 'is', 'T'),
        	               new nlobjSearchFilter('internalidnumber', 'account', 'isnotempty'),
        	               new nlobjSearchFilter('custrecord_4599_tranchild_subtranid', 'custrecord_4599_tranchild_join', 'isempty')];
        	
        	if (_IS_ONEWORLD) {
        		filters.push(new nlobjSearchFilter('subsidiary', null, 'is', subsidiaryId));
        	}
        	
        	var search = nlapiCreateSearch('transaction', filters, [new nlobjSearchColumn('internalid', null, 'GROUP')]);
            return search.runSearch();
        }
        
    }; __SubTranIdCreation.Name = 'SubTranIdCreation';
    
    
    function __GeneralLedger() {
    	
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        
        // for Unit Testing only
        this.___inspect = function(expr) { return eval("(" + expr + ")"); };
        
        var _ResultSet = null;
        var _NodeName = __GeneralLedger.Name;
        var _CustomFields = _GetCustomFields();
        var _CurrenciesByLocale = !_IS_MULTICURRENCY ? _GetCurrenciesByLocale() : {};
        var _CurrencyCodeMap = _IS_MULTICURRENCY ? _CreateCurrencyCodeMap() : {};
        
        
        function _OnInit() {
        	if(_State[_NodeName] == undefined) {
                _State[_NodeName] = {
                    Index: -1,
                    InternalId: null,
                };
            }
            
            _ResultSet = _GetSearch().runSearch();
            _Output.SetPercent(35);
        }
        
		
        function _OnHeader() {
            var headers = [
                'Company Code', 'Internal ID', 'SubTran ID', 'Document No.', 'Year', 'Line Item', 'Period', 'Posting Period',
                'Document Date', 'Local Currency Code', 'Local Amount (Debit)', 'Local Amount (Credit)',
                'Document Currency Code', 'Document Amount (Debit)', 'Document Amount (Credit)', 'GL Account Number',
                'GL Account Name', 'Entity Name', 'Tax Registration Number', 'Department', 'Class', 'Location', 'Journal Description',
                'Transaction Type', 'Creator'
            ];
            
            for (var id in _CustomFields) {
                headers.push(_CustomFields[id].label);
            }
            
            _Output.WriteLine(headers.join(','));
            _Output.SetPercent(40);
        }
        
        
        function _OnBody() {
            var globalIndex = null;
            
            do {
            	
                globalIndex = _State[_NodeName].Index + 1;
                var sr = _ResultSet.getResults(globalIndex, globalIndex + 1000);
                if (sr == null) {
                    return;
                }
                    
                for (var i = 0; i < sr.length; ++i) {
                    _ForEachEntry(sr[i]);
                    
                    _State[_NodeName].Index++;
                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                }
            } while (sr.length >= 1000);
            
            _Output.SetPercent(90);
        }
        
        
        function _OnCleanUp() {
            delete _State[_NodeName];
            _Output.SetPercent(100);
        }
        
        
        function _CreateCurrencyCodeMap() {
        	
        	var currencyCodeMap = {};
        	var currencySearchResult = nlapiSearchRecord('currency', null, null, [new nlobjSearchColumn('internalid').setSort(), new nlobjSearchColumn('name'), new nlobjSearchColumn('symbol')]);
        	
        	for (var i = 0; i < currencySearchResult.length; i++) {
        		currencyCodeMap[currencySearchResult[i].getValue('internalid')] = currencySearchResult[i].getValue('symbol');
        		currencyCodeMap[currencySearchResult[i].getValue('name')] = currencySearchResult[i].getValue('symbol');
        	}
        	
        	return currencyCodeMap;
        	
        }
        
        
        function _EscapeNewLine(transactionLineArray) {
        	
        	function escape(value) {
                if (value.toString().match(new RegExp('[' + ',' + '"\r\n]'))) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            }
        	
        	var csv = transactionLineArray.map(function (v) { return v || v === 0 ? escape(v) : ''; });
        	return csv;
        	
        }
        
        
        function _ForEachEntry(searchObj) {
            var amountType = parseFloat(searchObj.getValue('fxamount')) ? 'fxamount' : 'netamount';
            var localCurrencyCode = _GetSubBaseCurrency(searchObj);
            
            var line = [];
            line.push(_GetCompanyName(searchObj));
            line.push(searchObj.getId());
            line.push(searchObj.getValue('custrecord_4599_tranchild_subtranid', 'custrecord_4599_tranchild_join'));
            line.push(searchObj.getValue('tranid'));
            line.push(nlapiStringToDate(searchObj.getValue('trandate')).getFullYear());
            line.push(parseInt(searchObj.getValue('line'), 10) + 1);
            line.push(nlapiStringToDate(searchObj.getValue('trandate')).getMonth() + 1);
            line.push(searchObj.getText('postingperiod'));
            line.push(searchObj.getValue('trandate'));                                
            line.push(localCurrencyCode);
            line.push(parseFloat(searchObj.getValue('debitamount')) || 0);
            line.push(parseFloat(searchObj.getValue('creditamount')) || 0);                
            line.push(parseFloat(searchObj.getValue('fxamount')) ? _CurrencyCodeMap[searchObj.getValue('currency')] : localCurrencyCode);                         
            line.push(searchObj.getValue('debitamount') ? Math.abs(searchObj.getValue(amountType)) : 0);
            line.push(searchObj.getValue('creditamount') ? Math.abs(searchObj.getValue(amountType)) : 0);
            line.push(searchObj.getValue('number', 'account'));
            line.push(searchObj.getText('account'));
            line.push(searchObj.getText('entity'));
            line.push(searchObj.getValue('vatregnumber', 'customer') || searchObj.getValue('vatregnumber', 'vendor'));
            line.push(_HAS_DEPARTMENTS ? searchObj.getText('department') : '');
            line.push(_HAS_CLASSES ? searchObj.getText('class') : '');
            line.push(_HAS_LOCATIONS ? searchObj.getText('location') : '');
            line.push(_GetMemo(searchObj));
            line.push(searchObj.getValue('type'));
            line.push(searchObj.getText('createdby'));
            
            for (var key in _CustomFields) {
                if (_CustomFields[key].listId) {
                    line.push(_CustomFields[key].list[searchObj.getValue(key)]);
                } else {
                    line.push(searchObj.getValue(key));
                }
            }

            _Output.WriteLine(_EscapeNewLine(line).join(','));
        }
        
        
        function _GetCompanyName(row) {
            return _IS_ONEWORLD && row.getValue('subsidiary') != '1' ?
                row.getValue('namenohierarchy', 'subsidiary') :
                _COMPANY_INFO.getFieldValue('companyname');
        }
        
        
        function _GetCurrenciesByLocale() {
            return {
                sv_AX:"EUR",sq_AL:"ALL",ar_DZ:"DZD",pt_AO:"AON",en_AI:"XCD",en_AG:"XCD",es_AR:"ARS",
                en_AW:"AWG",pt_AW:"AWG",en_AU:"AUD",de_AT_EURO:"EUR",az_AZ:"AZN",en_BS:"BSD",
                ar_BH:"BHD",bn_BD:"BDT", en_BB:"BBD", be_BY:"BYR", fr_BE_EURO:" EUR", nl_BE_EURO:"EUR",
                fr_BJ:"XOF", en_BM:"BMD", dz_BT:"BTN", es_BO:"BOB", en_BW:"BWP", pt_BR:"BRL",
                ms_BN:"BND", bg_BG:"BGN", fr_BF:"XOF", km_KH:"KHR", fr_CM:"XAF", en_CA:"CAD",
                fr_CA:"CAD", es_IC:"EUR", pt_CV:"CVE", en_KY:"KYD", fr_CF:"XAF", es_EA:"EUR",
                fr_TD:"XAF", es_CL:"CLP", zh_CN:"CNY", es_CO:"COP", fr_KM:"KMF", en_CD:"CDF",
                fr_CD:"XAF", fr_CG:"XAF", es_CR:"CRC", fr_CI:"XOF", hr_HR:"HRk", en_CY:"CYP",
                en_CY_EURO:"EUR", cs_CZ:"CZK", da_DK:"DKK", en_DM:"XCD", es_DO:"DOP", es_EC:"USD",
                ar_EG:"EGP", es_SV:"SVC", es_GQ:"XAF", et_EE:"EST", en_FK:"FKP", fj_FJ:"FJD",
                fi_FI:"EUR", fi_FI_EURO:"EUR", fr_FR:"EUR", fr_FR_EURO:"EUR", fr_GA:"XAF", hy_AM:"AMD",
                ka_GE:"GEL", de_DE:"EUR", de_DE_EURO:"EUR", en_GH:"GHS", el_GR:"EUR", en_GD:"XCD",
                es_GT:"GTQ", pt_GW:"XOF", en_GY:"GYD", ht_HT:"HTG", es_HN:"HNL", zh_HK:"HKD",
                hu_HU:"HUF", is_IS:"ISK", en_IN:"INR", id_ID:"IDR", ar_IQ:"IQD", en_IE_EURO:"EUR",
                he_IL:"ILS", it_IT:"EUR", it_IT_EURO:"EUR", en_JM:"JMD", ja_JP:"JPY", ar_JO:"JOD",
                ru_KZ:"KZT", en_KE:"KES", ko_KR:"KRW", ar_KW:"KWD", en_KW:"KWD", ru_KG:"KGS",
                lv_LV:"LVL", ar_LB:"LBP", en_LR:"LRD", ar_LY:"LYD", lt_LT:"LTL", de_LU_EURO:"EUR",
                fr_LU_EURO:"EUR", zh_MO:"MOP", mk_MK:"MKD", en_MW:"MWK", ms_MY:"MYR", fr_ML:"XOF",
                en_MU:"MUR", es_MX:"MXN", mn_MN:"MNT", ar_MA:"MAD", pt_MZ:"MZN", ne_NP:"NPR",
                nl_NL:"EUR", nl_NL_EURO:"EUR", nl_AN:"ANG", en_NZ:"NZD", es_NI:"NIO", fr_NE:"XOF",
                en_NG:"NGN", no_NO:"NOK", ar_OM:"OMR", es_PA:"PAB", en_PG:"PGK", es_PY:"PYG",
                es_PE:"PEN", en_PH:"PHP", tl_PH:"PHP", pl_PL:"PLN", pt_PT:"EUR", pt_PT_EURO:"EUR",
                es_PR:"USD", ar_QA:"QAR", en_QA:"QAR", ro_RO:"RON", ru_RU:"RUB", fr_BL:"EUR",
                en_SH:"SHP", en_KN:"XCD", en_LC:"XCD", en_MF:"EUR", en_VC:"XCD", sm_WS:"WST",
                ar_SA:"SAR", fr_SN:"XOF", sr_RS:"RSD", sr_CS:"RSD", en_SL:"SLL", en_SG:"SGD",
                sk_SK:"EUR", sk_SK_EURO:"EUR", sl_SI:"EUR", sl_SI_EURO:"EUR", en_ZA:"ZAR",
                ca_ES_EURO:"EUR", es_ES:"EUR", es_ES_EURO:"EUR", si_LK:"LKR", ar_SD:"SDG",
                nl_SR:"SRD", sv_SE:"SEK", de_CH:"CHF", fr_CH:"CHF", it_CH:"CHF", ar_SY:"SYP",
                zh_TW:"TWD", tg_TJ:"TJS", en_TZ:"TZS", th_TH:"THB", fr_TG:"XOF", to_TO:"TOP",
                en_TT:"TTD", ar_TN:"TND", tr_TR:"TRY", tk_TM:"TMM", en_TC:"USD", en_UG:"UGX",
                uk_UA:"UAH", ar_AE:"AED", en_AE:"AED", en_GB:"GBP", en_US:"USD", es_UY:"UYU",
                uz_UZ:"UZS", es_VE:"VEF", vi_VN:"VND", ar_YE:"YER"
            };
        }
        
        
        function _GetCustomFields() {
            var customFields = {};
            
            var customFieldsList = nlapiSearchRecord('customrecord_4599_custom_field', null, null, [
                new nlobjSearchColumn('custrecord_4599_custom_field_id'),
                new nlobjSearchColumn('custrecord_4599_custom_field_label'),
                new nlobjSearchColumn('custrecord_4599_custom_list_id')
            ]);
            
            for (var i = 0; customFieldsList && i < customFieldsList.length; i++) {
                customFields[customFieldsList[i].getValue('custrecord_4599_custom_field_id')] = {
                    label: customFieldsList[i].getValue('custrecord_4599_custom_field_label') || '',
                    listId: customFieldsList[i].getValue('custrecord_4599_custom_list_id') || '',
                    list: {}
                };
            }

            for (var id in customFields) {
                if (customFields[id].listId) {
                    var k = 0;
                    var list = nlapiSearchRecord(customFields[id].listId, null, null, [
                        new nlobjSearchColumn('internalid'),
                        new nlobjSearchColumn('name')
                    ]);
                    
                    for (k = 0; list && k < list.length; k++) {
                        customFields[id].list[list[k].getValue('internalid')] = list[k].getValue('name');
                    }
                }
            }
            
            return customFields;
        }
        
        
        function _GetMemo(row) {
            return row.getValue('memo') || row.getValue('memomain') || row.getValue('tranid') ||
                [row.getText('type'), 'ID #', row.getId()].join(' ');
        }
        
        
        function _GetSearch() {
            var search = nlapiLoadSearch('transaction', 'customsearch_4599_by_internalid');
            var filters = _GetSearchFilters();
            var columns = _GetSearchColumns();
            search.addFilters(filters);
            search.addColumns(columns);
            return search;
        }
        
        
        function _GetSearchFilters() {
        	var periodIds = SFC.PostingPeriods.GetCoveredPeriodIds(_Period.Start.GetId(), _Period.End.GetId());
            var filters = [new nlobjSearchFilter('posting', null, 'is', 'T'), 
                           new nlobjSearchFilter('name', 'account', 'isnotempty'), 
                           new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', periodIds)];
            
            if(_IS_ONEWORLD) {
                var subsidiaryList = [];
                subsidiaryList.push(_Params.subsidiary);
                
                if (_Params.include_child_subs) {
                    var children = _Subsidiary.GetDescendants();
                    
                    for (var i = 0; i < children.length; i++) {
                        subsidiaryList.push(children[i].GetId());
                    }
                }
                
                filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryList));
            }
            
            return filters;
        }
        
        function _GetSearchColumns() {
            var columns = [new nlobjSearchColumn('internalid').setSort(),
                           new nlobjSearchColumn('line').setSort(),
                           new nlobjSearchColumn('tranid'),
                           new nlobjSearchColumn('custrecord_4599_tranchild_subtranid', 'custrecord_4599_tranchild_join'),
                           new nlobjSearchColumn('trandate'),
                           new nlobjSearchColumn('postingperiod'),
                           new nlobjSearchColumn('memo'),
                           new nlobjSearchColumn('memomain'),
                           new nlobjSearchColumn('type'),
                           new nlobjSearchColumn('createdby'),
                           new nlobjSearchColumn('debitamount'),
                           new nlobjSearchColumn('creditamount'),
                           new nlobjSearchColumn('netamount'),
                           new nlobjSearchColumn('number', 'account'),
                           new nlobjSearchColumn('account'),
                           new nlobjSearchColumn('entity'),
                           new nlobjSearchColumn('vatregnumber', 'vendor'),
                           new nlobjSearchColumn('vatregnumber', 'customer'),
                       ];
                       
           if (_IS_ONEWORLD) {
               columns.push(new nlobjSearchColumn('subsidiary'));
               columns.push(new nlobjSearchColumn('namenohierarchy', 'subsidiary'));
           }
           
           if (_IS_MULTICURRENCY) {
               columns.push(new nlobjSearchColumn('currency'));
               columns.push(new nlobjSearchColumn('fxamount'));
               columns.push(new nlobjSearchColumn('exchangerate'));
           }
           
           if (_HAS_CLASSES) {
               columns.push(new nlobjSearchColumn('class'));
           }
           
           if (_HAS_DEPARTMENTS) {
               columns.push(new nlobjSearchColumn('department'));
           }
           
           if (_HAS_LOCATIONS) {
               columns.push(new nlobjSearchColumn('location'));
           }
           
           for (var key in _CustomFields) {
               columns.push(new nlobjSearchColumn(key));
           }
           
           return columns;
        }
        
        
        function _GetSubBaseCurrency(transactionLine) {

        	var subBaseCurrency = '';
        	if (_IS_MULTICURRENCY) { 
	    		if (_IS_ONEWORLD) {
	    			subBaseCurrency = _CurrencyCodeMap[SFC.Subsidiaries.Load(transactionLine.getValue('subsidiary')).GetFieldValue('currency')];
	    		} else {
	    			subBaseCurrency = _CurrencyCodeMap[_COMPANY_INFO.getFieldValue('basecurrency')];
	    		}
        	} else {        		
        		subBaseCurrency = _CurrenciesByLocale[_COMPANY_INFO.getFieldValue('locale')];
        	}
       
        	return subBaseCurrency;
        }
        
    }; __GeneralLedger.Name = 'GeneralLedger';
}

CN_GL_Report.IsCRGReport = true;
CN_GL_Report.ReportId = 'CHINA_CSV_2';
