/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function DE_GDPDU_TC_Report(state, params, output, job) {

	var SuiteScript = function() { return this; } ();
	var _NCONTEXT = SFC.Context.GetContext();
	var _IS_ONEWORLD = SFC.Context.GetContext().getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
//    var _IS_ONEWORLD = SFC.Context.IsOneWorld();
	var _IS_MULTICURRENCY = _NCONTEXT.getFeature('MULTICURRENCY');
	
    var _Outline = { 'Section': __TaxCodesFile };
    var _Job = job;							
    var _Output = output;
    var _Params = params;
    var _State = state;
    var _ReportObj = this;
    var _Subsidiary = _IS_ONEWORLD ? SFC.Subsidiaries.Load(_Params.subsidiary) : null;
    var FILENAME = 'taxcodelist.txt';
    var DESCRIPTION = 'List of tax codes';
    var COLUMNS = {
    		TAX_CODE: 'Tax_Code',
    		TAX_PERCENTAGE: 'Tax_Percentage',
    		TAX_CODE_DESCRIPTION: 'Tax_Code_Description'
    };
    this.GetOutline = __GetOutline;
    this.GetReportIndex = __GetReportIndex;
    
    
    function __GetReportIndex() {
    	
    	var columns = [];
    	columns.push(new SFC.Utilities.ReportColumn(COLUMNS.TAX_CODE, SFC.Utilities.Constants.ALPHANUMERIC));
    	columns.push(new SFC.Utilities.ReportColumn(COLUMNS.TAX_PERCENTAGE, SFC.Utilities.Constants.ALPHANUMERIC));
    	columns.push(new SFC.Utilities.ReportColumn(COLUMNS.TAX_CODE_DESCRIPTION, SFC.Utilities.Constants.ALPHANUMERIC));

    	var reportIndex = {};
    	reportIndex.url = FILENAME;
    	reportIndex.name = FILENAME;
    	reportIndex.description = DESCRIPTION;
    	reportIndex.decimalsymbol = SFC.Utilities.Constants.DECIMALSYMBOL;
    	reportIndex.digitgroupingsymbol = SFC.Utilities.Constants.DIGITGROUPINGSYMBOL;
    	reportIndex.columndelimiter = SFC.Utilities.Constants.COLUMNDELIMITER;
    	reportIndex.columns = columns;
    	
    	return reportIndex;
    }
    
    
    function __GetOutline() { 
    	
    	return _Outline;
    };


    function __TaxCodesFile() {
    	
    	this.On_Init = _OnInit;
    	this.On_Header = _OnHeader;
    	this.On_Body = _OnBody;
    	this.On_CleanUp = _OnCleanUp;
    	// for Unit Testing only
        this.___inspect = function(expr) { return eval('(' + expr + ')'); };
    	
    	var _ResultSet = null;
    	var _SearchFilters = _GetSearchFilters();
    	var formatter = new TAF.DE.GDPDU.Formatter();

    	
    	function _OnInit() {
    		    		
    		_ValidateCurrencies();
    		_Output.SetFileName(_GetFileName());
    		
    		if(_State[__TaxCodesFile.Name] == undefined) { 			
                _State[__TaxCodesFile.Name] = {
                    Index: -1
                };
            }
                		
            _ResultSet = _GetSearch().runSearch();
            
            _Output.SetPercent(10);    		
    	}
    	
    	
    	function _OnHeader() {
    		
    		var headers = [COLUMNS.TAX_CODE,
    		               COLUMNS.TAX_PERCENTAGE,
    		               COLUMNS.TAX_CODE_DESCRIPTION];
    		
    		_Output.WriteLine(headers.join('\t'));
    		_Output.SetPercent(15);    		
    	}
    	
    	
    	function _OnBody() {
    		
            var globalIndex = null;
            
            do {
            	
                globalIndex = _State[__TaxCodesFile.Name].Index + 1;
                var sr = _ResultSet.getResults(globalIndex, globalIndex + 1000);
                
                if (sr == null) {
                    return;      
                }
                
                for (var i = 0; i < sr.length; ++i) {
                
                	var row = []; 
                	row.push(sr[i].getValue('itemid'));
                	row.push(sr[i].getValue('rate'));
                	row.push(formatter.cleanString(sr[i].getValue('description')));
                	_Output.WriteLine(row.join('\t'));
                	
                	_State[__TaxCodesFile.Name].Index = globalIndex + i;
                    
                    if(_Job.IsThresholdReached()) {
                        return;
                    }
                }
            } while(sr.length >= 1000);
            
            _Output.SetPercent(95);    		
    	}

 
        function _OnCleanUp() {
        	
        	delete _State[__TaxCodesFile.Name];
        	
        	_Output.SetPercent(100);    		
        }


        function _GetFileName() {

        	var filename = FILENAME;
        	return filename;
        }
        
        
    	function _GetSearch() {
    		
            var columns = [new SuiteScript.nlobjSearchColumn('itemid'), 
                           new SuiteScript.nlobjSearchColumn('rate'), 
                           new SuiteScript.nlobjSearchColumn('description')];
            
    		return SuiteScript.nlapiCreateSearch('salestaxitem', _SearchFilters, columns);
    	}
    	
    	
    	function _GetSearchFilters() {
    		
    		var filters = [];

    		if(_IS_ONEWORLD) {
    			var countryCodes = [];
    			countryCodes.push(_Subsidiary.GetCountryCode());
    			
    			if (_Params.include_child_subs) {
    				var children = _Subsidiary.GetDescendants();
            		
            		for (var i = 0; i < children.length; i++) { 
            			countryCodes.push(children[i].GetCountryCode());            			
            		}
    			}

    			filters.push(new SuiteScript.nlobjSearchFilter('country', null, 'anyof', countryCodes));
    		}
    		
    		return filters;
    	}
    	
    	
    	function _ValidateCurrencies() {
        	
            if (_IS_MULTICURRENCY && _IS_ONEWORLD && _Params.include_child_subs) {
            	// Check if all subsidiaries use the same currency
            	var invalidCurrencySubs = [];
                var descendants = _Subsidiary.GetDescendants();
                var currencyCode = _Subsidiary.GetCurrencyCode();
                for ( var i = 0; i < descendants.length; ++i) {
                    if (currencyCode != descendants[i].GetCurrencyCode()) {
                    	invalidCurrencySubs.push(descendants[i].GetName());
                    }
                }
                
                if (invalidCurrencySubs.length > 0) {
                	var _ResMgr = new ResourceMgr(_Params.job_params.CultureId);
                	throw SuiteScript.nlapiCreateError('DE_AUDIT_Currency_Check', _ResMgr.GetString('ERR_CURRENCY_CHECK', {'subsidiaries': invalidCurrencySubs.join(', ')}), true);
                }
            }
        }
        
    } __TaxCodesFile.Name = '__TaxCodesFile';
}

DE_GDPDU_TC_Report.IsCRGReport = true;
DE_GDPDU_TC_Report.ReportId = 'DE_GDPDU_TC_TXT';
