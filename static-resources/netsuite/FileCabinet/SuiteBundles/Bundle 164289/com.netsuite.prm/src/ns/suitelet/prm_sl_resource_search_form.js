/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.ResourceSearchForm = new function ResourceSearchForm() {
    
    this.init = function(request) {
        this.context = nlapiGetContext();
        this.lib = psa_prm.serverlibrary;
        
        this.origin = request.getParameter('origin');
        
        this.searchFilters = {
            fromDate         : nlapiStringToDate(request.getParameter('from_date')) || new Date(),
            toDate           : nlapiStringToDate(request.getParameter('to_date')) || new Date(),
            percentAvailable : request.getParameter('percent_available'),
            billingClass     : request.getParameter('billing_class'),
            maxLaborCost     : request.getParameter('max_labor_cost'),
            isTaskAssignment : request.getParameter('is_task_assignment'),
            projectId        : request.getParameter('project_id'),
            minYrsOfExp      : request.getParameter('min_yrs_of_exp'),
            skills           : request.getParameterValues('skills'),
            skillNames       : request.getParameter('skill_names') ? JSON.parse(request.getParameter('skill_names')) : []
        };
        
        nlapiLogExecution('DEBUG', 'searchFilters', JSON.stringify(this.searchFilters));
    };
    
    this.suiteletEntry = function(request, response) {
        try {
            this.init(request);
            this.form = this.createForm();
            
            if (request.getMethod() == 'POST') {
                this.createSublist();
            }
            
            response.writePage(this.form);
            
        } catch(ex) {
          var errorCode    = ex.name || ex.getCode(),
          errorMessage = ex.message || ex.getDetails();
    
          nlapiLogExecution('ERROR', errorCode, errorMessage);
          
          response.write(JSON.stringify({
              message : errorCode + ' : '  + errorMessage
          }));
        }
        
        nlapiLogExecution('DEBUG', 'remaining usage points', this.context.getRemainingUsage());
    };
    
    this.getSkillsFilters = function() {
        return [
            new nlobjSearchFilter('isinactive', null, 'is', 'F'),
            new nlobjSearchFilter('isinactive', 'custrecord_rss_skill_category', 'is', 'F')
        ];
    };
    
    this.getSkillsColumns = function() {
        return [ 
            new nlobjSearchColumn('internalid'),
            new nlobjSearchColumn('custrecord_rss_skill_category').setSort(),
            new nlobjSearchColumn('name').setSort()
        ];
    };
    
    this.addSkillsOptions = function(field) {
        var search    = new psa_prm.serverlibrary.ScriptSearch('customrecord_rss_skill', this.getSkillsFilters(), this.getSkillsColumns()),
            allSkills = search.getAllResults();
        
        for (i in allSkills) {
            var skill = allSkills[i];
            
            field.addSelectOption(skill.getValue('internalid'), skill.getText('custrecord_rss_skill_category') + ' : ' + skill.getValue('name'));
        }
    };
    
    this.addSkillSetsToForm = function(form) {
        if (this.isSkillSetsInstalled()) {
            form.addFieldGroup('skill_sets', 'Skill Sets');
    
            var skills        = form.addField('skills', 'multiselect', 'Skills', null, 'skill_sets'),
                minYrsOfExp   = form.addField('min_yrs_of_exp', 'float', 'Minimum Years of Experience', null, 'skill_sets'),
                skillNames    = form.addField('skill_names', 'longtext');
    
            
            this.addSkillsOptions(skills);
            
            minYrsOfExp.setDefaultValue(this.searchFilters.minYrsOfExp);
            skills.setDefaultValue(this.searchFilters.skills);
            skillNames.setDefaultValue(JSON.stringify(this.searchFilters.skillNames));
            
            skillNames.setDisplayType('hidden');        
        }
    };
    
    this.createForm = function() {
        var form = nlapiCreateForm('Resource Search', true);
        
        /*
         * client script
         */
        form.setScript('customscript_prm_resource_search_form_cs');
        
        /*
         * buttons
         */
        form.addSubmitButton('Search');
        form.addButton('resetter', 'Reset', 'psa_prm.ResourceSearchFormCS.resetFields()');
        form.addButton('close', 'Cancel', 'window.close()');

        /*
         * availability
         */
        if (!this.searchFilters.isTaskAssignment) {
            form.addFieldGroup('availability', 'Availability');
        }
        var fromDate         = form.addField('from_date', 'date', 'From', null, 'availability'),
            toDate           = form.addField('to_date', 'date', 'To', null, 'availability'),
            percentAvailable = form.addField('percent_available', 'float', 'Percent Available', null, 'availability');
        
        /*
         * other search filters
         */
        form.addFieldGroup('others', this.searchFilters.isTaskAssignment ? 'Criteria' : 'Others');
        var billingClass = form.addField('billing_class', 'select', 'Billing Class', 'billingclass', 'others'),
            maxLaborCost = form.addField('max_labor_cost', 'float', 'Maximum Labor Cost', null, 'others');
        
        /*
         * skill sets
         */
        this.addSkillSetsToForm(form);

        /*
         * hidden fields
         */
        var origin           = form.addField('origin', 'text'),
            isTaskAssignment = form.addField('is_task_assignment', 'text'),
            projectId        = form.addField('project_id', 'text'),
            resetValues      = form.addField('reset_values', 'longtext');
        
        /*
         * set mandatory fields
         */
        if (!this.searchFilters.isTaskAssignment) {
            fromDate.setMandatory(true);
            toDate.setMandatory(true);
        }
        
        /*
         * set default values
         */
        fromDate.setDefaultValue(nlapiDateToString(this.searchFilters.fromDate));
        toDate.setDefaultValue(nlapiDateToString(this.searchFilters.toDate));
        percentAvailable.setDefaultValue(this.searchFilters.percentAvailable);
        billingClass.setDefaultValue(this.searchFilters.billingClass);
        maxLaborCost.setDefaultValue(this.searchFilters.maxLaborCost);
        
        isTaskAssignment.setDefaultValue(this.searchFilters.isTaskAssignment);
        projectId.setDefaultValue(this.searchFilters.projectId);
        resetValues.setDefaultValue(JSON.stringify(this.searchFilters));
        
        /*
         * hidden fields
         */
        if (this.searchFilters.isTaskAssignment) {
            fromDate.setDisplayType('hidden');
            toDate.setDisplayType('hidden');
            percentAvailable.setDisplayType('hidden');
        }
        origin.setDisplayType('hidden');
        isTaskAssignment.setDisplayType('hidden');
        projectId.setDisplayType('hidden');
        resetValues.setDisplayType('hidden');
        
        return form;
    };
    
    this.isSkillSetsFlagFileFound = function() {
        var flagFiles = psa_prm.serverlibrary.searchFile('rss_bundle_identifier.txt');
        
        if (flagFiles) {
            for (i in flagFiles) {
                var file    = nlapiLoadFile(flagFiles[i].getValue('internalid')),
                    content = file.getValue();
                
                if (content.indexOf('9be79a64-837c-49ef-8f65-61c093ca1198') > -1) {
                    return true;
                }
            }
        }

        return false;
    };
    
    this.isSkillSetsInstalled = function() {
        if (!this.hasOwnProperty('isSkillSets')) {
            this.isSkillSets = this.isSkillSetsFlagFileFound();
        }
        
        return this.isSkillSets;
    };

    this.setSearchColumns = function(rsColumns) {
        if (this.isSkillSetsInstalled()) {
            rsColumns.push(new nlobjSearchColumn('custentity_rss_yoe'));
        }
    };

    this.setSearchFilters = function(searchFilters, rsFilters, filterProjectResources, includeAllGeneric) {
        var filters = [];
        
        if (filterProjectResources != 'all') {
            var resourceFilter = [ 'internalid', 'anyof', filterProjectResources ];
            
            if (includeAllGeneric) {
                resourceFilter = [ resourceFilter, 'OR', [ 'type', 'anyof', 'GenericRsrc' ] ];
            }
            
            filters.push(resourceFilter);
        }
        
        if (searchFilters.billingClass) {
            filters.push([
                [
                    [ 'type', 'anyof', 'Employee' ],
                    'AND',
                    [ 'employee.billingclass', 'anyof', searchFilters.billingClass ]
                ],
                'OR',
                [
                    [ 'type', 'anyof', 'Vendor' ],
                    'AND',
                    [ 'vendor.billingclass', 'anyof', searchFilters.billingClass ]
                ],
                'OR',
                [
                    [ 'type', 'anyof', 'GenericRsrc' ],
                    'AND',
                    [ 'genericresource.billingclass', 'anyof', searchFilters.billingClass ]
                ]
            ]);
        }
        
        if (searchFilters.maxLaborCost) {
            filters.push([
                [
                    [ 'type', 'anyof', 'Employee' ],
                    'AND',
                    [ 'employee.laborcost', 'lessthanorequalto', searchFilters.maxLaborCost ]
                ],
                'OR',
                [
                    [ 'type', 'anyof', 'Employee' ],
                    'AND',
                    [ 'employee.laborcost', 'isempty', '' ]
                ],
                'OR',
                [
                    [ 'type', 'anyof', 'Vendor' ],
                    'AND',
                    [ 'vendor.laborcost', 'lessthanorequalto', searchFilters.maxLaborCost ]
                ],
                'OR',
                [
                    [ 'type', 'anyof', 'Vendor' ],
                    'AND',
                    [ 'vendor.laborcost', 'isempty', '' ]
                ],
                'OR',
                [
                    [ 'type', 'anyof', 'GenericRsrc' ],
                    'AND',
                    [ 'genericresource.laborcost', 'lessthanorequalto', searchFilters.maxLaborCost ]
                ],
                'OR',
                [
                    [ 'type', 'anyof', 'GenericRsrc' ],
                    'AND',
                    [ 'genericresource.laborcost', 'isempty', '' ]
                ]
            ]);
        }
        
        if (this.isSkillSetsInstalled() && searchFilters.minYrsOfExp) {
            filters.push([
                [
                    [ 'type', 'anyof', 'Employee' ],
                    'AND',
                    [ 'employee.custentity_rss_yoe', 'greaterthanorequalto', searchFilters.minYrsOfExp ]
                ],
                'OR',
                [
                    [ 'type', 'anyof', 'Vendor' ],
                    'AND',
                    [ 'vendor.custentity_rss_yoe', 'greaterthanorequalto', searchFilters.minYrsOfExp ]
                ]
            ]);
        }
        
        for (i in filters) {
            if (rsFilters.length) {
                rsFilters.push('AND');
            }
            
            rsFilters.push(filters[i]);
        } 
    };
    
    this.resourceIdMapper = function(resource) {
        return resource.resourceId;
    };
    
    this.getResourcesAllocatedToProject = function(projectId) {
        var projectService   = new PRM.Service.ProjectService(psa_prm.serverlibrary),
            showAllResources = projectService.projectAllowsAllResourcesForTasks(projectId)
        
        if (showAllResources) {
            return 'all';
        }
        
        return projectService.getProjectResources(projectId).map(this.resourceIdMapper);
    };
    
    this.searchResources = function() {
        var viewFilters            = this.lib.loadLastUsedFilter(),
            searchFilters          = this.searchFilters,
            filterProjectResources = 'all',
            includeAllGeneric      = false,
            filteredResources      = [],
            rsFilters              = [],
            rsColumns              = [];
        
        /*
         * filter years of experience (RSS dependent), billing class, labor cost 
         */
        if (searchFilters.isTaskAssignment && searchFilters.projectId) {
            filterProjectResources = this.getResourcesAllocatedToProject(searchFilters.projectId);
            includeAllGeneric = true;
            
            if (filterProjectResources != 'all' && !filterProjectResources.length) {
                return [];
            }
        }
        this.setSearchFilters(searchFilters, rsFilters, filterProjectResources, includeAllGeneric);
        this.setSearchColumns(rsColumns);
        filteredResources = ProjectResourceService.getResourcesByFilter(viewFilters, null, rsFilters, rsColumns);
        
        /*
         * filter skills (RSS dependent)
         */
        if (this.isSkillSetsInstalled() && searchFilters.skills) {
            filteredResources = this.populateResourcesWithSkillSets(searchFilters, filteredResources);
        }
        
        /*
         * filter availability (for Resource Allocation only)
         */
        if (!searchFilters.isTaskAssignment && filteredResources.length) {
            filteredResources = TimeBillsService.populateResourcesWithAllocatedTimeDetails(searchFilters, filteredResources);            
        }
        
        return filteredResources;
    };
    
    this.getSkillSetsFilters = function(searchFilters, filteredResources) {
        var resourceIds = this.getResourceIds(filteredResources),
            filters     = [];
        
        if (resourceIds.length) {
            filters.push(new nlobjSearchFilter('custrecord_rss_skillset_resource', null, 'anyof', resourceIds));
        }
        if (searchFilters.skills && searchFilters.skills.length) {
            filters.push(new nlobjSearchFilter('custrecord_rss_skillset_skill', null, 'anyof', searchFilters.skills));
        }
        
        return filters;
    };
    
    this.getSkillSetsColumns = function() {
        return [
            new nlobjSearchColumn('custrecord_rss_skillset_resource'),
            new nlobjSearchColumn('custrecord_rss_skillset_skill'),
            new nlobjSearchColumn('custrecord_rss_skillset_level'),
            new nlobjSearchColumn('custrecord_rss_skill_level_linenumber', 'custrecord_rss_skillset_level'),
            new nlobjSearchColumn('custrecord_rss_skill_category', 'custrecord_rss_skillset_skill')
        ];
    };
    
    this.createSkillSetObject = function(searchResult) {
        return {
            resourceId   : searchResult.getValue('custrecord_rss_skillset_resource'),
            resourceName : searchResult.getText('custrecord_rss_skillset_resource'),
            skillId      : searchResult.getValue('custrecord_rss_skillset_skill'),
            skillname    : searchResult.getText('custrecord_rss_skillset_skill'),
            levelId      : searchResult.getValue('custrecord_rss_skillset_level'),
            levelName    : searchResult.getText('custrecord_rss_skillset_level'),
            levelScore   : searchResult.getValue('custrecord_rss_skill_level_linenumber', 'custrecord_rss_skillset_level'),
            categoryId   : searchResult.getValue('custrecord_rss_skill_category', 'custrecord_rss_skillset_skill')
        };
    };
    
    this.getResourceSkillSetsMap = function(searchFilters, filteredResources) {
        var search       = new psa_prm.serverlibrary.ScriptSearch('customrecord_rss_skillset', this.getSkillSetsFilters(searchFilters, filteredResources), this.getSkillSetsColumns()),
            allSkillSets = search.getAllResults(),
            rssMap       = {};
        
        for (i in allSkillSets) {
            var skillSet = this.createSkillSetObject(allSkillSets[i]);
            
            if (!rssMap.hasOwnProperty(skillSet.resourceId)) {
                rssMap[skillSet.resourceId] = [];
            }
            
            rssMap[skillSet.resourceId].push(skillSet);
        }
        
        return rssMap;
    };
    
    this.populateResourcesWithSkillSets = function(searchFilters, filteredResources) {
        var rssMap = this.getResourceSkillSetsMap(searchFilters, filteredResources);
        
        for (i in filteredResources) {
            var resourceId = filteredResources[i].resourceId;
            
            if (rssMap.hasOwnProperty(resourceId) && rssMap[resourceId].length == searchFilters.skills.length) {
                filteredResources[i].skillSets = rssMap[resourceId];
            } else {
                delete filteredResources[i];
            }
        }
        
        return filteredResources.filter(function(n){
            return n != null;
        }); 
    };
    
    this.getSelectImageURL = function() {
        return this.origin + '/c.' + this.context.getCompany() + '/' + (this.context.getBundleId() ? ('suitebundle' + this.context.getBundleId()) : 'suiteapp') + '/com.netsuite.prm/src/css/images/prm/icon_select_arrow.png';
    };
    
    this.getDownloadImageURL = function() {
        return this.origin + '/c.' + this.context.getCompany() + '/' + (this.context.getBundleId() ? ('suitebundle' + this.context.getBundleId()) : 'suiteapp') + '/com.netsuite.prm/src/css/images/prm/icon_download.png';
    };
    
    this.createSelectImageHtml = function(rowNum, imageUrl, resourceId) {
        return '<div style="text-align:center;"><img id="select-resource-' + rowNum + '" src="' + imageUrl + '" onclick="psa_prm.ResourceSearchFormCS.selectResource(' + resourceId + ', ' + (this.searchFilters.isTaskAssignment == 'T') + ')" style="cursor:pointer;" /></div>';
    };
    
    this.addSublistColumns = function(sublist) {
        sublist.addField('selectimage', 'text', 'Select');
        sublist.addField('resourcename', 'text', 'Resource');
        sublist.addField('laborcost', 'text', 'Labor Cost');
        
        if (this.isSkillSetsInstalled()) {
            sublist.addField('skillsetscore', 'text', 'Skillset Score');
        }
        
        if (!this.searchFilters.isTaskAssignment) {
            sublist.addField('percentavailable', 'text', 'Percent Available');
        }
        
        sublist.addField('resourcetype', 'text', 'Type');
        sublist.addField('billingclass', 'text', 'Billing Class');
        
        if (this.isSkillSetsInstalled()) {
            sublist.addField('yearsofexperience', 'text', 'Years of Experience');
            sublist.addField('resumeurl', 'text', 'Resumé');
            
            for (i in this.searchFilters.skillNames) {
                sublist.addField('skill_' + this.searchFilters.skills[i], 'text', this.searchFilters.skillNames[i]);
            }
        }
    };
    
    this.initCategoryMaxScoreMap = function() {
        var columns = [
            new nlobjSearchColumn('custrecord_rss_skill_level_category', null, 'group'),
            new nlobjSearchColumn('custrecord_rss_skill_level_linenumber', null, 'max')
        ];
        
        var search       = new psa_prm.serverlibrary.ScriptSearch('customrecord_rss_skill_level', null, columns),
            allMaxScores = search.getAllResults(),
            maxScoreMap  = {};
        
        for (i in allMaxScores) {
            maxScoreMap[allMaxScores[i].getValue('custrecord_rss_skill_level_category', null, 'group')] = Number(allMaxScores[i].getValue('custrecord_rss_skill_level_linenumber', null, 'max'));
        };
        
        return maxScoreMap;
    };
    
    this.getCategoryMaxScore = function(categoryId) {
        if (!this.categoryMaxScoreMap) {
            this.categoryMaxScoreMap = this.initCategoryMaxScoreMap();
        }
        
        return this.categoryMaxScoreMap[categoryId];
    };
    
    this.createSkillSetScoreHtml = function(skillSetScorePercentage) {
        return '<div style="width:102px;height:20px;border:1px solid #6594CF"><div style="width:' + skillSetScorePercentage + 'px;height:18px;background:#B2CCEE;overflow:visible;font-weight:bold;padding-left:3px;">' + skillSetScorePercentage + '%</div></div>';
    };
    
    this.createDownloadResumeHTML = function(rowNum, resumeURL, downloadImageURL) {
        return '<div style="text-align:center"><a href="' + resumeURL + '" target="cv"><img id="cv-' + rowNum + '" src="' + downloadImageURL + '" /></a></div>';
    };
    
    this.setSkillSetsAttributes = function(rowNum, resource, skillSets, yearsOfExperience, resumeURL, downloadImageURL) {
        if (skillSets) {
            var skillSetScore = 0,
                totalMaxScore = 0;
            
            for (i in skillSets) {
                var skillSet = skillSets[i];
                
                resource['skill_' + skillSet.skillId] = skillSet.levelName;
                
                skillSetScore += Number(skillSet.levelScore);
                totalMaxScore += this.getCategoryMaxScore(skillSet.categoryId);
            }
            
            var skillSetScorePercentage = Math.round(skillSetScore / totalMaxScore * 100);
            
            resource.skillsetscore = this.createSkillSetScoreHtml(skillSetScorePercentage);
        }
        
        if (yearsOfExperience) {
            resource.yearsofexperience = yearsOfExperience;
        }
        
        if (resumeURL) {
            resource.resumeurl = this.createDownloadResumeHTML(rowNum, resumeURL, downloadImageURL);
        }
    };
    
    this.convertSublistItems = function(resources) {
        var start            = Date.now(),
            selectImageURL   = this.getSelectImageURL(),
            downloadImageURL = this.getDownloadImageURL(), 
            sublistItems     = [],
            resumeURLs       = this.getResumeURLs(resources);
        
        for (i in resources) {
            var resource = {
                selectimage      : this.createSelectImageHtml(i, selectImageURL, resources[i].resourceId),
                resourcename     : resources[i].resourceName,
                resourcetype     : resources[i].resourceType,
                billingclass     : resources[i].billingClassName,
                laborcost        : resources[i].laborCost,
                percentavailable : resources[i].percentAvailable
            };
            
            this.setSkillSetsAttributes(i, resource, resources[i].skillSets, resources[i].yearsOfExperience, resumeURLs[resources[i].resourceId], downloadImageURL);
            
            sublistItems.push(resource);
        }
        
        nlapiLogExecution('DEBUG', 'createSublist', 'sublist size: ' + sublistItems.length + ', object coversion time: ' + (Date.now() - start) + 'ms');
        
        return sublistItems;
    };
    
    this.createSublist = function() {
        var sublist   = this.form.addSubList('search_results', 'list', 'Search Results'),
            resources = this.searchResources();
        
        this.addSublistColumns(sublist);
        sublist.setLineItemValues(this.convertSublistItems(resources));
    };
    
    this.getResourceIds = function(resources) {
        if (resources && resources.length) {
            return resources.map(function(r) {
                return r.resourceId;
            });
        }
        
        return [];
    };
    
    this.getResumeURLs = function(resources) {
        var resourceIds = this.getResourceIds(resources),
            filters     = [ new nlobjSearchFilter('internalid', null, 'anyof', resourceIds) ],
            columns     = [ new nlobjSearchColumn('internalid'), new nlobjSearchColumn('folder', 'file'), new nlobjSearchColumn('url', 'file') ],
            search      = new psa_prm.serverlibrary.ScriptSearch('entity', null, columns),
            allEntities = search.getAllResults(),
            resumeURLs  = {};

        for (i in allEntities) {
            var entity = allEntities[i];
            
            if (entity.getText('folder', 'file') == 'Resume') {
                resumeURLs[entity.getValue('internalid')] = entity.getValue('url', 'file');
            }
        }
        
        nlapiLogExecution('DEBUG', 'getResumeURLs', JSON.stringify(resumeURLs));
        nlapiLogExecution('DEBUG', 'resourceIds', JSON.stringify(resourceIds));
        
        return resumeURLs;
    };
};