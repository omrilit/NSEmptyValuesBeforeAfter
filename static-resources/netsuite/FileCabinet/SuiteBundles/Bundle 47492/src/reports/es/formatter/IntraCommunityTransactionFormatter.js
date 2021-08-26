/**
 * Copyright � 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Formatter = TAF.ES.Formatter || {};

TAF.ES.Formatter.IntraCommunityTransactionFormatter = function _IntraCommunityTransactionFormatter() {
    TAF.ES.Formatter.ReportFormatter.call(this);
    this.Name = 'ESIntraCommunityTransactionFormatter';
    this.FILE_NAME = 'IntraCommunityTransaction';
    this.FILE_EXTENSION = 'xml';
    this.TEMPLATE.TRANSACTION = {
        SUMINISTRO: {
            HEADER: '<siiLR:SuministroLRDetOperacionIntracomunitaria>',
            FOOTER: '</siiLR:SuministroLRDetOperacionIntracomunitaria>'
        },
        CABECERA: ['<sii:Cabecera>',
                   '<sii:IDVersionSii>{version}</sii:IDVersionSii>',
                   '<sii:Titular>',
                   '<sii:NombreRazon>{name}</sii:NombreRazon>',
                   '<sii:NIF>{vatNo}</sii:NIF>',
                   '</sii:Titular>',
                   '<sii:TipoComunicacion>{submissionType}</sii:TipoComunicacion>',
                   '</sii:Cabecera>'].join(''),
        REGISTRO_LR_DET_OPERACION_INTRACOMUNITARIA: {
            HEADER: '<siiLR:RegistroLRDetOperacionIntracomunitaria>',
            FOOTER: '</siiLR:RegistroLRDetOperacionIntracomunitaria>'
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
        NOMBRE_RAZON: '<sii:NombreRazon>{name}</sii:NombreRazon>',
        NIF: '<sii:NIF>{vatNo}</sii:NIF>',
        IDOTRO: {
            HEADER: '<sii:IDOtro>',
            FOOTER: '</sii:IDOtro>'
        },
        CODIGO_PAIS: '<sii:CodigoPais>{countryCode}</sii:CodigoPais>',
        ID_TYPE: '<sii:IDType>{idType}</sii:IDType>',
        ID: '<sii:ID>{id}</sii:ID>',
        NUM_SERIE_FACTURA_EMISOR: '<sii:NumSerieFacturaEmisor>{tranId}</sii:NumSerieFacturaEmisor>',
        FECHA_EXPEDICION_FACTURA_EMISOR: '<sii:FechaExpedicionFacturaEmisor>{invoiceDate}</sii:FechaExpedicionFacturaEmisor>',
        CONTRAPARTE: {
            HEADER: '<siiLR:Contraparte>',
            FOOTER: '</siiLR:Contraparte>'
        }
    };
};
TAF.ES.Formatter.IntraCommunityTransactionFormatter.prototype = Object.create(TAF.ES.Formatter.ReportFormatter.prototype);

TAF.ES.Formatter.IntraCommunityTransactionFormatter.prototype.getNamespace = function _getNamespace() {
    return [
        { prefix: 'sii', url: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroInformacion.xsd' },
        { prefix: 'siiLR', url: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroLR.xsd' }
    ];
};

TAF.ES.Formatter.IntraCommunityTransactionFormatter.prototype.getRegistroLRDetOperacionIntracomunitaria = function _getRegistroLRDetOperacionIntracomunitaria(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.REGISTRO_LR_DET_OPERACION_INTRACOMUNITARIA.HEADER;
    section += this.formatElement({ year: txnObject.year, month: txnObject.month }, this.TEMPLATE.TRANSACTION.PERIODO_LIQUIDACION);
    section += this.getIdFactura(txnObject);
    section += this.getContraparte(txnObject);
    section += this.getOperacionIntraComunitaria(txnObject);
    section += this.TEMPLATE.TRANSACTION.REGISTRO_LR_DET_OPERACION_INTRACOMUNITARIA.FOOTER;

    return section;
};

TAF.ES.Formatter.IntraCommunityTransactionFormatter.prototype.getIdFactura = function _getIdFactura(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.ID_FACTURA.HEADER;
    section += this.getIdEmisorFactura(txnObject);
    section += this.formatElement({ tranId: txnObject.tranId }, this.TEMPLATE.TRANSACTION.NUM_SERIE_FACTURA_EMISOR);
    section += this.formatElement({ invoiceDate: txnObject.invoiceDate || txnObject.tranDate }, this.TEMPLATE.TRANSACTION.FECHA_EXPEDICION_FACTURA_EMISOR);
    section += this.TEMPLATE.TRANSACTION.ID_FACTURA.FOOTER;

    return section;
};

TAF.ES.Formatter.IntraCommunityTransactionFormatter.prototype.getIdEmisorFactura = function _getIdEmisorFactura(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.ID_EMISOR_FACTURA.HEADER;

    section += this.formatElement({name: txnObject.filerName}, this.TEMPLATE.TRANSACTION.NOMBRE_RAZON);

    if (txnObject.filerIdType) {
        section += this.getIDOtro(txnObject, true);
    } else {
        section += this.formatElement({ vatNo: txnObject.filerVatNo }, this.TEMPLATE.TRANSACTION.NIF);
    }
    section += this.TEMPLATE.TRANSACTION.ID_EMISOR_FACTURA.FOOTER;

    return section;
};

TAF.ES.Formatter.IntraCommunityTransactionFormatter.prototype.getContraparte = function _getContraparte(txnObject) {
    var section = this.TEMPLATE.TRANSACTION.CONTRAPARTE.HEADER;

    section += this.formatElement({name: txnObject.senderName}, this.TEMPLATE.TRANSACTION.NOMBRE_RAZON);
    if (txnObject.senderIdType) {
        section += this.getIDOtro(txnObject);
    } else {
        section += this.formatElement({ vatNo: txnObject.senderVatNo }, this.TEMPLATE.TRANSACTION.NIF);
    }
    section += this.TEMPLATE.TRANSACTION.CONTRAPARTE.FOOTER;

    return section;
};

TAF.ES.Formatter.IntraCommunityTransactionFormatter.prototype.getIDOtro = function _getIDOtro(txnObject, isFiler) {
    var prefix = isFiler ? 'filer' : 'sender';
    var section = this.TEMPLATE.TRANSACTION.IDOTRO.HEADER;

    if (txnObject[prefix + 'CountryCode']) {
        section += this.formatElement({ countryCode: txnObject[prefix + 'CountryCode'] }, this.TEMPLATE.TRANSACTION.CODIGO_PAIS);
    }
    section += this.formatElement({ idType: txnObject[prefix + 'IdType'] }, this.TEMPLATE.TRANSACTION.ID_TYPE);
    section += this.formatElement({ id: txnObject[prefix + 'Id'] }, this.TEMPLATE.TRANSACTION.ID);
    section += this.TEMPLATE.TRANSACTION.IDOTRO.FOOTER;

    return section;
};

TAF.ES.Formatter.IntraCommunityTransactionFormatter.prototype.getOperacionIntraComunitaria = function _getOperacionIntraComunitaria(txnObject) {
    var OPERACION_INTRACOMUNITARIA = ['<siiLR:OperacionIntracomunitaria>',
        '<sii:TipoOperacion>{submissionType}</sii:TipoOperacion>',
        '<sii:ClaveDeclarado>{intraCommunityCode}</sii:ClaveDeclarado>',
        '<sii:EstadoMiembro>{countryCode}</sii:EstadoMiembro>',
        '<sii:DescripcionBienes>{descriptionOfAssetAcquired}</sii:DescripcionBienes>',
        '<sii:DireccionOperador>{address}</sii:DireccionOperador>'];
    
    
        '<sii:RefExterna>{externalReference}</sii:RefExterna>',
        '<sii:RegPrevioGGEEoREDEMEoCompetencia>{isNotReportedInTime}</sii:RegPrevioGGEEoREDEMEoCompetencia>',
        '</siiLR:OperacionIntracomunitaria>';
    
    if(txnObject.externalReference){
        OPERACION_INTRACOMUNITARIA.push('<sii:RefExterna>{externalReference}</sii:RefExterna>')
    }
    
    OPERACION_INTRACOMUNITARIA.push('<sii:RegPrevioGGEEoREDEMEoCompetencia>{isNotReportedInTime}</sii:RegPrevioGGEEoREDEMEoCompetencia>');
    OPERACION_INTRACOMUNITARIA.push('</siiLR:OperacionIntracomunitaria>');
    OPERACION_INTRACOMUNITARIA = OPERACION_INTRACOMUNITARIA.join('');
    
    var data = {
            submissionType: txnObject.submissionType,
            intraCommunityCode: txnObject.intraCommunityCode,
            countryCode: txnObject.countryCode,
            descriptionOfAssetAcquired: txnObject.description,
            address: txnObject.address,
            externalReference: txnObject.externalReference,
            isNotReportedInTime: txnObject.isNotReportedInTime
        };

    return this.formatElement(data, OPERACION_INTRACOMUNITARIA);
};
