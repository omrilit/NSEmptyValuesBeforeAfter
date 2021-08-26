/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @constructor
 * @extends {suite_l10n.app.BaseConverter<dunning.model.DunningInvoice, dunning.view.DunningInvoice>}
 */
dunning.app.DunningLevelConverter = function () {
  var obj = new suite_l10n.app.BaseConverter({
    model: dunning.model.Level,
    view: dunning.view.Level,
    modelViewMap: {
      id: 'id',
      name: 'name',
      procedureID: 'procedureID',
      daysOverdue: 'daysOverdue',
      minOutstandingAmount: 'minOutstandingAmount',
      templateId: 'templateId',
      currency: 'currency'
    },
    recordModelMap: {
      internalid: 'id',
      name: 'name',
      custrecord_3805_dl_procedure: 'procedureID',
      custrecord_3805_dl_days: 'daysOverdue',
      custrecord_3805_dl_amount: 'minOutstandingAmount',
      custrecord_3805_dl_template_group: 'templateId',
      custrecord_3805_dl_currency: 'currency'
    }
  });

  var context = ns_wrapper.context();

  obj.converters = {};
  obj.baseCurrency = null;
  obj.hasMultipleCurrencies = context.getFeature('MULTICURRENCY');

  if (obj.hasMultipleCurrencies) {
    if (context.isOW()) {
      obj.baseCurrency = ns_wrapper.api.field.lookupField('subsidiary', context.getSubsidiary(), 'currency');
    } else {
      var config = new ns_wrapper.api.config.Configuration('companyinformation');
      obj.baseCurrency = config.getFieldValue('basecurrency');
    }
  }

  obj.getConverter = function (currency) {
    if (obj.converters.hasOwnProperty(currency)) {
      return obj.converters[currency];
    }

    var input = new suite_l10n.view.CurrencyConverterSetting();
    input.targetCurrency = obj.baseCurrency;
    input.sourceCurrency = currency;

    obj.converters[currency] = new ns_wrapper.CurrencyConverter(input);

    return obj.converters[currency];
  };

  obj.getConvertedAmount = function (view) {
    var amount = view.minOutstandingAmount;
    if (obj.hasMultipleCurrencies && view.currency && view.currency != obj.baseCurrency) {
      amount = obj.getConverter(view.currency).convert(amount);
    }
    return amount;
  };

  obj.castToModel = function (view) {
    var model = suite_l10n.app.BaseConverter.prototype.castToModel.call(obj, view);

    model.daysOverdue = Number(view.daysOverdue);
    model.minOutstandingAmount = Number(view.minOutstandingAmount);

    return model;
  };

  obj.castToView = function (model) {
    var view = suite_l10n.app.BaseConverter.prototype.castToView.call(obj, model);

    view.daysOverdue = Number(model.daysOverdue);
    view.minOutstandingAmount = Number(model.minOutstandingAmount);
    view.convertedAmount = obj.getConvertedAmount(view);

    return view;
  };

  return obj;
};
