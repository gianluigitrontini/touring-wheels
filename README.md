# Touring Wheels - Bicycle Tour Planner

Touring Wheels is a Next.js web application designed to help cyclists meticulously plan their multi-week bicycle tours. It allows users to manage their routes, gear, and bikes, and get AI-powered insights for their trips.

## Current Features

The application is built with Next.js (App Router), React, ShadCN UI components, Tailwind CSS, and Genkit for AI functionalities.

### Core Sections:

1.  **Dashboard**:
    *   Provides an overview of the app's main sections: My Trips, Gear Library, and My Bikes.
    *   Includes a "Quick Stats" card (currently with placeholder/basic data).
    *   Has a section for "Recent Activity" (currently placeholder).

2.  **My Trips**:
    *   **List Trips**: Displays all planned trips in a card-based layout.
    *   **Plan New Trip**: Allows users to create a new trip by providing a name, description, and uploading a GPX file for the route.
    *   **Trip Detail View**:
        *   Displays the trip name and description.
        *   Features a tabbed interface:
            *   **Route & Map**: Renders the uploaded GPX track on an interactive map using Leaflet and OpenStreetMap. Also displays AI-suggested weather waypoints.
            *   **Weather**: Allows users to fetch AI-suggested waypoints along the route that are relevant for weather information. These points are based on the GPX data and trip description. Currently, it displays the point and reason, but not actual weather forecasts.
            *   **Gear List**:
                *   **Available Gear Library**: Lists all gear items from the main Gear Library, grouped by category in accordions. Users can select items for the current trip.
                *   **Selected for this Trip**: Shows items chosen for the trip, allowing users to pack items into selected "container" type gear (bags). Displays total weight of selected gear.
                *   Changes to gear selection and packing can be saved for the trip.
    *   **Trip Editing**: A link to an edit page exists on the trip list, but the edit page itself (`/trips/[tripId]/edit`) is not yet implemented.
    *   **Trip Deletion**: Trips can be removed from the list (currently a client-side mock removal).

3.  **Gear Library**:
    *   Allows users to add, edit, and delete gear items.
    *   Each gear item can have a name, weight (grams), notes, an image, an AI hint (for image search), item type (regular item or container/bag), and a category.
    *   Gear items are displayed in a card-based layout, grouped by categories using accordions.
    *   The "Add/Edit Gear Item" dialog allows selecting an existing category from a dropdown or typing in a new category name.
    *   Categories are sorted alphabetically, with "Miscellaneous" as a fallback.

4.  **My Bikes**:
    *   Allows users to add, edit, and delete bicycle models.
    *   Each bike can have a name, brand, model, year, an image, and notes.
    *   Bikes are displayed in a card-based layout.

### Technical Highlights:

*   **Frontend**: Next.js 15 with App Router, React 19, TypeScript.
*   **UI Components**: ShadCN UI.
*   **Styling**: Tailwind CSS with a custom theme.
*   **Mapping**: Leaflet with OpenStreetMap for GPX route visualization. `gpxparser` for parsing GPX files.
*   **AI Features**: Genkit is used for a flow (`extractRelevantWeatherPoints`) that analyzes GPX data and a trip description to suggest key locations for weather information.
*   **State Management**: Primarily React's `useState` and `useEffect`. `useToast` for notifications.
*   **Data Persistence**: Currently uses a mock in-memory "database" (`MOCK_DB_INSTANCE` on `globalThis`) managed via Server Actions for CRUD operations on trips, gear, and bikes. This data is seeded on initial load.
*   **Forms**: React Hook Form is used in some places implicitly via ShadCN or directly for form handling and validation.
*   **Image Handling**: Images are handled as Data URIs after upload and displayed using `next/image`. Placeholder images are from `placehold.co`.

## Getting Started

This project is managed within Firebase Studio.
To run locally:
1.  Ensure Node.js and npm/yarn are installed.
2.  Install dependencies: `npm install` or `yarn install`.
3.  Run the development server: `npm run dev` or `yarn dev`.
    *   The app will be available at `http://localhost:9002`.
    *   Genkit development server can be run with `npm run genkit:dev`.

The main application code is in the `src` directory, with pages primarily under `src/app/(app)/`.
The Genkit AI flow is located in `src/ai/flows/`.
Server actions for data manipulation are in `src/lib/actions.ts`.
UI components from ShadCN are in `src/components/ui/`, and custom layout/map components are in `src/components/layout/` and `src/components/map/` respectively.
Type definitions are in `src/lib/types.ts`.
Global styles and theme are in `src/app/globals.css`.
