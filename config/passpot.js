const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
            console.log("Google Profile: ", profile);
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        surname: profile.name.familyName,
        isEmailVerified: true
      });
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });
            console.log("Facebook Profile: ", profile);
    if (!user) {
      user = await User.create({
        facebookId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        surname: profile.name.familyName,
        isEmailVerified: true
      });
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});
module.exports = passport;
