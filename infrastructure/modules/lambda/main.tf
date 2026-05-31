resource "aws_iam_role" "lambda_exec" {
  name = "pharmasphere-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Lambda Security Group
resource "aws_security_group" "lambda" {
  name        = "pharmasphere-lambda-sg-${var.environment}"
  description = "Security group for NestJS Lambda"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pharmasphere-lambda-sg-${var.environment}"
  }
}

# The actual Lambda function (Requires the zip file to exist, handled during CI/CD usually, using a placeholder for now)
# resource "aws_lambda_function" "api" {
#   function_name = "pharmasphere-api-${var.environment}"
#   handler       = "dist/lambda.handler"
#   runtime       = "nodejs20.x"
#   role          = aws_iam_role.lambda_exec.arn
#   
#   # To be provided by CI/CD or built locally
#   # filename      = "../../backend/dist/function.zip" 
#
#   vpc_config {
#     subnet_ids         = var.subnet_ids
#     security_group_ids = [aws_security_group.lambda.id]
#   }
# }

# Note: We will complete the API Gateway setup in a separate phase when the backend is ready to be deployed.
