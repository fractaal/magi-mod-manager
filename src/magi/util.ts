export const promiseTimeout = function<T>(ms: number, promise: Promise<T>): Promise<string|T> {
  const timeout: Promise<string> = new Promise((res, rej) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      rej(`Timed out after ${ms}ms.`);
    }, ms);
  })

  return Promise.race([promise, timeout]);
}