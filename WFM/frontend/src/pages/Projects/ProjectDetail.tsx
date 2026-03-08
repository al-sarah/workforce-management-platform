import { useCallback, useEffect, useState } from 'react'
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
  Select,
  message,
  Spin,
  Avatar,
  Tooltip,
  Space,
  Descriptions,
  Popconfirm,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { projectsApi, tasksApi } from '../../api/projects'
import type { Project, Task } from '../../api/projects'
import client from '../../api/client'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const TASK_STATUSES = ['Todo', 'InProgress', 'InReview', 'Done']

const statusColor: Record<string, string> = {
  Todo: 'default',
  InProgress: 'blue',
  InReview: 'orange',
  Done: 'green',
}

const priorityColor: Record<string, string> = {
  Low: 'green',
  Medium: 'blue',
  High: 'orange',
  Critical: 'red',
}

interface Employee {
  id: number
  fullName: string
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [form] = Form.useForm()

  const fetchAll = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [projectRes, tasksRes, empRes] = await Promise.all([
        projectsApi.getById(Number(id)),
        tasksApi.getByProject(Number(id)),
        client.get<{ items: Employee[] }>('/api/v1/employees?pageSize=100'),
      ])
      setProject(projectRes.data)
      setTasks(tasksRes.data)
      setEmployees(empRes.data.items)
    } catch {
      message.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleCreateTask = async () => {
    try {
      const values = await form.validateFields()
      await tasksApi.create({
        ...values,
        projectId: Number(id),
      })
      message.success('Task created')
      setTaskModalOpen(false)
      form.resetFields()
      fetchAll()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error('Failed to create task')
    }
  }

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    try {
      await tasksApi.update(taskId, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedEmployeeId: task.assignedEmployeeId,
      })
      message.success('Task status updated')
      fetchAll()
    } catch {
      message.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await tasksApi.delete(taskId)
      message.success('Task deleted')
      fetchAll()
    } catch {
      message.error('Failed to delete task')
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <Spin size="large" />
    </div>
  )

  if (!project) return (
    <div>Project not found</div>
  )

  // Group tasks by status for the kanban board
  const tasksByStatus = TASK_STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status)
    return acc
  }, {} as Record<string, Task[]>)

  return (
    <div>
      {/* ─── Back Button ─────────────────────────────────── */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/projects')}
        style={{ marginBottom: 16 }}
      >
        Back to Projects
      </Button>

      {/* ─── Project Info ────────────────────────────────── */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>{project.name}</Title>
            <Text type="secondary">{project.description}</Text>
          </div>
          <Tag color={
            project.status === 'Active' ? 'green' :
            project.status === 'Completed' ? 'blue' : 'orange'
          } style={{ fontSize: 14, padding: '4px 12px' }}>
            {project.status}
          </Tag>
        </div>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Start Date">
                {dayjs(project.startDate).format('DD MMM YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {project.endDate
                  ? dayjs(project.endDate).format('DD MMM YYYY')
                  : 'Ongoing'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              Team Members
            </Text>
            <Avatar.Group maxCount={6}>
              {project.teamMembers.map((member) => (
                <Tooltip key={member.employeeId} title={member.fullName}>
                  <Avatar
                    src={member.avatarUrl}
                    style={{ backgroundColor: '#1890ff' }}
                  >
                    {member.fullName.charAt(0)}
                  </Avatar>
                </Tooltip>
              ))}
            </Avatar.Group>
          </Col>
        </Row>
      </Card>

      {/* ─── Task Board Header ───────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <Title level={5} style={{ margin: 0 }}>
          Task Board ({tasks.length} tasks)
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setTaskModalOpen(true)}
        >
          Add Task
        </Button>
      </div>

      {/* ─── Kanban Board ────────────────────────────────── */}
      <Row gutter={[12, 12]}>
        {TASK_STATUSES.map((status) => (
          <Col xs={24} sm={12} lg={6} key={status}>
            <Card
              title={
                <Space>
                  <Tag color={statusColor[status]}>{status}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {tasksByStatus[status].length}
                  </Text>
                </Space>
              }
              style={{
                background: '#fafafa',
                minHeight: 400,
              }}
              bodyStyle={{ padding: '8px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {tasksByStatus[status].map((task) => (
                  <Card
                    key={task.id}
                    size="small"
                    style={{
                      borderRadius: 6,
                      borderLeft: `3px solid ${
                        priorityColor[task.priority] === 'red' ? '#ff4d4f' :
                        priorityColor[task.priority] === 'orange' ? '#fa8c16' :
                        priorityColor[task.priority] === 'blue' ? '#1890ff' :
                        '#52c41a'
                      }`,
                    }}
                  >
                    {/* Task title */}
                    <Text strong style={{ fontSize: 13 }}>
                      {task.title}
                    </Text>

                    {/* Description */}
                    {task.description && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 11,
                          display: 'block',
                          marginTop: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.description}
                      </Text>
                    )}

                    {/* Priority + due date */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 8,
                    }}>
                      <Tag
                        color={priorityColor[task.priority]}
                        style={{ fontSize: 10, margin: 0 }}
                      >
                        {task.priority}
                      </Tag>
                      {task.dueDate && (
                        <Text style={{ fontSize: 10, color: '#999' }}>
                          {dayjs(task.dueDate).format('DD MMM')}
                        </Text>
                      )}
                    </div>

                    {/* Assigned employee */}
                    {task.assignedEmployeeName && (
                      <div style={{ marginTop: 8 }}>
                        <Avatar
                          size={18}
                          style={{
                            backgroundColor: '#1890ff',
                            fontSize: 10,
                            marginRight: 4,
                          }}
                        >
                          {task.assignedEmployeeName.charAt(0)}
                        </Avatar>
                        <Text style={{ fontSize: 11, color: '#666' }}>
                          {task.assignedEmployeeName}
                        </Text>
                      </div>
                    )}

                    {/* Move status buttons */}
                    <div style={{ marginTop: 8 }}>
                      <Select
                        size="small"
                        value={task.status}
                        style={{ width: '100%', fontSize: 11 }}
                        onChange={(val) => handleStatusChange(task.id, val)}
                      >
                        {TASK_STATUSES.map((s) => (
                          <Option key={s} value={s}>{s}</Option>
                        ))}
                      </Select>
                    </div>

                    {/* Delete */}
                    <div style={{ marginTop: 6, textAlign: 'right' }}>
                      <Popconfirm
                        title="Delete this task?"
                        onConfirm={() => handleDeleteTask(task.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="link"
                          danger
                          size="small"
                          style={{ padding: 0, fontSize: 11 }}
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    </div>
                  </Card>
                ))}

                {tasksByStatus[status].length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px 0',
                    color: '#ccc',
                    fontSize: 12,
                  }}>
                    No tasks
                  </div>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Create Task Modal ───────────────────────────── */}
      <Modal
        title="Add Task"
        open={taskModalOpen}
        onOk={handleCreateTask}
        onCancel={() => {
          setTaskModalOpen(false)
          form.resetFields()
        }}
        okText="Create"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input placeholder="e.g. Build login page" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Optional description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" initialValue="Medium">
                <Select>
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label="Due Date">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="assignedEmployeeId" label="Assign To">
            <Select
              placeholder="Select employee"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {employees.map((e) => (
                <Option key={e.id} value={e.id}>{e.fullName}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
