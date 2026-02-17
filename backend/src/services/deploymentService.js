const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const DockerfileGenerator = require('./dockerfileGenerator');
const S3Service = require('./s3Service');

const execPromise = util.promisify(exec);

class DeploymentService {
  constructor() {
    this.s3Service = new S3Service();
    this.workDir = '/tmp/doppler-deployments';
  }

  async cloneRepository(repoUrl, projectId) {
    const projectPath = path.join(this.workDir, projectId);
    
    await fs.mkdir(projectPath, { recursive: true });
    await execPromise(`git clone ${repoUrl} ${projectPath}`);
    
    return projectPath;
  }

  async deploy(project) {
    try {
      const { projectId, repoUrl, framework, buildCommand, outputDir } = project;

      // Clone repository
      const projectPath = await this.cloneRepository(repoUrl, projectId);

      // Detect framework if not specified
      const detectedFramework = framework || await DockerfileGenerator.detectFramework(projectPath);

      // Generate Dockerfile
      await DockerfileGenerator.createDockerfile(
        projectPath,
        detectedFramework,
        buildCommand,
        outputDir
      );

      // Upload Dockerfile to S3
      const dockerfilePath = path.join(projectPath, 'Dockerfile');
      const dockerfileS3Url = await this.s3Service.uploadDockerfile(projectId, dockerfilePath);

      // Build Docker image and upload to S3
      const imageS3Url = await this.s3Service.buildAndUploadImage(projectPath, projectId);

      // Cleanup
      await fs.rm(projectPath, { recursive: true, force: true });

      return {
        success: true,
        dockerfileUrl: dockerfileS3Url,
        imageUrl: imageS3Url,
        framework: detectedFramework
      };
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }
}

module.exports = DeploymentService;