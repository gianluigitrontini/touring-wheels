# Touring Wheels - Feature Checklist

This document outlines the features implemented in the Touring Wheels application and a list of potential future enhancements.

## Implemented Features

### Core Application Structure

- [x] Next.js App Router Setup
- [x] Main Layout (Sidebar, Header)
- [x] Responsive Design for Mobile/Desktop Navigation

### Dashboard

- [x] Dashboard Page (`/dashboard`)
- [x] Overview cards for Trips, Gear, Bikes
- [x] Placeholder for Quick Stats
- [x] Placeholder for Recent Activity

### My Trips

- [x] List existing trips (`/trips`)
  - [x] Filter trips by "Planned" and "Completed" status via sidebar links and on-page filters.
- [x] Create new trip page (`/trips/new`)
  - [x] Input for Trip Name
  - [x] Input for Trip Description (optional)
  - [x] Input for Trip Duration (days)
  - [x] GPX file upload component
- [x] Trip Detail Page (`/trips/[tripId]`)
  - [x] Display Trip Name and Description
  - [x] Display Trip Duration
  - [x] Display and allow changing Trip Status (Planned/Completed)
  - [x] Tabbed Interface:
    - [x] **Route & Map Tab**:
      - [x] Display GPX route on Leaflet/OpenStreetMap
      - [x] Display AI-suggested weather waypoints on map
    - [x] **Weather Tab**:
      - [x] Button to fetch AI-suggested weather points
      - [x] List AI-suggested weather points with reasons (no actual forecast yet)
    - [x] **Gear List Tab**:
      - [x] View "Available Gear Library" (from main library)
        - [x] Group available gear by category using Accordions
        - [x] Select/deselect gear items for the trip
      - [x] View "Selected for this Trip" items
        - [x] Pack selected items into "container" type gear items
        - [x] Unpack items from containers
        - [x] Display total weight of selected gear
      - [x] Save gear selections and packing state for the trip
    - [x] **Travel Diary Tab**:
      - [x] View and edit notes for each day of the trip (based on trip duration)
      - [x] Save daily notes
- [x] Client-side mock deletion of trips from the list
- [x] Sidebar links for "Planned" and "Completed" trips below "My Trips"
- [x] **Full Trip Editing Functionality** (implement `/trips/[tripId]/edit` page for name, description, duration, GPX file. Daily notes are editable on the trip detail page.)

### Gear Library

- [x] Gear Library Page (`/gear`)
- [x] Add new gear items
- [x] Edit existing gear items
- [x] Delete gear items
- [x] Gear item properties: Name, Weight, Notes, Image URL, AI Hint, Item Type (item/container), Category
- [x] Display gear items grouped by category using Accordions
- [x] Category management in Add/Edit Dialog:
  - [x] Select from existing unique categories
  - [x] Input field to add a new category name
- [x] Placeholder images for gear items

### My Bikes

- [x] My Bikes Page (`/bikes`)
- [x] Add new bike models
- [x] Edit existing bike models
- [x] Delete bike models
- [x] Bike properties: Name, Brand, Model, Year, Image URL, Notes
- [x] Placeholder images for bikes

### Mapping

- [x] Leaflet and OpenStreetMap for map rendering
- [x] GPX file parsing (`gpxparser`) and route display as Polyline
- [x] Display Waypoints as Markers with Popups

### AI Features

- [x] Genkit flow (`extractRelevantWeatherPoints`)
  - [x] Takes GPX data and trip description as input
  - [x] Outputs relevant latitude/longitude points with reasons

### UI & Styling

- [x] ShadCN UI components extensively used
- [x] Tailwind CSS for styling
- [x] Consistent application theme (Light mode primarily, basic dark mode styles exist)
- [x] Toast notifications for actions

### Data Handling

- [x] Mock in-memory database (`globalThis.MOCK_DB_INSTANCE`)
- [x] Server Actions for CRUD operations (Trips, Gear, Bikes)
- [x] Initial seeding of mock data for trips and gear

## To-Do / Future Enhancements

### Next improvements

- [x] Add "Completed" and "Planned" below "My Trips" in the sidebar. Allow filtering trips for those values.
- [x] Allow defining how many days a trip will last.
- [x] Add "Notes" for each day of the trip.
- [x] Add "Travel Diary" inside a trip to show all notes for a trip.

### Core Functionality

- [ ] **User Authentication & Authorization**
- [ ] **Real Database Integration** (e.g. Pocketbase with SqlLite)
- [ ] **Persistent Image Uploads** (e.g. Pocketbase with SqlLite) instead of Data URIs / temporary client URLs
- [ ] **Associate a specific Bike Model with a Trip**

### Dashboard Enhancements

- [ ] Determine which Quick Stats are useful and really add value to our webapp
- [ ] Implement dynamic data for "Quick Stats".
- [ ] Implement dynamic "Recent Activity" feed

### Weather Feature

- [ ] **Integrate a real Weather API** to fetch forecasts for waypoints
- [ ] Display actual weather forecast data (temperature, precipitation, wind)

### Gear & Packing List

- [ ] Calculate and display total weight per packed container
- [ ] Option to create/manage predefined packing list templates
- [ ] AI-powered packing list suggestions based on trip type, duration, weather

### Mapping & Route Analysis

- [ ] Display elevation profiles for GPX routes
- [ ] Calculate total distance, elevation gain/loss from GPX
- [ ] Allow manually adding/editing waypoints on the map
- [ ] Route planning tools (draw route, search for points of interest)

### User Experience & UI

- [ ] **Comprehensive Error Handling** and user feedback
- [ ] Advanced input validation
- [ ] Dark Mode refinement and theme switcher
- [ ] Internationalization (i18n) and Localization (l10n)
- [ ] Accessibility (ARIA attributes, keyboard navigation) improvements
- [ ] More sophisticated filtering and sorting for lists (Trips, Gear)
- [ ] Improve sidebar sub-item visual hierarchy/interaction

### Technical & Backend

- [ ] **Unit and Integration Tests** (e.g., Jest, React Testing Library, Playwright)
- [ ] CI/CD pipeline setup
- [ ] API rate limiting and security for AI features if publicly exposed
- [ ] Offline support / PWA features
- [ ] Backend solution for Genkit flows if deployed outside Next.js server environment

### Collaboration & Sharing

- [ ] Allow users to share trips (read-only or collaboratively)
- [ ] Export trip data (GPX, packing list)

### Settings

- [ ] User profile page
- [ ] Application settings (e.g., default units, map preferences)
