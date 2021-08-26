/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/format',
    'N/runtime',
    './module/error',
    './module/util',
    './module/environmentChecker',
    './dao/OnlineFilingDAO',
    './dao/OnlineFilingConfigurationDAO',
    './dao/TaxCacheDetailDAO',
    './dao/VATOnlineSubmittedDetailDAO',
    './dao/SubsidiaryDAO',
    './dao/TaxPeriodDAO',
    './Constants'],
function(
    format,
    runtime,
    error,
    filingUtil,
    envChecker,
    OnlineFilingDAO,
    OnlineFilingConfigurationDAO,
    TaxCacheDetailDAO,
    VATOnlineSubmittedDetailDAO,
    SubsidiaryDAO,
    TaxPeriodDAO,
    Constants) {

    OnlineFilingManager = function() {
        this.name = 'OnlineFilingManager';
        this.isMultiCalendar = runtime.isFeatureInEffect({ feature: 'MULTIPLECALENDARS' });
        this.onlineFilingDAO = new OnlineFilingDAO();
        this.onlineFilingConfigDAO = new OnlineFilingConfigurationDAO();
        this.taxCacheDetailDAO = new TaxCacheDetailDAO();
        this.submittedDetailDao = new VATOnlineSubmittedDetailDAO();
        this.taxPeriodDAO = new TaxPeriodDAO();
        this.subsidiaryDAO = new SubsidiaryDAO();
        this.isForTest = envChecker.isTestEnvironment();
        this.format = format;
        this.filingUtil = filingUtil;
    };

    OnlineFilingManager.prototype.getSubsidiaryTaxFiscalCalendar = function(subsidiaryId) {
        if (!subsidiaryId) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'subsidiaryId is a required parameter'},
                this.name + '.getSubsidiaryTaxFiscalCalendar'
            );
        }
        var list = this.subsidiaryDAO.getList({ id: subsidiaryId });
        var subsidiary = list && list[0];
        return subsidiary && subsidiary.taxFiscalCalendar;
    };

    OnlineFilingManager.prototype.getTaxPeriods = function(periodIdsStr) {
        var periodIds = periodIdsStr.split(',');
        return this.taxPeriodDAO.getList({ ids: periodIds });
    };

    OnlineFilingManager.prototype.getCoveredTaxPeriodIds = function(periodFromId, periodToId, fiscalCalendar) {
        var list = this.taxPeriodDAO.getCoveredTaxPeriodMonths(periodFromId, periodToId, fiscalCalendar);
        return list.map(function(taxPeriod) {
            return taxPeriod.id;
        });
    };

    OnlineFilingManager.prototype.getConfiguration = function(params) {
        if (!params || !params.nexus) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'params.nexus is a required parameter'},
                this.name + '.getConfiguration'
            );
        }
        var onlineFilingConfig = this.onlineFilingConfigDAO.getList({ nexus: params.nexus, isForTest: this.isForTest })[0];
        onlineFilingConfig.process = onlineFilingConfig.process ? JSON.parse(onlineFilingConfig.process) : {};
        onlineFilingConfig.config = onlineFilingConfig.config ? JSON.parse(onlineFilingConfig.config) : {};
        return onlineFilingConfig;
    };

    OnlineFilingManager.prototype.get = function(id) {
        if (!id) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'id is a required parameter' },
                this.name + '.get'
            );
        }
        var onlineFiling = this.onlineFilingDAO.getList({ id: id })[0];
        var coveredPeriods = this.getTaxPeriods(onlineFiling.coveredPeriods);
        var periodFrom = coveredPeriods[0];
        var periodTo = coveredPeriods[coveredPeriods.length - 1];

        onlineFiling.coveredPeriods = coveredPeriods;
        onlineFiling.periodForm = periodFrom.id;
        onlineFiling.periodTo = periodTo.id;

        periodFrom = this.format.parse({ value: periodFrom.startDate, type: format.Type.DATE });
        periodTo = this.format.parse({ value: periodTo.endDate, type: format.Type.DATE });
        onlineFiling.formattedPeriodFrom = this.filingUtil.formatDateToMTDDate(periodFrom);
        onlineFiling.formattedPeriodTo = this.filingUtil.formatDateToMTDDate(periodTo);
        onlineFiling.data = onlineFiling.data ? JSON.parse(onlineFiling.data) : {};
        onlineFiling.metaData = onlineFiling.metaData ? JSON.parse(onlineFiling.metaData) : {};

        return onlineFiling;
    };

    OnlineFilingManager.prototype.create = function(onlineFiling) {
        if (!onlineFiling) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'onlineFiling is a required parameter' },
                this.name + '.create'
            );
        }
        var fiscalCalendar;
        var periodFrom;
        var periodTo;

        onlineFiling.data = JSON.stringify(onlineFiling.data);
        onlineFiling.metaData = onlineFiling.metaData ? JSON.stringify(onlineFiling.metaData) : '';
        onlineFiling.status = Constants.Status.PENDING;

        // get individual month periods 
        if (onlineFiling.subsidiary && this.isMultiCalendar) {
            fiscalCalendar = this.getSubsidiaryTaxFiscalCalendar(onlineFiling.subsidiary);
        }
        onlineFiling.coveredPeriods = this.getCoveredTaxPeriodIds(onlineFiling.periodFrom, onlineFiling.periodTo, fiscalCalendar);
        onlineFiling.id = this.onlineFilingDAO.create(onlineFiling);

        if (onlineFiling.salesCacheId || onlineFiling.purchaseCacheId) {
            this.storeOnlineFilingDrilldownData(onlineFiling.id, onlineFiling.salesCacheId, onlineFiling.purchaseCacheId);
        }

        return onlineFiling;
    };

    OnlineFilingManager.prototype.updateStatus = function(onlineFilingId, status) {
        if (!onlineFilingId) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'onlineFilingId is a required parameter' },
                this.name + '.updateStatus'
            );
        }
        if (!status) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'status is a required parameter' },
                this.name + '.updateStatus'
            );
        }
        return this.update(onlineFilingId, {
            status: status
        });
    };

    OnlineFilingManager.prototype.update = function(onlineFilingId, fields) {
        if (!onlineFilingId) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'onlineFilingId is a required parameter' },
                this.name + '.update'
            );
        }
        if (!fields) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'fields is a required parameter' },
                this.name + '.update'
            );
        }
        if (fields.status === Constants.Status.FAILED) {
            this.deleteOnlineFilingDrilldownData(onlineFilingId);
        }
        return this.onlineFilingDAO.update(onlineFilingId, fields);
    };

    OnlineFilingManager.prototype.storeOnlineFilingDrilldownData = function(onlineFilingId, salesCacheId, purchaseCacheId) {
        if (!onlineFilingId) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'onlineFilingId is a required parameter' },
                this.name + '.storeOnlineFilingDrilldownData'
            );
        }
        if (!salesCacheId) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'salesCacheId is a required parameter' },
                this.name + '.storeOnlineFilingDrilldownData'
            );
        }
        if (!purchaseCacheId) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'purchaseCacheId is a required parameter' },
                this.name + '.storeOnlineFilingDrilldownData'
            );
        }
        var salesCache = this.taxCacheDetailDAO.getList({ parent: salesCacheId })[0];
        var purchaseCache = this.taxCacheDetailDAO.getList({ parent: purchaseCacheId })[0];
        var submittedSalesDetail = this.submittedDetailDao.create({
            parent: onlineFilingId,
            salesDetails: salesCache.detail,
            purchaseDetails: purchaseCache.detail
        });
    };

    OnlineFilingManager.prototype.deleteOnlineFilingDrilldownData = function(onlineFilingId) {
        if (!onlineFilingId) {
            error.throw (
                { code: 'MISSING_PARAMETER', message: 'onlineFilingId is a required parameter' },
                this.name + '.storeOnlineFilingDrilldownData'
            );
        }

        var result;
        
        try {
            var submittedDetail;
            var submittedDetailList = this.submittedDetailDao.getList({ parent: onlineFilingId });

            submittedDetail = submittedDetailList && submittedDetailList[0];
            if (submittedDetail) {
                result = this.submittedDetailDao.delete(submittedDetail.id);
            }
        } catch (ex) {
            log.error({
                title: 'OnlineFilingManager.deleteOnlineFilingDrilldownData',
                details: 'Unable to delete Online Filing drill down data - ' + ex.message
            });
        }

        return result; 
    };

    return OnlineFilingManager;
});
