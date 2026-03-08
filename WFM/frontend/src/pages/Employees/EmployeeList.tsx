import { useCallback, useEffect, useState } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Typography,
  Card,
  Row,
  Col,
  Popconfirm,
  message,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { employeesApi } from '../../api/employees'
import type { Employee } from '../../api/employees'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select

export default function EmployeeList() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  // Filter state
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await employeesApi.getAll({
        page,
        pageSize,
        search: search || undefined,
        isActive,
      })
      setEmployees(res.data.items)
      setTotalCount(res.data.totalCount)
    } catch {
      message.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, isActive])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleDelete = async (id: number) => {
    try {
      await employeesApi.delete(id)
      message.success('Employee deactivated')
      fetchEmployees()
    } catch {
      message.error('Failed to deactivate employee')
    }
  }

  const columns: ColumnsType<Employee> = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.avatarUrl}
            icon={<UserOutlined />}
            size={36}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.fullName}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
    },
    {
      title: 'Designation',
      dataIndex: 'designationName',
      key: 'designationName',
    },
    {
      title: 'Joining Date',
      dataIndex: 'joiningDate',
      key: 'joiningDate',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
      sorter: (a, b) =>
        dayjs(a.joiningDate).unix() - dayjs(b.joiningDate).unix(),
    },
    {
      title: 'Skills',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <Space wrap>
          {skills.slice(0, 2).map((skill) => (
            <Tag key={skill} color="blue">{skill}</Tag>
          ))}
          {skills.length > 2 && (
            <Tag>+{skills.length - 2}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/employees/${record.id}`)}
          >
            View
          </Button>
          <Popconfirm
            title="Deactivate this employee?"
            description="This will soft-delete the employee record."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" size="small" danger>
              Deactivate
            </Button>
          </Popconfirm>
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
        marginBottom: 24
      }}>
        <Title level={4} style={{ margin: 0 }}>Employees</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/employees/create')}
        >
          Add Employee
        </Button>
      </div>

      {/* ─── Filters ─────────────────────────────────────── */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Input
              placeholder="Search by name or email"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => {
                setIsActive(value)
                setPage(1)
              }}
            >
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* ─── Table ───────────────────────────────────────── */}
      <Card>
        <Table
          columns={columns}
          dataSource={employees}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => navigate(`/employees/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            current: page,
            pageSize,
            total: totalCount,
            onChange: setPage,
            showTotal: (total) => `${total} employees`,
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  )
}
