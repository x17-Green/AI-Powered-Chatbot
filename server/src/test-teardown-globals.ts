import { closeDatabase } from './database';

export default async () => {
  await closeDatabase();
};