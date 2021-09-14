import { URL } from 'url';
import { Connection } from '../connection';

export interface Request {
  connection: Connection;
  url(): URL;
}
