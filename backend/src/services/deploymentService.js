const { spawn } = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const path = require('path');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const Deployment = require('../models/Deployment');

const DEFAULT_DOCKERFILE = 'Dockerfile';
const DEFAULT_S3_PREFIX = 'deployments';

const getS3Client = () => {
  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error('AWS_REGION is not set');
  }

  return new S3Client({ region });
};

const appendLog = async (deploymentId, level, message) => {
  await Deployment.updateOne(
    { _id: deploymentId },
    { $push: { logs: { level, message, timestamp: new Date() } } }
  );
};

const updateStatus = async (deploymentId, status, setFields = {}) => {
  await Deployment.updateOne({ _id: deploymentId }, { $set: { status, ...setFields } });
};

const runCommand = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const proc = spawn(command, args, { ...options, shell: false });
    let stderr = '';
    proc.stdout.on('data', (data) => options.onStdout && options.onStdout(data.toString()));
    proc.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      options.onStderr && options.onStderr(text);
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) return resolve();
      const err = new Error(`${command} exited with code ${code}`);
      err.stderr = stderr;
      reject(err);
    });
  });

const cloneRepo = async ({ repoUrl, branch, workdir, deploymentId }) => {
  const args = ['clone', '--depth', '1'];
  if (branch) {
    args.push('--branch', branch);
  }
  args.push(repoUrl, workdir);

  await appendLog(deploymentId, 'info', `Cloning repository ${repoUrl}`);
  await runCommand('git', args, {
    onStdout: (line) => appendLog(deploymentId, 'info', line.trim()).catch(() => {}),
    onStderr: (line) => appendLog(deploymentId, 'warning', line.trim()).catch(() => {})
  });
};

const buildDockerImage = async ({ workdir, dockerfilePath, imageTag, deploymentId }) => {
  await appendLog(deploymentId, 'info', `Building Docker image ${imageTag}`);
  await runCommand(
    'docker',
    ['build', '-t', imageTag, '-f', dockerfilePath, '.'],
    {
      cwd: workdir,
      onStdout: (line) => appendLog(deploymentId, 'info', line.trim()).catch(() => {}),
      onStderr: (line) => appendLog(deploymentId, 'warning', line.trim()).catch(() => {})
    }
  );
};

const saveDockerImage = async ({ imageTag, outputPath, deploymentId }) => {
  await appendLog(deploymentId, 'info', `Saving Docker image ${imageTag} to tar`);
  await runCommand('docker', ['save', imageTag, '-o', outputPath], {
    onStdout: (line) => appendLog(deploymentId, 'info', line.trim()).catch(() => {}),
    onStderr: (line) => appendLog(deploymentId, 'warning', line.trim()).catch(() => {})
  });
};

const uploadToS3 = async ({ filePath, key, bucket, region, deploymentId }) => {
  const client = getS3Client();
  const stream = fs.createReadStream(filePath);
  await appendLog(deploymentId, 'info', `Uploading image to s3://${bucket}/${key}`);
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: stream,
    ContentType: 'application/x-tar'
  }));

  return { bucket, key, region };
};

const createSignedUrl = async ({ bucket, key, expiresInSeconds = 3600 }) => {
  const client = getS3Client();
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return { url, expiresAt: new Date(Date.now() + expiresInSeconds * 1000) };
};

const cleanup = async (dirPath) => {
  try {
    await fsp.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    // best-effort cleanup
  }
};

const runDeployment = async ({ deployment, project }) => {
  const deploymentId = deployment._id;
  const bucket = process.env.AWS_S3_BUCKET;
  const prefix = process.env.DEPLOYMENTS_S3_PREFIX || DEFAULT_S3_PREFIX;
  const dockerfilePath = deployment.build?.dockerfilePath || DEFAULT_DOCKERFILE;
  const imageTag = deployment.build?.imageTag || `doppler:${deploymentId}`;

  if (!bucket) {
    await updateStatus(deploymentId, 'failed', {
      error: { code: 'MISSING_S3_BUCKET', message: 'AWS_S3_BUCKET is not set' }
    });
    return;
  }

  const workdir = await fsp.mkdtemp(path.join(os.tmpdir(), 'doppler-'));
  const imageTarPath = path.join(workdir, `${deploymentId}.tar`);

  try {
    await updateStatus(deploymentId, 'building', {
      'build.startedAt': new Date(),
      'build.imageTag': imageTag,
      'build.dockerfilePath': dockerfilePath
    });
    await cloneRepo({
      repoUrl: project.repoUrl,
      branch: deployment.branch,
      workdir,
      deploymentId
    });
    await buildDockerImage({
      workdir,
      dockerfilePath,
      imageTag,
      deploymentId
    });

    await updateStatus(deploymentId, 'uploading');
    await saveDockerImage({ imageTag, outputPath: imageTarPath, deploymentId });

    const key = `${prefix}/${project.projectId}/${deploymentId}.tar`;
    const storage = await uploadToS3({ filePath: imageTarPath, key, bucket, region: process.env.AWS_REGION, deploymentId });
    const signed = await createSignedUrl({ bucket, key });

    await updateStatus(deploymentId, 'deploying', {
      storage: {
        provider: 's3',
        bucket: storage.bucket,
        key: storage.key,
        region: storage.region,
        signedUrlExpiresAt: signed.expiresAt
      },
      proxy: {
        targetUrl: signed.url,
        publicUrl: process.env.NGINX_PUBLIC_BASE_URL
          ? `${process.env.NGINX_PUBLIC_BASE_URL.replace(/\/$/, '')}/deployments/${deploymentId}.tar`
          : undefined
      }
    });

    await updateStatus(deploymentId, 'success', { 'build.finishedAt': new Date() });
    await appendLog(deploymentId, 'success', 'Deployment completed');
  } catch (error) {
    await appendLog(deploymentId, 'error', error.message);
    await updateStatus(deploymentId, 'failed', {
      error: {
        code: 'DEPLOYMENT_FAILED',
        message: error.message
      }
    });
  } finally {
    await cleanup(workdir);
  }
};

module.exports = {
  runDeployment,
  createSignedUrl
};
