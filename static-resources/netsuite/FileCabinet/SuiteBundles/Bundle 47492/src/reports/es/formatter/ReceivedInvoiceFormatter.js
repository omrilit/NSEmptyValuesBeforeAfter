/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Formatter = TAF.ES.Formatter || {};

TAF.ES.Formatter.ReceivedInvoiceFormatter = function _ReceivedInvoiceFormatter(fileName) {
    TAF.ES.Formatter.ReportFormatter.call(this);
    this.Name = 'ESReceivedInvoiceFormatter';
	this.FILE_NAME = fileName;
	this.FILE_EXTENSION = 'xml';
    this.TEMPLATE.TRANSACTION = {
        SUMINISTRO: {
            HEADER: '<siiLR:SuministroLRFacturasRecibidas>',
            FOOTER: '</siiLR:SuministroLRFacturasRecibidas>'
        },
        CABECERA: ['<sii:Cabecera>',
                   '<sii:IDVersionSii>{version}</sii:IDVersionSii>',
                   '<sii:Titular>',
                   '<sii:NombreRazon>{name}</sii:NombreRazon>',
                   '<sii:NIF>{vatNo}</sii:NIF>',
                   '</sii:Titular>',
                   '<sii:TipoComunicacion>{submissionType}</sii:TipoComunicacion>',
                   '</sii:Cabecera>'].join(''),
        REGISTRO_LR_FACTURAS_RECIBIDAS: {
            HEADER: '<siiLR:RegistroLRFacturasRecibidas>',
            FOOTER: '</siiLR:RegistroLRFacturasRecibidas>'
        },
        PERIODO_LIQUIDACION: ['<sii:PeriodoLiquidacion>',
                             '<sii:Ejercicio>{year}</sii:Ejercicio>',
                             '<sii:Periodo>{month}</sii:Periodo>',
                             '</sii:PeriodoLiquidacion>'].join(''),
        ID_FACTURA: {
            HEADER: '<siiLR:IDFactura>',
            FOOTER: '</siiLR:IDFactura>'
        },
        ID_EMISOR_FACTURA: {
            HEADER: '<sii:IDEmisorFactura>',
            FOOTER: '</sii:IDEmisorFactura>'
        },
        NUM_SERIE_FACTURA_EMISOR: '<sii:NumSerieFacturaEmisor>{tranId}</sii:NumSerieFacturaEmisor>',
        FECHA_EXPEDICION_FACTURA_EMISOR: '<sii:FechaExpedicionFacturaEmisor>{invoiceDate}</sii:FechaExpedicionFacturaEmisor>',
        FACTURA_RECIBIDA: {
            HEADER: '<siiLR:FacturaRecibida>',
            FOOTER: '</siiLR:FacturaRecibida>',
        },
        TIPO_FACTURA: '<sii:TipoFactura>{invoiceType}</sii:TipoFactura>',
        TIPO_RECTIFICATIVA: '<sii:TipoRectificativa>{correctedInvoiceType}</sii:TipoRectificativa>',
        FACTURAS_RECTIFICADAS: {
            HEADER: '<sii:FacturasRectificadas>',
            FOOTER: '</sii:FacturasRectificadas>'
        },
        ID_FACTURA_RECTIFICADA: {
            HEADER: '<sii:IDFacturaRectificada>',
            FOOTER: '</sii:IDFacturaRectificada>'
        },
        FECHA_OPERACION: '<sii:FechaOperacion>{operationDate}</sii:FechaOperacion>',
        CLAVE_REGIMEN_ESPECIAL_O_TRASCENDENCIA: '<sii:ClaveRegimenEspecialOTrascendencia>{specialSchemeCode}</sii:ClaveRegimenEspecialOTrascendencia>',
        IMPORTE_TOTAL: '<sii:ImporteTotal>{total}</sii:ImporteTotal>',
        DESCRIPCION_OPERACION: '<sii:DescripcionOperacion>{description}</sii:DescripcionOperacion>',
        REF_EXTERNA: '<sii:RefExterna>{externalReference}</sii:RefExterna>',
        FACTURA_SIMPLIFICADA_ARTICULOS: '<sii:FacturaSimplificadaArticulos7.2_7.3>{isArticle72_73}</sii:FacturaSimplificadaArticulos7.2_7.3>',
        REG_PREVIO_GGEE_REDEME_COMPETENCIA: '<sii:RegPrevioGGEEoREDEMEoCompetencia>{isNotReportedInTime}</sii:RegPrevioGGEEoREDEMEoCompetencia>',
        MACRODATO: '<sii:Macrodato>{isMacroData}</sii:Macrodato>',
        DESGLOSE_FACTURA: {
            HEADER: '<sii:DesgloseFactura>',
            FOOTER: '</sii:DesgloseFactura>'
        },
        CONTRAPARTE: {
            HEADER: '<sii:Contraparte>',
            FOOTER: '</sii:Contraparte>'
        },
        NOMBRE_RAZON: '<sii:NombreRazon>{name}</sii:NombreRazon>',
        NIF: '<sii:NIF>{vatNo}</sii:NIF>',
        IDOTRO: {
            HEADER: '<sii:IDOtro>',
            FOOTER: '</sii:IDOtro>'
        },
        CODIGO_PAIS: '<sii:CodigoPais>{countryCode}</sii:CodigoPais>',
        ID_TYPE: '<sii:IDType>{idType}</sii:IDType>',
        ID: '<sii:ID>{id}</sii:ID>',
        INVERSION_SUJETO_PASIVO: {
            HEADER: '<sii:InversionSujetoPasivo>',
            FOOTER: '</sii:InversionSujetoPasivo>'
        },
        DESGLOSE_IVA: {
            HEADER: '<sii:DesgloseIVA>',
            FOOTER: '</sii:DesgloseIVA>'
        },
        TIPO_NO_EXENTA: '<sii:TipoNoExenta>{exemptionClassification}</sii:TipoNoExenta>',
        DETALLE_IVA: {
            HEADER: '<sii:DetalleIVA>',
            FOOTER: '</sii:DetalleIVA>'
        },
        TIPO_IMPOSITIVO: '<sii:TipoImpositivo>{taxRate}</sii:TipoImpositivo>',
        BASE_IMPONIBLE: '<sii:BaseImponible>{signedAmount}</sii:BaseImponible>',
        CUOTA_SOPORTADA: '<sii:CuotaSoportada>{taxAmount}</sii:CuotaSoportada>',
        TIPO_RECARGO_EQUIVALENCIA: '<sii:TipoRecargoEquivalencia>{taxRate}</sii:TipoRecargoEquivalencia>',
        CUOTA_RECARGO_EQUIVALENCIA: '<sii:CuotaRecargoEquivalencia>{taxAmount}</sii:CuotaRecargoEquivalencia>',
        PORECENT_COMPENSACION_REAGYP: '<sii:PorcentCompensacionREAGYP>{taxRate}</sii:PorcentCompensacionREAGYP>',
        IMPORTE_COMPENSACION_REAGYP: '<sii:ImporteCompensacionREAGYP>{taxAmount}</sii:ImporteCompensacionREAGYP>',
        FECHA_REG_CONTABLE: '<sii:FechaRegContable>{date}</sii:FechaRegContable>',
        CUOTA_DEDUCIBLE: '<sii:CuotaDeducible>{amount}</sii:CuotaDeducible>'
    };
};
TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype = Object.create(TAF.ES.Formatter.ReportFormatter.prototype);

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getNamespace = function _getNamespace() {
	return [
		{ prefix: 'sii', url: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroInformacion.xsd' },
		{ prefix: 'siiLR', url: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroLR.xsd' }
	];
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getRegistroLRfacturasRecibidas = function _getRegistroLRfacturasRecibidas(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.REGISTRO_LR_FACTURAS_RECIBIDAS.HEADER;

    section += this.formatElement({ year: txnObject.year, month: txnObject.month }, this.TEMPLATE.TRANSACTION.PERIODO_LIQUIDACION);
    section += this.getIdFactura(txnObject);
    section += this.getFacturaRecibida(txnObject);
    section += this.TEMPLATE.TRANSACTION.REGISTRO_LR_FACTURAS_RECIBIDAS.FOOTER;

    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getIdFactura = function _getIdFactura(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.ID_FACTURA.HEADER;

    section += this.getIdEmisorFactura(txnObject);
    section += this.formatElement({ tranId: txnObject.tranId }, this.TEMPLATE.TRANSACTION.NUM_SERIE_FACTURA_EMISOR);
    section += this.formatElement({ invoiceDate:  txnObject.invoiceDate || txnObject.tranDate }, this.TEMPLATE.TRANSACTION.FECHA_EXPEDICION_FACTURA_EMISOR);
    section += this.TEMPLATE.TRANSACTION.ID_FACTURA.FOOTER;

    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getIdEmisorFactura = function _getIdEmisorFactura(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.ID_EMISOR_FACTURA.HEADER;

    if (txnObject.vendorIdType) {
        section += this.getIDOtro(txnObject);
    } else {
        if (txnObject.invoiceType === 'F5' || txnObject.invoiceType === 'LC' ) {
            section += this.formatElement({ vatNo: txnObject.vatNo }, this.TEMPLATE.TRANSACTION.NIF);
        }
        else {
            section += this.formatElement({ vatNo: txnObject.vendorVatNo }, this.TEMPLATE.TRANSACTION.NIF);
        }
    }
    section += this.TEMPLATE.TRANSACTION.ID_EMISOR_FACTURA.FOOTER;

    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getIDOtro = function _getIDOtro(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.IDOTRO.HEADER;

    if (txnObject.vendorIdType && txnObject.vendorIdType !== TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT) {
        section += this.formatElement({ countryCode: txnObject.vendorCountryCode }, this.TEMPLATE.TRANSACTION.CODIGO_PAIS);
    }
    section += this.formatElement({ idType: txnObject.vendorIdType }, this.TEMPLATE.TRANSACTION.ID_TYPE);
    section += this.formatElement({ id: txnObject.vendorId }, this.TEMPLATE.TRANSACTION.ID);
    section += this.TEMPLATE.TRANSACTION.IDOTRO.FOOTER;

    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getFacturaRecibida = function _getFacturaRecibida(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.FACTURA_RECIBIDA.HEADER;
    var SPECIAL_SCHEME_CODE_OR_EFFECT_ON_INVOICES_RECEIVED = '08';

    section += this.formatElement({ invoiceType: txnObject.invoiceType }, this.TEMPLATE.TRANSACTION.TIPO_FACTURA);
    if (this.isAmendingTransaction(txnObject.invoiceType)) {
        section += this.formatElement({ correctedInvoiceType: txnObject.correctedInvoiceType }, this.TEMPLATE.TRANSACTION.TIPO_RECTIFICATIVA);
        section += this.getFacturasRectificadas(txnObject);
    }
    section += txnObject.operationDate ? this.formatElement({ operationDate: txnObject.operationDate }, this.TEMPLATE.TRANSACTION.FECHA_OPERACION) : '';
    section += this.formatElement({ specialSchemeCode: txnObject.specialSchemeCode }, this.TEMPLATE.TRANSACTION.CLAVE_REGIMEN_ESPECIAL_O_TRASCENDENCIA);
    section += this.formatElement({ total: txnObject.total }, this.TEMPLATE.TRANSACTION.IMPORTE_TOTAL);
    section += this.formatElement({ description: txnObject.description }, this.TEMPLATE.TRANSACTION.DESCRIPCION_OPERACION);
    
    section += txnObject.externalReference ? this.formatElement({ externalReference: txnObject.externalReference }, this.TEMPLATE.TRANSACTION.REF_EXTERNA): '';
    section += this.formatElement({ isArticle72_73: txnObject.isArticle72_73 }, this.TEMPLATE.TRANSACTION.FACTURA_SIMPLIFICADA_ARTICULOS);
    section += this.formatElement({ isNotReportedInTime: txnObject.isNotReportedInTime }, this.TEMPLATE.TRANSACTION.REG_PREVIO_GGEE_REDEME_COMPETENCIA);
    section += txnObject.isMacroData ? this.formatElement({ isMacroData: txnObject.isMacroData }, this.TEMPLATE.TRANSACTION.MACRODATO) : '';
    
    this.surchargeTaxAmountIncluded = false;
    
    section += this.getDesgloseFactura(txnObject);
    section += this.getContraparte(txnObject);
    section += this.formatElement({ date: txnObject.accountingDate || txnObject.tranDate }, this.TEMPLATE.TRANSACTION.FECHA_REG_CONTABLE);
    
    var isSpecialSchemeCode = (!(txnObject.reverseChargeLines && txnObject.reverseChargeLines.length > 0) && 
                                (TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_CUOTADEDUCIBLE_ZERO_LIST.indexOf(txnObject.specialSchemeCode) != -1));
    if(txnObject.specialSchemeCode === SPECIAL_SCHEME_CODE_OR_EFFECT_ON_INVOICES_RECEIVED || this.surchargeTaxAmountIncluded === true || isSpecialSchemeCode)
    {
        section += this.formatElement({ amount: 0 }, this.TEMPLATE.TRANSACTION.CUOTA_DEDUCIBLE);
    }
    else{
        section += this.formatElement({ amount: txnObject.totalTax }, this.TEMPLATE.TRANSACTION.CUOTA_DEDUCIBLE);
    }
    section += this.TEMPLATE.TRANSACTION.FACTURA_RECIBIDA.FOOTER;

    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getFacturasRectificadas = function _getFacturasRectificadas(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.FACTURAS_RECTIFICADAS.HEADER;

    section += this.TEMPLATE.TRANSACTION.ID_FACTURA_RECTIFICADA.HEADER;
    section += this.formatElement({ tranId: txnObject.origTranId }, this.TEMPLATE.TRANSACTION.NUM_SERIE_FACTURA_EMISOR);
    section += this.formatElement({ invoiceDate: txnObject.origInvoiceDate || txnObject.origTranDate }, this.TEMPLATE.TRANSACTION.FECHA_EXPEDICION_FACTURA_EMISOR);
    section += this.TEMPLATE.TRANSACTION.ID_FACTURA_RECTIFICADA.FOOTER;
    section += this.TEMPLATE.TRANSACTION.FACTURAS_RECTIFICADAS.FOOTER;

    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getContraparte = function _getContraparte(txnObject) {
    var section = '';

    section += this.TEMPLATE.TRANSACTION.CONTRAPARTE.HEADER;
    if (txnObject.invoiceType === 'F5' || txnObject.invoiceType === 'LC' ) {
        if(txnObject.isOneWorld) {
            section += this.formatElement({ name: txnObject.subsidiaryName }, this.TEMPLATE.TRANSACTION.NOMBRE_RAZON);
        }
         else {
            section += this.formatElement({ name: txnObject.companyName }, this.TEMPLATE.TRANSACTION.NOMBRE_RAZON);
         }
    }
    else {
         section += this.formatElement({ name: txnObject.vendorName }, this.TEMPLATE.TRANSACTION.NOMBRE_RAZON);
    }
    if (txnObject.vendorIdType) {
        section += this.getIDOtro(txnObject);
    } else {
        if (txnObject.invoiceType === 'F5' || txnObject.invoiceType === 'LC' ) {
            section += this.formatElement({ vatNo: txnObject.vatNo }, this.TEMPLATE.TRANSACTION.NIF);
        }
        else {
            section += this.formatElement({ vatNo: txnObject.vendorVatNo }, this.TEMPLATE.TRANSACTION.NIF);
        }
    }

    section += this.TEMPLATE.TRANSACTION.CONTRAPARTE.FOOTER;

    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getDesgloseFactura = function _getDesgloseFactura(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.DESGLOSE_FACTURA.HEADER;
    
    if(txnObject.reverseChargeLines.length > 0) {
        section += this.getInversionSujetoPasivo(txnObject);
    }
    
    if(txnObject.lines.length > 0) {
        section += this.getDesgloseIVA(txnObject);
    }
    
    section += this.TEMPLATE.TRANSACTION.DESGLOSE_FACTURA.FOOTER;
    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getInversionSujetoPasivo = function _getInversionSujetoPasivo(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.INVERSION_SUJETO_PASIVO.HEADER;

    for (var i = 0; i < txnObject.reverseChargeLines.length; i++) {
        section += this.getDetalleIVA(txnObject.reverseChargeLines[i]);
    }
    section += this.TEMPLATE.TRANSACTION.INVERSION_SUJETO_PASIVO.FOOTER;

    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getDesgloseIVA = function _getDesgloseIVA(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.DESGLOSE_IVA.HEADER;

    for (var i = 0; i < txnObject.lines.length; i++) {
        section += this.getDetalleIVA(txnObject.lines[i]);
    }
    section += this.TEMPLATE.TRANSACTION.DESGLOSE_IVA.FOOTER;

    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.getDetalleIVA = function _getDetalleIVA(txnLineObject) {
    var section = this.TEMPLATE.TRANSACTION.DETALLE_IVA.HEADER;

    if (txnLineObject.hasOwnProperty('taxRate')) {
        section += this.formatElement({ taxRate: txnLineObject.taxRate }, this.TEMPLATE.TRANSACTION.TIPO_IMPOSITIVO);
    }
    section += this.formatElement({ signedAmount: txnLineObject.signedAmount }, this.TEMPLATE.TRANSACTION.BASE_IMPONIBLE);
    if (txnLineObject.hasOwnProperty('taxAmount')) {
        section += this.formatElement({ taxAmount: txnLineObject.taxAmount }, this.TEMPLATE.TRANSACTION.CUOTA_SOPORTADA);
    }
    if (txnLineObject.hasOwnProperty('surchargeTaxRate')) {
        section += this.formatElement({ taxRate: txnLineObject.surchargeTaxRate }, this.TEMPLATE.TRANSACTION.TIPO_RECARGO_EQUIVALENCIA);
    }
    if (txnLineObject.hasOwnProperty('surchargeTaxAmount')) {
        this.surchargeTaxAmountIncluded = true;
        section += this.formatElement({ taxAmount: txnLineObject.surchargeTaxAmount }, this.TEMPLATE.TRANSACTION.CUOTA_RECARGO_EQUIVALENCIA);
    }
    if (txnLineObject.hasOwnProperty('REAGYPTaxRate')) {
        section += this.formatElement({ taxRate: txnLineObject.REAGYPTaxRate }, this.TEMPLATE.TRANSACTION.PORECENT_COMPENSACION_REAGYP);
    }
    if (txnLineObject.hasOwnProperty('REAGYPTaxAmount')) {
        section += this.formatElement({ taxAmount: txnLineObject.REAGYPTaxAmount }, this.TEMPLATE.TRANSACTION.IMPORTE_COMPENSACION_REAGYP);
    }
    section += this.TEMPLATE.TRANSACTION.DETALLE_IVA.FOOTER;

    return section;
};

TAF.ES.Formatter.ReceivedInvoiceFormatter.prototype.isAmendingTransaction = function _isAmendingTransaction(invoiceType) {
    return ['R1', 'R2', 'R3', 'R4'].indexOf(invoiceType) > -1;
};