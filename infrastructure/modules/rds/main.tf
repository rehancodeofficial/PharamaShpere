# DB Subnet Group
resource "aws_db_subnet_group" "default" {
  name       = "pharmasphere-db-subnet-group-${var.environment}"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "pharmasphere-db-subnet-group-${var.environment}"
  }
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name        = "pharmasphere-rds-sg-${var.environment}"
  description = "Allow inbound traffic from VPC"
  vpc_id      = var.vpc_id

  ingress {
    description = "PostgreSQL access from VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.selected.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pharmasphere-rds-sg-${var.environment}"
  }
}

data "aws_vpc" "selected" {
  id = var.vpc_id
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgres" {
  identifier             = "pharmasphere-postgres-${var.environment}"
  engine                 = "postgres"
  engine_version         = "15.7" # Recommended stable version
  instance_class         = var.environment == "prod" ? "db.t3.medium" : "db.t3.micro"
  allocated_storage      = 20
  storage_type           = "gp3"
  db_name                = replace(var.db_name, "-", "_") # Database name must be alphanumeric/underscores
  username               = var.db_user
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  skip_final_snapshot    = var.environment != "prod"

  tags = {
    Name = "pharmasphere-postgres-${var.environment}"
  }
}
