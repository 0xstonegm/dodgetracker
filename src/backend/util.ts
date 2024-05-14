export async function promiseWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError = new Error(`Promise timed out after ${ms}ms`),
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(timeoutError);
    }, ms);
  });

  return Promise.race<T>([promise, timeout]);
}
