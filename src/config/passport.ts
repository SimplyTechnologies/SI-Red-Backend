import { Strategy as JwtStrategy } from 'passport-jwt';
import passport from 'passport';
import dotenv from 'dotenv';
import { User } from '../models/User.model';
import { Request } from 'express';

dotenv.config();

const cookieExtractor = (req: Request): string | null => {
  return req?.cookies?.accessToken || null;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET!,
};

passport.use(
  new JwtStrategy(options, async (jwtPayload, done) => {
    try {
      const user = await User.findByPk(jwtPayload.userId);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
