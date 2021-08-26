/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.TemplateFacade = function TemplateFacade (templateAdaptor) {
  this.create = function create () {
    var modelObj = templateAdaptor.parseViewToModel(viewObj);

    return dao.create(modelObj);
  };

  this.update = function update () {
    var modelObj = templateAdaptor.parseViewToModel(viewObj);

    return dao.update(modelObj);
  };

  this.retrieve = function retrieve () {
    var modelObj = templateAdaptor.parseViewToModel(viewObj);

    return dao.retrieve(modelObj);
  };

  this.remove = function remove () {
    var modelObj = templateAdaptor.parseViewToModel(viewObj);

    return dao.remove(modelObj);
  };
};
