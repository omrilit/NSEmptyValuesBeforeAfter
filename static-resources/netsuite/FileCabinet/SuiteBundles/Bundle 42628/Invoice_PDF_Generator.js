/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       06 Jun 2014     mdeasis
 *
 */
{
    var CONFIG={
        suitelet_id: 'customscript_invoice_generator_beta',
        deployment_id: 'customdeploy_invoice_generator_beta',
        param_id: 'ordid',
        charge_limit: 10,
        FORM_UK: 237,
        FORM_AU: 236,
    };
}
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function invoicePDF(request, response){
    var invoice_id=request.getParameter(CONFIG.param_id);
    nlapiLogExecution('DEBUG', 'invoice_id', 'invoice_id=' + invoice_id);
    if (invoice_id!=null) {
        var xml="<?xml version='1.0'?>\n"+
                "<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n"+
                "<pdf>\n"+
                "   <head>\n"+
                "       <meta name=\"title\" value=\"Custom invoice\" />\n"+
                "       <meta name=\"subject\" value=\"Custom invoice\" />\n"+
                "       <meta name=\"author\" value=\"NetSuite Inc.\" />\n"+
                "       <style>\n"+
                "           body {size: Letter; padding: 0;}"+
                "           body * {"+
                "               font-family: Arial, Helvetica, Sans-serif;"+
                "               font-size: 10px;"+
                "               font-weight: normal;"+
                "               margin: 0;"+
                "               color: #AAA;"+
                "           }"+
                "           td p {text-align: left; white-space: forced;}"+
                "           .bgGrey {"+
                "               background-color:   #F0F0F0;"+
                "           }"+
                "           .bgMidGrey {"+
                "               background-color: #C0C0C0;"+
                "           }"+
                "           .bgLightBlue {"+
                "               background-color: #2B547E;"+
                "           }"+
                "           .bgLightBlue span {"+
                "               color: #FFF;"+
                "           }"+
                //"         .shadowGrey {"+
                //"             box-shadow: 0 3px 3px #999;"+
                //"         }"+
                "           .f16px {"+
                "               font-size: 16px;"+
                "           }"+
                "           .f20px {"+
                "               font-size: 20px;"+
                "           }"+
                "           .f24px {"+
                "               font-size: 24px;"+
                "           }"+
                "           .fBold {"+
                "               font-weight: bold;"+
                "           }"+
                "           .fGrey {"+
                "               color: #999;"+
                "           }"+
                "           .fBlue {"+
                "               color: #2B547E;"+
                "           }"+
                "           .fBlack {"+
                "               color: #000;"+
                "           }"+
                "           .fItalic {"+
                "               font-style: italic;"+
                "           }"+
                "           .lSpacing2px {"+
                "               letter-spacing: 1px;"+
                "           }"+
                "           .mar5inch {padding: 0 48px;}"+
                "           .iLogo {"+
                "               padding-bottom: 5px;"+
                "           }"+
                "       </style>\n"+
                getHTMLTemplate(invoice_id)+
                "</body>\n"+
                "</pdf>";
                var pdf_file=nlapiXMLToPDF(xml);
                response.setContentType('PDF', 'invoice.pdf', 'inline');
                response.write(pdf_file.getValue());
    }
}

function getHTMLTemplate(invoice_id) {
    var invoice_rec=nlapiLoadRecord('invoice', invoice_id);
    var invoice_info=getInvoiceInfo(invoice_id);
    var tax_code='';
    if (invoice_info.form==CONFIG.FORM_AU) {
    	tax_code='(Includes GST)';
    }
    else if (invoice_info.form==CONFIG.FORM_UK) {
    	tax_code='(Includes VAT)';
    }
    var cust_rec=null, cust_info=null;
    try {
    	cust_rec=nlapiLoadRecord('customer', invoice_rec.getFieldValue('entity'));
    	cust_info=getCustomerInfo(cust_rec);
    }
    catch (err) {
    	cust_info=getProjectOwnerInfo(invoice_rec.getFieldValue('entity'));
    	cust_rec=nlapiLoadRecord('customer', cust_info.client_id);
    }
    var ship_info=getShippingAddress(invoice_rec);
    var bill_info=getBillingAddress(cust_rec);
    //Subtotals
    var labor_total=0.0, expense_total=0.0, supplier_total=0.0;
    var html_code="<macrolist>"+
      " <macro id=\"myheader\">"+
      " <table width=\"100%\" cellmargin=\"0\">"+
      "     <tr class=\"bgGrey\">"+
      "         <td width=\"100%\" height=\"30px\">&nbsp;</td>"+
      "     </tr>"+
      "     <tr class=\"bgGrey\">"+
      "         <td width=\"100%\" class=\"mar5inch\">"+
      "             <table width=\"100%\" cellmargin=\"0\" cellpadding=\"0\">"+
      "                 <tr>"+
      "                     <td width=\"50%\">"+
      "                         <table width=\"100%\" cellmargin=\"0\" cellpadding=\"0\">"+
      "                             <tr>"+
      "                                 <td width=\"100%\"><span class=\"f20px fBlack fBold\">Invoice "+invoice_info.trans_id+"</span></td>"+
      "                             </tr>"+
      // Added by Ryan...
      "                             <tr>"+
      "                                 <td width=\"100%\" class=\"fGrey fItalic\">"+invoice_info.date+" (Payment due by "+invoice_info.due_date+")</td>"+
      "                             </tr>"+
      "                             <tr>"+
      "                                 <td width=\"100%\"><span class=\"f20px fBlue fBold\">$"+numberWithCommas(invoice_info.total)+"</span></td>"+
      "                             </tr>"+
      "                         </table>"+
      "                     </td>"+
      "                     <td width=\"50%\" align=\"right\">"+
      "                         <table width=\"100%\" cellmargin=\"0\" cellpadding=\"0\">"+
      "                             <tr>"+
      "                                 <td width=\"100%\" align=\"right\"><img src=\""+nlapiEscapeXML((getInvoiceLogo()!=null)?getInvoiceLogo():getCompanyLogo())+"\" dpi=\"100\" class=\"iLogo\"/></td>"+
      "                             </tr>"+
      "                             <tr>"+
      "                                 <td width=\"100%\" align=\"right\"><span class=\"fBold\">PROJECT </span><span class=\"fBold fBlack\">"+invoice_info.project+"</span></td>"+
      "                             </tr>"+
      "                         </table>"+
      "                     </td>"+
      "                 </tr>"+
      "             </table>"+
      "         </td>"+
      "     </tr>"+
      "     <tr class=\"bgGrey\">"+
      "         <td width=\"100%\" height=\"15px\"></td>"+
      "     </tr>"+
      "     <tr class=\"bgMidGrey\">"+
      "         <td width=\"100%\" height=\"3px\"></td>"+
      "     </tr>"+
      "     <tr>"+
      "         <td width=\"100%\" height=\"10px\"></td>"+
      "     </tr>"+
      " </table>"+
      "</macro>"+
      "</macrolist>"+
      "</head>\n"+
      "<body size=\"letter\" margin=\"0\" header=\"myheader\" header-height=\"130px\">\n";
html_code+="<table width=\"100%\" cellmargin=\"0\">"+
      "     <tr>"+
      "         <td width=\"100%\" class=\"mar5inch\">"+
      "             <table width=\"100%\" cellmargin=\"0\" cellpadding=\"0\">"+
      "                 <tr>"+
      "                     <td width=\"50%\">"+
      "                         <table width=\"100%\" cellmargin=\"0\" cellpadding=\"0\">"+
      "                           <tr><td width=\"100%\"><span class=\"fBold\">BILL TO</span></td></tr>";
        if (cust_info.last_name!='' && cust_info.first_name!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\"><span class=\"fBold fBlack\">"+cust_info.first_name+" "+cust_info.last_name+"</span></td>"+
      "                             </tr>";
        }
        if (cust_info.company_name!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\"><span class=\"fBold fBlack\">"+nlapiEscapeXML(cust_info.company_name)+"</span></td>"+
      "                             </tr>";
        }
        if (bill_info.addr1!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\">"+nlapiEscapeXML(bill_info.addr1)+"</td>"+
      "                             </tr>";
        }
        if (bill_info.addr2!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\">"+nlapiEscapeXML(bill_info.addr2)+"</td>"+
      "                             </tr>";
        }
        if (bill_info.city!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\">"+nlapiEscapeXML(bill_info.city)+"</td>"+
      "                             </tr>";
        }
        if (bill_info.state!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\">"+nlapiEscapeXML(bill_info.state)+"</td>"+
      "                             </tr>";
        }
      html_code+="              </table>"+
      "                     </td>"+
      "                     <td width=\"50%\">"+
      "                         <table width=\"100%\" cellmargin=\"0\" cellpadding=\"0\">"+
      "                             <tr><td width=\"100%\" align=\"right\"><span class=\"fBold\">SHIP TO</span></td></tr>";
        if (ship_info.addressee!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\" align=\"right\"><span class=\"fBold fBlack\">"+nlapiEscapeXML(ship_info.addressee)+"</span></td>"+
      "                             </tr>";
        }
        if (ship_info.addr1!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\" align=\"right\">"+nlapiEscapeXML(ship_info.addr1)+"</td>"+
      "                             </tr>";
        }
        if (ship_info.addr2!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\" align=\"right\">"+nlapiEscapeXML(ship_info.addr2)+"</td>"+
      "                             </tr>";
        }
        if (ship_info.city!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\" align=\"right\">"+nlapiEscapeXML(ship_info.city)+"</td>"+
      "                             </tr>";
        }
        if (ship_info.state!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\" align=\"right\">"+nlapiEscapeXML(ship_info.state)+"</td>"+
      "                             </tr>";
        }
        if (cust_info.email_address!='') {
      html_code+="                  <tr>"+
      "                                 <td width=\"100%\" align=\"right\">"+nlapiEscapeXML(cust_info.email_address)+"</td>"+
      "                             </tr>";
        }
      html_code+="              </table>"+
      "                     </td>"+
      "                 </tr>"+
      "             </table>"+
      "         </td>"+
      "     </tr>"+
      "     <tr>"+
      "         <td width=\"100%\" height=\"40px\"></td>"+
      "     </tr>"+
      "</table>";
      var invoice_items=getInvoiceItem(invoice_info.id);
      //<--
      //Labor
      //-->
      if (invoice_items.labor.count>0) {
      html_code+=
      "                 <table width=\"100%\" cellmargin=\"0\" cellpadding=\"3\" cellborder=\".5px\" style=\"border-color: #e0e0e0;\" class=\"mar5inch\">"+
      "                     <thead><tr class=\"bgGrey\">"+
      "                         <td width=\"100%\" colspan=\"7\" class=\"fBold\">LABOR</td>"+
      "                     </tr>"+
      "                     <tr class=\"bgLightBlue\">"+
      "                         <td width=\"160px\" class=\"fBold\"><span>Service</span></td>"+
      "                         <td width=\"100px\" class=\"fBold\"><span>Resource</span></td>"+
      "                         <td width=\"60px\" class=\"fBold\"><span>Date</span></td>"+
      "                         <td width=\"150px\" class=\"fBold\"><span>Description</span></td>"+
      "                         <td width=\"40px\" class=\"fBold\" align=\"right\"><span>Qty/Hrs</span></td>"+
      "                         <td width=\"70px\" class=\"fBold\" align=\"right\"><span>Rate</span></td>"+
      "                         <td width=\"90px\" class=\"fBold\" align=\"right\"><span>Total</span></td>"+
      "                     </tr></thead>";
      for (var i=0;i<invoice_items.labor.items.length;i++) {
          var item_info=getItemInfo(invoice_items.labor.items[i]);
          if (invoice_items.labor.charge[i]!=null) {
              //<--
              //Charges is less than 10 items
              //-->
              if (invoice_items.labor.charge[i].length<=10) {
                  var org_charges=organizeChargeByEmp(invoice_items.labor.charge[i]);

                  for (var j=0;j<org_charges.employee.length;j++) {
                      html_code+="<tr>";
                      if (j==0) {
                          html_code+="<td rowspan=\""+invoice_items.labor.charge[i].length+"\">"+nlapiEscapeXML(item_info.name)+"</td>";
                      }
                      if ((org_charges.employee[j]!=null)&&(org_charges.employee[j].length>0)) {
                          var emp_info=getEmployeeInfo(org_charges.employee[j]);
                          html_code+="<td rowspan=\""+org_charges.charges[j].length+"\">"+emp_info.first_name+" "+emp_info.last_name+"<br/>("+emp_info.billing_class+")</td>";
                      }
                      else {
                          html_code+="<td rowspan=\""+org_charges.charges[j].length+"\"></td>";
                      }
                      //try and catch here
                      //var item_amount=parseInt(org_charges.charges[j][0].qty)*parseFloat(invoice_items.labor.rate[i]);
                      var item_amount=parseFloat(org_charges.charges[j][0].qty)*parseFloat(invoice_items.labor.rate[i]);
                      labor_total+=item_amount;
                      html_code+="<td>"+org_charges.charges[j][0].date+"</td>"+
                                 "<td>"+nlapiEscapeXML(org_charges.charges[j][0].description)+"</td>"+
                                 "<td align=\"right\">"+org_charges.charges[j][0].qty+"</td>"+
                                 "<td align=\"right\">"+numberWithCommas(invoice_items.labor.rate[i])+"</td>"+
                                 "<td align=\"right\">"+numberWithCommas(item_amount)+"</td>"+
                            "</tr>";
                      for (var k=1;k<org_charges.charges[j].length;k++) {
                          //item_amount=parseInt(org_charges.charges[j][k].qty)*parseFloat(invoice_items.labor.rate[i]);
                          item_amount=parseFloat(org_charges.charges[j][k].qty)*parseFloat(invoice_items.labor.rate[i]);
                          labor_total+=item_amount;
                          html_code+="<tr>"+
                                     "<td>"+org_charges.charges[j][k].date+"</td>"+
                                     "<td>"+nlapiEscapeXML(org_charges.charges[j][k].description)+"</td>"+
                                     "<td align=\"right\">"+org_charges.charges[j][k].qty+"</td>"+
                                     "<td align=\"right\">"+numberWithCommas(invoice_items.labor.rate[i])+"</td>"+
                                     "<td align=\"right\">"+numberWithCommas(item_amount)+"</td>"+
                                     "</tr>";
                      }
                  }

              }
              //<--
              //Charges is more than 10 items
              //-->
              else {
                  var charge_count=invoice_items.labor.charge[i].length;
                  var divider=Math.ceil(charge_count/CONFIG.charge_limit);
                  for (var m=0;m<divider;m++) {
                      var temp_charges=organizeChargeByEmp(invoice_items.labor.charge[i].slice(m*CONFIG.charge_limit, m*CONFIG.charge_limit+CONFIG.charge_limit));
                      var sizer=0;
                      for (var n=0;n<temp_charges.charges.length;n++) {
                          sizer+=temp_charges.charges[n].length;
                      }
                      for (var j=0;j<temp_charges.employee.length;j++) {
                          html_code+="<tr>";
                          if (j==0) {
                              html_code+="<td rowspan=\""+sizer+"\">"+nlapiEscapeXML(item_info.name)+"</td>";
                          }
                          var emp_info=getEmployeeInfo(temp_charges.employee[j]);
                          html_code+="<td rowspan=\""+temp_charges.charges[j].length+"\">"+emp_info.first_name+" "+emp_info.last_name+"<br/>("+emp_info.billing_class+")</td>";
                          //try and catch here
                          //var item_amount=parseInt(temp_charges.charges[j][0].qty)*parseFloat(invoice_items.labor.rate[i]);
                          var item_amount=parseFloat(temp_charges.charges[j][0].qty)*parseFloat(invoice_items.labor.rate[i]);
                          labor_total+=item_amount;
                          html_code+="<td>"+temp_charges.charges[j][0].date+"</td>"+
                                     "<td>"+nlapiEscapeXML(temp_charges.charges[j][0].description)+"</td>"+
                                     "<td align=\"right\">"+temp_charges.charges[j][0].qty+"</td>"+
                                     "<td align=\"right\">"+numberWithCommas(invoice_items.labor.rate[i])+"</td>"+
                                     "<td align=\"right\">"+numberWithCommas(item_amount)+"</td>"+
                                "</tr>";
                          for (var k=1;k<temp_charges.charges[j].length;k++) {
                              //item_amount=parseInt(temp_charges.charges[j][k].qty)*parseFloat(invoice_items.labor.rate[i]);
                              item_amount=parseFloat(temp_charges.charges[j][k].qty)*parseFloat(invoice_items.labor.rate[i]);
                              labor_total+=item_amount;
                              html_code+="<tr>"+
                                         "<td>"+temp_charges.charges[j][k].date+"</td>"+
                                         "<td>"+nlapiEscapeXML(temp_charges.charges[j][k].description)+"</td>"+
                                         "<td align=\"right\">"+temp_charges.charges[j][k].qty+"</td>"+
                                         "<td align=\"right\">"+numberWithCommas(invoice_items.labor.rate[i])+"</td>"+
                                         "<td align=\"right\">"+numberWithCommas(item_amount)+"</td>"+
                                         "</tr>";
                          }
                      }
                  }
              }

          }
          else {
              var lbr_qty=formatFieldValue(invoice_items.labor.qty[i]);
              var lbr_rate=formatCurrencyValue(invoice_items.labor.rate[i]);
              var lbr_total=lbr_qty*lbr_rate;
              labor_total+=lbr_total;
              html_code+="<tr>"+
                         "  <td>"+item_info.name+"</td>"+
                         "  <td></td>"+//Resource
                         "  <td></td>"+//Date
                         "  <td></td>"+//Description
                         "  <td align=\"right\">"+lbr_qty+"</td>"+
                         "  <td align=\"right\">"+numberWithCommas(lbr_rate)+"</td>"+
                         "  <td align=\"right\">"+numberWithCommas(lbr_total)+"</td>"+
                         "</tr>";
          }
      }
      labor_total+=parseFloat(invoice_items.tax.labor);
      html_code+="      <tr class=\"bgGrey\">"+
      "                     <td colspan=\"6\" class=\"fBold\">SUBTOTAL "+tax_code+"</td>"+
      "                     <td width=\"72px\" align=\"right\" class=\"fBold\">"+numberWithCommas(labor_total)+"</td>"+
      "                 </tr>"+
      "</table>"+
      "<table width=\"100%\" cellmargin=\"0\" cellborder=\"0\" cellpadding=\"0\">"+
      "     <tr>"+
      "         <td width=\"100%\" height=\"20px\"></td>"+
      "     </tr>"+
      "</table>";
      }
      //<--
      //Expenses
      //-->
      if (invoice_items.expense.count>0) {
html_code+="<table width=\"100%\" cellmargin=\"0\" class=\"mar5inch\" cellpadding=\"3\" cellborder=\".5px\" style=\"border-color: #e0e0e0;\">"+
      "         <thead><tr class=\"bgGrey\">"+
      "             <td colspan=\"5\" class=\"fBold\">EXPENSE</td>"+
      "         </tr>"+
      "         <tr class=\"bgLightBlue\">"+
      "             <td width=\"205px\" class=\"fBold\"><span>Resource</span></td>"+
      "             <td width=\"105px\" class=\"fBold\"><span>Date</span></td>"+
      "             <td width=\"170px\" class=\"fBold\"><span>Category</span></td>"+
      "             <td width=\"275px\" class=\"fBold\"><span>Description</span></td>"+
      "             <td width=\"130px\" class=\"fBold\" align=\"right\"><span>Total</span></td>"+
      "         </tr></thead>";
        var expense_items=organizeExpense(invoice_items.expense.employee, invoice_items.expense.item, invoice_items.expense.memo, invoice_items.expense.amount, invoice_items.expense.category, invoice_items.expense.date);
        for (var i=0;i<expense_items.employees.length;i++) {
            var emp_info=getEmployeeInfo(expense_items.employees[i]);
            for (var j=0;j<expense_items.items[i].length;j++) {
                expense_total+=parseFloat(expense_items.amounts[i][j]);
html_code+="    <tr>";
            if (j==0) {
html_code+="        <td rowspan=\""+expense_items.items[i].length+"\">"+emp_info.first_name+" "+emp_info.last_name+"</td>";
            }
html_code+="        <td>"+expense_items.date[i][j]+"</td>"+
           "        <td>"+nlapiEscapeXML(formatFieldValue(expense_items.category[i][j]))+"</td>"+
           "        <td>"+nlapiEscapeXML(formatFieldValue(expense_items.descs[i][j]))+"</td>"+
           "        <td align=\"right\">"+numberWithCommas(expense_items.amounts[i][j])+"</td>"+
           "    </tr>";
            }
        }
        expense_total+=parseFloat(invoice_items.tax.expense);
html_code+="    <tr class=\"bgGrey\">"+
      "             <td  colspan=\"4\" class=\"fBold\">SUBTOTAL "+tax_code+"</td>"+
      "             <td align=\"right\" class=\"fBold\">"+numberWithCommas(expense_total)+"</td>"+
      "         </tr>"+
      " </table>"+
      " <table width=\"100%\" cellmargin=\"0\" cellborder=\"0\" cellpadding=\"0\">"+
      "     <tr>"+
      "         <td width=\"100%\" height=\"20px\"></td>"+
      "     </tr>"+
      " </table>";
      }
      //<--
      //SUPPLIERS
      //-->
      if (invoice_items.supplier.count>0) {
html_code+="<table width=\"100%\" cellmargin=\"0\">"+
      "     <tr>"+
      "         <td width=\"100%\" class=\"mar5inch\">"+
      "             <table width=\"100%\" cellmargin=\"0\" cellpadding=\"3\" cellborder=\".5px\" style=\"border-color: #e0e0e0;\">"+
      "                 <tr class=\"bgGrey\">"+
      "                     <td colspan=\"6\" width=\"100%\" class=\"fBold\">SUPPLIER</td>"+
      "                 </tr>"+
      "                 <tr class=\"bgLightBlue\">"+
      "                     <td width=\"200px\" class=\"fBold\"><span>Item</span></td>"+
      "                     <td width=\"100px\" class=\"fBold\"><span>Date</span></td>"+
      "                     <td width=\"280px\" class=\"fBold\"><span>Description</span></td>"+
      "                     <td width=\"80px\" class=\"fBold\" align=\"right\"><span>Qty</span></td>"+
      "                     <td width=\"120px\" class=\"fBold\" align=\"right\"><span>Rate</span></td>"+
      "                     <td width=\"125px\" class=\"fBold\" align=\"right\"><span>Total</span></td>"+
      "                 </tr>";
        for (var i=0;i<invoice_items.supplier.item.length;i++) {
            var sup_item=getItemInfo(invoice_items.supplier.item[i]);
            var sup_qty=formatFieldValue(invoice_items.supplier.qty[i]);
            var sup_rate=formatCurrencyValue(invoice_items.supplier.rate[i]);
            var sup_total=formatCurrencyValue(invoice_items.supplier.total[i]);
            var sup_date=formatFieldValue(invoice_items.supplier.date[i]);
            supplier_total+=parseFloat(sup_total);
      html_code+="                  <tr>"+
      "                                 <td>"+sup_item.name+"</td>"+
      "                                 <td>"+sup_date+"</td>"+
      "                                 <td>"+sup_item.display_name+"</td>"+
      "                                 <td align=\"right\">"+sup_qty+"</td>"+
      "                                 <td align=\"right\">"+numberWithCommas(sup_rate)+"</td>"+
      "                                 <td align=\"right\">"+numberWithCommas(sup_total)+"</td>"+
      "                             </tr>";
        }
      supplier_total+=parseFloat(invoice_items.tax.supplier);
      html_code+="      <tr class=\"bgGrey\">"+
      "                     <td colspan=\"5\" class=\"fBold\">SUBTOTAL "+tax_code+"</td>"+
      "                     <td class=\"fBold\" align=\"right\">"+numberWithCommas(supplier_total)+"</td>"+
      "                 </tr>"+
      "             </table>"+
      "         </td>"+
      "     </tr>"+
      "     <tr>"+
      "         <td width=\"100%\" height=\"20px\"></td>"+
      "     </tr>"+
      " </table>";
      }

      //Kiko[Start] - 7/7/2014
     /*
      var discount_total=0;
      if (invoice_items.discount.name.length>0) {
          html_code+="<table width=\"100%\" cellmargin=\"0\">"+
                     "  <tr>"+
                     "      <td width=\"100%\" class=\"mar5inch\">"+
                     "          <table width=\"100%\" cellmargin=\"0\" cellpadding=\"3\" cellborder=\".5px\" style=\"border-color: #e0e0e0;\">"+
                     "              <tr class=\"bgGrey\">"+
                     "                  <td colspan=\"4\" width=\"100%\" class=\"fBold\">DISCOUNT</td>"+
                     "              </tr>"+
                     "              <tr class=\"bgLightBlue\">"+
                     "                  <td width=\"240px\" class=\"fBold\"><span>Name</span></td>"+
                     "                  <td width=\"270px\" class=\"fBold\"><span>Description</span></td>"+
                     "                  <td width=\"120px\" class=\"fBold\" align=\"right\"><span align=\"right\">Rate</span></td>"+
                     "                  <td width=\"100px\" class=\"fBold\" align=\"right\"><span align=\"right\">Amount</span></td>"+
                     "              </tr>";
          for (var i=0;i<invoice_items.discount.name.length;i++) {
            html_code+="            <tr>"+
                       "                <td>"+nlapiEscapeXML(invoice_items.discount.name[i])+"</td>"+
                       "                <td>"+nlapiEscapeXML(invoice_items.discount.desc[i])+"</td>"+
                       "                <td align=\"right\">"+nlapiEscapeXML(invoice_items.discount.rate[i])+"</td>"+
                       "                <td align=\"right\">"+nlapiEscapeXML(invoice_items.discount.amount[i])+"</td>"+
                       "            </tr>";
            discount_total+=parseFloat(invoice_items.discount.amount[i]);
          }
          html_code+="              <tr class=\"bgGrey\">"+
                     "                  <td colspan=\"3\" class=\"fBold\">SUBTOTAL</td>"+
                     "                  <td class=\"fBold\" align=\"right\">"+numberWithCommas(discount_total)+"</td>"+
                     "              </tr>";
          html_code+="          </table>"+
                     "      </td>"+
                     "  </tr>"+
                     "  <tr>"+
                     "      <td width=\"100%\" height=\"20px\"></td>"+
                     "  </tr>"+
                     "</table>";
      }
      */
      var discount_total=0;
      if (invoice_items.discount.name.length>0) {
          for (var i=0;i<invoice_items.discount.name.length;i++) {
              discount_total+=parseFloat(invoice_items.discount.amount[i]);
          }
      }

      nlapiLogExecution('DEBUG', 'DISCOUNT', 'discount_total=' + discount_total);
      // Header Discount
      var hDiscount = invoice_rec.getFieldValue('discounttotal');
      if(hDiscount){
          nlapiLogExecution('DEBUG', 'HEADER DISCOUNT', 'hDiscount=' + hDiscount);
          discount_total = parseFloat(discount_total) + parseFloat(hDiscount);
      }
      //Kiko[End]
      
      //Tax Summary
      var tax_total=0.00;
      if (invoice_info.form==CONFIG.FORM_UK) {
	      var tax_items=getInvoiceTax(invoice_id);
	      if (!isNullOrEmpty(tax_items) && tax_items.length>0) {
	    	  tax_total=tax_items['total'];
	    	  html_code+="<table width=\"100%\" cellmargin=\"0\">"+
	    	  			 "	<tr>"+
	    	  			 "		<td width=\"100%\" class=\"mar5inch\">"+
	    	  			 "			<table width=\"100%\" cellmargin=\"0\" cellpadding=\"3\" cellborder=\".5px\" style=\"border-color: #e0e0e0;\">"+
	    	  			 "				<tr class=\"bgGrey\">"+
	    	  			 "					<td colspan=\"3\" width=\"100%\" class=\"fBold\">TAX SUMMARY</td>"+
	    	  			 "				</tr>"+
	    	  			 "				<tr class=\"bgLightBlue\">"+
	    	  			"					<td width=\"33.33%\" class=\"fBold\"><span>Code</span></td>"+
	    	  			 "					<td width=\"33.33%\" class=\"fBold\"><span>Rate</span></td>"+
	    	  			 "					<td width=\"33.33%\" class=\"fBold\" align=\"right\"><span>Total</span></td>"+
	    	  			 "				</tr>";
	    	  for (var i=0;tax_items && i<tax_items.length;i++) {
	    		  html_code+="			<tr>"+
	    		  			 "				<td>"+tax_items[i].label+"</td>"+
	    		  			 "				<td>"+tax_items[i].rate+"</td>"+
	    		  			 "				<td align=\"right\">"+numberWithCommas(tax_items[i].amount)+"</td>"+
	    		  			 "			</tr>";
	    	  }
	    	  html_code+="				<tr class=\"bgGrey\">"+
	    	  			 "					<td colspan=\"2\" class=\"fBold\">SUBTOTAL</td>"+
	    	  			 "					<td class=\"fBold\" align=\"right\">"+numberWithCommas(tax_total)+"</td>"+
	    	  			 "				</tr>"+
			  			 "			</table>"+
	    	  			 "		</td>"+
	    	  			 "	</tr>"+
	    	  			 "	<tr>"+
	    	  			 "		<td width=\"100%\" height=\"20px\"></td>"+
	    	  			 "	</tr>"+
	    	  			 "</table>";
	      }
      }
      //Tax Summary
      
      var total=Math.round(100*(labor_total+expense_total+supplier_total+discount_total))/100;
      html_code+="<table width=\"100%\" cellmargin=\"0\">"+
      "     <tr>"+
      "         <td width=\"100%\" class=\"mar5inch\">"+
      "             <table width=\"100%\" cellmargin=\"0\" cellpadding=\"3\" cellborder=\".5px\" style=\"border-color: #e0e0e0;\">"+
      "                 <tr class=\"bgGrey\">"+
      "                     <td width=\"655px\" class=\"fBold\">GRAND TOTAL "+tax_code+"</td>"+
      "                     <td width=\"155px\" class=\"fBold\" align=\"right\">"+numberWithCommas(total)+"</td>"+
      "                 </tr>"+
      "             </table>"+
      "         </td>"+
      "     </tr>"+
      " </table>";
      return html_code;
}

function formatFieldValue(val) {
    if (val==null) {
        return '';
    }
    else {
        return nlapiEscapeXML(val);
    }
}

function formatProjectName(name, num) {
    if (name==null || num==null) {
        return '';
    }
    else {
        // companyname returns "customer : subproject (optional) : project"
        // this regex is greedy and will always return the string after the last colon (:)
        var re = /(?:.*):(.*)/;
        var m = re.exec(name);
        var n = (m && m[1]) ? num + m[1] : num + name;
        return nlapiEscapeXML(n);
    }
}

function formatCurrencyValue(val) {
    if (val==null||val=='') {
        return '0.00';
    }
    else {
        return nlapiEscapeXML(val);
    }
}

function displayButton(type, form, request) {
    if (type=='view') {
        var invoice_link=nlapiResolveURL('SUITELET', CONFIG.suitelet_id, CONFIG.deployment_id)+ '&' + CONFIG.param_id + '=' + nlapiGetRecordId();
        //form.addButton('custpage_invoice_report', 'Print Invoice', "window.open('https://system.na1.netsuite.com/"+invoice_link+"');");
        form.addButton('custpage_invoice_report', 'Print Invoice',  "window.open('" + invoice_link + "');");
    }
}

function getShippingAddress(trans_rec) {
    var addressee=formatFieldValue(trans_rec.getFieldValue('shipaddressee'));
    var addr1=formatFieldValue(trans_rec.getFieldValue('shipaddr1'));
    var addr2=formatFieldValue(trans_rec.getFieldValue('shipaddr2'));
    var city=formatFieldValue(trans_rec.getFieldValue('shipcity'));
    var state=formatFieldValue(trans_rec.getFieldValue('shipstate'));
    var zip=formatFieldValue(trans_rec.getFieldValue('shipzip'));
    var country=formatFieldValue(trans_rec.getFieldValue('shipcountry'));
    var addr_info={
        addressee: formatFieldValue(addressee),
        addr1: formatFieldValue(addr1),
        addr2: formatFieldValue(addr2),
        city: formatFieldValue(city),
        state: ((state!='')&&(zip!=''))?(state+', '+zip):(formatFieldValue(state)),
        country: formatFieldValue(country)
    };
    return addr_info;
}

function getBillingAddress(cust_rec) {
    var addressee=formatFieldValue(cust_rec.getFieldValue('billaddressee'));
    var addr1=formatFieldValue(cust_rec.getFieldValue('billaddr1'));
    var addr2=formatFieldValue(cust_rec.getFieldValue('billaddr2'));
    var city=formatFieldValue(cust_rec.getFieldValue('billcity'));
    var state=formatFieldValue(cust_rec.getFieldValue('billstate'));
    var zip=formatFieldValue(cust_rec.getFieldValue('billzip'));
    var country=formatFieldValue(cust_rec.getFieldValue('billcountry'));
    var addr_info={
        addressee: addressee,
        addr1: addr1,
        addr2: addr2,
        city: city,
        state: ((state!='')&&(zip!=''))?(state+', '+zip):(state),
        country: country
    };
    return addr_info;
}

function getCustomerInfo(cust_rec) {
    var fname=formatFieldValue(cust_rec.getFieldValue('firstname'));
    var lname=formatFieldValue(cust_rec.getFieldValue('lastname'));
    var company_name=formatFieldValue(cust_rec.getFieldValue('companyname'));
    var email=formatFieldValue(cust_rec.getFieldValue('email'));
    var cust_info={
        first_name: fname,
        last_name: lname,
        company_name: company_name,
        email_address: email
    };
    return cust_info;
}

function getInvoiceInfo(trans_id) {
    var res=nlapiSearchRecord('transaction', null, [
                                                    ['mainline', 'is', 'T'], 'AND',
                                                    ['internalid', 'anyof', trans_id], 'OR',
                                                    ['type', 'is', 'invoice']],
                                                    [new nlobjSearchColumn('recordtype'),
                                                    new nlobjSearchColumn('trandate'),
                                                    new nlobjSearchColumn('duedate'),
                                                    new nlobjSearchColumn('tranid'),
                                                    new nlobjSearchColumn('total'),
                                                    new nlobjSearchColumn('status'),
                                                    new nlobjSearchColumn('companyname', 'jobmain'),
                                                    new nlobjSearchColumn('entityid', 'jobmain'),
                                                    new nlobjSearchColumn('type'),
                                                    new nlobjSearchColumn('subsidiary'),
                                                    new nlobjSearchColumn('customform')]);
    var invoice_info=null;
    if (res!=null) {
        for (var i=0;i<res.length;i++) {
            if (res[i].getValue('recordtype')=='invoice') {
                return invoice_info={
                    id: formatFieldValue(res[i].getId()),
                    trans_id: formatFieldValue(res[i].getValue('tranid')),
                    date: formatDate(res[i].getValue('trandate')),
                    due_date: formatDate(res[i].getValue('duedate')),
                    //date: convertDate(formatFieldValue(res[i].getValue('trandate'))),
                    //due_date: convertDate(formatFieldValue(res[i].getValue('duedate'))),
                    record_type: formatFieldValue(res[i].getValue('recordtype')),
                    project: formatProjectName(res[i].getValue('companyname', 'jobmain'), res[i].getValue('entityid', 'jobmain')),
                    total: formatCurrencyValue(res[i].getValue('total')),
                    subsidiary: formatFieldValue(res[i].getText('subsidiary')),
                    form: formatFieldValue(res[i].getValue('customform')),
                };
            }
        }
    }
    return invoice_info;
}

function convertDate(date_raw) {
    var result_date=date_raw.split('/');
    var month=['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
    if (result_date.length>=3) {
        return appendZeroOnDate(parseInt(result_date[1]))+' '+month[parseInt(result_date[0])-1]+' '+appendZeroOnDate(parseInt(result_date[2]));
    }
    else {
        return '';
    }
}

function formatDate(raw_date) {
	if (!isNullOrEmpty(raw_date)) {
		//User configuration/preference
		var user_config=nlapiLoadConfiguration('userpreferences');
		var userdate_format=user_config.getFieldValue('dateformat');
		var longdate_format=user_config.getFieldValue('longdateformat');
		//Date object
		var my_date=new Date(), date_arr=null;
		//Convert input
		switch (userdate_format) {
			case 'MM/DD/YYYY':
				date_arr=raw_date.split('/');
				my_date.setMonth(parseInt(date_arr[0])-1);
				my_date.setDate(parseInt(date_arr[1]));
				my_date.setFullYear(parseInt(date_arr[2]));
				return appendZeroOnDate(my_date.getMonth()+1)+'/'+appendZeroOnDate(my_date.getDate())+'/'+my_date.getFullYear();
				break;
			case 'DD/MM/YYYY':
				date_arr=raw_date.split('/');
				my_date.setMonth(parseInt(date_arr[1])-1);
				my_date.setDate(parseInt(date_arr[0]));
				my_date.setFullYear(parseInt(date_arr[2]));
				return appendZeroOnDate(my_date.getDate())+'/'+appendZeroOnDate(my_date.getMonth()+1)+'/'+my_date.getFullYear();
				break;
			case 'DD-Mon-YYYY':
				date_arr=raw_date.split('-');
				my_date.setMonth(getMonthIndex(date_arr[1]));
				my_date.setDate(parseInt(date_arr[0]));
				my_date.setFullYear(parseInt(date_arr[2]));
				return appendZeroOnDate(my_date.getDate())+'-'+getMonthLabel(my_date.getMonth()).substring(0,3)+'-'+my_date.getFullYear();
				break;
			case 'DD.MM.YYYY':
				date_arr=raw_date.split('.');
				my_date.setMonth(parseInt(date_arr[1])-1);
				my_date.setDate(parseInt(date_arr[0]));
				my_date.setFullYear(parseInt(date_arr[2]));
				return appendZeroOnDate(my_date.getDate())+'.'+appendZeroOnDate(my_date.getMonth()+1)+'.'+my_date.getFullYear();
				break;
			case 'DD-MONTH-YYYY':
				date_arr=raw_date.split('-');
				my_date.setMonth(parseInt(getMonthIndex(date_arr[1])));
				my_date.setDate(parseInt(date_arr[0]));
				my_date.setFullYear(parseInt(date_arr[2]));
				return appendZeroOnDate(my_date.getDate())+'-'+getMonthLabel(my_date.getMonth())+'-'+my_date.getFullYear();
				break;
			case 'DD MONTH, YYYY':
				date_arr=raw_date.split(' ');
				my_date.setMonth(getMonthIndex(date_arr[1]));
				my_date.setDate(parseInt(date_arr[0]));
				my_date.setFullYear(parseInt(date_arr[2]));
				return appendZeroOnDate(my_date.getDate())+' '+getMonthLabel(my_date.getMonth())+', '+my_date.getFullYear();
				break;
			case 'YYYY/MM/DD':
				date_arr=raw_date.split('/');
				my_date.setMonth(parseInt(date_arr[1])-1);
				my_date.setDate(parseInt(date_arr[2]));
				my_date.setFullYear(parseInt(date_arr[0]));
				return my_date.getFullYear()+'/'+appendZeroOnDate(my_date.getMonth()+1)+'/'+appendZeroOnDate(my_date.getDate());
				break;
			case 'YYYY-MM-DD':
				date_arr=raw_date.split('-');
				my_date.setMonth(parseInt(date_arr[1])-1);
				my_date.setDate(parseInt(date_arr[2]));
				my_date.setFullYear(parseInt(date_arr[0]));
				return my_date.getFullYear()+'-'+appendZeroOnDate(my_date.getMonth()+1)+'-'+appendZeroOnDate(my_date.getDate());
				break;
		};
		//switch (longdate_format) {
		//	case 'Month DD, YYYY':
		//		return getMonthLabel(my_date.getMonth())+' '+my_date.getDate()+', '+my_date.getFullYear();
		//		break;
		//	case 'DD Month YYYY':
		//		return my_date.getDate()+' '+getMonthLabel(my_date.getMonth())+' '+my_date.getFullYear();
		//		break;
		//	case 'YYYY Month DD':
		//		return my_date.getFullYear()+' '+getMonthLabel(my_date.getMonth())+' '+my_date.getDate();
		//		break;
		//};
	}
	return '';
}

function getMonthIndex(month) {
	var months=['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
	for (var i=0;i<months.length;i++) {
		var key=month.toUpperCase().substring(0, 3);
		if (key==months[i]) {
			return i;
		}
	}
	return -1;
}

function getMonthLabel(index) {
	var months=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	return months[index%12];
}

function appendZeroOnDate(date_field) {
    if (date_field<10) {
        return '0'+date_field;
    }
    else {
        return date_field;
    }
}

function isNullOrEmpty(data) {
	return (data==null||data=='');
}

function getInvoiceTax(invoice_id) {
	var invoice_rec=nlapiLoadRecord('invoice', invoice_id);
	var tax=[], total=0.00;
	//Tax Items Recollection
	//Service Items
	for (var i=1; i<=invoice_rec.getLineItemCount('item');i++) {
		if (invoice_rec.getLineItemValue('item', 'itemtype', i)!='Discount') {
			var tax_code=formatFieldValue(invoice_rec.getLineItemText('item', 'taxcode', i));
			if (tax_code!='') {
				var tax_id=invoice_rec.getLineItemValue('item', 'taxcode', i);
				var tax_amount=parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('item', 'tax1amt', i)));
				var tax_key=findTaxIndex(tax, tax_id);
				if (tax_key==-1) {
					var tax_item={
						id: tax_id,
						label: tax_code,
						rate: invoice_rec.getLineItemValue('item', 'taxrate1', i),
						amount: tax_amount,
					};
					tax.push(tax_item);
				}
				else {
					tax[tax_key].amount=tax[tax_key].amount+parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('item', 'tax1amt', i)));
				}
				total+=tax_amount;
			}
		}
	}
	//Time
	for (var i=1;i<=invoice_rec.getLineItemCount('time');i++) {
		if (invoice_rec.getLineItemValue('time', 'itemtype', i)!='Discount' && invoice_rec.getLineItemValue('time', 'apply', i)=='T') {
			var tax_code=formatFieldValue(invoice_rec.getLineItemText('time', 'taxcode', i));
			if (tax_code!='') {
				var tax_id=invoice_rec.getLineItemValue('time', 'taxcode', i);
				var tax_amount=parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('time', 'tax1amt', i)));
				var tax_key=findTaxIndex(tax, tax_id);
				if (tax_key==-1) {
					var tax_item={
						id: tax_id,
						label: tax_code,
						rate: invoice_rec.getLineItemValue('time', 'taxrate1', i),
						amount: tax_amount,
					};
					tax.push(tax_item);
				}
				else {
					tax[tax_key].amount=tax[tax_key].amount+parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('time', 'tax1amt', i)));
				}
				total+=tax_amount;
			}
		}
	}
	//ExpCost
	for (var i=1;i<=invoice_rec.getLineItemCount('expcost');i++) {
		if (invoice_rec.getLineItemValue('expcost', 'itemtype', i)!='Discount' && invoice_rec.getLineItemValue('expcost', 'apply', i)=='T') {
			var tax_code=formatFieldValue(invoice_rec.getLineItemText('expcost', 'taxcode', i));
			if (tax_code!='') {
				var tax_id=invoice_rec.getLineItemValue('expcost', 'taxcode', i);
				var tax_amount=parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('expcost', 'tax1amt', i)));
				var tax_key=findTaxIndex(tax, tax_id);
				if (tax_key==-1) {
					var tax_item={
						id: tax_id,
						label: tax_code,
						rate: invoice_rec.getLineItemValue('expcost', 'taxrate1', i),
						amount: tax_amount,
					};
					tax.push(tax_item);
				}
				else {
					tax[tax_key].amount=tax[tax_key].amount+parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('expcost', 'tax1amt', i)));
				}
				total+=tax_amount;
			}
		}
	}
	//ItemCost
	for (var i=1;i<=invoice_rec.getLineItemCount('itemcost');i++) {
		if (invoice_rec.getLineItemValue('itemcost', 'itemtype', i)!='Discount' && invoice_rec.getLineItemValue('itemcost', 'apply', i)=='T') {
			var tax_code=formatFieldValue(invoice_rec.getLineItemText('itemcost', 'taxcode', i));
			if (tax_code!='') {
				var tax_id=invoice_rec.getLineItemValue('itemcost', 'taxcode', i);
				var tax_amount=parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('itemcost', 'tax1amt', i)));
				var tax_key=findTaxIndex(tax, tax_id);
				if (tax_key==-1) {
					var tax_item={
						id: tax_id,
						label: tax_code,
						rate: invoice_rec.getLineItemValue('itemcost', 'taxrate1', i),
						amount: tax_amount,
					};
					tax.push(tax_item);
				}
				else {
					tax[tax_key].amount=tax[tax_key].amount+parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('itemcost', 'tax1amt', i)));
				}
				total+=tax_amount;
			}
		}
	}
	//Tally total taxes amount
	tax['total']=total;
	//Sort tax group by rate
	for (var i=0;i<tax.length;i++) {
		for (var j=i+1;j<tax.length;j++) {
			if (parseFloat(tax[i].rate)>parseFloat(tax[j].rate)) {
				var tmp_key=tax[i];
				tax[i]=tax[j];
				tax[j]=tmp_key;
			}
		}
	}
	return tax;
}

function findTaxIndex(tax_arr, tax_id) {
	for (var i=0;tax_arr && i<tax_arr.length;i++) {
		if (tax_arr[i].id==tax_id) {
			return i;
		}
	}
	return -1;
}

function getInvoiceItem(invoice_id) {
    var invoice_rec=nlapiLoadRecord('invoice', invoice_id);
    var labor_arr=[];
    var labor_charge=[];
    var labor_qty=[];
    var labor_rate=[];
    //Discounts
    var discount_name=[];
    var discount_desc=[];
    var discount_rate=[];
    var discount_amount=[];
    //Suppliers
    var supplier_arr=[], supplier_item=[], supplier_qty=[], supplier_rate=[], supplier_total=[], supplier_date=[];
    //Expenses
    var expense_arr=[], employee_arr=[], memo_arr=[], amount_arr=[], expense_category=[], expense_date=[];
    //Counters
    var labor_count=0;
    var supplier_count=0;
    var expense_count=0;
    //Taxes
    var tax_labor=0.0;
    var tax_supplier=0.0;
    var tax_expense=0.0;
    //Labors
    for (var i=1;i<=invoice_rec.getLineItemCount('item');i++) {
        //Discounts Only
        if (invoice_rec.getLineItemValue('item', 'itemtype', i)=='Discount') {
            discount_name.push(invoice_rec.getLineItemValue('item', 'item_display', i));
            discount_desc.push(invoice_rec.getLineItemValue('item', 'description', i));
            discount_rate.push(invoice_rec.getLineItemValue('item', 'rate', i));
            discount_amount.push(invoice_rec.getLineItemValue('item', 'amount', i));
        }
        //Service Item Only
        else {
        	var item_date=invoice_rec.getLineItemValue('item', 'billeddate', i);
        	var item_info=getItemInfo(invoice_rec.getLineItemValue('item', 'item', i));
        	if (item_info && item_info.type=='serviceitem') {
	            labor_arr.push(invoice_rec.getLineItemValue('item', 'item', i));
	            labor_qty.push(invoice_rec.getLineItemValue('item', 'quantity', i));
	            labor_rate.push(invoice_rec.getLineItemValue('item', 'rate', i));
	            var temp_charge=invoice_rec.getLineItemValue('item', 'charges', i);
	            if (temp_charge) {
	                var temp_arr=temp_charge.split(String.fromCharCode(5));
	                labor_charge.push(temp_arr);
	            }
	            labor_count++;
	            tax_labor+=parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('item', 'tax1amt', i)));
            }
            else if (item_info && (item_info.type=='noninventoryitem' || item_info.type=='inventoryitem')) {
	            supplier_arr.push(invoice_rec.getLineItemValue('item', 'doc', i));
	            supplier_item.push(invoice_rec.getLineItemValue('item', 'item', i));
	            supplier_qty.push(invoice_rec.getLineItemValue('item', 'quantity', i));
	            supplier_rate.push(invoice_rec.getLineItemValue('item', 'rate', i));
	            supplier_total.push(invoice_rec.getLineItemValue('item', 'amount', i));
	            supplier_date.push(item_date!=null?item_date:invoice_rec.getFieldValue('trandate'));
	            supplier_count++;
	            tax_supplier+=parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('item', 'tax1amt', i)));
            }
            else if (item_info && item_info.type=='expenseitem') {
            	expense_arr.push(invoice_rec.getLineItemValue('item', 'item', i));
            	//Default value
            	employee_arr.push(null);
            	expense_date.push(invoice_rec.getFieldValue('trandate'));
            	memo_arr.push(item_info.desc);
            	//Update value if charge record is available
            	var charge_link=invoice_rec.getLineItemValue('item', 'charges', i);
            	if (charge_link) {
            		var charge_rec=getChargeInfo(charge_link);
            		if (charge_rec && charge_rec.expense_rep) {
            			var exp_rec=getExpenseInfo(charge_rec.expense_rep);
            			if (exp_rec) {
            				employee_arr[employee_arr.length-1]=exp_rec.employee_id;
            				expense_date[employee_arr.length-1]=exp_rec.tran_date;
            				memo_arr[memo_arr.length-1]=charge_rec.description;
            			}
            		}
            	}
                amount_arr.push(invoice_rec.getLineItemValue('item', 'amount', i));
                expense_category.push(item_info.name);
            	expense_count++;
            	tax_expense+=parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('item', 'tax1amt', i)));
            }
        }
    }
    //Time to add to labor
    for (var i=1;i<=invoice_rec.getLineItemCount('time');i++) {
        if (invoice_rec.getLineItemValue('item', 'itemtype', i)=='Discount') {
            discount_name.push(invoice_rec.getLineItemValue('item', 'item_display', i));
            discount_desc.push(invoice_rec.getLineItemValue('item', 'description', i));
            discount_rate.push(invoice_rec.getLineItemValue('item', 'rate', i));
            discount_amount.push(invoice_rec.getLineItemValue('item', 'amount', i));
        }
        else {
        	if (invoice_rec.getLineItemValue('time', 'apply', i)=='T') {
	            labor_arr.push(invoice_rec.getLineItemValue('time', 'item', i));
	            labor_qty.push(invoice_rec.getLineItemValue('time', 'qty', i));
	            labor_rate.push(invoice_rec.getLineItemValue('time', 'rate', i));
	            var temp_charge=invoice_rec.getLineItemValue('time', 'charges', i);
	            if (temp_charge) {
	                var temp_arr=temp_charge.split(String.fromCharCode(5));
	                labor_charge.push(temp_arr);
	            }
	            labor_count++;
	            tax_labor+=parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('time', 'tax1amt', i)));
        	}
        }
    }
    //Expenses
    for (var i=1;i<=invoice_rec.getLineItemCount('expcost');i++) {
        if (invoice_rec.getLineItemValue('item', 'itemtype', i)=='Discount') {
            discount_name.push(invoice_rec.getLineItemValue('item', 'item_display', i));
            discount_desc.push(invoice_rec.getLineItemValue('item', 'description', i));
            discount_rate.push(invoice_rec.getLineItemValue('item', 'rate', i));
            discount_amount.push(invoice_rec.getLineItemValue('item', 'amount', i));
        }
        else {
            if (invoice_rec.getLineItemValue('expcost', 'apply', i)=='T') {
                expense_arr.push(invoice_rec.getLineItemValue('expcost', 'doc', i));
                employee_arr.push(invoice_rec.getLineItemValue('expcost', 'employee', i));
                memo_arr.push(invoice_rec.getLineItemValue('expcost', 'memo', i));
                amount_arr.push(invoice_rec.getLineItemValue('expcost', 'originalamount', i));
                expense_category.push(invoice_rec.getLineItemValue('expcost', 'categorydisp', i));
                expense_date.push(invoice_rec.getLineItemValue('expcost', 'billeddate', i));
                expense_count++;
                tax_expense+=parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('expcost', 'tax1amt', i)));
            }
        }
    }
    //Supplier items under itemcost type
    for (var i=1;i<=invoice_rec.getLineItemCount('itemcost');i++) {
        if (invoice_rec.getLineItemValue('item', 'itemtype', i)=='Discount') {
            discount_name.push(invoice_rec.getLineItemValue('item', 'item_display', i));
            discount_desc.push(invoice_rec.getLineItemValue('item', 'description', i));
            discount_rate.push(invoice_rec.getLineItemValue('item', 'rate', i));
            discount_amount.push(invoice_rec.getLineItemValue('item', 'amount', i));
        }
        else {
            if (invoice_rec.getLineItemValue('itemcost', 'apply', i)=='T') {
                supplier_arr.push(invoice_rec.getLineItemValue('itemcost', 'doc', i));
                supplier_item.push(invoice_rec.getLineItemValue('itemcost', 'item', i));
                supplier_qty.push(invoice_rec.getLineItemValue('itemcost', 'itemcostcount', i));
                supplier_rate.push(invoice_rec.getLineItemValue('itemcost', 'cost', i));
                supplier_total.push(invoice_rec.getLineItemValue('itemcost', 'amount', i));
                supplier_date.push(invoice_rec.getLineItemValue('itemcost', 'billeddate', i));
                supplier_count++;
                tax_supplier+=parseFloat(formatCurrencyValue(invoice_rec.getLineItemValue('itemcost', 'tax1amt', i)));
            }
        }
    }
    
    var charge_info={
        labor: {
            items: labor_arr,
            charge: labor_charge,
            qty: labor_qty,
            rate: labor_rate,
            count: labor_count
        },
        expense: {
            item: expense_arr,
            employee: employee_arr,
            memo: memo_arr,
            amount: amount_arr,
            category: expense_category,
            count: expense_count,
            date: expense_date
        },
        supplier: {
            supplier: supplier_arr,
            item: supplier_item,
            qty: supplier_qty,
            rate: supplier_rate,
            total: supplier_total,
            count: supplier_count,
            date: supplier_date
        },
        discount: {
            name: discount_name,
            desc: discount_desc,
            rate: discount_rate,
            amount: discount_amount
        },
        tax : {
        	supplier: tax_supplier,
        	labor: tax_labor,
        	expense: tax_expense,
        }
    };
    return charge_info;
}

function getItemInfo(item_id) {
     var item_field=nlapiLookupField('item', item_id, ['itemid', 'displayname', 'price', 'recordtype', 'description']);
     if (item_field) {
	     var item_info={
	         id: formatFieldValue(item_id),
	         name: formatFieldValue(item_field['itemid']),
	         display_name: formatFieldValue(item_field['displayname']),
	         price: formatFieldValue(item_field['price']),
	         type: formatFieldValue(item_field['recordtype']),
	         desc: formatFieldValue(item_field['description'])
	     };
	     return item_info;
     }
     return null;
}

function getChargeInfo(charge_id) {
    var charge_rec=nlapiLoadRecord('charge', charge_id);
    var time_id=charge_rec.getFieldValue('timerecord');
    var charge_info={
        id: charge_id,
        qty: formatFieldValue(charge_rec.getFieldValue('quantity')),
        amount: formatFieldValue(charge_rec.getFieldValue('amount')),
        type: formatFieldValue(charge_rec.getFieldText('chargetype')),
        date: formatFieldValue(charge_rec.getFieldValue('chargedate')),
        description: formatFieldValue(charge_rec.getFieldValue('description')),
        timebill: formatFieldValue(charge_rec.getFieldValue('timerecord')),
        employee: formatFieldValue(time_id==null?null:nlapiLookupField('timebill', time_id, 'employee')),
        expense_rep: formatFieldValue(charge_rec.getFieldValue('transaction')),
        expense_line: formatFieldValue(charge_rec.getFieldValue('transactionline'))
    };
    return charge_info;
}

function getEmployeeInfo(emp_id) {
	if (emp_id==null) {
		return {
			id: null,
			first_name: '',
			last_name: '',
			billing_class: ''
		};
	}
    var emp_rec=nlapiLoadRecord('employee', emp_id);
    return {
        id: formatFieldValue(emp_id),
        first_name: formatFieldValue(emp_rec.getFieldValue('firstname')),
        last_name: formatFieldValue(emp_rec.getFieldValue('lastname')),
        billing_class: formatFieldValue(emp_rec.getFieldText('billingclass'))
    };
}

function organizeExpense(emp_arr, item_arr, desc_arr, amount_arr, category_arr, date_arr) {
    var emp=new Array();
    var item=new Array();
    var desc=new Array();
    var amt=new Array();
    var cat=new Array();
    var datez=new Array();
    if (emp_arr) {
	    for (var i=0;i<emp_arr.length;i++) {
	        var index=emp.indexOf(emp_arr[i]);
	        if (index==-1) {
	            emp.push(emp_arr[i]);
	            index=emp.length-1;
	        }
	        if (item[index]==null) {
	            item[index]=new Array();
	            desc[index]=new Array();
	            amt[index]=new Array();
	            cat[index]=new Array();
	            datez[index]=new Array();
	        }
	        item[index].push(item_arr[i]);
	        desc[index].push(desc_arr[i]);
	        amt[index].push(amount_arr[i]);
	        cat[index].push(category_arr[i]);
	        datez[index].push(date_arr[i]);
	    }
	    return {
	        employees: emp,
	        items: item,
	        descs: desc,
	        amounts: amt,
	        category: cat,
	        date: datez
    	};
    }
    else {
    	return {
    		employees: emp_arr,
    		items: item_arr,
    		descs: desc_arr,
    		amounts: amount_arr,
    		category: category_arr,
    		date: dare_arr
    	};
    }
}

function organizeChargeByEmp(charge_id_arr) {
    var charge_arr=new Array();
    var emp_arr=new Array();
    for (var i=0;charge_id_arr && i<charge_id_arr.length;i++) {
        var charge_item=getChargeInfo(charge_id_arr[i]);
        var index=emp_arr.indexOf(charge_item.employee);
        if (index==-1) {
            emp_arr.push(charge_item.employee);
            index=emp_arr.length-1;
        }
        if (charge_arr[index]==null) {
            charge_arr[index]=new Array();
        }
        charge_arr[index].push(charge_item);
    }
    return {
        employee: emp_arr,
        charges: charge_arr
    };
}

function numberWithCommas(x) {
    var y=x;
    if (y.toString().indexOf('.')==-1) {
        y=x.toFixed(2);
    }
    var parts=y.toString().split('.');
    parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts[1]!=null && parts[1].length==1) {
        parts[1]+='0';
    }
    else if (parts[1]!=null && parts[1].length>2) {
        parts[1]=parts[1].substring(0,2);
    }
    return parts.join(".");
}

function getInvoiceLogo() {
    var subsidiary_info=nlapiLoadRecord('subsidiary', nlapiGetSubsidiary());
    var img_id=subsidiary_info.getFieldValue('custrecord_inv_logo');
    if (!img_id) {
        return null;
    }
    var invoice_logo=nlapiLoadFile(img_id);
    if (invoice_logo) {
        return invoice_logo.getURL();
    }
    return null;
}

function getCompanyLogo() {
    var subsidiary_info=nlapiLoadRecord('subsidiary', nlapiGetSubsidiary());
    var img_id=subsidiary_info.getFieldValue('pagelogo');
    if (!img_id) {
        return null;
    }
    var invoice_logo=nlapiLoadFile(img_id);
    if (invoice_logo) {
        return invoice_logo.getURL();
    }
    return null;
}

function getExpenseInfo(expense_id) {
	var expense_info=null;
	if (expense_id) {
		var expense_rec=nlapiLoadRecord('expensereport', expense_id);
		if (expense_rec) {
			return expense_info={
				id: expense_id,
				tran_id: formatFieldValue(expense_rec.getFieldValue('tranid')),
				tran_date: formatFieldValue(expense_rec.getFieldValue('trandate')),
				employee_id: formatFieldValue(expense_rec.getFieldValue('entity')),
				customer_id: formatFieldValue(expense_rec.getFieldValue('customer.internalid')),
				customer_name: formatFieldValue(expense_rec.getFieldValue('customer.companyname'))
			};
		}
	}
	return expense_info;
}

function isOnAustralia(subsidiary) {
	return (subsidiary.indexOf('Australia')>-1);
}

function isOnUK(subsidiary) {
	return (subsidiary.indexOf('United Kingdom')>-1);
}

function getProjectOwnerInfo(proj_id) {
	var proj_rec=nlapiLoadRecord('job', proj_id);
	if (proj_rec) {
		var client_info=nlapiLookupField('customer', proj_rec.getFieldValue('parent'), ['firstname', 'lastname', 'email', 'companyname']);
		return {
			first_name: formatFieldValue(client_info['firstname']),
	        last_name: formatFieldValue(client_info['lastname']),
	        company_name: formatFieldValue(client_info['companyname']),
	        email_address: formatFieldValue(client_info['email']),
	        client_id: proj_rec.getFieldValue('parent'),
		};
	}
	return null;
}

/**
function getExpenseReport(item_id, customer_id) {
	var result_set=nlapiSearchRecord('expensereport', null, [new nlobjSearchFilter('type', null, 'anyof', 'ExpRept'),
	                                                         new nlobjSearchFilter('expenseitem', 'expensecategory', 'anyof', item_id),
	                                                         new nlobjSearchFilter('internalid', 'customer', 'anyof', customer_id)],
															[new nlobjSearchColumn('trandate'), new nlobjSearchColumn('tranid'),
															 new nlobjSearchColumn('entity'), new nlobjSearchColumn('name', 'expenseCategory'),
															 new nlobjSearchColumn('expenseItem', 'expenseCategory'), new nlobjSearchColumn('internalid', 'customer'),
															 new nlobjSearchColumn('companyname', 'customer')]);
	var expense_rep=null;
	if (result_set!=null) {
    return expense_rep={
      id: result_set[0].getId(),
      tran_id: formatFieldValue(result_set[0].getValue('tranid')),
			tran_date: formatFieldValue(result_set[0].getValue('trandate')),
			employee_id: formatFieldValue(nlapiLookupField('expensereport', result_set[0].getId(), 'entity')),
			item_name: formatFieldValue(result_set[0].getValue('name', 'expenseCategory')),
			item_id: formatFieldValue(result_set[0].getValue('expenseItem', 'expenseCategory')),
			customer_id: formatFieldValue(result_set[0].getValue('internalid', 'customer')),
			customer_name: formatFieldValue(result_set[0].getValue('companyname', 'customer'))
		};
	}
	return expense_rep;
}
**/