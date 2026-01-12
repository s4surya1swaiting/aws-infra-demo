import { useState } from 'react'
import './App.css'

const resources = [
  {
    id: 'vpc',
    name: 'VPC',
    icon: '🌐',
    status: 'active',
    details: 'CIDR: 10.0.0.0/16',
    description: 'Virtual Private Cloud with DNS support enabled'
  },
  {
    id: 'public-subnet',
    name: 'Public Subnet',
    icon: '📡',
    status: 'active',
    details: '10.0.1.0/24 | ap-south-1a',
    description: 'Internet-facing subnet with auto-assign public IP'
  },
  {
    id: 'private-subnet',
    name: 'Private Subnet',
    icon: '🔒',
    status: 'active',
    details: '10.0.2.0/24 | ap-south-1b',
    description: 'Isolated subnet for database and internal services'
  },
  {
    id: 'ec2',
    name: 'EC2 Instance',
    icon: '🖥️',
    status: 'running',
    details: 't3.micro | Docker enabled',
    description: 'Web server with Docker pre-installed via user-data'
  },
  {
    id: 's3',
    name: 'S3 Bucket',
    icon: '📦',
    status: 'active',
    details: 'Versioning enabled',
    description: 'Asset storage bucket with IAM-based access control'
  },
  {
    id: 'iam',
    name: 'IAM Role',
    icon: '🔐',
    status: 'attached',
    details: 'EC2 Instance Profile',
    description: 'Least-privilege role for S3 access from EC2'
  },
  {
    id: 'sg',
    name: 'Security Group',
    icon: '🛡️',
    status: 'active',
    details: 'Ports: 22, 80, 443',
    description: 'Firewall rules for SSH and HTTP/HTTPS traffic'
  },
  {
    id: 'igw',
    name: 'Internet Gateway',
    icon: '🚪',
    status: 'attached',
    details: 'Attached to VPC',
    description: 'Enables internet connectivity for public subnet'
  }
]

const terraformOutput = `
Terraform will perform the following actions:

  # aws_vpc.main will be created
  + resource "aws_vpc" "main" {
      + cidr_block           = "10.0.0.0/16"
      + enable_dns_hostnames = true
      + enable_dns_support   = true
      + tags                 = {
          + "Name" = "aws-infra-demo-vpc"
        }
    }

  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami                  = "ami-0c55b159cbfafe1f0"
      + instance_type        = "t3.micro"
      + tags                 = {
          + "Name" = "aws-infra-demo-web-server"
        }
    }

  # aws_s3_bucket.assets will be created
  + resource "aws_s3_bucket" "assets" {
      + bucket = "aws-infra-demo-assets-a1b2c3d4"
    }

Plan: 8 to add, 0 to change, 0 to destroy.
`

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

function TerraformPanel({ isRunning, output, onRun }) {
  return (
    <div className="terraform-panel">
      <div className="panel-header">
        <h3>🔧 Terraform</h3>
        <div className="terraform-actions">
          <button
            className={`tf-btn ${isRunning ? 'running' : ''}`}
            onClick={() => onRun('plan')}
            disabled={isRunning}
          >
            {isRunning ? '⏳ Running...' : '📋 Plan'}
          </button>
          <button className="tf-btn apply" disabled>
            ✓ Apply
          </button>
          <button className="tf-btn destroy" disabled>
            🗑 Destroy
          </button>
        </div>
      </div>
      <div className="terminal">
        <div className="terminal-header">
          <span className="terminal-dot red"></span>
          <span className="terminal-dot yellow"></span>
          <span className="terminal-dot green"></span>
          <span className="terminal-title">terraform plan</span>
        </div>
        <pre className="terminal-output">
          {output || '$ terraform plan\n\nClick "Plan" to preview infrastructure changes...'}
        </pre>
      </div>
    </div>
  )
}

function App() {
  const [selectedResource, setSelectedResource] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [terraformOut, setTerraformOut] = useState('')

  const handleTerraformRun = () => {
    setIsRunning(true)
    setTerraformOut('Initializing Terraform...\n')

    setTimeout(() => {
      setTerraformOut('Initializing Terraform...\n\nRefreshing state...\n')
    }, 500)

    setTimeout(() => {
      setTerraformOut(terraformOutput)
      setIsRunning(false)
    }, 2000)
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
                onClick={() => setSelectedResource(resource)}
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
