import { describe, it, expect } from 'vitest'
import { getRoleDashboardConfig } from './dashboardConfig'

describe('getRoleDashboardConfig', () => {
  it('returns the university dashboard config for student and researcher roles', () => {
    expect(getRoleDashboardConfig('student').title).toBe('University Dashboard')
    expect(getRoleDashboardConfig('researcher').title).toBe('University Dashboard')
  })

  it('returns the industry dashboard config for industry roles', () => {
    expect(getRoleDashboardConfig('industry').title).toBe('Industry Dashboard')
  })

  it('returns the community dashboard config for citizen and other roles', () => {
    expect(getRoleDashboardConfig('citizen').title).toBe('Community Dashboard')
    expect(getRoleDashboardConfig('ngo').title).toBe('Community Dashboard')
  })
})
