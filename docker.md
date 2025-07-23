# Docker Documentation


## Virtual Machine (VM)
- A virtual machine is a software emulation of a physical computer that runs an 
operating system and applications just like a physical machine. 
It allows multiple operating systems to run on a single physical machine, 
providing isolation and resource management.

A virtual machine is like your computer(s) but not physical.
It run on a physical machine, but on a server or host machine.

Your virtual machine can run on your laptop, desktop, or server.
It runs on an operating system (OS) that is installed on the physical machine.
The operating system can be Windows, Linux, ubuntu, or macOS.

- Organizations run their applications on virtual machines to:
  - Isolate applications from each other.
  - Run multiple operating systems on a single physical machine.
  - Improve resource utilization and management.

Example:
- Imagine if two teams in a company are running Express.js application on 
  the same physical machine. Team A is using node v 14 and Team B is using node v 16.

# CONTAINERIZATION
Containerization is a lightweight alternative to full machine virtualization 
that involves encapsulating an application and its dependencies into a 
container image.

- A lightweight form of virtualization that packages up code and all its 
  dependencies so the application runs quickly and reliably from one computing
environment to another.

Key Concepts:
- **Container**: A standard unit of software that packages up code and all its 
dependencies so the application runs quickly and reliably in different 
computing environments. 
  Containers are isolated from each other and the host system, ensuring that 
  they do not interfere with each other.
- **Container Image**: A lightweight, standalone, executable package that
  includes everything needed to run a piece of software, including the code, 
  runtime, libraries, and environment variables. (A blueprint for a container)
- **Docker**: A platform that enables developers to automate the deployment of 
  applications inside lightweight, portable containers. It provides tools to 
  create, deploy, and manage containers.

(Image is like a class while container is like an object)
You create a container from an image.


Why Use Containerization or Docker?
- Portability: Containers can run on any system that has Docker installed, 
  regardless of the underlying infrastructure.
- Consistency: Containers ensure that the application runs the same way 
  in development, testing, and production environments.
- Efficiency: Containers share the host system's kernel, making them 
  more lightweight and faster to start compared to virtual machines.
- Microservices: Containers are ideal for deploying microservices, 
  allowing each service to run in its own container and communicate with 
  other services over a network.
- Isolation: Containers provide a level of isolation between applications, 
  ensuring that they do not interfere with each other.
- Scalability: Containers can be easily scaled up or down based on demand, 
  making them suitable for applications with varying workloads.
- Industry Standard: Docker has become the industry standard for containerization, 
  with a large ecosystem of tools and resources available.

Docker Use Cases:

| Use Case    | Description                                                                                                                                                        |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Development | Developers can use Docker to create a consistent development environment that mirrors production, ensuring that applications run the same way in all environments. |
| Testing     | Docker allows for easy creation and management of test environments, enabling developers to run tests in isolated containers without affecting the host system.    |
| Deployment  | Docker simplifies the deployment process by allowing applications to be packaged into containers that can be easily deployed across different environments.        |
| CI/CD       | Docker integrates with continuous integration and continuous deployment (CI/CD) pipelines, enabling automated testing and deployment of applications.              |

# Docker Lifecycle
- **Build**: Create a Docker image from a Dockerfile, which contains instructions for building the image.
- **Run**: Start a container from a Docker image, which executes the application inside the container.
- **Stop**: Stop a running container, which halts the execution of the application inside the container.
- **Remove**: Delete a stopped container, which frees up resources and removes the container from the system.
- **Push**: Upload a Docker image to a Docker registry, making it available for others to use.
- **Pull**: Download a Docker image from a Docker registry, allowing users to run the application in a container.
- **Tag**: Assign a tag to a Docker image, which is used to identify different versions of the image.
- **Inspect**: View detailed information about a Docker image or container, including its configuration and status.
- **Logs**: View the logs of a running or stopped container, which can help in debugging and monitoring the application.
- **Exec**: Execute a command inside a running container, allowing users to interact with the application or perform administrative tasks.
- **Compose**: Use Docker Compose to define and run multi-container applications, allowing users to manage multiple containers as a single application.
- **Network**: Create and manage networks for containers, allowing them to communicate with each other and with the host system.
- **Volume**: Create and manage volumes for persistent data storage, allowing containers to share data and maintain state across restarts.
- **Swarm**: Use Docker Swarm to manage a cluster of Docker hosts, allowing users to deploy and scale applications across multiple machines.

```aiignore
# Docker Commands

docker build -t <image_name> . # Build a Docker image from the Dockerfile in the current directory
docker run -d -p <host_port>:<container_port> <image_name> # Run a Docker container in detached mode, mapping host port to container port
docker ps # List running Docker containers
docker stop <container_id> # Stop a running Docker container
docker rm <container_id> # Remove a stopped Docker container
docker rmi <image_name> # Remove a Docker image
docker pull <image_name> # Pull a Docker image from a registry
docker push <image_name> # Push a Docker image to a registry
docker exec -it <container_id> /bin/bash # Execute a command inside a running Docker container
docker logs <container_id> # View the logs of a running or stopped Docker container
docker-compose up -d # Start a multi-container application defined in a docker-compose.yml file
docker-compose down # Stop and remove the containers defined in a docker-compose.yml file

```