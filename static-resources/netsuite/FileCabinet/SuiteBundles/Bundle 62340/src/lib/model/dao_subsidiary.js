/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.dao = suite_l10n.dao || {};

suite_l10n.dao.SubsidiaryDAO = function SubsidiaryDAO () {
  var RECORD_TYPE = 'subsidiary';
  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);
  var FIELD_MAP = {
    'name': 'name',
    'currency': 'currency'
  };

  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(suite_l10n.model.Subsidiary);

  obj.retrieve = function retrieve (id) {
    var searchDef = new suite_l10n.view.Search();
    searchDef.type = RECORD_TYPE;
    var idFilter = new suite_l10n.view.SearchFilter();
    idFilter.name = 'internalid';
    idFilter.operator = 'is';
    idFilter.value = id;
    searchDef.filters.push(idFilter);

    for (var i in FIELD_MAP) {
      var column = new suite_l10n.view.SearchColumn();
      column.name = FIELD_MAP[i];
      searchDef.columns.push(column);
    }

    var search = new suite_l10n.app.SearchBuilder(searchDef).buildSearch();
    var iterator = search.getIterator();
    var model = null;
    if (iterator.hasNext()) {
      model = obj.castToModel(iterator.next(), true);
    }

    return model;
  };

  obj.loadCurrentSubsidiary = function loadCurrentSubsidiary () {
    var context = ns_wrapper.context();

    return obj.retrieve(context.getSubsidiary());
  };

  return obj;
};
