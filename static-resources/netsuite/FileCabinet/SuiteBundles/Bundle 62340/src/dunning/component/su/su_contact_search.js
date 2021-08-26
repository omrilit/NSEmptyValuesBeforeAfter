/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This suitelet is being called from the client script via url request
 * and returns contact data
 *
 * @author mjaurigue
 */

/**
 * @param {nlobjRequest} request
 * @param {nlobjResponse} response
 */
function getContacts (request, response) { // eslint-disable-line no-unused-vars
  var contactIds = request.getParameter('contactIDs').split(',');// passes array, receives string
  var DunningCustomerDAO = new dao.DunningCustomerDAO();
  var contacts = DunningCustomerDAO.loadContacts(contactIds);
  response.write(JSON.stringify(contacts));
}
