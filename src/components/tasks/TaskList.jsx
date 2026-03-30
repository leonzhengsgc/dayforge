import TaskItem from './TaskItem'

export default function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No tasks yet. Add one above!
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
