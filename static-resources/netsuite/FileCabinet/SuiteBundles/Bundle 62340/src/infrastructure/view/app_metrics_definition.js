/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is the list of metrics definitions.
 *
 * @author cboydon
 */

var view = view || {};

view.MetricsDefinitionList = function MetricsDefinitionList () {
  var metricDefList = [];

  // Number of Dunning Letters Printed of the Previous Month
  var metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Number of Dunning Letters Printed of the Previous Month';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultCountImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_ltr_printed_prev_month',
    savedSearchRec: 'customrecord_3805_dunning_eval_result'
  };
  metricDefList.push(metricsDefinition);

  // Number of Dunning Letters Emailed of the Previous Month
  metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Number of Dunning Letters Emailed of the Previous Month';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultCountImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_ltr_emailed_prev_month',
    savedSearchRec: 'customrecord_3805_dunning_eval_result'
  };
  metricDefList.push(metricsDefinition);

  // Number of Customers with Dunning Procedures
  metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Number of Customers with Dunning Procedures';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultCountImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_customers_w_dp',
    savedSearchRec: 'customer'
  };
  metricDefList.push(metricsDefinition);

  // Number of Dunned Customers of the Previous Month
  metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Number of Dunned Customers of the Previous Month';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultCountImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_dunned_cust_prev_month',
    savedSearchRec: 'customrecord_3805_dunning_eval_result'
  };
  metricDefList.push(metricsDefinition);

  // Number of Dunning Procedures as of End of Period
  metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Number of Dunning Procedures as of End of Period';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultCountImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_dunning_proc_eop',
    savedSearchRec: 'customrecord_3805_dunning_procedure'
  };
  metricDefList.push(metricsDefinition);

  // Number of Dunning Templates as of End of Period
  metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Number of Dunning Templates as of End of Period';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultCountImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_dunning_temp_eop',
    savedSearchRec: 'customrecord_3805_dunning_template'
  };
  metricDefList.push(metricsDefinition);

  // Average Number of Languages used in Email Dunning Templates
  metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Average Number of Languages used in Email Dunning Templates';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultAverageImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_avg_lang_email_temp',
    savedSearchRec: 'customrecord_3805_dunning_template_doc'
  };
  metricDefList.push(metricsDefinition);

  // Average Number of Languages used in PDF Dunning Templates
  metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Average Number of Languages used in PDF Dunning Templates';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultAverageImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_avg_lang_pdf_temp',
    savedSearchRec: 'customrecord_3805_dunning_template_doc'
  };
  metricDefList.push(metricsDefinition);

  // Number of Dunning Level Rules as of End of Period
  metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Number of Dunning Level Rules as of End of Period';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultCountImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_dunning_temp_rules_eop',
    savedSearchRec: 'customrecord_3805_dunning_eval_rule'
  };
  metricDefList.push(metricsDefinition);

  // Average Number of Currencies Used in a Dunning Level Rule
  metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Average Number of Currencies Used in a Dunning Level Rule';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultAverageImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_avg_curr_dl_rule',
    savedSearchRec: 'customrecord_3805_der_amount'
  };
  metricDefList.push(metricsDefinition);

  // Number of Employees with Dunning Roles and Permissions as of End of Period
  metricsDefinition = new view.MetricsDefinition();
  metricsDefinition.label = 'Number of Employees with Dunning Roles and Permissions as of End of Period';
  metricsDefinition.metricsCollectorImpl = 'infra.app.MetricsCollectorSearchResultCountImpl';
  metricsDefinition.properties = {
    savedSearchId: 'customsearch_3805_emp_roles_perm_eop',
    savedSearchRec: 'employee'
  };
  metricDefList.push(metricsDefinition);

  return metricDefList;
};
