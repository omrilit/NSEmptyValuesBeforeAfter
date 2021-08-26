/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.AE = VAT.AE || {
    CountryCode: 'AE',
    TaxCodeDefs: {
        'ZS-GCC': function(taxcode)
        {
            return taxcode.CountryCode == 'AE' &&
                taxcode.IsGCCState &&
                !taxcode.IsEC &&
                !taxcode.IsExempt &&
                !taxcode.IsForExport &&
                taxcode.IsReverseCharge &&
                !taxcode.IsReduced &&
                !taxcode.IsSuperReduced &&
                !taxcode.IsImport &&
                !taxcode.IsService &&
                taxcode.IsForSales &&
                taxcode.Rate == 0;
        },
        S: function(taxcode)
        {
            return taxcode.CountryCode == 'AE' &&
                !taxcode.IsEC &&
                !taxcode.IsExempt &&
                !taxcode.IsForExport &&
                !taxcode.IsReverseCharge &&
                !taxcode.IsReduced &&
                !taxcode.IsSuperReduced &&
                !taxcode.IsImport &&
                !taxcode.IsService &&
                taxcode.Rate == 5;
        },

        RCP: function(taxcode)
        {
            return taxcode.CountryCode == 'AE' &&
                !taxcode.IsEC &&
                !taxcode.IsExempt &&
                !taxcode.IsForExport &&
                taxcode.IsReverseCharge &&
                !taxcode.IsReduced &&
                !taxcode.IsSuperReduced &&
                !taxcode.IsImport &&
                !taxcode.IsService &&
                taxcode.IsForPurchase &&
                taxcode.Rate == 0;
        },

        RC: function(taxcode)
        {
            return taxcode.CountryCode == 'AE' &&  
                !taxcode.IsEC &&
                !taxcode.IsExempt &&
                !taxcode.IsForExport &&
                taxcode.IsReverseCharge &&
                !taxcode.IsReduced &&
                !taxcode.IsSuperReduced &&
                !taxcode.IsImport &&
                !taxcode.IsService &&
                taxcode.IsForSales &&
                taxcode.Rate == 0;
        },

        IMZ: function(taxcode)
        {
            return taxcode.CountryCode == 'AE' &&
                !taxcode.IsEC &&
                !taxcode.IsExempt &&
                !taxcode.IsForExport &&
                taxcode.IsReverseCharge &&
                !taxcode.IsReduced &&
                !taxcode.IsSuperReduced &&
                taxcode.IsImport &&
                !taxcode.IsService &&
                taxcode.IsForPurchase &&
                taxcode.Rate == 0;
        },

        IMS: function(taxcode)
        {
            return taxcode.CountryCode == 'AE' &&
                !taxcode.IsEC &&
                !taxcode.IsExempt &&
                !taxcode.IsForExport &&
                taxcode.IsReverseCharge &&
                !taxcode.IsReduced &&
                !taxcode.IsSuperReduced &&
                taxcode.IsImport &&
                taxcode.IsService &&
                taxcode.IsForPurchase &&
                taxcode.Rate == 0;
        },

        IMG: function(taxcode)
        {
            return taxcode.CountryCode == 'AE' &&
                !taxcode.IsEC &&
                !taxcode.IsExempt &&
                !taxcode.IsForExport &&
                !taxcode.IsReverseCharge &&
                !taxcode.IsReduced &&
                !taxcode.IsSuperReduced &&
                taxcode.IsImport &&
                !taxcode.IsService &&
                taxcode.IsForPurchase &&
                taxcode.Rate == 5;
        },

        EX: function(taxcode)
        {
            return taxcode.CountryCode == 'AE' &&
            !taxcode.IsEC &&
            !taxcode.IsExempt &&
            taxcode.IsForExport &&
            !taxcode.IsReverseCharge &&
            !taxcode.IsReduced &&
            !taxcode.IsSuperReduced &&
            !taxcode.IsImport &&
            !taxcode.IsService &&
            taxcode.IsForSales &&
            taxcode.Rate == 0;
        },

        Z: function(taxcode)
        {
            return taxcode.CountryCode == 'AE' &&
                !taxcode.IsEC &&
                !taxcode.IsExempt &&
                !taxcode.IsForExport &&
                !taxcode.IsReverseCharge &&
                !taxcode.IsReduced &&
                !taxcode.IsSuperReduced &&
                !taxcode.IsImport &&
                !taxcode.IsService &&
                taxcode.Rate == 0;
        },

        X: function(taxcode)
        {
            return taxcode.CountryCode == 'AE' &&
                !taxcode.IsEC &&
                taxcode.IsExempt &&
                !taxcode.IsForExport &&
                !taxcode.IsReverseCharge &&
                !taxcode.IsReduced &&
                !taxcode.IsSuperReduced &&
                !taxcode.IsImport &&
                !taxcode.IsService &&
                taxcode.Rate == 0;
        },

        // Add other tax codes as needed
    }
};
