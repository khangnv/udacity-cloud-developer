import { TodosAccess } from './todosAccess'
import { FileAccess } from './fileAccess'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { createLogger } from '../utils/logger'

// TODO: Implement businessLogic
const logger = createLogger('TodosBusiness')
const todosAccess = new TodosAccess()
const fileAccess = new FileAccess()

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
  logger.info(`Getting todos by userId=${userId}`)
  return todosAccess.getTodosByUserId(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info(`Creating a new todo of userId=${userId}`)

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
  logger.info(`Updating a todo of userId=${userId} with todoId=${todoId}`)

  const updatingItem: TodoUpdate = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }
  return await todosAccess.updateTodo(updatingItem, userId, todoId)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`Deleting a todo of userId=${userId} with todoId=${todoId}`)
  await todosAccess.deleteTodo(userId, todoId)
}

export async function generateUploadUrl(
  userId: string,
  todoId: string
): Promise<string> {
  logger.info(
    `Generating an upload url a todo of userId=${userId} with todoId=${todoId}`
  )

  const presignedUrl = await fileAccess.getSignedUrl(todoId)
  const attachmentUrl = fileAccess.getAttachmentUrl(todoId)
  await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)

  logger.info(`Generated an upload url: ${presignedUrl}`)
  return presignedUrl
}
