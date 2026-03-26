# Dynamic Signup Form Component

A modern, single-page React signup form with conditional rendering based on education level.

## Features

- ✅ Single-page dynamic form (no step navigation)
- ✅ Conditional field rendering based on education level
- ✅ Smooth animations and transitions
- ✅ Modern dark theme with Tailwind CSS
- ✅ Card-based layout with sections
- ✅ API integration for institute loading
- ✅ Clean state management

## Usage

```jsx
import React from 'react';
import DynamicSignupForm from './DynamicSignupForm';

function App() {
  return (
    <div className="App">
      <DynamicSignupForm />
    </div>
  );
}

export default App;
```

## Form Structure

### 1. Personal Info
- Full Name (required)

### 2. Education Info
- Education Level (School/College/University)

#### Dynamic Fields Based on Level:

**School:**
- Institute dropdown (loads from API)
- Class dropdown (8, 9, 10)

**College:**
- Institute dropdown (loads from API)
- Year dropdown (1st Year, 2nd Year)
- Field dropdown (Pre-Engineering, Pre-Medical)

**University:**
- Institute dropdown (loads from API)
- Level dropdown (Undergraduate)
- Field dropdown (CS, BBA, Engineering, Medical, Arts)

### 3. Account Info
- Email (required)
- Password (required, min 6 chars)

## API Integration

The component expects an API endpoint at `/api/institutes?type={level}` that returns:

```json
[
  {
    "institute_id": "1",
    "name": "Sample Institute 1"
  },
  {
    "institute_id": "2",
    "name": "Sample Institute 2"
  }
]
```

## Styling

Uses Tailwind CSS classes with custom animations. Make sure to include the custom CSS from `signup-styles.css` for enhanced animations.

## Dependencies

```json
{
  "react": "^18.0.0",
  "tailwindcss": "^3.0.0"
}
```

## State Management

Uses React's `useState` and `useEffect` for clean state management:

- Form data stored in single state object
- Dynamic field resets when education level changes
- API loading states handled properly