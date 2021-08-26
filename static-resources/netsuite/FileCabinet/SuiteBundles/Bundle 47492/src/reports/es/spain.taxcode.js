/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var VAT = VAT || {};
VAT.ES = VAT.ES || {
    CountryCode: 'ES',
    TaxCodeDefs: {
        S: function(taxcode)
        {
            return taxcode.GetCountryCode() == 'ES' &&
                !taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                !taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue('custrecord_4110_reduced_rate') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_super_reduced') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_import') != 'T' &&
                !taxcode.IsService() &&
                taxcode.GetRate() > 0;
        },

        R: function(taxcode)
        {
            return taxcode.GetCountryCode() == 'ES' &&
                !taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                !taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue('custrecord_4110_reduced_rate') == 'T' &&
                taxcode.GetFieldValue('custrecord_4110_super_reduced') != 'T' &&
                !taxcode.IsService() &&
                taxcode.GetFieldValue('custrecord_4110_import') != 'T' &&
                taxcode.GetRate() > 0;
        },

        R2: function(taxcode)
        {
            return taxcode.GetCountryCode() == 'ES' &&
                !taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                !taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue('custrecord_4110_reduced_rate') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_super_reduced') == 'T' &&
                !taxcode.IsService() &&
                taxcode.GetFieldValue('custrecord_4110_import') != 'T' &&
                taxcode.GetRate() > 0;
        },

        RC: function(taxcode)
        {
            return taxcode.GetCountryCode() == 'ES' &&
                !taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue('custrecord_4110_reduced_rate') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_super_reduced') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_import') != 'T' &&
                !taxcode.IsService() &&
                taxcode.GetRate() == 0;
        },

        ES: function(taxcode) // TODO check notional rate derived from
        {
            return taxcode.GetCountryCode() == 'ES' &&
                taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                !taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue('custrecord_4110_reduced_rate') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_super_reduced') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_import') != 'T' &&
                !taxcode.IsService() &&
                taxcode.GetRate() == 0 &&
                !taxcode.Category;
        },

        ER: function(taxcode)
        {
            return taxcode.GetCountryCode() == 'ES' &&
                taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                !taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue('custrecord_4110_reduced_rate') == 'T' &&
                taxcode.GetFieldValue('custrecord_4110_super_reduced') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_import') != 'T' &&
                !taxcode.IsService() &&
                taxcode.GetRate() == 0;
        },

        EZ: function(taxcode) // TODO check notional rate derived from
        {
            return taxcode.GetCountryCode() == 'ES' &&
                taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                !taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue('custrecord_4110_reduced_rate') == 'T' &&
                taxcode.GetFieldValue('custrecord_4110_super_reduced') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_import') != 'T' &&
                !taxcode.IsService() &&
                taxcode.GetRate() == 0 &&
                !taxcode.Category;
        },

        ESSP: function(taxcode)
        {
            return taxcode.GetCountryCode() == 'ES' &&
                taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue('custrecord_4110_reduced_rate') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_super_reduced') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_import') != 'T' &&
                taxcode.IsService() &&
                taxcode.GetRate() == 0;
        },

        ESSS: function(taxcode)
        {
            return taxcode.GetCountryCode() == 'ES' &&
                taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                !taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue('custrecord_4110_reduced_rate') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_super_reduced') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_import') != 'T' &&
                taxcode.IsService() &&
                taxcode.GetRate() == 0;
        },

        EIG: function(taxcode)
        {
            return taxcode.GetCountryCode() == 'ES' &&
                taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                !taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue('custrecord_4110_reduced_rate') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_super_reduced') != 'T' &&
                taxcode.GetFieldValue('custrecord_4110_import') != 'T' &&
                !taxcode.IsService() &&
                taxcode.GetRate() == 0 &&
                taxcode.Category;
        },

        // Add other tax codes as needed
    }
};
