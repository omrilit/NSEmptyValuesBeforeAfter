/**
 * � 2014 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

/**
 * Defines an element within a formula expression
 *
 * Properties:
 *     OpCode - operation code, see below for enum
 *     OpType - operation type, indicates whether an operator or constant
 *     OpPrec - operator precedence, used to control evaluation sequence and binding of terms
 *     LValue - left-hand operand for operator
 *     RValue - right-hand operand for operator (undefined for unary operators)
 */
FAM.FunctionToken = function (code, type, prec, lval, rval) {
    this.OpCode = code || '';   // ^, *, /, +, -, #, OC, NB, RV, AL, CP, TD, CU, LU, LD, CC, DH, PB, DP, FY
    this.OpType = type || 0;    // 0 = undefined, 1 = operator, 2 = constant (# through FY)
    this.OpPrec = prec || 0;    // Precedence, ^ = 3, */ = 2, +- = 1, non-op = 0 (4 = processed)
    this.LValue = lval || null; // only used for ^, *, /, +, -, #
    this.RValue = rval || null; // only used for ^, *, /, +, -
};

FAM.DeprFormula = {
    /** global regular expression for finding function terms */
    formulaTerms : /[~\(\)\^\*\/\+\-]|[0-9]+(\.[0-9]+)?|OC|NB|RV|AL|CP|TD|CU|LU|LD|CC|DH|PB|DP|FY/gi
};

/**
 * Recursively parses a formula expression to identify all the terms storing them in an array.
 * Parenthesised expressions are stored as sub-arrays.
 *
 * The resulting expression list will be used by another function (which will fold it into a tree
 * using correct operator precendence).
 *
 * Parameters:
 *     formula    - the formula expression to be parsed
 *     arrExpList - (output) the resulting expression list
 * Returns:
 *     integer - current regular expression search index (used during recursion)
 */
FAM.DeprFormula.parseFormulaExp = function (formula, arrExpList) {
    var exp, token,
        numeric   = /^[0-9]+(\.[0-9]+)?$/,
        l_expList = [],
        l_formula = formula;

    // regexp.exec() automatically stores and resumes from previous position
    while (exp = FAM.DeprFormula.formulaTerms.exec(formula)) {
        switch (exp[0]) {
        case '(': // ( - add new ExpList[] and recurse until matching ) found
            l_expList = [];

            FAM.DeprFormula.formulaTerms.lastIndex = FAM.DeprFormula.parseFormulaExp(
                l_formula,
                l_expList
            );

            token = new FAM.FunctionToken();
            token.OpCode = exp[0];
            token.OpType = 0;
            token.OpPrec = 0;
            token.LValue = l_expList;
            arrExpList.push(token);
            break;
        case ')': // ) - exit from current level, returning position for next search
            return FAM.DeprFormula.formulaTerms.lastIndex;
        case '^': // ^ - op ^, prior exp = LValue, next exp = RValue
            token = new FAM.FunctionToken();
            token.OpCode = exp[0];
            token.OpType = 1; // operator
            token.OpPrec = 3;
            arrExpList.push(token);
            break;
        case '*': // * - op *, prior exp = LValue, next exp = RValue
        case '/': // / - op /, prior exp = LValue, next exp = RValue
            token = new FAM.FunctionToken();
            token.OpCode = exp[0];
            token.OpType = 1; // operator
            token.OpPrec = 2;
            arrExpList.push(token);
            break;
        case '+': // + - op +, prior exp = LValue, next exp = RValue
        case '-': // - - op -, prior exp = LValue, next exp = RValue
        case '~': // ~ - op ~, prior exp = LVlaue, next exp = RValue
            token = new FAM.FunctionToken();
            token.OpCode = exp[0];
            token.OpType = 1; // operator
            token.OpPrec = 1;
            arrExpList.push(token);
            break;
        case 'OC':
        case 'NB':
        case 'RV':
        case 'AL':
        case 'CP':
        case 'TD':
        case 'CU':
        case 'LU':
        case 'LD':
        case 'CC':
        case 'DH':
        case 'PB':
        case 'DP':
        case 'FY':
            token = new FAM.FunctionToken();
            token.OpCode = exp[0];
            token.OpType = 2;   // constant
            arrExpList.push(token);
            break;
        default: // 0-9 - digits, constant value, store in LValue
            numeric.lastIndex = 0;  // ensure regular expression set to start position
            if (numeric.test(exp[0])) {
                token = new FAM.FunctionToken();
                token.OpCode = '#';
                token.OpType = 2; // constant
                token.LValue = exp[0];
                arrExpList.push(token);
            } // else error?
        }
    }

    return formula.length;
};

/**
 * Recursively parses a formula expression list (array of terms with no precedence) and fold this
 * list into a tree based upon the correct operator precedence.
 *
 * The resulting expression tree can be used by other functions to evaluate the formula.
 *
 * Parameters:
 *     arrExpList - the list (array) of expressions to be parsed
 *     token      - (output) the resulting token (tree of OpCodes)
 * Returns:
 *     boolean - indicates if validation was successful
 */
FAM.DeprFormula.assignTerms = function (arrExpList, token) {
    var i, j, p, cValue, currToken, nextToken;

    // if extra levels of () are used, we can get passed a single element with OpCode '(' ...
    // if so, skip this level!
    if (arrExpList.length === 1 && arrExpList[0].OpCode === '(') {
        return FAM.DeprFormula.assignTerms(arrExpList[0].LValue, token);
    }

    for (p = 3; p > 0; p--) {
        for (i = 0; i < arrExpList.length; i++) {
            if (arrExpList[i] instanceof FAM.FunctionToken) {
                currToken = arrExpList[i];

                if (currToken.OpPrec == p) {
                    if (i === 0 || i === arrExpList.length - 1) {
                        return false; // error, badly formed formula
                    }

                    currToken.OpPrec = 4; // already processed

                    for (j = -1; j < 2; j += 2) {
                        nextToken = arrExpList[i + j];

                        if (nextToken.OpType == 0 && nextToken.OpCode == '(') {
                            cValue = new FAM.FunctionToken();

                            if (!FAM.DeprFormula.assignTerms(nextToken.LValue, cValue)) {
                                return false; // pass error back up
                            }
                        } else {
                            if (nextToken.OpType != 2 && nextToken.OpPrec < 4) {
                                return false; // error, two adjacent operators (or undefined term)
                            }

                            cValue = nextToken;
                        }

                        if (j < 0) {
                            currToken.LValue = cValue;
                        } else {
                            currToken.RValue = cValue;
                        }
                    }

                    arrExpList.splice(i - 1, 3, currToken); // replace terms with new tokens
                    i--; // decrement i since we just shifted the remaining array elements
                }
            }
        }
    }

    // arrExpList should only contain one element as everything folds into the OpCode tree... but
    // this may be just '(' if there are excess parentheses... so iterate through those

    token.OpCode = arrExpList[0].OpCode;
    token.OpType = arrExpList[0].OpType;
    token.LValue = arrExpList[0].LValue;
    token.RValue = arrExpList[0].RValue;

    return true;
};

/**
 * Recursively parses a formula expression to identify all the terms (building a tree) and validate
 * that the formula syntax is correct.
 *
 * The resulting expression tree can be used by other functions to evaluate the formula
 *
 * Parameters:
 *     formula - the formula expression to be parsed
 *     token   - (output) the resulting token (tree of OpCodes)
 * Returns:
 *     boolean - indicates if validation was successful
 */
FAM.DeprFormula.parseFormula = function (formula, token) {
    // all in one test that valid terms are used (but cannot validate correct positioning)
    var validexp = /^([~\(\)\^\*\/\+\-]|[0-9]+(\.[0-9]+)?|OC|NB|RV|AL|CP|TD|CU|LU|LD|CC|DH|PB|DP|FY)+$/g,
        arrExpList  = [];

    // strip all whitespace
    formula = formula.replace(/\s/g, '');
    // and restore encoded '+'
    formula = formula.replace(/%2b/g, '+');

    validexp.lastIndex = 0; // ensure regular expression set to start position
    if (!validexp.test(formula)) {
        return false;
    }

    // identify expressions, left to right
    FAM.DeprFormula.formulaTerms.lastIndex = 0; // ensure regular expression set to start position
    FAM.DeprFormula.parseFormulaExp(formula, arrExpList);

    // in order of opcode precedence, search for opcodes and assign expressions
    return FAM.DeprFormula.assignTerms(arrExpList, token);
};

/**
 * FAM.DeprFormula.ExecFormula - execute a formula expression (already parsed and validated) and
 * return resulting value
 *
 * This function will recursively parse a formula expression and calculate the resulting value.
 *
 * Parameters:
 *     Fn          - the formula expression (in token form) to be executed
 *     AssetValues - named value array which should contain the following named entries:
 *         OC - Original Cost
 *         NB - Net Book value
 *         RV - Residual Value
 *         AL - Asset Lifetime
 *         CP - Current Period (current age)
 *         TD - Total Depreciation (== OC-RV)
 *         CU - Cumulative Units (total usage units since last depreciation)
 *         LU - Lifetime Units
 *         LD - Last Depreciation amount
 *         CC - Current Cost
 *         DH - Days Held (in current period)
 *         PB - Prior year net Book value
 *         DP - Days in Period
 *         FY - Days in Fiscal Year
 * Returns:
 *     number - the resulting value
**/
FAM.DeprFormula.ExecFormula = function(Fn,AssetValues) {
    var retVal = Number.NaN, lVal, rVal;

    if (!(Fn instanceof FAM.FunctionToken)) { return retVal; }

    switch (Fn.OpCode) {
        case '^':
            lVal = FAM.DeprFormula.ExecFormula(Fn.LValue,AssetValues);
            rVal = FAM.DeprFormula.ExecFormula(Fn.RValue,AssetValues);
            
            if (!isNaN(lVal) && !isNaN(rVal)) {
                retVal = Math.pow(lVal,rVal);
            }
            break;
        case '*':
            lVal = FAM.DeprFormula.ExecFormula(Fn.LValue,AssetValues);
            rVal = FAM.DeprFormula.ExecFormula(Fn.RValue,AssetValues);
            
            if (!isNaN(lVal) && !isNaN(rVal)) {
                retVal = lVal * rVal;
            }
            break;
        case '/':
            lVal = FAM.DeprFormula.ExecFormula(Fn.LValue,AssetValues);
            rVal = FAM.DeprFormula.ExecFormula(Fn.RValue,AssetValues);
            
            if (rVal === 0) {
                nlapiLogExecution('DEBUG', 'execformula',
                    'Error with division by zero, defaulting to 0 output');
                retVal = 0;
            }
            else if (!isNaN(lVal) && !isNaN(rVal)) {
                retVal = lVal / rVal;
            }
            break;
        case '+':
            lVal = FAM.DeprFormula.ExecFormula(Fn.LValue,AssetValues);
            rVal = FAM.DeprFormula.ExecFormula(Fn.RValue,AssetValues);
            
            if (!isNaN(lVal) && !isNaN(rVal)) {
                retVal = lVal + rVal;
            }
            break;
        case '-':
            lVal = FAM.DeprFormula.ExecFormula(Fn.LValue,AssetValues);
            rVal = FAM.DeprFormula.ExecFormula(Fn.RValue,AssetValues);
            
            if (!isNaN(lVal) && !isNaN(rVal)) {
                retVal = lVal - rVal;
            }
            break;
        case '~':
            lVal = FAM.DeprFormula.ExecFormula(Fn.LValue,AssetValues);
            rVal = FAM.DeprFormula.ExecFormula(Fn.RValue,AssetValues);
            
            if (!isNaN(lVal) && !isNaN(rVal)) {
                retVal = Math.max(lVal,rVal);
            }
            break;
        case '#':
            retVal = parseFloat(Fn.LValue);
            break;
        case 'OC':
        case 'NB':
        case 'RV':
        case 'AL':
        case 'CP':
        case 'TD':
        case 'CU':
        case 'LU':
        case 'LD':
        case 'CC':
        case 'DH':
        case 'PB':
        case 'DP':
        case 'FY':
            retVal = parseFloat(AssetValues[Fn.OpCode]);
            break;
        default:
            // do nothing, will return NaN anyway
    }

    return retVal;
};

FAM.DeprFormula.ExecFormulaProcessor = function(Fn,AssetValues) {
    var compFormula = Fn.toString().toUpperCase();
    var elem = ['OC','NB','RV','AL','CP','TD','CU','LU','LD','CC','DH','PB', 'DP', 'FY'];

    for(var ctr = 0; ctr<elem.length; ctr++) {
        if(AssetValues[elem[ctr]] && (!isNaN(AssetValues[elem[ctr]])))
            compFormula = compFormula.replace(new RegExp(elem[ctr], 'gi'), AssetValues[elem[ctr]]);
    }
    
    var x = new MathProcessor();
    var retVal = x.parse(compFormula);

    return retVal;
};

/** 
 * renders a formula expression as inline html showing the grouping of terms (for visual validation)
 *
 * This function will recursively parse a formula expression and build an html snippet which 
 * represents the formula.
 *
 * Parameters:
 *        token {FAM.FunctionToken} - the formula expression (in token form) to be rendered
 * Returns:
 *        string - the html rendering of the formula
**/
 FAM.DeprFormula.renderFormula = function (token) {
    var leftValue, rightValue, ret = '';

    if (token.OpType == 1) { // expression
        leftValue = FAM.DeprFormula.renderFormula(token.LValue);
        rightValue = FAM.DeprFormula.renderFormula(token.RValue);
        ret += '<table style="border-top-width:0;border-left-width:0;border-right-width:0;' +
            'border-bottom-width:2;border-collapse:collapse;border-style:solid;' +
            'border-color:#9f9f9f"><tr><td>' + leftValue + '</td><td>' + token.OpCode +
            '</td><td>' + rightValue + '</td></tr></table>';
    }
    else if (token.OpCode == '#') { // digits, value in token.LValue
        ret += token.LValue;
    }
    else { // other constant, just return OpCode
        ret += token.OpCode;
    }

    return ret;
};
