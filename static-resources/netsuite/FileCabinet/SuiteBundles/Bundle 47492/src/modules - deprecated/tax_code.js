/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

module('modules/tax_code', function (exports) {
    exports.getTaxType = function getTaxType(taxcode, taxDefinitions) {
        for (var i in taxDefinitions) {
            if (taxDefinitions[i](taxcode)) {
				return i;
			}
        }

        return undefined;
    };	
});