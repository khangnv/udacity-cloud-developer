import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todosBusiness'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('DeleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', { event: event })

    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const userId = getUserId(event)

    logger.info(`Deleting todo item ${todoId} for user ${userId}`)
    await deleteTodo(userId, todoId)
    logger.info(`Deleted todo item ${todoId} for user ${userId}`)
    return {
      statusCode: 204,
      body: ''
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
