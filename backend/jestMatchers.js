/*
expect.extend({
  toHaveBeenCalledOnceWith: (fn, ...expectedArgs) => {
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(...expectedArgs);
    return { pass: true, message: () => "" };
  },
});

expect.extend({
  toHaveBeenCalledTwiceWith: (fn, ...expectedArgs) => {
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, ...expectedArgs);
    expect(fn).toHaveBeenNthCalledWith(2, ...expectedArgs);
    return { pass: true, message: () => "" };
  },
});
*/