/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.SAT = TAF.MX.SAT || {};

TAF.MX.SAT.ReportSection = function(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);

    if (!output) {
        throw nlapiCreateError('MISSING_PARAMETER', 'Report output object is invalid or missing.');
    }
    if (!params || !this.params.job_params || !this.params.job_params.CultureId) {
        throw nlapiCreateError('MISSING_PARAMETER', 'Report parameters are invalid or missing.');
    }
    if (this.params.isOneWorld && !this.params.subsidiary) {
        throw nlapiCreateError('MISSING_PARAMETER', 'Subsidiary parameter is not set for OneWorld account.');
    }
    if (!state) {
        throw nlapiCreateError('MISSING_PARAMETER', 'Report state is invalid.');
    }
    
    this.Name         = '';
    this.SAVED_REPORT = 'TAF Trial Balance';
    this.PROGRESS_PERCENTAGE = {
        INIT:    10,
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
    this.ENTRIES_PER_PAGE = 1000;
};

TAF.MX.SAT.ReportSection.prototype = Object.create(TAF.IReportSection.prototype);

TAF.MX.SAT.ReportSection.prototype.getAccountParams = function _getAccountParams(){
    var accountParams = {
        type: ['noneof', 'NonPosting'],        accountingcontext: ['is',this.params.accountingContext]
    };
    if (this.params.isOneWorld) {
        accountParams.subsidiary = ['is', this.params.subsidiary];
    }
    return accountParams;
};

TAF.MX.SAT.ReportSection.prototype.getAccountGroupMappings = function _getAccountGroupMappings(accountParams){
    var mappingCategory = new TAF.DAO.MappingCategoryDao().getByCode('MX_ACCOUNT_GROUPING');
    if (!mappingCategory) {
        throw nlapiCreateError('CATEGORY_NOT_FOUND', 'Mapping category not found! Kindly supply the necessary data');
    }
    
    var mappings = new TAF.DAO.MappingDao().getList(
        {'custrecord_mapper_keyvalue_category': ['anyof', mappingCategory.id]}, 
        accountParams);
    return mappings;
};

TAF.MX.SAT.ReportSection.prototype.getGLStatus = function _getGLStatus(periodIds, startDate) {
    try {
        var resourceManager = new ResourceMgr(this.params.job_params.CultureId);
        var glNumberingDao = new TAF.DAO.GLNumberingDao({
            requiredGLYear   : this.GL_YEAR,
            subsidiaryIdList : this.params.subsidiary ? [this.params.subsidiary] : null,
            periodIdList     : periodIds,
            startDate        : nlapiStringToDate(startDate)
        });
        
        if (!glNumberingDao.isGLNumberingFeatureSupported()) {
            throw nlapiCreateError('MX_Feature_Is_Off', resourceManager.GetString('ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF'), true);
        }
        
        if (!glNumberingDao.isGLNumberingCompleted()) {
            throw nlapiCreateError('MX_Has_Blank_GL_Numbers', resourceManager.GetString('ERR_FR_SAFT_BLANK_GL_NO'), true);
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.SAT.ReportSection.getGLStatus', ex.toString());
        throw ex;
    }
    return true;
};

TAF.MX.SAT.ReportSection.prototype.getHeaderConfig = function _getHeaderConfig(period, companyInfo) {
    var rawHeader = {
        isOneWorld  : this.params.isOneWorld,
        period      : period,
        config      : this.getReportConfig()
    };
    
    if (this.params.isOneWorld) {
        rawHeader.subsidiary = companyInfo.subsidiary;
    } else {
        rawHeader.company = companyInfo.company;
    }    
    
    var headerData = this.adapter.getHeaderData(rawHeader);
    return headerData;
};

TAF.MX.SAT.ReportSection.prototype.getReportConfig = function _getReportConfig() {
    var subId = this.params.isOneWorld ? this.params.subsidiary : null;
    var dao = new TAF.DAO.SetupConfigValueDao('JOURNAL_MX_XML', subId);
    
    var config = {
        tipoSolicitud : dao.getValueByKey(this.REPORT_CONFIG.TIPOSOLICITUD),
        numOrden      : dao.getValueByKey(this.REPORT_CONFIG.NUMORDEN),
        numTramite    : dao.getValueByKey(this.REPORT_CONFIG.NUMTRAMITE)
    };

    return config;
};
