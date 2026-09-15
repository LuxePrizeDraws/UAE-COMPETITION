declare module 'morgan' {
  import { RequestHandler } from 'express';

  function morgan(format?: string | Function, options?: any): RequestHandler;
  export = morgan;
}
