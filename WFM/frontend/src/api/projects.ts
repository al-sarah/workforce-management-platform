import client from './client'

export interface Project {
  id: number
  name: string
  description?: string
  status: string
  startDate: string
  endDate?: string
  teamMembers: {
    employeeId: number
    fullName: string
    avatarUrl?: string
  }[]
  totalTasks: number
  completedTasks: number
}

export interface Task {
  id: number
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  projectId: number
  assignedEmployeeId?: number
  assignedEmployeeName?: string
}

export const projectsApi = {
  getAll: () => client.get<Project[]>('/api/v1/projects'),
  getById: (id: number) => client.get<Project>(`/api/v1/projects/${id}`),
  create: (data: Partial<Project>) =>
    client.post<Project>('/api/v1/projects', data),
  update: (id: number, data: Partial<Project>) =>
    client.put<Project>(`/api/v1/projects/${id}`, data),
}

export const tasksApi = {
  getByProject: (projectId: number) =>
    client.get<Task[]>('/api/v1/tasks', { params: { projectId } }),
  create: (data: Partial<Task>) =>
    client.post<Task>('/api/v1/tasks', data),
  update: (id: number, data: Partial<Task>) =>
    client.put<Task>(`/api/v1/tasks/${id}`, data),
  delete: (id: number) => client.delete(`/api/v1/tasks/${id}`),
}
