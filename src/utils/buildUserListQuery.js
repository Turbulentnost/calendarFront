/**
 * DRY: параметры списка пользователей для /api/admin/users/
 */
export function buildUserListQuery(filters, page, pageSize) {
  return {
    q: filters.q,
    role: filters.role,
    job_title: filters.job_title,
    department: filters.department,
    page,
    page_size: pageSize,
  };
}
