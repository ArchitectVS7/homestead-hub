/**
 * Sync Conflict Resolver
 *
 * When a device goes offline and queues mutations, then another device
 * also edits the same resource while online, both changes target the same
 * entity. On re-connect the offline device replays its queue — potentially
 * overwriting the other device's work without warning.
 *
 * This module detects intra-queue conflicts (multiple mutations targeting
 * the same resource) and resolves them before the queue is drained, giving
 * the app an auditable conflict log and a consistent resolution strategy.
 *
 * Strategies
 * ----------
 * lastWriteWins  (default) — keep the most recently queued mutation.
 * firstWriteWins           — keep the earliest queued mutation.
 * serverWins               — discard all local mutations for the resource.
 *                            Use when the server state is authoritative and
 *                            you'd rather drop offline edits than risk clobber.
 */

export type ConflictResolutionStrategy = 'lastWriteWins' | 'firstWriteWins' | 'serverWins';

export interface QueuedMutation {
  action: string;
  data: any;
  timestamp: number;
}

export interface ConflictRecord {
  /** Human-readable resource key, e.g. "storage:42" */
  resourceKey: string;
  /** The action type of the winning mutation */
  action: string;
  strategy: ConflictResolutionStrategy;
  keptTimestamp: number;
  discardedTimestamps: number[];
}

/**
 * Derive a stable resource key from a mutation so we can detect when two
 * mutations target the same entity. Returns null for mutations that have no
 * explicit ID (e.g. "create" mutations before the server assigns an ID).
 */
export function getResourceKey(mutation: QueuedMutation): string | null {
  const d = mutation.data ?? {};
  const prefix = mutation.action.split('.')[0] ?? mutation.action;

  if (d.id != null) return `${prefix}:${d.id}`;
  if (d.equipmentId != null) return `equipment:${d.equipmentId}`;
  if (d.animalId != null) return `livestock:${d.animalId}`;
  if (d.plantingId != null) return `garden:${d.plantingId}`;

  return null;
}

/**
 * Analyse a flat list of queued mutations and return the de-conflicted set
 * plus an audit log of every conflict that was resolved.
 *
 * The returned `resolved` array is sorted by original timestamp so the
 * server receives mutations in chronological order.
 */
export function detectAndResolveConflicts(
  mutations: QueuedMutation[],
  strategy: ConflictResolutionStrategy = 'lastWriteWins',
): { resolved: QueuedMutation[]; conflicts: ConflictRecord[] } {
  const conflicts: ConflictRecord[] = [];

  // Bucket mutations by resource key. Mutations with no key (ID-less creates)
  // cannot conflict with each other and pass through unchanged.
  const byResource = new Map<string, QueuedMutation[]>();
  const unkeyed: QueuedMutation[] = [];

  for (const m of mutations) {
    const key = getResourceKey(m);
    if (key === null) {
      unkeyed.push(m);
    } else {
      const bucket = byResource.get(key);
      if (bucket) {
        bucket.push(m);
      } else {
        byResource.set(key, [m]);
      }
    }
  }

  const resolved: QueuedMutation[] = [...unkeyed];

  for (const [resourceKey, group] of byResource) {
    if (group.length === 1) {
      resolved.push(group[0]);
      continue;
    }

    // Sort chronologically (oldest first)
    const sorted = [...group].sort((a, b) => a.timestamp - b.timestamp);
    let winner: QueuedMutation | null;
    let losers: QueuedMutation[];

    switch (strategy) {
      case 'firstWriteWins':
        winner = sorted[0];
        losers = sorted.slice(1);
        break;
      case 'serverWins':
        winner = null; // Discard all local mutations for this resource
        losers = sorted;
        break;
      case 'lastWriteWins':
      default:
        winner = sorted[sorted.length - 1];
        losers = sorted.slice(0, -1);
        break;
    }

    const discardedTimestamps = losers.map((l) => l.timestamp);

    conflicts.push({
      resourceKey,
      action: (winner ?? losers[0]).action,
      strategy,
      keptTimestamp: winner?.timestamp ?? -1,
      discardedTimestamps,
    });

    if (winner !== null) {
      resolved.push(winner);
    }
  }

  // Restore chronological order across all resolved mutations
  resolved.sort((a, b) => a.timestamp - b.timestamp);

  return { resolved, conflicts };
}

/**
 * Returns true if any two mutations in the array target the same resource.
 * Useful as a quick pre-check before calling the full resolver.
 */
export function hasConflicts(mutations: QueuedMutation[]): boolean {
  const seen = new Set<string>();
  for (const m of mutations) {
    const key = getResourceKey(m);
    if (key === null) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}
