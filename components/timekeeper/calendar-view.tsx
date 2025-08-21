'use client';

import { useState, useEffect, useMemo } from 'react';
import { Task } from '@prisma/client';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { TaskModal } from './task-modal';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface CalendarViewProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DragAndDropCalendar = withDragAndDrop(Calendar);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  task: Task;
}

export function CalendarView({ tasks, onTaskUpdate, onTaskDelete }: CalendarViewProps) {
  const [view, setView] = useState(Views.MONTH);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [localTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  const events = useMemo(() => {
    return tasks.map((task) => {
      const start = utcToZonedTime(task.originDatetime, task.originTimezone);
      // Set end time to 1 hour after start for display purposes
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      
      return {
        id: task.id,
        title: task.title,
        start,
        end,
        task,
      };
    });
  }, [tasks]);

  const handleEventDrop = ({ event, start, end }: any) => {
    const task = event.task;
    const newOriginDate = zonedTimeToUtc(start, task.originTimezone);
    const newLocalDate = utcToZonedTime(newOriginDate, localTimezone);

    const updatedTask: Task = {
      ...task,
      originDatetime: newOriginDate,
      localDatetime: newLocalDate,
    };

    onTaskUpdate(updatedTask);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedTask(event.task);
    setIsModalOpen(true);
  };

  const handleSelectSlot = ({ start }: any) => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[800px] flex flex-col space-y-4">
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ flex: 1 }}
          defaultView={Views.MONTH}
          view={view}
          onView={setView}
          selectable
          resizable
          onEventDrop={handleEventDrop}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          eventPropGetter={(event: CalendarEvent) => ({
            className: `priority-${event.task.priority.toLowerCase()}`,
          })}
        />

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
    </DndProvider>
  );
}