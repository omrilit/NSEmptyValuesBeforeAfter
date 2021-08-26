/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
function MX_SAT_Journal_Report(state, params, output, job) {
    var context = nlapiGetContext();
    params.isOneWorld = context.getFeature('SUBSIDIARIES');
    params.isMultiBook = context.getFeature('MULTIBOOK');
    params.isMultiCurrency = context.getFeature('MULTICURRENCY');

    this.outline = {
       "Section": Journal
    };
    this.GetOutline = function() { return this.outline; };
    
    function Journal() {
        return new MX_SAT_Journal_Section(state, params, output, job);
    }
}

//Report Sections
function MX_SAT_Journal_Section(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name             = 'Journal';
    this.ENTRIES_PER_PAGE = 1000;
    this.PROGRESS_PERCENTAGE = {
        HEADER:  20,
        BODY:    90,
        FOOTER:  100
    };
    this.REPORT_CONFIG = {
        TIPOSOLICITUD : 'MX_POLIZAS_TIPOSOLICITUD',
        NUMORDEN      : 'MX_POLIZAS_NUMORDEN',
        NUMTRAMITE    : 'MX_POLIZAS_NUMTRAMITE'
    };
    this.GL_YEAR = 2015;
	var MEXICO_LOCALIZATION_BUNDLE = 'cd476cab-e846-474e-9f11-e213e69c420b';
    this.hasMXLocalization = SFC.Registry.IsInstalled(MEXICO_LOCALIZATION_BUNDLE);
};

MX_SAT_Journal_Section.prototype = Object.create(TAF.IReportSection.prototype);

MX_SAT_Journal_Section.prototype.On_Init = function() {
    if (!this.state[this.Name]) {
        this.initializeStateObject();
    }
    this.adapter = new TAF.MX.Adapter.JournalAdapter(this.state[this.Name].adapterState);
};

MX_SAT_Journal_Section.prototype.initializeStateObject = function() {
    try {
        var periodDao = new TAF.DAO.AccountingPeriodDao();
        var periodIds = periodDao.getCoveredPeriodIds(this.params.periodFrom, this.params.periodFrom);
        var period = periodDao.getPeriodById(this.params.periodFrom);
        var glStatus = this.getGLStatus(periodIds, period.startDate);
        var book = this.getAccountingBook();
        var currency = this.params.isMultiCurrency ? new TAF.DAO.CurrencyDao().getCurrencyMap() : {};
        var accounts = this.getAccountObj(book);
        if(this.hasMXLocalization) {
            var bankMap = new TAF.DAO.MappingDao().mxGetMappings('MX_BANK');
            var paymentMap = new TAF.DAO.MappingDao().mxGetMappings('MX_PAYMENTMETHOD');
        } else {
            var bankMap = this.getBankMap();
            var paymentMap = this.getPaymentMethodMap();
        }
        var adapterState = {
            isOneWorld     : this.params.isOneWorld,
            isMultiCurrency: this.params.isMultiCurrency,
            glStatus       : glStatus,
            period         : period,
            accounts       : accounts,
            currency       : currency,
            hasPreviousTxn : false,
            previousTxnId  : -1,
            bankMap        : bankMap,
            paymentMap     : paymentMap
        };
        if (this.params.isOneWorld) {
            adapterState.subsidiary = new TAF.DAO.SubsidiaryDao().getSubsidiaryById(this.params.subsidiary);
        } else {
            adapterState.company = new TAF.DAO.CompanyDao().getInfo();
        }
        
        adapterState.baseCurrency = this.getBaseCurrency(book, adapterState);
        
        var MEXICO_COMPLIANCE_BUNDLE = "10f7d41f-88bc-41e6-ab61-6664bfdaef24";
        var hasMXCompliance = SFC.Registry.IsInstalled(MEXICO_COMPLIANCE_BUNDLE);
        
        this.state[this.Name] = {
            index : 0,
            fileIndex : 0,
            rowFileIndex : 0,
            periodIds : periodIds,
            period: period,
            adapterState : adapterState,
            hasMXCompliance : hasMXCompliance,
            hasMXLocalization: this.hasMXLocalization,
        };
    } catch (ex) {
        nlapiLogExecution('ERROR', 'MX_SAT_Journal_Section.initializeStateObject', ex.toString());
        throw ex;        
    }
};

MX_SAT_Journal_Section.prototype.getBankMap = function() {
    var mappingCategory = new TAF.DAO.MappingCategoryDao().getByCode('MX_BANK');
    var filter = {
        'custrecord_mapper_keyvalue_category': ['anyof', mappingCategory.id]
    };
    var accountParams = {
        type: ['is', 'Bank']
    };
    if (this.params.isOneWorld) {
        accountParams.subsidiary = ['is', this.params.subsidiary];
    }
    var map = new TAF.DAO.MappingDao().getList(filter, accountParams);
    return map;
};

MX_SAT_Journal_Section.prototype.getPaymentMethodMap = function() {
    var mappingCategory = new TAF.DAO.MappingCategoryDao().getByCode('MX_PAYMENTMETHOD');
    var filter = {
        'custrecord_mapper_keyvalue_category': ['anyof', mappingCategory.id]
    };
    var payment = new TAF.DAO.MappingDao().getList(filter);
    return payment;
};

MX_SAT_Journal_Section.prototype.getBaseCurrency = function(book, adapter) {
    var baseCurrency = 'MXN';

    if (this.params.isMultiBook && book && adapter.currency[book.currencyId]) {
        baseCurrency = adapter.currency[book.currencyId].symbol;
    } else if (adapter.subsidiary && adapter.subsidiary.currency) {
        baseCurrency = this.getCurrencySymbolByName(adapter.currency, adapter.subsidiary.currency) || baseCurrency;
    } else if (adapter.company && adapter.company.currency && adapter.currency[adapter.company.currency]) {
        baseCurrency = adapter.currency[adapter.company.currency].symbol;
    }

    return baseCurrency;
};

MX_SAT_Journal_Section.prototype.getCurrencySymbolByName = function(currencyMap, currencyName) {
    var currency;

    for (var id in currencyMap) {
        currency = currencyMap[id];
        if (currency.name == currencyName) {
            return currency.symbol;
        }
    }

    return null;
};

MX_SAT_Journal_Section.prototype.getAccountObj = function(book) {
    var accountParams = {
        type: ['noneof', 'NonPosting'],
        accountingcontext: ['is',this.params.accountingContext]
    };
    if (this.params.isOneWorld) {
        accountParams.subsidiary = ['is', this.params.subsidiary];
    }
    var isSCOAIncluded = !book || book.isPrimary;
    var accounts = new TAF.DAO.AccountDao().getList(accountParams, isSCOAIncluded);

    var usesAccountingContext = this.params.accountingContext != ''
    var accountObj = new TAF.MX.Adapter.AccountAdapter().getAccountObj(accounts, usesAccountingContext);
    return accountObj;
};

MX_SAT_Journal_Section.prototype.getGLStatus = function(periodIds, startDate) {
    try {
        var resourceManager = new ResourceMgr(this.params.job_params.CultureId);
        var glNumberingDao = new TAF.DAO.GLNumberingDao({
            requiredGLYear   : this.GL_YEAR,
            subsidiaryIdList : this.params.isOneWorld ? [this.params.subsidiary] : null,
            periodIdList     : periodIds,
            startDate        : nlapiStringToDate(startDate),
            bookId           : this.params.isMultiBook ? this.params.bookId : null
        });
        
        if (!glNumberingDao.isGLNumberingFeatureSupported()) {
            throw nlapiCreateError('MX_Feature_Is_Off', resourceManager.GetString('ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF'), true);
        }
        
        if (!this.params.useSS2Engine && !glNumberingDao.isGLNumberingCompleted()) {
            throw nlapiCreateError('MX_Has_Blank_GL_Numbers', resourceManager.GetString('ERR_FR_SAFT_BLANK_GL_NO'), true);
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'MX_SAT_Journal_Section.getGLStatus', ex.toString());
        throw ex;
    }
    return true;
};

MX_SAT_Journal_Section.prototype.On_Header = function() {
    try {
        var rawHeader = {
            isOneWorld  : this.params.isOneWorld,
            period      : this.state[this.Name].period,
            config      : this.getReportConfig()
        };
        
        if (this.params.isOneWorld) {
            rawHeader.subsidiary = this.state[this.Name].adapterState.subsidiary;
        } else {
            rawHeader.company = this.state[this.Name].adapterState.company;
        }
        
        var headerData = this.adapter.getHeaderData(rawHeader);
        this.output.WriteLine(this.formatter.formatHeader());
        if(headerData.submissionType == 'AF' || headerData.submissionType == 'FC') {
        	this.output.WriteLine(this.formatter.formatJournalHeaderOrden(headerData));
        } else if (headerData.submissionType == 'DE' || headerData.submissionType == 'CO'){
        	this.output.WriteLine(this.formatter.formatJournalHeaderTramite(headerData));
        } else {
            nlapiLogExecution('ERROR', 'MX_SAT_Journal_Section', 'Invalid submission type ' + headerData.submissionType);
            throw nlapiCreateError('INVALID_DATA', 'TipoSolicitud is invalid. Verify that you have entered the correct value in your MX Setup Configuration.');
        }
        
    	this.output.SetPercent(this.PROGRESS_PERCENTAGE.HEADER);
        this.output.SetFileName(this.formatter.formatJournalFilename(headerData));
    } catch (ex) {
        nlapiLogExecution('ERROR', 'MX_SAT_Journal_Section.On_Header', ex.toString());
        throw ex;
    }
};

MX_SAT_Journal_Section.prototype.getReportConfig = function() {
    var subId = this.params.isOneWorld ? this.params.subsidiary : null;
    var dao = new TAF.DAO.SetupConfigValueDao('JOURNAL_MX_XML', subId);
    
    var config = {
        tipoSolicitud : dao.getValueByKey(this.REPORT_CONFIG.TIPOSOLICITUD),
        numOrden      : dao.getValueByKey(this.REPORT_CONFIG.NUMORDEN),
        numTramite    : dao.getValueByKey(this.REPORT_CONFIG.NUMTRAMITE)
    };

    return config;
};

MX_SAT_Journal_Section.prototype.On_Body = function() {
    try {
        do {
            var params = {
                subIds          : [this.params.subsidiary],
                periodIds       : this.state[this.Name].periodIds,
                hasMXCompliance : this.state[this.Name].hasMXCompliance,
                hasMXLocalization: this.state[this.Name].hasMXLocalization,
                bookId          : this.params.bookId
            };
            var rowIndex = this.state[this.Name].index;
            var fileIndex = this.state[this.Name].fileIndex;
            var rowFileIndex = this.state[this.Name].rowFileIndex;
            var dao, list, prevIndex;
            
            if(this.params.useSS2Engine){
                var csvDaoParams = {jobId : this.job.GetId(),
                             accounts : this.state[this.Name].adapterState['accounts'],
                             currency : this.state[this.Name].adapterState['currency']};
                
                dao = new TAF.MX.DAO.JournalCsvDao(csvDaoParams);
                
                list = dao.getList(rowFileIndex, rowFileIndex + this.ENTRIES_PER_PAGE, fileIndex);
                
                prevIndex = this.state[this.Name].index;
                
                this.processTransactionList(list);
                
                if(this.state[this.Name].fileIndex!=dao.getCurrentIndex().file){
                    this.state[this.Name].fileIndex = dao.getCurrentIndex().file;
                    this.state[this.Name].rowFileIndex = 0; //reset row in file
                }
                else{
                    this.state[this.Name].rowFileIndex += this.state[this.Name].index - prevIndex; 
                }
            }
            else{
                dao = new TAF.MX.DAO.JournalDao(this.state[this.Name].hasMXCompliance || this.state[this.Name].hasMXLocalization);
                dao.search(params);
                list = dao.getList(rowIndex, rowIndex + this.ENTRIES_PER_PAGE, fileIndex);
                this.processTransactionList(list);
            }
            
            if (((!list) || (list.length == 0)) && !dao.hasMoreFiles) {
                break;
            }
            
            if (this.job.IsThresholdReached()) {
                break;
            }
        } while (dao.hasMoreRows || dao.hasMoreFiles);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'MX_SAT_Journal_Section.On_Body', ex.toString());
        throw ex;        
    }
};

MX_SAT_Journal_Section.prototype.processTransactionList = function(list) {
    var iterator = new TAF.Lib.Iterator(list);
    
    while(iterator.hasNext()){
        var line = iterator.next();
        var journalLine = this.adapter.getJournalLine(line);
        
        if (journalLine.info.isNewPolicy) {
            if (journalLine.info.hasPreviousTxn) {
                this.output.WriteLine(this.formatter.formatJournalPolicyFooter());
            }
            this.output.WriteLine(this.formatter.formatJournalPolicyHeader(journalLine.policy));
        }
        
        switch (journalLine.info.journalType) {
            case TAF.MX.Adapter.JournalType.VENDOR_PAYMENTS :
                if (journalLine.info.isNewPolicy) {
                    var uuid = this.getUUID(line);
                    journalLine.transaction.UUID = uuid;
                }
                if (journalLine.transaction.UUID) {
                    this.output.WriteLine(this.formatter.formatVendorPayments(journalLine.transaction));
                }
                else {
                    this.output.WriteLine(this.formatter.formatJournalOthers(journalLine.transaction));
                }
                break;
            case TAF.MX.Adapter.JournalType.CHECK :
                this.output.WriteLine(this.formatter.formatJournalCheck(journalLine.transaction));
                break;
            case TAF.MX.Adapter.JournalType.TRANSFER :
                this.output.WriteLine(this.formatter.formatJournalTransfer(journalLine.mainTransfer));
                this.output.WriteLine(this.formatter.formatJournalTransaction(journalLine.transaction));
                break;
            case TAF.MX.Adapter.JournalType.OTHER_PAYMENTS :
                this.output.WriteLine(this.formatter.formatJournalOthers(journalLine.transaction));
                break;
            case TAF.MX.Adapter.JournalType.STANDARD :
                if (journalLine.transaction.isForeign) {
                    this.output.WriteLine(this.formatter.formatJournalCompExt(journalLine.transaction));
                    break;
                }
                
                if (journalLine.info.isNewPolicy) {
                    var uuid = this.getUUID(line);
                    journalLine.transaction.UUID = uuid;
                }
                if (journalLine.transaction.UUID) {
                    this.output.WriteLine(this.formatter.formatJournalCompNal(journalLine.transaction));
                } else {
                    this.output.WriteLine(this.formatter.formatJournalTransaction(journalLine.transaction));
                }
                break;
            default :
                break;
        }
        
        this.state[this.Name].index++;
        this.state[this.Name].adapterState = this.adapter.state;
        if (this.job.IsThresholdReached()) {
            break;
        }
    }
};

MX_SAT_Journal_Section.prototype.getUUID = function(line) {
    var uuid = '';
    try {
        uuid = new MXPlugin().getUUID(line.type, line.id);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'MX_SAT_Journal_Section.getUUID', ex.toString());
    }
    return uuid;
};

MX_SAT_Journal_Section.prototype.On_Footer = function() {
    this.output.SetPercent(this.PROGRESS_PERCENTAGE.BODY);
    if (this.state[this.Name].adapterState.hasPreviousTxn) {
        this.output.WriteLine(this.formatter.formatJournalPolicyFooter());
    }
    
    this.output.WriteLine(this.formatter.formatJournalFooter());
    this.output.SetPercent(this.PROGRESS_PERCENTAGE.FOOTER);
};

MX_SAT_Journal_Section.prototype.On_CleanUp = function() {
    delete this.state[this.Name];
};

//CRG Reports
var MX_SAT_Journal_XML_Report = function _MX_SAT_Journal_XML_Report(state, params, output, job) {
    params.formatter = new TAF.MX.Formatter.XML();
    MX_SAT_Journal_Report.call(this, state, params, output, job);
};
MX_SAT_Journal_XML_Report.prototype = Object.create(MX_SAT_Journal_Report.prototype);
MX_SAT_Journal_XML_Report.IsCRGReport = true;
MX_SAT_Journal_XML_Report.ReportId = 'JOURNAL_MX_XML';
