"use server";

import { auth } from "@/lib/auth";
import { loggerApi as logger } from "@/lib/logger";
import { assertCan, denormalizeRole } from "@/lib/rbac";
import type { Result } from "@/types";
import { alertService } from "@/server/services/alert.service";
import {
  type CreateAlertInput,
  type UpdateAlertInput,
  type AlertFiltersInput,
  type AlertSortInput,
  type PaginationInput,
  createAlertSchema,
  updateAlertSchema,
  alertFiltersSchema,
  alertSortSchema,
  paginationSchema,
} from "@/features/alerts/schemas";

/**
 * Server actions for alert operations.
 *
 * These actions are the entry points for client-side mutations and queries.
 * They handle authentication, authorization, and error handling.
 */

/**
 * Get alerts with filtering, sorting, and pagination.
 */
export async function getAlerts(
  filters: AlertFiltersInput = {},
  sort: AlertSortInput = { field: "createdAt", direction: "desc" },
  pagination: PaginationInput = { page: 1, pageSize: 20 },
) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const result = await alertService.getAlerts(
      session.user.organizationId,
      filters,
      sort,
      pagination,
    );
    logger.info("Alerts fetched", { orgId: session.user.organizationId, count: result.items.length });
    return result;
  } catch (error) {
    logger.error("Failed to fetch alerts", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get a single alert by ID.
 */
export async function getAlert(id: string) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const alert = await alertService.getAlertById(id, session.user.organizationId);
    if (!alert) {
      throw new Error("Alert not found");
    }
    logger.info("Alert fetched", { orgId: session.user.organizationId, alertId: id });
    return alert;
  } catch (error) {
    logger.error("Failed to fetch alert", {
      orgId: session.user.organizationId,
      alertId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create a new alert.
 */
export async function createAlert(input: CreateAlertInput): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = createAlertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "alert:create");

    const alert = await alertService.createAlert(
      session.user.organizationId,
      parsed.data,
    );

    logger.info("Alert created", { orgId: session.user.organizationId, alertId: alert.id });
    return { ok: true, data: { id: alert.id } };
  } catch (error) {
    logger.error("Failed to create alert", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create alert" };
  }
}

/**
 * Update an existing alert.
 */
export async function updateAlert(id: string, input: UpdateAlertInput): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = updateAlertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "alert:edit");

    const alert = await alertService.updateAlert(id, session.user.organizationId, parsed.data);

    logger.info("Alert updated", { orgId: session.user.organizationId, alertId: id });
    return { ok: true, data: { id: alert.id } };
  } catch (error) {
    logger.error("Failed to update alert", {
      orgId: session.user.organizationId,
      alertId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update alert" };
  }
}

/**
 * Delete an alert.
 */
export async function deleteAlert(id: string): Promise<Result<null>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    assertCan(session.user.role, "alert:delete");

    await alertService.deleteAlert(id, session.user.organizationId);

    logger.info("Alert deleted", { orgId: session.user.organizationId, alertId: id });
    return { ok: true, data: null };
  } catch (error) {
    logger.error("Failed to delete alert", {
      orgId: session.user.organizationId,
      alertId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete alert" };
  }
}

/**
 * Acknowledge an alert.
 */
export async function acknowledgeAlert(id: string): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    assertCan(session.user.role, "alert:acknowledge");

    const alert = await alertService.acknowledgeAlert(id, session.user.organizationId);

    logger.info("Alert acknowledged", { orgId: session.user.organizationId, alertId: id });
    return { ok: true, data: { id: alert.id } };
  } catch (error) {
    logger.error("Failed to acknowledge alert", {
      orgId: session.user.organizationId,
      alertId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to acknowledge alert" };
  }
}

/**
 * Resolve an alert.
 */
export async function resolveAlert(id: string): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    assertCan(session.user.role, "alert:resolve");

    const alert = await alertService.resolveAlert(id, session.user.organizationId);

    logger.info("Alert resolved", { orgId: session.user.organizationId, alertId: id });
    return { ok: true, data: { id: alert.id } };
  } catch (error) {
    logger.error("Failed to resolve alert", {
      orgId: session.user.organizationId,
      alertId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to resolve alert" };
  }
}

/**
 * Get projects for filtering.
 */
export async function getAlertProjects() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const projects = await alertService.getProjects(session.user.organizationId);
    return projects;
  } catch (error) {
    logger.error("Failed to fetch projects", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get sources for filtering.
 */
export async function getAlertSources() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const sources = await alertService.getSources(session.user.organizationId);
    return sources;
  } catch (error) {
    logger.error("Failed to fetch sources", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get incidents for linking to alerts.
 */
export async function getAlertIncidents() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const incidents = await alertService.getIncidents(session.user.organizationId);
    return incidents;
  } catch (error) {
    logger.error("Failed to fetch incidents", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get users for assigning to alerts.
 */
export async function getAlertUsers() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const users = await alertService.getUsers(session.user.organizationId);
    return users;
  } catch (error) {
    logger.error("Failed to fetch users", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
