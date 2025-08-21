'use client';

import { useState, useEffect } from 'react';
import { Task, TaskPriority } from '@prisma/client';
import { format, formatDistanceToNow } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskModal } from './task-modal';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const priorityColors = {
  LOW: 'bg-gray-200 text-gray-700',
  MEDIUM: 'bg-blue-200 text-blue-700',
  HIGH: 'bg-orange-200 text-orange-700',
  CRITICAL: 'bg-red-200 text-red-700',
};

export function TaskList({ tasks, onTaskUpdate, onTaskDelete }: TaskListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    const newCompletedTasks = new Set(completedTasks);
    if (completed) {
      newCompletedTasks.add(taskId);
    } else {
      newCompletedTasks.delete(taskId);
    }
    setCompletedTasks(newCompletedTasks);
  };

  const getCountdown = (datetime: Date) => {
    return formatDistanceToNow(datetime, { addSuffix: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button onClick={() => setIsModalOpen(true)}>Add Task</Button>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start space-x-4 p-4 rounded-lg border ${completedTasks.has(task.id) ? 'bg-gray-50' : 'bg-white'}`}
            >
              <Checkbox
                checked={completedTasks.has(task.id)}
                onCheckedChange={(checked) => handleTaskComplete(task.id, checked as boolean)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3
                    className={`text-lg font-medium ${completedTasks.has(task.id) ? 'line-through text-gray-500' : ''}`}
                    onClick={() => handleTaskClick(task)}
                  >
                    {task.title}
                  </h3>
                  <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                </div>
                <div className="mt-1 text-sm text-gray-500 space-y-1">
                  <p>Origin: {format(task.originDatetime, 'PPpp')} ({task.originTimezone})</p>
                  <p>Local: {format(task.localDatetime, 'PPpp')} ({task.localTimezone})</p>
                  <p>Due {getCountdown(task.originDatetime)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={(updatedTask) => {
          onTaskUpdate(updatedTask);
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onDelete={selectedTask ? () => {
          onTaskDelete(selectedTask.id);
          setIsModalOpen(false);
          setSelectedTask(null);
        } : undefined}
      />
    </div>
  );
}