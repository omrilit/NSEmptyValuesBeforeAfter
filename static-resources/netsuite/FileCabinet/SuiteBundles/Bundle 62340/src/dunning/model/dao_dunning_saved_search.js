/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This DAO retrieves information about the saved searches that are set up for Dunning.
 * The ID of the searches to be used for Dunning are set in the Localization Variable record.
 *
 * @author mmoya
 */

var dao = dao || {};

dao.DunningSavedSearchDAO = function DunningSavedSearchDAO () {
  var systemSavedSearches;

  var LocalizationVariableList = suite_l10n.variable.LocalizationVariableList;

  function getSystemSavedSearches () {
    if (!systemSavedSearches) {
      var systemParams = new LocalizationVariableList('dunning_saved_search');

      systemSavedSearches = systemParams.getAllVariables();
    }

    return systemSavedSearches;
  }

  this.retrieveSavedSearchById = function retrieveSavedSearchByName (searchId) {
    systemSavedSearches = getSystemSavedSearches();

    for (var i in systemSavedSearches) {
      var searchObj = systemSavedSearches[i];

      if (searchId === searchObj.value) {
        return (castAsDunningSavedSearch(i, searchObj, true));
      }
    }
  };

  this.retrieveList = function retrieveAll () {
    var searchArr = [];

    systemSavedSearches = getSystemSavedSearches();

    for (var i in systemSavedSearches) {
      searchArr.push(castAsDunningSavedSearch(i, systemSavedSearches[i], false));
    }

    return searchArr;
  };

  this.retrieveAll = function retrieveAll () {
    var searchArr = [];

    systemSavedSearches = getSystemSavedSearches();

    for (var i in systemSavedSearches) {
      searchArr.push(castAsDunningSavedSearch(i, systemSavedSearches[i], true));
    }

    return searchArr;
  };

  function castAsDunningSavedSearch (searchParam, searchParamObj, isRetrieveColumns) {
    var dunningSavedSearchObj = new dunning.model.DunningSavedSearch();

    var tmpSearch = nlapiLoadSearch(null, searchParamObj.value);

    if (tmpSearch) {
      dunningSavedSearchObj.name = searchParam;

      dunningSavedSearchObj.id = searchParamObj.value;

      dunningSavedSearchObj.internalid = tmpSearch.getId();

      dunningSavedSearchObj.type = tmpSearch.getSearchType();

      if (isRetrieveColumns) {
        dunningSavedSearchObj.searchColumns = getSearchColumns(tmpSearch);
      }
    }

    return dunningSavedSearchObj;
  }

  function getSearchColumns (searchObj) {
    var columns = [];

    if (searchObj) {
      var searchColObjArr = searchObj.getColumns();

      if (searchColObjArr) {
        for (var i in searchColObjArr) {
          var col = new dunning.model.DunningSavedSearchColumn();

          col.id = searchColObjArr[i].getName();

          col.join = searchColObjArr[i].getJoin();

          col.label = searchColObjArr[i].getLabel();

          columns.push(col);
        }
      }
    }

    return columns;
  }
};
