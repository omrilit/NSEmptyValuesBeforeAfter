/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.SubList = function SubList (nlSubList, data) {
  var obj = {
    name: data.name,
    label: data.label,
    addField: addNSField,
    setValues: setValues,
    addMarkAllButtons: addMarkAllButtons,
    addButton: addButton
  };

  var fields = {};

  function addNSField (fieldModel) {
    var field = nlSubList.addField(fieldModel.name, fieldModel.type, fieldModel.label, fieldModel.source);

    fields[fieldModel.name] = new ns_wrapper.Field(field, fieldModel);

    return fields[fieldModel.name];
  }

  function setValues (values) {
    nlSubList.setLineItemValues(values);
  }

  function addMarkAllButtons () {
    nlSubList.addMarkAllButtons();
  }

  function addButton (buttonModel) {
    var button = nlSubList.addButton(buttonModel.name, buttonModel.label, buttonModel.script);

    return new ns_wrapper.Button(button, buttonModel);
  }

  return obj;
};
