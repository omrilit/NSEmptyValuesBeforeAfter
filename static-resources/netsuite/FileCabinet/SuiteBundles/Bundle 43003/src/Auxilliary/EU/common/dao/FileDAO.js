/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.FileDAO = function FileDAO() {
    VAT.EU.DAO.RecordSearchDAO.call(this);
    this.daoName = 'FileDAO';
    this.recordType = 'file';
    
    this.DEFAULT = {
        FILE_TYPE: 'PLAINTEXT',
        ENCODING : 'UTF-8'
    };
};

VAT.EU.DAO.FileDAO.prototype = Object.create(VAT.EU.DAO.RecordSearchDAO.prototype);

VAT.EU.DAO.FileDAO.prototype.prepareSearch = function prepareSearch(params) {
    this.columns = [
        new nlobjSearchColumn('name'),
        new nlobjSearchColumn('folder'),
        new nlobjSearchColumn('description'),
        new nlobjSearchColumn('url')
    ];
    
    if (params.name) {
        this.filters.push(new nlobjSearchFilter('name', null, 'is', params.name));
    }
    
    if (params.internalid) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.internalid));
    }
};

VAT.EU.DAO.FileDAO.prototype.ListObject = function listObject(id) {
    return {
        id: id,
        name: '',
        folder: '',
        description: '',
        url: ''
    };
};

VAT.EU.DAO.FileDAO.prototype.rowToObject = function rowToObject(row) {
    var obj = new this.ListObject(row.getId());
    obj.name = row.getValue('name');
    obj.folder = row.getValue('folder');
    obj.description = row.getValue('description');
    obj.url = row.getValue('url');
    
    return obj;
};

VAT.EU.DAO.FileDAO.prototype.createFile = function _createFile(params) {
    try {
        var fileType = params.fileType || this.DEFAULT.FILE_TYPE;
        var encoding = params.encoding || this.DEFAULT.ENCODING;
        var fileObj = nlapiCreateFile(params.fileName, fileType, params.content);
        fileObj.setFolder(params.folderId);
        fileObj.setEncoding(encoding);
        
        return nlapiSubmitFile(fileObj);
    } catch (ex) {
        logException(ex, 'VAT.EU.DAO.FileDAO.createFile');
        throw nlapiCreateError('EU_ERROR_CREATE_FILE', 'Unable to create file');
    }    
};

VAT.EU.DAO.FileDAO.prototype.getFileById = function getFileById(fileId) {
    try {
        var file = new this.ListObject(fileId);
        var loadObj = nlapiLoadFile(fileId);
        file.url = loadObj.getURL() || '';
        file.name = loadObj.getName() || '';
        return file;
    } catch (ex) {
        logException(ex, 'VAT.EU.DAO.FileDAO.getFileById');
        throw nlapiCreateError('EU_ERROR_FILE_LOAD', 'Unable to load file');
    }    
};
