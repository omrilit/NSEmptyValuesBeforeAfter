/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.su = dunning.component.su || {};

dunning.component.su.EmployeeDunningRoleSearch = function EmployeeDunningRoleSearch () {
  var Request = ns_wrapper.Request;
  var Response = ns_wrapper.Response;

  this.run = function run (request, response) {
    var wrRequest = new Request(request);
    var wrResponse = new Response(response);

    var userId = wrRequest.getParameter('userId');
    var currentRole = wrRequest.getParameter('currentRole');
    var employeeDao = new dao.DunningEmployeeDAO();
    var dunningRole = employeeDao.getDunningRole(userId, currentRole);

    wrResponse.write(dunningRole);
    wrResponse.flush();
  };
};

/**
 * @param {nlobjRequest} request
 * @param {nlobjResponse} response
 */
function runSuitelet (request, response) { // eslint-disable-line no-unused-vars
  var empDunRoleSearch = new dunning.component.su.EmployeeDunningRoleSearch();
  empDunRoleSearch.run(request, response);
}
