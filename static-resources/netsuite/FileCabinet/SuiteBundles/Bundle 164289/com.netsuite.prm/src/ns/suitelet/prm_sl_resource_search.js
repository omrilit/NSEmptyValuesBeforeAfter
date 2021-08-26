/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm)
    psa_prm = {};

psa_prm.ResourceSearchSL = new function ResourceSearchSL() {

    this.getFilter = function(request, key) {
        var filter = '';
        var filterString = request.getParameter(key);
        if (filterString) {
            filter = JSON.parse(filterString);
        } else {
            throw nlapiCreateError('InvalidFilters', 'Invalid ' + key + ' value');
        }
        return filter;
    };

    this.suiteletEntry = function(request, response) {
        var viewFilters = '', searchFilters = '';
        var returnData = '';
        var context = nlapiGetContext();

        try {
            nlapiLogExecution('DEBUG', 'Governance start', context.getRemainingUsage());
            viewFilters = this.getFilter(request, 'viewFilters');
            searchFilters = this.getFilter(request, 'searchFilters');

            var filteredResources = ProjectResourceService.getResourcesByFilter(viewFilters);

            searchFilters.fromDate = new Date(searchFilters.fromDate);
            searchFilters.toDate = new Date(searchFilters.toDate);

            nlapiLogExecution('DEBUG', 'searchFilters', JSON.stringify(searchFilters));
            returnData = TimeBillsService.populateResourcesWithAllocatedTimeDetails(searchFilters, filteredResources);

            nlapiLogExecution('DEBUG', 'Governance end', context.getRemainingUsage());
            nlapiLogExecution('DEBUG', 'returnData', JSON.stringify(returnData));

            response.write(JSON.stringify(returnData));
        } catch (ex) {
            var errorCode = ex.name || ex.getCode(), errorMessage = ex.message || ex.getDetails();

            nlapiLogExecution('ERROR', errorCode, errorMessage);

            response.write(JSON.stringify({
                success : false,
                message : errorCode + ' : ' + errorMessage
            }));
        }
    };
};
