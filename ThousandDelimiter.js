!function ($) {
    var ThousandDelimiterJS = function (element, options) {
        this.element = $(element);
        if (this.element.data('thousand-delimiter')) {
            this.thousandDelimiter = this.element.data('thousand-delimiter');
        }
        else {
            this.thousandDelimiter = ","; //default delimiter if nothing assigned on element
        }
        if (this.element.data('decimal-delimiter')) {
            this.decimalDelimiter = this.element.data('decimal-delimiter');
        }
        else {
            this.decimalDelimiter = ","; //default delimiter if nothing assigned on element
        }
        this.saveCurrencySymbol = false; //if this setting is true, currency symbol will be saved (not finished)
        this.debuggerMode = true; //if debuggerMode is true, it will eventual log errors in console
        this.isInput = this.element.is('input');
        if (this.isInput) {
            this.element.on({
                //use whatever event is needed
                //focus: $.proxy(this.doMagic, this),
                //blur: $.proxy(this.doMagic, this),
                change: $.proxy(this.doMagic, this)
            });
        }

        //Will format data of element automatically when bounded -- Remove this if that is not necessary or not wanted
        this.doMagic();
    };
    ThousandDelimiterJS.prototype = {
        constructor: ThousandDelimiterJS,
        doMagic: function (e) { //ze magic. TODO: Change this naming
            var that = this;
            var ValueObject = that.createValueObject();
            ValueObject = that.washInput(ValueObject);
            if (that.validateWashedString(ValueObject.Value)) {
                ValueObject.Value = that.delimitInput(ValueObject.Value);
                if (that.validateOutput) {
                    that.setOutputToElement(ValueObject);
                }
            }
        },
        createValueObject: function(){
            var ValueObject = {
                Value: "",
                CurrencySymbol: ""
            };

            if (this.isInput) {
                ValueObject.Value = this.element.val();
            }
            else {
                ValueObject.Value = this.element.text();
            }
            return ValueObject;
        },
        washInput: function (ValueObject) {
            var that = this;
            ValueObject.Value = that.removeSpaces(ValueObject.Value); //clean data from spaces - do it on all the strings because why not?
            if (that.saveCurrencySymbol) {
                ValueObject = that.saveCurrencySymbolFromString(ValueObject);
            }
            ValueObject.Value = that.removeLetters(ValueObject.Value);
            ValueObject.Value = that.clearThousandDelimiter(ValueObject.Value);
            return ValueObject;
        },
        clean: function () { //Use this for cleaning values before posting to a model. TODO: need better naming and needs to be developed (remove spaces, etc)
            
        },
        removeSpaces: function (val) {
            return val = val.replace(/\s+/g, '');
        },
        removeLetters: function (val) {
            return val = val.replace(/[^\d.,-]/g, '');
        },
        removeCommas: function (val) {
            return val = this.replaceAll(",", "", val);
        },
        removeDots: function (val) {
            return val = this.replaceAll(".", "", val);
        },
        replaceAll: function (find, replace, val) {
            return val.replace(new RegExp(find, 'g'), replace);
        },
        clearThousandDelimiter: function (val) {
            if (this.thousandDelimiter == ",") {
                val = this.removeCommas(val);
            }
            else if (this.thousandDelimiter == ".") {
                val = this.removeDots(val);
            }
            return val;
        },
        saveCurrencySymbolFromString: function (ValueObject) {
            debugger
            var that = this;
            $.each(TDGlobal.currencySymbols, function (index, Symbol) {
                if (that.characterExistsInString(Symbol, ValueObject.Value)) {
                    debugger
                    ValueObject.CurrencySymbol = Symbol;
                }
            });
            return ValueObject;
        },
        characterExistsInString: function (character, string) {
            if (string.indexOf(character) === -1) {
                return false;
            }
            return true;
        },
        validateWashedString: function (val) {
            var isFloat = parseFloat(val)
            var isInt = parseInt(val)

            if (isFloat || isInt) {
                return true;
            }

            if (this.debuggerMode)
                console.log("Error: Washed string is not either float or int || " + val)

            return false;
        },
        validateOutput: function (val) {
            //not implemented. Assert that output which will be formatted follows the rules
            console.log('Output validation is not implemented: it will always return true')
            return true;
        },
        setOutputToElement: function (ValueObject) {
            var valToSet = ValueObject.Value;
            if (ValueObject.CurrencySymbol != "") {
                valToSet = getValWithCurrencySymbol;
            }
            if (this.isInput) {
                this.element.val(valToSet);
            }
            else {
                this.element.html(valToSet);
            }
        },
        getValWithCurrencySymbol: function (ValueObject) {
            //not finished. Symbol can be infront of value ($ for example) TODO
            var val = ValueObject.Value + " " + ValueObject.CurrencySymbol;
            return val;
        },
        delimitInput: function (val) {
            val += '';
            x = val.split(this.decimalDelimiter);
            intVal = x[0];
            DecimalVal = x.length > 1 ? this.decimalDelimiter + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(intVal)) {
                intVal = intVal.replace(rgx, '$1' + this.thousandDelimiter + '$2');
            }
            return intVal + DecimalVal;
        }
    };

    $.fn.thousanddelimiterjs = function (option) {
        return this.each(function () {
            var $this = $(this);
            new ThousandDelimiterJS(this, null); //null options... add options in data-tag?
        });
    };
    $.fn.thousanddelimiterjs.constructor = ThousandDelimiterJS;

    var TDGlobal = {
        currencySymbols: ["$", "£", "€"], //this is buggy. £€ shows as question marks TODO
        delimiterMode: [ //implement the delimiterMode somehow?
            {
                thousandDelimiter: ',',
                decimalDelimiter: '.'
            },
            {
                thosandDelimiter: ' ',
                decimalDelimiter: ','
            },
            {
                thousandDelimiter: ' ',
                decimalDelimiter: '.'
            }
        ]
    };
}(window.jQuery);