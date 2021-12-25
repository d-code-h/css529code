// Require packages
const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  passportLocalMongoose = require('passport-local-mongoose');

// User schema
const userSchema = new Schema({
  name: String,
  username: String,
  number: Number,
  email: String,
  password: String,
});

// Integrate into schema and use email instead of username
userSchema.plugin(passportLocalMongoose);

// Export module
module.exports = mongoose.model('User', userSchema);
