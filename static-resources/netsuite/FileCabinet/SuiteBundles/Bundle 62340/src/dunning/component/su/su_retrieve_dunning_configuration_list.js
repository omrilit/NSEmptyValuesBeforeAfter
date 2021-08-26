/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.su = dunning.component.su || {};

dunning.component.su.DunningConfigurationListRetrievalSU = function DunningConfigurationListRetrievalSU () {
  this.retrieveList = function retrieveList (response) {
    var configurationDAO = new dao.DunningConfigurationDAO();
    var modelList = configurationDAO.retrieveAll();

    var configurationConverter = new dunning.app.DunningConfigurationConverter();
    var viewList = configurationConverter.castToMultipleViews(modelList);

    var formatter = new suite_l10n.string.StringFormatter();
    formatter.stringify(viewList);
    response.write(formatter.toString());
    return response;
  };
};

/**
 * retrieveDunningConfigurationList
 */
function retrieveDunningConfigurationList (request, response) { // eslint-disable-line no-unused-vars
  var wrResponse = new ns_wrapper.Response(response);

  var retrievalSuitelet = new dunning.component.su.DunningConfigurationListRetrievalSU();
  // We don't need to pass the request right now since we're not passing variables
  wrResponse = retrievalSuitelet.retrieveList(wrResponse);
  wrResponse.flush();

  return true;
}
