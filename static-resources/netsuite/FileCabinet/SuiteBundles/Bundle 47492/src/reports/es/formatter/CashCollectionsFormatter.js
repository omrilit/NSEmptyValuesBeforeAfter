/**
 * Copyright � 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Formatter = TAF.ES.Formatter || {};

TAF.ES.Formatter.CashCollectionsFormatter = function _CashCollectionsFormatter(fileName) {
    TAF.ES.Formatter.ReportFormatter.call(this);
    this.Name = 'ESCashCollectionsFormatter';
	this.FILE_NAME = fileName;
	this.FILE_EXTENSION = 'xml';
    this.TEMPLATE.TRANSACTION = {
        SUMINISTRO: {
            HEADER: '<siiLR:SuministroLRCobrosMetalico>',
            FOOTER: '</siiLR:SuministroLRCobrosMetalico>'
        },
        CABECERA: ['<sii:Cabecera>',
                   '<sii:IDVersionSii>{version}</sii:IDVersionSii>',
                   '<sii:Titular>',
                   '<sii:NombreRazon>{name}</sii:NombreRazon>',
                   '<sii:NIF>{vatNo}</sii:NIF>',
                   '</sii:Titular>',
                   '<sii:TipoComunicacion>{submissionType}</sii:TipoComunicacion>',
                   '</sii:Cabecera>'].join(''),
        REGISTRO_LR_COBROS_METALICO: {
            HEADER: '<siiLR:RegistroLRCobrosMetalico>',
            FOOTER: '</siiLR:RegistroLRCobrosMetalico>'
        },
        PERIODO_LIQUIDACION: ['<sii:PeriodoLiquidacion>',
                             '<sii:Ejercicio>{year}</sii:Ejercicio>',
                             '<sii:Periodo>{period}</sii:Periodo>',
                             '</sii:PeriodoLiquidacion>'].join(''),
        IMPORTE_TOTAL: '<siiLR:ImporteTotal>{total}</siiLR:ImporteTotal>',
        CONTRAPARTE: {
            HEADER: '<siiLR:Contraparte>',
            FOOTER: '</siiLR:Contraparte>'
        },
        NOMBRE_RAZON: '<sii:NombreRazon>{name}</sii:NombreRazon>',
        NIF: '<sii:NIF>{vatNo}</sii:NIF>',
        IDOTRO: {
            HEADER: '<sii:IDOtro>',
            FOOTER: '</sii:IDOtro>'
        },
        CODIGO_PAIS: '<sii:CodigoPais>{customerCountryCode}</sii:CodigoPais>',
        ID_TYPE: '<sii:IDType>{customerIdType}</sii:IDType>',
        ID: '<sii:ID>{customerId}</sii:ID>'
    };
};
TAF.ES.Formatter.CashCollectionsFormatter.prototype = Object.create(TAF.ES.Formatter.ReportFormatter.prototype);

TAF.ES.Formatter.CashCollectionsFormatter.prototype.getNamespace = function _getNamespace() {
	return [
		{ prefix: 'sii', url: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroInformacion.xsd' },
		{ prefix: 'siiLR', url: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroLR.xsd' }
	];
};

TAF.ES.Formatter.CashCollectionsFormatter.prototype.getRegistroLRcobrosMetalico = function _getRegistroLRcobrosMetalico(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.REGISTRO_LR_COBROS_METALICO.HEADER;
    section += this.formatElement({ year: txnObject.year, period: TAF.SII.CONSTANTS.PERIOD_ANNUAL }, this.TEMPLATE.TRANSACTION.PERIODO_LIQUIDACION);
    section += this.getContraparte(txnObject);
    section += this.formatElement({ total: txnObject.grossAmount }, this.TEMPLATE.TRANSACTION.IMPORTE_TOTAL);
    section += this.TEMPLATE.TRANSACTION.REGISTRO_LR_COBROS_METALICO.FOOTER;

    return section;
};

TAF.ES.Formatter.CashCollectionsFormatter.prototype.getContraparte = function _getContraparte(txnObject) {
    var section = '';

    section += this.TEMPLATE.TRANSACTION.CONTRAPARTE.HEADER;
    section += this.formatElement({ name: txnObject.customerName }, this.TEMPLATE.TRANSACTION.NOMBRE_RAZON);

    if (txnObject.customerIdType) {
        section += this.getIDOtro(txnObject);
    } else {
        section += this.formatElement({ vatNo: txnObject.customerVatNo }, this.TEMPLATE.TRANSACTION.NIF);
    }

    section += this.TEMPLATE.TRANSACTION.CONTRAPARTE.FOOTER;

    return section;
};

TAF.ES.Formatter.CashCollectionsFormatter.prototype.getIDOtro = function _getIDOtro(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.IDOTRO.HEADER;

    if (txnObject.customerIdType && txnObject.customerIdType !== TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT) {
        section += this.formatElement({ customerCountryCode: txnObject.customerCountryCode }, this.TEMPLATE.TRANSACTION.CODIGO_PAIS);
    }
    section += this.formatElement({ customerIdType: txnObject.customerIdType }, this.TEMPLATE.TRANSACTION.ID_TYPE);
    section += this.formatElement({ customerId: txnObject.customerId }, this.TEMPLATE.TRANSACTION.ID);

    section += this.TEMPLATE.TRANSACTION.IDOTRO.FOOTER;

    return section;
};

TAF.ES.Formatter.CashCollectionsFormatter.prototype.formatFileName = function _formatFileName(startDate, fileIndex) {
    if (!this.FILE_NAME) {
        throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.formatFileName: this.FILE_NAME is a required parameter');
    }
    if (!startDate) {
        throw nlapiCreateError('MISSING_PARAMETER', startDate + '.formatFileName: startDate is a required parameter');
    }

    var startDateStr = nlapiDateToString(startDate);
    var fileName = this.FILE_NAME;

    fileName += '_' + this.formatDate(startDateStr, 'yyyy');
    
    if (fileIndex) {
        fileName += '_' + fileIndex;
    }

    return fileName + '.' + this.FILE_EXTENSION;
};
