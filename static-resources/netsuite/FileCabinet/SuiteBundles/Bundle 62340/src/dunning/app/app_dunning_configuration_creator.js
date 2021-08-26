/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningConfigurationCreator = function DunningConfigurationCreator () {
  var subsManager = new dunning.app.DunningConfigurationInstallationManager();

  this.createSubsidiaryConfiguration = function createSubsidiaryConfiguration () {
    var subsList = subsManager.getSubsToConfigure();
    var recordIds = [];

    for (var i = 0; i < subsList.length; i++) {
      var subsidiaryId = subsList[i];
      var model = new dunning.model.DunningConfiguration();
      var dcDAO = new dao.DunningConfigurationDAO();

      model.subsidiary = subsidiaryId;

      recordIds.push(dcDAO.create(model));
    }

    // just return even if this will have no use
    return recordIds;
  };

  this.createSIConfiguration = function createSIConfiguration (subsidiaryId) {
    var subsList = subsManager.getSubsidiariesWithConfig();

    if (subsList.length === 0) {
      var model = new dunning.model.DunningConfiguration();
      var dcDAO = new dao.DunningConfigurationDAO();

      model.subsidiary = subsidiaryId;

      return dcDAO.create(model);
    }
  };
};
