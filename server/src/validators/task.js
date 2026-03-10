const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const VALID_RECURRENCES = ['none', 'daily', 'weekly', 'monthly'];

function validateTaskInput(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate && (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0)) {
    errors.push('Title is required and must be a non-empty string');
  }
  if (data.title !== undefined && typeof data.title === 'string' && data.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (data.priority !== undefined && !VALID_PRIORITIES.includes(data.priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (data.due_date !== undefined && data.due_date !== null) {
    const date = new Date(data.due_date);
    if (isNaN(date.getTime())) {
      errors.push('due_date must be a valid date string');
    }
  }

  if (data.recurrence !== undefined && !VALID_RECURRENCES.includes(data.recurrence)) {
    errors.push(`recurrence must be one of: ${VALID_RECURRENCES.join(', ')}`);
  }

  if (data.recurrence_end !== undefined && data.recurrence_end !== null) {
    const date = new Date(data.recurrence_end);
    if (isNaN(date.getTime())) {
      errors.push('recurrence_end must be a valid date string');
    }
  }

  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push('tags must be an array of tag IDs');
    }
  }

  return errors;
}

function validateBatchInput(data) {
  const errors = [];

  if (!data.action || !['update_status', 'update_priority', 'delete'].includes(data.action)) {
    errors.push('action must be one of: update_status, update_priority, delete');
  }

  if (!data.ids || !Array.isArray(data.ids) || data.ids.length === 0) {
    errors.push('ids must be a non-empty array of task IDs');
  }

  if (data.action === 'update_status' && (!data.value || !VALID_STATUSES.includes(data.value))) {
    errors.push(`value must be one of: ${VALID_STATUSES.join(', ')} for update_status`);
  }

  if (data.action === 'update_priority' && (!data.value || !VALID_PRIORITIES.includes(data.value))) {
    errors.push(`value must be one of: ${VALID_PRIORITIES.join(', ')} for update_priority`);
  }

  return errors;
}

module.exports = { validateTaskInput, validateBatchInput, VALID_STATUSES, VALID_PRIORITIES };
