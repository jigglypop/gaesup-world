import { ROLE_PERMISSIONS, canMember, resolveRolePermissions } from '../rbac';
import type { CreatorRole, RbacPermission, WorkspaceMember } from '../types';

const member = (roles: CreatorRole[], permissions: RbacPermission[] = []): WorkspaceMember => ({
  tenantId: 'tenant',
  workspaceId: 'workspace',
  userId: 'user',
  roles,
  permissions,
});

describe('rbac', () => {
  test('owner holds every permission any role grants, and no role lists a permission twice', () => {
    const granted = new Set(Object.values(ROLE_PERMISSIONS).flat());
    expect(new Set(ROLE_PERMISSIONS.owner)).toEqual(granted);
    for (const permissions of Object.values(ROLE_PERMISSIONS)) {
      expect(new Set(permissions).size).toBe(permissions.length);
    }
  });

  test('only owners manage the workspace and viewers only read it', () => {
    const managers = Object.entries(ROLE_PERMISSIONS)
      .filter(([, permissions]) => permissions.includes('workspace:manage'))
      .map(([role]) => role);
    expect(managers).toEqual(['owner']);
    expect(ROLE_PERMISSIONS.viewer).toEqual(['workspace:read']);
  });

  test('resolveRolePermissions unions roles once, in first-seen order', () => {
    expect(resolveRolePermissions([])).toEqual([]);
    expect(resolveRolePermissions(['designer', 'moderator'])).toEqual([
      'workspace:read',
      'content:edit',
      'asset:upload',
      'moderation:read',
      'moderation:resolve',
    ]);
    expect(resolveRolePermissions(['viewer', 'viewer'])).toEqual(['workspace:read']);
  });

  test('canMember allows a permission from a role or a direct grant and denies the rest', () => {
    expect(canMember(member(['developer']), 'content:validate')).toBe(true);
    expect(canMember(member(['developer']), 'content:publish')).toBe(false);
    expect(canMember(member(['viewer'], ['content:publish']), 'content:publish')).toBe(true);
    expect(canMember(member([]), 'workspace:read')).toBe(false);
  });
});
