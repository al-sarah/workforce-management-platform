import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Select,
  Row,
  Col,
  Typography,
  message,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { Option } = Select

interface AuditLog {
  id: string
  eventType: string
  entityType: string
  entityId: string
  actor: string
  occurredAt: string
}

const eventColor: Record<string, string> = {
  EmployeeCreated: 'green',
  EmployeeUpdated: 'blue',
  EmployeeDeleted: 'red',
  LeaveRequestStatusChanged: 'orange',
  ProjectStatusChanged: 'purple',
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [entityTypeFilter, setEntityTypeFilter] = useState<string | undefined>()
  const navigate = useNavigate()

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = entityTypeFilter
        ? `?entityType=${entityTypeFilter}`
        : ''
      const res = await client.get<AuditLog[]>(`/api/v1/auditlogs${params}`)
      setLogs(res.data)
    } catch {
      message.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [entityTypeFilter])

  const columns: ColumnsType<AuditLog> = [
    {
      title: 'Event',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (type) => (
        <Tag color={eventColor[type] || 'default'}>{type}</Tag>
      ),
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      render: (id, record) => (
        <a onClick={() => {
          if (record.entityType === 'Employee') {
            navigate(`/employees/${id}`)
          }
        }}>
          {id}
        </a>
      ),
    },
    {
      title: 'Actor',
      dataIndex: 'actor',
      key: 'actor',
    },
    {
      title: 'Time',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      render: (d) => dayjs(d).format('DD MMM YYYY HH:mm:ss'),
      sorter: (a, b) =>
        dayjs(a.occurredAt).unix() - dayjs(b.occurredAt).unix(),
      defaultSortOrder: 'descend',
    },
  ]

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <Title level={4} style={{ margin: 0 }}>Audit Logs</Title>
      </div>

      {/* ─── Filters ─────────────────────────────────────── */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter by entity type"
              style={{ width: '100%' }}
              allowClear
              onChange={setEntityTypeFilter}
            >
              <Option value="Employee">Employee</Option>
              <Option value="LeaveRequest">Leave Request</Option>
              <Option value="Project">Project</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* ─── Table ───────────────────────────────────────── */}
      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `${total} log entries`,
          }}
        />
      </Card>
    </div>
  )
}
