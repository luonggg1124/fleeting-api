import passport from "passport";
import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
dotenv.config();

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        passReqToCallback: true
      },
      async (req,accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          const deviceId = req.query.deviceId || req.body?.deviceId || "unknown";
          return done(null, {profile,deviceId});
        } catch (err) {
          return done(err, undefined);
        }
      }
    )
  );
