export const asMock = (fn: unknown) => fn as jest.Mock;

export const fakeFile = (name: string, size: number) =>
  ({ name, size }) as unknown as File;
