/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.TaskListConverter = function TaskListConverter () {
  var TaskListView = view.TaskList;
  var TaskListModel = model.TaskList;

  function getAsView (model) {
    var view = new TaskListView();

    for (var i in model) {
      view[i] = model[i];
    }

    var startDate = nlapiStringToDate(view.startDate);
    // Dependent on nlapi code
    if (startDate instanceof Date) {
      view.startTime = startDate.getHours() + '' + startDate.getMinutes();
    }

    return view;
  }

  function getAsModel (view) {
    var model = new TaskListModel();

    for (var i in view) {
      model[i] = view[i];
    }

    return model;
  }

  return {
    getAsView: getAsView,
    getAsModel: getAsModel
  };
};
