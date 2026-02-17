resource "aws_instance" "nginx_proxy" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  iam_instance_profile   = var.iam_instance_profile
  vpc_security_group_ids = [aws_security_group.nginx_sg.id]

  user_data = templatefile("${path.module}/user-data.sh", {
    s3_bucket  = var.s3_bucket_name
    aws_region = var.aws_region
  })

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name        = "Doppler Nginx Proxy"
    Environment = var.environment
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-22.04-amd64-server-*"]
  }
}

resource "aws_security_group" "nginx_sg" {
  name        = "doppler-nginx-sg-${var.environment}"
  description = "Security group for Nginx reverse proxy"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "Doppler Nginx SG"
    Environment = var.environment
  }
}

output "nginx_public_ip" {
  value = aws_instance.nginx_proxy.public_ip
}

output "nginx_instance_id" {
  value = aws_instance.nginx_proxy.id
}