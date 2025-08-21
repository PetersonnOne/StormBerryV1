'use client';

import { useState, useEffect } from 'react';
import { Task, TaskPriority, NotificationType } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (task: Task) => void;
  onDelete?: () => void;
}

interface ReminderInput {
  offsetMinutes: number;
  type: NotificationType;
}

interface TaskInput {
  title: string;
  description: string;
  originTimezone: string;
  originDatetime: string;
  priority: TaskPriority;
  tags: string;
  recurrenceRule: string;
  reminders: ReminderInput[];
}

export function TaskModal({ isOpen, onClose, task, onSave, onDelete }: TaskModalProps) {
  const [timezones] = useState(() => Intl.supportedValuesOf('timeZone'));
  const [localTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [convertedTime, setConvertedTime] = useState<string>('');
  
  const { register, handleSubmit, watch, setValue, reset } = useForm<TaskInput>({
    defaultValues: task ? {
      title: task.title,
      description: task.description || '',
      originTimezone: task.originTimezone,
      originDatetime: format(task.originDatetime, "yyyy-MM-dd'T'HH:mm"),
      priority: task.priority,
      tags: task.tags ? JSON.stringify(task.tags) : '',
      recurrenceRule: task.recurrenceRule || '',
      reminders: []
    } : {
      title: '',
      description: '',
      originTimezone: localTimezone,
      originDatetime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      priority: TaskPriority.MEDIUM,
      tags: '',
      recurrenceRule: '',
      reminders: []
    }
  });

  const originTimezone = watch('originTimezone');
  const originDatetime = watch('originDatetime');

  useEffect(() => {
    if (originDatetime && originTimezone) {
      const utcDate = zonedTimeToUtc(originDatetime, originTimezone);
      const localDate = utcToZonedTime(utcDate, localTimezone);
      setConvertedTime(format(localDate, 'PPpp'));
    }
  }, [originDatetime, originTimezone, localTimezone]);

  const onSubmit = async (data: TaskInput) => {
    const utcOriginDate = zonedTimeToUtc(data.originDatetime, data.originTimezone);
    const localDate = utcToZonedTime(utcOriginDate, localTimezone);

    const taskData = {
      ...task,
      title: data.title,
      description: data.description,
      originTimezone: data.originTimezone,
      originDatetime: utcOriginDate,
      localTimezone,
      localDatetime: localDate,
      priority: data.priority,
      tags: data.tags ? JSON.parse(data.tags) : null,
      recurrenceRule: data.recurrenceRule || null,
    } as Task;

    onSave(taskData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originTimezone">Origin Timezone</Label>
              <Select
                value={originTimezone}
                onValueChange={(value) => setValue('originTimezone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="originDatetime">Date & Time</Label>
              <Input
                id="originDatetime"
                type="datetime-local"
                {...register('originDatetime', { required: true })}
              />
            </div>
          </div>

          {convertedTime && (
            <div className="text-sm text-gray-500">
              Local time: {convertedTime}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={watch('priority')}
              onValueChange={(value) => setValue('priority', value as TaskPriority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TaskPriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (JSON array)</Label>
            <Input id="tags" {...register('tags')} placeholder='["work", "important"]' />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrenceRule">Recurrence Rule</Label>
            <Input
              id="recurrenceRule"
              {...register('recurrenceRule')}
              placeholder="FREQ=WEEKLY;BYDAY=MO,WE,FR"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}