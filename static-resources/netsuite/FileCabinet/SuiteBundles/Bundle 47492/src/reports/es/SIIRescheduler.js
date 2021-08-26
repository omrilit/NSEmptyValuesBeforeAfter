/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};

TAF.ES.Rescheduler = function _Rescheduler() {
    this.context = nlapiGetContext();
    this.userContext = this.context.getUser();
};

TAF.ES.Rescheduler.prototype.run = function _run(params, state) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Rescheduler.run: params is a required parameter');
    }
    if (!state) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Rescheduler.run: state is a required parameter');
    }
    var tafJob = this.createTAFJob(params);
    this.schedule(tafJob.Id, state);
};

TAF.ES.Rescheduler.prototype.createTAFJob = function _createTAFJob(params) {
    var jobMgr = new TAF_JobMgr();
    var reportDef = new TAF_Reports(this.context.getPreference('LANGUAGE')).Get(params.reportId);
    var job = jobMgr.Job();

    job.PercentComplete = 0;
    job.FileExtName = reportDef.GetFileExtensionName();
    job.IsDeleted = false;
    job.IsError = false;
    job.UserId = this.userContext;
    job.ReportId = reportDef.GetId();
    job.SubsidiaryId = params.subsidiary;
    job.IsGroupSub = params.include_child_subs === "T" && reportDef.IsGroupedSub();
    job.StartPeriodId = params.periodFrom;
    job.EndPeriodId = params.periodTo;
    job.BatchNo = null;
    job.BookId = params.bookId;
    job.AccountingContext = params.accountingcontext;
    job.Params.ReportName = reportDef.GetName();
    job.Params.CultureId = this.context.getPreference('LANGUAGE');
    job.Params.hasAccountingContext = false;
    job.Params.PeriodType = reportDef.GetPeriodType();

    jobMgr.CreateNew(job);

    return job;
};

TAF.ES.Rescheduler.prototype.schedule = function _jobParams(jobId, state) {
    var logMgr = new TAF_LogMgr();

    var params = {
        custscript_4599_cust_record: jobId,
        custscript_4599_root_folder_id: ManagedFile.GetAppFolderId(),
        custscript_4599_main_s_url: this.getDownloadUrl(jobId),
        custscript_4599_section_state: JSON.stringify(state)
    };

    var status = nlapiScheduleScript('customscript_4599_main_ss', null, params);

    if (status === 'QUEUED') {
        logMgr.CreateLog(jobId, this.userContext, 'Generated');
    }
};

TAF.ES.Rescheduler.prototype.getDownloadUrl = function _getDownloadUrl(jobId) {
    var downloadUrl = '';
    var url = this.context.getSetting('SCRIPT', 'custscript_4599_main_s_url');

    if (url) {
        downloadUrl = url.substr(0, url.indexOf('&id=')) + '&id=' + jobId + '&download=' + jobId;
    }
    return downloadUrl;
};
