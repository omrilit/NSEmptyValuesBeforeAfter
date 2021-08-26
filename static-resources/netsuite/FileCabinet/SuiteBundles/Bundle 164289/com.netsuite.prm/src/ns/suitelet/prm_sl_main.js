/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.MainSL = new function MainSL() {

    this.context; 
    this.stringLiterals;
    
    this.init = function(){
        this.context = nlapiGetContext();
        this.stringLiterals = psa_prm.serverlibrary.getStringLiterals();
    };
    
    this.suiteletEntry = function(request, response){
        this.init();

        var raFeature = this.context.getFeature('resourceallocations');
        
        if (!raFeature) { throw new nlobjError('RUNTIME_ERROR', this.stringLiterals['ERROR.FEATURE.NOT_ENABLED']); }
        
        var form = nlapiCreateForm(this.stringLiterals['MAIN.FORM.TITLE']),
            loadField = form.addField('prm_cs_loading', 'inlinehtml'),
            field = form.addField('prm_cs_scripts', 'inlinehtml');
        
        loadField.setDefaultValue('');
        field.setDefaultValue(this.getInlineHTML(this.getBundlePath(request)));
        
        response.writePage(form);
    };
    
    this.getBundlePath = function getBundlePath(request) {
        var path = [
            request.getURL().substring(0, request.getURL().indexOf('/app')),
            'c.' + this.context.getCompany(),
            this.context.getBundleId() ? ('suitebundle' + this.context.getBundleId()) : 'suiteapp',
            'com.netsuite.prm',
            'src'
        ].join('/');
        
        nlapiLogExecution('DEBUG', 'getBundlePath', path);
        
        return path;
    };
    
    this.getInlineHTML = function getInlineHTML(bundlePath) {
        var isApprovalDisabled = this.context.getPreference('CUSTOMAPPROVALRSRCALLOC') == 'F',
            nsFont = this.context.getPreference('font'),
            nsDateFormat = psa_prm.serverlibrary.getNSDateFormatAsExtJS(),
            html = [],
            libraries = [
                'prm_ext_all_sandbox.js',
                'prm_ext_overrides.js',
                'prm_ext_multiselect.js',
                'prm_ext_itemselector.js'
            ],
            jsFiles = [
                'array.js',
                'prm_ext_translation.js',
                'prm_ext_util_constants.js',
                'prm_ext_util_perf_logs.js',
                'prm_ext_util_work_calendar.js',
                'prm_ext_models.js',
                'prm_ext_stores.js',
                'prm_ext_cmp_editors.js',
                'prm_ext_cmp_columns.js',
                'prm_ext_cmp_buttons.js',
                'prm_ext_cmp_fields.js',
                'prm_ext_components.js',
                'prm_ext_templates.js',
                'prm_ext_cmp_panels.js',
                'prm_ext_cmp_action_menu.js',
                'prm_ext_view_filter.js',
                'prm_ext_view_grid.js',
                'prm_ext_view_toolbar.js',
                'prm_ext_view_tooltips.js',
                'prm_ext_view_form_large_data.js',
                'prm_ext_view_form_resource_search.js',
                'prm_ext_view_form_allocation.js',
                'prm_ext_view_form_assignment.js',
                'prm_ext_view_form_taskassignment.js',
                'prm_ext_view_form_settings.js',
                'prm_ext_view_form_filter.js',
                'prm_ext_view_form_allocation_summary.js',
                'prm_ext_view_form_assignment_search.js',
                'prm_ext_view_form_ns.js',
                'prm_ext_view_form_resource_search_ns.js',
                'prm_ext_view_form_allocation_ns.js',
                'prm_ext_view_form_filter_ns.js',
                'prm_ext_view_forms.js',
                'prm_ext_view_main.js'
            ],
            cssFiles = [
                'prm_ext_theme_classic_sandbox_all.css',
                'prm.css'
            ];

        /*
         * Include CSS files
         */
        html.push('<!-- PROJECT RESOURCE MANAGER Client Scripts -->');
        html.push('<!-- CSS -->');
        cssFiles.forEach(function(cssFile) {
            html.push('<link type="text/css" rel="stylesheet" href="' + bundlePath + '/css/' + cssFile + '" />');
        });
        /*
         * Include external libraries
         */
        html.push('<!-- External Libraries -->');
        libraries.forEach(function(libFile) {
            html.push(psa_prm.serverlibrary.getFileHtmlCode(libFile));
        });
        /*
         * Declare Ext namespace and require all Ext classes
         */
        html.push('<script type="text/javascript">');
        html.push('Ext4.ns("PRM.App");');
        html.push('Ext4.require(["Ext4.*"]);');
        html.push('var isApprovalDisabled = ' + isApprovalDisabled + ',');
        html.push('    nsDateFormat = \'' + nsDateFormat + '\';');
        html.push('    nsFont = \'' + nsFont + '\';');
        html.push('    prmStringLiterals = JSON.parse(\'' + JSON.stringify(this.stringLiterals) + '\');');
        html.push('</script>');
        /*
         * Ext Text Metrics Bind Elements
         */
        html.push('<div id="prm-bind-14px" class="prm-text-metrics" style="display:none;">PRM</div>');
        html.push('<div id="prm-bind-13px" class="prm-text-metrics" style="display:none;">PRM</div>');
        html.push('<div id="prm-bind-12px" class="prm-text-metrics" style="display:none;">PRM</div>');
        /*
         * Include JS Files
         */
        html.push('<!-- JS -->');
        jsFiles.forEach(function(jsFile) {
            html.push(psa_prm.serverlibrary.getFileHtmlCode(jsFile));
        });

        return html.join('\n');
    };
};