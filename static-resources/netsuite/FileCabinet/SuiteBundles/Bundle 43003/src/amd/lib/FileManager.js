/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', './dao/FileDAO', './dao/FolderDAO'], function(error, FileDAO, FolderDAO) {
    var FileManager = function() {
        this.name = 'FileManager';
        this.fileDAO = new FileDAO();
        this.folderDAO = new FolderDAO();
    };

    FileManager.prototype.createFolder = function(folderName, parent) {
        var params = {
            name: folderName
        };
        if (parent) {
            params.parent = parent;
        }
        return this.folderDAO.create(params);
    }

    FileManager.prototype.getFolder = function(params) {
        var folderList = this.folderDAO.getList(params);
        var folder = folderList && folderList.length > 0 ? folderList[0] : null;
        return folder;
    };

    FileManager.prototype.getFolderByName = function(folderName) {
        return this.getFolder({ name: folderName });
    };

    FileManager.prototype.getFolderById = function(internalId) {
        return this.getFolder({ id: internalId });
    };

    FileManager.prototype.getFileByName = function(fileName) {
        return this.getFile({ name: fileName });
    };

    FileManager.prototype.getFileById = function(internalId) {
        return this.getFile({ id: internalId });
    };

    FileManager.prototype.getFile = function(params) {
        var fileList = this.fileDAO.getList(params);
        var file = fileList && fileList.length > 0 ? fileList[0] : null;
        return file;
    };

    return FileManager;
});