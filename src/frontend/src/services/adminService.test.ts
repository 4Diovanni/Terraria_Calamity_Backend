import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from './apiClient';
import { adminService } from './adminService';

describe('adminService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('fetches the dashboard counts', async () => {
    mock.onGet('/api/v1/admin/dashboard').reply(200, {
      totalUsers: 10,
      totalAdmins: 2,
      totalWeapons: 50,
      pendingSubmissions: 3,
      approvedSubmissions: 7,
      rejectedSubmissions: 1,
    });

    const dashboard = await adminService.getDashboard();
    expect(dashboard.totalUsers).toBe(10);
    expect(dashboard.pendingSubmissions).toBe(3);
  });
});
