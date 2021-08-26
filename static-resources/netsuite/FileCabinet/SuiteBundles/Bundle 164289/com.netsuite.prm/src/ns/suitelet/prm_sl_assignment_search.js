/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.AssignmentSearchSl = new function AssignmentSearchSl() {

    this.suiteletEntry = function(request, response) {

        var _response = {
            success        : true,
            message        : 'Successfully loaded Assignment Search Results',
            totalResources : 0,
            data           : []
        };
        
        try {
            
            var params = {
                billingClass : request.getParameter('billingClass'),
                laborCost    : request.getParameter('laborCost'),
                viewFilters  : request.getParameter('viewFilters')
            };
            
            nlapiLogExecution('DEBUG', 'Assignment Search Parameters', JSON.stringify(params));
            
            var filterExpression = [['isinactive', 'is', 'F']];
            if (params.billingClass) {
                filterExpression.push('AND');
                filterExpression.push([
                    ['employee.billingclass', 'is', params.billingClass],
                    'OR',
                    ['vendor.billingclass', 'is', params.billingClass],
                    'OR',
                    ['genericresource.billingclass', 'is', params.billingClass]
                ]);
            }
            if (params.laborCost) {
                filterExpression.push('AND');
                filterExpression.push([
                    [
                        ['type', 'is', 'Employee'],
                        'AND',
                        ['employee.laborcost', 'lessthanorequalto', params.laborCost]
                    ],
                    'OR',
                    [
                        ['type', 'is', 'Vendor'],
                        'AND',
                        ['vendor.laborcost', 'lessthanorequalto', params.laborCost]
                    ],
                    'OR',
                    [
                        ['type', 'is', 'GenericRsrc'],
                        'AND',
                        ['genericresource.laborcost', 'lessthanorequalto', params.laborCost]
                    ]
                ]);
            }
            nlapiLogExecution('DEBUG', 'Assignment Search Filter Expression', JSON.stringify(filterExpression));
            
            var timeSearch        = new psa_prm.serverlibrary.Search(null, 'customsearch_prm_resources_list'),
                viewableResources = ProjectResourceService.getViewableResources(JSON.parse(params.viewFilters)),
                allResults        = [];
            
            nlapiLogExecution('DEBUG', 'Assignment Search viewableResources', JSON.stringify(viewableResources));
            
            timeSearch.setFilterExpression(filterExpression);
            allResults = timeSearch.getAllResults();
            
            _response.totalResources = allResults.length;
            for (i in allResults) {
                var r  = allResults[i],
                    id = r.getValue('internalid');
                        
                if (viewableResources == 'All' || viewableResources.indexOf(Number(id)) > -1) {
                    _response.data.push({
                        resourceId   : id,
                        resourceName : r.getValue('entityid'),
                        resourceType : r.getValue('formulatext'),
                        billingClass : r.getText('billingclass', 'employee') || r.getText('billingclass', 'vendor') || r.getText('billingclass', 'genericresource'),
                        laborCost    : r.getValue('formulanumeric')
                    });
                }
            }
            
        } catch(ex) {
            
            _response.success = false;
            _response.message = 'Failed to load Assignment Search Results';

            nlapiLogExecution('ERROR', ex.name || ex.getCode(), ex.message || ex.getDetails());
        }
        
        response.write(JSON.stringify(_response));
    };
};