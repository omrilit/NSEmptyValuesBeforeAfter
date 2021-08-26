/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 18 Oct 2016 jcera
 * 
 * dependencies psa_prm.serverlibrary
 * 
 */
var PRM = PRM || {};
PRM.Service = PRM.Service || {};

PRM.Service.ServiceItemService = function(serverLib) {

    this.serverLib = serverLib;
    
    this.searchServiceItems = function() {
        var items = [];
        var search = new this.serverLib.Search('item', 'customsearch_prm_service_items_list');
        var searchResults = search.getAllResults();
        for (var i = 0; i < searchResults.length; i++) {
            items.push({
                id : searchResults[i].getValue('internalid'),
                name : searchResults[i].getValue('name')
            });
        }
        return items;
    };

};
