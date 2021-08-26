/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This workflow action script evaluates the role if the current logged in user
 * if based on the roles available for the Dunning Letters feature
 *
 * @author cboydon
 */

var dunning = dunning || {};
dunning.comp = dunning.comp || {};
dunning.comp.wf = dunning.comp.wf || {};

dunning.comp.wf.DunningRoleEvaluator = function () {
  this.isRoleForDunning = isRoleForDunning;
  this.retrieveDunningRole = retrieveDunningRole;

  function isRoleForDunning () {
    var isDunningRole = 'F';

    var dunningRoleVerifier = new dunning.app.DunningRoleVerifier();
    if (dunningRoleVerifier.isRoleForDunning()) {
      isDunningRole = 'T';
    }
    return isDunningRole;
  }

  function retrieveDunningRole () {
    var dunningRoleAssessor = new dunning.app.DunningRoleAssessor();
    return dunningRoleAssessor.retrieveDunningRole();
  }
};

dunning.comp.wf.isRoleForDunning = function isRoleForDunning () {
  var assessor = new dunning.comp.wf.DunningRoleEvaluator();
  return assessor.isRoleForDunning();
};

dunning.comp.wf.retrieveDunningRole = function retrieveDunningRole () {
  var evaluator = new dunning.comp.wf.DunningRoleEvaluator();
  return evaluator.retrieveDunningRole();
};
