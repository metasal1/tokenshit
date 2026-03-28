import NextAuth from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'

const handler = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0',
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        // Twitter v2 profile data
        token.twitterId = (profile as any).data?.id
        token.twitterUsername = (profile as any).data?.username
        token.twitterName = (profile as any).data?.name
        token.twitterImage = (profile as any).data?.profile_image_url
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).twitterId = token.twitterId
        ;(session.user as any).twitterUsername = token.twitterUsername
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
