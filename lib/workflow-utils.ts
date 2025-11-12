/**
 * Utility functions for workflow operations.
 * Provides helper functions for task type identification and manipulation.
 */

/**
 * Checks if a task type represents a dynamic fork.
 * Returns true for any task type containing "DYNAMIC" and related to forking.
 *
 * @param {string} taskType - The task type to check (e.g., "DYNAMIC_FORK", "FORK_JOIN_DYNAMIC")
 * @returns {boolean} True if the task type is a dynamic fork variant
 *
 * @example
 * ```ts
 * isDynamicForkType("DYNAMIC_FORK") // true
 * isDynamicForkType("FORK_JOIN_DYNAMIC") // true
 * isDynamicForkType("FORK_JOIN") // false
 * isDynamicForkType("WORKER") // false
 * ```
 */
export function isDynamicForkType(taskType: string | undefined): boolean {
  if (!taskType) return false
  return taskType.includes("DYNAMIC") && (taskType.includes("FORK") || taskType === "FORK_JOIN_DYNAMIC")
}

/**
 * Checks if a task type represents any fork variant (regular or dynamic).
 *
 * @param {string} taskType - The task type to check
 * @returns {boolean} True if the task type is any fork variant
 *
 * @example
 * ```ts
 * isForkType("FORK_JOIN") // true
 * isForkType("DYNAMIC_FORK") // true
 * isForkType("FORK_JOIN_DYNAMIC") // true
 * isForkType("WORKER") // false
 * ```
 */
export function isForkType(taskType: string | undefined): boolean {
  if (!taskType) return false
  return taskType === "FORK_JOIN" || taskType === "FORK_JOIN_DYNAMIC" || isDynamicForkType(taskType)
}
