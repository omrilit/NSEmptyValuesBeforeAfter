/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var suite_l10n = suite_l10n || {};
suite_l10n.dao = suite_l10n.dao || {};

suite_l10n.dao.FolderDAO = function FolderDAO () {
  var RECORD_TYPE = 'folder';
  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);

  var FIELD_MAP = {
    'name': 'name',
    'parent': 'parent'
  };

  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(suite_l10n.model.Folder);

  function getFolderByNameAndParent (folderName, parent) {
    var searchDef = new suite_l10n.view.Search();
    searchDef.type = RECORD_TYPE;

    var nameFilter = new suite_l10n.view.SearchFilter();
    nameFilter.name = 'name';
    nameFilter.operator = 'is';
    nameFilter.value = folderName;
    searchDef.filters.push(nameFilter);

    var parentFilter = new suite_l10n.view.SearchFilter();
    parentFilter.name = 'parent';
    if (parent) {
      parentFilter.operator = 'is';
      parentFilter.value = parent;
    } else {
      parentFilter.operator = 'isempty';
      parentFilter.value = null;
    }
    searchDef.filters.push(parentFilter);

    var column = new suite_l10n.view.SearchColumn();
    column.name = 'internalid';
    searchDef.columns.push(column);

    var search = new suite_l10n.app.SearchBuilder(searchDef).buildSearch();
    var it = search.getIterator();
    var folderId = null;

    if (it && it.hasNext()) {
      var r = it.next();
      folderId = r.getValue('internalid');
    }
    return obj.retrieve(folderId);
  }

  obj.getFolderByNameAndParent = getFolderByNameAndParent;

  return obj;
};
