# Nginx Reverse Proxy with AWS Signature V4 for Private S3

## Architecture

```
User Request → Nginx (Port 80) → AWS Signature V4 → Private S3 Bucket
```

## Features

- Private S3 bucket access via Nginx
- AWS Signature V4 authentication
- IAM role-based credentials
- Automatic credential refresh
- Secure image and Dockerfile serving

## Deployment

### Option 1: Terraform (Recommended)

```bash
cd terraform
terraform apply
```

This creates:
- Nginx EC2 instance with AWS auth module
- IAM role with S3 read permissions
- Security group (ports 80, 443, 22)
- Private S3 bucket

### Option 2: Manual Setup

```bash
# SSH to EC2 instance
ssh -i doppler-key.pem ubuntu@<nginx-ip>

# Install Nginx with AWS auth
sudo bash /tmp/user-data.sh
```

## Configuration

### Nginx Config (`/etc/nginx/nginx.conf`)

```nginx
location /images/ {
    proxy_pass https://bucket.s3.region.amazonaws.com/docker-images/;
    
    # AWS Signature V4
    aws_access_key $AWS_ACCESS_KEY_ID;
    aws_secret_key $AWS_SECRET_ACCESS_KEY;
    aws_s3_bucket bucket-name;
    aws_sign;
    
    proxy_set_header Host bucket.s3.region.amazonaws.com;
}
```

## Usage

### Access Docker Images

```bash
# Via Nginx proxy
curl http://<nginx-ip>/images/project-123/image.tar

# Via Backend API (signed URL)
curl http://localhost:3000/api/proxy/images/project-123/image.tar
```

### Access Dockerfiles

```bash
# Via Nginx proxy
curl http://<nginx-ip>/dockerfiles/project-123/Dockerfile

# Via Backend API
curl http://localhost:3000/api/proxy/dockerfiles/project-123
```

## Backend Integration

### Get Signed URL

```javascript
const response = await fetch('/api/proxy/images/project-123/image.tar', {
  headers: { Authorization: `Bearer ${token}` }
});
const { url } = await response.json();
// url is valid for 1 hour
```

### Stream from S3

```javascript
const response = await fetch('/api/proxy/stream/images/project-123/image.tar', {
  headers: { Authorization: `Bearer ${token}` }
});
const blob = await response.blob();
```

## Security

### S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bucket/*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalArn": "arn:aws:iam::account:role/nginx-role"
        }
      }
    }
  ]
}
```

### IAM Role Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::bucket",
        "arn:aws:s3:::bucket/*"
      ]
    }
  ]
}
```

## Monitoring

### Health Check

```bash
curl http://<nginx-ip>/health
# Response: healthy
```

### Nginx Logs

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### 403 Forbidden
- Check IAM role permissions
- Verify S3 bucket policy
- Ensure credentials are refreshed

### 502 Bad Gateway
- Check S3 bucket name
- Verify AWS region
- Test S3 connectivity: `aws s3 ls s3://bucket`

### Signature Mismatch
- Verify system time: `date`
- Check AWS credentials
- Restart Nginx: `systemctl restart nginx`

## Performance

- Enable caching for frequently accessed images
- Use CloudFront for global distribution
- Implement rate limiting

## Cost Optimization

- S3 Intelligent-Tiering for old images
- Lifecycle policies (90-day expiration)
- CloudFront caching reduces S3 requests