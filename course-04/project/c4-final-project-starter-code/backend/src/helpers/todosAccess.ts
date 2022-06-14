import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosTableIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all todos by userId=${userId}`)

    const userExists = await this.isUserExists(userId)
    if (!userExists) {
      logger.error(`The userId ${userId} does not exist.`)
      return undefined
    }

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosTableIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Create a new todo item.')
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()
    logger.info(`A new todo item created with todoId=${todo.todoId}`)

    return todo
  }

  async updateTodo(
    todo: TodoUpdate,
    userId: string,
    todoId: string
  ): Promise<TodoUpdate> {
    logger.info(`Updating todo item ${todoId} with user ${userId}`)

    const updatingItem = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      ExpressionAttributeValues: {
        ':name': todo.name,
        ':dueDate': todo.dueDate,
        ':done': todo.done
      },
      UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
      ReturnValues: 'ALL_NEW'
    }

    const result = await this.docClient.update(updatingItem).promise()
    logger.info(`Finished updating todo item ${todoId} with user ${userId}`)

    return result.Attributes as TodoUpdate
  }

  async deleteTodo(userId: string, todoId: string) {
    logger.info(`Deleting todo item ${todoId} with user ${userId}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      })
      .promise()

    logger.info(`Finished deleting todo item ${todoId} with user ${userId}`)
  }

  async updateAttachmentUrl(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ) {
    const updatingItem = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ReturnValues: 'ALL_NEW'
    }

    await this.docClient.update(updatingItem).promise()
  }

  async isUserExists(userId: string) {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          id: userId
        }
      })
      .promise()
    return !!result.Item
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new AWS.DynamoDB.DocumentClient()
}
