import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all todos by userId=${userId}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: '#userId =:userId',
        ExpressionAttributeNames: {
          '#userId': 'userId'
        },
        ExpressionAttributeValues: {
          ':userId': userId
        }
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
      ExpressionAttributeNames: {
        '#todo_name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': todo.name,
        ':dueDate': todo.dueDate,
        ':done': todo.done
      },
      UpdateExpression:
        'set #todo_name = :name, dueDate = :dueDate, done = :done',
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
      ExpressionAttributeNames: {
        '#todo_attachmentUrl': 'attachmentUrl'
      },
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      },
      UpdateExpression: 'SET #todo_attachmentUrl = :attachmentUrl',
      ReturnValues: 'ALL_NEW'
    }

    await this.docClient.update(updatingItem).promise()
  }
}

function createDynamoDBClient(): DocumentClient {
  const service = new AWS.DynamoDB()
  const client = new AWS.DynamoDB.DocumentClient({
    service: service
  })
  AWSXRay.captureAWSClient(service)
  return client
}
