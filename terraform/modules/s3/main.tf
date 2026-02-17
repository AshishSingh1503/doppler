resource "aws_s3_bucket" "doppler_artifacts" {
  bucket = var.bucket_name

  tags = {
    Name        = "Doppler Artifacts"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "doppler_artifacts" {
  bucket = aws_s3_bucket.doppler_artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "doppler_artifacts" {
  bucket = aws_s3_bucket.doppler_artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "doppler_artifacts" {
  bucket = aws_s3_bucket.doppler_artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "doppler_artifacts" {
  bucket = aws_s3_bucket.doppler_artifacts.id

  rule {
    id     = "delete-old-artifacts"
    status = "Enabled"

    expiration {
      days = 90
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

output "bucket_name" {
  value = aws_s3_bucket.doppler_artifacts.id
}

output "bucket_arn" {
  value = aws_s3_bucket.doppler_artifacts.arn
}