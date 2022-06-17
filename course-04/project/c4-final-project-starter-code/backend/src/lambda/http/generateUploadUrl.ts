import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { generateUploadUrl } from '../../businessLogic/todosBusiness'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'

const logger = createLogger('GenerateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', { event: event })

    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)

    logger.info(
      `Generating an upload url of userId=${userId} with todoId=${todoId}`
    )
    const presignedUrl = await generateUploadUrl(userId, todoId)
    logger.info(
      `Generated an upload url of userId=${userId} with todoId=${todoId}`
    )
    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: presignedUrl })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
