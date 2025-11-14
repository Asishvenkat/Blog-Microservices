# GitHub Actions & Secrets Setup

This guide lists the minimum configuration required for the CI/CD workflows added to this repository.

## 1. Required Repository Secrets

| Secret | Used by | Purpose |
| ------ | ------- | ------- |
| `DOCKERHUB_USERNAME` | `docker-build.yml` | Docker Hub account username |
| `DOCKERHUB_TOKEN` | `docker-build.yml` | Docker Hub Personal Access Token with `read`, `write`, and `delete` permissions |
| `RENDER_USER_WEBHOOK` | `deploy-render.yml` | Render deploy hook URL for the user service |
| `RENDER_AUTHOR_WEBHOOK` | `deploy-render.yml` | Render deploy hook URL for the author service |
| `RENDER_BLOG_WEBHOOK` | `deploy-render.yml` | Render deploy hook URL for the blog service |

Create each secret under **Settings → Secrets and variables → Actions → New repository secret**.

## 2. Optional Variables

| Name | Type | Description |
| ---- | ---- | ----------- |
| `DOCKERHUB_REPOSITORY` | Variable | Override the Docker Hub repository namespace (defaults to `DOCKERHUB_USERNAME`) |

## 3. Workflow Overview

- **Lint** (`lint.yml`): Runs ESLint across the backend services on pushes to `main` and all pull requests.
- **Docker Build and Push** (`docker-build.yml`): Builds and pushes service images to Docker Hub on pushes to `main` and manual dispatch.
- **Deploy to Render** (`deploy-render.yml`): Calls Render deploy hooks for each service, either manually or programmatically via `repository_dispatch`.

Ensure that Docker Hub repositories exist (e.g. `user-service`, `author-service`, `blog-service`) before triggering the Docker workflow. Each Render service must expose a deploy hook URL and reference the matching Docker image tag (`latest` or `github.sha`).

