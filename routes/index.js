// Require
const //Packages
  express = require('express'),
  passport = require('passport'),
  { body, validationResult } = require('express-validator'),
  router = express.Router(),
  //Models
  User = require('../models/user');

// TWILIO
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

var x = 2200010;

const isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('error', 'Please log in.');
    res.redirect('/login');
  }
};

// Error Handling
const userErrors = {
  name: 'Name field can not be empty',
  email: 'Email not properly formated',
  number: 'Valid Nigerian phone number is required',
  password:
    'Password must be  minimum 8 in length, minimum lowercase of 1, minimum Uppercase of 1, minimum Numbers of 1 and atleast a symbol',
  confPassword: 'Password those not match',
};

// Index GET
router.get('/', isLoggedIn, (req, res) => {
  res.render('dashboard');
});

// Signup GET
router.get('/signup', (req, res) => {
  res.render('signup');
});

// Signup Post
router.post(
  '/signup',
  body('name').trim().escape().not().isEmpty(),
  body('email').trim().isEmail().normalizeEmail(),
  body('number').trim().isMobilePhone('en-NG'),
  body('password').trim().isStrongPassword(),
  body('confPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    // Indicates the success of this synchronous custom validator
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    const output = {};
    if (!errors.isEmpty()) {
      errors.errors.forEach((element) => {
        output[element.param] = userErrors[element.param];
      });
      console.log(output);
      req.flash('error', output);
      res.redirect('/signup');
    } else {
      res.redirect('/signup');
    }

    // Create new user
    // try {
    //   await User.register(
    //     new User({
    //       name: req.body.name,
    //       username: username,
    //       number: req.body.number,
    //       email: req.body.email,
    //     }),
    //     req.body.password
    //   );

    //     console.log('Account Created, Please Log in.');
    //     req.flash('success', 'Account Created, Please Log in.');
    //     res.redirect('/login');
    //   } catch (err) {
    //     console.log(err);
    //     req.flash('error', err.message);
    //     res.redirect('/signup');
    //   }
    // } else {
    // When Terms is accepted
    //     req.flash(
    //       'error',
    //       'You need to agree to our terms before you can use our services. Please agree to the terms of use.'
    //     );
    //     res.redirect('/signup');
    //   }
    // } else {
    // When password inputs does not match
    //     req.flash('error', 'Sorry, password does not match!');
    //     res.redirect('/signup');
    //   }
    // } else {
    //   // When form isn't properly filled
    //   req.flash('error', "Form isn't properly filled.");
    //   res.redirect('/signup');
    // }
  }
);

// Login OTP verification
router.get('/verifyuser', isLoggedIn, (req, res) => {
  res.render('otp', { number: '+234' + req.user.number });
});

router.post('/verifyuser', isLoggedIn, async (req, res) => {
  try {
    client.verify
      .services('VA6a6c0e081e04b30b47cf659c94a21280')
      .verificationChecks.create({
        to: '+234' + req.user.number,
        code: req.body.code,
      })
      .then((verification_check) => {
        console.log(verification_check.status);
        if (req.session.remember) {
          req.session.cookie.maxAge = 100 * 60 * 60 * 24 * 7; // Expires in 7 day = 604800000
        } else {
          req.session.cookie.expires = false;
        }
        console.log(req.session);
        res.redirect('/');
      });
  } catch (err) {
    console.log(err);
    req.flash('error', 'wrong code');
    res.redirect('verify');
  }
});
// Login GET
router.get('/login', (req, res) => {
  res.render('login');
});

// Login Post
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res, next) => {
    if (req.body.remember) {
      req.session.remember = true;
      next();
    } else {
      req.session.remember = null;
      next();
    }
  },
  async (req, res) => {
    try {
      client.verify
        .services('VA6a6c0e081e04b30b47cf659c94a21280')
        .verifications.create({
          to: '+234' + req.user.number,
          channel: 'sms',
        })
        .then((verification) => {
          res.redirect('/verify');
        });
    } catch (err) {
      console.log(err);
      req.logout();
      req.flash('error', err.message);
      res.redirect('/login');
    }
  }
);

// Reset
router.get('/reset', (req, res) => {
  res.render('reset');
});

router.post('/reset', async (req, res) => {
  req.body.username = req.sanitize(req.body.username);

  try {
    const foundUser = await User.findOne({ username: req.body.username });
    if (foundUser) {
      req.session.user = foundUser;
      try {
        client.verify
          .services('VA6a6c0e081e04b30b47cf659c94a21280')
          .verifications.create({
            to: '+234' + req.session.user.number,
            channel: 'sms',
          })
          .then(() => {
            res.redirect('/verifyreset');
          });
      } catch (err) {
        console.log(err);
        req.session.user = null;
        req.flash('error', 'Something went wrong, Please try again.');
        res.redirect('/reset');
      }
    } else {
      req.flash('error', 'User with this username does not exist.');
      req.redirect('/reset');
    }
  } catch (err) {
    console.log(err);
    req.flash('error', 'Something went wrong, Try again.');
    res.redirect('/reset');
  }
});
// Reset Password GET
router.get('/verifyreset', (req, res) => {
  res.render('verifyreset', { number: '+234' + req.session.user.number });
});

// Reset OTP verification
router.post('/verifyreset', (req, res) => {
  try {
    client.verify
      .services('VA6a6c0e081e04b30b47cf659c94a21280')
      .verificationChecks.create({
        to: '+234' + req.session.user.number,
        code: req.body.code,
      })
      .then(() => {
        req.session.user.verified = 'true';
        res.redirect('/resetpassword');
      });
  } catch (err) {
    console.log(err);
    req.flash('error', 'wrong code');
    res.redirect('verify');
  }
});

// Reset Password GET
router.get('/resetpassword', (req, res) => {
  if (req.session.user.verified) {
    res.render('resetpassword', { username: req.session.user.username });
  } else {
    req.flash('error', 'You are not allowed to access this page');
    res.redirect('/reset');
  }
});

// Reset Pasword POST
router.post('/resetpassword', async (req, res) => {
  // Sanitize inputs
  req.body.newPassword = req.sanitize(req.body.newPassword);
  req.body.confNewPassword = req.sanitize(req.body.confNewPassword);

  // Regular expressions
  let nameTest = /^[0-9a-z-A-Z]{3,}$/,
    passwordTest =
      /^(?=.*[a-z].*[a-z])(?=.*[A-Z])(?=.*\d.*\d)[a-zA-Z0-9\S]{8,}$/;

  // Ensuring proper validations
  if (
    req.body.newPassword !== '' &&
    passwordTest.test(req.body.newPassword) &&
    req.body.confNewPassword !== '' &&
    passwordTest.test(req.body.confNewPassword)
  ) {
    // When password inputs are as expected
    if (req.body.newPassword === req.body.confNewPassword) {
      try {
        let foundUser = await User.findOne({
          username: req.session.user.username,
        });
        // Reset password
        await foundUser.setPassword(req.body.newPassword);
        await foundUser.save();
        console.log('Done');
        req.session.user = null;
        // Update User with info
        req.flash(
          'success',
          'Details successfully updated. Please login to continue.'
        );
        res.redirect('/login');
      } catch (err) {
        console.log(err);
        req.flash('error', 'Something went wrong, Try again.');
        res.redirect('/resetpassword');
      }
    } else {
      // When password inputs does not match
      req.flash('error', 'Sorry, password does not match!');
      res.redirect('/resetpassword');
    }
  } else {
    // When form isn't properly filled
    req.flash('error', "Form isn't properly filled.");
    res.redirect('/resetpassword');
  }
});

// Logout GET
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You successfully logged out. See you soon');
  res.redirect('/login');
});

// Other routes ALL
router.all('*', (req, res) => {
  req.flash(
    'error',
    'The Page you requested for does not exist. You can start here.'
  );
  res.redirect('/');
});

// Export module
module.exports = router;
