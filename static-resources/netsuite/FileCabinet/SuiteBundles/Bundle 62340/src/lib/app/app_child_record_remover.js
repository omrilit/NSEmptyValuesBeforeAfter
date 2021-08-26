/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.ChildRecordRemover = function ChildRecordRemover (setting) {
  var deleteRecord = ns_wrapper.api.record.deleteRecord;
  var submitField = ns_wrapper.api.field.submitField;

  function removeBySearch () {
    var search = getChildRecordSearch(setting);
    var rs = search.getIterator();

    while (rs.hasNext()) {
      var res = rs.next();
      var values = (res.getValue(setting.parentFieldId) || '').split(',');

      values.splice(values.indexOf(setting.record.getId()), 1);
      if (values.join('').length > 0) {
        submitField(setting.childRecordType, res.getId(), setting.parentFieldId, values);
      } else {
        deleteRecord(setting.childRecordType, res.getId());
      }
    }
  }

  function getChildRecordSearch () {
    var searchDefinition = new suite_l10n.view.Search();
    searchDefinition.type = setting.childRecordType;

    var parentColumn = new suite_l10n.view.SearchColumn();
    parentColumn.name = setting.parentFieldId;
    searchDefinition.columns.push(parentColumn);

    var parentFilter = new suite_l10n.view.SearchFilter();
    parentFilter.name = setting.parentFieldId;
    parentFilter.operator = 'anyof';
    var record = setting.record;
    parentFilter.value = record.getId();
    searchDefinition.filters.push(parentFilter);

    var searchBuilder = new suite_l10n.app.SearchBuilder(searchDefinition);
    return searchBuilder.buildSearch();
  }

  this.removeChildren = function removeChildren () {
    removeBySearch();
  };
};
