# AWS Infrastructure Demo

Production-ready AWS infrastructure templates using Terraform. Demonstrates cloud architecture, security best practices, and Infrastructure-as-Code (IaC).

## 📋 Features

- ✅ VPC with public/private subnets
- ✅ EC2 instances with Auto Scaling
- ✅ RDS PostgreSQL database
- ✅ S3 bucket with versioning
- ✅ IAM roles with least-privilege
- ✅ Security groups & NACLs
- ✅ CloudWatch monitoring

## 🏗️ Architecture

```
                    ┌─────────────────────────────────────┐
                    │              AWS VPC                │
                    │         (10.0.0.0/16)               │
    ┌───────────────┼─────────────────────────────────────┼───────────────┐
    │               │                                     │               │
    │  ┌────────────▼────────────┐   ┌────────────────────▼────────────┐  │
    │  │    Public Subnet        │   │       Private Subnet           │  │
    │  │    (10.0.1.0/24)        │   │       (10.0.2.0/24)             │  │
    │  │                         │   │                                 │  │
    │  │  ┌─────────────────┐    │   │   ┌─────────────────────────┐   │  │
    │  │  │   EC2 (Web)     │    │   │   │      RDS PostgreSQL     │   │  │
    │  │  │   + ALB         │◄───┼───┼──►│      (Multi-AZ)         │   │  │
    │  │  └─────────────────┘    │   │   └─────────────────────────┘   │  │
    │  └─────────────────────────┘   └─────────────────────────────────┘  │
    └─────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │  S3 Bucket  │
                                  │  (Assets)   │
                                  └─────────────┘
```

## 🚀 Quick Start

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply infrastructure
terraform apply

# Destroy when done
terraform destroy
```

## 📁 Project Structure

```
.
├── main.tf              # Main configuration
├── variables.tf         # Input variables
├── outputs.tf           # Output values
├── vpc.tf               # VPC configuration
├── ec2.tf               # EC2 instances
├── rds.tf               # RDS database
├── s3.tf                # S3 bucket
├── iam.tf               # IAM roles
└── README.md
```

## 📞 Author

**Santanu Dhali** - Full-Stack Java & Cloud Engineer  
[GitHub](https://github.com/santanudhali) | [LinkedIn](https://linkedin.com/in/santanu-dhali)
