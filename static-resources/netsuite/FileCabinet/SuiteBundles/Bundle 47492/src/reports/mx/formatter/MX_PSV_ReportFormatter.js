/**
 * Copyright 2015, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.Formatter = TAF.MX.Formatter || {};
var YEAR_2019 = 2019;

TAF.MX.Formatter.PSV = function _PSV(postingYear) {

	TAF.MX.Formatter.SAT.call(this);
    this.isXML = false;
    if (postingYear < YEAR_2019){
		this.TEMPLATE.DIOT_LINE ='{vendorType}|{operationType}|{RFC}|{nonMXVendorTaxID}|{vendorName}|{nonMXCountry}|{nonMXNationality}|' +
	  						  '{S_net}|{DS_net}|{S_tax}|{R_net}|{DR_net}|{R_tax}|{IS_net}|{IS_tax}|{IR_net}|{IR_tax}|{IE_net}|' +
	  						  '{Z_IZ_ZX_net}|{E_net}|{wtax}|{paidDiscount}|';
    }else{
		this.TEMPLATE.DIOT_LINE ='{vendorType}|{operationType}|{RFC}|{nonMXVendorTaxID}|{vendorName}|{nonMXCountry}|{nonMXNationality}|' +
	  						  '{S_net}|{emptyValue}|{S_tax}|{emptyValue}|{emptyValue}|{R_net}|{emptyValue}|{DR_net}|{IS_net}|{IR_tax}|'+
							  '{emptyValue}|{emptyValue}|{IE_net}|{Z_IZ_ZX_net}|{E_net}|{wtax}|{paidDiscount}|';
	}
};
TAF.MX.Formatter.PSV.prototype = Object.create(TAF.MX.Formatter.SAT.prototype);

