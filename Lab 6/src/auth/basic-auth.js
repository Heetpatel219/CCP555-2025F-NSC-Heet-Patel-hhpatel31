const fs = require('fs');
const path = require('path');
const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const apr1Md5 = require('apache-md5'); // npm install apache-md5
const authorize = require('./auth-middleware');

const htpasswdFile = process.env.HTPASSWD_FILE || 'tests/.htpasswd';

passport.use(
  new BasicStrategy((username, password, done) => {
    try {
      const fullPath = path.resolve(htpasswdFile);
      if (!fs.existsSync(fullPath)) return done(null, false);

      const lines = fs.readFileSync(fullPath, 'utf-8').split('\n');
      const userLine = lines.find(line => line.startsWith(username + ':'));
      if (!userLine) return done(null, false);

      const storedHash = userLine.split(':')[1].trim();

      // Compare password using apache-md5
      if (apr1Md5(password, storedHash) === storedHash) {
        return done(null, username);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err);
    }
  })
);

module.exports.authenticate = () => authorize('basic');
