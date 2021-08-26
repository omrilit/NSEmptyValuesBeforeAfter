/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Formatter = TAF.ES.Formatter || {};

TAF.ES.Formatter.InvoiceFormatter = function _InvoiceFormatter(fileName) {
    TAF.ES.Formatter.ReportFormatter.call(this);
    this.Name = 'ESInvoiceFormatter';
	this.FILE_NAME = fileName;
	this.FILE_EXTENSION = 'xml';
    this.TEMPLATE.TRANSACTION = {
        SUMINISTRO: {
            HEADER: '<siiLR:SuministroLRFacturasEmitidas>',
            FOOTER: '</siiLR:SuministroLRFacturasEmitidas>'
        },
        CABECERA: ['<sii:Cabecera>',
                   '<sii:IDVersionSii>{version}</sii:IDVersionSii>',
                   '<sii:Titular>',
                   '<sii:NombreRazon>{name}</sii:NombreRazon>',
                   '<sii:NIF>{vatNo}</sii:NIF>',
                   '</sii:Titular>',
                   '<sii:TipoComunicacion>{submissionType}</sii:TipoComunicacion>',
                   '</sii:Cabecera>'].join(''),
        REGISTRO_LR_FACTURAS_EMITIDAS: {
            HEADER: '<siiLR:RegistroLRFacturasEmitidas>',
            FOOTER: '</siiLR:RegistroLRFacturasEmitidas>'
        },
        PERIODO_LIQUIDACION: ['<sii:PeriodoLiquidacion>',
                             '<sii:Ejercicio>{year}</sii:Ejercicio>',
                             '<sii:Periodo>{month}</sii:Periodo>',
                             '</sii:PeriodoLiquidacion>'].join(''),
        ID_FACTURA: {
            HEADER: '<siiLR:IDFactura>',
            FOOTER: '</siiLR:IDFactura>'
        },
        ID_EMISOR_FACTURA: ['<sii:IDEmisorFactura>',
                            '<sii:NIF>{vatNo}</sii:NIF>',
                            '</sii:IDEmisorFactura>'].join(''),
        NUM_SERIE_FACTURA_EMISOR: '<sii:NumSerieFacturaEmisor>{tranId}</sii:NumSerieFacturaEmisor>',
        NUM_SERIE_FACTURA_EMISOR_RESUME_FIN: '<sii:NumSerieFacturaEmisorResumenFin>{lastTranId}</sii:NumSerieFacturaEmisorResumenFin>',
        FECHA_EXPEDICION_FACTURA_EMISOR: '<sii:FechaExpedicionFacturaEmisor>{date}</sii:FechaExpedicionFacturaEmisor>',
        FACTURA_EXPEDIDA: {
            HEADER: '<siiLR:FacturaExpedida>',
            FOOTER: '</siiLR:FacturaExpedida>',
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
        BASE_IMPONIBLE_A_COSTE: '<sii:BaseImponibleACoste>{groupedTotal}</sii:BaseImponibleACoste>',
        DESCRIPCION_OPERACION: '<sii:DescripcionOperacion>{description}</sii:DescripcionOperacion>',
        REF_EXTERNA: '<sii:RefExterna>{externalReference}</sii:RefExterna>',
        FACTURA_SIMPLIFICADA_ARTICULOS: '<sii:FacturaSimplificadaArticulos7.2_7.3>{isArticle72_73}</sii:FacturaSimplificadaArticulos7.2_7.3>',
        REG_PREVIO_GGEE_REDEME_COMPETENCIA: '<sii:RegPrevioGGEEoREDEMEoCompetencia>{isNotReportedInTime}</sii:RegPrevioGGEEoREDEMEoCompetencia>',
        MACRODATO: '<sii:Macrodato>{isMacroData}</sii:Macrodato>',
        DATOS_INMUEBLE: {
            HEADER: '<sii:DatosInmueble><sii:DetalleInmueble>',
            FOOTER: '</sii:DetalleInmueble></sii:DatosInmueble>'
        },
        SITUACION_INMUEBLE: '<sii:SituacionInmueble>{propertyLocation}</sii:SituacionInmueble>',
        REFERENCIA_CATASTRAL: '<sii:ReferenciaCatastral>{landRegistrationNo}</sii:ReferenciaCatastral>',
        IMPORTE_TRANSMISION_INMUEBLES_SUJETO_A_IVA: '<sii:ImporteTransmisionInmueblesSujetoAIVA>{taxableAmount}</sii:ImporteTransmisionInmueblesSujetoAIVA>',
        EMITIDA_POR_TERCEROS_O_DESTINATARIO: '<sii:EmitidaPorTercerosODestinatario>{isIssuedByThirdParty}</sii:EmitidaPorTercerosODestinatario>',
        FACTURA_SIN_IDENTIF_DESTINATARIO_ARTICULO: '<sii:FacturaSinIdentifDestinatarioAritculo6.1.d>{isArticle61d}</sii:FacturaSinIdentifDestinatarioAritculo6.1.d>',
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
        CODIGO_PAIS: '<sii:CodigoPais>{customerCountryCode}</sii:CodigoPais>',
        ID_TYPE: '<sii:IDType>{customerIdType}</sii:IDType>',
        ID: '<sii:ID>{customerId}</sii:ID>',
        TIPO_DESGLOSE: {
            HEADER: '<sii:TipoDesglose>',
            FOOTER: '</sii:TipoDesglose>'
        },
        DESGLOSE_FACTURA: {
            HEADER: '<sii:DesgloseFactura>',
            FOOTER: '</sii:DesgloseFactura>'
        },
        DESGLOSE_TIPO_OPERACION: {
            HEADER: '<sii:DesgloseTipoOperacion>',
            FOOTER: '</sii:DesgloseTipoOperacion>'
        },
        PRESENTACION_SERVICIOS: {
            HEADER: '<sii:PrestacionServicios>',
            FOOTER: '</sii:PrestacionServicios>'
        },
        ENTREGA: {
            HEADER: '<sii:Entrega>',
            FOOTER: '</sii:Entrega>'
        },
        SUJETA: {
            HEADER: '<sii:Sujeta>',
            FOOTER: '</sii:Sujeta>'
        },
        EXENTA: {
            HEADER: '<sii:Exenta>',
            FOOTER: '</sii:Exenta>'
        },
        DETALLE_EXENTA: ['<sii:DetalleExenta>',
            '<sii:CausaExencion>{exemptionDetails}</sii:CausaExencion>',
            '<sii:BaseImponible>{total}</sii:BaseImponible>',
            '</sii:DetalleExenta>'].join(''),
        NO_EXENTA: {
            HEADER: '<sii:NoExenta>',
            FOOTER: '</sii:NoExenta>'
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
        CUOTA_REPERCUTIDA: '<sii:CuotaRepercutida>{taxAmount}</sii:CuotaRepercutida>',
        TIPO_RECARGO_EQUIVALENCIA: '<sii:TipoRecargoEquivalencia>{taxRate}</sii:TipoRecargoEquivalencia>',
        CUOTA_RECARGO_EQUIVALENCIA: '<sii:CuotaRecargoEquivalencia>{taxAmount}</sii:CuotaRecargoEquivalencia>',
        NO_SUJETA: {
            HEADER: '<sii:NoSujeta>',
            FOOTER: '</sii:NoSujeta>'
        },
        IMPORTE_POR_ARTICULOS_7_14_OTROS: '<sii:ImportePorArticulos7_14_Otros>{amount}</sii:ImportePorArticulos7_14_Otros>',
        IMPORTE_TAI_REGLAS_LOCALIZACION: '<sii:ImporteTAIReglasLocalizacion>{amount}</sii:ImporteTAIReglasLocalizacion>'
    };
};
TAF.ES.Formatter.InvoiceFormatter.prototype = Object.create(TAF.ES.Formatter.ReportFormatter.prototype);

TAF.ES.Formatter.InvoiceFormatter.prototype.getNamespace = function _getNamespace() {
	return [
		{ prefix: 'sii', url: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroInformacion.xsd' },
		{ prefix: 'siiLR', url: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroLR.xsd' }
	];
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getRegistroLRfacturasEmitidas = function _getRegistroLRfacturasEmitidas(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.REGISTRO_LR_FACTURAS_EMITIDAS.HEADER;
    section += this.formatElement({ year: txnObject.year, month: txnObject.month }, this.TEMPLATE.TRANSACTION.PERIODO_LIQUIDACION);
    section += this.getIdFactura(txnObject);
    section += this.getFacturaExpedida(txnObject);
    section += this.TEMPLATE.TRANSACTION.REGISTRO_LR_FACTURAS_EMITIDAS.FOOTER;

    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getIdFactura = function _getIdFactura(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.ID_FACTURA.HEADER;
    section += this.formatElement({ vatNo: txnObject.vatNo }, this.TEMPLATE.TRANSACTION.ID_EMISOR_FACTURA);
    section += this.formatElement({ tranId: txnObject.tranId }, this.TEMPLATE.TRANSACTION.NUM_SERIE_FACTURA_EMISOR);
    section += this.formatElement({ date: txnObject.tranDate }, this.TEMPLATE.TRANSACTION.FECHA_EXPEDICION_FACTURA_EMISOR);
    section += this.TEMPLATE.TRANSACTION.ID_FACTURA.FOOTER;

    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getFacturaExpedida = function _getFacturaExpedida(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.FACTURA_EXPEDIDA.HEADER;

    section += this.formatElement({ invoiceType: txnObject.invoiceType }, this.TEMPLATE.TRANSACTION.TIPO_FACTURA);
    if(txnObject.invoiceType && txnObject.invoiceType.indexOf('R') === 0) {
        section += this.formatElement({ correctedInvoiceType: txnObject.correctedInvoiceType }, this.TEMPLATE.TRANSACTION.TIPO_RECTIFICATIVA);
        section += this.TEMPLATE.TRANSACTION.FACTURAS_RECTIFICADAS.HEADER;
        section += this.TEMPLATE.TRANSACTION.ID_FACTURA_RECTIFICADA.HEADER;
        section += this.formatElement({ tranId: txnObject.origTranId }, this.TEMPLATE.TRANSACTION.NUM_SERIE_FACTURA_EMISOR);
        section += this.formatElement({ date: txnObject.origTranDate }, this.TEMPLATE.TRANSACTION.FECHA_EXPEDICION_FACTURA_EMISOR);
        section += this.TEMPLATE.TRANSACTION.ID_FACTURA_RECTIFICADA.FOOTER;
        section += this.TEMPLATE.TRANSACTION.FACTURAS_RECTIFICADAS.FOOTER;
    }
    section += txnObject.operationDate ? this.formatElement({ operationDate: txnObject.operationDate }, this.TEMPLATE.TRANSACTION.FECHA_OPERACION) : '';
    section += this.formatElement({ specialSchemeCode: txnObject.specialSchemeCode }, this.TEMPLATE.TRANSACTION.CLAVE_REGIMEN_ESPECIAL_O_TRASCENDENCIA);
    section += this.formatElement({ total: txnObject.total }, this.TEMPLATE.TRANSACTION.IMPORTE_TOTAL);
    section += this.formatElement({ description: txnObject.description }, this.TEMPLATE.TRANSACTION.DESCRIPCION_OPERACION);
    
    section += txnObject.externalReference ? this.formatElement({ externalReference: txnObject.externalReference }, this.TEMPLATE.TRANSACTION.REF_EXTERNA): '';
    section += this.formatElement({ isArticle72_73: txnObject.isArticle72_73 }, this.TEMPLATE.TRANSACTION.FACTURA_SIMPLIFICADA_ARTICULOS);
    section += this.formatElement({ isNotReportedInTime: txnObject.isNotReportedInTime }, this.TEMPLATE.TRANSACTION.REG_PREVIO_GGEE_REDEME_COMPETENCIA);
    section += txnObject.isMacroData ? this.formatElement({ isMacroData: txnObject.isMacroData }, this.TEMPLATE.TRANSACTION.MACRODATO) : '';

    if ((txnObject.specialSchemeCode === TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_BUSINESS_WITH_TAX ||
            txnObject.specialSchemeCode === TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_BUSINESS_WITH_AND_WITHOUT_TAX) &&
            txnObject.propertyLocation) {
        section += this.getDatosInmueble(txnObject);
    }

    section += this.formatElement({ isIssuedByThirdParty: txnObject.isIssuedByThirdParty }, this.TEMPLATE.TRANSACTION.EMITIDA_POR_TERCEROS_O_DESTINATARIO);
    section += this.formatElement({ isArticle61d: txnObject.isArticle61d }, this.TEMPLATE.TRANSACTION.FACTURA_SIN_IDENTIF_DESTINATARIO_ARTICULO);

    if (txnObject.isArticle61d === TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO &&
    	(txnObject.invoiceType === 'F2' || txnObject.invoiceType === 'R5')) {
        if (txnObject.customerVatNo || (txnObject.customerIdType && txnObject.customerId)) {
            section += this.getContraparte(txnObject);
        }
    } else if (txnObject.isArticle61d === TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO) {
        section += this.getContraparte(txnObject);
    }

    section += this.getTipoDesglose(txnObject);

    section += this.TEMPLATE.TRANSACTION.FACTURA_EXPEDIDA.FOOTER;

    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getContraparte = function _getContraparte(txnObject) {
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

TAF.ES.Formatter.InvoiceFormatter.prototype.getIDOtro = function _getIDOtro(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.IDOTRO.HEADER;

    if (txnObject.customerIdType && txnObject.customerIdType !== TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT) {
        section += this.formatElement({ customerCountryCode: txnObject.customerCountryCode }, this.TEMPLATE.TRANSACTION.CODIGO_PAIS);
    }
    section += this.formatElement({ customerIdType: txnObject.customerIdType }, this.TEMPLATE.TRANSACTION.ID_TYPE);
    section += this.formatElement({ customerId: txnObject.customerId }, this.TEMPLATE.TRANSACTION.ID);

    section += this.TEMPLATE.TRANSACTION.IDOTRO.FOOTER;

    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getDatosInmueble = function _getDatosInmueble(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.DATOS_INMUEBLE.HEADER;

    section += this.formatElement({ propertyLocation: txnObject.propertyLocation }, this.TEMPLATE.TRANSACTION.SITUACION_INMUEBLE);
    if (txnObject.landRegistrationNo) {
        section += this.formatElement({ landRegistrationNo: txnObject.landRegistrationNo }, this.TEMPLATE.TRANSACTION.REFERENCIA_CATASTRAL);
    }
    section += this.TEMPLATE.TRANSACTION.DATOS_INMUEBLE.FOOTER;

    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getTipoDesglose = function _getTipoDesglose(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.TIPO_DESGLOSE.HEADER;

    if (txnObject.isTransactionType) { // If customer NIF starts with 'N' or IDOtro block is present
        section += this.getDesgloseTipoOperacion(txnObject);
    } else {
        section += this.getDesglose(txnObject, 'DESGLOSE_FACTURA', ['exemptLines', 'lines']);
    }
    section += this.TEMPLATE.TRANSACTION.TIPO_DESGLOSE.FOOTER;

    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getDesglose = function _getDesglose(txnObject, parentNode, listName) {
    var section = '';

    for(list in listName) {
    	if(txnObject[listName[list]] && txnObject[listName[list]].length > 0) {
    	    section += this.TEMPLATE.TRANSACTION[parentNode].HEADER;
    	    section += this.getSujeta(txnObject, listName);
    	    section += this.TEMPLATE.TRANSACTION[parentNode].FOOTER;
    	    break;
    	}
    }

    if (txnObject.specialSchemeCode === TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_IMPORT && (txnObject.notSubjectAmount + txnObject.servicesNotSubjectAmount != 0)) {
        section += this.TEMPLATE.TRANSACTION[parentNode].HEADER;
        section += this.getNoSujeta(txnObject, parentNode === 'PRESENTACION_SERVICIOS');
        section += this.TEMPLATE.TRANSACTION[parentNode].FOOTER;
    }


    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getDesgloseTipoOperacion = function _getDesgloseTipoOperacion(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.DESGLOSE_TIPO_OPERACION.HEADER;

    section += this.getDesglose(txnObject, 'PRESENTACION_SERVICIOS', ['servicesExemptLines', 'serviceLines']);
    section += this.getDesglose(txnObject, 'ENTREGA', ['goodsExemptLines', 'lines']);
    section += this.TEMPLATE.TRANSACTION.DESGLOSE_TIPO_OPERACION.FOOTER;
    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getSujeta = function _getSujeta(txnObject, listName) {
    var section = this.TEMPLATE.TRANSACTION.SUJETA.HEADER;

    for(var list in listName) {
        if (txnObject[listName[list]] && (txnObject[listName[list]].length > 0) && (['exemptLines', 'servicesExemptLines', 'goodsExemptLines'].indexOf(listName[list]) > -1)) {

            section += this.TEMPLATE.TRANSACTION.EXENTA.HEADER;
            for (var i = 0; i < txnObject[listName[list]].length; i++) {
                section += this.getDetalleExenta(txnObject[listName[list]][i]);
            }
            section += this.TEMPLATE.TRANSACTION.EXENTA.FOOTER;
            
        } else if(txnObject[listName[list]] && (txnObject[listName[list]].length > 0)) {
            section += this.getNoExenta(txnObject, listName[list]);
        }
    }
    
    section += this.TEMPLATE.TRANSACTION.SUJETA.FOOTER;

    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getNoSujeta = function _getNoSujeta(txnObject, isServiceItem) {
    var section = this.TEMPLATE.TRANSACTION.NO_SUJETA.HEADER;
    section += this.formatElement({ amount: isServiceItem ? txnObject.servicesNotSubjectAmount : txnObject.notSubjectAmount },
        this.TEMPLATE.TRANSACTION.IMPORTE_TAI_REGLAS_LOCALIZACION);
    section += this.TEMPLATE.TRANSACTION.NO_SUJETA.FOOTER;

    return section;
};
TAF.ES.Formatter.InvoiceFormatter.prototype.getDetalleExenta = function _getDetalleExenta(txnLineObject) {
    var section = this.formatElement({ exemptionDetails: txnLineObject.exemptCode, total: txnLineObject.signedAmount }, this.TEMPLATE.TRANSACTION.DETALLE_EXENTA);
    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getNoExenta = function _getNoExenta(txnObject, listName) {
    var section = this.TEMPLATE.TRANSACTION.NO_EXENTA.HEADER;
    section += this.formatElement({ exemptionClassification: txnObject[listName + 'ExemptionClassification'] }, this.TEMPLATE.TRANSACTION.TIPO_NO_EXENTA);
    section += this.getDesgloseIVA(txnObject, listName);
    section += this.TEMPLATE.TRANSACTION.NO_EXENTA.FOOTER;

    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getDesgloseIVA = function _getDesgloseIVA(txnObject, listName) {
    var section = this.TEMPLATE.TRANSACTION.DESGLOSE_IVA.HEADER;

    for (var i = 0; i < txnObject[listName].length; i++) {
        section += this.getDetalleIVA(txnObject[listName][i]);
    }
    section += this.TEMPLATE.TRANSACTION.DESGLOSE_IVA.FOOTER;

    return section;
};

TAF.ES.Formatter.InvoiceFormatter.prototype.getDetalleIVA = function _getDetalleIVA(txnLineObject) {
    var section = this.TEMPLATE.TRANSACTION.DETALLE_IVA.HEADER;

    if (txnLineObject.hasOwnProperty('taxRate')) {
        section += this.formatElement({ taxRate: txnLineObject.taxRate }, this.TEMPLATE.TRANSACTION.TIPO_IMPOSITIVO);
    }
    section += this.formatElement({ signedAmount: txnLineObject.signedAmount }, this.TEMPLATE.TRANSACTION.BASE_IMPONIBLE);
    if (txnLineObject.hasOwnProperty('taxAmount')) {
        section += this.formatElement({ taxAmount: txnLineObject.taxAmount }, this.TEMPLATE.TRANSACTION.CUOTA_REPERCUTIDA);
    }
    if (txnLineObject.hasOwnProperty('surchargeTaxRate')) {
        section += this.formatElement({ taxRate: txnLineObject.surchargeTaxRate }, this.TEMPLATE.TRANSACTION.TIPO_RECARGO_EQUIVALENCIA);
    }
    if (txnLineObject.hasOwnProperty('surchargeTaxAmount')) {
        section += this.formatElement({ taxAmount: txnLineObject.surchargeTaxAmount }, this.TEMPLATE.TRANSACTION.CUOTA_RECARGO_EQUIVALENCIA);
    }
    section += this.TEMPLATE.TRANSACTION.DETALLE_IVA.FOOTER;

    return section;
};
