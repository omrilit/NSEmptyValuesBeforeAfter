/**
 * Copyright � 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Formatter = TAF.ES.Formatter || {};

TAF.ES.Formatter.InvestmentGoodsRegisterFormatter = function _InvestmentGoodsRegisterFormatter(fileName) {
    TAF.ES.Formatter.ReportFormatter.call(this);
    this.Name = 'ESInvestmentGoodsRegister';
    this.FILE_NAME = fileName;
    this.FILE_EXTENSION = 'xml';
    this.TEMPLATE.TRANSACTION = {
        SUMINISTRO: {
            HEADER: '<sii:SuministroLRBienesInversion>',
            FOOTER: '</sii:SuministroLRBienesInversion>'
        },
        CABECERA: ['<sii1:Cabecera>',
                   '<sii1:IDVersionSii>{version}</sii1:IDVersionSii>',
                   '<sii1:Titular>',
                   '<sii1:NombreRazon>{name}</sii1:NombreRazon>',
                   '<sii1:NIF>{vatNo}</sii1:NIF>',
                   '</sii1:Titular>',
                   '<sii1:TipoComunicacion>{submissionType}</sii1:TipoComunicacion>',
                   '</sii1:Cabecera>'].join(''),
        REGISTRO_LR_BIENES_INVERSION: {
            HEADER: '<sii:RegistroLRBienesInversion>',
            FOOTER: '</sii:RegistroLRBienesInversion>'
        },
        PERIODO_LIQUIDACION: ['<sii1:PeriodoLiquidacion>',
                             '<sii1:Ejercicio>{year}</sii1:Ejercicio>',
                             '<sii1:Periodo>{period}</sii1:Periodo>',
                             '</sii1:PeriodoLiquidacion>'].join(''),
        ID_FACTURA: {
            HEADER: '<sii:IDFactura>',
            FOOTER: '</sii:IDFactura>'
        },
        ID_EMISOR_FACTURA: {
            HEADER: '<sii1:IDEmisorFactura>',
            FOOTER: '</sii1:IDEmisorFactura>'
        },
        NUM_SERIE_FACTURA_EMISOR: '<sii1:NumSerieFacturaEmisor>{tranId}</sii1:NumSerieFacturaEmisor>',
        FECHA_EXPEDICION_FACTURA_EMISOR: '<sii1:FechaExpedicionFacturaEmisor>{invoiceDate}</sii1:FechaExpedicionFacturaEmisor>',
        NOMBRE_RAZON: '<sii1:NombreRazon>{name}</sii1:NombreRazon>',
        NIF: '<sii1:NIF>{vatNo}</sii1:NIF>',
        IDOTRO: {
            HEADER: '<sii1:IDOtro>',
            FOOTER: '</sii1:IDOtro>'
        },
        CODIGO_PAIS: '<sii1:CodigoPais>{vendorCountryCode}</sii1:CodigoPais>',
        ID_TYPE: '<sii1:IDType>{vendorIdType}</sii1:IDType>',
        ID: '<sii1:ID>{vendorId}</sii1:ID>',
        TIPO_DESGLOSE: {
            HEADER: '<sii1:TipoDesglose>',
            FOOTER: '</sii1:TipoDesglose>'
        },
        BIENES_INVERSION: {
            HEADER: '<sii:BienesInversion>',
            FOOTER: '</sii:BienesInversion>'
        },
        IDENTIFICACION_BIEN: '<sii1:IdentificacionBien>{itemName}</sii1:IdentificacionBien>',
        FECHA_INICIO_UTILIZACION: '<sii1:FechaInicioUtilizacion>{date}</sii1:FechaInicioUtilizacion>',
        PRORRATA_ANUAL_DEFINITIVA: '<sii1:ProrrataAnualDefinitiva>{annualProRate}</sii1:ProrrataAnualDefinitiva>',
        REF_EXTERNA: '<sii1:RefExterna>{externalReference}</sii1:RefExterna>'
    };
};
TAF.ES.Formatter.InvestmentGoodsRegisterFormatter.prototype = Object.create(TAF.ES.Formatter.ReportFormatter.prototype);

TAF.ES.Formatter.InvestmentGoodsRegisterFormatter.prototype.getNamespace = function _getNamespace() {
    return [
        { prefix: 'sii', url: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroLR.xsd' },
        { prefix: 'sii1', url: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroInformacion.xsd' }
    ];
};

TAF.ES.Formatter.InvestmentGoodsRegisterFormatter.prototype.getRegistroLRbienesInversion = function _getRegistroLRbienesInversion(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.REGISTRO_LR_BIENES_INVERSION.HEADER;
    section += this.formatElement({ year: txnObject.year, period: TAF.SII.CONSTANTS.PERIOD_ANNUAL }, this.TEMPLATE.TRANSACTION.PERIODO_LIQUIDACION);
    section += this.getIdFactura(txnObject);
    section += this.getBienesInversion(txnObject, 'lines');
    section += this.TEMPLATE.TRANSACTION.REGISTRO_LR_BIENES_INVERSION.FOOTER;

    return section;
};

TAF.ES.Formatter.InvestmentGoodsRegisterFormatter.prototype.getIdFactura = function _getIdFactura(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.ID_FACTURA.HEADER;
    section += this.getIdEmisorFactura(txnObject);
    section += this.formatElement({ tranId: txnObject.tranId }, this.TEMPLATE.TRANSACTION.NUM_SERIE_FACTURA_EMISOR);
    section += this.formatElement({ invoiceDate: txnObject.invoiceDate || txnObject.tranDate }, this.TEMPLATE.TRANSACTION.FECHA_EXPEDICION_FACTURA_EMISOR);
    section += this.TEMPLATE.TRANSACTION.ID_FACTURA.FOOTER;

    return section;
};

TAF.ES.Formatter.InvestmentGoodsRegisterFormatter.prototype.getIdEmisorFactura = function _getIdEmisorFactura(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.ID_EMISOR_FACTURA.HEADER;
    section += this.formatElement({ name: txnObject.vendorName }, this.TEMPLATE.TRANSACTION.NOMBRE_RAZON);

    if (txnObject.vendorIdType) {
        section += this.getIDOtro(txnObject);
    } else {
        section += this.formatElement({ vatNo: txnObject.vendorVatNo }, this.TEMPLATE.TRANSACTION.NIF);
    }
    
    section += this.TEMPLATE.TRANSACTION.ID_EMISOR_FACTURA.FOOTER;

    return section;
};

TAF.ES.Formatter.InvestmentGoodsRegisterFormatter.prototype.getIDOtro = function _getIDOtro(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.IDOTRO.HEADER;

    if (txnObject.vendorIdType && txnObject.vendorIdType !== TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT) {
        section += this.formatElement({ vendorCountryCode: txnObject.vendorCountryCode }, this.TEMPLATE.TRANSACTION.CODIGO_PAIS);
    }
    section += this.formatElement({ vendorIdType: txnObject.vendorIdType }, this.TEMPLATE.TRANSACTION.ID_TYPE);
    section += this.formatElement({ vendorId: txnObject.vendorId }, this.TEMPLATE.TRANSACTION.ID);

    section += this.TEMPLATE.TRANSACTION.IDOTRO.FOOTER;

    return section;
};

TAF.ES.Formatter.InvestmentGoodsRegisterFormatter.prototype.getBienesInversion = function _getBienesInversion(txnObject, listName) {
    var section = '';

    for (var i = 0; i < txnObject[listName].length; i++) {
        section += this.TEMPLATE.TRANSACTION.BIENES_INVERSION.HEADER;
        section += this.formatElement({ itemName: txnObject[listName][i].itemName }, this.TEMPLATE.TRANSACTION.IDENTIFICACION_BIEN);
        section += this.formatElement({ date: txnObject[listName][i].serviceDate }, this.TEMPLATE.TRANSACTION.FECHA_INICIO_UTILIZACION);
        section += this.formatElement({ annualProRate: txnObject[listName][i].annualProrate }, this.TEMPLATE.TRANSACTION.PRORRATA_ANUAL_DEFINITIVA);
        section += txnObject.externalReference ? this.formatElement({ externalReference: txnObject.externalReference }, this.TEMPLATE.TRANSACTION.REF_EXTERNA): '';
        section += this.TEMPLATE.TRANSACTION.BIENES_INVERSION.FOOTER;
    }

    return section;
};

TAF.ES.Formatter.InvestmentGoodsRegisterFormatter.prototype.formatFileName = function _formatFileName(startDate, fileIndex) {
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