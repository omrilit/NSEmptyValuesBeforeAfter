if (!VAT) { var VAT = {}; }
VAT.DAO = VAT.DAO || {};

VAT.DAO.TaxAgency = function _TaxAgency(id) {
	return {
		id: id,
		recordtype: 'vendor',
		entityid: '',
		name: '',
		isperson: 'F',
		category: '3',
		subsidiary: '',
		isinactive: 'F'
	};
};