/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Section = TAF.AE.Section || {};

TAF.AE.Section.CompanyInfoSection = function _CompanyInfoSection(state, params, output, job) {
	TAF.AE.Section.FAFReportSection.apply(this, arguments);
	this.Name = 'CompanyInfo';
	this.GL_YEAR = 2018;
};
TAF.AE.Section.CompanyInfoSection.prototype = Object.create(TAF.AE.Section.FAFReportSection.prototype);

TAF.AE.Section.CompanyInfoSection.prototype.On_Init = function _On_Init() {
    if (!this.state[this.Name]) {
        this.state[this.Name] = {
        };
    }
	this.isGLSupported = this.checkGLPrerequisites();
};

TAF.AE.Section.CompanyInfoSection.prototype.On_Header = function _On_Header() {
    this.output.WriteLine(this.FAFReportState.Formatter.formatCompanyInfoHeader());
};

TAF.AE.Section.CompanyInfoSection.prototype.On_Body = function _On_Body() {
    try {
        var adapterParams = {
                companyInfo : this.FAFReportState.CompanyInfo,
                subsidiaryInfo : this.FAFReportState.IsOneWorld ? this.FAFReportState.SubsidiaryInfo : {},
                periodFrom : this.FAFReportState.Period.Start.GetStartDate(),
                periodTo : this.FAFReportState.Period.End.GetEndDate(),
                dateCreated : nlapiStringToDate(this.params.dateCreated)
        };

        var companyInfoLine = new TAF.AE.Adapter.CompanyInfoAdapter().getCompanyInfoLine(adapterParams);
        
        this.output.WriteLine(this.FAFReportState.Formatter.formatCompanyInfoBody(companyInfoLine));
    } catch (e) {
        nlapiLogExecution('ERROR', 'TAF.AE.Section.CompanyInfoSection.On_Body()', e.toString());
        throw e;
    }
    this.output.SetPercent(this.FAFReportState.PROGRESS_PERCENTAGE.COMPANY_INFO);
};

TAF.AE.Section.CompanyInfoSection.prototype.On_CleanUp = function _On_CleanUp() {
    delete this.state[this.Name];
};

TAF.AE.Section.CompanyInfoSection.prototype.checkGLPrerequisites = function() {
    try {
    	var resourceManager = new ResourceMgr(this.params.job_params.CultureId);
        
        var glNumberingDAO = new TAF.DAO.GLNumberingDao({
        	requiredGLYear: this.GL_YEAR,
            subsidiaryIdList : this.FAFReportState.IsOneWorld ? this.FAFReportState.SubsidiaryIdList : null,
            startDate : SFC.PostingPeriods.Load(this.params.periodFrom).GetStartDate(),
            bookId: this.accountingBook ? this.accountingBook.id : null
        });
        
        if (!glNumberingDAO.isGLNumberingFeatureSupported()) {
            throw nlapiCreateError('GL_Feature_Is_Off', resourceManager.GetString('ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF'), true);
        }

        for (var iperiod = this.FAFReportState.glNumberingDao.periodIndex; iperiod < (this.FAFReportState.PeriodIdList && this.FAFReportState.PeriodIdList.length); iperiod++) {
            if (!glNumberingDAO.isGLNumberingCompleted(this.FAFReportState.PeriodIdList[iperiod])) {
                nlapiLogExecution('DEBUG', 'AE_BLANK_GL_CHECK', JSON.stringify(this.FAFReportState.PeriodIdList[iperiod]));
                throw nlapiCreateError('GL_Has_Blank_GL_Numbers', resourceManager.GetString('ERR_FR_SAFT_BLANK_GL_NO'), true);
            }
            
            this.FAFReportState.glNumberingDao.periodIndex = iperiod;
            
            if (this.job.IsThresholdReached()) {
                break;
            }
        }
        
        return glNumberingDAO.isGLSupportedInPeriod;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Report.Section.CompanyInfoSection.checkGLPrerequisites', ex.toString());
        throw ex;
    }
};