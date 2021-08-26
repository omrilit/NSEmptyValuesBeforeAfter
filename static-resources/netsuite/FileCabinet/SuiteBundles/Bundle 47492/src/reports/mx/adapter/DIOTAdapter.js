/**
 * Copyright 2016, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.Adapter = TAF.MX.Adapter || {};

TAF.MX.Adapter.DIOTLine = function() {
    return {
        vendorType: '',
        operationType: '',
        RFC: '',
        nonMXVendorTaxID: '',
        vendorName: '',
        nonMXCountry: '',
        nonMXNationality: '',
        S_net: 0,
        DS_net: 0,
        S_tax: 0,
        R_net: 0,
        DR_net: 0,
        R_tax: 0,
        IS_net: 0,
        IS_tax: 0,
        IR_net: 0,
        IR_tax: 0,
        IE_net: 0,
        Z_IZ_ZX_net: 0,
        E_net: 0,
        wtax: 0,
        paidDiscount: 0,
		emptyValue: ''
    };
};

TAF.MX.Adapter.DIOTAdapter = function _DIOTAdapter() {
	this.MexicoCountryCode = 'MX';
	this.context = nlapiGetContext();
	this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
	this.VENDOR_TYPES = {
		'NATIONAL': "04",
		'FOREIGN': "05",
		'GLOBAL': "15" };
	this.NATIONALITIES = {
		'AD': "Principado de Andorra", 'AE': "Emiratos Arabes Unidos", 'AF': "Afganist\u00E1n", 'AG': "Antigua y Bermuda",
		'AI': "Isla Anguilla", 'AL': "Rep\u00FAblica de Albania", 'AN': "Antillas Neerlandesas", 'AO': "Rep\u00FAblica de Angola",
		'AQ': "Ant\u00E1rtica", 'AR': "Argentina", 'AS': "Samoa Americana", 'AT': "Austria", 'AU': "Australia", 'AW': "Aruba",
		'AX': "Ascensi\u00F3n", 'AZ': "Islas Azores", 'BB': "Barbados", 'BD': "Bangladesh", 'BE': "B\u00E9lgica", 'BF': "Burkina Faso",
		'BG': "Bulgaria", 'BH': "Estado de Bahrein", 'BI': "Burundi", 'BJ': "Benin", 'BL': "Belice", 'BM': "Bermudas", 'BN': "Brunei Darussalam",
		'BO': "Bolivia", 'BR': "Brasil", 'BS': "Commonwealth de las Bahamas", 'BT': "Buthan", 'BU': "Burma", 'BV': "Isla Bouvet",
		'BW': "Botswana", 'BY': "Bielorrusia", 'CA': "Canad\u00E1", 'CC': "Isla de Cocos o Kelling", 'CD': "Islas Canarias", 'CE': "Isla de Christmas",
		'CF': "Rep\u00FAblica Centro Africana", 'CG': "Congo", 'CH': "Suiza", 'CI': "Costa de Marfil", 'CK': "Islas Cook", 'CL': "Chile",
		'CM': "Camer\u00FAn", 'CN': "China", 'CO': "Colombia", 'CP': "Campione D'Italia", 'CR': "Rep\u00FAblica de Costa Rica", 
		'CS': "Rep\u00FAblica Checa y Rep\u00FAblica Eslovaca", 'CU': "Cuba", 'CV': "Rep\u00FAblica de Cabo Verde", 'CX': "Isla de Navidad",
		'CY': "Rep\u00FAblica de Chipre", 'DD': "Alemania", 'DJ': "Rep\u00FAblica de Djibouti", 'DK': "Dinamarca", 'DM': "Rep\u00FAblica Dominicana",
		'DN': "Commonwealth de Dominica", 'DZ': "Argelia", 'EC': "Ecuador", 'EG': "Egipto", 'EH': "Sahara del Oeste", 
		'EO': "Estado Independiente de Samoa Occidental", /*ES: "Espa\u00F1a",*/ 'ES': "Espana", 'ET': "Etiop\u00EDa", 'FI': "Finlandia", 'FJ': "Fiji", 
		'FK': "Islas Malvinas", 'FM': "Micronesia", 'FO': "Islas Faroe", 'FR': "Francia", 'GA': "Gab\u00F3n", /*GB: "Gran Breta\u00F1a (Reino Unido)",*/
		'GB': "Gran Bretana (Reino Unido)", 'GD': "Granada", 'GF': "Guyana Francesa", 'GH': "Ghana", 'GI': "Gibraltar", 'GJ': "Groenlandia",
		'GM': "Gambia", 'GN': "Guinea", 'GP': "Guadalupe", 'GQ': "Guinea Ecuatorial", 'GR': "Grecia", 'GT': "Guatemala", 'GU': "Guam",
		'GW': "Guinea Bissau", 'GY': "Rep\u00FAblica de Guyana", 
		'GZ': "Is las de Guernesey, Jersey, Alderney, Isla Great Sark, Herm, Little Sark, Berchou, Jethou, Lihou",
		'HK': "Hong Kong", 'HM': "Islas Heard and Mc Donald", 'HN': "Rep\u00FAblica de Honduras", 'HT': "Hait\u00ED", 'HU': "Hungr\u00EDa", 
		'ID': "Indonesia", 'IE': "Irlanda", 'IH': "Isla del Hombre", 'IL': "Israel", 'IN': "India", 'IO': "Territorio Brit\u00E1nico en el Oc\u00E9ano Indico",
		'IP': "Islas Pac\u00EDfico", 'IQ': "Iraq", 'IR': "Ir\u00E1n", 'IS': "Islandia", 'IT': "Italia", 'JM': "Jamaica", 'JO': "Reino Hachemita de Jordania",
		'JP': "Jap\u00F3n", 'KE': "Kenia", 'KH': "Campuchea Democr\u00E1tica", 'KI': "Kiribati", 'KM': "Comoros", 'KN': "San Kitts", 
		'KP': "Rep\u00FAblica Democr\u00E1tica de Corea", 'KR': "Rep\u00FAblica de Corea", 'KW': "Estado de Kuwait", 'KY': "Islas Caim\u00E1n",
		'LA': "Rep\u00FAblica Democr\u00E1tica de Laos", 'LB': "L\u00EDbano", 'LC': "Santa Luc\u00EDa", 'LI': "Principado de Liechtenstein",
		'LK': "Rep\u00FAblica Socialista Democr\u00E1tica de Sri Lanka", 'LN': "Labu\u00E1n", 'LR': "Rep\u00FAblica de Liberia", 'LS': "Lesotho",
		'LU': "Gran Ducado de Luxemburgo", 'LY': "Libia", 'MA': "Marruecos", 'MC': "Principado de M\u00F3naco", 'MD': "Madeira", 'MG': "Madagascar",
		'MH': "Rep\u00FAblica de las Islas Marshall", 'ML': "Mal\u00ED", 'MN': "Mongolia", 'MO': "Macao", 'MP': "Islas Marianas del Noreste", 'MQ': "Martinica",
		'MR': "Mauritania", 'MS': "Monserrat", 'MT': "Malta", 'MU': "Rep\u00FAblica de Mauricio", 'MV': "Rep\u00FAblica de Maldivas",
		'MW': "Malawi", 'MY': "Malasia", 'MZ': "Mozambique", 'NA': "Rep\u00FAblica de Namibia", 'NC': "Nueva Caledonia", 'NE': "N\u00EDger",
		'NF': "Isla de Norfolk", 'NG': "Nigeria", 'NI': "Nicaragua", 'NL': "Holanda", 'NO': "Noruega", 'NP': "Nepal", 'NR': "Rep\u00FAblica de Nauru",
		'NT': "Zona Neutral", 'NU': "Niue", 'NV': "Nevis", 'NZ': "Nueva Zelandia", 'OM': "Sultan\u00EDa de Om\u00E1n", 'PA': "Rep\u00FAblica de Panam\u00E1",
		'PE': "Per\u00FA", 'PF': "Polinesia Francesa", 'PG': "Pap\u00FAa Nueva Guinea", 'PH': "Filipinas", 'PK': "Pakist\u00E1n", 'PL': "Polonia",
		'PM': "Isla de San Pedro y Miguel\u00F3n", 'PN': "Pitcairn", 'PR': "Estado Libre Asociado de Puerto Rico", 'PT': "Portugal", 'PU': "Patau",
		'PW': "Palau", 'PY': "Paraguay", 'QA': "Estado de Quatar", 'QB': "Isla Qeshm", 'RE': "Reuni\u00F3n", 'RO': "Rumania", 'RW': "Rhuanda",
		'SA': "Arabia Saudita", 'SB': "Islas Salom\u00F3n", 'SC': "Seychelles Islas", 'SD': "Sud\u00E1n", 'SE': "Suecia", 'SG': "Singapur",
		'SH': "Santa Elena", 'SI': "Archipi\u00E9lago de Svalbard", 'SJ': "Islas Svalbard and Jan Mayen", 'SK': "Sark", 'SL': "Sierra Leona",
		'SM': "Seren\u00EDsima Rep\u00FAblica de San Marino", 'SN': "Senegal", 'SO': "Somalia", 'SR': "Surinam", 'ST': "Sao Tome and Pr\u00EDncipe",
		'SU': "Pa\u00EDses de la Ex-U.R.S.S., excepto Ucrania y Bielorusia", 'SV': "El Salvador", 'SW': "Rep\u00FAblica de Seychelles",
		'SY': "Siria", 'SZ': "Reino de Swazilandia", 'TC': "Islas Turcas y Caicos", 'TD': "Chad", 'TF': "Territorios Franceses del Sureste",
		'TG': "Togo", 'TH': "Thailandia", 'TK': "Tokelau", 'TN': "Rep\u00FAblica de T\u00FAnez", 'TO': "Reino de Tonga", 'TP': "Timor Este",
		'TR': "Trieste", 'TS': "Trist\u00E1n Da Cunha", 'TT': "Rep\u00FAblica de Trinidad y Tobago", 'TU': "Turqu\u00EDa", 'TV': "Tuvalu",
		'TW': "Taiw\u00E1n", 'TZ': "Tanzania", 'UA': "Ucrania", 'UG': "Uganda", 'UM': "Islas menores alejadas de los Estados Unidos", 
		'US': "Estados Unidos de Am\u00E9rica", 'UY': "Rep\u00FAblica Oriental del Uruguay", 'VA': "El Vaticano", 'VC': "San Vicente y Las Granadinas",
		'VE': "Venezuela", 'VG': "Islas V\u00EDrgenes Brit\u00E1nicas", 'VI': "Islas V\u00EDrgenes de Estados Unidos de Am\u00E9rica", 'VN': "Vietnam",
		'VU': "Rep\u00FAblica de Vanuatu", 'WF': "Islas Wallis y Funtuna", 'XX': "Otro", 'YD': "Yemen Democr\u00E1tica", 'YE': "Rep\u00FAblica del Yemen",
		'YU': "Pa\u00EDses de la Ex-Yugoslavia", 'ZA': "Sud\u00E1frica", 'ZC': "Zona Especial Canaria", 'ZM': "Zambia", 'ZO': "Zona Libre Ostrava",
		'ZR': "Zaire", 'ZW': "Zimbabwe"
	};
};

TAF.MX.Adapter.DIOTAdapter.prototype.getDIOTLine = function _getDIOTLine(key, rawLine) {
	if (!key) {
		throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.DIOTAdapter.getDIOTLine: Parameter is invalid');
	}
	
	if (!rawLine) {
		throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.DIOTAdapter.getDIOTLine: Parameter is invalid');
	}
	
	try {
		var DIOTLine = null;
		var countryCode = this.getCountryCode(rawLine);
		var isMexico = false;
		var isForeign = false;
		var isGlobal = false;
		var S_net = Math.floor(rawLine.S_net || 0);
		var DS_net = Math.floor(rawLine.DS_net || 0);
		var R_net = Math.floor(rawLine.R_net || 0);
		var DR_net = Math.floor(rawLine.DR_net || 0);
		var IS_net = Math.floor(rawLine.IS_net || 0);
		var IR_net = Math.floor(rawLine.IR_net || 0);
		var IE_net = Math.floor(rawLine.IE_net || 0);
		var Z_IZ_ZX_net = Math.floor(rawLine.Z_net || 0) + Math.floor(rawLine.IZ_net || 0) + Math.floor(rawLine.ZX_net || 0);
		var E_net = Math.floor(rawLine.E_net || 0);
		var paidDiscount = Math.floor(rawLine.paidDiscount || 0);
		
		DIOTLine = new TAF.MX.Adapter.DIOTLine();
		DIOTLine.vendorType = this.getVendorType(rawLine);
		isMexico = DIOTLine.vendorType == this.VENDOR_TYPES.NATIONAL;
		isForeign = DIOTLine.vendorType == this.VENDOR_TYPES.FOREIGN;
		isGlobal = DIOTLine.vendorType == this.VENDOR_TYPES.GLOBAL;
		DIOTLine.operationType = this.getOperationType(key);
		DIOTLine.RFC = isMexico ? rawLine.mxRFC : '';
		DIOTLine.nonMXVendorTaxID = isForeign || isGlobal ? rawLine.vatNo : '';
		DIOTLine.vendorName = isForeign ? this.getVendorName(rawLine) : '';
		DIOTLine.nonMXCountry = isForeign ? countryCode : '';
		DIOTLine.nonMXNationality = isForeign ? (this.NATIONALITIES[countryCode] ? this.NATIONALITIES[countryCode] : '') : '';
		DIOTLine.S_net = isForeign && S_net == 0 ? '' : S_net;
		DIOTLine.DS_net = isForeign && DS_net == 0 ? '' : DS_net;
		DIOTLine.S_tax = isForeign ? '' : 0;
		DIOTLine.R_net = R_net == 0 ? '' : R_net;
		DIOTLine.DR_net = DR_net == 0 ? '' : DR_net;
		DIOTLine.R_tax = '';
		DIOTLine.IS_net = isMexico && IS_net == 0 ? '' : IS_net;
		DIOTLine.IS_tax = isMexico ? '' : 0;
		DIOTLine.IR_net	= isMexico && IR_net == 0 ? '' : IR_net;
		DIOTLine.IR_tax	= isMexico ? '' : 0;
		DIOTLine.IE_net	= isMexico && IE_net == 0 ? '' : IE_net;
		DIOTLine.Z_IZ_ZX_net = Z_IZ_ZX_net;
		DIOTLine.E_net = E_net;
		DIOTLine.wtax = '';
		DIOTLine.emptyValue = '';
		DIOTLine.paidDiscount = paidDiscount;
		return DIOTLine;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.MX.Adapter.DIOTAdapter.getDIOTLine', ex.toString());
		throw ex;
	}
};

TAF.MX.Adapter.DIOTAdapter.prototype.getVendorType = function _getVendorType(rawLine) {
	if (!rawLine) {
		throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.DIOTAdapter.getVendorType: Parameter is invalid');
	}
		
	try {
		var countryCode = this.getCountryCode(rawLine);
		var vendorType = countryCode == this.MexicoCountryCode ? this.VENDOR_TYPES.NATIONAL : this.VENDOR_TYPES.FOREIGN;
		return vendorType;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.MX.Adapter.DIOTAdapter.getVendorType', ex.toString());
		throw ex;
	}
};

TAF.MX.Adapter.DIOTAdapter.prototype.getOperationType = function _getOperationType(key) {
	if (!key) {
		throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.DIOTAdapter.getOperationType: Parameter is invalid');
	}
	
	try {
		var OPERATION_TYPES_MAPPING = {
				'1' : '03', // PROFESSIONAL_SERVICES
				'2' : '06', // REAL_ESTATE_LEASING
				'3'	: '85'	// OTHERS
		};

		var keyOperationType = key.split('-')[1];
		var operationType = OPERATION_TYPES_MAPPING[keyOperationType] || '';
		return operationType;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.MX.Adapter.DIOTAdapter.getOperationType', ex.toString());
		throw ex;
	}
};

TAF.MX.Adapter.DIOTAdapter.prototype.getVendorName = function _getVendorName(rawLine) {
	if (!rawLine) {
		throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.DIOTAdapter.getVendorName: Parameter is invalid');
	}
	
	try {
		var individualName = '';
		individualName += rawLine.firstName ? rawLine.firstName + ' ' : '';
		individualName += rawLine.middleName ? rawLine.middleName + ' ' : '';
		individualName += rawLine.lastName ? rawLine.lastName : '';
		var name = rawLine.isIndividual ? individualName : rawLine.companyName;
		var vendorName = rawLine.isEmployee ? rawLine.entityId : name;
		return vendorName;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.MX.Adapter.DIOTAdapter.getVendorName', ex.toString());
		throw ex;
	}
};

TAF.MX.Adapter.DIOTAdapter.prototype.getCountryCode = function _getCountryCode(rawLine) {
	if (!rawLine) {
		throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.DIOTAdapter.getCountryCode: Parameter is invalid');
	}
	
	try {
		var countryCode = '';
		countryCode = rawLine.billCountryCode;
		if (countryCode == null || countryCode == '') {
			if (this.isOneWorld) {
				var subId = rawLine.subsidiary;
				var objSub = SFC.Subsidiaries.Load(subId);
				countryCode = objSub.GetCountryCode();
			} else {
				//Single instance will not install Mexico bundle unless it is Mexican
				countryCode = this.MexicoCountryCode;  //Mexico by default
			}
		}
		return countryCode;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.MX.Adapter.DIOTAdapter.getCountryCode', ex.toString());
		throw ex;
	}
};

