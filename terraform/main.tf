terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "s3" {
  source      = "./modules/s3"
  bucket_name = var.s3_bucket_name
  environment = var.environment
}

module "iam" {
  source      = "./modules/iam"
  bucket_arn  = module.s3.bucket_arn
  environment = var.environment
}

module "ec2" {
  source              = "./modules/ec2"
  instance_type       = var.instance_type
  key_name            = var.key_name
  iam_instance_profile = module.iam.instance_profile_name
  environment         = var.environment
}

output "s3_bucket_name" {
  value = module.s3.bucket_name
}

output "s3_bucket_arn" {
  value = module.s3.bucket_arn
}

output "ec2_public_ip" {
  value = module.ec2.public_ip
}

output "ec2_instance_id" {
  value = module.ec2.instance_id
}