#!/bin/bash
set -e

apt-get update
apt-get install -y nginx-full lua-nginx-string lua-nginx-redis awscli

# Install lua-resty-aws-auth
cd /tmp
git clone https://github.com/paragasu/lua-resty-aws-auth.git
cp -r lua-resty-aws-auth/lib/resty /usr/share/lua/5.1/

# Create Nginx configuration with Lua
cat > /etc/nginx/nginx.conf <<'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    sendfile on;
    keepalive_timeout 65;

    # Lua package path
    lua_package_path "/usr/share/lua/5.1/?.lua;;";

    server {
        listen 80;
        server_name _;

        set $s3_bucket '${s3_bucket}';
        set $aws_region '${aws_region}';

        location ~ ^/images/(.+)$ {
            set $s3_key docker-images/$1;
            
            access_by_lua_block {
                local aws = require "resty.aws-auth"
                local credentials = aws.get_credentials()
                
                local signature = aws.s3_sign(
                    ngx.var.s3_bucket,
                    ngx.var.s3_key,
                    ngx.var.aws_region,
                    credentials.access_key,
                    credentials.secret_key,
                    credentials.token
                )
                
                ngx.req.set_header("Authorization", signature)
                ngx.req.set_header("x-amz-security-token", credentials.token)
            }

            proxy_pass https://$s3_bucket.s3.$aws_region.amazonaws.com/$s3_key;
            proxy_set_header Host $s3_bucket.s3.$aws_region.amazonaws.com;
        }

        location ~ ^/dockerfiles/(.+)$ {
            set $s3_key dockerfiles/$1;
            
            access_by_lua_block {
                local aws = require "resty.aws-auth"
                local credentials = aws.get_credentials()
                
                local signature = aws.s3_sign(
                    ngx.var.s3_bucket,
                    ngx.var.s3_key,
                    ngx.var.aws_region,
                    credentials.access_key,
                    credentials.secret_key,
                    credentials.token
                )
                
                ngx.req.set_header("Authorization", signature)
                ngx.req.set_header("x-amz-security-token", credentials.token)
            }

            proxy_pass https://$s3_bucket.s3.$aws_region.amazonaws.com/$s3_key;
            proxy_set_header Host $s3_bucket.s3.$aws_region.amazonaws.com;
        }

        location /health {
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

systemctl restart nginx
echo "Nginx with Lua AWS Signature V4 configured"