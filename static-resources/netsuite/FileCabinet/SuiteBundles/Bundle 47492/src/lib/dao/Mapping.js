/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};


TAF.DAO.Mapping = function _Mapping(id) {
    return {
        id: id,
        category: null,
        key: '',
        key_text: '',
        value: null,
        value_text: '',
        value_name: '',
        grouping_code: '',
		subsidiary: ''
    };
};
