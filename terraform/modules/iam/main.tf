resource "aws_iam_role" "ec2_s3_access" {
  name = "doppler-ec2-s3-access-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "Doppler EC2 S3 Access"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy" "s3_access" {
  name = "doppler-s3-access-policy"
  role = aws_iam_role.ec2_s3_access.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.bucket_arn,
          "${var.bucket_arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "doppler-ec2-profile-${var.environment}"
  role = aws_iam_role.ec2_s3_access.name
}

output "instance_profile_name" {
  value = aws_iam_instance_profile.ec2_profile.name
}

output "role_arn" {
  value = aws_iam_role.ec2_s3_access.arn
}