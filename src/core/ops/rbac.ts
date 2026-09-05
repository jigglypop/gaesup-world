import type { CreatorRole, RbacPermission, WorkspaceMember } from './types';

export const ROLE_PERMISSIONS: Record<CreatorRole, readonly RbacPermission[]> = {
  owner: [
    'workspace:read',
    'workspace:manage',
    'content:edit',
    'content:validate',
    'content:publish',
    'content:rollback',
    'asset:upload',
    'asset:approve',
    'moderation:read',
    'moderation:resolve',
    'analytics:read',
  ],
  admin: [
    'workspace:read',
    'content:edit',
    'content:validate',
    'content:publish',
    'content:rollback',
    'asset:upload',
    'asset:approve',
    'moderation:read',
    'moderation:resolve',
    'analytics:read',
  ],
  developer: ['workspace:read', 'content:edit', 'content:validate', 'asset:upload', 'analytics:read'],
  designer: ['workspace:read', 'content:edit', 'asset:upload'],
  moderator: ['workspace:read', 'moderation:read', 'moderation:resolve'],
  viewer: ['workspace:read'],
};

export function resolveRolePermissions(roles: readonly CreatorRole[]): RbacPermission[] {
  return Array.from(new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role])));
}

export function canMember(member: WorkspaceMember, permission: RbacPermission): boolean {
  return member.permissions.includes(permission) || resolveRolePermissions(member.roles).includes(permission);
}
