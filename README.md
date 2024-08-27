<div align="center">
    <a href="https://www.eng.uminho.pt" target="_blank"><img src="https://i.imgur.com/mOynow9.png" alt="Engineering School"/></a>
    <a href="https://www.uminho.pt" target="_blank"><img src="https://i.imgur.com/1gtSAGM.png" alt="University Of Minho"/></a>
    <br/>
    <a href="http://www.dsi.uminho.pt" target="_blank">
        <strong>Information Systems Department</strong>
    </a>
    <br/>
    <br/>
    <a href="https://github.com/ABI-Deployment-Thesis/model-runner/actions"><img alt="Tests Status" src="https://github.com/ABI-Deployment-Thesis/model-runner/actions/workflows/tests.yaml/badge.svg"></a>
    <a href="https://github.com/ABI-Deployment-Thesis/model-runner/releases"><img alt="GitHub Release" src="https://img.shields.io/github/v/release/ABI-Deployment-Thesis/model-runner"></a>
    <a href="https://github.com/ABI-Deployment-Thesis/model-runner/blob/main/LICENSE"><img alt="GitHub License" src="https://img.shields.io/github/license/ABI-Deployment-Thesis/model-runner"></a>
</div>

<h2 align="center">ABI Deployment Thesis - Model Runner</h2>

Welcome to the model-runner repository! This project is a key part of a master's thesis at the University of Minho. It's a Proof of Concept for a proposed architecture designed to deploy and integrate intelligent models within Adaptive Business Intelligence (ABI) systems.

**This repository provides a microservice for managing intelligent model runs. It stores user inputs, routes data to engine microservices for model execution, and includes an API for monitoring run statuses through gRPC updates from the engines.**

For a detailed explanation of the proposed architecture and its deployment strategy, please refer to the published article: [Architecture proposal for deploying and integrating intelligent models in ABI](https://www.sciencedirect.com/science/article/pii/S1877050923022445).

## Quick Start

- For setup instructions and initial configuration, please follow the guidelines provided in the [infrastructure repository](https://github.com/ABI-Deployment-Thesis/component-core?tab=readme-ov-file#quick-start).

## Networking

- Ingress
    - Exposes a REST API on the default port 3003.
    - Exposes a gRPC API on the default port 50053.
- Egress
    - Communicates with the model-management microservice to retrieve data about intelligent models via gRPC or HTTP, depending on the GRPC_STABLE flag.
    - Saves user-uploaded files related to intelligent models to storage.
    - Sends data to run the intelligent models to a RabbitMQ queue.
- Both
    - Communicates with MongoDB to save and retrieve data.

## Author

- Rui Gomes ([LinkedIn](https://www.linkedin.com/in/ruigomes99))

## License

- [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/)