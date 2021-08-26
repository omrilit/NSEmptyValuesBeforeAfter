/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.Report = TAF.Report || {};
TAF.Report.ES_SII_InvestmentGoodsRegister_Report = function _ES_SII_InvestmentGoodsRegister_Report(state, params, output, job) {
    this.GetOutline = function() {
        return { 'Section': TAF.ES.Section.SIIMainSection.bind(this, state, params, output, job), 'SubSections': [
                { 'Section': TAF.ES.Section.SIIHeaderSection.bind(this, state, params, output, job) }, // Cabecera
                { 'Section': TAF.ES.Section.InvestmentGoodsRegisterSection.bind(this, state, params, output, job) } // RegistroLRfacturasEmitidas
        ]};
    };
};

function ES_SII_InvestmentGoodsRegister_Report(state, params, output, job) {
    params.formatter = new TAF.ES.Formatter.InvestmentGoodsRegisterFormatter('InvestmentGoodsRegister');
    params.filename = '';
    params.reportId = TAF.SII.CONSTANTS.REPORT.INVESTMENT_GOODS_REGISTER;
    TAF.Report.ES_SII_InvestmentGoodsRegister_Report.call(this, state, params, output, job);
}
ES_SII_InvestmentGoodsRegister_Report.prototype = Object.create(TAF.Report.ES_SII_InvestmentGoodsRegister_Report.prototype);
ES_SII_InvestmentGoodsRegister_Report.IsCRGReport = true;
ES_SII_InvestmentGoodsRegister_Report.ReportId = TAF.SII.CONSTANTS.REPORT.INVESTMENT_GOODS_REGISTER;
