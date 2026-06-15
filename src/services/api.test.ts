import axios from 'axios';
import { describe, expect, it } from 'vitest';
import { toApiError } from './api';

describe('toApiError', () => {
  it('formats axios http errors with the status code', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_RESPONSE',
      undefined,
      undefined,
      {
        status: 502,
        statusText: 'Bad Gateway',
        headers: {},
        config: {} as never,
        data: 'bad gateway',
      },
    );

    expect(toApiError(error).message).toBe('请求失败 (502)');
  });

  it('preserves api envelope errors', () => {
    expect(toApiError(new Error('账号或密码错误')).message).toBe(
      '账号或密码错误',
    );
  });
});
