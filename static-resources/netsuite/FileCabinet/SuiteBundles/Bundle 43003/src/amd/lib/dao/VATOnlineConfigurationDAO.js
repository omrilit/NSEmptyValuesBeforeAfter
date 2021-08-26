/**
 * Copyright � 2019, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', '../base/BaseDAO'], function(error, search, BaseDAO) {

    VATOnlineConfigurationDAO = function() {
        BaseDAO.call(this);
        this.name = 'VATOnlineConfigurationDAO';
        this.recordType = 'customrecord_tax_return_setup_item';
        this.fields = {
            id: { id: 'internalid' },
            countryCode: { id: 'custrecord_vat_cfg_country' },
            subsidiary: { id: 'custrecord_vat_cfg_subsidiary' },
            configName: { id: 'custrecord_vat_cfg_name' },
			configType: { id: 'custrecord_vat_cfg_type' },
            value: { id: 'custrecord_vat_cfg_value' }
        };
        this.columns = [];
        this.filters = [];
    }

    util.extend(VATOnlineConfigurationDAO.prototype, BaseDAO.prototype);

    VATOnlineConfigurationDAO.prototype.createSearchFilters = function(params) {
        var filters = [];

        if (params) {
            if (params.id) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.IS,
                    values: params.id
                }));
            }
            
            if (params.countryCode) {
                filters.push(search.createFilter({
                    name: this.fields.countryCode.id,
                    operator: search.Operator.IS,
                    values: params.countryCode
                }));
            }
            
            if (params.subsidiary) {
                filters.push(search.createFilter({
                    name: this.fields.subsidiary.id,
                    operator: search.Operator.IS,
                    values: params.subsidiary
                }));
            }
            
            if (params.configName) {
                filters.push(search.createFilter({
                    name: this.fields.configName.id,
                    operator: search.Operator.IS,
                    values: params.configName
                }));
            }
            
            if (params.configType) {
                filters.push(search.createFilter({
                    name: this.fields.configType.id,
                    operator: search.Operator.IS,
                    values: params.configType
                }));
            }
        }
        return filters;
    };

    return VATOnlineConfigurationDAO;
});
