export function canViewUsersPage(user) {
  if (!user) return false;
  return (
    user.is_superuser ||
    user.is_staff ||
    Number(user.role) === 0 ||
    Number(user.role) === 1
  );
}

export const canViewAllProjectsPage = canViewUsersPage;
