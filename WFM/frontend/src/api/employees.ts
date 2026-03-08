import client from './client'

export interface Employee {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  isActive: boolean
  departmentName: string
  designationName: string
  salary: number
  joiningDate: string
  phone?: string
  city?: string
  country?: string
  skills: string[]
  avatarUrl?: string
}

export interface EmployeeList {
  items: Employee[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateEmployeeDto {
  firstName: string
  lastName: string
  email: string
  departmentId: number
  designationId: number
  salary: number
  joiningDate: string
  phone?: string
  address?: string
  city?: string
  country?: string
  skills: string[]
  avatarUrl?: string
}

export const employeesApi = {
  getAll: (params: {
    page?: number
    pageSize?: number
    search?: string
    departmentId?: number
    isActive?: boolean
  }) => client.get<EmployeeList>('/api/v1/employees', { params }),

  getById: (id: number) =>
    client.get<Employee>(`/api/v1/employees/${id}`),

  create: (data: CreateEmployeeDto) =>
    client.post<Employee>('/api/v1/employees', data),

  update: (id: number, data: Partial<CreateEmployeeDto>) =>
    client.put<Employee>(`/api/v1/employees/${id}`, data),

  delete: (id: number) =>
    client.delete(`/api/v1/employees/${id}`),
}
