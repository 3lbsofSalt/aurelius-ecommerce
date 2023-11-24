import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from 'next-auth/providers/github';
import { hashPassword } from '~/utils/auth';
import safeAwait from 'safe-await';
import { useLogger } from '@nuxt/kit';

//@ts-expect-error
import bcrypt from 'bcryptjs';

import User from '~/server/models/User';

export default NuxtAuthHandler({
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
        const logger = useLogger();
        const email = credentials.email;
        const password = credentials.password;

        const [error, user] = await safeAwait(User.findOne({ email }));

        if(error) {
          logger.error(error);
        }

        if(!error && user && bcrypt.compareSync(password, user.hash)) {
          return user;
        }
      }
    })
  ]
})
