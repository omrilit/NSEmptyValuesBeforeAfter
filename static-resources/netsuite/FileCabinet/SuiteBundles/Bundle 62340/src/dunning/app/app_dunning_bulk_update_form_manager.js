/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningBulkUpdateFormManager = function DunningBulkUpdateFormManager () {
  this.generateForm = function generateForm () {
    var locale = ns_wrapper.context().getUserLanguage();
    var translator = new ns_wrapper.Translator(locale);

    var formDefinition = createFormDefinition(translator);

    var formGen = new dunning.app.DunningBulkUpdateFormGenerator();
    return formGen.generateForm(formDefinition);
  };

  function createFormDefinition (translator) {
    var formDefinitionCreator = new dunning.app.DunningBulkUpdateFormDefinitionCreator(translator);
    return formDefinitionCreator.createFormDefinition();
  }
};
