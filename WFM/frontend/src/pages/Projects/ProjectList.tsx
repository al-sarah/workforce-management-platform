import { useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Avatar,
  Space,
  Progress,
} from 'antd'
import {
  PlusOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../../api/projects'
import type { Project } from '../../api/projects'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input

const statusColor: Record<string, string> = {
  Active: 'green',
  OnHold: 'orange',
  Completed: 'blue',
}

export default function ProjectList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await projectsApi.getAll()
      setProjects(res.data)
    } catch {
      message.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await projectsApi.create({
        ...values,
        teamMemberIds: [],
        startDate: values.startDate
          ? new Date(values.startDate).toISOString()
          : new Date().toISOString(),
      })
      message.success('Project created')
      setModalOpen(false)
      form.resetFields()
      fetchProjects()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error('Failed to create project')
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <Spin size="large" />
    </div>
  )

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <Title level={4} style={{ margin: 0 }}>Projects</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* ─── Project Cards ───────────────────────────────── */}
      <Row gutter={[16, 16]}>
        {projects.map((project) => {
          const percent = project.totalTasks === 0
            ? 0
            : Math.round((project.completedTasks / project.totalTasks) * 100)

          return (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <Card
                hoverable
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{ height: '100%' }}
                actions={[
                  <Space key="team">
                    <TeamOutlined />
                    <span>{project.teamMembers.length} members</span>
                  </Space>,
                  <Space key="date">
                    <CalendarOutlined />
                    <span>{dayjs(project.startDate).format('MMM YYYY')}</span>
                  </Space>,
                ]}
              >
                {/* Status tag */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <Tag color={statusColor[project.status] || 'default'}>
                    {project.status}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {project.totalTasks} tasks
                  </Text>
                </div>

                {/* Project name */}
                <Title level={5} style={{ margin: '0 0 8px' }}>
                  {project.name}
                </Title>

                {/* Description */}
                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: 16,
                  }}
                >
                  {project.description || 'No description'}
                </Text>

                {/* Progress bar */}
                <Progress
                  percent={percent}
                  size="small"
                  status={percent === 100 ? 'success' : 'active'}
                  style={{ marginBottom: 12 }}
                />

                {/* Team avatars */}
                <Avatar.Group maxCount={4} size="small">
                  {project.teamMembers.map((member) => (
                    <Avatar
                      key={member.employeeId}
                      src={member.avatarUrl}
                      style={{ backgroundColor: '#1890ff' }}
                    >
                      {member.fullName.charAt(0)}
                    </Avatar>
                  ))}
                </Avatar.Group>
              </Card>
            </Col>
          )
        })}

        {projects.length === 0 && (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Text type="secondary">
                  No projects yet. Create your first project.
                </Text>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      {/* ─── Create Project Modal ────────────────────────── */}
      <Modal
        title="New Project"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        okText="Create"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Project name is required' }]}
          >
            <Input placeholder="e.g. Workforce Portal v2" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Brief description of the project"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: 'Start date is required' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
