/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function validateField(nsType, nsName, nsLine){
    if(nsName == 'custitem_un_number') {
        checkUNNumber();
    }
    
    return true;
}

function saveRecord() {
    return checkUNNumber();
}

function checkUNNumber(){
    var unNumber = nlapiGetFieldValue('custitem_un_number');

    if(unNumber && !(/^\d+$/.test(unNumber))) {
        alert('UN Number should only be numeric, non-decimal value');
        return false;
    }
    
    return true;
}