/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.PT = TAF.PT || {};

TAF.PT.StockMovementLine = function _StockMovementLine() {
	return {
		numberOfMovementLines : '',
		totalQuantityIssued : '',
		documentNumber : '',
		movementStatus : 'N',
		movementStatusDate : '',
		documentStatus_sourceID : '',
		sourceBilling : 'P',
		hash : '',
		movementDate : '',
		movementType : 'GR',
		systemEntryDate : '',
		sourceID : '',
		shipTo_addressDetail : '',
		shipTo_city : '',
		shipTo_postalCode : '',
		shipTo_region : '',
		shipTo_country : '',
		shipFrom_addressDetail : '',
		shipFrom_city : '',
		shipFrom_postalCode : '',
		shipFrom_region : '',
		shipFrom_country : '',
		movementStartTime : '',
		lineNumber : '',
		productCode : '',
		productDescription : '',
		quantity : '',
		unitOfMeasure : '',
		unitPrice : '',
		description : '',
		taxPayable : '',
		netTotal : '',
		grossTotal : '',
		customerID : '',
		creditAmount : ''
	};
};


TAF.PT.MovementOfGoodsAdapter = function _MovementOfGoodsAdapter(params) {
	this.context = (params && params.context) || nlapiGetContext();
	this.state = {
		TaxPayable : 0,
		NetTotal : 0,
		GrossTotal : 0
	};
};


TAF.PT.MovementOfGoodsAdapter.prototype.getStockMovementLine = function _getStockMovementLine(params) {
	var stockMovementLine = new TAF.PT.StockMovementLine();
	var taxPayable = 0;
	var netTotal = 0;
	var grossTotal = 0;
	var ptDefaultValue = params.ptDefaultValue ? params.ptDefaultValue : '';
	var UOM_DEFAULT_VALUE = 'unit';

	if (params.summaryInfo) {
		stockMovementLine.numberOfMovementLines = params.summaryInfo.noOfMovementLines;
		stockMovementLine.totalQuantityIssued = params.summaryInfo.totalQuantity;
	}

	if (params.itemFulfillmentLineDao) {
		stockMovementLine.movementStatusDate = params.itemFulfillmentLineDao.dateCreated;
		stockMovementLine.documentStatus_sourceID = params.itemFulfillmentLineDao.createdBy;
		stockMovementLine.movementDate = params.itemFulfillmentLineDao.tranDate;
		stockMovementLine.sourceID = params.itemFulfillmentLineDao.createdBy;
		stockMovementLine.shipTo_addressDetail = params.itemFulfillmentLineDao.shipAddress1 + params.itemFulfillmentLineDao.shipAddress2 != '' ?
												 params.itemFulfillmentLineDao.shipAddress1 + ' ' + params.itemFulfillmentLineDao.shipAddress2 : ptDefaultValue;
		stockMovementLine.shipTo_city = params.itemFulfillmentLineDao.shipCity || ptDefaultValue;
		stockMovementLine.shipTo_postalCode = params.itemFulfillmentLineDao.shipZip || ptDefaultValue;
		stockMovementLine.shipTo_region = params.itemFulfillmentLineDao.shipState || ptDefaultValue;
		stockMovementLine.shipTo_country = params.itemFulfillmentLineDao.shipCountry;
		stockMovementLine.movementStartTime = params.itemFulfillmentLineDao.dateCreated;
		stockMovementLine.lineNumber = params.itemFulfillmentLineDao.lineId;
		stockMovementLine.productCode = params.itemFulfillmentLineDao.itemInternalId + ' - ' + params.itemFulfillmentLineDao.itemName;
		stockMovementLine.productDescription = params.itemFulfillmentLineDao.itemDisplayName || ptDefaultValue;
		stockMovementLine.productSerialNumbers = params.itemFulfillmentLineDao.itemSerialNumbers;
		stockMovementLine.quantity = params.itemFulfillmentLineDao.quantity;
		stockMovementLine.unitOfMeasure = params.itemFulfillmentLineDao.unitsType || UOM_DEFAULT_VALUE;
		stockMovementLine.description = params.itemFulfillmentLineDao.salesOrder.memo || stockMovementLine.productDescription;
		stockMovementLine.customerID = params.itemFulfillmentLineDao.customerInternalId;

		stockMovementLine.unitPrice = parseFloat(params.itemFulfillmentLineDao.salesOrder.rate) ||
									  parseFloat(params.itemFulfillmentLineDao.salesOrder.amount || 0) /
									  parseFloat(params.itemFulfillmentLineDao.salesOrder.quantity || 1);
		stockMovementLine.creditAmount = parseFloat(stockMovementLine.unitPrice) * parseFloat(params.itemFulfillmentLineDao.quantity);

		taxPayable = (parseFloat(params.itemFulfillmentLineDao.salesOrder.taxAmount || 0) / parseFloat(params.itemFulfillmentLineDao.salesOrder.quantity || 1)) * parseFloat(params.itemFulfillmentLineDao.quantity);
		netTotal = (parseFloat(params.itemFulfillmentLineDao.salesOrder.netAmount || 0) / parseFloat(params.itemFulfillmentLineDao.salesOrder.quantity || 1)) * parseFloat(params.itemFulfillmentLineDao.quantity);
		grossTotal = netTotal + taxPayable;

		if (params.certificationDao) {
			var certification = params.certificationDao.getById(params.itemFulfillmentLineDao.id);
			stockMovementLine.documentNumber = certification.tranId;
			stockMovementLine.hash = certification.signature;
			stockMovementLine.systemEntryDate = certification.systemEntryDate;
		}

		if (params.addressDao) {
			var locationAddressInfo = {};
			var subsidiaryAddressInfo = {};
			var companyAddressInfo = params.addressDao._getCompanyAddress();

			if (params.itemFulfillmentLineDao.location) {
				locationAddressInfo = params.addressDao._getLocationAddress(params.itemFulfillmentLineDao.location);
			}

			if (this.context.getFeature('SUBSIDIARIES')) {
				subsidiaryAddressInfo = params.addressDao._getSubsidiaryAddress(params.subId);
			}

			if ((locationAddressInfo.address1 || locationAddressInfo.address2) &&
				locationAddressInfo.city && locationAddressInfo.postalCode && locationAddressInfo.region &&
				locationAddressInfo.country) {

				stockMovementLine.shipFrom_addressDetail = (locationAddressInfo.address1 + ' ' + locationAddressInfo.address2).trim();
				stockMovementLine.shipFrom_city = locationAddressInfo.city;
				stockMovementLine.shipFrom_postalCode = locationAddressInfo.postalCode;
				stockMovementLine.shipFrom_region = locationAddressInfo.region;
				stockMovementLine.shipFrom_country = locationAddressInfo.country;

			} else if ((subsidiaryAddressInfo.address1 || subsidiaryAddressInfo.address2) &&
					   subsidiaryAddressInfo.city && subsidiaryAddressInfo.postalCode && subsidiaryAddressInfo.region &&
					   subsidiaryAddressInfo.country) {

				stockMovementLine.shipFrom_addressDetail = (subsidiaryAddressInfo.address1 + ' ' + subsidiaryAddressInfo.address2).trim();
				stockMovementLine.shipFrom_city = subsidiaryAddressInfo.city;
				stockMovementLine.shipFrom_postalCode = subsidiaryAddressInfo.postalCode;
				stockMovementLine.shipFrom_region = subsidiaryAddressInfo.region;
				stockMovementLine.shipFrom_country = subsidiaryAddressInfo.country;
			} else {

				stockMovementLine.shipFrom_addressDetail = (companyAddressInfo.address1 + ' ' + companyAddressInfo.address2).trim() || ptDefaultValue;
				stockMovementLine.shipFrom_city = companyAddressInfo.city || ptDefaultValue;
				stockMovementLine.shipFrom_postalCode = companyAddressInfo.postalCode || ptDefaultValue;
				stockMovementLine.shipFrom_region = companyAddressInfo.region || ptDefaultValue;
				stockMovementLine.shipFrom_country = companyAddressInfo.country;
			}
		}
	}

	if (params.documentTotals) {
		this.state.TaxPayable = params.documentTotals.TaxPayable + taxPayable;
		this.state.NetTotal = params.documentTotals.NetTotal + netTotal;
		this.state.GrossTotal = params.documentTotals.GrossTotal + grossTotal;

		stockMovementLine.taxPayable = this.state.TaxPayable;
		stockMovementLine.netTotal = this.state.NetTotal;
		stockMovementLine.grossTotal = this.state.GrossTotal;
	}

	return stockMovementLine;
};
