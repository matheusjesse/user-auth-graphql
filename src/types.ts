// types.ts

import { Request } from 'express';

export interface Context {
  user?: { id: string; username: string };
}

export interface JwtPayload {
  id: string;
  username: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterArgs {
  username: string;
  email: string;
  password: string;
}

export interface LoginArgs {
  email: string;
  password: string;
}

export interface ApolloContext {
  req: Request;
}