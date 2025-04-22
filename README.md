# Lapse

## Your day, redesigned daily.

Lapse is a neurodivergent-friendly productivity app designed to help users manage their time effectively with personalized scheduling, AI assistance, and rewarding progress tracking.

## Features

- **Smart Scheduling**: Create and manage your daily schedule with color-coded event cards
- **AI Assistant**: Get personalized productivity tips and schedule optimization
- **Progress Tracking**: Visualize your daily progress and celebrate task completions
- **Points & Achievements**: Earn points and unlock achievements as you complete tasks
- **Neurodivergent-Focused Design**: UI/UX designed specifically for neurodivergent users

## Technology Stack

- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe JavaScript
- **NativeWind**: Tailwind CSS for React Native
- **Zustand**: State management
- **Expo**: Development and build tools
- **OpenAI API**: AI-powered assistant

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/karinagupta3/Lapse.git
   cd Lapse
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npx expo start
   ```

## Usage

1. **Onboarding**: Enter your name and select your neurodivergent diagnosis to personalize the experience
2. **Calendar**: View and manage your daily schedule with color-coded event cards
3. **AI Assistant**: Chat with the AI to get productivity tips and schedule optimization
4. **Points**: Track your progress and achievements

## Project Structure

```
src/
├── assets/          # Images, fonts, and other static files
├── components/      # Reusable UI components
├── config/          # Configuration files
├── data/            # Data stores and mock data
├── navigation/      # Navigation configuration
├── screens/         # App screens
├── services/        # API services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Special thanks to all contributors and testers
- Inspired by the needs of neurodivergent individuals
- Built with ❤️ for better productivity and mental well-being
