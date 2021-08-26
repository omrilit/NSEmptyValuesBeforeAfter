/**
 * Copyright © 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.DE = TAF.DE || {};
TAF.DE.DAO = TAF.DE.DAO || {};

TAF.DE.DAO.AccountsPayableLine = function _AccountsPayableLine(id){
    return {
        id: id,        
        posting: '',
        number: '',
        date: '',
        memo: '',
        debitAmount: '',
        creditAmount:'',
        type: '',
        employeeEntityId: '',
        employeeFirstName: '',
        employeeLastName: '',
        vendorEntityId: '',
        vendorIsPerson: '',
        vendorFirstName: '',
        vendorLastName: '',
        vendorCompanyName: '',
    };
};

TAF.DE.DAO.AccountsPayableCsvDao = function _AccountsPayable(textFileDaoParam) {
	TAF.DAO.CsvDAO.call(this);
    this.jobId = textFileDaoParam.jobId;
    
    this.accounts = {};
    for(var acctId in textFileDaoParam.accounts){
        this.accounts[textFileDaoParam.accounts[acctId]['origName']||textFileDaoParam.accounts[acctId]['name']] = acctId;
    }
    this.currency = {};
    for(var currId in textFileDaoParam.currency){
        this.currency[textFileDaoParam.currency[currId]['name']] = currId;
    }
    
    this.columnMap = {
    		'txnId' : 'id',
    		'Document Number' : 'number',
    		'Posting' : 'posting',
    		'Date' : 'date',
    		'memo' : 'memo',
    		'debitAmount' : 'debitAmount',
    		'creditAmount' : 'creditAmount',
    		'Type' : 'type',
    		'empId' : 'employeeEntityId',
    		'FirstName' : 'employeeFirstName',
    		'LastName' : 'employeeLastName',
    		'venId' : 'vendorEntityId',
    		'Is Individual' : 'vendorIsPerson',
    		'venFirstName' : 'vendorFirstName',
    		'venLastName' : 'vendorLastName',
    		'Company Name' : 'vendorCompanyName'
    };    
    
    this.countryMap = {"Afghanistan":"AF","Aland Islands":"AX","Albania":"AL","Algeria":"DZ","American Samoa":"AS","Andorra":"AD","Angola":"AO","Anguilla":"AI","Antarctica":"AQ","Antigua and Barbuda":"AG","Argentina":"AR","Armenia":"AM","Aruba":"AW","Australia":"AU","Austria":"AT","Azerbaijan":"AZ","Bahamas":"BS","Bahrain":"BH","Bangladesh":"BD","Barbados":"BB","Belarus":"BY","Belgium":"BE","Belize":"BZ","Benin":"BJ","Bermuda":"BM","Bhutan":"BT","Bolivia":"BO","Bonaire, Saint Eustatius, and Saba":"BQ","Bosnia and Herzegovina":"BA","Botswana":"BW","Bouvet Island":"BV","Brazil":"BR","British Indian Ocean Territory":"IO","Brunei Darussalam":"BN","Bulgaria":"BG","Burkina Faso":"BF","Burundi":"BI","Cambodia":"KH","Cameroon":"CM","Canada":"CA","Canary Islands":"IC","Cape Verde":"CV","Cayman Islands":"KY","Central African Republic":"CF","Ceuta and Melilla":"EA","Chad":"TD","Chile":"CL","China":"CN","Christmas Island":"CX","Cocos (Keeling) Islands":"CC","Colombia":"CO","Comoros":"KM","Congo, Democratic People's Republic":"CD","Congo, Republic of":"CG","Cook Islands":"CK","Costa Rica":"CR","Cote d'Ivoire":"CI","Croatia/Hrvatska":"HR","Cuba":"CU","Curacao":"CW","Cyprus":"CY","Czech Republic":"CZ","Denmark":"DK","Djibouti":"DJ","Dominica":"DM","Dominican Republic":"DO","East Timor":"TP","Ecuador":"EC","Egypt":"EG","El Salvador":"SV","Equatorial Guinea":"GQ","Eritrea":"ER","Estonia":"EE","Ethiopia":"ET","Falkland Islands":"FK","Faroe Islands":"FO","Fiji":"FJ","Finland":"FI","France":"FR","French Guiana":"GF","French Polynesia":"PF","French Southern Territories":"TF","Gabon":"GA","Gambia":"GM","Georgia":"GE","Germany":"DE","Ghana":"GH","Gibraltar":"GI","Greece":"GR","Greenland":"GL","Grenada":"GD","Guadeloupe":"GP","Guam":"GU","Guatemala":"GT","Guernsey":"GG","Guinea":"GN","Guinea-Bissau":"GW","Guyana":"GY","Haiti":"HT","Heard and McDonald Islands":"HM","Holy See (City Vatican State)":"VA","Honduras":"HN","Hong Kong":"HK","Hungary":"HU","Iceland":"IS","India":"IN","Indonesia":"ID","Iran (Islamic Republic of)":"IR","Iraq":"IQ","Ireland":"IE","Isle of Man":"IM","Israel":"IL","Italy":"IT","Jamaica":"JM","Japan":"JP","Jersey":"JE","Jordan":"JO","Kazakhstan":"KZ","Kenya":"KE","Kiribati":"KI","Korea, Democratic People's Republic":"KP","Korea, Republic of":"KR","Kosovo":"XK","Kuwait":"KW","Kyrgyzstan":"KG","Lao, People's Democratic Republic":"LA","Latvia":"LV","Lebanon":"LB","Lesotho":"LS","Liberia":"LR","Libya":"LY","Liechtenstein":"LI","Lithuania":"LT","Luxembourg":"LU","Macau":"MO","Macedonia":"MK","Madagascar":"MG","Malawi":"MW","Malaysia":"MY","Maldives":"MV","Mali":"ML","Malta":"MT","Marshall Islands":"MH","Martinique":"MQ","Mauritania":"MR","Mauritius":"MU","Mayotte":"YT","Mexico":"MX","Micronesia, Federal State of":"FM","Moldova, Republic of":"MD","Monaco":"MC","Mongolia":"MN","Montenegro":"ME","Montserrat":"MS","Morocco":"MA","Mozambique":"MZ","Myanmar":"MM","Namibia":"NA","Nauru":"NR","Nepal":"NP","Netherlands":"NL","New Caledonia":"NC","New Zealand":"NZ","Nicaragua":"NI","Niger":"NE","Nigeria":"NG","Niue":"NU","Norfolk Island":"NF","Northern Mariana Islands":"MP","Norway":"NO","Oman":"OM","Pakistan":"PK","Palau":"PW","Panama":"PA","Papua New Guinea":"PG","Paraguay":"PY","Peru":"PE","Philippines":"PH","Pitcairn Island":"PN","Poland":"PL","Portugal":"PT","Puerto Rico":"PR","Qatar":"QA","Reunion Island":"RE","Romania":"RO","Russian Federation":"RU","Rwanda":"RW","Saint Barthélemy":"BL","Saint Helena":"SH","Saint Kitts and Nevis":"KN","Saint Lucia":"LC","Saint Martin":"MF","Saint Vincent and the Grenadines":"VC","Samoa":"WS","San Marino":"SM","Sao Tome and Principe":"ST","Saudi Arabia":"SA","Senegal":"SN","Serbia":"RS","Seychelles":"SC","Sierra Leone":"SL","Singapore":"SG","Sint Maarten":"SX","Slovak Republic":"SK","Slovenia":"SI","Solomon Islands":"SB","Somalia":"SO","South Africa":"ZA","South Georgia":"GS","South Sudan":"SS","Spain":"ES","Sri Lanka":"LK","State of Palestine":"PS","St. Pierre and Miquelon":"PM","Sudan":"SD","Suriname":"SR","Svalbard and Jan Mayen Islands":"SJ","Swaziland":"SZ","Sweden":"SE","Switzerland":"CH","Syrian Arab Republic":"SY","Taiwan":"TW","Tajikistan":"TJ","Tanzania":"TZ","Thailand":"TH","Togo":"TG","Tokelau":"TK","Tonga":"TO","Trinidad and Tobago":"TT","Tunisia":"TN","Turkey":"TR","Turkmenistan":"TM","Turks and Caicos Islands":"TC","Tuvalu":"TV","Uganda":"UG","Ukraine":"UA","United Arab Emirates":"AE","United Kingdom":"GB","United States":"US","Uruguay":"UY","US Minor Outlying Islands":"UM","Uzbekistan":"UZ","Vanuatu":"VU","Venezuela":"VE","Vietnam":"VN","Virgin Islands, British":"VG","Virgin Islands, USA":"VI","Wallis and Futuna Islands":"WF","Western Sahara":"EH","Yemen":"YE","Zambia":"ZM","Zimbabwe":"ZW"}    
    this.typeMap = {'Payment':'CustPymt', 'Bill':'VendBill', 'Bill Payment':'VendPymt'};    
    this.transformMap = {
    		'vendorIsPerson' : function(param){return param === 'Yes' ? 'T' : 'F'},
    		};
    this.validationMap = {};    
    this.container = function(){
    	return new TAF.DE.DAO.AccountsPayableLine()
    	};
    this.currentIndex = {
    		rowFile:0,
    		file: 0
    		};
    this.sourceOtherFields = {
            'typeText' : {'targetField' : 'type', 'transform' : function(param){return (this.typeMap[param]||param)}}
    }
};

TAF.DE.DAO.AccountsPayableCsvDao.prototype = Object.create(TAF.DAO.CsvDAO.prototype);

TAF.DE.DAO.AccountsPayableCsvDao.prototype.getList = function _getList(resStartIdx, resEndIdx, fileStartIdx){
    var files = new TAF.DAO.SearchTaskDao().getFilesByJobId(this.jobId);
    var list = [];
    this.hasMoreFiles = false;
    this.currentIndex.file = fileStartIdx;
    for (var i = fileStartIdx; i < files.length; i++){
    	this.extractData(files[i]);    	
    	list = this.csvData.data.slice(resStartIdx, resEndIdx);
        if (list.length >= (resEndIdx - resStartIdx)){
            this.hasMoreRows = true;
            this.hasMoreFiles = true;
            break;
        }
        else{
            this.hasMoreRows = false;
            this.hasMoreFiles = true;
            this.currentIndex.file = i+1;
            this.currentIndex.rowFile = 0;
            break;
        }
    }
    
    return list;
};

TAF.DE.DAO.AccountsPayableCsvDao.prototype.getCurrentIndex = function _getFileIndex(){
    return this.currentIndex;
};