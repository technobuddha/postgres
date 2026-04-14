import '#env';

import pgPromise from 'pg-promise';

import { readCursor } from './cursor.ts';

type Extensions = {
  cursor: typeof readCursor;
};

export const pgp = pgPromise<Extensions>({
  capSQL: true,
  extend(obj) {
    obj.cursor = readCursor;
  },
});

export const db = pgp<Extensions>({});
