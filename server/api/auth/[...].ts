import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from 'next-auth/providers/github';
import safeAwait from 'safe-await';
import { useLogger } from '@nuxt/kit';

//@ts-expect-error
import bcrypt from 'bcryptjs';

import User from '~/server/models/User';

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login'
  },
  providers: [
    // @ts-expect-error
    GithubProvider.default({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),
    // @ts-expect-error
    CredentialsProvider.default({
      name: 'Credentials',
      async authorize(credentials: any) {
        console.log(process.env.AUTH_ORIGIN)
        const logger = useLogger();
        const email = credentials.email;
        const password = credentials.password;

        const [error, user] = await safeAwait(User.findOne({ email }));

        if(error) {
          console.log('there was an error');
          logger.error(error);
        }

        console.log(user);
        if(!error && user && bcrypt.compareSync(password, user.hash)) {
          return user;
        }
      }
    })
  ]
})
