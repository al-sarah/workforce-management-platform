import client from './client'

export interface ApprovalHistory {
  changedBy: string
  newStatus: string
  comment?: string
  changedAt: string
}

export interface LeaveRequest {
  id: string
  employeeId: number
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  status: string
  reason?: string
  approvalHistory: ApprovalHistory[]
}

export const leaveRequestsApi = {
  getAll: (params?: { status?: string; leaveType?: string }) =>
    client.get<LeaveRequest[]>('/api/v1/leaverequests', { params }),

  getByEmployee: (employeeId: number) =>
    client.get<LeaveRequest[]>(`/api/v1/leaverequests/employee/${employeeId}`),

  create: (data: Partial<LeaveRequest>) =>
    client.post<LeaveRequest>('/api/v1/leaverequests', data),

  updateStatus: (
    id: string,
    data: { newStatus: string; changedBy: string; comment?: string }
  ) => client.patch(`/api/v1/leaverequests/${id}/status`, data),
}
