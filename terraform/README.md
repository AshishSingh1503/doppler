# Terraform AWS Infrastructure Setup

## Prerequisites
- AWS Account
- AWS CLI configured
- Terraform installed (v1.0+)
- EC2 Key Pair created

## Step 1: Configure AWS Credentials

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: us-east-1
- Default output format: json

## Step 2: Create EC2 Key Pair

```bash
aws ec2 create-key-pair --key-name doppler-key --query 'KeyMaterial' --output text > doppler-key.pem
chmod 400 doppler-key.pem
```

## Step 3: Configure Terraform Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
aws_region      = "us-east-1"
environment     = "production"
s3_bucket_name  = "doppler-artifacts-YOUR-UNIQUE-NAME"
instance_type   = "t3.medium"
key_name        = "doppler-key"
```

## Step 4: Initialize Terraform

```bash
terraform init
```

## Step 5: Plan Infrastructure

```bash
terraform plan
```

Review the resources that will be created:
- S3 Bucket for Docker images
- IAM Role and Instance Profile
- EC2 Instance with Docker
- Security Group

## Step 6: Apply Infrastructure

```bash
terraform apply
```

Type `yes` to confirm.

## Step 7: Get Outputs

```bash
terraform output
```

You'll see:
- `s3_bucket_name` - S3 bucket for artifacts
- `ec2_public_ip` - EC2 instance IP
- `ec2_instance_id` - EC2 instance ID

## Step 8: Update Backend Environment

Add to `backend/.env`:
```
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name-from-output
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Step 9: Install AWS SDK

```bash
cd backend
npm install @aws-sdk/client-s3
```

## Step 10: Test Deployment

1. Start backend: `npm start`
2. Create project with GitHub repo
3. Backend will:
   - Clone repo
   - Generate Dockerfile
   - Build Docker image
   - Upload to S3

## Infrastructure Components

### S3 Bucket
- Stores Docker images and Dockerfiles
- Versioning enabled
- Encryption enabled
- 90-day lifecycle policy

### EC2 Instance
- Ubuntu 22.04
- Docker pre-installed
- AWS CLI configured
- IAM role for S3 access

### IAM Role
- S3 read/write permissions
- Attached to EC2 instance

### Security Group
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 3000 (Backend API)

## Cleanup

To destroy all resources:
```bash
terraform destroy
```

## Cost Estimate

- S3: ~$0.023/GB/month
- EC2 t3.medium: ~$30/month
- Data transfer: Variable

Total: ~$35-50/month

## Troubleshooting

### "Bucket already exists"
Change `s3_bucket_name` to unique value

### "Key pair not found"
Create key pair: `aws ec2 create-key-pair --key-name doppler-key`

### "Insufficient permissions"
Ensure AWS user has EC2, S3, and IAM permissions