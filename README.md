#  The Reading Retreat - Blog Microservices Platform

A full-stack blogging platform built with microservices architecture, featuring user authentication, blog creation with AI-powered content generation, real-time cache invalidation, and a modern Next.js frontend.

##  Architecture

This project follows a microservices architecture with three backend services and a Next.js frontend:

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│              Next.js 15 + React 19 + Tailwind                │
│                    http://localhost:3000                     │
└──────────────┬──────────────┬──────────────┬────────────────┘
               │              │              │
       ┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
       │ User Service │ │  Author  │ │    Blog    │
       │   :5000      │ │ Service  │ │  Service   │
       │              │ │  :5001   │ │   :5002    │
       └──────┬───────┘ └────┬─────┘ └─────┬──────┘
              │              │              │
              └──────┬───────┴──────┬───────┘
                     │              │
            ┌────────▼───────┐ ┌───▼──────────┐
            │   PostgreSQL   │ │    Redis     │
            │  (Neon Cloud)  │ │  (Upstash)   │
            └────────────────┘ └──────────────┘
                     │
            ┌────────▼──────────┐
            │     RabbitMQ      │
            │  (CloudAMQP)      │
            └───────────────────┘
```

### Services Overview

| Service | Port | Description |
|---------|------|-------------|
| **User Service** | 5000 | Handles authentication (Google OAuth), user profiles, and image uploads (Cloudinary) |
| **Author Service** | 5001 | Blog CRUD operations, AI content generation (Google Gemini), cache invalidation via RabbitMQ |
| **Blog Service** | 5002 | Blog viewing, comments, saved blogs, Redis caching with RabbitMQ consumer |
| **Frontend** | 3000 | Next.js app with SSR, React 19, Tailwind CSS, Radix UI components |

##  Features

-  **Google OAuth Authentication** - Secure login with Google accounts
-  **AI-Powered Content Generation** - Title, description, and blog content using Google Gemini
-  **Real-time Cache Invalidation** - RabbitMQ messaging between services
-  **Image Uploads** - Cloudinary integration for user avatars and blog images
-  **Comments & Saved Blogs** - Engage with content and save favorites
-  **Search & Filter** - Find blogs by keyword and category
-  **Redis Caching** - Fast blog retrieval with smart cache invalidation
-  **Responsive UI** - Modern design with dark mode support
-  **Docker Support** - Containerized services for easy deployment

##  Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Git**
- **Docker** (optional, for containerized deployment)

##  Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Asishvenkat/Blog-Microservices.git
cd Blog-Microservices
```

### 2. Install Dependencies

**Install all dependencies for root, services, and frontend:**

```bash
npm install
cd frontend && npm install
cd ../services/user && npm install
cd ../author && npm install
cd ../blog && npm install
cd ../../
```

### 3. Environment Variables

Create `.env` files for each service and frontend:

#### **services/user/.env**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SEC=your_jwt_secret_key
Cloud_name=your_cloudinary_cloud_name
Cloud_Api_Key=your_cloudinary_api_key
Cloud_Api_Secret=your_cloudinary_api_secret
Google_client_secret=your_google_oauth_client_secret
Google_Client_id=your_google_oauth_client_id
```

#### **services/author/.env**
```env
DB_URL=postgresql://username:password@host/database?sslmode=require
PORT=5001
JWT_SEC=your_jwt_secret_key
Cloud_name=your_cloudinary_cloud_name
Cloud_Api_Key=your_cloudinary_api_key
Cloud_Api_Secret=your_cloudinary_api_secret
Gemini_Api_Key=your_google_gemini_api_key
RABBITMQ_URL=amqps://user:pass@host/vhost
```

#### **services/blog/.env**
```env
PORT=5002
DB_URL=postgresql://username:password@host/database?sslmode=require
USER_SERVICE=http://localhost:5000
REDIS_URL=rediss://default:password@host:port
JWT_SEC=your_jwt_secret_key
RABBITMQ_URL=amqps://user:pass@host/vhost
```

#### **frontend/.env.local**
```env
# No env vars needed - API URLs are in src/context/AppContext.tsx
# For production, update the service URLs in AppContext.tsx
```

### 4. Build Services

```bash
cd services/user && npm run build
cd ../author && npm run build
cd ../blog && npm run build
cd ../../
```

### 5. Run All Services

**Single command to run everything:**

```bash
npm run dev
```

This uses `concurrently` to run:
- User service (port 5000)
- Author service (port 5001)
- Blog service (port 5002)
- Frontend (port 3000)

**Or run individually:**

```bash
# Terminal 1 - User Service
cd services/user && npm run dev

# Terminal 2 - Author Service
cd services/author && npm run dev

# Terminal 3 - Blog Service
cd services/blog && npm run dev

# Terminal 4 - Frontend
cd frontend && npm run dev
```

### 6. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

##  Required External Services

### Google Cloud (OAuth & Gemini AI)
1. Create a project at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API and Gemini API
3. Create OAuth 2.0 credentials:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000`
4. Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Cloudinary (Image Storage)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard

### Neon (PostgreSQL)
1. Create a free database at [Neon](https://neon.tech/)
2. Copy the connection string (enable pooling mode)
3. Run migrations/schema setup (check `services/author` and `services/blog` for table structures)

### Upstash (Redis)
1. Create a Redis database at [Upstash](https://upstash.com/)
2. Copy the `REDIS_URL` connection string

### CloudAMQP (RabbitMQ)
1. Create a free instance at [CloudAMQP](https://www.cloudamqp.com/)
2. Copy the `AMQPS` connection URL
3. Use the same URL in both `services/author` and `services/blog`

##  Docker Deployment

Each service has a Dockerfile for containerization:

```bash
# Build User Service
cd services/user
docker build -t user-service .
docker run -p 5000:5000 --env-file .env user-service

# Build Author Service
cd services/author
docker build -t author-service .
docker run -p 5001:5001 --env-file .env author-service

# Build Blog Service
cd services/blog
docker build -t blog-service .
docker run -p 5002:5002 --env-file .env blog-service
```

For production deployment (Render, Railway, etc.), push images to Docker Hub and deploy from there.

##  Project Structure

```
Blog-Microservices/
├── frontend/                 # Next.js 15 frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context (AppContext)
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── services/
│   ├── user/                # User authentication service
│   │   ├── src/
│   │   │   ├── controllers/ # Route handlers
│   │   │   ├── middleware/  # Auth middleware
│   │   │   ├── model/       # MongoDB models
│   │   │   ├── routes/      # Express routes
│   │   │   └── utils/       # DB, Google OAuth config
│   │   └── package.json
│   ├── author/              # Blog authoring service
│   │   ├── src/
│   │   │   ├── controllers/ # Blog CRUD + AI endpoints
│   │   │   ├── middleware/  # Auth middleware
│   │   │   └── utils/       # DB, RabbitMQ publisher
│   │   └── package.json
│   └── blog/                # Blog viewing service
│       ├── src/
│       │   ├── controllers/ # Blog fetch, comments, saved
│       │   └── utils/       # DB, Redis, RabbitMQ consumer
│       └── package.json
├── package.json             # Root package with concurrently script
├── .gitignore
└── README.md
```

##  API Endpoints

### User Service (5000)
- `POST /api/v1/login` - Google OAuth login
- `GET /api/v1/me` - Get current user
- `PUT /api/v1/user/update` - Update user profile
- `POST /api/v1/user/update/pic` - Update profile picture

### Author Service (5001)
- `POST /api/v1/blog/new` - Create new blog
- `PUT /api/v1/blog/:id` - Update blog
- `DELETE /api/v1/blog/:id` - Delete blog
- `POST /api/v1/blog/ai/title` - AI-generate title
- `POST /api/v1/blog/ai/description` - AI-generate description
- `POST /api/v1/blog/ai/blog` - AI-generate full blog

### Blog Service (5002)
- `GET /api/v1/blog/all` - Get all blogs (with search & filter)
- `GET /api/v1/blog/:id` - Get single blog
- `POST /api/v1/blog/:id/comment` - Add comment
- `POST /api/v1/blog/:id/save` - Save/unsave blog
- `GET /api/v1/blog/saved/all` - Get all saved blogs

##  Environment Variables Reference

| Variable | Service | Description |
|----------|---------|-------------|
| `PORT` | All | Service port number |
| `JWT_SEC` | All | JWT secret for token signing |
| `DB_URL` | Author, Blog | PostgreSQL connection string (Neon) |
| `MONGO_URI` | User | MongoDB connection string |
| `REDIS_URL` | Blog | Redis connection string (Upstash) |
| `RABBITMQ_URL` | Author, Blog | RabbitMQ connection URL (CloudAMQP) |
| `Google_Client_id` | User | Google OAuth client ID |
| `Google_client_secret` | User | Google OAuth client secret |
| `Gemini_Api_Key` | Author | Google Gemini API key |
| `Cloud_name` | User, Author | Cloudinary cloud name |
| `Cloud_Api_Key` | User, Author | Cloudinary API key |
| `Cloud_Api_Secret` | User, Author | Cloudinary API secret |

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License.

##  Author

**Asish Venkat**
- GitHub: [@Asishvenkat](https://github.com/Asishvenkat)
- Email: asishvenkat.a2004@gmail.com

##  Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting capabilities
- Google for Gemini AI and OAuth services
- Neon, Upstash, CloudAMQP for cloud services
- Radix UI for accessible components
- Cloudinary for image management

---

**⭐ If you found this project helpful, please give it a star!**
