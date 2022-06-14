import { TodosAccess } from './todosAccess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { getUserId } from '../lambda/utils'
import { TodoUpdate } from '../models/TodoUpdate'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodosByUserId(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  return await todosAccess.createTodo({
    todoId: todoId,
    userId: userId,
    name: createTodoRequest.name,
    done: false,
    createdAt: new Date().toISOString(),
    dueDate: createTodoRequest.dueDate
  })
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
  todoId: string
): Promise<TodoUpdate> {
  const updatingItem: TodoUpdate = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }
  return await todosAccess.updateTodo(updatingItem, userId, todoId)
}

export async function deleteTodo(userId: string, todoId: string) {
  await todosAccess.deleteTodo(userId, todoId)
}

export async function generateUploadUrl(
  userId: string,
  todoId: string
): Promise<string> {
  const presignedUrl = await attachmentUtils.getSignedUrl(todoId)
  const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
  return presignedUrl
}
