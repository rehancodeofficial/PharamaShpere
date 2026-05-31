resource "aws_s3_bucket" "storage" {
  bucket = "pharmasphere-storage-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name        = "pharmasphere-storage-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "storage_block" {
  bucket = aws_s3_bucket.storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "storage_encryption" {
  bucket = aws_s3_bucket.storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

data "aws_caller_identity" "current" {}
