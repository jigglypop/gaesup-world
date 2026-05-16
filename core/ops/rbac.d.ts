import type { CreatorRole, RbacPermission, WorkspaceMember } from './types';
export declare const ROLE_PERMISSIONS: Record<CreatorRole, readonly RbacPermission[]>;
export declare function resolveRolePermissions(roles: readonly CreatorRole[]): RbacPermission[];
export declare function canMember(member: WorkspaceMember, permission: RbacPermission): boolean;
