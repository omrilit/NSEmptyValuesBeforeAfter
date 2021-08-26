/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * Validates dunning customer and its contacts
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.ENTITY_PROCEDURE = 'custentity_3805_dunning_procedure';
dunning.app.ENTITY_EMAIL = 'custentity_3805_dunning_letters_toemail';

dunning.app.DunningCustomerValidator = function DunningCustomerValidator (useServerSideMsgLoader) {
  var messages;
  var contacts = [];
  var MESSAGE_RECIPIENTS_NO_EMAIL = 'dc.validateCustomer.recipientNoEmail'; // DC0001
  var MESSAGE_CUSTOMER_NO_EMAIL = 'dc.validateCustomer.customerNoEmail';// DC0002
  var MESSAGE_NO_EMAIL_AT_ALL = 'dc.validateCustomer.noEmailAtAll'; // DC0003
  var MESSAGE_DP_MATCHED = 'dc.validateCustomer.dpMatched'; // DC0004
  var MESSAGE_DP_ALLREADY_ASSIGNED = 'dc.validateCustomer.dpAllReadyAssigned'; // DC0006
  var MESSAGE_RECIPIENTS_EMPTY = 'dc.validateCustomer.recipientListEmpty';

  var ValidationResult = suite_l10n.validation.ValidationResult;
  var StringFormatter = suite_l10n.string.StringFormatter;
  var FieldAPI = ns_wrapper.api.field;

  this.setContacts = function setContacts (contactDataList) {
    contacts = contactDataList;
  };

  function loadMessageObject () {
    if (!messages) {
      var stringCodes = [MESSAGE_RECIPIENTS_NO_EMAIL,

        MESSAGE_CUSTOMER_NO_EMAIL,

        MESSAGE_NO_EMAIL_AT_ALL,

        MESSAGE_DP_MATCHED,

        MESSAGE_DP_ALLREADY_ASSIGNED,

        MESSAGE_RECIPIENTS_EMPTY];

      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();

      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);

      var messageLoader;
      if (useServerSideMsgLoader) {
        messageLoader = new suite_l10n.app.ServerSideMessageLoader(messageLoaderContext);
      } else {
        messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);
      }

      messages = messageLoader.getMessageMap();
    }
  }

  // if recipient contact is "dunnable" but has no email address
  this.validateDunningRecipientContact = function validateDunningRecipientContact () {
    var isValid = true;
    var message;
    var dunningThroughEmail = FieldAPI.getFieldValue(dunning.app.ENTITY_EMAIL) === 'T';

    if (contacts.length === 0) {
      return new ValidationResult(isValid);
    }

    var invalidContacts = [];
    for (var i = 0; i < contacts.length; i++) {
      var contact = contacts[i];
      var email = contact.email;

      if (dunningThroughEmail && email.length === 0) {
        invalidContacts.push(contact.name);
      }
    }

    if (invalidContacts.length > 0) {
      loadMessageObject();

      message = new StringFormatter(messages[MESSAGE_RECIPIENTS_NO_EMAIL])
        .replaceParameters({
          'CONTACTNAMES': invalidContacts.join(', ')
        });
      isValid = false;
    }

    return new ValidationResult(isValid, message);
  };
  // Grace Canlas 07.15.2015: deleted validateIndividualCustomer in version 1
  // For individual customer, if "allow letters to be emailed" is checked and has no email address

  // If the customer has no email address and has no valid dunning recipient(with email address)
  this.hasEmailRecipient = function hasEmailRecipient () {
    var dunningThroughEmail = FieldAPI.getFieldValue(dunning.app.ENTITY_EMAIL) === 'T';
    var sendToCompanyEmail = !(FieldAPI.getFieldValue('custentity_3805_exclude_comp_email') === 'T');
    var isValid = true;
    var message;

    var emailFieldValue = FieldAPI.getFieldValue('email');
    var customerEmail = (emailFieldValue) || '';

    if (dunningThroughEmail && sendToCompanyEmail && customerEmail.length === 0) {
      loadMessageObject();
      message = new StringFormatter(messages[MESSAGE_CUSTOMER_NO_EMAIL]);
      isValid = false;
    } else if (dunningThroughEmail && !sendToCompanyEmail && contacts.length === 0) {
      loadMessageObject();
      message = new StringFormatter(messages[MESSAGE_RECIPIENTS_EMPTY]);
      isValid = false;
    }

    return new ValidationResult(isValid, message);
  };

  this.validateUnassignedDP = function validateUnassignedDP (newDP) {
    var currentDP = FieldAPI.getFieldValue(dunning.app.ENTITY_PROCEDURE);
    var isValid = false;
    var message;

    if (currentDP && currentDP != newDP.id) {
      loadMessageObject();
      message = new StringFormatter(messages[MESSAGE_DP_MATCHED])
        .replaceParameters({
          'DP': newDP.name
        });
    } else {
      isValid = true;
    }

    return new ValidationResult(isValid, message);
  };

  this.validateUniqueDP = function validateUniqueDP (newDP) {
    var currentDP = FieldAPI.getFieldValue(dunning.app.ENTITY_PROCEDURE);
    var isValid = false;
    var message;

    if (currentDP == newDP.id) {
      loadMessageObject();
      message = new StringFormatter(messages[MESSAGE_DP_ALLREADY_ASSIGNED]);
    } else {
      isValid = true;
    }

    return new ValidationResult(isValid, message);
  };
};
