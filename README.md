# Chrona - Minimalist Study Timer

A clean, minimalist study timer application built with Next.js 14 and TypeScript. Track your study sessions with precision and style.

> 🎵 **Vibe-coded application** - Built with passion and good vibes! ✨

![Chrona Preview](./public/og-image.png)

## 🎯 Live Demo

**[Try Chrona Live →](https://session.kakoty.me/)**

## ✨ Features

-   **⏱️ Precise Timer**: Start, pause, and restart your study sessions
-   **📊 Session Tracking**: Automatic logging of pause sessions with timestamps
-   **💾 Persistent Storage**: Progress saved in localStorage - survives page refresh
-   **🌙 Midnight Reset**: Automatically creates new daily logs at midnight
-   **🎨 Animated UI**: Smooth colon animations when timer is running
-   **📱 Clean Design**: Minimalist interface with custom Array font
-   **🔥 Modern Stack**: Built with Next.js 14, TypeScript, and Tailwind CSS

## 🎯 Design

-   **Background**: Pure black (#000000)
-   **Primary Color**: Orange (#FF660D) for hours and interactive elements
-   **Secondary Color**: White (#FFFFFF) for minutes, seconds, and text
-   **Typography**: Custom Array font for consistent, professional look
-   **Animations**: Pulsing colons that animate every second

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+ or Bun
-   npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd chrona
    ```

2. **Install dependencies**

    ```bash
    # Using bun (recommended)
    bun install

    # Or using npm
    npm install

    # Or using yarn
    yarn install
    ```

3. **Add the Array font**

    - Place `Array-Regular.otf` in the `src/font/` directory
    - The font should be located at `src/font/Array-Regular.otf`

4. **Run the development server**

    ```bash
    # Using bun
    bun dev

    # Or using npm
    npm run dev

    # Or using yarn
    yarn dev
    ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
chrona/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles and CSS variables
│   │   ├── layout.tsx           # Root layout with font configuration
│   │   └── page.tsx             # Home page
│   ├── components/
│   │   ├── ui/
│   │   │   └── Button.tsx       # Reusable button component
│   │   ├── TimerWrapper.tsx     # Main timer logic (Client Component)
│   │   ├── TimerDisplay.tsx     # Timer display with animations
│   │   ├── TimerControls.tsx    # Start/Stop/Restart buttons
│   │   └── LogsList.tsx         # Daily logs display
│   ├── font/
│   │   └── Array-Regular.otf    # Custom font file
│   ├── lib/
│   │   ├── fonts.ts             # Font configuration
│   │   └── utils.ts             # Utility functions
│   └── utils/
│       ├── formatTime.ts        # Time formatting utilities
│       ├── getTodayDate.ts      # Date utilities
│       ├── parseTime.ts         # Time parsing utilities
│       └── localStorageHelpers.ts # localStorage management
├── next.config.ts               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── package.json                 # Dependencies and scripts
```

## 🎮 How to Use

### Basic Timer Operations

1. **Start Timer**: Click "start session" to begin timing
2. **Pause Timer**: Click "pause session" to pause (shows both pause and restart options)
3. **Restart Timer**: Click "restart session" to reset timer to 00:00:00

### Session Tracking

-   Each time you pause, the app records:
    -   Exact pause time (e.g., "2:20 AM")
    -   Duration of that study session
    -   Session number (1st pause, 2nd pause, etc.)

### Daily Logs

-   View all your study sessions organized by date
-   See total study time per day
-   Detailed breakdown of each pause session
-   Logs are sorted with most recent day first

### Data Persistence

-   Timer state is automatically saved every second
-   If you refresh the page while timer is running, it continues from where you left off
-   Daily logs are preserved across browser sessions
-   At midnight, the app automatically creates a new daily log entry

## 🛠️ Technical Details

### Architecture

-   **Next.js 14 App Router**: Modern React framework with server/client components
-   **TypeScript**: Full type safety throughout the application
-   **Tailwind CSS**: Utility-first CSS framework with custom design system
-   **Client-Side Storage**: localStorage for persistence without backend

### Key Components

-   **TimerWrapper**: Main client component managing timer state and logic
-   **TimerDisplay**: Shows formatted time with animated colons
-   **TimerControls**: Button interface for timer operations
-   **LogsList**: Displays historical study session data
-   **Button**: Reusable shadcn-style button component

### CSS Variables

```css
--color-background: hsl(0 0% 0%)        /* Black */
--color-foreground: hsl(0 0% 100%)      /* White */
--color-primary: hsl(24 99% 49%)        /* Orange #FF660D */
--color-secondary: hsl(0 0% 100%)       /* White */
--font-array: var(--array-font)         /* Custom Array font */
```

## 📦 Dependencies

### Core Dependencies

-   **Next.js 15.4.5**: React framework
-   **React 19.1.0**: UI library
-   **TypeScript 5**: Type safety

### UI Dependencies

-   **@radix-ui/react-slot**: Polymorphic component primitives
-   **class-variance-authority**: Component variant management
-   **clsx**: Conditional className utility
-   **tailwind-merge**: Tailwind class merging

### Development Dependencies

-   **Tailwind CSS 4**: Utility-first CSS framework
-   **ESLint**: Code linting
-   **@tailwindcss/postcss**: PostCSS integration

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Ensure font file** is included in `src/font/Array-Regular.otf`
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

1. **Build the application**

    ```bash
    npm run build
    ```

2. **Start production server**
    ```bash
    npm start
    ```

## 🎨 Customization

### Colors

Update CSS variables in `src/app/globals.css`:

```css
@theme {
    --color-primary: hsl(24 99% 49%); /* Change primary color */
    --color-secondary: hsl(0 0% 100%); /* Change secondary color */
    --color-background: hsl(0 0% 0%); /* Change background */
}
```

### Font

Replace `src/font/Array-Regular.otf` with your preferred font and update `src/lib/fonts.ts`:

```typescript
export const customFont = localFont({
    src: "../font/YourFont.otf",
    display: "swap",
    variable: "--custom-font",
});
```

### Timer Display

Modify `src/components/TimerDisplay.tsx` to change:

-   Font sizes
-   Layout
-   Animation behavior
-   Color scheme

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

## 📸 Preview

![Chrona Study Timer](./public/og-image.png)

**Built with ❤️ and good vibes by [@animesh](https://x.com/_animeshkakoty) using Next.js, TypeScript, and Tailwind CSS**

_This is a vibe-coded application - crafted with passion, creativity, and positive energy! 🎵✨_
