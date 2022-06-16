import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosByUserId } from '../../helpers/todosBusiness'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'

const logger = createLogger('GetTodos')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', { event: event })

    const userId = getUserId(event)
    // Write your code here
    logger.info(`Getting all todos for user ${userId}`)
    const todos = await getTodosByUserId(userId)
    if (todos === undefined) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todos does not exist'
        })
      }
    }
    logger.info(`There are ${todos.length} todo items for user ${userId}`)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: todos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
