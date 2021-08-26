/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */ 

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.SearchTask = function _SearchTask(id) {
    return {
        id : id,
        parentTask : '',
        fileId : ''
    };
};

TAF.DAO.SearchTaskDao = function _SearchTaskDao() {
    
};

TAF.DAO.SearchTaskDao.prototype.getFilesByJobId = function _GetByJobId(jobid) {
    var resultFiles = [];
    var columns = [new nlobjSearchColumn('custrecord_taf_st_fileid')];
    var filter = [new nlobjSearchFilter('custrecord_taf_parent4599', 'custrecord_taf_st_parenttask', 'is', jobid)];
    var searchtasksr = nlapiSearchRecord('customrecord_taf_search_task', null, filter, columns);
    
    if(searchtasksr){
        for(var i = 0; i < searchtasksr.length; i++){
            resultFiles.push(searchtasksr[i].getValue('custrecord_taf_st_fileid'));
        }
    }
    
    return resultFiles;
};



