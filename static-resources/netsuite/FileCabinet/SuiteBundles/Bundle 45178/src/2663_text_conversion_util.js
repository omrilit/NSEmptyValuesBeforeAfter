/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author mmoya
 * 
 * Revision History:
 *
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2013/04/15  248008         2.00.12				  Initial Version	
 *
 */

var _2663;

if (!_2663)
    _2663 = {};

_2663.LATIN_MAP = {
		'Á': 'A',
		'Á': 'A', // LATIN CAPITAL LETTER A WITH ACUTE
		'Ă': 'A', // LATIN CAPITAL LETTER A WITH BREVE
		'Ắ': 'A', // LATIN CAPITAL LETTER A WITH BREVE AND ACUTE
		'Ặ': 'A', // LATIN CAPITAL LETTER A WITH BREVE AND DOT BELOW
		'Ằ': 'A', // LATIN CAPITAL LETTER A WITH BREVE AND GRAVE
		'Ẳ': 'A', // LATIN CAPITAL LETTER A WITH BREVE AND HOOK ABOVE
		'Ẵ': 'A', // LATIN CAPITAL LETTER A WITH BREVE AND TILDE
		'Ǎ': 'A', // LATIN CAPITAL LETTER A WITH CARON
		'Â': 'A', // LATIN CAPITAL LETTER A WITH CIRCUMFLEX
		'Ấ': 'A', // LATIN CAPITAL LETTER A WITH CIRCUMFLEX AND ACUTE
		'Ậ': 'A', // LATIN CAPITAL LETTER A WITH CIRCUMFLEX AND DOT BELOW
		'Ầ': 'A', // LATIN CAPITAL LETTER A WITH CIRCUMFLEX AND GRAVE
		'Ẩ': 'A', // LATIN CAPITAL LETTER A WITH CIRCUMFLEX AND HOOK ABOVE
		'Ẫ': 'A', // LATIN CAPITAL LETTER A WITH CIRCUMFLEX AND TILDE
		'Ä': 'A', // LATIN CAPITAL LETTER A WITH DIAERESIS
		'Ǟ': 'A', // LATIN CAPITAL LETTER A WITH DIAERESIS AND MACRON
		'Ȧ': 'A', // LATIN CAPITAL LETTER A WITH DOT ABOVE
		'Ǡ': 'A', // LATIN CAPITAL LETTER A WITH DOT ABOVE AND MACRON
		'Ạ': 'A', // LATIN CAPITAL LETTER A WITH DOT BELOW
		'Ȁ': 'A', // LATIN CAPITAL LETTER A WITH DOUBLE GRAVE
		'À': 'A', // LATIN CAPITAL LETTER A WITH GRAVE
		'Ả': 'A', // LATIN CAPITAL LETTER A WITH HOOK ABOVE
		'Ȃ': 'A', // LATIN CAPITAL LETTER A WITH INVERTED BREVE
		'Ā': 'A', // LATIN CAPITAL LETTER A WITH MACRON
		'Ą': 'A', // LATIN CAPITAL LETTER A WITH OGONEK
		'Å': 'A', // LATIN CAPITAL LETTER A WITH RING ABOVE
		'Ǻ': 'A', // LATIN CAPITAL LETTER A WITH RING ABOVE AND ACUTE
		'Ḁ': 'A', // LATIN CAPITAL LETTER A WITH RING BELOW
		'Ⱥ': 'A', // LATIN CAPITAL LETTER A WITH STROKE
		'Ã': 'A', // LATIN CAPITAL LETTER A WITH TILDE
		'Ꜳ': 'AA', // LATIN CAPITAL LETTER AA
		'Æ': 'AE', // LATIN CAPITAL LETTER AE
		'Ǽ': 'AE', // LATIN CAPITAL LETTER AE WITH ACUTE
		'Ǣ': 'AE', // LATIN CAPITAL LETTER AE WITH MACRON
		'Ḃ': 'B', // LATIN CAPITAL LETTER B WITH DOT ABOVE
		'Ḅ': 'B', // LATIN CAPITAL LETTER B WITH DOT BELOW
		'Ɓ': 'B', // LATIN CAPITAL LETTER B WITH HOOK
		'Ḇ': 'B', // LATIN CAPITAL LETTER B WITH LINE BELOW
		'Ƀ': 'B', // LATIN CAPITAL LETTER B WITH STROKE
		'Ƃ': 'B', // LATIN CAPITAL LETTER B WITH TOPBAR
		'Ć': 'C', // LATIN CAPITAL LETTER C WITH ACUTE
		'Č': 'C', // LATIN CAPITAL LETTER C WITH CARON
		'Ç': 'C', // LATIN CAPITAL LETTER C WITH CEDILLA
		'Ḉ': 'C', // LATIN CAPITAL LETTER C WITH CEDILLA AND ACUTE
		'Ĉ': 'C', // LATIN CAPITAL LETTER C WITH CIRCUMFLEX
		'Ċ': 'C', // LATIN CAPITAL LETTER C WITH DOT ABOVE
		'Ƈ': 'C', // LATIN CAPITAL LETTER C WITH HOOK
		'Ȼ': 'C', // LATIN CAPITAL LETTER C WITH STROKE
		'Ď': 'D', // LATIN CAPITAL LETTER D WITH CARON
		'Ḑ': 'D', // LATIN CAPITAL LETTER D WITH CEDILLA
		'Ḓ': 'D', // LATIN CAPITAL LETTER D WITH CIRCUMFLEX BELOW
		'Ḋ': 'D', // LATIN CAPITAL LETTER D WITH DOT ABOVE
		'Ḍ': 'D', // LATIN CAPITAL LETTER D WITH DOT BELOW
		'Ɗ': 'D', // LATIN CAPITAL LETTER D WITH HOOK
		'Ḏ': 'D', // LATIN CAPITAL LETTER D WITH LINE BELOW
		'ǲ': 'D', // LATIN CAPITAL LETTER D WITH SMALL LETTER Z
		'ǅ': 'D', // LATIN CAPITAL LETTER D WITH SMALL LETTER Z WITH CARON
		'Đ': 'D', // LATIN CAPITAL LETTER D WITH STROKE
		'Ƌ': 'D', // LATIN CAPITAL LETTER D WITH TOPBAR
		'Ǳ': 'DZ', // LATIN CAPITAL LETTER DZ
		'Ǆ': 'DZ', // LATIN CAPITAL LETTER DZ WITH CARON
		'É': 'E', // LATIN CAPITAL LETTER E WITH ACUTE
		'Ĕ': 'E', // LATIN CAPITAL LETTER E WITH BREVE
		'Ě': 'E', // LATIN CAPITAL LETTER E WITH CARON
		'Ȩ': 'E', // LATIN CAPITAL LETTER E WITH CEDILLA
		'Ḝ': 'E', // LATIN CAPITAL LETTER E WITH CEDILLA AND BREVE
		'Ê': 'E', // LATIN CAPITAL LETTER E WITH CIRCUMFLEX
		'Ế': 'E', // LATIN CAPITAL LETTER E WITH CIRCUMFLEX AND ACUTE
		'Ệ': 'E', // LATIN CAPITAL LETTER E WITH CIRCUMFLEX AND DOT BELOW
		'Ề': 'E', // LATIN CAPITAL LETTER E WITH CIRCUMFLEX AND GRAVE
		'Ể': 'E', // LATIN CAPITAL LETTER E WITH CIRCUMFLEX AND HOOK ABOVE
		'Ễ': 'E', // LATIN CAPITAL LETTER E WITH CIRCUMFLEX AND TILDE
		'Ḙ': 'E', // LATIN CAPITAL LETTER E WITH CIRCUMFLEX BELOW
		'Ë': 'E', // LATIN CAPITAL LETTER E WITH DIAERESIS
		'Ė': 'E', // LATIN CAPITAL LETTER E WITH DOT ABOVE
		'Ẹ': 'E', // LATIN CAPITAL LETTER E WITH DOT BELOW
		'Ȅ': 'E', // LATIN CAPITAL LETTER E WITH DOUBLE GRAVE
		'È': 'E', // LATIN CAPITAL LETTER E WITH GRAVE
		'Ẻ': 'E', // LATIN CAPITAL LETTER E WITH HOOK ABOVE
		'Ȇ': 'E', // LATIN CAPITAL LETTER E WITH INVERTED BREVE
		'Ē': 'E', // LATIN CAPITAL LETTER E WITH MACRON
		'Ḗ': 'E', // LATIN CAPITAL LETTER E WITH MACRON AND ACUTE
		'Ḕ': 'E', // LATIN CAPITAL LETTER E WITH MACRON AND GRAVE
		'Ę': 'E', // LATIN CAPITAL LETTER E WITH OGONEK
		'Ɇ': 'E', // LATIN CAPITAL LETTER E WITH STROKE
		'Ẽ': 'E', // LATIN CAPITAL LETTER E WITH TILDE
		'Ḛ': 'E', // LATIN CAPITAL LETTER E WITH TILDE BELOW
		'Ḟ': 'F', // LATIN CAPITAL LETTER F WITH DOT ABOVE
		'Ƒ': 'F', // LATIN CAPITAL LETTER F WITH HOOK
		'Ǵ': 'G', // LATIN CAPITAL LETTER G WITH ACUTE
		'Ğ': 'G', // LATIN CAPITAL LETTER G WITH BREVE
		'Ǧ': 'G', // LATIN CAPITAL LETTER G WITH CARON
		'Ģ': 'G', // LATIN CAPITAL LETTER G WITH CEDILLA
		'Ĝ': 'G', // LATIN CAPITAL LETTER G WITH CIRCUMFLEX
		'Ġ': 'G', // LATIN CAPITAL LETTER G WITH DOT ABOVE
		'Ɠ': 'G', // LATIN CAPITAL LETTER G WITH HOOK
		'Ḡ': 'G', // LATIN CAPITAL LETTER G WITH MACRON
		'Ǥ': 'G', // LATIN CAPITAL LETTER G WITH STROKE
		'Ḫ': 'H', // LATIN CAPITAL LETTER H WITH BREVE BELOW
		'Ȟ': 'H', // LATIN CAPITAL LETTER H WITH CARON
		'Ḩ': 'H', // LATIN CAPITAL LETTER H WITH CEDILLA
		'Ĥ': 'H', // LATIN CAPITAL LETTER H WITH CIRCUMFLEX
		'Ⱨ': 'H', // LATIN CAPITAL LETTER H WITH DESCENDER
		'Ḧ': 'H', // LATIN CAPITAL LETTER H WITH DIAERESIS
		'Ḣ': 'H', // LATIN CAPITAL LETTER H WITH DOT ABOVE
		'Ḥ': 'H', // LATIN CAPITAL LETTER H WITH DOT BELOW
		'Ħ': 'H', // LATIN CAPITAL LETTER H WITH STROKE
		'Í': 'I', // LATIN CAPITAL LETTER I WITH ACUTE
		'Ĭ': 'I', // LATIN CAPITAL LETTER I WITH BREVE
		'Ǐ': 'I', // LATIN CAPITAL LETTER I WITH CARON
		'Î': 'I', // LATIN CAPITAL LETTER I WITH CIRCUMFLEX
		'Ï': 'I', // LATIN CAPITAL LETTER I WITH DIAERESIS
		'Ḯ': 'I', // LATIN CAPITAL LETTER I WITH DIAERESIS AND ACUTE
		'İ': 'I', // LATIN CAPITAL LETTER I WITH DOT ABOVE
		'Ị': 'I', // LATIN CAPITAL LETTER I WITH DOT BELOW
		'Ȉ': 'I', // LATIN CAPITAL LETTER I WITH DOUBLE GRAVE
		'Ì': 'I', // LATIN CAPITAL LETTER I WITH GRAVE
		'Ỉ': 'I', // LATIN CAPITAL LETTER I WITH HOOK ABOVE
		'Ȋ': 'I', // LATIN CAPITAL LETTER I WITH INVERTED BREVE
		'Ī': 'I', // LATIN CAPITAL LETTER I WITH MACRON
		'Į': 'I', // LATIN CAPITAL LETTER I WITH OGONEK
		'Ɨ': 'I', // LATIN CAPITAL LETTER I WITH STROKE
		'Ĩ': 'I', // LATIN CAPITAL LETTER I WITH TILDE
		'Ḭ': 'I', // LATIN CAPITAL LETTER I WITH TILDE BELOW
		'Ĵ': 'J', // LATIN CAPITAL LETTER J WITH CIRCUMFLEX
		'Ɉ': 'J', // LATIN CAPITAL LETTER J WITH STROKE
		'Ḱ': 'K', // LATIN CAPITAL LETTER K WITH ACUTE
		'Ǩ': 'K', // LATIN CAPITAL LETTER K WITH CARON
		'Ķ': 'K', // LATIN CAPITAL LETTER K WITH CEDILLA
		'Ⱪ': 'K', // LATIN CAPITAL LETTER K WITH DESCENDER
		'Ḳ': 'K', // LATIN CAPITAL LETTER K WITH DOT BELOW
		'Ƙ': 'K', // LATIN CAPITAL LETTER K WITH HOOK
		'Ḵ': 'K', // LATIN CAPITAL LETTER K WITH LINE BELOW
		'Ĺ': 'L', // LATIN CAPITAL LETTER L WITH ACUTE
		'Ƚ': 'L', // LATIN CAPITAL LETTER L WITH BAR
		'Ľ': 'L', // LATIN CAPITAL LETTER L WITH CARON
		'Ļ': 'L', // LATIN CAPITAL LETTER L WITH CEDILLA
		'Ḽ': 'L', // LATIN CAPITAL LETTER L WITH CIRCUMFLEX BELOW
		'Ḷ': 'L', // LATIN CAPITAL LETTER L WITH DOT BELOW
		'Ḹ': 'L', // LATIN CAPITAL LETTER L WITH DOT BELOW AND MACRON
		'Ⱡ': 'L', // LATIN CAPITAL LETTER L WITH DOUBLE BAR
		'Ḻ': 'L', // LATIN CAPITAL LETTER L WITH LINE BELOW
		'Ŀ': 'L', // LATIN CAPITAL LETTER L WITH MIDDLE DOT
		'Ɫ': 'L', // LATIN CAPITAL LETTER L WITH MIDDLE TILDE
		'ǈ': 'L', // LATIN CAPITAL LETTER L WITH SMALL LETTER J
		'Ł': 'L', // LATIN CAPITAL LETTER L WITH STROKE
		'Ǉ': 'LJ', // LATIN CAPITAL LETTER LJ
		'Ḿ': 'M', // LATIN CAPITAL LETTER M WITH ACUTE
		'Ṁ': 'M', // LATIN CAPITAL LETTER M WITH DOT ABOVE
		'Ṃ': 'M', // LATIN CAPITAL LETTER M WITH DOT BELOW
		'Ń': 'N', // LATIN CAPITAL LETTER N WITH ACUTE
		'Ň': 'N', // LATIN CAPITAL LETTER N WITH CARON
		'Ņ': 'N', // LATIN CAPITAL LETTER N WITH CEDILLA
		'Ṋ': 'N', // LATIN CAPITAL LETTER N WITH CIRCUMFLEX BELOW
		'Ṅ': 'N', // LATIN CAPITAL LETTER N WITH DOT ABOVE
		'Ṇ': 'N', // LATIN CAPITAL LETTER N WITH DOT BELOW
		'Ǹ': 'N', // LATIN CAPITAL LETTER N WITH GRAVE
		'Ɲ': 'N', // LATIN CAPITAL LETTER N WITH LEFT HOOK
		'Ṉ': 'N', // LATIN CAPITAL LETTER N WITH LINE BELOW
		'Ƞ': 'N', // LATIN CAPITAL LETTER N WITH LONG RIGHT LEG
		'ǋ': 'N', // LATIN CAPITAL LETTER N WITH SMALL LETTER J
		'Ñ': 'N', // LATIN CAPITAL LETTER N WITH TILDE
		'Ǌ': 'NJ', // LATIN CAPITAL LETTER NJ
		'Ó': 'O', // LATIN CAPITAL LETTER O WITH ACUTE
		'Ŏ': 'O', // LATIN CAPITAL LETTER O WITH BREVE
		'Ǒ': 'O', // LATIN CAPITAL LETTER O WITH CARON
		'Ô': 'O', // LATIN CAPITAL LETTER O WITH CIRCUMFLEX
		'Ố': 'O', // LATIN CAPITAL LETTER O WITH CIRCUMFLEX AND ACUTE
		'Ộ': 'O', // LATIN CAPITAL LETTER O WITH CIRCUMFLEX AND DOT BELOW
		'Ồ': 'O', // LATIN CAPITAL LETTER O WITH CIRCUMFLEX AND GRAVE
		'Ổ': 'O', // LATIN CAPITAL LETTER O WITH CIRCUMFLEX AND HOOK ABOVE
		'Ỗ': 'O', // LATIN CAPITAL LETTER O WITH CIRCUMFLEX AND TILDE
		'Ö': 'O', // LATIN CAPITAL LETTER O WITH DIAERESIS
		'Ȫ': 'O', // LATIN CAPITAL LETTER O WITH DIAERESIS AND MACRON
		'Ȯ': 'O', // LATIN CAPITAL LETTER O WITH DOT ABOVE
		'Ȱ': 'O', // LATIN CAPITAL LETTER O WITH DOT ABOVE AND MACRON
		'Ọ': 'O', // LATIN CAPITAL LETTER O WITH DOT BELOW
		'Ő': 'O', // LATIN CAPITAL LETTER O WITH DOUBLE ACUTE
		'Ȍ': 'O', // LATIN CAPITAL LETTER O WITH DOUBLE GRAVE
		'Ò': 'O', // LATIN CAPITAL LETTER O WITH GRAVE
		'Ỏ': 'O', // LATIN CAPITAL LETTER O WITH HOOK ABOVE
		'Ơ': 'O', // LATIN CAPITAL LETTER O WITH HORN
		'Ớ': 'O', // LATIN CAPITAL LETTER O WITH HORN AND ACUTE
		'Ợ': 'O', // LATIN CAPITAL LETTER O WITH HORN AND DOT BELOW
		'Ờ': 'O', // LATIN CAPITAL LETTER O WITH HORN AND GRAVE
		'Ở': 'O', // LATIN CAPITAL LETTER O WITH HORN AND HOOK ABOVE
		'Ỡ': 'O', // LATIN CAPITAL LETTER O WITH HORN AND TILDE
		'Ȏ': 'O', // LATIN CAPITAL LETTER O WITH INVERTED BREVE
		'Ō': 'O', // LATIN CAPITAL LETTER O WITH MACRON
		'Ṓ': 'O', // LATIN CAPITAL LETTER O WITH MACRON AND ACUTE
		'Ṑ': 'O', // LATIN CAPITAL LETTER O WITH MACRON AND GRAVE
		'Ɵ': 'O', // LATIN CAPITAL LETTER O WITH MIDDLE TILDE
		'Ǫ': 'O', // LATIN CAPITAL LETTER O WITH OGONEK
		'Ǭ': 'O', // LATIN CAPITAL LETTER O WITH OGONEK AND MACRON
		'Ø': 'O', // LATIN CAPITAL LETTER O WITH STROKE
		'Ǿ': 'O', // LATIN CAPITAL LETTER O WITH STROKE AND ACUTE
		'Õ': 'O', // LATIN CAPITAL LETTER O WITH TILDE
		'Ṍ': 'O', // LATIN CAPITAL LETTER O WITH TILDE AND ACUTE
		'Ṏ': 'O', // LATIN CAPITAL LETTER O WITH TILDE AND DIAERESIS
		'Ȭ': 'O', // LATIN CAPITAL LETTER O WITH TILDE AND MACRON
		'Ƣ': 'OI', // LATIN CAPITAL LETTER OI
		'Ɛ': 'E', // LATIN CAPITAL LETTER OPEN E
		'Ɔ': 'O', // LATIN CAPITAL LETTER OPEN O
		'Ȣ': 'OU', // LATIN CAPITAL LETTER OU
		'Ṕ': 'P', // LATIN CAPITAL LETTER P WITH ACUTE
		'Ṗ': 'P', // LATIN CAPITAL LETTER P WITH DOT ABOVE
		'Ƥ': 'P', // LATIN CAPITAL LETTER P WITH HOOK
		'Ᵽ': 'P', // LATIN CAPITAL LETTER P WITH STROKE
		'Ŕ': 'R', // LATIN CAPITAL LETTER R WITH ACUTE
		'Ř': 'R', // LATIN CAPITAL LETTER R WITH CARON
		'Ŗ': 'R', // LATIN CAPITAL LETTER R WITH CEDILLA
		'Ṙ': 'R', // LATIN CAPITAL LETTER R WITH DOT ABOVE
		'Ṛ': 'R', // LATIN CAPITAL LETTER R WITH DOT BELOW
		'Ṝ': 'R', // LATIN CAPITAL LETTER R WITH DOT BELOW AND MACRON
		'Ȑ': 'R', // LATIN CAPITAL LETTER R WITH DOUBLE GRAVE
		'Ȓ': 'R', // LATIN CAPITAL LETTER R WITH INVERTED BREVE
		'Ṟ': 'R', // LATIN CAPITAL LETTER R WITH LINE BELOW
		'Ɍ': 'R', // LATIN CAPITAL LETTER R WITH STROKE
		'Ɽ': 'R', // LATIN CAPITAL LETTER R WITH TAIL
		'Ǝ': 'E', // LATIN CAPITAL LETTER REVERSED E
		'Ś': 'S', // LATIN CAPITAL LETTER S WITH ACUTE
		'Ṥ': 'S', // LATIN CAPITAL LETTER S WITH ACUTE AND DOT ABOVE
		'Š': 'S', // LATIN CAPITAL LETTER S WITH CARON
		'Ṧ': 'S', // LATIN CAPITAL LETTER S WITH CARON AND DOT ABOVE
		'Ş': 'S', // LATIN CAPITAL LETTER S WITH CEDILLA
		'Ŝ': 'S', // LATIN CAPITAL LETTER S WITH CIRCUMFLEX
		'Ș': 'S', // LATIN CAPITAL LETTER S WITH COMMA BELOW
		'Ṡ': 'S', // LATIN CAPITAL LETTER S WITH DOT ABOVE
		'Ṣ': 'S', // LATIN CAPITAL LETTER S WITH DOT BELOW
		'Ṩ': 'S', // LATIN CAPITAL LETTER S WITH DOT BELOW AND DOT ABOVE
		'ẞ': 'SS', // LATIN CAPITAL LETTER SHARP S
		'Ť': 'T', // LATIN CAPITAL LETTER T WITH CARON
		'Ţ': 'T', // LATIN CAPITAL LETTER T WITH CEDILLA
		'Ṱ': 'T', // LATIN CAPITAL LETTER T WITH CIRCUMFLEX BELOW
		'Ț': 'T', // LATIN CAPITAL LETTER T WITH COMMA BELOW
		'Ⱦ': 'T', // LATIN CAPITAL LETTER T WITH DIAGONAL STROKE
		'Ṫ': 'T', // LATIN CAPITAL LETTER T WITH DOT ABOVE
		'Ṭ': 'T', // LATIN CAPITAL LETTER T WITH DOT BELOW
		'Ƭ': 'T', // LATIN CAPITAL LETTER T WITH HOOK
		'Ṯ': 'T', // LATIN CAPITAL LETTER T WITH LINE BELOW
		'Ʈ': 'T', // LATIN CAPITAL LETTER T WITH RETROFLEX HOOK
		'Ŧ': 'T', // LATIN CAPITAL LETTER T WITH STROKE
		'Ɯ': 'M', // LATIN CAPITAL LETTER TURNED M
		'Ʌ': 'V', // LATIN CAPITAL LETTER TURNED V
		'Ú': 'U', // LATIN CAPITAL LETTER U WITH ACUTE
		'Ŭ': 'U', // LATIN CAPITAL LETTER U WITH BREVE
		'Ǔ': 'U', // LATIN CAPITAL LETTER U WITH CARON
		'Û': 'U', // LATIN CAPITAL LETTER U WITH CIRCUMFLEX
		'Ṷ': 'U', // LATIN CAPITAL LETTER U WITH CIRCUMFLEX BELOW
		'Ü': 'U', // LATIN CAPITAL LETTER U WITH DIAERESIS
		'Ǘ': 'U', // LATIN CAPITAL LETTER U WITH DIAERESIS AND ACUTE
		'Ǚ': 'U', // LATIN CAPITAL LETTER U WITH DIAERESIS AND CARON
		'Ǜ': 'U', // LATIN CAPITAL LETTER U WITH DIAERESIS AND GRAVE
		'Ǖ': 'U', // LATIN CAPITAL LETTER U WITH DIAERESIS AND MACRON
		'Ṳ': 'U', // LATIN CAPITAL LETTER U WITH DIAERESIS BELOW
		'Ụ': 'U', // LATIN CAPITAL LETTER U WITH DOT BELOW
		'Ű': 'U', // LATIN CAPITAL LETTER U WITH DOUBLE ACUTE
		'Ȕ': 'U', // LATIN CAPITAL LETTER U WITH DOUBLE GRAVE
		'Ù': 'U', // LATIN CAPITAL LETTER U WITH GRAVE
		'Ủ': 'U', // LATIN CAPITAL LETTER U WITH HOOK ABOVE
		'Ư': 'U', // LATIN CAPITAL LETTER U WITH HORN
		'Ứ': 'U', // LATIN CAPITAL LETTER U WITH HORN AND ACUTE
		'Ự': 'U', // LATIN CAPITAL LETTER U WITH HORN AND DOT BELOW
		'Ừ': 'U', // LATIN CAPITAL LETTER U WITH HORN AND GRAVE
		'Ử': 'U', // LATIN CAPITAL LETTER U WITH HORN AND HOOK ABOVE
		'Ữ': 'U', // LATIN CAPITAL LETTER U WITH HORN AND TILDE
		'Ȗ': 'U', // LATIN CAPITAL LETTER U WITH INVERTED BREVE
		'Ū': 'U', // LATIN CAPITAL LETTER U WITH MACRON
		'Ṻ': 'U', // LATIN CAPITAL LETTER U WITH MACRON AND DIAERESIS
		'Ų': 'U', // LATIN CAPITAL LETTER U WITH OGONEK
		'Ů': 'U', // LATIN CAPITAL LETTER U WITH RING ABOVE
		'Ũ': 'U', // LATIN CAPITAL LETTER U WITH TILDE
		'Ṹ': 'U', // LATIN CAPITAL LETTER U WITH TILDE AND ACUTE
		'Ṵ': 'U', // LATIN CAPITAL LETTER U WITH TILDE BELOW
		'Ṿ': 'V', // LATIN CAPITAL LETTER V WITH DOT BELOW
		'Ʋ': 'V', // LATIN CAPITAL LETTER V WITH HOOK
		'Ṽ': 'V', // LATIN CAPITAL LETTER V WITH TILDE
		'Ẃ': 'W', // LATIN CAPITAL LETTER W WITH ACUTE
		'Ŵ': 'W', // LATIN CAPITAL LETTER W WITH CIRCUMFLEX
		'Ẅ': 'W', // LATIN CAPITAL LETTER W WITH DIAERESIS
		'Ẇ': 'W', // LATIN CAPITAL LETTER W WITH DOT ABOVE
		'Ẉ': 'W', // LATIN CAPITAL LETTER W WITH DOT BELOW
		'Ẁ': 'W', // LATIN CAPITAL LETTER W WITH GRAVE
		'Ⱳ': 'W', // LATIN CAPITAL LETTER W WITH HOOK
		'Ẍ': 'X', // LATIN CAPITAL LETTER X WITH DIAERESIS
		'Ẋ': 'X', // LATIN CAPITAL LETTER X WITH DOT ABOVE
		'Ý': 'Y', // LATIN CAPITAL LETTER Y WITH ACUTE
		'Ŷ': 'Y', // LATIN CAPITAL LETTER Y WITH CIRCUMFLEX
		'Ÿ': 'Y', // LATIN CAPITAL LETTER Y WITH DIAERESIS
		'Ẏ': 'Y', // LATIN CAPITAL LETTER Y WITH DOT ABOVE
		'Ỵ': 'Y', // LATIN CAPITAL LETTER Y WITH DOT BELOW
		'Ỳ': 'Y', // LATIN CAPITAL LETTER Y WITH GRAVE
		'Ƴ': 'Y', // LATIN CAPITAL LETTER Y WITH HOOK
		'Ỷ': 'Y', // LATIN CAPITAL LETTER Y WITH HOOK ABOVE
		'Ȳ': 'Y', // LATIN CAPITAL LETTER Y WITH MACRON
		'Ɏ': 'Y', // LATIN CAPITAL LETTER Y WITH STROKE
		'Ỹ': 'Y', // LATIN CAPITAL LETTER Y WITH TILDE
		'Ź': 'Z', // LATIN CAPITAL LETTER Z WITH ACUTE
		'Ž': 'Z', // LATIN CAPITAL LETTER Z WITH CARON
		'Ẑ': 'Z', // LATIN CAPITAL LETTER Z WITH CIRCUMFLEX
		'Ⱬ': 'Z', // LATIN CAPITAL LETTER Z WITH DESCENDER
		'Ż': 'Z', // LATIN CAPITAL LETTER Z WITH DOT ABOVE
		'Ẓ': 'Z', // LATIN CAPITAL LETTER Z WITH DOT BELOW
		'Ȥ': 'Z', // LATIN CAPITAL LETTER Z WITH HOOK
		'Ẕ': 'Z', // LATIN CAPITAL LETTER Z WITH LINE BELOW
		'Ƶ': 'Z', // LATIN CAPITAL LETTER Z WITH STROKE
		'Ĳ': 'IJ', // LATIN CAPITAL LIGATURE IJ
		'Œ': 'OE', // LATIN CAPITAL LIGATURE OE
		'ᴀ': 'A', // LATIN LETTER SMALL CAPITAL A
		'ᴁ': 'AE', // LATIN LETTER SMALL CAPITAL AE
		'ʙ': 'B', // LATIN LETTER SMALL CAPITAL B
		'ᴃ': 'B', // LATIN LETTER SMALL CAPITAL BARRED B
		'ᴄ': 'C', // LATIN LETTER SMALL CAPITAL C
		'ᴅ': 'D', // LATIN LETTER SMALL CAPITAL D
		'ᴇ': 'E', // LATIN LETTER SMALL CAPITAL E
		'ɢ': 'G', // LATIN LETTER SMALL CAPITAL G
		'ʛ': 'G', // LATIN LETTER SMALL CAPITAL G WITH HOOK
		'ʜ': 'H', // LATIN LETTER SMALL CAPITAL H
		'ɪ': 'I', // LATIN LETTER SMALL CAPITAL I
		'ʁ': 'R', // LATIN LETTER SMALL CAPITAL INVERTED R
		'ᴊ': 'J', // LATIN LETTER SMALL CAPITAL J
		'ᴋ': 'K', // LATIN LETTER SMALL CAPITAL K
		'ʟ': 'L', // LATIN LETTER SMALL CAPITAL L
		'ᴌ': 'L', // LATIN LETTER SMALL CAPITAL L WITH STROKE
		'ᴍ': 'M', // LATIN LETTER SMALL CAPITAL M
		'ɴ': 'N', // LATIN LETTER SMALL CAPITAL N
		'ᴏ': 'O', // LATIN LETTER SMALL CAPITAL O
		'ɶ': 'OE', // LATIN LETTER SMALL CAPITAL OE
		'ᴐ': 'O', // LATIN LETTER SMALL CAPITAL OPEN O
		'ᴕ': 'OU', // LATIN LETTER SMALL CAPITAL OU
		'ᴘ': 'P', // LATIN LETTER SMALL CAPITAL P
		'ʀ': 'R', // LATIN LETTER SMALL CAPITAL R
		'ᴎ': 'N', // LATIN LETTER SMALL CAPITAL REVERSED N
		'ᴙ': 'R', // LATIN LETTER SMALL CAPITAL REVERSED R
		'ᴛ': 'T', // LATIN LETTER SMALL CAPITAL T
		'ᴚ': 'R', // LATIN LETTER SMALL CAPITAL TURNED R
		'ᴜ': 'U', // LATIN LETTER SMALL CAPITAL U
		'ᴠ': 'V', // LATIN LETTER SMALL CAPITAL V
		'ᴡ': 'W', // LATIN LETTER SMALL CAPITAL W
		'ʏ': 'Y', // LATIN LETTER SMALL CAPITAL Y
		'ᴢ': 'Z', // LATIN LETTER SMALL CAPITAL Z
		'á': 'a', // LATIN SMALL LETTER A WITH ACUTE
		'ă': 'a', // LATIN SMALL LETTER A WITH BREVE
		'ắ': 'a', // LATIN SMALL LETTER A WITH BREVE AND ACUTE
		'ặ': 'a', // LATIN SMALL LETTER A WITH BREVE AND DOT BELOW
		'ằ': 'a', // LATIN SMALL LETTER A WITH BREVE AND GRAVE
		'ẳ': 'a', // LATIN SMALL LETTER A WITH BREVE AND HOOK ABOVE
		'ẵ': 'a', // LATIN SMALL LETTER A WITH BREVE AND TILDE
		'ǎ': 'a', // LATIN SMALL LETTER A WITH CARON
		'â': 'a', // LATIN SMALL LETTER A WITH CIRCUMFLEX
		'ấ': 'a', // LATIN SMALL LETTER A WITH CIRCUMFLEX AND ACUTE
		'ậ': 'a', // LATIN SMALL LETTER A WITH CIRCUMFLEX AND DOT BELOW
		'ầ': 'a', // LATIN SMALL LETTER A WITH CIRCUMFLEX AND GRAVE
		'ẩ': 'a', // LATIN SMALL LETTER A WITH CIRCUMFLEX AND HOOK ABOVE
		'ẫ': 'a', // LATIN SMALL LETTER A WITH CIRCUMFLEX AND TILDE
		'ä': 'a', // LATIN SMALL LETTER A WITH DIAERESIS
		'ǟ': 'a', // LATIN SMALL LETTER A WITH DIAERESIS AND MACRON
		'ȧ': 'a', // LATIN SMALL LETTER A WITH DOT ABOVE
		'ǡ': 'a', // LATIN SMALL LETTER A WITH DOT ABOVE AND MACRON
		'ạ': 'a', // LATIN SMALL LETTER A WITH DOT BELOW
		'ȁ': 'a', // LATIN SMALL LETTER A WITH DOUBLE GRAVE
		'à': 'a', // LATIN SMALL LETTER A WITH GRAVE
		'ả': 'a', // LATIN SMALL LETTER A WITH HOOK ABOVE
		'ȃ': 'a', // LATIN SMALL LETTER A WITH INVERTED BREVE
		'ā': 'a', // LATIN SMALL LETTER A WITH MACRON
		'ą': 'a', // LATIN SMALL LETTER A WITH OGONEK
		'ᶏ': 'a', // LATIN SMALL LETTER A WITH RETROFLEX HOOK
		'ẚ': 'a', // LATIN SMALL LETTER A WITH RIGHT HALF RING
		'å': 'a', // LATIN SMALL LETTER A WITH RING ABOVE
		'ǻ': 'a', // LATIN SMALL LETTER A WITH RING ABOVE AND ACUTE
		'ḁ': 'a', // LATIN SMALL LETTER A WITH RING BELOW
		'ⱥ': 'a', // LATIN SMALL LETTER A WITH STROKE
		'ã': 'a', // LATIN SMALL LETTER A WITH TILDE
		'æ': 'ae', // LATIN SMALL LETTER AE
		'ǽ': 'ae', // LATIN SMALL LETTER AE WITH ACUTE
		'ǣ': 'ae', // LATIN SMALL LETTER AE WITH MACRON
		'ḃ': 'b', // LATIN SMALL LETTER B WITH DOT ABOVE
		'ḅ': 'b', // LATIN SMALL LETTER B WITH DOT BELOW
		'ɓ': 'b', // LATIN SMALL LETTER B WITH HOOK
		'ḇ': 'b', // LATIN SMALL LETTER B WITH LINE BELOW
		'ᵬ': 'b', // LATIN SMALL LETTER B WITH MIDDLE TILDE
		'ᶀ': 'b', // LATIN SMALL LETTER B WITH PALATAL HOOK
		'ƀ': 'b', // LATIN SMALL LETTER B WITH STROKE
		'ƃ': 'b', // LATIN SMALL LETTER B WITH TOPBAR
		'ɵ': 'o', // LATIN SMALL LETTER BARRED O
		'ć': 'c', // LATIN SMALL LETTER C WITH ACUTE
		'č': 'c', // LATIN SMALL LETTER C WITH CARON
		'ç': 'c', // LATIN SMALL LETTER C WITH CEDILLA
		'ḉ': 'c', // LATIN SMALL LETTER C WITH CEDILLA AND ACUTE
		'ĉ': 'c', // LATIN SMALL LETTER C WITH CIRCUMFLEX
		'ɕ': 'c', // LATIN SMALL LETTER C WITH CURL
		'ċ': 'c', // LATIN SMALL LETTER C WITH DOT ABOVE
		'ƈ': 'c', // LATIN SMALL LETTER C WITH HOOK
		'ȼ': 'c', // LATIN SMALL LETTER C WITH STROKE
		'ď': 'd', // LATIN SMALL LETTER D WITH CARON
		'ḑ': 'd', // LATIN SMALL LETTER D WITH CEDILLA
		'ḓ': 'd', // LATIN SMALL LETTER D WITH CIRCUMFLEX BELOW
		'ȡ': 'd', // LATIN SMALL LETTER D WITH CURL
		'ḋ': 'd', // LATIN SMALL LETTER D WITH DOT ABOVE
		'ḍ': 'd', // LATIN SMALL LETTER D WITH DOT BELOW
		'ɗ': 'd', // LATIN SMALL LETTER D WITH HOOK
		'ᶑ': 'd', // LATIN SMALL LETTER D WITH HOOK AND TAIL
		'ḏ': 'd', // LATIN SMALL LETTER D WITH LINE BELOW
		'ᵭ': 'd', // LATIN SMALL LETTER D WITH MIDDLE TILDE
		'ᶁ': 'd', // LATIN SMALL LETTER D WITH PALATAL HOOK
		'đ': 'd', // LATIN SMALL LETTER D WITH STROKE
		'ɖ': 'd', // LATIN SMALL LETTER D WITH TAIL
		'ƌ': 'd', // LATIN SMALL LETTER D WITH TOPBAR
		'ı': 'i', // LATIN SMALL LETTER DOTLESS I
		'ɟ': 'j', // LATIN SMALL LETTER DOTLESS J WITH STROKE
		'ʄ': 'j', // LATIN SMALL LETTER DOTLESS J WITH STROKE AND HOOK
		'ǳ': 'dz', // LATIN SMALL LETTER DZ
		'ǆ': 'dz', // LATIN SMALL LETTER DZ WITH CARON
		'é': 'e', // LATIN SMALL LETTER E WITH ACUTE
		'ĕ': 'e', // LATIN SMALL LETTER E WITH BREVE
		'ě': 'e', // LATIN SMALL LETTER E WITH CARON
		'ȩ': 'e', // LATIN SMALL LETTER E WITH CEDILLA
		'ḝ': 'e', // LATIN SMALL LETTER E WITH CEDILLA AND BREVE
		'ê': 'e', // LATIN SMALL LETTER E WITH CIRCUMFLEX
		'ế': 'e', // LATIN SMALL LETTER E WITH CIRCUMFLEX AND ACUTE
		'ệ': 'e', // LATIN SMALL LETTER E WITH CIRCUMFLEX AND DOT BELOW
		'ề': 'e', // LATIN SMALL LETTER E WITH CIRCUMFLEX AND GRAVE
		'ể': 'e', // LATIN SMALL LETTER E WITH CIRCUMFLEX AND HOOK ABOVE
		'ễ': 'e', // LATIN SMALL LETTER E WITH CIRCUMFLEX AND TILDE
		'ḙ': 'e', // LATIN SMALL LETTER E WITH CIRCUMFLEX BELOW
		'ë': 'e', // LATIN SMALL LETTER E WITH DIAERESIS
		'ė': 'e', // LATIN SMALL LETTER E WITH DOT ABOVE
		'ẹ': 'e', // LATIN SMALL LETTER E WITH DOT BELOW
		'ȅ': 'e', // LATIN SMALL LETTER E WITH DOUBLE GRAVE
		'è': 'e', // LATIN SMALL LETTER E WITH GRAVE
		'ẻ': 'e', // LATIN SMALL LETTER E WITH HOOK ABOVE
		'ȇ': 'e', // LATIN SMALL LETTER E WITH INVERTED BREVE
		'ē': 'e', // LATIN SMALL LETTER E WITH MACRON
		'ḗ': 'e', // LATIN SMALL LETTER E WITH MACRON AND ACUTE
		'ḕ': 'e', // LATIN SMALL LETTER E WITH MACRON AND GRAVE
		'ę': 'e', // LATIN SMALL LETTER E WITH OGONEK
		'ᶒ': 'e', // LATIN SMALL LETTER E WITH RETROFLEX HOOK
		'ɇ': 'e', // LATIN SMALL LETTER E WITH STROKE
		'ẽ': 'e', // LATIN SMALL LETTER E WITH TILDE
		'ḛ': 'e', // LATIN SMALL LETTER E WITH TILDE BELOW
		'ḟ': 'f', // LATIN SMALL LETTER F WITH DOT ABOVE
		'ƒ': 'f', // LATIN SMALL LETTER F WITH HOOK
		'ᵮ': 'f', // LATIN SMALL LETTER F WITH MIDDLE TILDE
		'ᶂ': 'f', // LATIN SMALL LETTER F WITH PALATAL HOOK
		'ǵ': 'g', // LATIN SMALL LETTER G WITH ACUTE
		'ğ': 'g', // LATIN SMALL LETTER G WITH BREVE
		'ǧ': 'g', // LATIN SMALL LETTER G WITH CARON
		'ģ': 'g', // LATIN SMALL LETTER G WITH CEDILLA
		'ĝ': 'g', // LATIN SMALL LETTER G WITH CIRCUMFLEX
		'ġ': 'g', // LATIN SMALL LETTER G WITH DOT ABOVE
		'ɠ': 'g', // LATIN SMALL LETTER G WITH HOOK
		'ḡ': 'g', // LATIN SMALL LETTER G WITH MACRON
		'ᶃ': 'g', // LATIN SMALL LETTER G WITH PALATAL HOOK
		'ǥ': 'g', // LATIN SMALL LETTER G WITH STROKE
		'ḫ': 'h', // LATIN SMALL LETTER H WITH BREVE BELOW
		'ȟ': 'h', // LATIN SMALL LETTER H WITH CARON
		'ḩ': 'h', // LATIN SMALL LETTER H WITH CEDILLA
		'ĥ': 'h', // LATIN SMALL LETTER H WITH CIRCUMFLEX
		'ⱨ': 'h', // LATIN SMALL LETTER H WITH DESCENDER
		'ḧ': 'h', // LATIN SMALL LETTER H WITH DIAERESIS
		'ḣ': 'h', // LATIN SMALL LETTER H WITH DOT ABOVE
		'ḥ': 'h', // LATIN SMALL LETTER H WITH DOT BELOW
		'ɦ': 'h', // LATIN SMALL LETTER H WITH HOOK
		'ħ': 'h', // LATIN SMALL LETTER H WITH STROKE
		'ƕ': 'hv', // LATIN SMALL LETTER HV
		'í': 'i', // LATIN SMALL LETTER I WITH ACUTE
		'ĭ': 'i', // LATIN SMALL LETTER I WITH BREVE
		'ǐ': 'i', // LATIN SMALL LETTER I WITH CARON
		'î': 'i', // LATIN SMALL LETTER I WITH CIRCUMFLEX
		'ï': 'i', // LATIN SMALL LETTER I WITH DIAERESIS
		'ḯ': 'i', // LATIN SMALL LETTER I WITH DIAERESIS AND ACUTE
		'ị': 'i', // LATIN SMALL LETTER I WITH DOT BELOW
		'ȉ': 'i', // LATIN SMALL LETTER I WITH DOUBLE GRAVE
		'ì': 'i', // LATIN SMALL LETTER I WITH GRAVE
		'ỉ': 'i', // LATIN SMALL LETTER I WITH HOOK ABOVE
		'ȋ': 'i', // LATIN SMALL LETTER I WITH INVERTED BREVE
		'ī': 'i', // LATIN SMALL LETTER I WITH MACRON
		'į': 'i', // LATIN SMALL LETTER I WITH OGONEK
		'ᶖ': 'i', // LATIN SMALL LETTER I WITH RETROFLEX HOOK
		'ɨ': 'i', // LATIN SMALL LETTER I WITH STROKE
		'ĩ': 'i', // LATIN SMALL LETTER I WITH TILDE
		'ḭ': 'i', // LATIN SMALL LETTER I WITH TILDE BELOW
		'ᵹ': 'g', // LATIN SMALL LETTER INSULAR G
		'ǰ': 'j', // LATIN SMALL LETTER J WITH CARON
		'ĵ': 'j', // LATIN SMALL LETTER J WITH CIRCUMFLEX
		'ʝ': 'j', // LATIN SMALL LETTER J WITH CROSSED-TAIL
		'ɉ': 'j', // LATIN SMALL LETTER J WITH STROKE
		'ḱ': 'k', // LATIN SMALL LETTER K WITH ACUTE
		'ǩ': 'k', // LATIN SMALL LETTER K WITH CARON
		'ķ': 'k', // LATIN SMALL LETTER K WITH CEDILLA
		'ⱪ': 'k', // LATIN SMALL LETTER K WITH DESCENDER
		'ḳ': 'k', // LATIN SMALL LETTER K WITH DOT BELOW
		'ƙ': 'k', // LATIN SMALL LETTER K WITH HOOK
		'ḵ': 'k', // LATIN SMALL LETTER K WITH LINE BELOW
		'ᶄ': 'k', // LATIN SMALL LETTER K WITH PALATAL HOOK
		'ĺ': 'l', // LATIN SMALL LETTER L WITH ACUTE
		'ƚ': 'l', // LATIN SMALL LETTER L WITH BAR
		'ɬ': 'l', // LATIN SMALL LETTER L WITH BELT
		'ľ': 'l', // LATIN SMALL LETTER L WITH CARON
		'ļ': 'l', // LATIN SMALL LETTER L WITH CEDILLA
		'ḽ': 'l', // LATIN SMALL LETTER L WITH CIRCUMFLEX BELOW
		'ȴ': 'l', // LATIN SMALL LETTER L WITH CURL
		'ḷ': 'l', // LATIN SMALL LETTER L WITH DOT BELOW
		'ḹ': 'l', // LATIN SMALL LETTER L WITH DOT BELOW AND MACRON
		'ⱡ': 'l', // LATIN SMALL LETTER L WITH DOUBLE BAR
		'ḻ': 'l', // LATIN SMALL LETTER L WITH LINE BELOW
		'ŀ': 'l', // LATIN SMALL LETTER L WITH MIDDLE DOT
		'ɫ': 'l', // LATIN SMALL LETTER L WITH MIDDLE TILDE
		'ᶅ': 'l', // LATIN SMALL LETTER L WITH PALATAL HOOK
		'ɭ': 'l', // LATIN SMALL LETTER L WITH RETROFLEX HOOK
		'ł': 'l', // LATIN SMALL LETTER L WITH STROKE
		'ǉ': 'lj', // LATIN SMALL LETTER LJ
		'ſ': 's', // LATIN SMALL LETTER LONG S
		'ẛ': 's', // LATIN SMALL LETTER LONG S WITH DOT ABOVE
		'ḿ': 'm', // LATIN SMALL LETTER M WITH ACUTE
		'ṁ': 'm', // LATIN SMALL LETTER M WITH DOT ABOVE
		'ṃ': 'm', // LATIN SMALL LETTER M WITH DOT BELOW
		'ɱ': 'm', // LATIN SMALL LETTER M WITH HOOK
		'ᵯ': 'm', // LATIN SMALL LETTER M WITH MIDDLE TILDE
		'ᶆ': 'm', // LATIN SMALL LETTER M WITH PALATAL HOOK
		'ń': 'n', // LATIN SMALL LETTER N WITH ACUTE
		'ň': 'n', // LATIN SMALL LETTER N WITH CARON
		'ņ': 'n', // LATIN SMALL LETTER N WITH CEDILLA
		'ṋ': 'n', // LATIN SMALL LETTER N WITH CIRCUMFLEX BELOW
		'ȵ': 'n', // LATIN SMALL LETTER N WITH CURL
		'ṅ': 'n', // LATIN SMALL LETTER N WITH DOT ABOVE
		'ṇ': 'n', // LATIN SMALL LETTER N WITH DOT BELOW
		'ǹ': 'n', // LATIN SMALL LETTER N WITH GRAVE
		'ɲ': 'n', // LATIN SMALL LETTER N WITH LEFT HOOK
		'ṉ': 'n', // LATIN SMALL LETTER N WITH LINE BELOW
		'ƞ': 'n', // LATIN SMALL LETTER N WITH LONG RIGHT LEG
		'ᵰ': 'n', // LATIN SMALL LETTER N WITH MIDDLE TILDE
		'ᶇ': 'n', // LATIN SMALL LETTER N WITH PALATAL HOOK
		'ɳ': 'n', // LATIN SMALL LETTER N WITH RETROFLEX HOOK
		'ñ': 'n', // LATIN SMALL LETTER N WITH TILDE
		'ǌ': 'nj', // LATIN SMALL LETTER NJ
		'ó': 'o', // LATIN SMALL LETTER O WITH ACUTE
		'ŏ': 'o', // LATIN SMALL LETTER O WITH BREVE
		'ǒ': 'o', // LATIN SMALL LETTER O WITH CARON
		'ô': 'o', // LATIN SMALL LETTER O WITH CIRCUMFLEX
		'ố': 'o', // LATIN SMALL LETTER O WITH CIRCUMFLEX AND ACUTE
		'ộ': 'o', // LATIN SMALL LETTER O WITH CIRCUMFLEX AND DOT BELOW
		'ồ': 'o', // LATIN SMALL LETTER O WITH CIRCUMFLEX AND GRAVE
		'ổ': 'o', // LATIN SMALL LETTER O WITH CIRCUMFLEX AND HOOK ABOVE
		'ỗ': 'o', // LATIN SMALL LETTER O WITH CIRCUMFLEX AND TILDE
		'ö': 'o', // LATIN SMALL LETTER O WITH DIAERESIS
		'ȫ': 'o', // LATIN SMALL LETTER O WITH DIAERESIS AND MACRON
		'ȯ': 'o', // LATIN SMALL LETTER O WITH DOT ABOVE
		'ȱ': 'o', // LATIN SMALL LETTER O WITH DOT ABOVE AND MACRON
		'ọ': 'o', // LATIN SMALL LETTER O WITH DOT BELOW
		'ő': 'o', // LATIN SMALL LETTER O WITH DOUBLE ACUTE
		'ȍ': 'o', // LATIN SMALL LETTER O WITH DOUBLE GRAVE
		'ò': 'o', // LATIN SMALL LETTER O WITH GRAVE
		'ỏ': 'o', // LATIN SMALL LETTER O WITH HOOK ABOVE
		'ơ': 'o', // LATIN SMALL LETTER O WITH HORN
		'ớ': 'o', // LATIN SMALL LETTER O WITH HORN AND ACUTE
		'ợ': 'o', // LATIN SMALL LETTER O WITH HORN AND DOT BELOW
		'ờ': 'o', // LATIN SMALL LETTER O WITH HORN AND GRAVE
		'ở': 'o', // LATIN SMALL LETTER O WITH HORN AND HOOK ABOVE
		'ỡ': 'o', // LATIN SMALL LETTER O WITH HORN AND TILDE
		'ȏ': 'o', // LATIN SMALL LETTER O WITH INVERTED BREVE
		'ō': 'o', // LATIN SMALL LETTER O WITH MACRON
		'ṓ': 'o', // LATIN SMALL LETTER O WITH MACRON AND ACUTE
		'ṑ': 'o', // LATIN SMALL LETTER O WITH MACRON AND GRAVE
		'ǫ': 'o', // LATIN SMALL LETTER O WITH OGONEK
		'ǭ': 'o', // LATIN SMALL LETTER O WITH OGONEK AND MACRON
		'ø': 'o', // LATIN SMALL LETTER O WITH STROKE
		'ǿ': 'o', // LATIN SMALL LETTER O WITH STROKE AND ACUTE
		'õ': 'o', // LATIN SMALL LETTER O WITH TILDE
		'ṍ': 'o', // LATIN SMALL LETTER O WITH TILDE AND ACUTE
		'ṏ': 'o', // LATIN SMALL LETTER O WITH TILDE AND DIAERESIS
		'ȭ': 'o', // LATIN SMALL LETTER O WITH TILDE AND MACRON
		'ƣ': 'oi', // LATIN SMALL LETTER OI
		'ɛ': 'e', // LATIN SMALL LETTER OPEN E
		'ᶓ': 'e', // LATIN SMALL LETTER OPEN E WITH RETROFLEX HOOK
		'ɔ': 'o', // LATIN SMALL LETTER OPEN O
		'ᶗ': 'o', // LATIN SMALL LETTER OPEN O WITH RETROFLEX HOOK
		'ȣ': 'ou', // LATIN SMALL LETTER OU
		'ṕ': 'p', // LATIN SMALL LETTER P WITH ACUTE
		'ṗ': 'p', // LATIN SMALL LETTER P WITH DOT ABOVE
		'ƥ': 'p', // LATIN SMALL LETTER P WITH HOOK
		'ᵱ': 'p', // LATIN SMALL LETTER P WITH MIDDLE TILDE
		'ᶈ': 'p', // LATIN SMALL LETTER P WITH PALATAL HOOK
		'ᵽ': 'p', // LATIN SMALL LETTER P WITH STROKE
		'ʠ': 'q', // LATIN SMALL LETTER Q WITH HOOK
		'ɋ': 'q', // LATIN SMALL LETTER Q WITH HOOK TAIL
		'ŕ': 'r', // LATIN SMALL LETTER R WITH ACUTE
		'ř': 'r', // LATIN SMALL LETTER R WITH CARON
		'ŗ': 'r', // LATIN SMALL LETTER R WITH CEDILLA
		'ṙ': 'r', // LATIN SMALL LETTER R WITH DOT ABOVE
		'ṛ': 'r', // LATIN SMALL LETTER R WITH DOT BELOW
		'ṝ': 'r', // LATIN SMALL LETTER R WITH DOT BELOW AND MACRON
		'ȑ': 'r', // LATIN SMALL LETTER R WITH DOUBLE GRAVE
		'ɾ': 'r', // LATIN SMALL LETTER R WITH FISHHOOK
		'ᵳ': 'r', // LATIN SMALL LETTER R WITH FISHHOOK AND MIDDLE TILDE
		'ȓ': 'r', // LATIN SMALL LETTER R WITH INVERTED BREVE
		'ṟ': 'r', // LATIN SMALL LETTER R WITH LINE BELOW
		'ɼ': 'r', // LATIN SMALL LETTER R WITH LONG LEG
		'ᵲ': 'r', // LATIN SMALL LETTER R WITH MIDDLE TILDE
		'ᶉ': 'r', // LATIN SMALL LETTER R WITH PALATAL HOOK
		'ɍ': 'r', // LATIN SMALL LETTER R WITH STROKE
		'ɽ': 'r', // LATIN SMALL LETTER R WITH TAIL
		'ↄ': 'c', // LATIN SMALL LETTER REVERSED C
		'ɘ': 'e', // LATIN SMALL LETTER REVERSED E
		'ɿ': 'r', // LATIN SMALL LETTER REVERSED R WITH FISHHOOK
		'ś': 's', // LATIN SMALL LETTER S WITH ACUTE
		'ṥ': 's', // LATIN SMALL LETTER S WITH ACUTE AND DOT ABOVE
		'š': 's', // LATIN SMALL LETTER S WITH CARON
		'ṧ': 's', // LATIN SMALL LETTER S WITH CARON AND DOT ABOVE
		'ş': 's', // LATIN SMALL LETTER S WITH CEDILLA
		'ŝ': 's', // LATIN SMALL LETTER S WITH CIRCUMFLEX
		'ș': 's', // LATIN SMALL LETTER S WITH COMMA BELOW
		'ṡ': 's', // LATIN SMALL LETTER S WITH DOT ABOVE
		'ṣ': 's', // LATIN SMALL LETTER S WITH DOT BELOW
		'ṩ': 's', // LATIN SMALL LETTER S WITH DOT BELOW AND DOT ABOVE
		'ʂ': 's', // LATIN SMALL LETTER S WITH HOOK
		'ᵴ': 's', // LATIN SMALL LETTER S WITH MIDDLE TILDE
		'ᶊ': 's', // LATIN SMALL LETTER S WITH PALATAL HOOK
		'ȿ': 's', // LATIN SMALL LETTER S WITH SWASH TAIL
		'ɡ': 'g', // LATIN SMALL LETTER SCRIPT G
		'ß': 'ss', // LATIN SMALL LETTER SHARP S
		'ᴑ': 'o', // LATIN SMALL LETTER SIDEWAYS O
		'ᴓ': 'o', // LATIN SMALL LETTER SIDEWAYS O WITH STROKE
		'ᴝ': 'u', // LATIN SMALL LETTER SIDEWAYS U
		'ť': 't', // LATIN SMALL LETTER T WITH CARON
		'ţ': 't', // LATIN SMALL LETTER T WITH CEDILLA
		'ṱ': 't', // LATIN SMALL LETTER T WITH CIRCUMFLEX BELOW
		'ț': 't', // LATIN SMALL LETTER T WITH COMMA BELOW
		'ȶ': 't', // LATIN SMALL LETTER T WITH CURL
		'ẗ': 't', // LATIN SMALL LETTER T WITH DIAERESIS
		'ⱦ': 't', // LATIN SMALL LETTER T WITH DIAGONAL STROKE
		'ṫ': 't', // LATIN SMALL LETTER T WITH DOT ABOVE
		'ṭ': 't', // LATIN SMALL LETTER T WITH DOT BELOW
		'ƭ': 't', // LATIN SMALL LETTER T WITH HOOK
		'ṯ': 't', // LATIN SMALL LETTER T WITH LINE BELOW
		'ᵵ': 't', // LATIN SMALL LETTER T WITH MIDDLE TILDE
		'ƫ': 't', // LATIN SMALL LETTER T WITH PALATAL HOOK
		'ʈ': 't', // LATIN SMALL LETTER T WITH RETROFLEX HOOK
		'ŧ': 't', // LATIN SMALL LETTER T WITH STROKE
		'ᵺ': 'th', // LATIN SMALL LETTER TH WITH STRIKETHROUGH
		'ɐ': 'a', // LATIN SMALL LETTER TURNED A
		'ᴂ': 'ae', // LATIN SMALL LETTER TURNED AE
		'ǝ': 'e', // LATIN SMALL LETTER TURNED E
		'ᵷ': 'g', // LATIN SMALL LETTER TURNED G
		'ɥ': 'h', // LATIN SMALL LETTER TURNED H
		'ʮ': 'h', // LATIN SMALL LETTER TURNED H WITH FISHHOOK
		'ʯ': 'h', // LATIN SMALL LETTER TURNED H WITH FISHHOOK AND TAIL
		'ᴉ': 'i', // LATIN SMALL LETTER TURNED I
		'ʞ': 'k', // LATIN SMALL LETTER TURNED K
		'ɯ': 'm', // LATIN SMALL LETTER TURNED M
		'ɰ': 'm', // LATIN SMALL LETTER TURNED M WITH LONG LEG
		'ᴔ': 'oe', // LATIN SMALL LETTER TURNED OE
		'ɹ': 'r', // LATIN SMALL LETTER TURNED R
		'ɻ': 'r', // LATIN SMALL LETTER TURNED R WITH HOOK
		'ɺ': 'r', // LATIN SMALL LETTER TURNED R WITH LONG LEG
		'ʇ': 't', // LATIN SMALL LETTER TURNED T
		'ʌ': 'v', // LATIN SMALL LETTER TURNED V
		'ʍ': 'w', // LATIN SMALL LETTER TURNED W
		'ʎ': 'y', // LATIN SMALL LETTER TURNED Y
		'ú': 'u', // LATIN SMALL LETTER U WITH ACUTE
		'ŭ': 'u', // LATIN SMALL LETTER U WITH BREVE
		'ǔ': 'u', // LATIN SMALL LETTER U WITH CARON
		'û': 'u', // LATIN SMALL LETTER U WITH CIRCUMFLEX
		'ṷ': 'u', // LATIN SMALL LETTER U WITH CIRCUMFLEX BELOW
		'ü': 'u', // LATIN SMALL LETTER U WITH DIAERESIS
		'ǘ': 'u', // LATIN SMALL LETTER U WITH DIAERESIS AND ACUTE
		'ǚ': 'u', // LATIN SMALL LETTER U WITH DIAERESIS AND CARON
		'ǜ': 'u', // LATIN SMALL LETTER U WITH DIAERESIS AND GRAVE
		'ǖ': 'u', // LATIN SMALL LETTER U WITH DIAERESIS AND MACRON
		'ṳ': 'u', // LATIN SMALL LETTER U WITH DIAERESIS BELOW
		'ụ': 'u', // LATIN SMALL LETTER U WITH DOT BELOW
		'ű': 'u', // LATIN SMALL LETTER U WITH DOUBLE ACUTE
		'ȕ': 'u', // LATIN SMALL LETTER U WITH DOUBLE GRAVE
		'ù': 'u', // LATIN SMALL LETTER U WITH GRAVE
		'ủ': 'u', // LATIN SMALL LETTER U WITH HOOK ABOVE
		'ư': 'u', // LATIN SMALL LETTER U WITH HORN
		'ứ': 'u', // LATIN SMALL LETTER U WITH HORN AND ACUTE
		'ự': 'u', // LATIN SMALL LETTER U WITH HORN AND DOT BELOW
		'ừ': 'u', // LATIN SMALL LETTER U WITH HORN AND GRAVE
		'ử': 'u', // LATIN SMALL LETTER U WITH HORN AND HOOK ABOVE
		'ữ': 'u', // LATIN SMALL LETTER U WITH HORN AND TILDE
		'ȗ': 'u', // LATIN SMALL LETTER U WITH INVERTED BREVE
		'ū': 'u', // LATIN SMALL LETTER U WITH MACRON
		'ṻ': 'u', // LATIN SMALL LETTER U WITH MACRON AND DIAERESIS
		'ų': 'u', // LATIN SMALL LETTER U WITH OGONEK
		'ᶙ': 'u', // LATIN SMALL LETTER U WITH RETROFLEX HOOK
		'ů': 'u', // LATIN SMALL LETTER U WITH RING ABOVE
		'ũ': 'u', // LATIN SMALL LETTER U WITH TILDE
		'ṹ': 'u', // LATIN SMALL LETTER U WITH TILDE AND ACUTE
		'ṵ': 'u', // LATIN SMALL LETTER U WITH TILDE BELOW
		'ᵫ': 'ue', // LATIN SMALL LETTER UE
		'ⱴ': 'v', // LATIN SMALL LETTER V WITH CURL
		'ṿ': 'v', // LATIN SMALL LETTER V WITH DOT BELOW
		'ʋ': 'v', // LATIN SMALL LETTER V WITH HOOK
		'ᶌ': 'v', // LATIN SMALL LETTER V WITH PALATAL HOOK
		'ⱱ': 'v', // LATIN SMALL LETTER V WITH RIGHT HOOK
		'ṽ': 'v', // LATIN SMALL LETTER V WITH TILDE
		'ẃ': 'w', // LATIN SMALL LETTER W WITH ACUTE
		'ŵ': 'w', // LATIN SMALL LETTER W WITH CIRCUMFLEX
		'ẅ': 'w', // LATIN SMALL LETTER W WITH DIAERESIS
		'ẇ': 'w', // LATIN SMALL LETTER W WITH DOT ABOVE
		'ẉ': 'w', // LATIN SMALL LETTER W WITH DOT BELOW
		'ẁ': 'w', // LATIN SMALL LETTER W WITH GRAVE
		'ⱳ': 'w', // LATIN SMALL LETTER W WITH HOOK
		'ẘ': 'w', // LATIN SMALL LETTER W WITH RING ABOVE
		'ẍ': 'x', // LATIN SMALL LETTER X WITH DIAERESIS
		'ẋ': 'x', // LATIN SMALL LETTER X WITH DOT ABOVE
		'ᶍ': 'x', // LATIN SMALL LETTER X WITH PALATAL HOOK
		'ý': 'y', // LATIN SMALL LETTER Y WITH ACUTE
		'ŷ': 'y', // LATIN SMALL LETTER Y WITH CIRCUMFLEX
		'ÿ': 'y', // LATIN SMALL LETTER Y WITH DIAERESIS
		'ẏ': 'y', // LATIN SMALL LETTER Y WITH DOT ABOVE
		'ỵ': 'y', // LATIN SMALL LETTER Y WITH DOT BELOW
		'ỳ': 'y', // LATIN SMALL LETTER Y WITH GRAVE
		'ƴ': 'y', // LATIN SMALL LETTER Y WITH HOOK
		'ỷ': 'y', // LATIN SMALL LETTER Y WITH HOOK ABOVE
		'ȳ': 'y', // LATIN SMALL LETTER Y WITH MACRON
		'ẙ': 'y', // LATIN SMALL LETTER Y WITH RING ABOVE
		'ɏ': 'y', // LATIN SMALL LETTER Y WITH STROKE
		'ỹ': 'y', // LATIN SMALL LETTER Y WITH TILDE
		'ź': 'z', // LATIN SMALL LETTER Z WITH ACUTE
		'ž': 'z', // LATIN SMALL LETTER Z WITH CARON
		'ẑ': 'z', // LATIN SMALL LETTER Z WITH CIRCUMFLEX
		'ʑ': 'z', // LATIN SMALL LETTER Z WITH CURL
		'ⱬ': 'z', // LATIN SMALL LETTER Z WITH DESCENDER
		'ż': 'z', // LATIN SMALL LETTER Z WITH DOT ABOVE
		'ẓ': 'z', // LATIN SMALL LETTER Z WITH DOT BELOW
		'ȥ': 'z', // LATIN SMALL LETTER Z WITH HOOK
		'ẕ': 'z', // LATIN SMALL LETTER Z WITH LINE BELOW
		'ᵶ': 'z', // LATIN SMALL LETTER Z WITH MIDDLE TILDE
		'ᶎ': 'z', // LATIN SMALL LETTER Z WITH PALATAL HOOK
		'ʐ': 'z', // LATIN SMALL LETTER Z WITH RETROFLEX HOOK
		'ƶ': 'z', // LATIN SMALL LETTER Z WITH STROKE
		'ɀ': 'z', // LATIN SMALL LETTER Z WITH SWASH TAIL
		'ﬁ': 'fi', // LATIN SMALL LIGATURE FI
		'ﬂ': 'fl', // LATIN SMALL LIGATURE FL
		'ĳ': 'ij', // LATIN SMALL LIGATURE IJ
		'œ': 'oe', // LATIN SMALL LIGATURE OE
		'ₐ': 'a', // LATIN SUBSCRIPT SMALL LETTER A
		'ₑ': 'e', // LATIN SUBSCRIPT SMALL LETTER E
		'ᵢ': 'i', // LATIN SUBSCRIPT SMALL LETTER I
		'ₒ': 'o', // LATIN SUBSCRIPT SMALL LETTER O
		'ᵣ': 'r', // LATIN SUBSCRIPT SMALL LETTER R
		'ᵤ': 'u', // LATIN SUBSCRIPT SMALL LETTER U
		'ᵥ': 'v', // LATIN SUBSCRIPT SMALL LETTER V
		'ₓ': 'x' // LATIN SUBSCRIPT SMALL LETTER X
};

_2663.TextConversionUtil = function () {
	
	function convertTextToLatinCharSet(text) {
		return text.replace(/[^A-Za-z0-9]/g, function(x) { return _2663.LATIN_MAP[x] || x; });
	};
	
	function convertTextToCustomCharSet(text, charset) {
		
		if (!charset || charset.length == 0) {
			charset = _2663.LATIN_MAP;
		}
		
		return text.replace(/[^A-Za-z0-9]/g, function(x) { return charset[x] || x; });
	};
	
	this.ConvertTextToLatinCharSet = convertTextToLatinCharSet;
	this.ConvertTextToCustomCharSet = convertTextToCustomCharSet;
};