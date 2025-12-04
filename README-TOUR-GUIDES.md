# Tour Guides Management

## Overview
Tour guides are stored in `assets/data/tour-routes.json`. Each tour route is linked to an item (tourism, culinary, hotel, or event) via the `destinationId` field.

## Where Tour Guides Are Stored

**File Location:** `assets/data/tour-routes.json`

This JSON file contains an array of tour routes. Each route has:
- `id`: Unique route identifier (e.g., "route-pulau-para")
- `destinationId`: The ID of the item this route belongs to (e.g., "tourism-1", "tourism-batuwingkung")
- `destinationName`: Display name of the destination
- `checkpoints`: Array of checkpoints to visit
- `transports`: Array of transportation options
- `totalEstimatedTime`: Total time in minutes
- `difficulty`: "easy", "medium", or "hard"
- `description`: Route description

## How to Create/Edit Tour Guides

### Option 1: Manual Editing
1. Open `assets/data/tour-routes.json`
2. Add or edit tour route objects
3. Make sure `destinationId` matches the item's ID from Firestore
4. Save the file

### Option 2: Automatic Generation (Recommended)
Run the seeding script to automatically generate tour routes for all items that don't have one:

```bash
node scripts/seed-tour-routes.mjs
```

This script will:
- Fetch all items from Firestore (tourism, culinary, hotels, events)
- Check which items don't have tour routes
- Generate basic tour routes for missing items
- Update `tour-routes.json` with new routes

### Option 3: Admin Panel (Future Enhancement)
You can create an admin interface to manage tour routes through the app UI.

## Current Matching Logic

The app matches tour routes to items in two ways:
1. **By ID**: Exact match of `destinationId` with item `id`
2. **By Name**: If ID doesn't match, it tries to match by name (case-insensitive, partial match)

## Example Tour Route Structure

```json
{
  "id": "route-pulau-para",
  "destinationId": "tourism-1",
  "destinationName": "Pulau Para (Negeri 8 Pantai)",
  "checkpoints": [
    {
      "id": "checkpoint-para-1",
      "name": "Pelabuhan Tahuna",
      "description": "Titik keberangkatan menuju Pulau Para...",
      "latitude": 3.609000,
      "longitude": 125.489000,
      "type": "landmark",
      "order": 1,
      "estimatedTime": 0,
      "notes": "Perahu berangkat setiap jam..."
    }
  ],
  "transports": [
    {
      "id": "transport-para-1",
      "name": "Perahu Tradisional",
      "type": "boat",
      "description": "Perahu tradisional menuju Pulau Para",
      "price": "Rp 50.000",
      "schedule": ["07:00", "09:00", "11:00", "13:00", "15:00"],
      "duration": "45 menit",
      "bookingUrl": "",
      "departurePoint": "Pelabuhan Tahuna",
      "arrivalPoint": "Pulau Para"
    }
  ],
  "totalEstimatedTime": 180,
  "difficulty": "medium",
  "description": "Perjalanan wisata ke Pulau Para..."
}
```

## Ensuring All Items Have Tour Guides

To ensure every item has a tour guide:

1. **Run the seeding script:**
   ```bash
   node scripts/seed-tour-routes.mjs
   ```

2. **The script will:**
   - Connect to Firestore
   - Fetch all items from all categories
   - Generate tour routes for items that don't have one
   - Update `tour-routes.json`

3. **After running, refresh the app** - all items should now show the "Start Guided Tour" button

## Notes

- The generated routes are basic templates. You can edit them manually in `tour-routes.json` to add more detailed checkpoints and transports.
- Routes are loaded from the JSON file when the app starts
- Routes are cached in AsyncStorage for faster loading
- The matching logic will try to match by ID first, then by name if ID doesn't match

