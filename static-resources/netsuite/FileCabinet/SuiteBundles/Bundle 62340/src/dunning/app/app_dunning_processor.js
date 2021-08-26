/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningProcessor = function DunningProcessor (task) {
  var DunningMessage = dunning.model.DunningMessage;
  var ViewDunningMessageInput = dunning.view.ViewDunningMessageInput;

  var dunningMessages;
  var taskObjects = task.objects;
  var sourceDAO = taskObjects.sourceDAO;
  var source = taskObjects.source;
  var sendDate = taskObjects.sendDate;
  var dunningTemplate = taskObjects.template;
  var dunningTemplateText = dunningTemplate.getDunningTemplateTexts(source.language);

  function renderString (renderer, template, dataContainer) {
    renderer.setTemplate(template);
    renderer.addDataSource(dataContainer.recordType, dataContainer.source);
    return renderer.renderToString();
  }

  function generateDunningMessage (dataContainer) {
    var input = new ViewDunningMessageInput();
    input.dunningManager = dataContainer.dunningManager;
    input.email = dataContainer.email;
    input.subject = renderString(taskObjects.renderer, dunningTemplateText.subject, dataContainer);
    input.body = renderString(taskObjects.renderer, dunningTemplateText.bodyText, dataContainer);
    input.sendDate = sendDate;
    input.source = dataContainer.source;

    var recordAttachments = {};
    recordAttachments['entity'] = dataContainer.id;
    input.recordAttachments = recordAttachments;

    return new DunningMessage(input);
  }

  function getContactMessages () {
    var messages = [];
    var dunnableContacts = sourceDAO.getDunnableContacts(source);

    for (var i = 0; i < dunnableContacts.length; i++) {
      messages.push(generateDunningMessage(dunnableContacts[i]));
    }

    return messages;
  }

  function getDunningMessages () {
    if (!dunningMessages) {
      dunningMessages = [generateDunningMessage(source)].concat(getContactMessages());
    }
    return dunningMessages;
  }

  function getEmailList () {
    var messages = getDunningMessages();
    var mailList = [];

    for (var i = 0; i < messages.length; i++) {
      mailList.push(messages[i].getEmail());
    }

    return mailList;
  }

  function getLetterList () {
    var dunningMessages = getDunningMessages();
    var messages = [];

    for (var i = 0; i < dunningMessages.length; i++) {
      messages.push(dunningMessages[i].getBody());
    }

    return messages;
  }

  return {
    getEmailList: getEmailList,
    getLetterList: getLetterList
  };
};
