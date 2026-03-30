import AppShell from '../components/layout/AppShell'
import TaskPanel from '../components/tasks/TaskPanel'
import MonthlyCalendar from '../components/calendar/MonthlyCalendar'

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TaskPanel scope="today" />
          <TaskPanel scope="tomorrow" />
        </div>
        <MonthlyCalendar />
      </div>
    </AppShell>
  )
}
