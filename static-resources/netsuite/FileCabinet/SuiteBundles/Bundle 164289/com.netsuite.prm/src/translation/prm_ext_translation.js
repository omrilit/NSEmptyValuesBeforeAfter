/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Translation', {
    singleton : true,
    defaultMap : {
        /*
         * all alerts / user prompts
         */
        'ALERT.ADD_ASSIGNMENT_SUCCESS' : 'Task Assignment successfully added.',
        'ALERT.ASSIGNMENT_DUPLICATE' : 'Resource is already assigned to Project Task.',
        'ALERT.ASSIGNMENT_NOT_ALLOCATED' : 'Resource is not allocated to Project.',
        'ALERT.ASSIGNMENT_UNKNOWN_ERROR' : 'An unknown error has occurred.',
        'ALERT.RECORD_REFERRED_TO_BY_OTHER_RECORDS' : 'This record cannot be deleted, because it is referred to by other records.',
        'ALERT.DELETE_ASSIGNMENT_SUCCESS' : 'Task Assignment/s successfully deleted.',
        'ALERT.DELETE_ASSIGNMENT_FAIL' : 'Failed to delete Task Assignment.',
        'ALERT.DELETE_PROJECT_FAIL' : 'Failed to delete Resource Allocations and Task Assignments.',
        'ALERT.DELETE_PROJECT_SUCCESS' : 'Resource Allocations and Task Assignments successfully deleted.',
        'ALERT.PAGING_FIRST_PAGE' : 'You are already on the first page.',
        'ALERT.PAGING_LAST_PAGE' : 'You are already on the last page.',
        'ALERT.PROJECT_DUPLICATE' : 'Duplicate Project exists.',
        'ALERT.PROJECT_TASK_NOT_FOUND_IN_PROJECT' : 'Project Task does not belong to Project.',
        'ALERT.RESOURCE_DUPLICATE' : 'Duplicate Resource exists.',
        'ALERT.TASK_ASSIGNMENT_DUPLICATE' : 'Duplicate Task Assignment exists.',
        'ALERT.UPDATE_ASSIGNMENT_SUCCESS' : 'Task Assignment successfully updated.',
        'ALERT.LOOKUP_ASSIGNMENT_SUCCESS' : 'Task Assignment look-up success.',
        'ALERT.FILTER_NAME_EXISTS_ERROR' : 'Name is already used. Try another name.',
        'ALERT.RETRIEVE_ASSIGN_RESOURCE_FAILED' : 'Failed to retrieve Resources.',
        'ALERT.ALLOCATION_ERROR_NON_WORKING' : 'Unable to allocate resource. Allocation must include at least one work day.',
        'ALERT.ALLOCATION_ERROR_OVERLAP' : 'Chosen date overlaps with an existing allocation.',
        'ALERT.ALLOCATION_BULK_MOVE_OVERLAP' : 'Unable to move allocations due to overlapping dates.',
        'ALERT.REALLOCATION_ERROR_NON_WORKING' : 'Unable to re-allocate on non-working day/s.',
        'ALERT.REALLOCATION_ERROR_TASK_ASSIGNMENT' : 'Unable to update {0}. {1} has an existing Task Assignment for {2}.',
        'ALERT.DELETE_ERROR_TASK_ASSIGNMENT' : 'Unable to delete resource allocation with task assignment/s.',
        'ALERT.DELETE_ALLOCATION_SUCCESS' : 'Resource Allocation is successfully deleted.',
        'ALERT.INVALID_END_DATE_WITH_ACTUAL_WORK' : 'Unable to set value earlier than Actual Work.',
        'ALERT.INVALID_END_DATE_LESS_THAN_START_DATE' : 'End Date cannot be earlier than Start Date.',
        'ALERT.INVALID_START_DATE_GREATER_THAN_END_DATE' : 'Start Date cannot be later than End Date.',
        'ALERT.INVALID_DATE_NON_WORKING' : 'Unable to assign on a non-working day.',
        'ALERT.INVALID_LESS_THAN_ZERO' : 'Value cannot be less than zero.',
        'ALERT.INVALID_LESS_THAN_HOURS_WORKED' : 'Value cannot be less than hours worked.',
        'ALERT.INVALID_NUM_MUST_BE_BETWEEN_0_AND_2080' : 'Invalid number (must be between 0 and 2080)',
        'ALERT.INVALID_PERCENTAGE_MUST_BE_BETWEEN_0_AND_100' : 'Invalid percentage (must be between 0 and 100)',
        'ALERT.INVALID_PERCENTAGE_MUST_BE_BETWEEN_5_AND_500' : 'Invalid percentage (must be between 5 and 500)',
        'ALERT.INVALID_SERVICE_ITEM' : 'Invalid service item for the selected project.',
        'ALERT.TOTAL_AMOUNT_IS_TOO_LARGE' : 'The total amount is too large. Please split the transaction into multiple ones.',
        'ALERT.DELETE_ALLOCATIONS_SUCCESS' : 'Resource Allocation/s successfully deleted.',
        'ALERT.MIN_CHAR_SEARCH' : 'Please enter 3 or more characters to perform a search.',
        'ALERT.SEARCH_TIMED_OUT' : 'Search timed out. Please refine your search criteria and try again.',
        'ALERT.FILTER_AT_LEAST_ONE_RESOURCE_TYPE' : 'At least one resource type must be selected to save this view. Check the corresponding box for including Employees, Vendors, and/or Generic Resources.',
        'ALERT.ALLOCATION_SUCCESSFUL_CREATE' : 'Resource Allocation successfully created.',
        'ALERT.ALLOCATION_SUCCESSFUL_EDIT' : 'Changes to Resource Allocation successfully saved.',
        'ALERT.ALLOCATION_SUCCESSFUL_DELETE' : 'Resource Allocation successfully deleted.',
        'ALERT.VIEW_SUCCESSFUL_CREATE' : 'View successfully created.',
        'ALERT.VIEW_SUCCESSFUL_EDIT' : 'Changes to View successfully saved.',
        'ALERT.VIEW_SUCCESSFUL_DELETE' : 'View successfully deleted.',
        
        /*
         * all confirmation popups
         */
        'CONFIRM.DELETE_PROJECT' : 'Delete all Resource Allocations and Task Assignments for this Project?',
        'CONFIRM.DELETE_ALLOCATION' : 'Delete Resource Allocations in this Project?',
        'CONFIRM.DELETE_ASSIGNMENT' : 'Delete Task Assignment of this Resource?',
        
        /*
         * all label texts
         */
        'FIELD.ACTUAL_WORK' : 'Actual Work',
        'FIELD.ALLOCATE' : 'Allocate',
        'FIELD.ALLOCATED_TO_PROJECTS_ONLY' : 'Allocated to Projects Only',
        'FIELD.ALLOCATION_TYPE' : 'Allocation Type',
        'FIELD.APPROVAL_STATUS' : 'Approval Status',
        'FIELD.ASSIGNED_TO_TASKS_ONLY' : 'Assigned to Tasks Only',
        'FIELD.BILLING_CLASS' : 'Billing Class',
        'FIELD.COMMENTS' : 'Comments',
        'FIELD.COST_OVERRIDE' : 'Cost Override',
        'FIELD.CUSTOMER' : 'Customer',
        'FIELD.CUSTOMER_PROJECT' : 'Customer:Project',
        'FIELD.DEFAULT_COST' : 'Default Cost',
        'FIELD.DENSITY' : 'Density',
        'FIELD.EMAIL' : 'Email',
        'FIELD.END_DATE' : 'End Date',
        'FIELD.ESTIMATED_WORK' : 'Estimated Work',
        'FIELD.FROM' : 'From',
        'FIELD.INCLUDE_SUB-SUBSIDIARIES' : 'Include Sub-subsidiaries',
        'FIELD.MAX_LABOR_COST' : 'Max. Labor Cost',
        'FIELD.NAME' : 'Name',
        'FIELD.NEXT_APPROVER' : 'Next Approver',
        'FIELD.PROJECT_PROPERTIES' : 'Project Properties',
        'FIELD.PROJECT_TASK' : 'Project Task',
        'FIELD.PROJECT' : 'Project',
        'FIELD.RESOURCE' : 'Resource',
        'FIELD.RESOURCE_PROPERTIES' : 'Resource Properties',
        'FIELD.RESOURCE_TYPE' : 'Resource Type',
        'FIELD.ROLE' : 'Role',
        'FIELD.SERVICE_ITEM' : 'Service Item',
        'FIELD.START_DATE' : 'Start Date',
        'FIELD.SUBSIDIARY' : 'Subsidiary',
        'FIELD.TASK' : 'Task',
        'FIELD.TO' : 'To',
        'FIELD.UNIT_COST' : 'Unit Cost',
        'FIELD.UNIT_PRICE' : 'Unit Price',
        'FIELD.UNIT_PERCENT' : 'Unit Percent',
        'FIELD.VIEW_NAME' : 'View Name',
        'FIELD.VIEW' : 'View',
        'FIELD.INCLUDE_ALL_PROJECTS' : 'Include All Projects',
        'FIELD.PERCENT_AVAILABLE' : '% Available',
        'FIELD.SHOW_REJECTED_ALLOCATIONS' : 'Show Rejected Allocations',
        'FIELD.SHOW_DETAILS_ON_HOVER' : 'Show Details on Hover',
        'FIELD.SHOW_RESOURCE_ALLOCATIONS' : 'Show Resource Allocations',
        'FIELD.SHOW_TASK_ASSIGNMENTS' : 'Show Task Assignments',
        'FIELD.MAX_LABOR_COST' : 'Max. Labor Cost',
        
        'FIELDSET.AVAILABILITY' : 'Availability',
        'FIELDSET.OTHERS' : 'Others',
        
        'RADIO.DENSE' : 'Dense',
        'RADIO.STANDARD' : 'Standard',
        'RADIO.RELAXED' : 'Relaxed',

        'FEATURE.TIME_TRACKING' : 'Time Tracking',
        'FEATURE.TIMESHEETS' : 'Timesheets',
        'FEATURE.PROJECT_MANAGEMENT' : 'Project Management',
        'FEATURE.RESOURCE_ALLOCATION' : 'Resource Allocations',
        'FEATURE.CUSTOM_RECORD' : 'Custom Records',
        'FEATURE.CLIENT_SCRIPT' : 'Client SuiteScript',
        'FEATURE.SERVER_SCRIPT' : 'Server SuiteScript',

        'TEXT.ALL-' : '-All-',
        'TEXT.ALL'  : 'All',
        'TEXT.NONE-' : '-None-',
        'TEXT.PROJECT' : 'Project',
        'TEXT.SELECT_ONE' : 'Select One',
        'TEXT.PROJECT_TASK' : 'Project Task',
        'TEXT.TASK_ASSIGNMENT' : 'Task Assignment',
        'TEXT.RESOURCE_ALLOCATION' : 'Resource Allocation',
        'TEXT.DEFAULT' : '- Default -',
        'TEXT.FALSE' : 'False',
        'TEXT.TOTAL' : 'Total',
        'TEXT.TRUE' : 'True',
        'TEXT.EMPLOYEE' : 'Employee',
        'TEXT.GENERIC_RESOURCE' : 'Generic Resource',
        'TEXT.VENDOR' : 'Vendor',
        'TEXT.LOADING_PAGES' : 'Loading Pages...',
        'TEXT.NO_RESULTS_FOUND' : 'No results found within limits of selected view.',
        'TEXT.NO_SEARCH_RESULTS' : 'No Search Results Match Your Criteria.',
        'TEXT.PERFORMING_SEARCH' : 'Performing search, please wait...',
        'TEXT.SEARCH_PROJECT' : 'Search Project',
        'TEXT.SEARCHING' : 'Searching...',
        'TEXT.LEGEND_RESOURCE_HAS_NO_ASSIGNMENTS' : 'Resource has no assignments',
        'TEXT.LEGEND_TASK_HAS_NO_RESOURCES' : 'Task has no resources',
        'TEXT.LEGEND_EDITABLE_VALUE' : 'Editable value',
        'TEXT.LEGEND_READ_ONLY_VALUE' : 'Read only value',
        'TEXT.LEGEND_INACTIVE_RESOURCE' : 'Resource is Inactive',
        'TEXT.CLICK_CELL_TO_EDIT' : 'Click cell to edit. Ctrl+click to drill down cells with multiple allocations.',
        
        'HEADER.PROJECT_TASK_RESOURCE' : 'Project / Task / Resource',
        'HEADER.ROLE' : 'Role',
        'HEADER.HOURS_ESTIMATED' : 'Hours Estimated',
        'HEADER.PERCENT_COMPLETE' : 'Percent Complete',
        'HEADER.PERCENT_ALLOCATED' : 'Percent Allocated',
        'HEADER.HOURS_ALLOCATED' : 'Hours Allocated',
        'HEADER.HOURS_ASSIGNED' : 'Hours Assigned',
        'HEADER.HOURS_WORKED' : 'Hours Worked',
        'HEADER.PERCENT_AVAILABLE' : 'Percent Available',
        'HEADER.RESOURCE' : 'Resource',
        'HEADER.BILLING_CLASS' : 'Billing Class',
        'HEADER.LABOR_COST' : 'Labor Cost',
        'HEADER.SELECT' : 'Select',
        'HEADER.TYPE' : 'Type',
        /*
         * all button / link texts
         */
        'BUTTON.CANCEL' : 'Cancel',
        'BUTTON.PRESET_DAILY' : 'Daily',
        'BUTTON.PRESET_MONTHLY' : 'Monthly',
        'BUTTON.PRESET_WEEKLY' : 'Weekly',
        'BUTTON.NEW_TASK_ASSSIGNMENT' : 'New Task Assignment',
        'BUTTON.NEW_RESOURCE_ALLOCATION' : 'New Resource Allocation',
        'BUTTON.OK' : 'Ok',
        'BUTTON.SAVE' : 'Save',
        'BUTTON.DELETE' : 'Delete',
        'BUTTON.RESTORE_DEFAULT' : 'Restore Default',
        'BUTTON.SEARCH' : 'Search',
        'BUTTON.LOAD_MORE' : 'Load More...',
        'BUTTON.SUBMIT' : 'Submit',
        'BUTTON.RETURN_TO_CRITERIA' : 'Return To Criteria',
        'BUTTON.CLOSE' : 'Close',
        
        /*
         * ROW MENU ITEMS
         */
        'MENU.ADD_PROJECT' : 'Add Project',
        'MENU.HIDE_ALLOCATIONS' : 'Hide Resource Allocations',
        'MENU.SHOW_ALLOCATIONS' : 'Show Resource Allocations',
        'MENU.HIDE_TASKS' : 'Hide Task Assignments',
        'MENU.SHOW_TASKS' : 'Show Task Assignments',
        
        'MENU.EDIT_ALLOCATION' : 'Edit Allocation',
        'MENU.EDIT_ASSIGNMENT' : 'Edit Project Task Assignment',
        
        'MENU.REMOVE_ALLOCATIONS' : 'Remove Allocations',
        /*
         * all tooltip texts
         */
        'TOOLTIP.EXPORT_TO_CSV' : 'Export - CSV',
        'TOOLTIP.EXPORT_TO_XLS' : 'Export - Microsoft ® Excel',
        'TOOLTIP.EXPORT_TO_PDF' : 'Export - PDF',
        'TOOLTIP.PAN_LEFT' : 'Pan Left',
        'TOOLTIP.PAN_RIGHT' : 'Pan Right',
        'TOOLTIP.PRINT' : 'Print',
        'TOOLTIP.READ_ONLY_WORKED_HOURS' : 'Unable to modify Task Assignments with Worked Hours.',
        'TOOLTIP.CANNOT_DELETE_HAS_ASSIGNMENTS' : 'Unable to delete Resource Allocations, one or more Resource have Task Assignments.',
        'TOOLTIP.CANNOT_DELETE_WITH_WORKED_HOURS' : 'Unable to delete Task Assignments with Worked Hours.',
        'TOOLTIP.NO_RECORDS_TO_DELETE' : 'No records to delete.',
        'TOOLTIP.CANNOT_REASSIGN_WITH_WORKED_HOURS' : 'Unable to re-assign Task Assignments with Worked Hours.',
        'TOOLTIP.CANNOT_MODIFY_START_WITH_WORKED_HOURS' : 'Unable to modify Start Date of Task Assignments with Worked Hours.',
        'TOOLTIP.SETTINGS' : 'Settings',
        'TOOLTIP.PROJECT_DETAILS' : 'Project Details',
        'TOOLTIP.PROJECT_NAME' : 'Project Name',
        'TOOLTIP.PERCENT_WORK_COMPLETE' : 'Percent Work Complete',
        'TOOLTIP.ESTIMATED_WORK' : 'Estimated Work',
        'TOOLTIP.ACTUAL_WORK' : 'Actual Work',
        'TOOLTIP.REMAINING_WORK' : 'Remaining Work',
        'TOOLTIP.START_DATE' : 'Start Date',
        'TOOLTIP.CALCULATED_END_DATE' : 'Calculated End Date',
        'TOOLTIP.PROJECT_TASK_ASSIGNMENT' : 'Project Task Assignment',
        'TOOLTIP.RESOURCE_ALLOCATION' : 'Resource Allocation',
        'TOOLTIP.RESOURCE' : 'Resource',
        'TOOLTIP.RESOURCE_DETAILS' : 'Resource Details',
        'TOOLTIP.RESOURCE_SEARCH' : 'Resource Search',
        'TOOLTIP.NO_MORE_PROJECTS_TO_ADD' : 'All Projects are already shown.',
        'TOOLTIP.OPEN' : 'Open',
        
        /* all window title texts */
        'WINDOW.ALLOCATION_SUMMARY' : 'Total Allocations',
        'WINDOW.CUSTOMIZE_VIEW' : 'Customize View',
        'WINDOW.EDIT_ALLOCATION' : 'Edit Allocation',
        'WINDOW.EDIT_ASSIGNMENT' : 'Edit Assignment',
        'WINDOW.EDIT_VIEW' : 'Edit View',
        'WINDOW.VIEW_DETAILS' : 'View Details',
        'WINDOW.NEW_ALLOCATION' : 'New Allocation',
        'WINDOW.NEW_ASSIGNMENT' : 'New Assignment',
        'WINDOW.SEARCH_RESOURCE' : 'Search Resource',
        'WINDOW.SETTINGS' : 'Settings',
        'WINDOW.SEARCH_RESOURCE' : 'Search Resource',
        'WINDOW.SELECT_RESOURCE' : 'Select Resource',
        /*
         * all page masks
         */
        'MASK.LOADING' : 'Loading...',
        'MASK.SAVING' : 'Saving...',
        'MASK.UPDATING' : 'Updating...',

        'ITEMSELECTOR.TO_ADD' : 'Click Selection to Add',
        'ITEMSELECTOR.SELECTION' : 'Current Selection',
        'ITEMSELECTOR.MOVE_UP' : 'Move Up',
        'ITEMSELECTOR.ADD_TO_SELECTED' : 'Add to Selected',
        'ITEMSELECTOR.REMOVE_FROM_SELECTED' : 'Remove from Selected',
        'ITEMSELECTOR.MOVE_DOWN' : 'Move Down',
        
        'MESSAGE.ERROR.REQUIRED_FEATURES' : 'The feature(s) [ ##VAL## ] required to access this page are not enabled in this account.',
        
        'TITLE.SELECT_RESOURCES' : 'Select Resources',
        'TITLE.SELECT_RESOURCE' : 'Select Resource',
        'TITLE.SELECT_PROJECTS' : 'Select Projects',
        'TITLE.SELECT_PROJECT' : 'Select Project',
        'TITLE.SELECT_TASKS' : 'Select Project Tasks',
        'TITLE.SELECT_TASK' : 'Select Project Task',
        'TITLE.SELECT_APPROVER' : 'Select Approver',
        'TITLE.SELECT_CUSTOMERS' : 'Select Customers',
        'TITLE.SELECT_BILLING_CLASS' : 'Select Billing Class'
    },
    /*
     * try to load preferred language and prompt on failure
     */
    constructor : function() {
        this.preferenceMap = {};
        try {
            this.loadPreference();
        } catch(err) {
            alert('Unable to load translations for your preferred Language. Using default Language instead (English).');
        }
    },
    /*
     * load preferred language translations into preferenceMap
     */
    loadPreference : function() {
        this.preferenceMap = prmStringLiterals;
    },
    
    /*
     * return preferred language, otherwise return English translation (default)
     */
    getText : function(key, value) {
        var pref = this.preferenceMap[key];
        var def = this.defaultMap[key];
        if (pref) return value ? pref.replace('##VAL##', value) : pref;
        else if (def) return value ? def.replace('##VAL##', value) : def;
        else return key;
    }
});