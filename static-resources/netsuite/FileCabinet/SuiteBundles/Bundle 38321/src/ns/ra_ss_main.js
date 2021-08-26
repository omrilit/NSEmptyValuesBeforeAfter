/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

isServerLogOn = false;

function EntryPoint(request, response) {
    /*
     * feature checking
     */
    var raFeature = nlapiGetContext().getFeature('resourceallocations');
    if (!raFeature) { throw new nlobjError('RUNTIME_ERROR', RACTranslationManager.getString('SS.MESSAGE.RESOURCE_ALLOC_FEATURE_CHECK')); }
    /*
     * create form and build inline html
     */
    var form = nlapiCreateForm(RACTranslationManager.getString('SS.RESOURCE_ALLOCATIONS').replace('\\',''));
    var loadField = form.addField('psa_racg_main_loading', 'inlinehtml');
    loadField.setDefaultValue('Loading...');
    var field = form.addField('rac_cs_scripts', 'inlinehtml');
    field.setDefaultValue(getInlineHTML(getBundlePath(request)));
    response.writePage(form);
}

function getBundleId() {
    return nlapiGetContext().getBundleId() || '242664'; // replace with local copy bundle id
}

function getBundlePath(request) {
    var url = request.getURL().substring(0, request.getURL().indexOf('/app'));
    var companyID = nlapiGetContext().getCompany();
    var bundleID = getBundleId();
    var path = url + '/c.' + companyID + "/suitebundle" + bundleID + '/src';
    nlapiLogExecution('DEBUG', 'path', path);
    return path;
}

function getFileURL(fileName) {
    var result = nlapiSearchRecord("file", null, [
        new nlobjSearchFilter("name", null, 'is', fileName)
    ], [
        new nlobjSearchColumn("url")
    ]);
    return result == null ? null : result[0].getValue("url");
}

function getInlineHTML(bundlePath) {
    var bundleID = getBundleId(),
        html = [],
        libraries = [
            'ra-ext-all-sandbox-debug.js',
            'ra-sch-all.js',
            'ra-MultiSelect.js',
            'ra-ItemSelector.js'
        ],
        jsFiles = [
            /*
             * load util files first
             */
            'ra_cs_constant.js',
            'ra_cs_util.js',
            'ra_cs_perf_test.js',
            'ra_cs_override.js',
            'ra_cs_netsuite.js',

            /*
             * data
             */
            'ra_cs_model.js',
            'ra_cs_store_chart_allocation.js',
            'ra_cs_store_chart_resource.js',
            'ra_cs_store_combobox.js',
            'ra_cs_store_data_count.js',
            'ra_cs_store_export.js',
            'ra_cs_store_grid.js',
            'ra_cs_store_setting.js',
            'ra_cs_store_time_off.js',
            'ra_cs_store.js',
            'ra_cs_cache_base.js',
            'ra_cs_cache_customer.js',
            'ra_cs_cache.js',
            
            /*
             * ui components
             */
            'ra_cs_button.js',
            'ra_cs_column.js',
            'ra_cs_custom.js',
            'ra_cs_menu.js',
            'ra_cs_mode_manager.js',
            'ra_cs_panel.js',
            'ra_cs_template.js',
            'ra_cs_toolbar.js',
            'ra_cs_tooltip.js',
            'ra_cs_ux.js',
            'ra_cs_view_preset.js',
            'ra_cs_window.js',
            
            /*
             * field
             */
            'ra_cs_multiselect.js',
            'ra_cs_checkbox.js',
            'ra_cs_combobox.js',
            'ra_cs_date.js',
            'ra_cs_display.js',
            'ra_cs_field_container.js',
            'ra_cs_number.js',
            'ra_cs_radio.js',
            'ra_cs_text.js',
            'ra_cs_trigger.js',
            
            /*
             * large data fields
             */
            'ra_cs_single_select.js',
            'ra_cs_multi_select.js',
            
            /*
             * form
             */
            'ra_cs_form_grid_cell_editor.js',
            'ra_cs_form_grid_editor.js',
            'ra_cs_form_field_editor.js',
            'ra_cs_form_filter.js',
            'ra_cs_form_large_data.js',
            'ra_cs_form_large_multiselect.js',
            'ra_cs_form_ra_edit.js',
            'ra_cs_form_ra_new.js',
            'ra_cs_form_ra_reassign.js',
            'ra_cs_form_resource_search.js',
            'ra_cs_form_setting.js',
            'ra_cs_form.js',
            
            /*
             * main_view
             */
            'ra_cs_view_menu.js',
            'ra_cs_view_filter.js',
            'ra_cs_view_toolbar.js',
            'ra_cs_view_grid.js',
            'ra_cs_view_chart.js'
        ],
        cssSoftURL = getFileURL('pattern_soft_alloc.png'),
        cssNonWorkingURL = getFileURL('pattern_non_working.png'),
        cssRecurringURL = getFileURL('recurrenceIcon.png');
    
    /*
     * Include CSS files
     */
    html.push('<!-- Resource Allocation Chart/Grid Client Scripts -->');
    html.push('<!-- CSS -->');
    html.push('<link type="text/css" rel="stylesheet" href="' + bundlePath + '/ui/css/ra-ext-theme-classic-sandbox-all.css" />');
    html.push('<link type="text/css" rel="stylesheet" href="' + bundlePath + '/ui/css/ra-sch-all.css" />');
    html.push('<link type="text/css" rel="stylesheet" href="' + bundlePath + '/ui/css/ra.css" />');
    html.push('<link type="text/css" rel="stylesheet" href="' + bundlePath + '/ui/css/ux/ra-ItemSelector.css" />');
    /*
     * Include external libraries
     */
    html.push('<!-- External Libraries -->');
    libraries.forEach(function(libFile) {
        html.push(psa_ra.serverlibrary.getFileHtmlCode(libFile, bundleID));
    });
    
    /*
     * Declare Ext namespace and require all Ext and Bryntum classes
     */
    html.push('<script type="text/javascript">');
    //html.push('Ext4.ns("RA.App");');
    //html.push('Ext4.require(["Ext4.*", "Sch.*"]);');
    html.push('var nsBundleId = ' + bundleID + ';');
    html.push('var cssSoftURL = "' + cssSoftURL + '";');
    html.push('var cssNonWorkingURL = "' + cssNonWorkingURL + '";');
    html.push('var cssRecurringURL = "' + cssRecurringURL + '";');
    html.push('</script>');
    /*
     * Ext Text Metrics Bind Elements
     */
    html.push('<div id="ra-bind-14px" class="ra-text-metrics" style="display:none;">RAC</div>');
    html.push('<div id="ra-bind-13px" class="ra-text-metrics" style="display:none;">RAC</div>');
    html.push('<div id="ra-bind-12px" class="ra-text-metrics" style="display:none;">RAC</div>');
    /*
     * Include translations
     */
    html.push('<!-- Translations -->');
    html.push('<script type="text/javascript">');
    html.push("var defaultRESXString = '" + RACTranslationManager.defaultRESXString + "'");
    html.push("var prefRESXString = '" + RACTranslationManager.prefRESXString + "'");
    html.push('</script>');
    html.push(psa_ra.serverlibrary.getFileHtmlCode('ext-lang-' + RACTranslationManager.getEXTLang() + '.js', bundleID));
    html.push(psa_ra.serverlibrary.getFileHtmlCode('ra_cs_translation.js', bundleID));
    /*
     * Include all RACG modules
     */
    html.push('<!-- Modules -->');
    jsFiles.forEach(function(jsFile) {
        html.push(psa_ra.serverlibrary.getFileHtmlCode(jsFile, bundleID));
    });
    
    /*
     * Include main client script
     */
    html.push('<!-- Main -->');
    html.push(psa_ra.serverlibrary.getFileHtmlCode('ra_cs_main.js', bundleID));
    
    return html.join('\n');
};
