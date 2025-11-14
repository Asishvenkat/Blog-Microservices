## Kubernetes Deployment (Minikube)

This directory contains manifests for deploying the Blog Microservices stack into a `blogsphere-dev` namespace.

### Prerequisites
- Kubernetes cluster (tested with Minikube)
- `kubectl` configured for the cluster
- Container images pushed to Docker Hub (see `.github/workflows/docker-build.yml`)

### Secrets

Create the `blogsphere-secrets` secret before applying the deployments. Replace placeholders with real values:

```bash
kubectl create namespace blogsphere-dev

kubectl -n blogsphere-dev create secret generic blogsphere-secrets \
  --from-literal=JWT_SEC=change-me \
  --from-literal=MONGO_URI="mongodb+srv://..." \
  --from-literal=AUTHOR_DB_URL="postgresql://..." \
  --from-literal=BLOG_DB_URL="postgresql://..." \
  --from-literal=REDIS_URL="redis://..." \
  --from-literal=RABBITMQ_URL="amqps://..." \
  --from-literal=CLOUDINARY_CLOUD_NAME="..." \
  --from-literal=CLOUDINARY_API_KEY="..." \
  --from-literal=CLOUDINARY_API_SECRET="..." \
  --from-literal=GOOGLE_CLIENT_ID="..." \
  --from-literal=GOOGLE_CLIENT_SECRET="..." \
  --from-literal=GEMINI_API_KEY="..."
```

> Use `kubectl create secret generic ... --dry-run=client -o yaml > secret.yaml` if you prefer managing secrets as manifests.

### Deploy

```powershell
.\deploy.ps1        # Uses defaults: namespace blogsphere-dev, folder k8s
```

Or manually:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/user-deployment.yaml
kubectl apply -f k8s/user-service.yaml
kubectl apply -f k8s/author-deployment.yaml
kubectl apply -f k8s/author-service.yaml
kubectl apply -f k8s/blog-deployment.yaml
kubectl apply -f k8s/blog-service.yaml
```

### Accessing Services

All services are exposed via `ClusterIP`. Use port-forwarding during local testing:

```bash
kubectl -n blogsphere-dev port-forward svc/user-service 5000:5000
kubectl -n blogsphere-dev port-forward svc/author-service 5001:5001
kubectl -n blogsphere-dev port-forward svc/blog-service 5002:5002
```

For production, front these services with an Ingress, gateway, or API gateway of your choice.

