import { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Typography,
  message,
  Space,
  Tag,
} from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { employeesApi } from '../../api/employees'
import client from '../../api/client'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select

interface Department {
  id: number
  name: string
}

interface Designation {
  id: number
  name: string
}

export default function CreateEmployee() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])

  // Skills tag input state
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    Promise.all([
      client.get<Department[]>('/api/v1/departments'),
      client.get<Designation[]>('/api/v1/designations'),
    ]).then(([deptRes, desigRes]) => {
      setDepartments(deptRes.data)
      setDesignations(desigRes.data)
    })
  }, [])

  const handleAddSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setSkillInput('')
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      await employeesApi.create({
        ...values,
        skills,
        joiningDate: values.joiningDate
          ? dayjs(values.joiningDate).toISOString()
          : new Date().toISOString(),
      })

      message.success('Employee created successfully')
      navigate('/employees')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) {
        // Form validation error — Ant Design handles display
        return
      }
      message.error('Failed to create employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/employees')}
        style={{ marginBottom: 16 }}
      >
        Back to Employees
      </Button>

      <Title level={4} style={{ marginBottom: 24 }}>Add New Employee</Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 800 }}
        >
          {/* ─── Personal Info ──────────────────────────── */}
          <Title level={5} style={{ marginBottom: 16 }}>
            Personal Information
          </Title>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input placeholder="e.g. Sarah" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Last name is required' }]}
              >
                <Input placeholder="e.g. Johnson" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder="e.g. sarah.johnson@company.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="e.g. +65 91234567" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="avatarUrl" label="Avatar URL">
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="address" label="Address">
                <Input placeholder="Street address" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="city" label="City">
                <Input placeholder="e.g. Singapore" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="country" label="Country">
                <Input placeholder="e.g. Singapore" />
              </Form.Item>
            </Col>
          </Row>

          {/* ─── Job Info ───────────────────────────────── */}
          <Title level={5} style={{ margin: '16px 0' }}>
            Job Information
          </Title>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="departmentId"
                label="Department"
                rules={[{ required: true, message: 'Department is required' }]}
              >
                <Select placeholder="Select department">
                  {departments.map((d) => (
                    <Option key={d.id} value={d.id}>{d.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="designationId"
                label="Designation"
                rules={[{ required: true, message: 'Designation is required' }]}
              >
                <Select placeholder="Select designation">
                  {designations.map((d) => (
                    <Option key={d.id} value={d.id}>{d.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="salary"
                label="Monthly Salary (USD)"
                rules={[{ required: true, message: 'Salary is required' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  placeholder="e.g. 5000"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="joiningDate"
                label="Joining Date"
                rules={[{ required: true, message: 'Joining date is required' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          {/* ─── Skills ─────────────────────────────────── */}
          <Title level={5} style={{ margin: '16px 0' }}>
            Skills
          </Title>

          <Form.Item label="Add Skills">
            <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
              <Input
                placeholder="Type a skill and press Add"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onPressEnter={handleAddSkill}
                style={{ maxWidth: 300 }}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddSkill}
              >
                Add
              </Button>
            </Space.Compact>

            {/* Display added skills as removable tags */}
            <Space wrap>
              {skills.map((skill) => (
                <Tag
                  key={skill}
                  color="blue"
                  closable
                  onClose={() => handleRemoveSkill(skill)}
                >
                  {skill}
                </Tag>
              ))}
              {skills.length === 0 && (
                <span style={{ color: '#bbb', fontSize: 13 }}>
                  No skills added yet
                </span>
              )}
            </Space>
          </Form.Item>

          {/* ─── Submit ─────────────────────────────────── */}
          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                size="large"
              >
                Create Employee
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/employees')}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
