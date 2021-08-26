/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([], function() {

    var ImportFileAdapter = function(context) {
        this.name = 'ImportFileAdapter';
    };

    ImportFileAdapter.prototype.transform = function(params) {
        return {
            vatDueSales: params.fileData['BOX 1'],
            vatDueAcquisitions: params.fileData['BOX 2'],
            totalVatDue: params.fileData['BOX 3'],
            vatReclaimedCurrPeriod: params.fileData['BOX 4'],
            netVatDue: params.fileData['BOX 5'],
            totalValueSalesExVAT: params.fileData['BOX 6'],
            totalValuePurchasesExVAT: params.fileData['BOX 7'],
            totalValueGoodsSuppliedExVAT: params.fileData['BOX 8'],
            totalAcquisitionsExVAT: params.fileData['BOX 9']
        };
    };

    return ImportFileAdapter;
});
