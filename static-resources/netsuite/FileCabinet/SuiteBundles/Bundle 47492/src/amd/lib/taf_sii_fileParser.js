/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

define(['N/error', '../adapter/taf_adapter_xml'], function(error, xml) {
    function TAFSIIFileParser() {
        this.name = 'TAFSIIFileParser';
        this.XML_SALES_TRANSACTION_NODE = '//env:Envelope/env:Body/siiR:RespuestaLRFacturasEmitidas/siiR:RespuestaLinea';
        this.XML_PURCHASE_TRANSACTION_NODE = '//env:Envelope/env:Body/siiR:RespuestaLRFacturasRecibidas/siiR:RespuestaLinea';
        this.SALES_SUBSIDIARY_DETAILS_NODE = '//env:Envelope/env:Body/siiR:RespuestaLRFacturasEmitidas/siiR:Cabecera/sii:Titular';
        this.PURCHASE_SUBSIDIARY_DETAILS_NODE = '//env:Envelope/env:Body/siiR:RespuestaLRFacturasRecibidas/siiR:Cabecera/sii:Titular';
        this.ERROR_CODE_TAG = 'siiR:CodigoErrorRegistro';
        this.ERROR_MSG_TAG = 'siiR:DescripcionErrorRegistro';
        this.TRANSACTION_NUMBER_TAG = 'sii:NumSerieFacturaEmisor';
        this.VAT_NUMBER_TAG = 'sii:NIF';
        this.ID_TYPE_TAG = 'sii:IDType';
        this.ID_TAG = 'sii:ID';
        this.TRANSACTION_DATE_TAG = 'sii:FechaExpedicionFacturaEmisor';
    }
    
    TAFSIIFileParser.prototype = {
        toXML: function getList(stringXML) {
            if (!stringXML) {
                throw error.create({ name: 'MISSING_PARAMETER', message: 'stringXML parameter is required', notifyOff: true });
            }

            var xmlDocument;
            
            try {
                xmlDocument = xml.getParser().fromString({ text: stringXML });
            } catch (ex) {
                log.error({ title: 'SIIFileParser.toXML', details: ex.toString() });
                throw error.create({ name: 'INVALID_XML', message: 'XML File is invalid.', notifyOff: true });
            }

            return xmlDocument;
        },
        extractFaultNodes: function(errorMsg) {
            var faultNodes = [];
            var re = /([^[:]+):([^\.]+)/g; // get string after ':' and before '.' or end of string
            var match;

            do {
                match = re.exec(errorMsg);
                if (match) {
                    faultNodes.push(match[2]);
                }
            } while (match);

            return faultNodes;
        },
        getTextContent: function(node, tagName) {
            var textContent = '';
            var elems = node.getElementsByTagName(tagName);
            if (elems && elems.length > 0) {
                textContent = elems[0].textContent;
            }
            return textContent;
        },
        extractTxnData: function search(xmlDoc, dynamicErrorMsgCodes) {
            if (!xmlDoc) {
                throw error.create({ name: 'MISSING_PARAMETER', message: 'xmlDoc parameter is required', notifyOff: true });
            }

            var data = {};
            var nodes;
            var vatNumber;
            var isSales = true;
            var subsidiaryNIF;

            try {
                nodes = this.getNodes(xmlDoc, this.XML_SALES_TRANSACTION_NODE);
                if (!nodes || nodes.length === 0) {
                    nodes = this.getNodes(xmlDoc, this.XML_PURCHASE_TRANSACTION_NODE);
                    isSales = false;
                }
                subsidiaryNIF = this.getSubsidiaryNIF(xmlDoc, isSales);

                for (var i = 0; i < nodes.length; i++) {
                    data[i] = {};

                    data[i].transactionNumber = this.getTextContent(nodes[i], this.TRANSACTION_NUMBER_TAG);
                    data[i].transactionDate = this.getTextContent(nodes[i], this.TRANSACTION_DATE_TAG);

                    vatNumber = this.getTextContent(nodes[i], this.VAT_NUMBER_TAG);
                    if (vatNumber) {
                        data[i].vatNumber = vatNumber;
                    } else {
                        data[i].idType = this.getTextContent(nodes[i], this.ID_TYPE_TAG);
                        data[i].idNumber = this.getTextContent(nodes[i], this.ID_TAG);
                    }

                    this.getErrorDetails(nodes[i], data[i], dynamicErrorMsgCodes);
                }
            } catch (ex) {
                log.error({
                    title: 'SIIFileParser.extractTxnData',
                    details: ex.toString()
                });
                throw error.create({ name: 'INVALID_XML', message: 'Unable to extract data', notifyOff: true });
            }

            return {
                isSales: isSales,
                subsidiaryNIF: subsidiaryNIF,
                transactions: data
            };
        },
        getNodes: function(xmlDoc, xpath) {
            if (!xmlDoc) {
                throw error.create({ name: 'MISSING_PARAMETER', message: 'xmlDoc parameter is required', notifyOff: true });
            }
            if (!xpath) {
                throw error.create({ name: 'MISSING_PARAMETER', message: 'xpath parameter is required', notifyOff: true });
            }

            try {
                return xml.getXPath().select({
                    node: xmlDoc,
                    xpath: xpath
                });
            } catch (ex) {
                log.error({ title: 'SIIFileParser.getNodes', details: ex.toString() });
                throw error.create({ name: 'INVALID_XML', message: 'Cannot find the node ' + xpath, notifyOff: true });
            }
        },
        getErrorDetails: function(node, data, dynamicErrorMsgCodes) {
            var errorCode = this.getTextContent(node, this.ERROR_CODE_TAG);
            var errorMsg;

            try {
                if (errorCode) {
                    data.errorCode = errorCode;
                    if (dynamicErrorMsgCodes.indexOf(errorCode) > -1) {
                        errorMsg = this.getTextContent(node, this.ERROR_MSG_TAG);
                        data.faultNodes = this.extractFaultNodes(errorMsg || '');
                    }
                } else {
                    data.errorCode = 'REG';
                }
            } catch (ex) {
                log.error({ title: 'SIIFileParser.getErrorDetails', details: ex.toString() });
                throw error.create({ name: 'INVALID_XML', message: 'Unable to retrieve error details.', notifyOff: true });
            }
        },
        getSubsidiaryNIF: function(xmlDoc, isSales) {
            var nif = '';
            var nodes = this.getNodes(xmlDoc, isSales ? this.SALES_SUBSIDIARY_DETAILS_NODE : this.PURCHASE_SUBSIDIARY_DETAILS_NODE);

            for (var i = 0; i < nodes.length; i++) {
                nif = this.getTextContent(nodes[i], this.VAT_NUMBER_TAG);
                break;
            }

            return nif;
        }
    };

    return TAFSIIFileParser;
});
