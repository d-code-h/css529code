$('input#pass-visibility').click(function () {
  let x = $('#password')[0],
    y = $('#password2')[0];
  if (x.type === 'password' && y.type === 'password') {
    $('#password')[0].type = 'text';
    $('#password2')[0].type = 'text';
    $('input#pass-visibility+label').text('Hide Password');
  } else {
    $('input#pass-visibility+label').text('Show Password');
    $('#password')[0].type = 'password';
    $('#password2')[0].type = 'password';
  }
});

$('#email').keyup(function () {
  if ($(this)[0].checkValidity()) {
    $(this).removeClass('is-invalid');
  } else {
    $(this).addClass('is-invalid');
  }
});

// var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
// return re.test(str);

// $('#email').focus(function () {
//   let email = $(this).value;
//   if (email === 'abc') {
//     console.log('Worked');
//   }
// });
