// tests/e2e/utils/api-client.ts
import { request } from '@playwright/test';

const BASE_URL = 'http://localhost:8090';

export class ApiClient {
  constructor(private accessToken: string) {}

  private static async login(): Promise<string> {
    const context = await request.newContext();
    const response = await context.post(`${BASE_URL}/auth/login`, {
      data: {
        username: 'admin',
        password: 'admin123',
        code: '1234',
        uuid: 'test-uuid'
      }
    });
    const result = await response.json();
    return result.data.token;
  }

  static async create(): Promise<ApiClient> {
    const token = await this.login();
    return new ApiClient(token);
  }

  async createTestUser(data: { username: string; password: string }): Promise<number> {
    const context = await request.newContext();
    const response = await context.post(`${BASE_URL}/system/user`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      data: {
        userName: data.username,
        nickName: data.username,
        password: data.password,
        status: '0',
        deptId: 100,
        roleIds: [2]
      }
    });
    const result = await response.json();
    return result.data.userId;
  }

  async deleteUser(userId: number): Promise<void> {
    const context = await request.newContext();
    await context.delete(`${BASE_URL}/system/user/${userId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
  }

  async createTestRole(data: { roleName: string }): Promise<number> {
    const context = await request.newContext();
    const response = await context.post(`${BASE_URL}/system/role`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      data: {
        roleName: data.roleName,
        roleKey: data.roleName.toLowerCase(),
        status: '0'
      }
    });
    const result = await response.json();
    return result.data.roleId;
  }

  async deleteRole(roleId: number): Promise<void> {
    const context = await request.newContext();
    await context.delete(`${BASE_URL}/system/role/${roleId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
  }
}
