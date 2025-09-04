# StormBerry V1 
- An Intelligent Assistant that helps you navigate the AI Storm

## 🚀 Features

### Core Functionality
- **A full-featured, scalable web application built with Next.js App Router that provides intelligent AI assistance in the following fields**:
- **Module 1 — Education:** AI Mentor & Adaptive Learning
- **Module 2 — Business/Productivity:** AI Workflow Orchestrator
- **Module 3 — Creativity:** Collaborative Story & Media Creator
- **Module 4 — Accessibility:** AI Companion for the Deaf & Hard of Hearing
- **Module 5 — Research:** AI Research Companion for study and brainstorming

### For Seting up or Replicating the Project Functionality Refer to the HowTo folder in the projects root. This is where you find all the instructions to setup and use the project in both dvelopment and production environments.

### Setup Supabase SQL Scripts
Inside the Migrations project folder, you will find the Scripts to run in Supabase SQL Editor of your project, to setup the necessary database objects.
For the Steps on how to implement the Supabase SQL Scripts refer to Supabase-Database-Table-Scripts.MD in the HowTo Folder of the Project

### User Experience
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Theme**: Automatic theme switching with system preference detection
- **PWA Support**: Installable progressive web app with offline capabilities
- **Smart Notifications**: Context-aware alerts and priority-based notifications
- **Search & Filter**: Advanced search and filtering for tasks, schedules, and goals

### Technical Features
- **Next.js 14 App Router**: Latest Next.js with file-based routing and server components
- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **NextAuth.js**: Secure authentication with multiple providers
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Framer Motion**: Smooth animations and transitions
- **Real-time Chat**: WebSocket support for live conversations

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks and server components
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database like Supabase
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication

### Development & Testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **TypeScript** - Type checking

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/PetersonnOne/StormBerryV1.git
   cd stormberry-gpt5
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/stormberry"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   
   # AI Services
   OPENAI_API_KEY="your-openai-api-key"
   ANTHROPIC_API_KEY="your-anthropic-api-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: User accounts with authentication and preferences
- **Conversations**: Chat sessions between users and AI
- **Messages**: Individual messages within conversations
- **AI Interactions**: Detailed records of AI requests and responses
- **User Analytics**: Usage statistics and performance metrics
- **User Preferences**: User-specific settings and configurations

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | No |

### Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_REAL_TIME_CHAT` | Enable WebSocket chat | `true` |
| `ENABLE_IMAGE_GENERATION` | Enable AI image generation | `true` |
| `ENABLE_ANALYTICS` | Enable usage analytics | `true` |

## 🚀 Deployment

### Netlify (Recommended Due to Robust Blob Storage Features)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically detect Next.js and deploy

### Other Platforms

The application can be deployed to any platform that supports Node.js:

- **Vercel** - Static site hosting
- **Railway** - Full-stack hosting
- **DigitalOcean App Platform** - Containerized deployment
- **AWS** - EC2 or Lambda deployment

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### Test Structure
- **Unit Tests**: Individual component and function tests
- **Integration Tests**: API route and database interaction tests
- **E2E Tests**: Full user workflow tests

## 📊 Analytics & Monitoring

The application includes built-in analytics and monitoring:

- **User Analytics**: Usage patterns and feature adoption
- **Performance Monitoring**: Response times and error rates
- **Cost Tracking**: AI API usage and cost optimization
- **Error Tracking**: Automatic error reporting and debugging

## 🔒 Security

### Authentication
- **NextAuth.js**: Secure session management
- **OAuth Providers**: Google, GitHub, and email/password
- **JWT Tokens**: Stateless authentication
- **Password Hashing**: bcrypt for secure password storage

### Data Protection
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Built-in NextAuth protection

### Rate Limiting
- **API Rate Limiting**: Configurable request limits
- **User Rate Limiting**: Per-user request tracking
- **IP-based Limiting**: Additional IP-level protection

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Use conventional commit messages

## Development Logs
- **Tasks Logs**: There is a folder at the root of this project named Tasks, for you to always log the details of every task completed. At the top of that file entry, put the name of the module, the tasks and their labels/titles, the full features that were currently implemented, why it was implemented, and what it was meant to achieve. And name each .MD file entry/log with the current date and time details e.g. “2025-Aug-7-HomePage-update-1.MD” Then if there is a new iteration of the task, create a new numbered file series to help differentiate when the tasks has had multiple iterations e.g. “2025-Aug-7-HomePage-update-2.MD” then “2025-Aug-7-HomePage-update-3.MD” etc. And in the file contents put date and time entries at the top then proceed to log the details of that task.
- **HowTo Logs**: There is a folder at the root of this project named Tasks, for you to always log the details of how to perform or complete a task that needs further refinement, update, implementation etc.

## User-Guide Logs
- **User-Guide**: There is a folder at the root of this project named UserGuide, for you to create user guides for each module we develop and for each iteration create a new entry e.g. “2025-Aug-7-CreativeTools-Module-1.MD” then 2025-Aug-7-CreativeTools-Module-2.MD” etc.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.rytetime.com](https://docs.StormBerry.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/StormBerry/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/StormBerry/discussions)
- **Email**: support@rytetime.com

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For hosting and deployment platform
- **OpenAI** - For AI capabilities
- **Tailwind CSS** - For the utility-first CSS framework
- **Prisma** - For the excellent database ORM

---

Built with ❤️ by the StormBerry Team
