let form = document.getElementById('form');

// Per Input
let formValidateObject = new FormValidate(form, [{
    name: "first_name", // String
    // event: "input", // String,
    valid: function () {
      document.getElementById('error').textContent = '';
    },
    invalid: function () {
      document.getElementById('error').textContent = 'Error';
    }
  },
  {
    name: "last_name", // String
    event: "input", // String,
  },
]);

console.log(formValidateObject);


/* 
options required : {
  name
}
options defaults: {
  event: false, 
  warning: false,
  preventDefault: false
  timeout: 0
}
*/