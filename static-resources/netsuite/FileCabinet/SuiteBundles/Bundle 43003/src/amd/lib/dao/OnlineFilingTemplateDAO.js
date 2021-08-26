/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', '../base/BaseDAO'], function(error, search, BaseDAO) {

    OnlineFilingTemplateDAO = function() {
        BaseDAO.call(this);
        this.name = 'OnlineFilingTemplateDAO';
        this.recordType = 'customrecord_filing_template';
        this.fields = {
            id: { id: 'internalid' },
            name: { id: 'name' },
            type: { id: 'custrecord_filing_template_type' },
            content: { id: 'custrecord_filing_template_content' }
        };
        this.columns = [];
        this.filters = [];
    }

    util.extend(OnlineFilingTemplateDAO.prototype, BaseDAO.prototype);

    OnlineFilingTemplateDAO.prototype.createSearchFilters = function(params) {
        var filters = [];

        if (params) {
            if (params.id) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.IS,
                    values: params.id
                }));
            }

            if (params.name) {
                filters.push(search.createFilter({
                    name: this.fields.name.id,
                    operator: search.Operator.IS,
                    values: params.name
                }));
            }
        }

        return filters;
    };

    return OnlineFilingTemplateDAO;
});
