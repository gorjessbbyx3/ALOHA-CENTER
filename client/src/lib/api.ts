// Simple API client for making requests to the server
type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async get(path: string, options: RequestOptions = {}) {
    return this.request('GET', path, null, options);
  }

  async post(path: string, data: any, options: RequestOptions = {}) {
    return this.request('POST', path, data, options);
  }

  async put(path: string, data: any, options: RequestOptions = {}) {
    return this.request('PUT', path, data, options);
  }

  async delete(path: string, options: RequestOptions = {}) {
    return this.request('DELETE', path, null, options);
  }

  private async request(method: string, path: string, data: any = null, options: RequestOptions = {}) {
    const url = new URL(`${this.baseUrl}${path}`, window.location.origin);

    // Add query parameters if provided
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url.toString(), config);

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
        response,
      };
    }

    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }
}

export const api = new ApiClient();