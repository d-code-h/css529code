$('#name').keyup(function () {
  let name = $(this)[0].value,
    nametest = /^[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/;
  if (!nametest.test(name)) {
    $(this).addClass('is-invalid');
  } else {
    $(this).removeClass('is-invalid');
  }
});

$('#email').keyup(function () {
  if ($(this)[0].checkValidity()) {
    $(this).removeClass('is-invalid');
  } else {
    $(this).addClass('is-invalid');
  }
});

$('#number').keyup(function () {
  let number = $(this)[0].value;
  if (!/^\d{10}$/.test(number)) {
    $(this).addClass('is-invalid');
  } else {
    $(this).removeClass('is-invalid');
  }
});

$('#password').keyup(function () {
  let pass = $(this)[0].value;
  let passtest = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!passtest.test(pass)) {
    $(this).addClass('is-invalid');
  } else {
    $(this).removeClass('is-invalid');
  }
});

$('#password2').keyup(function () {
  let pass = $('#password')[0].value;
  let pass2 = $(this)[0].value;
  if (pass === pass2) {
    $(this).removeClass('is-invalid');
  } else {
    $(this).addClass('is-invalid');
  }
});

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

$(':submit').click(function () {
  $('#password')[0].type = 'password';
  $('#password2')[0].type = 'password';
  console.log($('#password')[0].type);
  console.log($('#password2')[0].type);
});
