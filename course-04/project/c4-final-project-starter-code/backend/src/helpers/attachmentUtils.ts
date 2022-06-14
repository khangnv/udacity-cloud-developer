import * as AWS from 'aws-sdk'
import { S3 } from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('AttachmentUtils')

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
  constructor(
    private readonly s3: S3 = createS3Client(),
    private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly s3SignedUrlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async getSignedUrl(todoId: string): Promise<string> {
    logger.info(`Creating an upload url for todo ${todoId}.`)

    const signedUrl: string = await this.s3.getSignedUrlPromise('putObject', {
      BucketName: this.s3BucketName,
      Key: todoId,
      Expires: parseInt(this.s3SignedUrlExpiration)
    })

    return signedUrl
  }

  getAttachmentUrl(todoId: string): string {
    logger.info(`Get attachment url for todo ${todoId}.`)
    return `https://${this.s3BucketName}.s3.amazonaws.com/${todoId}`
  }
}

function createS3Client(): S3 {
  return new XAWS.S3({
    signatureVersion: 'v4'
  })
}
