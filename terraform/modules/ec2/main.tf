data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-22.04-amd64-server-*"]
  }
}

resource "aws_security_group" "doppler_sg" {
  name        = "doppler-sg-${var.environment}"
  description = "Security group for Doppler deployment server"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend API"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "Doppler Security Group"
    Environment = var.environment
  }
}

resource "aws_instance" "doppler_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  iam_instance_profile   = var.iam_instance_profile
  vpc_security_group_ids = [aws_security_group.doppler_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose awscli git nodejs npm
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
              
              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              
              # Create deployment directory
              mkdir -p /opt/doppler
              chown ubuntu:ubuntu /opt/doppler
              EOF

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  tags = {
    Name        = "Doppler Deployment Server"
    Environment = var.environment
  }
}

output "instance_id" {
  value = aws_instance.doppler_server.id
}

output "public_ip" {
  value = aws_instance.doppler_server.public_ip
}

output "private_ip" {
  value = aws_instance.doppler_server.private_ip
}