function FormValidate(form_element, options) {
  this.form = {
    dom_element: form_element
  };

  this.options = options;

  this.init();

  return this;
}

FormValidate.prototype.init = function() {
  var formValidateSchema = {
    name: {
      required: true,
      typeOf: 'string'
    },
    event: {
      required: false,
      typeOf: 'string'
    },
    timeout: {
      required: false,
      typeOf: 'number',
    },
    warning: {
      required: false,
      typeOf: 'boolean',
    },
    invalid: {
      required: false,
      typeOf: 'function'
    },
    valid: {
      required: false,
      typeOf: 'function'
    }
  };

  // Determine if there are options
  this._onError(this.options === undefined, 'FormValidate called without any options.');

  // Form
  this._setFormHelperProperties(this.form);

  // Inputs/Options
  this.options.forEach(function(option, i) {
    this._validateOptionProperties(option, i, formValidateSchema)
      ._setDOMElement(option, i)
      ._setOptionHelperProperties(option, i)
      ._setDefaultEventListener(option)
      ._setEventListeners(option);
  }, this);

  return this;
}

FormValidate.prototype._setFormHelperProperties = function(form) {
  form.is = {
    handlers: {
      invalid: form.hasOwnProperty('invalid'),
      valid: form.hasOwnProperty('valid')
    }
  }
  return this;
}

// Validate and deleted unwanted properties?
FormValidate.prototype._validateOptionProperties = function(option, index, schema) {
  for (var prop in schema) {
    var currentOptionType = typeof option[prop],
      schemaType = schema[prop].typeOf;

    this._onTypeError((currentOptionType !== "undefined" && currentOptionType !== schemaType), 'Option at index ' + index + ' with the property of "' + prop + '" has an invalid type of "' + currentOptionType + '" must be a "' + schemaType + '".');

    this._onError(!option.hasOwnProperty(prop) && schema[prop].required, 'Option with the property of "' + prop + '" is required.');
  }

  return this;
}

FormValidate.prototype._setOptionHelperProperties = function(option, index) {
  option.index = index;
  option.dom_element_name = option.dom_element.nodeName.toLowerCase();

  option.is = {
    element: {
      type: option.dom_element.type
    },
    warning: option.hasOwnProperty('warning') && option.warning,
    debounce: option.hasOwnProperty('timeout'),
    event: {
      type: option.hasOwnProperty('event'),
      typeValue: option.hasOwnProperty('event') && option.event
    },
    handlers: {
      invalid: option.hasOwnProperty('invalid'),
      valid: option.hasOwnProperty('valid')
    }
  }

  return this;
}

FormValidate.prototype._setDOMElement = function(option, index) {
  this._onReferenceError(this.form.dom_element.elements.namedItem(option.name) === null, 'Couldn\'t find element with the name attribute of "' + option.name + '" on option with the index of ' + index);

  option.dom_element = this.form.dom_element.elements.namedItem(option.name);

  return this;
};

FormValidate.prototype._optionSpecificEventListener = function(option) {
  return function(e) {
    if (this.checkValidity()) {
      //Exit if we don't have a callback function
      if (!option.is.handlers.valid) return;

      e.validation = {
        validity: this.validity
      }

      option.valid(e);
    }
  }
}

FormValidate.prototype._setDefaultEventListener = function(option) {
  // Defaults
  option.dom_element.addEventListener('invalid', function(e) {
    e.preventDefault();

    // Exit if we don't have a callback function
    if (!option.is.handlers.invalid) return this;

    e.validation = {
      validity: this.validity,
      defaultValidationMessage: this.validationMessage
    }

    option.invalid(e);
  });

  option.dom_element.addEventListener('focus', this._optionSpecificEventListener(option));
  option.dom_element.addEventListener('blur', this._optionSpecificEventListener(option));

  return this;
}

FormValidate.prototype._setEventListeners = function(option) {
  if (!option.is.event.type) return this;

  // Add helper/warning?
  switch (option.event) {
    case "input":
      switch (option.is.debounce) {
        case true:
          option.dom_element.addEventListener(option.event, this._debounce(this._optionSpecificEventListener(option), option.debounce.timeout));
          break;

        default:
          this._onWarning(option.is.warning, '<' + option.dom_element_name + ' name="' + option.name + '" /> has an event listener of "' + option.event + '" and debounce flag is ' + option.is.debounce + '. This could cause unwanted function executions. To read more the about performance benefits about debouncing functions please visit https://davidwalsh.name/javascript-debounce-function');

          option.dom_element.addEventListener(option.event, this._optionSpecificEventListener(option));
          break;
      }
      break;

    default:
      option.dom_element.addEventListener(option.event, this._optionSpecificEventListener(option));
      break;
  }

  return this;
}

FormValidate.prototype._onWarning = function(warning, warning_message) {
  if (!warning) return this;

  console.warn(FormValidate.name + " Warning: " + warning_message);

  return this;
}

FormValidate.prototype._onReferenceError = function(error, error_message) {
  if (!error) return this;
  throw new ReferenceError(FormValidate.name + " ReferenceError: " + error_message);
}

FormValidate.prototype._onTypeError = function(error, error_message) {
  if (!error) return this;
  throw new TypeError(FormValidate.name + " TypeError: " + error_message);
}

FormValidate.prototype._onError = function(error, error_message) {
  if (!error) return this;
  throw new Error(FormValidate.name + " Error: " + error_message);
}

FormValidate.prototype._debounce = function(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Public
FormValidate.prototype.invalid = function(callback_fn) {
  callback_fn(new Error('Error'));
  return this;
}

FormValidate.prototype.valid = function(callback_fn) {
  callback_fn();
  return this;
}