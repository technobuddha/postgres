import Cursor from 'pg-cursor';

import { db } from './driver.ts';

export async function* readCursor<T = unknown[]>(
  query: string,
  batchSize = 100,
): AsyncGenerator<T> {
  const conn = await db.connect();

  // This is the cursor part
  const cursor = (await conn.client.query(new Cursor(query))) as unknown as Cursor<T>;

  let rows: T[] = await cursor.read(batchSize);
  while (rows.length > 0) {
    for (const row of rows) {
      yield row;
    }

    rows = await cursor.read(batchSize);
  }

  // Don't forget to release connection back when finish reading data by cursor
  cursor.close(() => void conn.done());
}
