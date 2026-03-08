import { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Alert,
  Tag,
} from 'antd'
import {
  TeamOutlined,
  ProjectOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { reportsApi } from '../../api/reports'
import type { SummaryReport } from '../../api/reports'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function Dashboard() {
  const [report, setReport] = useState<SummaryReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    reportsApi.getLatest()
      .then((res) => setReport(res.data))
      .catch(() => setError('No report available yet. Worker 2 generates reports every 5 minutes.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <Spin size="large" />
    </div>
  )

  if (error || !report) return (
    <Alert
      type="info"
      message="Report Not Available"
      description={error}
      showIcon
    />
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">
          Last updated: {dayjs(report.generatedAt).format('DD MMM YYYY, HH:mm')}
        </Text>
      </div>

      {/* ─── Stat Cards ──────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={report.totalEmployees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Employees"
              value={report.activeEmployees}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={report.activeProjects}
              suffix={`/ ${report.totalProjects}`}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Leave Requests"
              value={report.pendingLeaveRequests}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* ─── Charts ──────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Department Headcount Bar Chart */}
        <Col xs={24} lg={14}>
          <Card title="Headcount by Department">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={report.departmentHeadcounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="departmentName"
                  tick={{ fontSize: 11 }}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1890ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Project Status Pie Chart */}
        <Col xs={24} lg={10}>
          <Card title="Project Status Breakdown">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: report.activeProjects },
                    {
                      name: 'Inactive',
                      value: report.totalProjects - report.activeProjects,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="#52c41a" />
                  <Cell fill="#f0f0f0" />
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ─── Project Progress Table ───────────────────────── */}
      <Card title="Project Progress">
        <Row gutter={[16, 16]}>
          {report.projectProgress.map((project) => {
            const percent = project.totalTasks === 0
              ? 0
              : Math.round((project.completedTasks / project.totalTasks) * 100)

            return (
              <Col xs={24} sm={12} lg={8} key={project.projectName}>
                <Card
                  size="small"
                  style={{ borderRadius: 8 }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8
                  }}>
                    <Text strong>{project.projectName}</Text>
                    <Tag color={
                      project.status === 'Active' ? 'green' :
                      project.status === 'Completed' ? 'blue' : 'orange'
                    }>
                      {project.status}
                    </Tag>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4
                  }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {project.completedTasks} / {project.totalTasks} tasks
                    </Text>
                    <Text style={{ fontSize: 12 }}>{percent}%</Text>
                  </div>
                  {/* Progress bar */}
                  <div style={{
                    background: '#f0f0f0',
                    borderRadius: 4,
                    height: 8
                  }}>
                    <div style={{
                      background: percent === 100 ? '#52c41a' : '#1890ff',
                      borderRadius: 4,
                      height: 8,
                      width: `${percent}%`,
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Card>
    </div>
  )
}
