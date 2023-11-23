import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from 'next-auth/providers/github';

export default NuxtAuthHandler({
  pages: {
    signIn: '/login'
  },
  providers: [
    GithubProvider.default({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      }
    })
  ]
})
