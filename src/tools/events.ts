import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerEventTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Events ─────────────────────────────────────────────────────────

  // 1. List events
  registerTool(server, config, {
    name: 'authentik_events_list',
    description: 'List audit events with optional filters for action, username, client IP, and more.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      action: z.string().optional().describe('Filter by exact event action'),
      username: z.string().optional().describe('Filter by username'),
      client_ip: z.string().optional().describe('Filter by client IP address'),
      search: z.string().optional().describe('Search across event fields'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsEventsList({
        action: args.action as string | undefined,
        username: args.username as string | undefined,
        clientIp: args.client_ip as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get event
  registerTool(server, config, {
    name: 'authentik_events_get',
    description: 'Get a single audit event by its UUID.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      event_uuid: z.string().describe('Event UUID'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsEventsRetrieve({
        eventUuid: args.event_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create event
  registerTool(server, config, {
    name: 'authentik_events_create',
    description: 'Create a new audit event.',
    accessTier: 'full',
    category: 'events',
    inputSchema: {
      action: z.string().describe('Event action (e.g. "custom_", "login", "model_created")'),
      app: z.string().describe('Application identifier that generated the event'),
      context: z.record(z.unknown()).optional().describe('Additional event context data'),
      client_ip: z.string().optional().describe('Client IP address'),
      expires: z.string().optional().describe('Expiration date-time (ISO 8601)'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsEventsCreate({
        eventRequest: {
          action: args.action as any,
          app: args.app as string,
          context: args.context as Record<string, unknown> | undefined,
          clientIp: args.client_ip as string | undefined,
          expires: args.expires ? new Date(args.expires as string) : undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. List event actions
  registerTool(server, config, {
    name: 'authentik_events_actions_list',
    description: 'List all available event action types.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {},
    handler: async () => {
      const result = await client.eventsApi.eventsEventsActionsList();
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Top events per user
  registerTool(server, config, {
    name: 'authentik_events_top_per_user',
    description: 'Get the top N events grouped by user count.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      action: z.string().optional().describe('Filter by event action'),
      top_n: z.number().optional().describe('Number of top users to return'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsEventsTopPerUserList({
        action: args.action as string | undefined,
        topN: args.top_n as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 6. Event volume
  registerTool(server, config, {
    name: 'authentik_events_volume',
    description: 'Get event volume data for specified filters and timeframe.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      action: z.string().optional().describe('Filter by event action'),
      username: z.string().optional().describe('Filter by username'),
      client_ip: z.string().optional().describe('Filter by client IP address'),
      history_days: z.number().optional().describe('Number of days to include in history'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsEventsVolumeList({
        action: args.action as string | undefined,
        username: args.username as string | undefined,
        clientIp: args.client_ip as string | undefined,
        historyDays: args.history_days as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // ── Notification rules ─────────────────────────────────────────────

  // 7. List notification rules
  registerTool(server, config, {
    name: 'authentik_events_rules_list',
    description: 'List notification rules with optional filters.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      name: z.string().optional().describe('Filter by rule name'),
      severity: z.string().optional().describe('Filter by severity (alert, notice, warning)'),
      search: z.string().optional().describe('Search across rule fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsRulesList({
        name: args.name as string | undefined,
        severity: args.severity as any,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Get notification rule
  registerTool(server, config, {
    name: 'authentik_events_rules_get',
    description: 'Get a single notification rule by its UUID.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      pbm_uuid: z.string().describe('Notification rule UUID'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsRulesRetrieve({
        pbmUuid: args.pbm_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Create notification rule
  registerTool(server, config, {
    name: 'authentik_events_rules_create',
    description: 'Create a new notification rule.',
    accessTier: 'full',
    category: 'events',
    inputSchema: {
      name: z.string().describe('Rule name (required)'),
      transports: z.array(z.string()).optional().describe('Transport UUIDs to use for notifications'),
      severity: z.string().optional().describe('Notification severity: alert, notice, or warning'),
      destination_group: z.string().optional().describe('Group UUID to send notifications to'),
      destination_event_user: z.boolean().optional().describe('Also send to the user that triggered the event'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsRulesCreate({
        notificationRuleRequest: {
          name: args.name as string,
          transports: args.transports as string[] | undefined,
          severity: args.severity as any,
          destinationGroup: args.destination_group as string | undefined,
          destinationEventUser: args.destination_event_user as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 10. Update notification rule
  registerTool(server, config, {
    name: 'authentik_events_rules_update',
    description: 'Update an existing notification rule. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'events',
    inputSchema: {
      pbm_uuid: z.string().describe('Notification rule UUID (required)'),
      name: z.string().optional().describe('New rule name'),
      transports: z.array(z.string()).optional().describe('New transport UUIDs'),
      severity: z.string().optional().describe('New severity'),
      destination_group: z.string().optional().describe('New destination group UUID'),
      destination_event_user: z.boolean().optional().describe('Send to triggering user'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsRulesPartialUpdate({
        pbmUuid: args.pbm_uuid as string,
        patchedNotificationRuleRequest: {
          name: args.name as string | undefined,
          transports: args.transports as string[] | undefined,
          severity: args.severity as any,
          destinationGroup: args.destination_group as string | undefined,
          destinationEventUser: args.destination_event_user as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 11. Delete notification rule
  registerTool(server, config, {
    name: 'authentik_events_rules_delete',
    description: 'Delete a notification rule by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'events',
    tags: ['destructive'],
    inputSchema: {
      pbm_uuid: z.string().describe('Notification rule UUID to delete'),
    },
    handler: async (args) => {
      await client.eventsApi.eventsRulesDestroy({
        pbmUuid: args.pbm_uuid as string,
      });
      return `Notification rule "${args.pbm_uuid}" deleted successfully.`;
    },
  });

  // ── Notification transports ────────────────────────────────────────

  // 12. List notification transports
  registerTool(server, config, {
    name: 'authentik_events_transports_list',
    description: 'List notification transports with optional filters.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      name: z.string().optional().describe('Filter by transport name'),
      mode: z.string().optional().describe('Filter by mode (email, webhook, webhook_slack, local)'),
      search: z.string().optional().describe('Search across transport fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsTransportsList({
        name: args.name as string | undefined,
        mode: args.mode as any,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 13. Get notification transport
  registerTool(server, config, {
    name: 'authentik_events_transports_get',
    description: 'Get a single notification transport by its UUID.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      uuid: z.string().describe('Transport UUID'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsTransportsRetrieve({
        uuid: args.uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 14. Create notification transport
  registerTool(server, config, {
    name: 'authentik_events_transports_create',
    description: 'Create a new notification transport.',
    accessTier: 'full',
    category: 'events',
    inputSchema: {
      name: z.string().describe('Transport name (required)'),
      mode: z.string().optional().describe('Transport mode: email, webhook, webhook_slack, or local'),
      webhook_url: z.string().optional().describe('Webhook URL (for webhook/webhook_slack modes)'),
      webhook_mapping_body: z.string().optional().describe('Webhook body mapping UUID'),
      webhook_mapping_headers: z.string().optional().describe('Webhook headers mapping UUID'),
      send_once: z.boolean().optional().describe('Only send notification once'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsTransportsCreate({
        notificationTransportRequest: {
          name: args.name as string,
          mode: args.mode as any,
          webhookUrl: args.webhook_url as string | undefined,
          webhookMappingBody: args.webhook_mapping_body as string | undefined,
          webhookMappingHeaders: args.webhook_mapping_headers as string | undefined,
          sendOnce: args.send_once as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 15. Update notification transport
  registerTool(server, config, {
    name: 'authentik_events_transports_update',
    description: 'Update an existing notification transport. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'events',
    inputSchema: {
      uuid: z.string().describe('Transport UUID (required)'),
      name: z.string().optional().describe('New transport name'),
      mode: z.string().optional().describe('New transport mode'),
      webhook_url: z.string().optional().describe('New webhook URL'),
      webhook_mapping_body: z.string().optional().describe('New webhook body mapping UUID'),
      webhook_mapping_headers: z.string().optional().describe('New webhook headers mapping UUID'),
      send_once: z.boolean().optional().describe('Only send notification once'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsTransportsPartialUpdate({
        uuid: args.uuid as string,
        patchedNotificationTransportRequest: {
          name: args.name as string | undefined,
          mode: args.mode as any,
          webhookUrl: args.webhook_url as string | undefined,
          webhookMappingBody: args.webhook_mapping_body as string | undefined,
          webhookMappingHeaders: args.webhook_mapping_headers as string | undefined,
          sendOnce: args.send_once as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 16. Delete notification transport
  registerTool(server, config, {
    name: 'authentik_events_transports_delete',
    description: 'Delete a notification transport by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'events',
    tags: ['destructive'],
    inputSchema: {
      uuid: z.string().describe('Transport UUID to delete'),
    },
    handler: async (args) => {
      await client.eventsApi.eventsTransportsDestroy({
        uuid: args.uuid as string,
      });
      return `Notification transport "${args.uuid}" deleted successfully.`;
    },
  });

  // 17. Test notification transport
  registerTool(server, config, {
    name: 'authentik_events_transports_test',
    description: 'Send a test notification using the specified transport.',
    accessTier: 'full',
    category: 'events',
    inputSchema: {
      uuid: z.string().describe('Transport UUID to test'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsTransportsTestCreate({
        uuid: args.uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // ── Notifications ──────────────────────────────────────────────────

  // 18. List notifications
  registerTool(server, config, {
    name: 'authentik_events_notifications_list',
    description: 'List notifications for the current user with optional filters.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      seen: z.boolean().optional().describe('Filter by seen status'),
      severity: z.string().optional().describe('Filter by severity (alert, notice, warning)'),
      search: z.string().optional().describe('Search across notification fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsNotificationsList({
        seen: args.seen as boolean | undefined,
        severity: args.severity as any,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 19. Update notification (mark seen/unseen)
  registerTool(server, config, {
    name: 'authentik_events_notifications_update',
    description: 'Update a notification, typically to mark it as seen or unseen.',
    accessTier: 'full',
    category: 'events',
    inputSchema: {
      uuid: z.string().describe('Notification UUID'),
      seen: z.boolean().optional().describe('Set seen status'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsNotificationsPartialUpdate({
        uuid: args.uuid as string,
        patchedNotificationRequest: {
          seen: args.seen as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 20. Delete notification
  registerTool(server, config, {
    name: 'authentik_events_notifications_delete',
    description: 'Delete a notification by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'events',
    tags: ['destructive'],
    inputSchema: {
      uuid: z.string().describe('Notification UUID to delete'),
    },
    handler: async (args) => {
      await client.eventsApi.eventsNotificationsDestroy({
        uuid: args.uuid as string,
      });
      return `Notification "${args.uuid}" deleted successfully.`;
    },
  });

  // 21. Mark all notifications as seen
  registerTool(server, config, {
    name: 'authentik_events_notifications_mark_all_seen',
    description: 'Mark all notifications as seen for the current user.',
    accessTier: 'full',
    category: 'events',
    inputSchema: {},
    handler: async () => {
      await client.eventsApi.eventsNotificationsMarkAllSeenCreate();
      return 'All notifications marked as seen.';
    },
  });
}
