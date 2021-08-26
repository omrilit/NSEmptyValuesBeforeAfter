/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningResumptionHandler = function DunningResumptionHandler (pauseFieldId, procedureFieldId) {
  if (!pauseFieldId || !procedureFieldId) {
    throw new Error('DunningResumptionHandler requires the dunning paused and dunning procedure field IDs as constructor parameters');
  }

  var getFieldValue = ns_wrapper.api.field.getFieldValue;
  var messageHandler = new suite_l10n.message.MessageHandler();
  var isInitiallyPaused = isPaused();
  var VALIDATE_UNPAUSE = 'dp.validate.unpause';
  var messages;

  function getResumeDunningMessage () {
    loadMessages();
    return messages[VALIDATE_UNPAUSE];
  }

  function confirmResumeDunning () {
    var isValid = messageHandler.showConfirmationMessage(getResumeDunningMessage());
    isInitiallyPaused = !isValid;
    return isValid;
  }

  function isPaused () {
    return pauseFieldId && getFieldValue(pauseFieldId) === 'T';
  }

  function checkProcedure () {
    var procedure = getFieldValue(procedureFieldId);
    return procedure && procedure != '';
  }

  function loadMessages () {
    if (!messages) {
      var stringCodes = [VALIDATE_UNPAUSE];

      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);

      messages = messageLoader.getMessageMap();
    }
  }

  this.handleResumption = function handleResumption () {
    var isValid = true;
    var paused = isPaused();
    var hasProcedure = checkProcedure();

    if (hasProcedure && isInitiallyPaused && !paused) {
      isValid = confirmResumeDunning();
    } else if (!hasProcedure) {
      isInitiallyPaused = false;
    }

    return isValid;
  };
};
