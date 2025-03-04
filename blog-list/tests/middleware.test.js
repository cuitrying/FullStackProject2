const { tokenExtractor } = require('../middleware/auth');

describe('tokenExtractor middleware', () => {
  test('extracts token from authorization header', () => {
    const request = {
      get: jest.fn().mockReturnValue('Bearer testtoken')
    };
    const response = {};
    const next = jest.fn();

    tokenExtractor(request, response, next);

    expect(request.token).toBe('testtoken');
    expect(next).toHaveBeenCalled();
  });

  test('sets token to null if authorization header is missing', () => {
    const request = {
      get: jest.fn().mockReturnValue(undefined)
    };
    const response = {};
    const next = jest.fn();

    tokenExtractor(request, response, next);

    expect(request.token).toBe(null);
    expect(next).toHaveBeenCalled();
  });

  test('sets token to null if authorization header does not start with Bearer', () => {
    const request = {
      get: jest.fn().mockReturnValue('Basic testtoken')
    };
    const response = {};
    const next = jest.fn();

    tokenExtractor(request, response, next);

    expect(request.token).toBe(null);
    expect(next).toHaveBeenCalled();
  });
}); 