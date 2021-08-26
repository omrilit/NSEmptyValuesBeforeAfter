/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dao = dao || {};

dao.JobScriptDeploymentDAO = function JobScriptDeploymentDAO () {
  var obj = {
    retrieveByDeploymentId: retrieveByDeploymentId,
    retrieveDeployments: retrieveDeployments,
    retrieveWorkerScripts: retrieveWorkerScripts,
    retrieve: retrieve
  };

  var fieldMap = {
    'id': 'internalid',
    'scriptId': 'script',
    'deploymentId': 'scriptid',
    'isDaemon': 'custscript_l10n_daemon',
    'runStatus': 'hiddendeprecatedstatus',
    'status': 'status',
    'startDate': 'startdate',
    'startTime': 'starttime'
  };

  function getDeploymentSearch (additionalFilters) {
    // nlobjSearchColumn("formulatext").setFormula("{custscript_l10n_daemon}")
    // - does not work
    var columns = [new nlobjSearchColumn('scriptid').setSort()];
    var filters = [new nlobjSearchFilter('scriptid', 'script', 'is', 'customscript_l10n_job_processor')];

    if (additionalFilters) {
      filters = filters.concat(additionalFilters);
    }

    var search = new ns_wrapper.Search('scriptdeployment');
    search.addFilters(filters);
    search.addColumns(columns);

    return search;
  }

  function loadFromRecord (id) {
    var record = new ns_wrapper.Record('scriptdeployment', id);
    var deployment = new model.JobScriptDeployment();

    for (var i in fieldMap) {
      deployment[i] = record.getFieldValue(fieldMap[i]);
    }
    deployment.id = record.getId();
    return deployment;
  }

  function retrieveDeployments (filters) {
    var search = getDeploymentSearch(filters);
    var it = search.getIterator();
    var results = [];
    while (it.hasNext()) {
      var result = it.next();
      // potential governance limit error here
      results.push(loadFromRecord(result.getId()));
    }

    return results;
  }

  function retrieveAll () {
    return retrieveDeployments();
  }

  function retrieveByDeploymentId (deploymentId) {
    var deploymentIdFilter = new nlobjSearchFilter('scriptid', null, 'is', deploymentId);
    return retrieveDeployments(deploymentIdFilter)[0];
  }

  function retrieve (id) {
    return loadFromRecord(id);
  }

  function filterWorker (deployment) {
    return deployment.isDaemon === 'F';
  }

  function retrieveWorkerScripts () {
    return retrieveAll().filter(filterWorker);
  }

  Object.seal(obj);
  return obj;
};
