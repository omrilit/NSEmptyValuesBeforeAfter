/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.MOSS = VAT.MOSS || {};


VAT.MOSS.TaxPropertiesFile = function TaxPropertiesFile() {

	return {
		"AT": {
			"TaxType": {
				"MOSS AT": {
					name: "MOSS AT",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales AT": {
					name: "MOSS VAT on Sales AT",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-AT": {
					itemid: "S-AT",
					rate: "20",
					mosscountry: "AT",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-AT": {
					itemid: "R-AT",
					rate: "10",
					mosscountry: "AT",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"R2-AT": {
					itemid: "R2-AT",
					rate: "13",
					mosscountry: "AT",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"BE": {
			"TaxType": {
				"MOSS BE": {
					name: "MOSS BE",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales BE": {
					name: "MOSS VAT on Sales BE",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-BE": {
					itemid: "S-BE",
					rate: "21",
					mosscountry: "BE",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-BE": {
					itemid: "R-BE",
					rate: "12",
					mosscountry: "BE",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-BE": {
					itemid: "SR-BE",
					rate: "6",
					mosscountry: "BE",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"BG": {
			"TaxType": {
				"MOSS BG": {
					name: "MOSS BG",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales BG": {
					name: "MOSS VAT on Sales BG",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-BG": {
					itemid: "S-BG",
					rate: "20",
					mosscountry: "BG",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-BG": {
					itemid: "R-BG",
					rate: "9",
					mosscountry: "BG",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				}
			}
		},

		"HR": {
			"TaxType": {
				"MOSS HR": {
					name: "MOSS HR",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales HR": {
					name: "MOSS VAT on Sales HR",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-HR": {
					itemid: "S-HR",
					rate: "25",
					mosscountry: "HR",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-HR": {
					itemid: "R-HR",
					rate: "13",
					mosscountry: "HR",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-HR": {
					itemid: "SR-HR",
					rate: "5",
					mosscountry: "HR",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"CY": {
			"TaxType": {
				"MOSS CY": {
					name: "MOSS CY",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales CY": {
					name: "MOSS VAT on Sales CY",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-CY": {
					itemid: "S-CY",
					rate: "19",
					mosscountry: "CY",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-CY": {
					itemid: "R-CY",
					rate: "5",
					mosscountry: "CY",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-CY": {
					itemid: "SR-CY",
					rate: "9",
					mosscountry: "CY",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"CZ": {
			"TaxType": {
				"MOSS CZ": {
					name: "MOSS CZ",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales CZ": {
					name: "MOSS VAT on Sales CZ",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-CZ": {
					itemid: "S-CZ",
					rate: "21",
					mosscountry: "CZ",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-CZ": {
					itemid: "R-CZ",
					rate: "15",
					mosscountry: "CZ",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-CZ": {
					itemid: "SR-CZ",
					rate: "10",
					mosscountry: "CZ",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"DK": {
			"TaxType": {
				"MOSS DK": {
					name: "MOSS DK",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales DK": {
					name: "MOSS VAT on Sales DK",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-DK": {
					itemid: "S-DK",
					rate: "25",
					mosscountry: "DK",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				}
			}
		},
		"EE": {
			"TaxType": {
				"MOSS EE": {
					name: "MOSS EE",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales EE": {
					name: "MOSS VAT on Sales EE",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-EE": {
					itemid: "S-EE",
					rate: "20",
					mosscountry: "EE",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-EE": {
					itemid: "R-EE",
					rate: "9",
					mosscountry: "EE",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				}
			}
		},

		"FI": {
			"TaxType": {
				"MOSS FI": {
					name: "MOSS FI",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales FI": {
					name: "MOSS VAT on Sales FI",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-FI": {
					itemid: "S-FI",
					rate: "24",
					mosscountry: "FI",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R1-FI": {
					itemid: "R1-FI",
					rate: "14",
					mosscountry: "FI",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"R2-FI": {
					itemid: "R2-FI",
					rate: "10",
					mosscountry: "FI",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"FR": {
			"TaxType": {
				"MOSS FR": {
					name: "MOSS FR",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales FR": {
					name: "MOSS VAT on Sales FR",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-FR": {
					itemid: "S-FR",
					rate: "20",
					mosscountry: "FR",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-FR": {
					itemid: "R-FR",
					rate: "5.5",
					mosscountry: "FR",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-FR": {
					itemid: "SR-FR",
					rate: "10",
					mosscountry: "FR",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"DE": {
			"TaxType": {
				"MOSS DE": {
					name: "MOSS DE",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales DE": {
					name: "MOSS VAT on Sales DE",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-DE": {
					itemid: "S-DE",
					rate: "19",
					mosscountry: "DE",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-DE": {
					itemid: "R-DE",
					rate: "7",
					mosscountry: "DE",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				}
			}
		},

		"GR": {
			"TaxType": {
				"MOSS EL": {
					name: "MOSS EL",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales EL": {
					name: "MOSS VAT on Sales EL",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-EL": {
					itemid: "S-EL",
					rate: "23",
					mosscountry: "GR",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-EL": {
					itemid: "R-EL",
					rate: "13",
					mosscountry: "GR",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-EL": {
					itemid: "SR-EL",
					rate: "6.5",
					mosscountry: "GR",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"HU": {
			"TaxType": {
				"MOSS HU": {
					name: "MOSS HU",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales HU": {
					name: "MOSS VAT on Sales HU",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-HU": {
					itemid: "S-HU",
					rate: "27",
					mosscountry: "HU",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-HU": {
					itemid: "R-HU",
					rate: "18",
					mosscountry: "HU",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-HU": {
					itemid: "SR-HU",
					rate: "5",
					mosscountry: "HU",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"IE": {
			"TaxType": {
				"MOSS IE": {
					name: "MOSS IE",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales IE": {
					name: "MOSS VAT on Sales IE",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-IE": {
					itemid: "S-IE",
					rate: "23",
					mosscountry: "IE",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-IE": {
					itemid: "R-IE",
					rate: "13.5",
					mosscountry: "IE",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-IE": {
					itemid: "SR-IE",
					rate: "9",
					mosscountry: "IE",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"IT": {
			"TaxType": {
				"MOSS IT": {
					name: "MOSS IT",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales IT": {
					name: "MOSS VAT on Sales IT",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-IT": {
					itemid: "S-IT",
					rate: "22",
					mosscountry: "IT",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R1-IT": {
					itemid: "R1-IT",
					rate: "10",
					mosscountry: "IT",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"R2-IT": {
					itemid: "R2-IT",
					rate: "4",
					mosscountry: "IT",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"LV": {
			"TaxType": {
				"MOSS LV": {
					name: "MOSS LV",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales LV": {
					name: "MOSS VAT on Sales LV",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-LV": {
					itemid: "S-LV",
					rate: "21",
					mosscountry: "LV",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-LV": {
					itemid: "R-LV",
					rate: "12",
					mosscountry: "LV",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				}
			}
		},

		"LT": {
			"TaxType": {
				"MOSS LT": {
					name: "MOSS LT",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales LT": {
					name: "MOSS VAT on Sales LT",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-LT": {
					itemid: "S-LT",
					rate: "21",
					mosscountry: "LT",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-LT": {
					itemid: "R-LT",
					rate: "9",
					mosscountry: "LT",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-LT": {
					itemid: "SR-LT",
					rate: "5",
					mosscountry: "LT",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"LU": {
			"TaxType": {
				"MOSS LU": {
					name: "MOSS LU",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales LU": {
					name: "MOSS VAT on Sales LU",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-LU": {
					itemid: "S-LU",
					rate: "17",
					mosscountry: "LU",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-LU": {
					itemid: "R-LU",
					rate: "8",
					mosscountry: "LU",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"INT-LU": {
					itemid: "INT-LU",
					rate: "14",
					mosscountry: "LU",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"MT": {
			"TaxType": {
				"MOSS MT": {
					name: "MOSS MT",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales MT": {
					name: "MOSS VAT on Sales MT",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-MT": {
					itemid: "S-MT",
					rate: "18",
					mosscountry: "MT",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-MT": {
					itemid: "R-MT",
					rate: "7",
					mosscountry: "MT",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-MT": {
					itemid: "SR-MT",
					rate: "5",
					mosscountry: "MT",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"NL": {
			"TaxType": {
				"MOSS NL": {
					name: "MOSS NL",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales NL": {
					name: "MOSS VAT on Sales NL",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-NL": {
					itemid: "S-NL",
					rate: "21",
					mosscountry: "NL",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-NL": {
					itemid: "R-NL",
					rate: "9",
					mosscountry: "NL",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				}
			}
		},

		"PL": {
			"TaxType": {
				"MOSS PL": {
					name: "MOSS PL",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales PL": {
					name: "MOSS VAT on Sales PL",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-PL": {
					itemid: "S-PL",
					rate: "23",
					mosscountry: "PL",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-PL": {
					itemid: "R-PL",
					rate: "8",
					mosscountry: "PL",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"R1-PL": {
					itemid: "R1-PL",
					rate: "5",
					mosscountry: "PL",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"PT": {
			"TaxType": {
				"MOSS PT": {
					name: "MOSS PT",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales PT": {
					name: "MOSS VAT on Sales PT",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-PT": {
					itemid: "S-PT",
					rate: "23",
					mosscountry: "PT",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-PT": {
					itemid: "R-PT",
					rate: "6",
					mosscountry: "PT",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"R2-PT": {
					itemid: "R2-PT",
					rate: "13",
					mosscountry: "PT",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"RO": {
			"TaxType": {
				"MOSS RO": {
					name: "MOSS RO",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales RO": {
					name: "MOSS VAT on Sales RO",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-RO": {
					itemid: "S-RO",
					rate: "20",
					mosscountry: "RO",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R1-RO": {
					itemid: "R1-RO",
					rate: "9",
					mosscountry: "RO",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"R2-RO": {
					itemid: "R2-RO",
					rate: "5",
					mosscountry: "RO",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"SK": {
			"TaxType": {
				"MOSS SK": {
					name: "MOSS SK",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales SK": {
					name: "MOSS VAT on Sales SK",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-SK": {
					itemid: "S-SK",
					rate: "20",
					mosscountry: "SK",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-SK": {
					itemid: "R-SK",
					rate: "10",
					mosscountry: "SK",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				}
			}
		},

		"SI": {
			"TaxType": {
				"MOSS SI": {
					name: "MOSS SI",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales SI": {
					name: "MOSS VAT on Sales SI",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-SI": {
					itemid: "S-SI",
					rate: "22",
					mosscountry: "SI",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-SI": {
					itemid: "R-SI",
					rate: "9.5",
					mosscountry: "SI",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				}
			}
		},

		"ES": {
			"TaxType": {
				"MOSS ES": {
					name: "MOSS ES",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales ES": {
					name: "MOSS VAT on Sales ES",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-ES": {
					itemid: "S-ES",
					rate: "21",
					mosscountry: "ES",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-ES": {
					itemid: "R-ES",
					rate: "10",
					mosscountry: "ES",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"R2-ES": {
					itemid: "R2-ES",
					rate: "4",
					mosscountry: "ES",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"SE": {
			"TaxType": {
				"MOSS SE": {
					name: "MOSS SE",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales SE": {
					name: "MOSS VAT on Sales SE",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-SE": {
					itemid: "S-SE",
					rate: "25",
					mosscountry: "SE",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-SE": {
					itemid: "R-SE",
					rate: "12",
					mosscountry: "SE",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				},
				"SR-SE": {
					itemid: "SR-SE",
					rate: "6",
					mosscountry: "SE",
					available: "SALE",
					description: "MOSS Special Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_super_reduced: "T"
				}
			}
		},


		"GB": {
			"TaxType": {
				"MOSS GB": {
					name: "MOSS GB",
					moss: "T"
				}
			},
			"TaxControlAccount": {
				"MOSS VAT on Sales GB": {
					name: "MOSS VAT on Sales GB",
					taxaccttype: "sale"
				}
			},
			"TaxCode": {
				"S-GB": {
					itemid: "S-GB",
					rate: "20",
					mosscountry: "GB",
					available: "SALE",
					description: "MOSS Standard rate",
					includechildren: "T",
					isdefault: "F"
				},
				"R-GB": {
					itemid: "R-GB",
					rate: "5",
					mosscountry: "GB",
					available: "SALE",
					description: "MOSS Reduced rate",
					includechildren: "T",
					isdefault: "F",
					custrecord_4110_reduced_rate: "T"
				}
			}
		}
	};
};




