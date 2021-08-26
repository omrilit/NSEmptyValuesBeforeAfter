/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningProcedureConverter = function DunningProcedureConverter () {
  var obj = {
    castToModel: castToModel,
    castToView: castToView,
    castToMultipleViews: castToMultipleViews,
    castToMultipleModels: castToMultipleModels
  };

  var DunningProcedureModel = dunning.model.DunningProcedure;
  var DunningProcedureView = dunning.view.DunningProcedure;

  function castToModel (view) {
    var model = new DunningProcedureModel();

    // Not looping here, we only need a small amount of information for now
    model.id = view.id;
    model.description = view.description;
    model.dunningSource = view.dunningSource;
    model.sendingSchedule = view.sendingSchedule;
    model.daysBetweenSendingLetters = view.daysBetweenSendingLetters;
    model.subsidiaries = view.subsidiaries;
    model.savedSearchCustomer = view.savedSearchCustomer;
    model.weighting = view.weighting;
    model.allowOverride = view.allowOverride;
    model.departments = view.departments;
    model.classes = view.classes;
    model.locations = view.locations;
    model.preferredLanguage = view.preferredLanguage;
    model.assignAutomatically = view.assignAutomatically;

    return model;
  }

  function castToView (model) {
    var view = new DunningProcedureView();

    // Not looping here, we only need a small amount of information for now
    view.id = model.id;
    view.description = model.description;
    view.dunningSource = model.dunningSource;
    view.sendingSchedule = model.sendingSchedule;
    view.daysBetweenSendingLetters = model.daysBetweenSendingLetters;
    view.subsidiaries = model.subsidiaries;
    view.savedSearchCustomer = model.savedSearchCustomer;
    view.weighting = model.weighting;
    view.allowOverride = model.allowOverride;
    view.departments = model.departments;
    view.classes = model.classes;
    view.locations = model.locations;
    view.preferredLanguage = model.preferredLanguage;
    view.assignAutomatically = model.assignAutomatically;

    return view;
  }

  function castToMultipleViews (models) {
    var views = [];

    for (var i = 0; i < models.length; i++) {
      views.push(obj.castToView(models[i]));
    }

    return views;
  }

  function castToMultipleModels (views) {
    var models = [];

    for (var i = 0; i < views.length; i++) {
      models.push(obj.castToModel(views[i]));
    }

    return models;
  }

  return obj;
};
