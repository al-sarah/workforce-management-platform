import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  CalendarOutlined,
  AuditOutlined,
} from '@ant-design/icons'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard'
import EmployeeList from './pages/Employees/EmployeeList'
import EmployeeDetail from './pages/Employees/EmployeeDetail'
import CreateEmployee from './pages/Employees/CreateEmployee'
import ProjectList from './pages/Projects/ProjectList'
import ProjectDetail from './pages/Projects/ProjectDetail'
import LeaveRequestList from './pages/LeaveRequests/LeaveRequestList'
import SubmitLeaveRequest from './pages/LeaveRequests/SubmitLeaveRequest'
import AuditLogs from './pages/AuditLogs/AuditLogs'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/employees',
    icon: <TeamOutlined />,
    label: 'Employees',
  },
  {
    key: '/projects',
    icon: <ProjectOutlined />,
    label: 'Projects',
  },
  {
    key: '/leave-requests',
    icon: <CalendarOutlined />,
    label: 'Leave Requests',
  },
  {
    key: '/audit-logs',
    icon: <AuditOutlined />,
    label: 'Audit Logs',
  },
]

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ─── Sidebar ─────────────────────────────────────── */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: '#001529' }}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold',
          borderBottom: '1px solid #002140'
        }}>
          WFM Platform
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        {/* ─── Header ────────────────────────────────────── */}
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          fontSize: 16,
          fontWeight: 500,
          color: '#333'
        }}>
          Workforce Management Platform
        </Header>

        {/* ─── Main Content ──────────────────────────────── */}
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/create" element={<CreateEmployee />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/leave-requests" element={<LeaveRequestList />} />
            <Route path="/leave-requests/submit" element={<SubmitLeaveRequest />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}
