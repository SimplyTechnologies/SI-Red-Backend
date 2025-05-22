SI-Red Backend
This is the backend API for the SI-Red project, built with Node.js, Express, and TypeScript.

🛠️ Technologies Used
Node.js: JavaScript runtime environment

Express: Web framework for building APIs

TypeScript: A superset of JavaScript for better type safety

ts-node: TypeScript execution for development

ts-node-dev: TypeScript compiler with auto-reloading for faster development

🚀 Getting Started

1. Clone the repository

git clone https://github.com/SimplyTechnologies/SI-Red-Backend.git
cd si-red-backend

2. Install dependencies
   Run the following command to install the necessary dependencies:

npm install

3. Configure environment (optional)
   Make sure to create a .env file in the root directory if your project requires environment variables, such as database URLs, API keys, etc. You can follow the template in .env.example.

4. Run the application (Development)
   To start the server in development mode, use the following command:

npm run dev
or
node dist/server.js

You must run this after adding or modifying any controller:

npx tsoa routes

This will start the server using ts-node-dev with hot reloading enabled.
