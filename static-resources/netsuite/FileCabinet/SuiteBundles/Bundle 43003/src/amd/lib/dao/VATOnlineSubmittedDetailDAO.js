/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', '../base/BaseDAO'], function(error, search, BaseDAO) {

    var VATOnlineSubmittedDetailDAO = function() {
        BaseDAO.call(this);
        this.name = 'VATOnlineSubmittedDetailDAO';
        this.recordType = 'customrecord_vatonline_detail';
        this.fields = {
            id: { id: 'internalid' },
            parent: { id: 'custrecord_online_filing' },
            content: { id: 'custrecord_submitted_content' },
            salesDetails: { id: 'custrecord_sales_details' },
            purchaseDetails: { id: 'custrecord_purch_detail' }
        };
        this.columns = [];
        this.filters = [];
    }

    util.extend(VATOnlineSubmittedDetailDAO.prototype, BaseDAO.prototype);

    VATOnlineSubmittedDetailDAO.prototype.createSearchFilters = function(params) {
        var filters = [];
        if (params) {
            if (params.id) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.IS,
                    values: params.id
                }));
            }
            if (params.parent) {
                filters.push(search.createFilter({
                    name: this.fields.parent.id,
                    operator: search.Operator.IS,
                    values: params.parent
                }));
            }
        }
        return filters;
    };

    return VATOnlineSubmittedDetailDAO;
});
