import { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Select,
  Input,
  Button,
  Typography,
  message,
  Space,
  Alert,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { leaveRequestsApi } from '../../api/leaveRequests'
import { employeesApi } from '../../api/employees'
import type { Employee } from '../../api/employees'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

export default function SubmitLeaveRequest() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [dateError, setDateError] = useState<string | null>(null)

  useEffect(() => {
    employeesApi
      .getAll({ page: 1, pageSize: 100, isActive: true })
      .then((res) => setEmployees(res.data.items))
  }, [])

  const validateDates = () => {
    const startDate = form.getFieldValue('startDate')
    const endDate = form.getFieldValue('endDate')
    if (startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate))) {
      setDateError('End date must be after start date')
      return false
    }
    setDateError(null)
    return true
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (!validateDates()) return

      setLoading(true)

      const employee = employees.find((e) => e.id === values.employeeId)
      if (!employee) {
        message.error('Employee not found')
        return
      }

      await leaveRequestsApi.create({
        employeeId: values.employeeId,
        employeeName: employee.fullName,
        leaveType: values.leaveType,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        reason: values.reason,
      })

      message.success('Leave request submitted successfully')
      navigate('/leave-requests')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error('Failed to submit leave request')
    } finally {
      setLoading(false)
    }
  }

  // Calculate number of days when dates change
  const startDate = Form.useWatch('startDate', form)
  const endDate = Form.useWatch('endDate', form)
  const days = startDate && endDate
    ? dayjs(endDate).diff(dayjs(startDate), 'day') + 1
    : null

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/leave-requests')}
        style={{ marginBottom: 16 }}
      >
        Back to Leave Requests
      </Button>

      <Title level={4} style={{ marginBottom: 24 }}>
        Submit Leave Request
      </Title>

      <Card style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical">
          {/* Employee */}
          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select
              placeholder="Select employee"
              showSearch
              optionFilterProp="children"
            >
              {employees.map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.fullName} — {e.departmentName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Leave Type */}
          <Form.Item
            name="leaveType"
            label="Leave Type"
            rules={[{ required: true, message: 'Please select a leave type' }]}
          >
            <Select placeholder="Select leave type">
              <Option value="Annual">Annual Leave</Option>
              <Option value="Sick">Sick Leave</Option>
              <Option value="Casual">Casual Leave</Option>
              <Option value="Unpaid">Unpaid Leave</Option>
            </Select>
          </Form.Item>

          {/* Date Range */}
          <Form.Item label="Leave Period" required>
            <Space style={{ width: '100%' }} direction="vertical">
              <Space align="start">
                <Form.Item
                  name="startDate"
                  noStyle
                  rules={[{ required: true, message: 'Start date required' }]}
                >
                  <Input
                    type="date"
                    style={{ width: 180 }}
                    onChange={validateDates}
                  />
                </Form.Item>
                <Text type="secondary" style={{ lineHeight: '32px' }}>to</Text>
                <Form.Item
                  name="endDate"
                  noStyle
                  rules={[{ required: true, message: 'End date required' }]}
                >
                  <Input
                    type="date"
                    style={{ width: 180 }}
                    onChange={validateDates}
                  />
                </Form.Item>
              </Space>

              {/* Show calculated days */}
              {days !== null && days > 0 && !dateError && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {days} day{days > 1 ? 's' : ''} of leave
                </Text>
              )}

              {/* Date validation error */}
              {dateError && (
                <Alert
                  type="error"
                  message={dateError}
                  showIcon
                  style={{ padding: '4px 12px' }}
                />
              )}
            </Space>
          </Form.Item>

          {/* Reason */}
          <Form.Item name="reason" label="Reason (optional)">
            <TextArea
              rows={3}
              placeholder="Brief reason for your leave request"
            />
          </Form.Item>

          {/* Submit */}
          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                size="large"
              >
                Submit Request
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/leave-requests')}
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
