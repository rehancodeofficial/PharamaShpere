resource "aws_cognito_user_pool" "pool" {
  name = "pharmasphere-user-pool-${var.environment}"

  # Define alias attributes
  alias_attributes         = ["email", "preferred_username"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "tenant_id"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "role" # Custom attribute for RBAC (super_admin, pharmacy_owner, pharmacist, cashier)
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 50
    }
  }

  tags = {
    Name = "pharmasphere-cognito-pool-${var.environment}"
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name                                 = "pharmasphere-app-client-${var.environment}"
  user_pool_id                         = aws_cognito_user_pool.pool.id
  generate_secret                      = false
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  supported_identity_providers         = ["COGNITO"]
  explicit_auth_flows                  = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}
