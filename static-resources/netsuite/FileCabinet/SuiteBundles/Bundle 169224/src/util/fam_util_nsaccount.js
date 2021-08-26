/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define([
    '../adapter/fam_adapter_search',
],

function (search){
    var module = {};    
    
    module.getAccountAdminsEmail = function(){
        var accountAdmins = [];
        
        var searchObj = search.load({id:'customsearch_fam_admin_email'}),
            pagedData = searchObj.runPaged({ pageSize : 1000 });
        
        pagedData.pageRanges.forEach(function (pageRange) {
            var page = pagedData.fetch({ index : pageRange.index });
            page.data.forEach(function(searchRes) {
                accountAdmins.push({
                    id : searchRes.id,
                    email : searchRes.getValue('email')
                });
            });
        });
        
        return accountAdmins;
    }
    
    return module;
});
