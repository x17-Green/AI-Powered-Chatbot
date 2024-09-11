export const logger = {
  log: (message: string) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(message);
    }
  },
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(message, error);
    }
  }
};