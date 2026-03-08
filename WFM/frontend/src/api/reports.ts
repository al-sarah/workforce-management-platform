import client from './client'

export interface DepartmentHeadcount {
  departmentName: string
  count: number
}

export interface ProjectProgress {
  projectName: string
  status: string
  totalTasks: number
  completedTasks: number
}

export interface SummaryReport {
  id: string
  generatedAt: string
  totalEmployees: number
  activeEmployees: number
  totalProjects: number
  activeProjects: number
  pendingLeaveRequests: number
  departmentHeadcounts: DepartmentHeadcount[]
  projectProgress: ProjectProgress[]
}

export const reportsApi = {
  getLatest: () =>
    client.get<SummaryReport>('/api/v1/reports/summary/latest'),
}
