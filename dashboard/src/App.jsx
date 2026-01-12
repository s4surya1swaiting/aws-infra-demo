import { useState } from 'react'
import './App.css'

const resources = [
  {
    id: 'vpc',
    name: 'VPC',
    icon: '🌐',
    status: 'active',
    details: 'CIDR: 10.0.0.0/16',
    description: 'Virtual Private Cloud with DNS support enabled',
    tfOutput: `
  # aws_vpc.main will be created
  + resource "aws_vpc" "main" {
      + cidr_block           = "10.0.0.0/16"
      + enable_dns_hostnames = true
      + enable_dns_support   = true
      + tags                 = {
          + "Name" = "aws-infra-demo-vpc"
        }
    }
`
  },
  {
    id: 'public-subnet',
    name: 'Public Subnet',
    icon: '📡',
    status: 'active',
    details: '10.0.1.0/24 | ap-south-1a',
    description: 'Internet-facing subnet with auto-assign public IP',
    tfOutput: `
  # aws_subnet.public will be created
  + resource "aws_subnet" "public" {
      + vpc_id                  = "(known after apply)"
      + cidr_block              = "10.0.1.0/24"
      + availability_zone       = "ap-south-1a"
      + map_public_ip_on_launch = true
    }
`
  },
  {
    id: 'private-subnet',
    name: 'Private Subnet',
    icon: '🔒',
    status: 'active',
    details: '10.0.2.0/24 | ap-south-1b',
    description: 'Isolated subnet for database and internal services',
    tfOutput: `
  # aws_subnet.private will be created
  + resource "aws_subnet" "private" {
      + vpc_id            = "(known after apply)"
      + cidr_block        = "10.0.2.0/24"
      + availability_zone = "ap-south-1b"
    }
`
  },
  {
    id: 'ec2',
    name: 'EC2 Instance',
    icon: '🖥️',
    status: 'running',
    details: 't3.micro | Docker enabled',
    description: 'Web server with Docker pre-installed via user-data',
    tfOutput: `
  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami                  = "ami-0c55b159cbfafe1f0"
      + instance_type        = "t3.micro"
      + vpc_security_group_ids = ["(known after apply)"]
      + subnet_id            = "(known after apply)"
      + user_data            = "687254... (script hidden)"
      + tags                 = {
          + "Name" = "aws-infra-demo-web-server"
        }
    }
`
  },
  {
    id: 's3',
    name: 'S3 Bucket',
    icon: '📦',
    status: 'active',
    details: 'Versioning enabled',
    description: 'Asset storage bucket with IAM-based access control',
    tfOutput: `
  # aws_s3_bucket.assets will be created
  + resource "aws_s3_bucket" "assets" {
      + bucket = "aws-infra-demo-assets-a1b2c3d4"
      + versioning {
          + enabled = true
        }
    }
`
  },
  {
    id: 'iam',
    name: 'IAM Role',
    icon: '🔐',
    status: 'attached',
    details: 'EC2 Instance Profile',
    description: 'Least-privilege role for S3 access from EC2',
    tfOutput: `
  # aws_iam_role.ec2_s3_role will be created
  + resource "aws_iam_role" "ec2_s3_role" {
      + name = "aws-infra-demo-role"
      + assume_role_policy = "(complex policy)"
    }
`
  },
  {
    id: 'sg',
    name: 'Security Group',
    icon: '🛡️',
    status: 'active',
    details: 'Ports: 22, 80, 443',
    description: 'Firewall rules for SSH and HTTP/HTTPS traffic',
    tfOutput: `
  # aws_security_group.allow_web will be created
  + resource "aws_security_group" "allow_web" {
      + name        = "allow_web_traffic"
      + description = "Allow TLS inbound traffic"
      + vpc_id      = "(known after apply)"
      
      + ingress {
          + from_port   = 80
          + to_port     = 80
          + protocol    = "tcp"
        }
    }
`
  },
  {
    id: 'igw',
    name: 'Internet Gateway',
    icon: '🚪',
    status: 'attached',
    details: 'Attached to VPC',
    description: 'Enables internet connectivity for public subnet',
    tfOutput: `
  # aws_internet_gateway.gw will be created
  + resource "aws_internet_gateway" "gw" {
      + vpc_id = "(known after apply)"
    }
`
  }
]

function ResourceCard({ resource, isSelected, onClick }) {
  return (
    <div
      className={`resource-card ${isSelected ? 'selected' : ''} status-${resource.status}`}
      onClick={onClick}
    >
      <div className="resource-icon">{resource.icon}</div>
      <div className="resource-info">
        <h3>{resource.name}</h3>
        <span className="resource-details">{resource.details}</span>
      </div>
      <div className={`status-badge ${resource.status}`}>
        {resource.status}
      </div>
    </div>
  )
}

function ArchitectureDiagram() {
  return (
    <div className="architecture-diagram">
      <div className="diagram-title">Architecture Overview</div>
      <div className="diagram-container">
        <div className="diagram-layer internet">
          <span>🌍 Internet</span>
        </div>
        <div className="diagram-arrow">↓</div>
        <div className="diagram-layer gateway">
          <span>🚪 Internet Gateway</span>
        </div>
        <div className="diagram-arrow">↓</div>
        <div className="vpc-box">
          <div className="vpc-label">VPC (10.0.0.0/16)</div>
          <div className="subnets">
            <div className="subnet public">
              <div className="subnet-label">Public Subnet</div>
              <div className="subnet-content">
                <span>🖥️ EC2</span>
                <span>🛡️ SG</span>
              </div>
            </div>
            <div className="subnet private">
              <div className="subnet-label">Private Subnet</div>
              <div className="subnet-content">
                <span>🗄️ RDS</span>
              </div>
            </div>
          </div>
        </div>
        <div className="diagram-arrow">↔</div>
        <div className="external-services">
          <div className="diagram-layer s3">
            <span>📦 S3 Bucket</span>
          </div>
          <div className="diagram-layer iam">
            <span>🔐 IAM</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TerraformPanel({ isRunning, output, onRun, canApply, hasApplied }) {
  return (
    <div className="terraform-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h3>🔧 Terraform Infrastructure-as-Code</h3>
          <p className="panel-subtitle">Plan and apply infrastructure changes declaratively</p>
        </div>
        <div className="terraform-actions">
          <button
            className={`tf-btn ${isRunning ? 'running' : ''}`}
            onClick={() => onRun('plan')}
            disabled={isRunning}
          >
            {isRunning ? '⏳ Running...' : '📋 Plan'}
          </button>
          <button
            className={`tf-btn apply ${hasApplied ? 'applied' : ''}`}
            onClick={() => onRun('apply')}
            disabled={!canApply || isRunning || hasApplied}
          >
            {hasApplied ? '✅ Applied' : '✓ Apply'}
          </button>
        </div>
      </div>
      <div className="terminal">
        <div className="terminal-header">
          <span className="terminal-dot red"></span>
          <span className="terminal-dot yellow"></span>
          <span className="terminal-dot green"></span>
          <span className="terminal-title">terraform preview</span>
        </div>
        <pre className="terminal-output">
          {output || '$ terraform plan\n\n1. Select a resource above\n2. Click "Plan" to dry-run the configuration\n3. View the declarative code differences below...'}
        </pre>
      </div>
      <div className="terraform-explanation">
        <p>💡 <strong>What is this output?</strong> Terraform compares your desired state (code) with actual cloud state. The <code>+</code> signs show what will be added. This allows DevOps engineers to review changes before they are actually provisioned.</p>
      </div>
    </div>
  )
}

function App() {
  const [selectedResource, setSelectedResource] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [terraformOut, setTerraformOut] = useState('')
  const [canApply, setCanApply] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  const handleTerraformRun = (type) => {
    setIsRunning(true)
    setHasApplied(false)

    if (type === 'plan') {
      setTerraformOut('Initializing Terraform...\n')
      setTimeout(() => setTerraformOut(prev => prev + '\nRefreshing state from AWS...\n'), 600)

      setTimeout(() => {
        const output = selectedResource
          ? `Terraform will perform the following actions for "${selectedResource.name}":\n${selectedResource.tfOutput}\nPlan: 1 to add, 0 to change, 0 to destroy.`
          : `Terraform will perform the following actions for the entire stack:\n\n${resources.map(r => r.tfOutput).join('')}\nPlan: ${resources.length} to add, 0 to change, 0 to destroy.`

        setTerraformOut(output)
        setIsRunning(false)
        setCanApply(true)
      }, 1500)
    } else {
      setTerraformOut('Executing Plan...\n')
      setTimeout(() => setTerraformOut(prev => prev + '\nApplying changes to Cloud Provider...\n'), 800)

      setTimeout(() => {
        setTerraformOut(prev => prev + `\n${selectedResource ? selectedResource.name : 'Stack'}: Creation complete!\n\nApply complete! Resources: ${selectedResource ? '1' : resources.length} added, 0 changed, 0 destroyed.`)
        setIsRunning(false)
        setCanApply(false)
        setHasApplied(true)
      }, 2500)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">☁️</span>
          <h1>AWS Infrastructure Demo</h1>
        </div>
        <div className="header-badge">
          <span className="env-badge">dev</span>
          <span className="region-badge">ap-south-1</span>
        </div>
      </header>

      <main className="main">
        <section className="resources-section">
          <h2>📊 Resources</h2>
          <div className="resources-grid">
            {resources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isSelected={selectedResource?.id === resource.id}
                onClick={() => {
                  setSelectedResource(resource)
                  setCanApply(false)
                  setHasApplied(false)
                }}
              />
            ))}
          </div>
        </section>

        <section className="details-section">
          <ArchitectureDiagram />

          {selectedResource && (
            <div className="resource-detail-panel">
              <h3>{selectedResource.icon} {selectedResource.name}</h3>
              <p>{selectedResource.description}</p>
              <div className="detail-meta">
                <span>Status: <strong>{selectedResource.status}</strong></span>
                <span>Details: <strong>{selectedResource.details}</strong></span>
              </div>
            </div>
          )}
        </section>

        <section className="terraform-section">
          <TerraformPanel
            isRunning={isRunning}
            output={terraformOut}
            onRun={handleTerraformRun}
            canApply={canApply}
            hasApplied={hasApplied}
          />
        </section>
      </main>

      <footer className="footer">
        <p>Built with Terraform • Author: Santanu Dhali</p>
      </footer>
    </div>
  )
}

export default App
