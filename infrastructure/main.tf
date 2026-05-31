terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = "PharmaSphere"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# --- Module Invocations (To be filled out) ---

module "vpc" {
  source      = "./modules/vpc"
  environment = var.environment
}

module "rds" {
  source      = "./modules/rds"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  db_name     = "pharmasphere_${var.environment}"
  db_user     = var.db_user
  db_password = var.db_password
}

module "cognito" {
  source      = "./modules/cognito"
  environment = var.environment
}

module "s3" {
  source      = "./modules/s3"
  environment = var.environment
}

module "lambda" {
  source      = "./modules/lambda"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
}
