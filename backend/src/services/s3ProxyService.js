const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class S3ProxyService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresIn
      });

      return signedUrl;
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  async getDockerImageUrl(projectId, filename) {
    const key = `docker-images/${projectId}/${filename}`;
    return await this.getSignedUrl(key);
  }

  async getDockerfileUrl(projectId) {
    const key = `dockerfiles/${projectId}/Dockerfile`;
    return await this.getSignedUrl(key);
  }

  async streamFromS3(key, res) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const response = await this.s3Client.send(command);
      
      res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
      res.setHeader('Content-Length', response.ContentLength);
      
      response.Body.pipe(res);
    } catch (error) {
      throw new Error(`Failed to stream from S3: ${error.message}`);
    }
  }
}

module.exports = S3ProxyService;