/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningLevelEvaluationService = function (evaluatorClass) {
  var DunningLevelDAO = dao.DunningLevelDAO;
  var DunningLevelConverter = dunning.app.DunningLevelConverter;

  function sortLevelsByName (firstLevel, secondLevel) {
    var firstLineNum = firstLevel ? Number(firstLevel.name) : 0;
    var secondLineNum = secondLevel ? Number(secondLevel.name) : 0;
    return firstLineNum - secondLineNum;
  }

  function getDunningLevels (procedureId) {
    var daoDunningLevel = new DunningLevelDAO();
    var levels = daoDunningLevel.retrieveByProcedure(procedureId) || [];

    var dunningLevelConverter = new DunningLevelConverter();
    levels = dunningLevelConverter.castToMultipleViews(levels);

    levels.sort(sortLevelsByName);

    return levels;
  }

  this.processRequest = function processRequest (request) {
    request.dunningLevels = getDunningLevels(request.procedure);
    var evaluator = new evaluatorClass();
    return evaluator.evaluateDunningLevel(request);
  };
};
