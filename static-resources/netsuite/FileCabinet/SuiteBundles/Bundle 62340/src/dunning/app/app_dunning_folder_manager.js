/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningFolderManager = function DunningFolderManager () {
  var HOME_FOLDER_NAME;
  var DUNNING_HOME_FOLDER = 'DUNNING_HOME_FOLDER_NAME';
  var folderDAO = new suite_l10n.dao.FolderDAO();

  this.getHomeFolderName = function getHomeFolderName () {
    if (!HOME_FOLDER_NAME) {
      var LABEL_TYPE = 'label_type';
      var labels = new suite_l10n.variable.LocalizationVariableList(LABEL_TYPE);
      HOME_FOLDER_NAME = labels.getValue(DUNNING_HOME_FOLDER);
    }
    return HOME_FOLDER_NAME;
  };

  this.createDunningLetterHomeFolder = function createDunningLetterHomeFolder () {
    try {
      var folder = new suite_l10n.model.Folder();
      folder.name = this.getHomeFolderName();
      return folderDAO.create(folder);
    } catch (e) {
      nlapiLogExecution('ERROR', 'DUNNING_HOME_FOLDER_CREATION_ERROR', 'An error has occured in creating dunning letters home folder in the file cabinet. Details: ' + JSON.stringify(e));
    }
  };

  this.createPDFLetterSubfolder = function createPDFLetterSubfolder (parentFolder, folderName) {
    try {
      var folder = new suite_l10n.model.Folder();
      folder.name = folderName;
      folder.parent = parentFolder;
      return folderDAO.create(folder);
    } catch (e) {
      nlapiLogExecution('ERROR', 'DUNNING_PDF_SUBFOLDER_CREATION_ERROR', 'An error has occured in creating dunning letters pdf subfolder in the file cabinet. Details: ' + JSON.stringify(e));
    }
  };

  this.getDunningLetterHomeFolderId = function getDunningLetterHomeFolderId () {
    var folder = folderDAO.getFolderByNameAndParent(this.getHomeFolderName());
    var folderId = null;
    if (folder) folderId = folder.id;
    return folderId;
  };

  this.getPDFLetterSubfolderId = function getPDFLetterSubfolderId (parentFolder, folderName) {
    var folder = folderDAO.getFolderByNameAndParent(folderName, parentFolder);
    var folderId = null;
    if (folder) folderId = folder.id;
    return folderId;
  };
};
