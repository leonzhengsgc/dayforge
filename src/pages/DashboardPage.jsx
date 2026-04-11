import { useState } from 'react'
import AppShell from '../components/layout/AppShell'
import TaskPanel from '../components/tasks/TaskPanel'
import MonthlyCalendar from '../components/calendar/MonthlyCalendar'
import GoalsPanel from '../components/goals/GoalsPanel'
import LearningGoalsPanel from '../components/goals/LearningGoalsPanel'
import DailyLogModal from '../components/log/DailyLogModal'

export default function DashboardPage() {
  const [logDate, setLogDate] = useState(null)

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <TaskPanel scope="today" onViewDate={setLogDate} />
          <TaskPanel scope="tomorrow" />
        </div>
        <GoalsPanel />
        <LearningGoalsPanel />
        <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <MonthlyCalendar onDayClick={setLogDate} />
        </div>
      </div>
      {logDate && (
        <DailyLogModal
          dateStr={logDate}
          onClose={() => setLogDate(null)}
          onNavigate={setLogDate}
        />
      )}
    </AppShell>
  )
}
