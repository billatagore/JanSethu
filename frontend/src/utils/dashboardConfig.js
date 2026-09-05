export function getRoleDashboardConfig(role = 'student') {
  const normalizedRole = String(role || '').toLowerCase()

  const universityRoles = new Set(['student', 'researcher', 'mentor'])
  const industryRoles = new Set(['industry'])

  if (universityRoles.has(normalizedRole)) {
    return {
      title: 'University Dashboard',
      subtitle: 'Track societal issues, match talent, and mobilize student teams near your campus.',
      focusLabel: 'Campus and research focus',
      primaryAction: 'Explore nearby issues',
      cards: [
        { label: 'Open challenges', key: 'total_problems' },
        { label: 'Student teams', key: 'total_teams' },
        { label: 'Research-ready problems', key: 'total_solutions' },
        { label: 'Active contributors', key: 'total_users' },
      ],
    }
  }

  if (industryRoles.has(normalizedRole)) {
    return {
      title: 'Industry Dashboard',
      subtitle: 'Find local pain points, sponsor solutions, and connect with universities for implementation.',
      focusLabel: 'Partnership and implementation',
      primaryAction: 'Review problem map',
      cards: [
        { label: 'Problem clusters', key: 'total_problems' },
        { label: 'Implementation partners', key: 'total_teams' },
        { label: 'Prototype pipeline', key: 'total_solutions' },
        { label: 'Regional reach', key: 'total_users' },
      ],
    }
  }

  return {
    title: 'Community Dashboard',
    subtitle: 'See urgent issues in your area and connect citizens, NGOs, and local institutions.',
    focusLabel: 'Community action',
    primaryAction: 'View local map',
    cards: [
      { label: 'Local issues', key: 'total_problems' },
      { label: 'Volunteer groups', key: 'total_teams' },
      { label: 'Active solutions', key: 'total_solutions' },
      { label: 'Community reach', key: 'total_users' },
    ],
  }
}
