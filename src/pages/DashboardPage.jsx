import AppShell from '../components/layout/AppShell'
import TaskPanel from '../components/tasks/TaskPanel'
import MonthlyCalendar from '../components/calendar/MonthlyCalendar'

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <TaskPanel scope="today" />
          <TaskPanel scope="tomorrow" />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <MonthlyCalendar />
        </div>
      </div>
    </AppShell>
  )
}
