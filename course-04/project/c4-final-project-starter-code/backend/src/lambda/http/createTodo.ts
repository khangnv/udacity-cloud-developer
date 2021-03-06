import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../businessLogic/todosBusiness'
import { createLogger } from '../../utils/logger'

const logger = createLogger('CreateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', { event: event })

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    if (newTodo.name === undefined || newTodo.name === '') {
      logger.warn('Todo name is null or empty')
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: 'Todo name is required'
      }
    }
    const newItem = await createTodo(newTodo, userId)

    logger.info(`Creating a new todo for userId=${userId}`)
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ newItem })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
