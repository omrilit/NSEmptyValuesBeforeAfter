/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.SG = VAT.SG || {
    CountryCode: 'SG',
    TaxCodeDefs: {
        DS: function(taxCode) { // Deemed Supply
            return taxCode.CountryCode === 'SG' &&
                !taxCode.IsEC &&
                !taxCode.IsExempt &&
                !taxCode.IsForExport &&
                !taxCode.IsReduced &&
                !taxCode.IsSuperReduced &&
                !taxCode.IsImport &&
                !taxCode.IsService &&
                taxCode.Rate > 0 &&
                !taxCode.IsReverseCharge &&
                !taxCode.Parent &&
                !taxCode.IsPostNotional &&
                taxCode.IsDeemedSupply &&
                !taxCode.DeferredOn;
        },
        TXCA: function(taxCode) { // Reverse Charge - Purchase
            return taxCode.CountryCode === 'SG' &&
                !taxCode.IsEC &&
                !taxCode.IsExempt &&
                !taxCode.IsForExport &&
                !taxCode.IsReduced &&
                !taxCode.IsSuperReduced &&
                !taxCode.IsImport &&
                !taxCode.IsService &&
                taxCode.Rate === 0 &&
                taxCode.IsReverseCharge &&
                taxCode.IsForPurchase &&
                taxCode.Parent &&
                taxCode.IsPostNotional &&
                !taxCode.DeferredOn;
        },
        TXCA2: function(taxCode) { // Input tax is deferred
            return taxCode.CountryCode === 'SG' &&
                !taxCode.IsEC &&
                !taxCode.IsExempt &&
                !taxCode.IsForExport &&
                !taxCode.IsReduced &&
                !taxCode.IsSuperReduced &&
                !taxCode.IsImport &&
                !taxCode.IsService &&
                taxCode.Rate === 0 &&
                taxCode.IsReverseCharge &&
                taxCode.IsForPurchase &&
                taxCode.Parent &&
                taxCode.IsPostNotional &&
                taxCode.DeferredOn === '1';
        },
        SRRC: function(taxCode) { // Import Services - Purchase transactions
            return taxCode.CountryCode === 'SG' &&
                !taxCode.IsEC &&
                !taxCode.IsExempt &&
                !taxCode.IsForExport &&
                !taxCode.IsReduced &&
                !taxCode.IsSuperReduced &&
                taxCode.IsService &&
                taxCode.Rate === 0 &&
                taxCode.IsReverseCharge &&
                taxCode.IsForPurchase &&
                taxCode.Parent &&
                !taxCode.DeferredOn &&
                taxCode.IsImport;
        },
        SROVR: function(taxCode) { // Digital Services
            return taxCode.CountryCode === 'SG' &&
                !taxCode.IsEC &&
                !taxCode.IsExempt &&
                !taxCode.IsForExport &&
                !taxCode.IsReduced &&
                !taxCode.IsSuperReduced &&
                !taxCode.IsImport &&
                !taxCode.IsService &&
                taxCode.Rate > 0 &&
                !taxCode.IsReverseCharge &&
                !taxCode.Parent &&
                !taxCode.IsPostNotional &&
                !taxCode.IsDeemedSupply &&
                !taxCode.DeferredOn &&
                taxCode.IsDigitalServices;
        },
    }
};
