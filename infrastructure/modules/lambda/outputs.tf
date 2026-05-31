output "lambda_role_arn" {
  description = "The ARN of the Lambda Execution Role"
  value       = aws_iam_role.lambda_exec.arn
}

output "lambda_security_group_id" {
  description = "The ID of the Lambda Security Group"
  value       = aws_security_group.lambda.id
}
