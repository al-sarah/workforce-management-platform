import { useCallback, useEffect, useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Select,
  Row,
  Col,
  Typography,
  Timeline,
  Modal,
  Input,
  message,
  Space,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { leaveRequestsApi } from '../../api/leaveRequests'
import type { LeaveRequest } from '../../api/leaveRequests'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const statusColor: Record<string, string> = {
  Pending: 'orange',
  Approved: 'green',
  Rejected: 'red',
  Cancelled: 'default',
}

export default function LeaveRequestList() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string | undefined>()

  // Approval modal state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [approvalComment, setApprovalComment] = useState('')

  // History modal state
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyRequest, setHistoryRequest] = useState<LeaveRequest | null>(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await leaveRequestsApi.getAll({
        status: statusFilter,
        leaveType: leaveTypeFilter,
      })
      setRequests(res.data)
    } catch {
      message.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, leaveTypeFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleApprove = async (status: 'Approved' | 'Rejected') => {
    if (!selectedRequest) return
    try {
      await leaveRequestsApi.updateStatus(selectedRequest.id, {
        newStatus: status,
        changedBy: 'HR Manager',
        comment: approvalComment,
      })
      message.success(`Leave request ${status.toLowerCase()}`)
      setApprovalModalOpen(false)
      setApprovalComment('')
      fetchRequests()
    } catch {
      message.error('Failed to update status')
    }
  }

  const columns: ColumnsType<LeaveRequest> = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'From',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
    },
    {
      title: 'To',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
    },
    {
      title: 'Days',
      key: 'days',
      render: (_, record) => {
        const days = dayjs(record.endDate).diff(
          dayjs(record.startDate), 'day') + 1
        return `${days} day${days > 1 ? 's' : ''}`
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColor[status] || 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {/* View approval history inline */}
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              setHistoryRequest(record)
              setHistoryModalOpen(true)
            }}
          >
            History
          </Button>

          {/* Approve/Reject only for pending requests */}
          {record.status === 'Pending' && (
            <Button
              type="link"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedRequest(record)
                setApprovalModalOpen(true)
              }}
            >
              Review
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <Title level={4} style={{ margin: 0 }}>Leave Requests</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/leave-requests/submit')}
        >
          Submit Request
        </Button>
      </div>

      {/* ─── Filters ─────────────────────────────────────── */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              allowClear
              onChange={setStatusFilter}
            >
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter by leave type"
              style={{ width: '100%' }}
              allowClear
              onChange={setLeaveTypeFilter}
            >
              <Option value="Annual">Annual</Option>
              <Option value="Sick">Sick</Option>
              <Option value="Casual">Casual</Option>
              <Option value="Unpaid">Unpaid</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* ─── Table ───────────────────────────────────────── */}
      <Card>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `${total} requests`,
          }}
        />
      </Card>

      {/* ─── Approval History Modal ──────────────────────── */}
      <Modal
        title={`Approval History — ${historyRequest?.employeeName}`}
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        footer={null}
        width={480}
      >
        {historyRequest && (
          <Timeline
            style={{ marginTop: 16 }}
            items={historyRequest.approvalHistory.map((h) => ({
              color: h.newStatus === 'Approved' ? 'green' :
                     h.newStatus === 'Rejected' ? 'red' : 'blue',
              children: (
                <div>
                  <Text strong>{h.newStatus}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    by {h.changedBy}
                  </Text>
                  <br />
                  {h.comment && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {h.comment}
                    </Text>
                  )}
                  <br />
                  <Text style={{ fontSize: 11, color: '#bbb' }}>
                    {dayjs(h.changedAt).format('DD MMM YYYY HH:mm')}
                  </Text>
                </div>
              ),
            }))}
          />
        )}
      </Modal>

      {/* ─── Review / Approve Modal ──────────────────────── */}
      <Modal
        title={`Review Leave Request — ${selectedRequest?.employeeName}`}
        open={approvalModalOpen}
        onCancel={() => {
          setApprovalModalOpen(false)
          setApprovalComment('')
        }}
        footer={null}
        width={480}
      >
        {selectedRequest && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Leave Type: </Text>
                  <Tag color="blue">{selectedRequest.leaveType}</Tag>
                </div>
                <div>
                  <Text type="secondary">Period: </Text>
                  <Text>
                    {dayjs(selectedRequest.startDate).format('DD MMM YYYY')}
                    {' → '}
                    {dayjs(selectedRequest.endDate).format('DD MMM YYYY')}
                  </Text>
                </div>
                {selectedRequest.reason && (
                  <div>
                    <Text type="secondary">Reason: </Text>
                    <Text>{selectedRequest.reason}</Text>
                  </div>
                )}
              </Space>
            </Card>

            <Input.TextArea
              rows={3}
              placeholder="Add a comment (optional)"
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <Row gutter={8}>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  onClick={() => handleApprove('Approved')}
                >
                  Approve
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  danger
                  block
                  onClick={() => handleApprove('Rejected')}
                >
                  Reject
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}
