const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  async uploadDockerImage(projectId, imagePath) {
    try {
      const fileContent = await fs.readFile(imagePath);
      const key = `docker-images/${projectId}/${path.basename(imagePath)}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileContent,
        ContentType: 'application/x-tar'
      });

      await this.s3Client.send(command);
      return `s3://${this.bucketName}/${key}`;
    } catch (error) {
      throw new Error(`Failed to upload to S3: ${error.message}`);
    }
  }

  async uploadDockerfile(projectId, dockerfilePath) {
    try {
      const fileContent = await fs.readFile(dockerfilePath, 'utf8');
      const key = `dockerfiles/${projectId}/Dockerfile`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileContent,
        ContentType: 'text/plain'
      });

      await this.s3Client.send(command);
      return `s3://${this.bucketName}/${key}`;
    } catch (error) {
      throw new Error(`Failed to upload Dockerfile: ${error.message}`);
    }
  }

  async buildAndUploadImage(projectPath, projectId) {
    try {
      const imageName = `doppler-${projectId}`;
      const tarFile = `/tmp/${imageName}.tar`;

      // Build Docker image
      await execPromise(`docker build -t ${imageName} ${projectPath}`);

      // Save Docker image to tar
      await execPromise(`docker save -o ${tarFile} ${imageName}`);

      // Upload to S3
      const s3Url = await this.uploadDockerImage(projectId, tarFile);

      // Cleanup
      await fs.unlink(tarFile);
      await execPromise(`docker rmi ${imageName}`);

      return s3Url;
    } catch (error) {
      throw new Error(`Failed to build and upload image: ${error.message}`);
    }
  }
}

module.exports = S3Service;