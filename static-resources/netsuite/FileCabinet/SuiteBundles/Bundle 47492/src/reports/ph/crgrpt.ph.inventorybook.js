/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function PH_IB_Report(state, params, output, job) {
	
	var SuiteScript = function() { return this; } ();
	
	var _NCONTEXT = SFC.Context.GetContext();
	var _IS_ONEWORLD = SFC.Context.GetContext().getSetting("FEATURE", "SUBSIDIARIES") === "T";
	var _IS_MULTICURRENCY = _NCONTEXT.getFeature('MULTICURRENCY');
	var _IS_UNITS_OF_MEASURE_ENABLED = _NCONTEXT.getFeature('UNITSOFMEASURE');
    var _IS_INVENTORY_ENABLED = _NCONTEXT.getFeature('INVENTORY');
	
	var _Outline = { 'Section': __AuditFile };
	var _Job = job;
	var _Output = output;
	var _Params = params;
	var _State = state;
	var _ReportObj = this;
	var _Subsidiary = _IS_ONEWORLD ? SFC.Subsidiaries.Load(_Params.subsidiary) : null;
    var _Period = { 
    		Start: SFC.PostingPeriods.Load(_Params.periodFrom),
    		End: SFC.PostingPeriods.Load(_Params.periodTo)
    };
    this.GetOutline = function() { return _Outline; };
	
	
    function __AuditFile() {
    	
    	this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        
        // for Unit Testing only
        this.___inspect = function(expr) { return eval('(' + expr + ')'); };
        
        
        var _ResultSet = null;
        var _NodeName = __AuditFile.Name;
        var _SearchFilters = _GetSearchFilters();
        
        
        function _OnInit() {
        	
            _ValidateInput();
            _Output.SetFileName(_GetFileName());

            if (_State[_NodeName] == undefined) {
            	
                _State[_NodeName] = {
                    Index: -1,
                    InternalId: null
                };
            }
            
            _ResultSet = _GetSearch().runSearch();
            _Output.SetPercent(10);
        }
        
        
        function _OnHeader() 
        {
        	_Output.WriteLine('Inventory Book\n');
        	
        	var curCompanyInfo = _getCompanyInfo();
        	var companyInfoHeaderText = _createCompanyInfoHeader(curCompanyInfo);
        	_Output.WriteLine(companyInfoHeaderText);
        	
            var headers = ['Date', 'Product Name/Code', 'Description', 'Unit', 'Price per Unit', 'Amount'];
            _Output.WriteLine(headers.join(','));
            _Output.SetPercent(15);
        }
        
        function _getCompanyInfo() {
        	var companyInfo = {};
        	
        	if (_IS_ONEWORLD) {
        		companyInfo.softwareName = 'NetSuite OneWorld';
        		companyInfo.companyName = _Subsidiary.GetLegalName() || _Subsidiary.GetName();
        		companyInfo.vatRegNo = _Subsidiary.GetVRN() || '';
        		companyInfo.address = _Subsidiary.GetAddress1() + ' ' + _Subsidiary.GetAddress2() + 
        			' '+ _Subsidiary.GetCity() + ' ' + _Subsidiary.GetPostalCode() + 
        			' ' + _Subsidiary.GetCountryName();
        	} else {
        		var COMPANY = SFC.Context.GetCompanyInfo();
        		companyInfo.softwareName = 'NetSuite Mid-market';
        		companyInfo.companyName = COMPANY.getFieldValue('legalname') || COMPANY.getFieldValue('companyname');
        		companyInfo.vatRegNo = COMPANY.getFieldValue('taxnumber') || COMPANY.getFieldValue('employerid') || '';
        		companyInfo.address = COMPANY.getFieldValue('address1') + ' ' + 
        			COMPANY.getFieldValue('address2') + ' ' + COMPANY.getFieldValue('city') + ' ' + 
        			COMPANY.getFieldValue('zip') + ' ' + COMPANY.getFieldValue('country');
        	}
        	
        	companyInfo.address = companyInfo.address.replace(/,/g, " ");
        	companyInfo.address = companyInfo.address.trim();
        	
        	companyInfo.softwareName = companyInfo.softwareName + ' ' + _NCONTEXT.getVersion();
        	companyInfo.runDate = new Date().toString('MM/dd/yyyyThh:mm');
        	companyInfo.runDate = companyInfo.runDate.replace(/[T]/g, " ");
        	
        	var userInternalId = _NCONTEXT.getUser();
        	companyInfo.userId = nlapiLookupField('employee', userInternalId, 'entityid');
        	
        	return companyInfo;
        } 
        
        function _createCompanyInfoHeader(companyInfoObj) {
        	var companyInfoHeader = '';
        	
        	companyInfoHeader = 'Company Name,' + companyInfoObj.companyName + ',';
        	companyInfoHeader = companyInfoHeader + 'Software Name,' + companyInfoObj.softwareName + '\n';
        	companyInfoHeader = companyInfoHeader + 'Company Address,' + companyInfoObj.address + ',';
        	companyInfoHeader = companyInfoHeader + 'Run Date,' + companyInfoObj.runDate + '\n';
        	companyInfoHeader = companyInfoHeader + 'TIN,' + companyInfoObj.vatRegNo + ',';
        	companyInfoHeader = companyInfoHeader + 'User ID,' + companyInfoObj.userId + '\n';
        	
        	return companyInfoHeader;
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
                	
                	var row = _PopulateColumns(sr[i]);
                	_Output.WriteLine(row.join(','));
                    
                    _State[_NodeName].Index = globalIndex + i;
                    _State[_NodeName].InternalId = sr[i].getValue("internalid");

                    if (_Job.IsThresholdReached()) {
                    	
                        return;
                    }
                }
            } while (sr.length >= 1000);
            
            _Output.SetPercent(95);
        }
        
        
        function _OnCleanUp() {
        	
            delete _State[_NodeName];
            _Output.SetPercent(100);
        }
        
        
        function _ValidateInput() {
        	
            if (_IS_MULTICURRENCY && _IS_ONEWORLD) {
            	
                if (_Params.include_child_subs) {
                	
                    //Check if all subs use the same currency
                    var descendants = _Subsidiary.GetDescendants();
                    var currencyCode = _Subsidiary.GetCurrencyCode();
                    for (var i = 0; i < descendants.length; ++i) {
                    	
                        if (currencyCode != descendants[i].GetCurrencyCode()) {
                        	
                            throw SuiteScript.nlapiCreateError('PHAUDIT_Currency_Check', 'Unable to generate report on subsidiaries that do not use the same currency.', true);
                        }
                    }
                }
            }
        }
        
        
        function _GetFileName() {
        	
            var from = _Period.Start.GetName();
            var to = _Period.End.GetName();
            var reportName = 'InventoryBook';
            var jobId = _Job.GetId();
            var fileNameExtension = 'csv';
            
            var filename = (from !== to) ? [from, '-', to, '_', reportName, '_', jobId, '.', fileNameExtension]
                                         : [from, '_', reportName, '_', jobId, '.', fileNameExtension];
            
            return filename.join('');
        }
        
        
        function _GetSearchFilters() {
        	
            var endDate = _GetEndDate(_Period.End.GetId());
            var filters = [
                           new SuiteScript.nlobjSearchFilter('type', null, 'anyof', ['InvtPart', 'Group', 'Kit', 'Assembly']),
                           new SuiteScript.nlobjSearchFilter('created', null, 'onorbefore', endDate),
            ];
            
            if (_IS_ONEWORLD) {
            	
                var subsidiaryList = [];
                subsidiaryList.push(_Params.subsidiary);
                
                if (_Params.include_child_subs) {
                    var children = _Subsidiary.GetDescendants();
                    
                    for (var i = 0; i < children.length; i++) {
                        subsidiaryList.push(children[i].GetId());
                    }
                }
                
                filters.push(new SuiteScript.nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryList));
            }           
            
            return filters;
        }
        
        
        function _GetSearch() {
        	
            var search = SuiteScript.nlapiLoadSearch('item', 'customsearch_ph_taf_item_search');
            var description = new SuiteScript.nlobjSearchColumn('formulatext').setFormula("NVL({displayname}, NVL({description}, NVL({purchasedescription}, NVL({stockdescription}, {name}))))");
            search.addFilters(_SearchFilters);
            
            var columns = [
                           new SuiteScript.nlobjSearchColumn('internalid'),
                           new SuiteScript.nlobjSearchColumn('created'),
                           new SuiteScript.nlobjSearchColumn('itemid'),
                           new SuiteScript.nlobjSearchColumn('displayname'),
                           new SuiteScript.nlobjSearchColumn('salesdescription'),
                           new SuiteScript.nlobjSearchColumn('purchasedescription'),
                           new SuiteScript.nlobjSearchColumn('stockdescription'),
                           new SuiteScript.nlobjSearchColumn('baseprice'),
                           new SuiteScript.nlobjSearchColumn('type'),
                           description
                       ];
            
            if (_IS_UNITS_OF_MEASURE_ENABLED) {
                columns.push(new SuiteScript.nlobjSearchColumn('saleunit'));
            }
            if (_IS_INVENTORY_ENABLED) {
                columns.push(new SuiteScript.nlobjSearchColumn('quantityonhand'));
            }            
            
            search.addColumns(columns);

            return search;
        }
        
        
        function _PopulateColumns(row) {
        	
        	var description = new SuiteScript.nlobjSearchColumn('formulatext').setFormula("NVL({displayname}, NVL({description}, NVL({purchasedescription}, NVL({stockdescription}, {name}))))");
            var line = [];
            line.push(_FormatDate(row.getValue('created')));
            line.push(row.getValue('itemid'));
            line.push('\"' + row.getValue(description) + '\"');
            
            if (_IS_UNITS_OF_MEASURE_ENABLED) {
                line.push(row.getText('saleunit'));
            } else {
                line.push('');
            }
            
            line.push(row.getValue('baseprice'));
            
            if (_IS_INVENTORY_ENABLED) {
                line.push(row.getValue('quantityonhand'));
            }
            
            return line;
        }
        
        function _FormatDate(value)
        {
            var date = SuiteScript.nlapiStringToDate(value);
            return date == null ? '' : SuiteScript.nlapiDateToString(date);
        }
        
        function _GetEndDate(id) {
            var record = SuiteScript.nlapiLoadRecord('accountingperiod', id);
            return record.getFieldValue('enddate');
        }
        
    }; __AuditFile.Name = 'AuditFile';
	
}  //PH_IB_Report

PH_IB_Report.IsCRGReport = true;
PH_IB_Report.ReportId = 'PH_IB_CSV';
