param(
    [string]$Namespace = "blogsphere-dev",
    [string]$K8sFolder = "k8s"
)

Write-Host "Deploying Blog Microservices stack to namespace '$Namespace'..." -ForegroundColor Cyan

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Error "kubectl is required but was not found on the PATH."
    exit 1
}

$namespaceFile = Join-Path $K8sFolder "namespace.yaml"
if (-not (Test-Path $namespaceFile)) {
    Write-Error "Unable to find namespace manifest at $namespaceFile"
    exit 1
}

kubectl apply -f $namespaceFile | Write-Host

$resources = @(
    "configmap.yaml",
    "user-deployment.yaml",
    "user-service.yaml",
    "author-deployment.yaml",
    "author-service.yaml",
    "blog-deployment.yaml",
    "blog-service.yaml"
)

foreach ($resource in $resources) {
    $path = Join-Path $K8sFolder $resource
    if (-not (Test-Path $path)) {
        Write-Warning "Skipping missing manifest: $path"
        continue
    }

    Write-Host "Applying $resource..." -ForegroundColor Green
    kubectl apply -f $path | Write-Host
}

Write-Host "Deployment manifests applied. Remember to create/update secrets:" -ForegroundColor Yellow
Write-Host "kubectl -n $Namespace create secret generic blogsphere-secrets --from-literal=JWT_SEC=..." -ForegroundColor Yellow

