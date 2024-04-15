# Setup

How to set up an Express.js app and deploy it to a Kubernetes Cluster using Minikube and Helm

## 0. Prerequisites

### - Tooling and resources required for this setup process

Install `kubectl` with the below curl command:

```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/arm64/kubectl"
```

Install the following packages with Homebrew:
  
```
brew install yarn docker colima minikube helm node@18
```

## 1. TypeScript Express App

### - Initialise an Express App

```
mkdir my-express-app
cd my-express-app/
yarn init -y
```

### - Install Typescript and dependencies with yarn

```
yarn add express mongoose cors mongodb dotenv
yarn add -D typescript ts-node-dev @types/express @types/cors
```

### - Generate TS config

```
npx tsc --init
```

Configure TS config so that rootDir reads `/src` and outDir reads `/dist`

### - Create Express App file

Create `index.ts` inside the `/src`

```
yarn add nodemon
```

Add the following scripts to `package.json`

```
{
  "scripts": {
    "build": "npx tsc",
    "start": "node dist/index.js",
    "dev": "nodemon index.ts"
  }
}
```

`yarn build` to generate `index.js` inside the `/dist` directory

### - Running the Express App

```
yarn dev
```

#### OR
```
yarn build && yarn start
```

## 2. Dockerising the Express App in a Container

### - Create necessary docker build files

In `/my-express-app` create a Dockerfile

```
touch Dockerfile
```

with the following contents:

```
FROM node:18
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build
ENV PORT=8000
EXPOSE ${PORT}
CMD ["yarn","dev"]
```

It is worth creating a dockerIgnore file to ignore folders such as these during build

```
touch .dockerIgnore
```

with the following contents:


```
/node_modules
/build
```

### - Spin up colima to expose docker engine and docker CLI

```
colima start
```

### - Build docker image of Express App

```
docker build -t my-docker-app .
```

### - Test container and connect to newly containerised Express App

```
docker run -dp 8000:8000 my-docker-app
docker ps -a
curl -X GET http://localhost:8000/
```

## 3. Building app image in Minikube repository

### - Starting Minikube cluster

```
minikube start --driver=docker
minikube dashboard
```

NB: running the `minikube dashboard` will occupy the terminal

### - Associate the newly created minikube cluster with your shell

```
eval $(minikube docker-env)
```

### - Build an image of the Express App in minikube's repository

```
docker build -t my-minikube-app:0.1.0 -f Dockerfile .
```

## 4. Depolying containerised app to Minikube cluster

### - Create Kubernetes deployment config files

#### - Namespace

```
touch k8s/k8s-namespace.yml
```

with the following contents:

```
apiVersion: v1
kind: Namespace
  metadata:
    name: my-minikube-app
    labels:
      name: my-minikube-app
```

#### - Deployment

```
touch k8s/k8s-deployment.yml
```

with the following contents:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-minikube-app
  namespace: my-minikube-app
spec:
  selector:
    matchLabels:
      app: my-minikube-app
  replicas: 1
  template:
    metadata:
      labels:
        app: my-minikube-app
    spec:
      containers:
        - name: my-minikube-app
          image: my-minikube-app:0.2.0
          imagePullPolicy: Never
          ports:
            - containerPort: 8000
          livenessProbe:
            initialDelaySeconds: 60
            httpGet:
              path: /health
              port: 8000
          readinessProbe:
            initialDelaySeconds: 60
            httpGet:
              path: /health
              port: 8000
```
    
#### - Service

```
touch k8s/k8s-service.yml
```

with the following contents:

```
apiVersion: v1
kind: Service
metadata:
  name: my-minikube-app
  namespace: my-minikube-app
spec:
  type: NodePort
  selector:
    app: my-minikube-app
  ports:
    - port: 80
      targetPort: 8000
      nodePort: 30088
```

### - Apply changes with config files

```
kubectl apply -f ./k8s/k8s-namespace.yml
kubectl apply -f ./k8s/k8s-deployment.yml
kubectl apply -f ./k8s/k8s-service.yml
```

### - Test K8s Deployment

- `minikube service my-minikube-app -n my-minikube-app` This should open a tab in browser, connecting to the service

- `kubectl delete namespace my-minikube-app` This will delete the namespace

## 5. With Helm

### - Ensure the previous namespace deployed via K8s YAML has been deleted before trying to deploy using Helm

```
kubectl delete namespace my-minikube-app
helm create my-minikube-app
mv my-minikube-app helm
```

### - Change values.yaml

- Under `service`, ensure the port is `8000`
- Under `image`, ensure the repository is `my-minikube-app`
- Under `livenessProbe` and `readinessProbe`, add `initialDelaySeconds: 10`

### - Deploy!

```
helm install my-minikube-app —-namespace my-minikube-app —-create-namespace ./helm
```

