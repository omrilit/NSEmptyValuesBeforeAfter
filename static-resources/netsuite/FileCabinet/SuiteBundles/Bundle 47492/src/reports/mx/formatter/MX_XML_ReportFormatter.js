/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.Formatter = TAF.MX.Formatter || {};

TAF.MX.Formatter.XML = function _XML() {
	TAF.MX.Formatter.SAT.call(this);
	
    this.isXML = true;
    this.dateFormat = 'yyyy-MM-dd';

	this.TEMPLATE.HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
	
	this.TEMPLATE.COA_HEADER = [
	   '<catalogocuentas:Catalogo xmlns:catalogocuentas="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas"',
	   'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
	   'xsi:schemaLocation="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas/CatalogoCuentas_1_3.xsd"',
	   'Version="1.3" Anio="{year}" Mes="{month}" RFC="{RFC}">'
    ].join(' ');
	this.TEMPLATE.COA_BODY = '<catalogocuentas:Ctas Natur="{accountType}" Nivel="{accountLevel}" Desc="{description}" NumCta="{accountNumber}" CodAgrup="{groupCode}"/>';
	this.TEMPLATE.COA_FOOTER = '</catalogocuentas:Catalogo>';

    this.TEMPLATE.AUX_HEADER_TRAMITE = [
        '<AuxiliarCtas:AuxiliarCtas xmlns:AuxiliarCtas="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/AuxiliarCtas"',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        'xsi:schemaLocation="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/AuxiliarCtas http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/AuxiliarCtas/AuxiliarCtas_1_3.xsd"',
        'Version="1.3" Anio="{year}" Mes="{month}" RFC="{RFC}" TipoSolicitud="{submissionType}" NumTramite="{tramiteNumber}">'
    ].join(' ');
    this.TEMPLATE.AUX_HEADER_ORDEN = [
        '<AuxiliarCtas:AuxiliarCtas xmlns:AuxiliarCtas="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/AuxiliarCtas"',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        'xsi:schemaLocation="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/AuxiliarCtas http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/AuxiliarCtas/AuxiliarCtas_1_3.xsd"',
        'Version="1.3" Anio="{year}" Mes="{month}" RFC="{RFC}" TipoSolicitud="{submissionType}" NumOrden="{ordenNumber}">'
    ].join(' ');
    this.TEMPLATE.AUX_ACCOUNT_HEADER = '<AuxiliarCtas:Cuenta NumCta="{accountNumber}" DesCta="{accountName}" SaldoIni="{openingBalance}" SaldoFin="{closingBalance}">';
    this.TEMPLATE.AUX_LINE = '<AuxiliarCtas:DetalleAux Fecha="{date}" NumUnIdenPol="{referenceNumber}" Concepto="{concept}" Debe="{debit}" Haber="{credit}"/>';
    this.TEMPLATE.AUX_ACCOUNT_FOOTER = '</AuxiliarCtas:Cuenta>';
    this.TEMPLATE.AUX_FOOTER = '</AuxiliarCtas:AuxiliarCtas>';

	this.TEMPLATE.BALANCE_HEADER = [
        '<BCE:Balanza xmlns:BCE="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/BalanzaComprobacion"',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        'xsi:schemaLocation="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/BalanzaComprobacion http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/BalanzaComprobacion/BalanzaComprobacion_1_3.xsd"',
        'Version="1.3" Anio="{year}" Mes="{month}" RFC="{RFC}" TipoEnvio="{type}">'
    ].join(' ');
    this.TEMPLATE.COMPLEMENTARY_BALANCE_HEADER = [
        '<BCE:Balanza xmlns:BCE="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/BalanzaComprobacion"',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        'xsi:schemaLocation="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/BalanzaComprobacion http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/BalanzaComprobacion/BalanzaComprobacion_1_3.xsd"',
        'Version="1.3" Anio="{year}" Mes="{month}" RFC="{RFC}" TipoEnvio="{type}" FechaModBal="{dateCreated}">'
    ].join(' ');
	this.TEMPLATE.BALANCE_BODY = '<BCE:Ctas NumCta="{accountNumber}" SaldoIni="{openingBalance}" Debe="{debit}" Haber="{credit}" SaldoFin="{closingBalance}"/>';
	this.TEMPLATE.BALANCE_FOOTER = '</BCE:Balanza>';

    this.TEMPLATE.JOURNAL_HEADER_TRAMITE = [
        '<PLZ:Polizas xmlns:PLZ="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/PolizasPeriodo"',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        'xsi:schemaLocation="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/PolizasPeriodo http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/PolizasPeriodo/PolizasPeriodo_1_3.xsd"',
        'Version="1.3" RFC="{RFC}" Mes="{month}" Anio="{year}" TipoSolicitud="{submissionType}" NumTramite="{tramiteNumber}">'
    ].join(' ');
    
    this.TEMPLATE.JOURNAL_HEADER_ORDEN = [
        '<PLZ:Polizas xmlns:PLZ="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/PolizasPeriodo"',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        'xsi:schemaLocation="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/PolizasPeriodo http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/PolizasPeriodo/PolizasPeriodo_1_3.xsd"',
        'Version="1.3" RFC="{RFC}" Mes="{month}" Anio="{year}" TipoSolicitud="{submissionType}" NumOrden="{ordenNumber}">'
    ].join(' ');
    
    this.TEMPLATE.JOURNAL_POLICY_HEADER = '<PLZ:Poliza NumUnIdenPol="{referenceNumber}" Fecha="{date}" Concepto="{concept}">';
    this.TEMPLATE.JOURNAL_TRANSACTION = '<PLZ:Transaccion NumCta="{accountNumber}" DesCta="{accountName}" Concepto="{concept}" Debe="{debit}" Haber="{credit}"/>';
    this.TEMPLATE.JOURNAL_TRANSFER = [
        '<PLZ:Transaccion NumCta="{accountNumber}" DesCta="{accountName}" Concepto="{concept}" Debe="{debit}" Haber="{credit}">',
        '<PLZ:Transferencia BancoOriNal="{bankID}" CtaDest="{toBankAccountNumber}" BancoDestNal="{toBankID}" Fecha="{date}" Benef="{payee}" RFC="{RFC}" Monto="{amount}"/>',
        '</PLZ:Transaccion>'
    ].join('\n');
    this.TEMPLATE.JOURNAL_COMPNAL = [
        '<PLZ:Transaccion NumCta="{accountNumber}" DesCta="{accountName}" Concepto="{concept}" Debe="{debit}" Haber="{credit}">',
        '<PLZ:CompNal UUID_CFDI="{UUID}" RFC="{RFC}" MontoTotal="{amount}"/>',
        '</PLZ:Transaccion>'
    ].join('\n');
    this.TEMPLATE.JOURNAL_COMPEXT = [
        '<PLZ:Transaccion NumCta="{accountNumber}" DesCta="{accountName}" Concepto="{concept}" Debe="{debit}" Haber="{credit}">',
        '<PLZ:CompExt NumFactExt="{checkNumber}" TaxID="{RFC}" MontoTotal="{amount}" Moneda="{currency}" TipCamb="{exchangeRate}"/>',
        '</PLZ:Transaccion>'
    ].join('\n');
    this.TEMPLATE.JOURNAL_CHECK = [
        '<PLZ:Transaccion NumCta="{accountNumber}" DesCta="{accountName}" Concepto="{concept}" Debe="{debit}" Haber="{credit}">',
        '<PLZ:Cheque Num="{checkNumber}" BanEmisNal="{bankID}" CtaOri="{bankAccountNumber}" Fecha="{date}" Benef="{payee}" RFC="{RFC}" Monto="{amount}"/>',
        '</PLZ:Transaccion>'
    ].join('\n');
    this.TEMPLATE.JOURNAL_OTHERS = [
        '<PLZ:Transaccion NumCta="{accountNumber}" DesCta="{accountName}" Concepto="{concept}" Debe="{debit}" Haber="{credit}">',
        '<PLZ:OtrMetodoPago MetPagoPol="{paymentMethod}" Fecha="{date}" Benef="{payee}" RFC="{RFC}" Monto="{amount}"/>',
        '</PLZ:Transaccion>'
    ].join('\n');
	this.TEMPLATE.VENDOR_PAYMENTS = [
        '<PLZ:Transaccion NumCta="{accountNumber}" DesCta="{accountName}" Concepto="{concept}" Debe="{debit}" Haber="{credit}">',
        '<PLZ:OtrMetodoPago MetPagoPol="{paymentMethod}" Fecha="{date}" Benef="{payee}" UUID_CFDI="{UUID}" RFC="{RFC}" Monto="{amount}"/>',
        '</PLZ:Transaccion>'
    ].join('\n');
    this.TEMPLATE.JOURNAL_POLICY_FOOTER = '</PLZ:Poliza>';
    this.TEMPLATE.JOURNAL_FOOTER = '</PLZ:Polizas>';
    
    this.FILENAME_COA = '{RFC}{year}{month}CT.xml';
    this.FILENAME_JOURNAL = '{RFC}{year}{month}PL.xml';
    this.FILENAME_TRIALBALANCE = '{RFC}{year}{month}B{type}.xml';
    this.FILENAME_AUX = '{RFC}{year}{month}XC.xml';
};

TAF.MX.Formatter.XML.prototype = Object.create(TAF.MX.Formatter.SAT.prototype);
