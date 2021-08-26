var VAT = VAT || {};
VAT.OnlineFiling = VAT.OnlineFiling || {};
VAT.OnlineFiling.GB = VAT.OnlineFiling.GB || {};

VAT.OnlineFiling.GB.Adapter = function() {
    this.name = 'VAT.OnlineFiling.GB.Adapter';
};

VAT.OnlineFiling.GB.Adapter.prototype.transform = function(data, onlineFilingData) {
    var onlineFilingDataObj = JSON.parse(onlineFilingData);
    var ctr = 1;

    for (var key in onlineFilingDataObj) {
        data['box' + ctr] = onlineFilingDataObj[key];
        ctr++;
    }

    return data;
};
