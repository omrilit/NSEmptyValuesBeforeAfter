/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/// <reference path="suitescript.js" />
var VAT = VAT || {};
VAT.PT = VAT.PT || {
    CountryCode: "PT",
    TaxCodeDefs: {
        S: function(taxcode) //Standard
        {
            return taxcode.GetCountryCode() == "PT" &&
                !taxcode.IsEC() &&
                !taxcode.IsExempt() &&
                !taxcode.IsForExport() &&
                !taxcode.IsReverseCharge() &&
                taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
                taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
                taxcode.GetFieldValue("custrecord_4110_import") != "T" &&
                !taxcode.IsService() &&
                taxcode.GetRate() > 0;
        },

        ST: function(taxcode) //Special Territory
        {
            return taxcode.GetCountryCode() == "PT" &&
				!taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				!taxcode.IsForExport() &&
				!taxcode.IsReverseCharge() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T" &&
				!taxcode.IsService() &&
				taxcode.GetFieldValue("custrecord_4110_special_territory") == "T" &&  //<< Key Property
				taxcode.GetRate() > 0;
        },

        R: function(taxcode) //Reduced
        {
            return taxcode.GetCountryCode() == "PT" &&
				!taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				!taxcode.IsForExport() &&
				!taxcode.IsReverseCharge() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") == "T" &&       //<< Key Property
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				!taxcode.IsService() &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T";
        },

        R2: function(taxcode) //Intermediate
        {
            return taxcode.GetCountryCode() == "PT" &&
				!taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				!taxcode.IsForExport() &&
				!taxcode.IsReverseCharge() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") == "T" &&      //<< Key Property
				!taxcode.IsService() &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T";
        },

        Z: function(taxcode) //Zero
        {
            return taxcode.GetCountryCode() == "PT" &&
				!taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				!taxcode.IsForExport() &&
				!taxcode.IsReverseCharge() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T" &&
				!taxcode.IsService() &&
				taxcode.GetRate() == 0;  //<< Key Property
        },

        E: function(taxcode) //Exempt
        {
            return taxcode.GetCountryCode() == "PT" &&
				!taxcode.IsEC() &&
				taxcode.IsExempt() &&
				!taxcode.IsForExport() &&
				!taxcode.IsReverseCharge() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				!taxcode.IsService() &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T";
        },

        ES: function(taxcode) //EC Standard
        {
            return taxcode.GetCountryCode() == "PT" &&
				taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				!taxcode.IsForExport() &&
				!taxcode.IsReverseCharge() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T" &&
				!taxcode.IsService() &&
				taxcode.NotionalRate > 0;
        },

        ER: function(taxcode) //EC Reduced
        {
            return taxcode.GetCountryCode() == "PT" &&
				taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				!taxcode.IsForExport() &&
				!taxcode.IsReverseCharge() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") == "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T" &&
				!taxcode.IsService();
        },

        EZ: function(taxcode) //EC Zero
        {
            return taxcode.GetCountryCode() == "PT" &&
				taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				!taxcode.IsForExport() &&
				!taxcode.IsReverseCharge() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T" &&
				!taxcode.IsService() &&
				taxcode.NotionalRate == 0;
        },

        ESSP: function(taxcode)
        {
            return taxcode.GetCountryCode() == "PT" &&
				taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				!taxcode.IsForExport() &&
				taxcode.IsReverseCharge() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T" &&
				taxcode.IsService();
        },

        ESSS: function(taxcode)
        {
            return taxcode.GetCountryCode() == "PT" &&
				taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				!taxcode.IsForExport() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T" &&
				taxcode.IsService();
        },

        O: function(taxcode) //Export
        {
            return taxcode.GetCountryCode() == "PT" &&
				!taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				taxcode.IsForExport() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T" &&
				!taxcode.IsService();
        },

        OS: function(taxcode) //Export Service
        {
            return taxcode.GetCountryCode() == "PT" &&
				!taxcode.IsEC() &&
				!taxcode.IsExempt() &&
				taxcode.IsForExport() &&
				taxcode.GetFieldValue("custrecord_4110_reduced_rate") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_super_reduced") != "T" &&
				taxcode.GetFieldValue("custrecord_4110_import") != "T" &&
				taxcode.IsService();
        }
    }
};
