/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};


TAF.DAO.PolicyTypeDao = function _PolicyTypeDao() {
    this.getList = _GetList;    
   
    function _GetList() {
    	var result = {
    			revenue: { id: "revenue", name: "Revenue" },
    			expenses: { id: "expenses", name: "Expenses" },
    			journal: { id: "journal", name: "Journal" }
            };
        
        return result;
    }
};
