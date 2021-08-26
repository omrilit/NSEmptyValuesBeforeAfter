/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */

function DE_GDPDU_COA_Report(state, params, output, job) {
    
    var SuiteScript = function() {
        return this;
    }();
    var _NCONTEXT = SFC.Context.GetContext();
    var _IS_ONEWORLD = _NCONTEXT.getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
    var _IS_MULTICURRENCY = _NCONTEXT.getFeature('MULTICURRENCY');
    var _HAS_ACCOUNT_NUMBERING = nlapiLoadConfiguration('accountingpreferences').getFieldValue('ACCOUNTNUMBERS') == 'T';
    var _Outline = {
        'Section': __ChartOfAccountsFile
    };
    var _Job = job;
    var _Output = output;
    var _Params = params;
    var _State = state;
    var _ReportObj = this;
    var _Subsidiary = _IS_ONEWORLD ? SFC.Subsidiaries.Load(_Params.subsidiary) : null;
    var FILENAME = 'accountslist.txt';
    var DESCRIPTION = 'Kontenplaninformationen';
    var COLUMNS = {
            ACCOUNT_ID: {columnName: 'Account_ID', columnDesc: 'Konto-ID-Nr.'},
            DESCRIPTION: {columnName: 'Description', columnDesc: 'Buchungstext'},
            CATEGORY: {columnName: 'Category', columnDesc: 'Kategorie'},
            SUBCATEGORY: {columnName: 'Subcategory', columnDesc: 'Unterkategorie'},
            ACCOUNT_TYPE: {columnName: 'Account_Type', columnDesc: 'Kontentyp'}
    };
    this.GetOutline = __GetOutline;
    this.GetReportIndex = __GetReportIndex;
    
    
    function __GetReportIndex() {
        
        var columns = [];
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.ACCOUNT_ID, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.DESCRIPTION, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.CATEGORY, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.SUBCATEGORY, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.ACCOUNT_TYPE, SFC.Utilities.Constants.ALPHANUMERIC));

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
    }
    

    function __ChartOfAccountsFile() {
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        // for Unit Testing only
        this.___inspect = function(expr) {
            return eval('(' + expr + ')');
        };
        var formatter = new TAF.DE.GDPDU.Formatter();
        
        var _ResultSet = null;
        var typeToCategoryMap = {
            'AcctPay': {
                'category': 'LIABILITIES & EQUITY',
                'subcategory': 'Current Liabilities'
            },
            'AcctRec': {
                'category': 'ASSETS',
                'subcategory': 'Current Assets'
            },
            'Bank': {
                'category': 'ASSETS',
                'subcategory': 'Current Assets'
            },
            'COGS': {
                'category': 'EXPENSE',
                'subcategory': 'Cost Of Sales'
            },
            'CredCard': {
                'category': 'LIABILITIES & EQUITY',
                'subcategory': 'Current Liabilities'
            },
            'DeferExpense': {
                'category': 'ASSETS',
                'subcategory': 'Current Assets'
            },
            'DeferRevenue': {
                'category': 'LIABILITIES & EQUITY',
                'subcategory': 'Current Liabilities'
            },
            'Equity': {
                'category': 'LIABILITIES & EQUITY',
                'subcategory': 'Equity'
            },
            'Expense': {
                'category': 'EXPENSE',
                'subcategory': 'Expense'
            },
            'FixedAsset': {
                'category': 'ASSETS',
                'subcategory': 'Fixed Assets'
            },
            'Income': {
                'category': 'INCOME',
                'subcategory': 'Income'
            },
            'LongTermLiab': {
                'category': 'LIABILITIES & EQUITY',
                'subcategory': 'Long Term Liabilities'
            },
            'OthAsset': {
                'category': 'ASSETS',
                'subcategory': 'Other Assets'
            },
            'OthCurrAsset': {
                'category': 'ASSETS',
                'subcategory': 'Current Assets'
            },
            'OthCurrLiab': {
                'category': 'LIABILITIES & EQUITY',
                'subcategory': 'Current Liabilities'
            },
            'OthExpense': {
                'category': 'OTHER EXPENSE',
                'subcategory': 'Other Expense'
            },
            'OthIncome': {
                'category': 'OTHER INCOME',
                'subcategory': 'Other Income'
            },
            'UnbilledRec': {
                'category': 'ASSETS',
                'subcategory': 'Current Assets'
            }
        };
        

        function _OnInit() {
            _ValidateCurrencies();
            _Output.SetFileName(_GetFileName());
            
            if (_State[__ChartOfAccountsFile.Name] == undefined) {
                _State[__ChartOfAccountsFile.Name] = {
                    Index: -1,
                    InternalId: null
                };
            }
            
            _ResultSet = _GetSearch().runSearch();
            _Output.SetPercent(10);
        }
        

        function _OnHeader() {
            var headers = [COLUMNS.ACCOUNT_ID.columnName,
                           COLUMNS.DESCRIPTION.columnName,
                           COLUMNS.CATEGORY.columnName,
                           COLUMNS.SUBCATEGORY.columnName,
                           COLUMNS.ACCOUNT_TYPE.columnName];
            
            _Output.WriteLine(headers.join('\t'));
            _Output.SetPercent(15);
        }
        

        function _OnBody() {
            var globalIndex = null;
            
            do {
                globalIndex = _State[__ChartOfAccountsFile.Name].Index + 1;
                
                var results = _ResultSet.getResults(globalIndex, globalIndex + 1000);
                if (results == null) {
                    return;
                }
                
                for ( var i = 0; i < results.length; ++i) {
                    var accountType = results[i].getValue('type');
                    var categoryInfo = typeToCategoryMap[accountType];
                    var category = 'UNDEFINED';
                    var subcategory = 'UNDEFINED';
                    
                    if (typeof(categoryInfo) != 'undefined') {
                        category = categoryInfo.category;
                        subcategory = categoryInfo.subcategory;
                    }
                    
                    var accountNumber = (!_HAS_ACCOUNT_NUMBERING || (results[i].getValue('number') == '' || results[i].getValue('number') == '- None -')) ? 
                        results[i].getId() : 
                        results[i].getValue('localizednumber') || results[i].getValue('number');
                    var description = results[i].getValue('description');
                    
                    if ((results[i].getValue('description')) == '' ||
                        (results[i].getValue('description') == '- None -')) {
                        // Note: name contains account numbers when
                        // 'accountnumbers' preferences is checked
                        var id = results[i].getId();
                        var accountRecord = SuiteScript.nlapiLoadRecord('account', id);
                        if(_HAS_ACCOUNT_NUMBERING && _Params.job_params.hasAccountingContext) {
                            description = _ExtractAccountName(results[i].getValue('localizeddisplayname'),results[i].getValue('localizednumber'));
                        } else {
                            description = _ExtractAccountName(results[i].getValue('name'),results[i].getValue('number'));
                        }
                    }
                    
                    var row = [
                        accountNumber,
                        formatter.cleanString(description),
                        formatter.cleanString(category),
                        formatter.cleanString(subcategory),
                        results[i].getText('type')
                    ];
                    _Output.WriteLine(row.join('\t'));
                    
                    _State[__ChartOfAccountsFile.Name].Index = globalIndex + i;
                    _State[__ChartOfAccountsFile.Name].InternalId = results[i].getId();
                    
                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                }
            } while (results.length >= 1000);
            _Output.SetPercent(95);
        }
        

        function _OnCleanUp() {
            delete _State[__ChartOfAccountsFile.Name];
            _Output.SetPercent(100);
        }
        

        function _GetFileName() {
            var filename = FILENAME;
            return filename;
        }
        

        function _GetSearch() {
            var columns = [
                new SuiteScript.nlobjSearchColumn('type'),
                new SuiteScript.nlobjSearchColumn('name'),
                new SuiteScript.nlobjSearchColumn('description')
            ];
            var filters = _GetSearchFilters();
            
            if (_HAS_ACCOUNT_NUMBERING) {
                columns.push(new SuiteScript.nlobjSearchColumn('number').setSort());
            }
            
            if(_Params.job_params && _Params.job_params.hasAccountingContext) {
                columns.push(new SuiteScript.nlobjSearchColumn('localizeddisplayname'));
                if (_HAS_ACCOUNT_NUMBERING) {
                    columns.push(new SuiteScript.nlobjSearchColumn('localizednumber').setSort());
                }
            }
            
            return SuiteScript.nlapiCreateSearch('account', filters, columns);
        }
        

        function _GetSearchFilters() {
            var filters = [new SuiteScript.nlobjSearchFilter('type', null, 'noneof', 'NonPosting')];
            
            if (_IS_ONEWORLD) {
                var subsidiaryList = [_Params.subsidiary];
                
                if (_Params.include_child_subs) {
                    var children = _Subsidiary.GetDescendants();
                    
                    for ( var i = 0; i < children.length; i++) {
                        subsidiaryList.push(children[i].GetId());
                    }
                }
                
                filters.push(new SuiteScript.nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryList));
            }

            if(_Params.job_params && _Params.job_params.hasAccountingContext) {
                _Params.accountingContext = _Params.accountingContext || '@NONE@';
                
                var language = _NCONTEXT.getPreference('LANGUAGE');
                var srchFilter = [ new nlobjSearchFilter('locale', null, 'is', language) ];
                var rs = nlapiSearchRecord('account', null, srchFilter,null);
                if(!rs) {
                    language = '@NONE@';
                }
                
                filters.push(new nlobjSearchFilter('locale', null, 'is', language));
                filters.push(new nlobjSearchFilter('accountingcontext', null, 'is', _Params.accountingContext));
            }
            
            return filters;
        }
        

        function _ValidateCurrencies() {
            if (_IS_MULTICURRENCY && _IS_ONEWORLD && _Params.include_child_subs) {
                // Check if all subsidiaries use the same currency
                var descendants = _Subsidiary.GetDescendants();
                var currencyCode = _Subsidiary.GetCurrencyCode();
                var incorrectSubsidiaries = [];
                
                for ( var i = 0; i < descendants.length; ++i) {
                    if (currencyCode != descendants[i].GetCurrencyCode()) {
                        incorrectSubsidiaries.push(descendants[i].GetName());
                    }
                }
                
                if (incorrectSubsidiaries.length > 0) {
                    var resourceManager = new ResourceMgr(_Params.job_params.CultureId);
                    var errorMessage = resourceManager.GetString('ERR_CURRENCY_CHECK', { subsidiaries: incorrectSubsidiaries.join(', ') });
                    throw SuiteScript.nlapiCreateError('DE_AUDIT_Currency_Check', errorMessage, true);
                }
            }
        }
        
        function _ExtractAccountName(accountName, accountNumber) {
            if(accountNumber){
                accountName = accountName.replace(accountNumber, '');
            }
            
            return accountName.trim();
        }
        
    }
    __ChartOfAccountsFile.Name = 'ChartOfAccountsFile';
}

DE_GDPDU_COA_Report.IsCRGReport = true;
DE_GDPDU_COA_Report.ReportId = 'DE_GDPDU_COA_TXT';
