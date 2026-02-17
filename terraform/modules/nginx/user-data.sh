#!/bin/bash
set -e

# Update system
apt-get update
apt-get install -y build-essential libpcre3 libpcre3-dev zlib1g zlib1g-dev libssl-dev git awscli

# Install Nginx with AWS auth module
cd /tmp
git clone https://github.com/anomalizer/ngx_aws_auth.git
wget http://nginx.org/download/nginx-1.24.0.tar.gz
tar -xzf nginx-1.24.0.tar.gz
cd nginx-1.24.0

./configure \
  --prefix=/etc/nginx \
  --sbin-path=/usr/sbin/nginx \
  --modules-path=/usr/lib/nginx/modules \
  --conf-path=/etc/nginx/nginx.conf \
  --error-log-path=/var/log/nginx/error.log \
  --http-log-path=/var/log/nginx/access.log \
  --pid-path=/var/run/nginx.pid \
  --lock-path=/var/run/nginx.lock \
  --with-http_ssl_module \
  --with-http_v2_module \
  --add-module=/tmp/ngx_aws_auth

make
make install

# Create nginx user
useradd -r nginx || true

# Create systemd service
cat > /etc/systemd/system/nginx.service <<'EOF'
[Unit]
Description=Nginx HTTP Server
After=network.target

[Service]
Type=forking
PIDFile=/var/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Get AWS credentials from instance metadata
INSTANCE_PROFILE=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/)
AWS_CREDS=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/$INSTANCE_PROFILE)

# Create Nginx configuration
cat > /etc/nginx/nginx.conf <<'NGINXCONF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    server {
        listen 80;
        server_name _;

        location /images/ {
            proxy_pass https://${s3_bucket}.s3.${aws_region}.amazonaws.com/docker-images/;
            
            # AWS Signature V4
            aws_access_key $AWS_ACCESS_KEY_ID;
            aws_secret_key $AWS_SECRET_ACCESS_KEY;
            aws_s3_bucket ${s3_bucket};
            aws_sign;

            proxy_set_header Host ${s3_bucket}.s3.${aws_region}.amazonaws.com;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            proxy_buffering off;
            proxy_intercept_errors on;
        }

        location /dockerfiles/ {
            proxy_pass https://${s3_bucket}.s3.${aws_region}.amazonaws.com/dockerfiles/;
            
            # AWS Signature V4
            aws_access_key $AWS_ACCESS_KEY_ID;
            aws_secret_key $AWS_SECRET_ACCESS_KEY;
            aws_s3_bucket ${s3_bucket};
            aws_sign;

            proxy_set_header Host ${s3_bucket}.s3.${aws_region}.amazonaws.com;
            proxy_buffering off;
        }

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
NGINXCONF

# Start Nginx
systemctl daemon-reload
systemctl enable nginx
systemctl start nginx

echo "Nginx reverse proxy with AWS Signature V4 installed successfully"