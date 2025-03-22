import { ApolloServer, gql } from 'apollo-server';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from './models/user';
import sequelize from './sequelize';
import * as dotenv from 'dotenv';
import { ApolloContext, Context, LoginArgs, RegisterArgs } from './types';

dotenv.config();

// Esquema GraphQL
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): String
    login(email: String!, password: String!): String
  }
`;

// Resolvers GraphQL
const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new Error('Você precisa estar autenticado!');
      return await User.findByPk(user.id);
    },
  },
  Mutation: {
    register: async (_: any, { username, email, password }: RegisterArgs) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ username, email, password: hashedPassword });
      
      jwt.sign(
        { id: newUser.id, username: newUser.username },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRATION as any} 
      );
    },
    login: async (_: any, { email, password }: LoginArgs) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error('Usuário não encontrado');
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error('Senha inválida');
      return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRATION! as any},
      );
    },
  },
};

// Contexto de autenticação (verifica o token JWT)
const context = ({ req }: ApolloContext) => {
  const token = req.headers.authorization || '';
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!);
      return { user };
    } catch (err) {
      throw new Error('Token inválido');
    }
  }
  return {};
};

// Criar e iniciar o servidor Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

server.listen().then(({ url }) => {
  console.log(`Servidor rodando em ${url}`);
  sequelize.sync();  // Sincronizar o banco de dados
});
