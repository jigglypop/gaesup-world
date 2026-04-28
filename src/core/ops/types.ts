export type TenantId = string;
export type WorkspaceId = string;
export type UserId = string;
export type ContentBundleId = string;

export type CreatorRole =
  | 'owner'
  | 'admin'
  | 'developer'
  | 'designer'
  | 'moderator'
  | 'viewer';

export type RbacPermission =
  | 'workspace:read'
  | 'workspace:manage'
  | 'content:edit'
  | 'content:validate'
  | 'content:publish'
  | 'content:rollback'
  | 'asset:upload'
  | 'asset:approve'
  | 'moderation:read'
  | 'moderation:resolve'
  | 'analytics:read';

export type WorkspaceContext = {
  tenantId: TenantId;
  workspaceId: WorkspaceId;
};

export type WorkspaceMember = WorkspaceContext & {
  userId: UserId;
  roles: CreatorRole[];
  permissions: RbacPermission[];
};

export type PublishStatus = 'draft' | 'validating' | 'published' | 'failed' | 'rolled-back';

export type PublishRecord = WorkspaceContext & {
  bundleId: ContentBundleId;
  version: string;
  status: PublishStatus;
  createdBy: UserId;
  createdAt: number;
  publishedAt?: number;
  rollbackOf?: string;
};

export type ModerationReportKind = 'asset' | 'chat' | 'profile' | 'world' | 'transaction';
export type ModerationReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export type ModerationReport = WorkspaceContext & {
  id: string;
  kind: ModerationReportKind;
  targetId: string;
  reporterId: UserId;
  status: ModerationReportStatus;
  reason: string;
  createdAt: number;
  resolvedBy?: UserId;
  resolvedAt?: number;
};

export type AnalyticsEvent = WorkspaceContext & {
  name: string;
  occurredAt: number;
  actorId?: UserId;
  properties?: Record<string, unknown>;
};
