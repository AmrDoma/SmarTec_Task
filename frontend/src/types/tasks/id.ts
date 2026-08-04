/** RFC 4122 UUID (any version) as returned by Django UUIDField. */
const TASK_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isTaskId(value: string | undefined): value is string {
  return typeof value === 'string' && TASK_ID_RE.test(value)
}
