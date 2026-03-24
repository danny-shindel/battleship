# Battleship Game

A modern, real-time Battleship game built with React, Vite, Tailwind CSS, and Base44 backend.

## Features

- 🎯 Real-time multiplayer battleship game
- 🚢 Strategic ship placement and attack phases
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 🔐 Authentication with Base44
- 📱 Responsive design
- ⚡ Fast development with Vite

## Prerequisites

- Node.js 18+
- npm or yarn
- A Base44 account and app

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/danny-shindel/battleship.git
   cd battleship
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   VITE_BASE44_APP_ID=your_app_id_here
   VITE_BASE44_FUNCTIONS_VERSION=latest
   VITE_BASE44_APP_BASE_URL=https://your-app-name.base44.app
   ```

   Get these values from your [Base44 dashboard](https://app.base44.com).

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript type checking

## Game Rules

1. **Setup Phase**: Each player places 5 ships on their 10x10 grid
2. **Attack Phase**: Players take turns attacking opponent's grid
3. **Win Condition**: First player to sink all enemy ships wins

### Ships
- Carrier (5 cells)
- Battleship (4 cells)
- Cruiser (3 cells)
- Submarine (3 cells)
- Destroyer (2 cells)

## Project Structure

```
src/
├── api/                 # Base44 API client
├── components/
│   ├── battleship/     # Game-specific components
│   └── ui/            # Reusable UI components (shadcn/ui)
├── hooks/             # Custom React hooks
├── lib/               # Utilities and contexts
├── pages/             # Route components
└── utils/             # Helper functions
```

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Base44
- **State Management**: React Query
- **Routing**: React Router
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- [Base44 Documentation](https://docs.base44.com)
- [Base44 Support](https://app.base44.com/support)
