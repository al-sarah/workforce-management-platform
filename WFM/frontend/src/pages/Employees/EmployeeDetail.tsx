import { useCallback, useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Tag,
  Tabs,
  Table,
  Timeline,
  Button,
  Spin,
  Alert,
  Space,
  Descriptions,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
} from 'antd'
import {
  UserOutlined,
  ArrowLeftOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { employeesApi } from '../../api/employees'
import type { Employee } from '../../api/employees'
import { leaveRequestsApi } from '../../api/leaveRequests'
import type { LeaveRequest } from '../../api/leaveRequests'
import client from '../../api/client'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
interface AuditLog {
  id: string
  eventType: string
  entityType: string
  entityId: string
  actor: string
  occurredAt: string
  before?: unknown
  after?: unknown
}

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [form] = Form.useForm()

  const fetchAll = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [empRes, leaveRes, auditRes] = await Promise.all([
        employeesApi.getById(Number(id)),
        leaveRequestsApi.getByEmployee(Number(id)),
        client.get<AuditLog[]>(`/api/v1/auditlogs?entityType=Employee&entityId=${id}`),
      ])
      setEmployee(empRes.data)
      setLeaveRequests(leaveRes.data)
      setAuditLogs(auditRes.data)
    } catch {
      message.error('Failed to load employee details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleEdit = () => {
    if (!employee) return
    form.setFieldsValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      salary: employee.salary,
      phone: employee.phone,
      city: employee.city,
      country: employee.country,
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields()
      await employeesApi.update(Number(id), values)
      message.success('Employee updated')
      setEditModalOpen(false)
      fetchAll()
    } catch {
      message.error('Failed to update employee')
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <Spin size="large" />
    </div>
  )

  if (!employee) return (
    <Alert type="error" message="Employee not found" />
  )

  // ─── Leave Requests Columns ───────────────────────────
  const leaveColumns: ColumnsType<LeaveRequest> = [
    {
      title: 'Type',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'Approved' ? 'green' :
          status === 'Rejected' ? 'red' : 'orange'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => reason || '—',
    },
  ]

  return (
    <div>
      {/* ─── Back Button ─────────────────────────────────── */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/employees')}
        style={{ marginBottom: 16 }}
      >
        Back to Employees
      </Button>

      {/* ─── Profile Card ────────────────────────────────── */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar
              src={employee.avatarUrl}
              icon={<UserOutlined />}
              size={80}
            />
          </Col>
          <Col flex={1}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {employee.fullName}
                </Title>
                <Text type="secondary">{employee.designationName}</Text>
                <br />
                <Tag
                  color={employee.isActive ? 'green' : 'red'}
                  style={{ marginTop: 8 }}
                >
                  {employee.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </div>
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 0]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{employee.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Department">{employee.departmentName}</Descriptions.Item>
              <Descriptions.Item label="Designation">{employee.designationName}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Salary">
                ${employee.salary.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Joining Date">
                {dayjs(employee.joiningDate).format('DD MMM YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="City">{employee.city || '—'}</Descriptions.Item>
              <Descriptions.Item label="Country">{employee.country || '—'}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {employee.skills.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ marginRight: 8 }}>Skills:</Text>
            <Space wrap>
              {employee.skills.map((skill) => (
                <Tag key={skill} color="blue">{skill}</Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Card>
        <Tabs
          items={[
            {
              key: 'leave',
              label: `Leave History (${leaveRequests.length})`,
              children: (
                <Table
                  columns={leaveColumns}
                  dataSource={leaveRequests}
                  rowKey="id"
                  size="small"
                  expandable={{
                    expandedRowRender: (record) => (
                      <div style={{ padding: '8px 16px' }}>
                        <Text strong>Approval History</Text>
                        <Timeline
                          style={{ marginTop: 12 }}
                          items={record.approvalHistory.map((h) => ({
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
                                  <Text type="secondary">{h.comment}</Text>
                                )}
                                <br />
                                <Text style={{ fontSize: 11, color: '#bbb' }}>
                                  {dayjs(h.changedAt).format('DD MMM YYYY HH:mm')}
                                </Text>
                              </div>
                            )
                          }))}
                        />
                      </div>
                    ),
                  }}
                  pagination={false}
                />
              ),
            },
            {
              key: 'audit',
              label: `Audit Trail (${auditLogs.length})`,
              children: (
                <Timeline
                  items={auditLogs.map((log) => ({
                    color: log.eventType.includes('Deleted') ? 'red' :
                           log.eventType.includes('Created') ? 'green' : 'blue',
                    children: (
                      <div>
                        <Text strong>{log.eventType}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          by {log.actor}
                        </Text>
                        <br />
                        <Text style={{ fontSize: 11, color: '#bbb' }}>
                          {dayjs(log.occurredAt).format('DD MMM YYYY HH:mm')}
                        </Text>
                      </div>
                    )
                  }))}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* ─── Edit Modal ──────────────────────────────────── */}
      <Modal
        title="Edit Employee"
        open={editModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalOpen(false)}
        okText="Save"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salary" label="Salary">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="City">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="Country">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
