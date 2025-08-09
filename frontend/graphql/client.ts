import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/graphql`, // Replace with Express GraphQL endpoint : NOTE : uri may change due to ngrok
  }),
  cache: new InMemoryCache(),
});

export default client;
 