const fs = require('fs').promises;
const path = require('path');

class DockerfileGenerator {
  static async detectFramework(projectPath) {
    try {
      const packageJson = await fs.readFile(path.join(projectPath, 'package.json'), 'utf8');
      const pkg = JSON.parse(packageJson);
      
      if (pkg.dependencies?.next) return 'nextjs';
      if (pkg.dependencies?.react) return 'react';
      if (pkg.dependencies?.vue) return 'vue';
      if (pkg.dependencies?.angular) return 'angular';
      
      return 'node';
    } catch (error) {
      return 'static';
    }
  }

  static generateDockerfile(framework, buildCommand = 'npm run build', outputDir = 'build') {
    const dockerfiles = {
      react: `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN ${buildCommand}

FROM nginx:alpine
COPY --from=builder /app/${outputDir} /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,

      nextjs: `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN ${buildCommand}

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]`,

      vue: `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN ${buildCommand}

FROM nginx:alpine
COPY --from=builder /app/${outputDir} /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,

      node: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`,

      static: `FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`
    };

    return dockerfiles[framework] || dockerfiles.static;
  }

  static generateNginxConfig() {
    return `server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}`;
  }

  static async createDockerfile(projectPath, framework, buildCommand, outputDir) {
    const dockerfile = this.generateDockerfile(framework, buildCommand, outputDir);
    await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfile);
    
    if (['react', 'vue'].includes(framework)) {
      const nginxConfig = this.generateNginxConfig();
      await fs.writeFile(path.join(projectPath, 'nginx.conf'), nginxConfig);
    }
  }
}

module.exports = DockerfileGenerator;