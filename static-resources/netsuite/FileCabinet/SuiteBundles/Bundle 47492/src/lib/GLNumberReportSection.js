/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};

TAF.GLNumberSection = function GLNumberSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    
    this.Name = this.Name;
    
    // Override these as needed
    this.GL_YEAR = 2018;
    this.GL_PROGRESS = 20;
}
TAF.GLNumberSection.prototype = Object.create(TAF.IReportSection.prototype);

// Override this method as needed
TAF.GLNumberSection.prototype.getPeriodIds = function _getPeriodIds() {
    return this.state.common.periodIds;
};

// Override this method as needed
TAF.GLNumberSection.prototype.getGLParams = function _getGLParams() {
    var glParams = {
        requiredGLYear   : this.GL_YEAR,
        subsidiaryIdList : this.state.common.subIds, 
        startDate        : SFC.PostingPeriods.Load(this.params.periodFrom).GetStartDate(),
        bookId           : this.params.bookId
    };
    return glParams;
};

// Override this method as needed
TAF.GLNumberSection.prototype.getLocale = function _getLocale() {
    return this.params.job_params.CultureId;
};
    
//Override this method as needed
TAF.GLNumberSection.prototype.setGLSupported = function _setGLSupported(isGLSupportedInPeriod) {
    this.state[this.Name].isGLSupported = isGLSupportedInPeriod;
}

TAF.GLNumberSection.prototype.On_Init = function _On_Init() {
    TAF.IReportSection.prototype.On_Init.call(this);

    if (!this.state[this.Name]) {
        this.state[this.Name] = {};
        this.state[this.Name].glIndex = 0;
        this.state[this.Name].glParams = this.getGLParams();
        this.state[this.Name].periodIds = this.getPeriodIds();
        
        nlapiLogExecution('DEBUG', 'GL Number Params', JSON.stringify(this.state[this.Name].glParams));
    }
    
    this.resource = new ResourceMgr(this.getLocale());
    this.glDao = new TAF.DAO.GLNumberingDao(this.state[this.Name].glParams);
    if (!this.glDao.isGLNumberingFeatureSupported()) {
        throw nlapiCreateError('GL_Feature_Is_Off', this.resource.GetString('ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF'), true);
    }
    this.setGLSupported(this.glDao.isGLSupportedInPeriod);
};

TAF.GLNumberSection.prototype.On_Header = function _On_Header() {
    this.output.SetPercent(this.GL_PROGRESS);
};

TAF.GLNumberSection.prototype.On_Body = function _On_Body() {
    try {
        var state = this.state[this.Name];
        
        for (var i = state.glIndex; i < state.periodIds.length; i++) {
            nlapiLogExecution('DEBUG', 'Running GL Number test', state.periodIds[i]);
            
            if (!this.glDao.isGLNumberingCompleted(state.periodIds[i])) {
                throw nlapiCreateError('GL_Has_Blank_GL_Numbers', this.resource.GetString('ERR_FR_SAFT_BLANK_GL_NO'), true);
            }
            
            state.glIndex = i;
            
            if (this.thresholdReached) {
                break;
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.GLNumberSection.On_Body', ex.toString());
        throw ex;
    }
};

