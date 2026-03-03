# HomesteadHub User Manual

**Version 1.0**
*Your Complete Farm and Homestead Management System*

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [First-Time Setup](#first-time-setup)
4. [Onboarding Tour](#onboarding-tour)
5. [Dashboard Overview](#dashboard-overview)
6. [Food Storage Management](#food-storage-management)
7. [Garden Planning](#garden-planning)
8. [Livestock Management](#livestock-management)
9. [Equipment Maintenance](#equipment-maintenance)
10. [Task Scheduling](#task-scheduling)
11. [Resource Tracking](#resource-tracking)
12. [Weather Integration](#weather-integration)
13. [Emergency Preparedness](#emergency-preparedness)
14. [Notifications](#notifications)
15. [Settings & Configuration](#settings--configuration)
16. [Data Management](#data-management)
17. [Offline Mode](#offline-mode)
18. [Best Practices & Tips](#best-practices--tips)
19. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is HomesteadHub?

HomesteadHub is a comprehensive, self-hosted farm and homestead management system designed for engineers, farmers, and survivalists who take self-reliance seriously. Built with modern web technologies, HomesteadHub helps you manage every aspect of your homestead operation—from emergency food storage to livestock health records—all while maintaining complete control over your data.

### Key Features

- **100% Self-Hosted**: Your data stays on your hardware, no cloud dependencies
- **Offline-First**: Full functionality without internet connectivity
- **No Subscriptions**: One-time setup, zero recurring fees
- **Comprehensive Tracking**: Manage storage, livestock, equipment, gardens, and more
- **Smart Alerts**: Automated notifications for expiring items and maintenance schedules
- **Emergency Ready**: Built-in preparedness checklists and resource tracking

### Who Is This For?

- **Engineers & Tech-Savvy Farmers**: Those who want complete control over their data
- **Homesteaders**: Anyone managing a self-sufficient property
- **Preppers & Survivalists**: Those focused on emergency preparedness
- **Small Farm Operators**: Farmers needing comprehensive record-keeping
- **Hobby Farmers**: Anyone with chickens, gardens, or small livestock

---

## Getting Started

### System Requirements

**Minimum Requirements:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for initial setup
- Node.js 18+ (for self-hosting)
- 2GB RAM
- 1GB storage space

**Recommended:**
- 4GB+ RAM for larger homesteads
- SSD storage for better performance
- Backup solution for database

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ArchitectVS7/homestead-hub
   cd homestead-hub
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database connection details
   ```

4. **Initialize Database**
   ```bash
   npm run db:push
   ```

5. **Start the Application**
   ```bash
   npm run dev
   ```

6. **Access HomesteadHub**
   - Open your browser to `http://localhost:3000`
   - You'll be greeted with the welcome screen

---

## First-Time Setup

### Creating Your PIN

When you first access HomesteadHub, you'll be prompted to create a secure PIN.

**Steps:**
1. Enter a PIN (minimum 4 characters)
2. Confirm your PIN
3. Click "Complete Setup"

**Important Security Notes:**
- ⚠️ **Remember your PIN**: There is no password recovery
- ✅ **Use a strong PIN**: Consider 6+ characters with mixed types
- 🔒 **Keep it private**: This PIN protects all your homestead data
- 📝 **Store it safely**: Write it down in a secure location

Once your PIN is set, you'll be redirected to the dashboard where the onboarding tour will automatically begin.

---

## Onboarding Tour

### Overview

The onboarding tour is a 5-step guided walkthrough that introduces you to HomesteadHub's key features. It automatically appears the first time you access your dashboard.

### Tour Steps

**Step 1: Welcome to HomesteadHub**
- Introduction to the platform
- Overview of core capabilities
- Understanding the self-hosted advantage

**Step 2: Food Storage & Inventory**
- Learn about tracking emergency supplies
- Understanding expiration alerts
- Organizing by categories

**Step 3: Livestock & Garden Management**
- Animal health records
- Production tracking
- Garden planning and planting calendars

**Step 4: Equipment Maintenance**
- Service scheduling
- Maintenance history
- Automated reminders

**Step 5: Tasks & Planning**
- Recurring task management
- Priority levels
- Daily to annual planning

### Loading Example Data

At the end of the tour, you'll be asked: **"Start with Example Test Data?"**

**If You Choose "Load Example Data":**
- 12 storage items with realistic expiration dates
- 4 crops with planting records
- 4 equipment items with maintenance logs
- 5 animals (3 chickens, 2 goats) with records
- 7 tasks in various states
- Resource consumption logs
- Emergency preparedness checklist

**Benefits:**
- Explore all features immediately
- Understand data structures
- Practice with realistic examples
- Learn before entering your own data

**If You Choose "Start with Empty Project":**
- Begin with a clean slate
- Enter only your actual data
- No cleanup needed later

**Note:** You can safely delete all example data later from Settings → Data Management.

### Skipping the Tour

You can skip the tour at any time by clicking the **X** button in the top-right corner. The tour won't appear again once completed or skipped.

---

## Dashboard Overview

### Layout

The dashboard is your homestead command center, providing at-a-glance visibility into your operation.

**Main Components:**

1. **Top Navigation Bar**
   - HomesteadHub logo and name
   - Current date display
   - Notification bell icon (with unread count)
   - Settings access

2. **Sidebar Menu**
   - Dashboard (home)
   - Storage
   - Garden
   - Livestock
   - Equipment
   - Tasks
   - Resources
   - Weather
   - Preparedness
   - Notifications
   - Settings

3. **Quick Stats Cards**
   - Items Expiring Soon (next 30 days)
   - Urgent Tasks (high priority items)
   - Total Active Tasks
   - Storage Items count

4. **Priority Tasks Section**
   - Upcoming tasks due soonest
   - Color-coded priority indicators:
     - 🔴 Red dot: Urgent
     - 🟡 Amber dot: High priority
     - 🟢 Green dot: Medium/Low priority
   - Shows category and due date

5. **Expiring Items Section**
   - Items expiring within 30 days
   - Location and quantity display
   - Direct link to storage inventory

### Navigation

**Using the Sidebar:**
- Click any menu item to navigate to that module
- Current page is highlighted
- Collapsible on mobile devices

**Quick Actions:**
- Click any quick stat card to jump to that module
- Click "View all" links to see complete lists
- Use the notification bell to check alerts

---

## Food Storage Management

### Overview

Track emergency food supplies, monitor expiration dates, and maintain optimal rotation schedules. Never let supplies expire unnoticed again.

### Adding Storage Items

**Steps:**
1. Navigate to **Storage** from the sidebar
2. Click **"Add Item"** button
3. Fill in the form:
   - **Name**: Item description (e.g., "White Rice")
   - **Category**: Select from dropdown
     - Grains
     - Legumes
     - Canned
     - Freeze-dried
     - Dehydrated
     - Condiments
     - Beverages
     - Other
   - **Quantity**: Amount (number)
   - **Unit**: Select measurement (lbs, oz, gallons, cans, bags, etc.)
   - **Location**: Where it's stored (e.g., "Basement Shelf A")
   - **Purchase Date**: When you bought it (optional)
   - **Expiration Date**: When it expires (important for alerts)
   - **Calories**: Per unit (optional, useful for emergency planning)
   - **Notes**: Any additional information
4. Click **"Save"**

### Viewing Storage Inventory

**Main View:**
- **All Items Tab**: Complete inventory list
- **Expiring Soon Tab**: Items expiring within your warning threshold
- **Search Bar**: Quick filter by name or location
- **Category Filter**: View specific categories only
- **Sort Options**:
  - By expiration date (soonest first)
  - By name (alphabetical)
  - By category
  - By quantity

**Item Display:**
Each item shows:
- Name and category badge
- Quantity and unit
- Storage location
- Expiration date (color-coded):
  - 🔴 Red: Expired or expiring very soon
  - 🟡 Amber: Expiring within warning threshold
  - 🟢 Green: Good condition
- Calorie count (if provided)

### Editing Storage Items

**Steps:**
1. Click on any item in the list
2. Edit any field
3. Click **"Update"**

**Bulk Operations:**
- Select multiple items using checkboxes
- Actions available:
  - Update location (move multiple items)
  - Delete selected items

### Rotation Best Practices

**FIFO Method (First In, First Out):**
1. Always place new items behind older ones
2. Use the expiration date sorting to identify items to use first
3. Set your warning threshold appropriately (Settings)

**Recommended Warning Thresholds:**
- **Freeze-dried/Dehydrated**: 90-180 days
- **Canned Goods**: 30-60 days
- **Grains in Mylar**: 90+ days
- **Commercial Canned**: 30 days

### Storage Tips

💡 **Organization Tips:**
- Use consistent location naming (e.g., "Basement-ShelfA-Row1")
- Group by category physically and in the app
- Update quantities when you consume items
- Use the notes field for storage method details

📊 **Inventory Planning:**
- Track calories to estimate emergency duration
- Balance different food categories
- Monitor seasonal items separately
- Plan rotation schedule around expiration dates

---

## Garden Planning

### Overview

Plan your garden beds, track planting schedules, manage crop varieties, and record harvest yields. Perfect for succession planting and zone-based gardening.

### Managing Crops

**Adding a Crop Variety:**
1. Navigate to **Garden** from sidebar
2. Click **"Crops"** tab
3. Click **"Add Crop"**
4. Enter crop details:
   - **Name**: Crop type (e.g., "Tomato")
   - **Variety**: Specific variety (e.g., "Roma", "Cherokee Purple")
   - **Days to Maturity**: Typical growing time
   - **Planting Depth**: Seed depth (e.g., "1/4 inch")
   - **Spacing**: Plant spacing (e.g., "24 inches")
   - **Sun Requirement**: Full, Partial, or Shade
   - **Water Requirement**: Low, Medium, or High
   - **Companion Plants**: JSON array of compatible plants
   - **Incompatible Plants**: Plants to avoid nearby
   - **Notes**: Growing tips, supplier info, etc.
5. Click **"Save Crop"**

**Editing Crops:**
- Click on any crop to edit
- Update information as you learn what works
- Delete crops you no longer grow

### Planning Plantings

**Creating a Planting:**
1. Click **"Plantings"** tab
2. Click **"Add Planting"**
3. Fill in planting details:
   - **Crop**: Select from your saved crops
   - **Location**: Bed name/number (e.g., "Garden Bed A1")
   - **Plant Date**: When you planted (or will plant)
   - **Transplant Date**: If starting indoors (optional)
   - **Expected Harvest**: Auto-calculated from maturity date
   - **Quantity**: Number of plants
   - **Notes**: Specific observations
4. Click **"Create Planting"**

**Tracking Plantings:**

Each planting shows:
- Crop name and variety
- Location in garden
- Planting date and expected harvest
- Current status:
  - 🌱 Planned (future date)
  - 🌿 Growing (between plant and harvest)
  - ✅ Harvested (completed)
- Days until harvest (for active plantings)

### Recording Harvests

**When You Harvest:**
1. Find the planting in your list
2. Click **"Record Harvest"**
3. Enter:
   - **Actual Harvest Date**: When you harvested
   - **Yield Amount**: How much you got
   - **Yield Unit**: lbs, count, bushels, etc.
   - **Success Rating**: How well it did
   - **Notes**: What worked, what didn't
4. Click **"Save"**

The planting status updates to "Harvested" and moves to the completed section.

### Succession Planting

**Strategy:**
1. Plan multiple plantings of the same crop
2. Stagger plant dates by 2-3 weeks
3. Use the calendar view to visualize overlap
4. Track which timing works best in your notes

**Example:**
- Lettuce Planting 1: March 15
- Lettuce Planting 2: April 1
- Lettuce Planting 3: April 15
- Continuous harvest: May through July

### Garden Planning Tips

🌱 **Zone-Based Planning:**
- Set your hardiness zone in Settings
- Track last frost date in notes
- Use companion planting data for layout
- Record what works in your specific zone

📅 **Calendar Management:**
- Plan spring garden in winter
- Review last year's notes when planning
- Set task reminders for planting dates
- Track succession plantings carefully

📊 **Yield Tracking:**
- Record actual yields for planning
- Compare varieties for best performers
- Calculate garden productivity
- Plan storage needs based on yields

---

## Livestock Management

### Overview

Track animals, health records, breeding schedules, veterinary care, and production data. Manage herds and flocks with comprehensive record-keeping.

### Adding Animals

**Steps:**
1. Navigate to **Livestock** from sidebar
2. Click **"Add Animal"**
3. Fill in details:
   - **Name**: Animal's name (optional)
   - **Tag/ID**: Ear tag, leg band, collar number
   - **Type**: Chicken, cow, goat, sheep, pig, etc.
   - **Breed**: Specific breed
   - **Sex**: Male, Female, or Unknown
   - **Birth Date**: Date of birth (or estimate)
   - **Acquired Date**: When you got the animal
   - **Status**: Active, Sold, Deceased, Processed
   - **Parent ID**: For tracking lineage (optional)
   - **Notes**: Temperament, special needs, etc.
4. Click **"Save Animal"**

### Viewing Your Herd/Flock

**Filter Options:**
- **Status**: Active, Sold, Deceased, All
- **Type**: Filter by animal type
- **Search**: Find by name or tag

**Animal Cards Display:**
- Photo placeholder or uploaded image
- Name and tag number
- Type and breed
- Age (calculated from birth date)
- Status badge
- Quick stats:
  - Health records count
  - Production logs count
  - Last vet visit date

### Health Records

**Adding a Health Record:**
1. Click on an animal
2. Click **"Health"** tab
3. Click **"Add Record"**
4. Enter details:
   - **Date**: Date of treatment/observation
   - **Type**: Select from:
     - Vaccination
     - Medication
     - Vet Visit
     - Observation
     - Treatment
   - **Description**: What happened
   - **Medication**: Drug name (if applicable)
   - **Dosage**: Amount given
   - **Cost**: Veterinary cost (optional)
   - **Performed By**: Vet name or "Self"
   - **Next Due**: Follow-up date
   - **Notes**: Additional observations
5. Click **"Save Record"**

**Health Record Display:**
- Chronological list of all records
- Upcoming due dates highlighted
- Color-coded by type
- Vaccination schedule tracking

### Production Logs

**Recording Production:**

For egg-laying chickens, dairy animals, fiber producers, etc.

**Steps:**
1. Click on an animal
2. Click **"Production"** tab
3. Click **"Log Production"**
4. Enter:
   - **Date**: Production date
   - **Type**: Eggs, Milk, Wool, etc.
   - **Quantity**: Amount produced
   - **Unit**: Count, gallons, lbs, etc.
   - **Quality**: Grade A, B, etc. (optional)
   - **Notes**: Observations
5. Click **"Save"**

**Production Statistics:**
- Daily/weekly/monthly totals
- Average production per animal
- Trends over time
- Peak production periods

### Breeding Management

**Tracking Lineage:**
- Use Parent ID field to link offspring
- View family tree
- Track breeding dates in health records
- Note breeding success in production notes

**Breeding Records:**
- Record breeding date in health records
- Set expected due date reminder
- Track birth outcomes
- Link offspring to parents

### Livestock Management Tips

🐔 **Daily Routines:**
- Log daily production (eggs, milk)
- Check health observations
- Update any status changes
- Note unusual behavior in records

💉 **Vaccination Tracking:**
- Set "Next Due" dates for all vaccines
- Enable notifications for upcoming vaccines
- Keep medication records detailed
- Track reactions or side effects

📊 **Production Analysis:**
- Compare individual animal productivity
- Identify top producers for breeding
- Track seasonal variations
- Calculate feed conversion ratios

---

## Equipment Maintenance

### Overview

Schedule and track maintenance for tractors, generators, vehicles, and tools. Log service history, set reminders, and prevent equipment failures before they happen.

### Adding Equipment

**Steps:**
1. Navigate to **Equipment** from sidebar
2. Click **"Add Equipment"**
3. Fill in details:
   - **Name**: Equipment description
   - **Category**: Select type:
     - Tractor
     - Mower
     - Chainsaw
     - Generator
     - Vehicle
     - Tool
     - Other
   - **Make**: Manufacturer
   - **Model**: Model number
   - **Serial Number**: For warranty/identification
   - **Purchase Date**: When you bought it
   - **Purchase Price**: Original cost
   - **Location**: Where it's stored
   - **Status**:
     - Operational (green)
     - Needs Service (yellow)
     - Out of Service (red)
   - **Service Interval (Hours)**: For hour-based equipment
   - **Service Interval (Days)**: For calendar-based maintenance
   - **Current Hours**: Hour meter reading
   - **Notes**: Special requirements, manual location, etc.
4. Click **"Save Equipment"**

### Viewing Equipment

**Main List:**
- All equipment cards with key info
- Status indicators (color-coded)
- Service due warnings
- Hours until next service
- Quick action buttons

**Filter & Sort:**
- Filter by category
- Filter by status
- Sort by service due date
- Search by name or serial number

### Maintenance Records

**Logging Maintenance:**
1. Click on equipment
2. Click **"Add Maintenance"** or edit existing
3. Enter details:
   - **Date**: Service date
   - **Type**: Select from:
     - Oil Change
     - Repair
     - Inspection
     - Part Replacement
     - Tune-up
     - Other
   - **Description**: Detailed description of work
   - **Hours at Service**: Current hour meter reading
   - **Cost**: Total cost of service
   - **Parts Used**: List of parts (JSON array)
   - **Performed By**: Mechanic name or "Self"
   - **Notes**: Additional details
4. Click **"Save Record"**

**Maintenance History:**
- Complete chronological record
- Cost tracking over time
- Part replacement history
- Service interval adherence

### Service Reminders

**Automatic Calculations:**

HomesteadHub automatically calculates when service is due based on:

**Hour-Based:**
- Current hours vs. last service hours
- Service interval hours
- Shows "Due in X hours" or "Overdue by X hours"

**Calendar-Based:**
- Days since last service
- Service interval days
- Shows "Due in X days" or "Overdue by X days"

**Setting Up Reminders:**
1. Ensure service intervals are set correctly
2. Update current hours regularly
3. Check Equipment page for due items
4. Yellow/red badges indicate action needed

### Equipment Tracking Tips

🔧 **Preventive Maintenance:**
- Service before due dates, not after
- Keep spare parts on hand
- Document all services, even minor ones
- Track fuel consumption in Resource Tracking

⏱️ **Hour Meter Tracking:**
- Update hours regularly (weekly)
- Set phone reminders to check meters
- Create recurring task for hour updates
- Use accurate readings for best results

💰 **Cost Management:**
- Log all costs, including DIY labor
- Track parts suppliers in notes
- Compare costs over time
- Budget for upcoming major services

---

## Task Scheduling

### Overview

Manage daily chores, weekly tasks, monthly projects, and annual planning. Create recurring tasks with intelligent scheduling and priority management.

### Creating Tasks

**Steps:**
1. Navigate to **Tasks** from sidebar
2. Click **"Add Task"**
3. Fill in task details:
   - **Title**: Clear, actionable title
   - **Description**: Detailed instructions (optional)
   - **Category**: Select from:
     - Garden
     - Livestock
     - Equipment
     - Storage
     - General
   - **Priority**:
     - Low (green)
     - Medium (blue)
     - High (yellow)
     - Urgent (red)
   - **Next Due Date**: When it's due
   - **Recurrence Rule**: For recurring tasks (see below)
   - **Estimated Minutes**: Time to complete
   - **Assigned To**: Person responsible (optional)
   - **Notes**: Additional context
4. Click **"Create Task"**

### Recurrence Rules

HomesteadHub uses iCal RRULE format for flexible recurring tasks.

**Common Patterns:**

**Daily:**
```
FREQ=DAILY;INTERVAL=1
```
Example: Collect eggs, water plants

**Weekly:**
```
FREQ=WEEKLY;INTERVAL=1
```
Example: Clean chicken coop every Monday

**Bi-Weekly:**
```
FREQ=WEEKLY;INTERVAL=2
```
Example: Mow lawn every 2 weeks

**Monthly:**
```
FREQ=MONTHLY;INTERVAL=1
```
Example: Inspect generator, rotate stored water

**Quarterly:**
```
FREQ=MONTHLY;INTERVAL=3
```
Example: Deep clean equipment shed

**Yearly:**
```
FREQ=YEARLY;INTERVAL=1;BYMONTH=3
```
Example: Order seeds every March

**Seasonal (Specific Days):**
```
FREQ=YEARLY;BYMONTH=4,8;BYMONTHDAY=15
```
Example: Plant tomatoes April 15, harvest Aug 15

### Managing Tasks

**Task Views:**

**All Tasks Tab:**
- Complete list of all tasks
- Filter by category
- Filter by priority
- Sort by due date or creation date

**Upcoming Tab:**
- Tasks due within next 7 days
- Sorted by due date
- Priority indicators visible

**Overdue Tab:**
- Past-due tasks in red
- Sorted by how overdue

**Completed Tab:**
- Recently completed tasks
- Completion history
- Duration tracking

### Completing Tasks

**One-Time Tasks:**
1. Click checkbox next to task
2. Task is marked complete
3. If recurring, next occurrence is automatically scheduled

**Recording Completion Details:**
1. Click on task
2. Click **"Complete Task"**
3. Enter:
   - **Completed By**: Person who did it
   - **Duration**: Actual time taken (minutes)
   - **Notes**: How it went, issues encountered
4. Click **"Save Completion"**

**Task History:**
- All completions are logged
- Compare estimated vs. actual time
- Track who completes what
- Review completion notes for patterns

### Task Workflow Examples

**Example 1: Daily Egg Collection**
```
Title: Collect and wash eggs
Category: Livestock
Priority: Medium
Recurrence: FREQ=DAILY;INTERVAL=1
Estimated: 15 minutes
```

**Example 2: Monthly Equipment Check**
```
Title: Inspect generator and test run
Category: Equipment
Priority: High
Recurrence: FREQ=MONTHLY;INTERVAL=1
Estimated: 45 minutes
Notes: Check oil, fuel stabilizer, run for 30min under load
```

**Example 3: Quarterly Food Rotation**
```
Title: Rotate emergency food supplies
Category: Storage
Priority: Medium
Recurrence: FREQ=MONTHLY;INTERVAL=3
Estimated: 120 minutes
Notes: Use FIFO method, check for pests
```

### Task Management Tips

📋 **Organization:**
- Use clear, action-oriented titles
- Be specific in descriptions
- Set realistic priority levels
- Don't over-schedule

⏰ **Time Management:**
- Group similar tasks together
- Schedule large tasks in advance
- Use estimated times for planning
- Review and adjust estimates based on actuals

🔔 **Staying on Track:**
- Check dashboard daily for upcoming tasks
- Enable notifications (Settings)
- Mark tasks complete immediately after finishing
- Review overdue tasks weekly

---

## Resource Tracking

### Overview

Monitor consumption and purchases of water, fuel, seeds, feed, propane, and other critical homestead resources. Track usage patterns, calculate costs, and plan inventory levels.

### Logging Resource Activity

**Adding a Resource Log:**
1. Navigate to **Resources** from sidebar
2. Click **"Add Log Entry"**
3. Fill in details:
   - **Resource Type**: Select or type:
     - Water
     - Fuel (gasoline, diesel)
     - Propane
     - Feed (chicken, livestock)
     - Seeds
     - Fertilizer
     - Hay/Straw
     - Bedding
     - Other
   - **Action Type**: Select:
     - Purchase (adding to inventory)
     - Usage (consuming from inventory)
     - Adjustment (correcting inventory)
   - **Quantity**: Amount
   - **Unit**: Gallons, lbs, bags, bales, etc.
   - **Date**: When transaction occurred
   - **Cost**: Purchase price (for purchases)
   - **Vendor**: Where you bought it (optional)
   - **Notes**: Purpose, details
4. Click **"Save Log"**

### Viewing Resource Data

**Summary View:**

For each resource type tracked, see:
- **Current Level**: Calculated inventory
- **Recent Activity**: Last few transactions
- **30-Day Usage**: Total consumed this month
- **Average Daily Use**: Consumption rate
- **Estimated Days Remaining**: Based on usage rate

**History View:**
- Complete transaction log
- Filter by resource type
- Filter by action (purchase/usage)
- Date range selection
- Export to CSV

### Resource Categories

**Water:**
- Track well usage, municipal supply, rainwater collection
- Monitor garden irrigation separately
- Calculate consumption per season
- Plan for droughts

**Fuel:**
- Separate gasoline and diesel
- Track equipment usage
- Monitor prices over time
- Plan reserves for emergencies

**Animal Feed:**
- Different feeds for different animals
- Track consumption per animal or group
- Monitor seasonal variations
- Calculate cost per animal

**Garden Supplies:**
- Seeds, fertilizer, amendments
- Seasonal purchases
- Supplier tracking
- Planning for next season

### Understanding the Resource Dashboard

**Resource Cards:**

Each tracked resource shows:
- **Resource Icon**: Visual identifier
- **Current Level**: Quantity on hand
- **Status Indicator**:
  - 🟢 Green: Good (>30 days)
  - 🟡 Yellow: Low (15-30 days)
  - 🔴 Red: Critical (<15 days)
- **Trend**: Usage increasing/decreasing
- **Last Updated**: Most recent log entry

**Charts & Analytics:**
- Consumption trends over time
- Cost analysis per resource
- Seasonal variation graphs
- Usage by category breakdown

### Resource Tracking Tips

💧 **Inventory Management:**
- Update logs regularly (weekly minimum)
- Be consistent with units
- Separate storage locations if needed
- Use notes field for context

📊 **Planning:**
- Review monthly consumption patterns
- Plan bulk purchases during sales
- Maintain minimum reserve levels
- Track seasonal variations

💰 **Cost Analysis:**
- Compare vendors over time
- Calculate cost per unit consistently
- Watch for price trends
- Budget based on historical usage

---

## Weather Integration

### Overview

Track local weather conditions, receive frost alerts, monitor precipitation, and maintain historical weather records. Plan homestead activities around weather patterns.

### Manual Weather Logging

**Adding Weather Data:**
1. Navigate to **Weather** from sidebar
2. Click **"Log Weather"**
3. Enter observations:
   - **Timestamp**: Date and time
   - **Temperature**: °F or °C (based on settings)
   - **Feels Like**: Wind chill/heat index
   - **Humidity**: Percentage
   - **Wind Speed**: MPH or km/h
   - **Wind Direction**: N, NE, E, SE, S, SW, W, NW
   - **Precipitation**: Inches or mm
   - **Conditions**: Select:
     - Clear
     - Partly Cloudy
     - Cloudy
     - Rain
     - Snow
     - Fog
     - Thunderstorm
   - **Pressure**: Barometric pressure (hPa)
   - **UV Index**: 0-11+
   - **Source**: Manual, weather station, app, etc.
   - **Notes**: Observations, sky conditions, etc.
4. Click **"Save"**

### Weather Dashboard

**Current Conditions Card:**
- Latest temperature and conditions
- Feels like temperature
- Wind speed and direction
- Humidity percentage
- Last update time

**7-Day History:**
- Temperature trends
- Precipitation totals
- Condition patterns
- Useful for pattern recognition

**Alerts Section:**
- ⚠️ Frost warnings (automatically generated)
- 🌧️ Heavy precipitation alerts
- 🌡️ Extreme temperature warnings
- Custom alerts based on your settings

### Weather History

**Viewing Historical Data:**
- Search by date range
- Filter by conditions
- Export data to CSV
- Compare year-over-year

**Useful Analyses:**
- **First/Last Frost Dates**: Track annually
- **Growing Season Length**: For garden planning
- **Precipitation Totals**: Water management
- **Temperature Extremes**: Equipment limits
- **Storm Patterns**: Emergency preparedness

### Integration Options

**Weather API (Future):**
The application supports OpenWeatherMap API integration.

**To Set Up:**
1. Get API key from OpenWeatherMap.org
2. Navigate to Settings
3. Enter API key
4. Enter your zip code
5. Save settings

**Benefits:**
- Automatic weather updates
- Forecasts (coming soon)
- Reduced manual data entry

### Weather Tracking Tips

🌡️ **Monitoring:**
- Log weather at consistent times
- Use a quality thermometer/station
- Track precipitation accurately
- Note unusual conditions

📅 **Seasonal Planning:**
- Record first/last frost dates yearly
- Track growing season length
- Note extreme weather events
- Use history for next year's planning

🚨 **Alerts:**
- Set up frost alerts for your zone
- Monitor precipitation for irrigation planning
- Track severe weather for livestock shelter
- Note weather impacts on yields in crop records

---

## Emergency Preparedness

### Overview

Create and manage emergency checklists, track readiness levels, and ensure you're prepared for various scenarios. From 72-hour kits to long-term survival planning.

### Creating Checklists

**Adding a New Checklist:**
1. Navigate to **Preparedness** from sidebar
2. Click **"Create Checklist"**
3. Enter checklist details:
   - **Name**: Descriptive title
   - **Description**: Purpose and scope
   - **Category**: Select scenario:
     - Evacuation
     - Shelter-in-Place
     - Power Outage
     - Natural Disaster
     - Medical Emergency
     - Other
   - **Template**: Choose to start from template (optional)
   - **Notes**: Additional context
4. Click **"Create"**

### Managing Checklist Items

**Adding Items:**
1. Click on a checklist
2. Click **"Add Item"**
3. Enter:
   - **Title**: What needs to be ready/done
   - **Description**: Details, specifications
   - **Sort Order**: Position in list (auto-increments)
   - **Notes**: Where to find, how to prepare, etc.
4. Click **"Save Item"**

**Organizing Items:**
- Drag and drop to reorder (if supported)
- Edit sort order manually
- Group related items
- Use clear, actionable titles

**Completing Items:**
- Click checkbox to mark complete
- Completion date is automatically recorded
- Review completed items periodically
- Un-check to mark incomplete again

### Pre-Built Templates

**72-Hour Emergency Kit:**
Standard emergency supplies for 72 hours:
- Water (1 gallon/person/day)
- Non-perishable food
- First aid kit
- Flashlight and batteries
- Radio (battery or hand-crank)
- Important documents
- Cash in small denominations
- And more...

**Power Outage Preparedness:**
- Backup generator checklist
- Food preservation plan
- Water supply backup
- Communication plan
- Heating/cooling alternatives

**Natural Disaster Prep:**
- Storm shelter supplies
- Evacuation route planning
- Family communication plan
- Important contacts
- Emergency meeting points

### Readiness Score

**How It's Calculated:**

Your overall readiness score is based on:
- **Completed Items**: % of checked items
- **Checklist Coverage**: Types of emergencies covered
- **Recency**: When items were last reviewed

**Score Ranges:**
- 🔴 0-25%: Not Prepared - Needs Immediate Attention
- 🟡 26-50%: Basic Preparation - Keep Building
- 🟢 51-75%: Well Prepared - Good Progress
- ⭐ 76-100%: Highly Prepared - Excellent!

**Improving Your Score:**
1. Complete more checklist items
2. Add checklists for different scenarios
3. Review and update regularly
4. Verify items are actually ready

### Checklist Maintenance

**Regular Review:**
- Check completed items quarterly
- Update as situations change
- Replace expired supplies
- Practice evacuation plans
- Test emergency equipment

**Linking to Other Modules:**
- Track emergency food in Storage module
- Equipment maintenance for generators
- Resource tracking for fuel/water reserves
- Tasks for periodic testing/rotation

### Emergency Preparedness Tips

🎒 **Build Gradually:**
- Start with 72-hour kit
- Expand to 2-week supplies
- Eventually aim for 3-6 months
- Don't overwhelm yourself

🔄 **Rotation:**
- Set tasks for rotating supplies
- Check expiration dates regularly
- Use and replace, don't just store
- Practice with your gear

👨‍👩‍👧‍👦 **Family Planning:**
- Include all family members
- Assign responsibilities
- Practice emergency procedures
- Update contact lists regularly

---

## Notifications

### Overview

Stay informed with automated alerts for expiring items, upcoming maintenance, due tasks, and health reminders. Never miss critical homestead activities.

### Notification Types

HomesteadHub automatically generates notifications for:

**Storage Alerts:**
- Items expiring within warning threshold
- Items that have expired
- Low inventory levels (if tracked)

**Equipment Alerts:**
- Service due (hours-based)
- Service overdue
- Calendar-based maintenance due
- Equipment status changes

**Task Alerts:**
- Tasks due today
- Overdue tasks
- High priority tasks approaching

**Livestock Alerts:**
- Vaccinations due
- Health record follow-ups
- Unusual production patterns (future)

**Weather Alerts:**
- Frost warnings
- Extreme temperatures
- Heavy precipitation

### Viewing Notifications

**Notification Bell:**
- Located in top navigation bar
- Red badge shows unread count
- Click to open notification panel

**Notification Panel:**
- Recent notifications (last 30 days)
- Unread highlighted
- Click notification to go to related item
- Mark as read individually or all at once

**Notification Page:**
- Full history of all notifications
- Filter by type
- Filter by read/unread
- Search functionality
- Date range selection

### Notification Details

Each notification shows:
- **Type Icon**: Visual indicator
- **Title**: Brief description
- **Description**: Detailed message
- **Source Module**: Where it came from
- **Timestamp**: When it was created
- **Read Status**: Unread (bold) or read
- **Action Button**: Quick link to related item

### Managing Notifications

**Marking as Read:**
- Click on notification to mark read
- Click "Mark all as read" button
- Automatically marked when you visit related item

**Deleting Notifications:**
- Click trash icon on individual notification
- Bulk delete by selecting multiple
- Auto-delete after 30 days (configurable in future)

**Notification Settings:**

Currently automatic. Future features:
- Enable/disable by type
- Set custom thresholds
- Notification timing preferences
- Email notifications (for off-homestead monitoring)

### Notification Workflow

**Daily Routine:**
1. Check notification bell each morning
2. Review any red/urgent alerts
3. Click through to address items
4. Mark as read once handled

**Weekly Review:**
1. Open full notification page
2. Review all unread notifications
3. Identify patterns (recurring issues)
4. Adjust settings/schedules accordingly

### Notification Tips

🔔 **Staying Organized:**
- Check notifications daily
- Address urgent items immediately
- Don't let notifications pile up
- Use them to drive your daily priorities

⚙️ **System Optimization:**
- Adjust warning thresholds if too many alerts
- Update service intervals if equipment alerts are frequent
- Fine-tune task schedules to match actual workflow
- Use notifications to identify process improvements

📊 **Tracking Effectiveness:**
- Review notification history monthly
- See which alerts you act on vs. ignore
- Adjust settings to reduce noise
- Focus on actionable notifications

---

## Settings & Configuration

### Overview

Customize HomesteadHub to match your homestead's specific needs. Configure units, zones, warning thresholds, security, and more.

### Accessing Settings

1. Click **Settings** in the sidebar
2. Or click the gear icon in top navigation

### General Configuration

**Unit System:**
- **Imperial**: lbs, °F, inches, gallons, etc.
- **Metric**: kg, °C, cm, liters, etc.
- Affects new entries only
- Existing data retains original units

**Location Settings:**
- **Hardiness Zone**: e.g., "6b", "7a"
  - Used for garden planning
  - Determines frost date calculations
- **Zip Code**: Your location
  - For weather integration
  - Future: local alerts
- **Latitude/Longitude**: Precise location (optional)
  - For advanced weather features

**Alert Thresholds:**
- **Expiration Warning Days**: Default 30
  - When to alert for expiring storage items
  - Adjust based on rotation schedule
  - Recommend: 30-60 days for most items

### Security Settings

**Changing Your PIN:**
1. Scroll to Security section
2. Enter current PIN
3. Enter new PIN (4+ characters)
4. Confirm new PIN
5. Click **"Update PIN"**

**Security Best Practices:**
- Use 6+ character PIN
- Mix numbers and letters if supported
- Change PIN periodically
- Never share your PIN
- No password recovery available - remember it!

**Session Settings:**
- **Session TTL**: How long before auto-logout
- Default: 7 days
- Range: 1-30 days
- Balance security vs. convenience

### Weather API Configuration

**Setting Up Weather Integration:**
1. Get free API key from openweathermap.org
2. Enter API key in Weather API Key field
3. Save settings
4. Weather will auto-update

**Benefits:**
- Automatic weather data
- No manual logging needed
- Historical data backfill
- Future: forecasts and advanced alerts

### Data Management

**Starter Data:**

If you loaded example data during onboarding:

**Status Indicator:**
- Shows if starter data exists
- Warns that example data is in system

**Clear Starter Data Button:**
- Safely removes all example data
- Your real data is NOT affected
- Confirmation dialog shows what will be deleted
- Action is reversible only via database restore

**What Gets Deleted:**
- All storage items marked as starter
- Example crops and plantings
- Sample equipment and maintenance records
- Example animals and health records
- Sample tasks and completions
- Example resource logs
- Sample checklists

**What Stays:**
- All user-created data
- Your settings and preferences
- Your PIN and security settings

**Load Starter Data Button:**

If you started with an empty project:
- Load example data any time
- Explore features with realistic data
- Learn system before entering real data
- Can be cleared later

### Backup & Export

**Recommended Backup Strategy:**

Since HomesteadHub is self-hosted, YOU are responsible for backups.

**Database Backup:**
```bash
# For SQLite (default):
cp prisma/homestead.db prisma/homestead.db.backup

# Automated daily backup (Linux/Mac):
0 2 * * * cp /path/to/homestead.db /path/to/backups/homestead-$(date +%Y%m%d).db
```

**Best Practices:**
- Backup before major data entry
- Keep 7 daily backups
- Monthly backup stored off-site
- Test restore procedure
- Document backup location

### Settings Tips

⚙️ **Initial Configuration:**
- Set all location info during setup
- Choose unit system carefully (hard to change later)
- Configure alert thresholds conservatively
- Test weather API immediately

🔄 **Regular Maintenance:**
- Review settings quarterly
- Update hardiness zone if you move
- Adjust alert thresholds based on experience
- Check for software updates

🔐 **Security:**
- Change PIN if ever compromised
- Log out when leaving device unattended
- Keep backup of settings
- Document configuration for reinstall

---

## Data Management

### Understanding Your Data

HomesteadHub stores all data locally in a SQLite database (default) or PostgreSQL (configurable).

**Data Location:**
- Database file: `prisma/homestead.db` (SQLite)
- This file contains ALL your homestead data

**Data Categories:**
1. **User Data**: Your actual homestead information
2. **Starter Data**: Example data (if loaded)
3. **System Data**: Settings, configurations
4. **Metadata**: Timestamps, relationships

### Starter Data Management

**What is Starter Data?**

Example data loaded during onboarding or from Settings. Includes:
- 12 storage items
- 4 crops with plantings
- 4 equipment items
- 5 animals
- 7 tasks
- Resource logs
- Emergency checklists

**Identifying Starter Data:**

All starter data is tagged with `isStarterData: true` in the database.

**Clearing Starter Data:**

**When to Clear:**
- You've explored the system enough
- You're ready to enter only real data
- You want a clean slate
- Starter data is confusing

**How to Clear:**
1. Navigate to **Settings**
2. Scroll to **Data Management**
3. Review the warning notice
4. Click **"Clear Starter Data"**
5. Confirm in dialog
6. Wait for confirmation message

**What Happens:**
- Only starter data is deleted
- Your data is completely safe
- All relationships are maintained
- Page refreshes to show clean state

**Verification:**
- Visit each module to confirm
- Check dashboard stats update
- Verify your data remains

### Data Export

**Future Feature:**
Export capabilities coming soon:
- CSV export per module
- Full database export
- Selective export by date range
- Import from CSV

**Current Workaround:**

Access data directly via Prisma Studio:
```bash
npm run db:studio
```

### Data Import

**Bulk Import (Future):**
- CSV import templates
- Mapping tool for custom formats
- Validation and error checking

**Current Workaround:**

For advanced users, use Prisma Client directly or SQL imports.

### Data Integrity

**Automatic Protections:**
- Foreign key constraints
- Required field validation
- Date range validation
- Cascade deletes (items with dependencies)

**Manual Checks:**
- Review data periodically
- Check for duplicate entries
- Verify relationships are correct
- Clean up old/obsolete data

### Database Maintenance

**Regular Tasks:**
- Backup database weekly
- Monitor database size
- Clean up old notifications
- Archive completed projects

**Performance:**
- Database auto-optimizes
- No manual vacuum needed for SQLite
- Indexes automatically maintained

---

## Offline Mode

### Overview

HomesteadHub is designed as an **offline-first** application, meaning full functionality is available without an internet connection.

### How Offline Mode Works

**Client-Side Caching:**
- Uses IndexedDB for local storage
- Syncs with server when online
- No data loss during offline periods

**When You're Online:**
1. All changes save immediately to server
2. Data cached locally in browser
3. Sync status indicator shows green

**When You Go Offline:**
1. Sync indicator shows offline status
2. All features remain fully functional
3. Changes saved to local cache
4. Queue builds for sync when online

**When You Come Back Online:**
1. Sync indicator shows syncing
2. Queued changes upload automatically
3. Conflicts resolved (local changes win)
4. Sync indicator returns to green

### Offline Capabilities

**Fully Available Offline:**
- ✅ View all data
- ✅ Add new entries (all modules)
- ✅ Edit existing entries
- ✅ Complete tasks
- ✅ Log production, maintenance, etc.
- ✅ Search and filter
- ✅ View reports and statistics

**Requires Internet:**
- ❌ Weather API updates (manual still works)
- ❌ Software updates
- ❌ Initial setup (first-time only)

### Sync Indicator

**Location:** Top right corner of app

**Status Icons:**
- 📶 **Green WiFi**: Online and synced
- ⏳ **Yellow Sync**: Currently syncing
- ❌ **Red Offline**: No connection, queue active
- ⚠️ **Error**: Sync issue, manual intervention needed

**Click Indicator:**
- View sync queue
- See pending changes
- Force manual sync
- View sync history

### Conflict Resolution

**Automatic Resolution:**

When the same item is edited offline and online:
1. **Server wins** if modified there first
2. **Local wins** if more recent
3. Timestamps determine winner

**Manual Resolution:**

Rare cases where conflicts can't auto-resolve:
1. You'll see a conflict notification
2. Review both versions
3. Choose which to keep
4. Save resolution

### Best Practices for Offline Use

📱 **Preparation:**
- Access app while online to cache data
- Navigate to key pages to ensure cached
- Verify sync indicator is green before going offline

🔄 **While Offline:**
- Work normally, no limitations
- Check sync queue periodically
- Don't clear browser data
- Keep device charged (local storage requires power)

🌐 **Coming Back Online:**
- Connect to internet
- Open app if not already open
- Watch sync indicator
- Wait for green status before closing
- Verify changes uploaded

### Troubleshooting Offline Mode

**Sync Won't Start:**
1. Check internet connection
2. Refresh the page
3. Check browser console for errors
4. Force sync from indicator menu

**Changes Not Syncing:**
1. Don't close browser during sync
2. Check sync queue for errors
3. Verify server is running
4. Clear browser cache (last resort)

**Data Missing After Offline:**
1. Check sync history
2. Verify changes were saved locally
3. Look in sync queue
4. Contact support if unrecoverable

---

## Best Practices & Tips

### Daily Homestead Routine

**Morning (5-10 minutes):**
1. Check dashboard for critical alerts
2. Review tasks due today
3. Check notification bell
4. Log weather observations

**Throughout Day:**
- Log activities as they happen
- Complete tasks and mark them
- Record production (eggs, milk, etc.)
- Update equipment hours if used

**Evening (5-10 minutes):**
- Mark off completed tasks
- Review tomorrow's tasks
- Check for any missed alerts
- Log any evening observations

### Weekly Reviews

**Every Sunday (30 minutes):**
1. Review overdue tasks
2. Plan next week's priorities
3. Check upcoming maintenance
4. Review expiring storage items
5. Update equipment hours
6. Log resource consumption

### Monthly Maintenance

**First of Month (1 hour):**
1. Full inventory check (storage)
2. Equipment service review
3. Health record review (livestock)
4. Resource usage analysis
5. Update any settings
6. Plan next month's major tasks

### Seasonal Planning

**Spring:**
- Plan garden layout
- Order seeds
- Service equipment after winter
- Livestock breeding plans
- Rotate winter storage

**Summer:**
- Track garden yields
- Succession planting
- Monitor water usage
- Livestock production logs
- Canning/preservation planning

**Fall:**
- Harvest tracking
- Winter garden planning
- Equipment winterization
- Stock emergency supplies
- Review year's data

**Winter:**
- Review annual performance
- Plan next year's garden
- Equipment maintenance downtime
- Storage rotation
- Emergency preparedness review

### Data Entry Tips

**Be Consistent:**
- Use same location names
- Consistent unit usage
- Regular update schedule
- Standard terminology

**Be Complete:**
- Fill optional fields when relevant
- Use notes fields generously
- Document decisions and observations
- Capture failures, not just successes

**Be Timely:**
- Log activities same day when possible
- Don't batch too much data entry
- Set reminders if you forget
- Use mobile access for immediate logging

### Organization Strategies

**Categories:**
- Use categories consistently
- Don't over-categorize
- Review and consolidate quarterly
- Document category meanings

**Naming Conventions:**
- Equipment: "[Type] - [Make/Model]"
- Animals: "[Name] ([Tag ID])"
- Locations: "[Area]-[Specific Location]"
- Tasks: "[Action] [Object]"

**Tags and Labels:**
- Use notes field for custom tags
- Standardize tag format
- Review tags periodically
- Consider future search needs

---

## Troubleshooting

### Common Issues

#### Can't Log In - Forgot PIN

**Problem:** No access to your account

**Solution:**
- ⚠️ **No password recovery** - this is by design for security
- You must have database access to reset
- Advanced users: Edit `Settings` table directly
- Alternative: Restore from backup before PIN was set
- Prevention: Write down PIN in secure location

#### Data Not Saving

**Symptoms:** Changes disappear after refresh

**Solutions:**
1. Check internet connection (if required)
2. Look for error messages on screen
3. Check browser console (F12)
4. Verify database file isn't locked
5. Check disk space on server
6. Try incognito/private window

#### Slow Performance

**Symptoms:** Pages load slowly, lag when entering data

**Solutions:**
1. Check database size (large databases slower)
2. Clear browser cache
3. Archive old data
4. Increase server resources
5. Check for browser extensions interfering
6. Update to latest version

#### Sync Issues (Offline Mode)

**Symptoms:** Changes not syncing when back online

**Solutions:**
1. Check sync queue indicator
2. Force manual sync
3. Refresh page completely
4. Clear browser storage (AFTER backing up)
5. Verify server is accessible
6. Check browser console for errors

#### Missing Data After Update

**Symptoms:** Data disappeared after software update

**Solutions:**
1. Check if accidentally filtered
2. Look in archived/completed sections
3. Verify database backup exists
4. Check starter data wasn't cleared
5. Review git changes if self-hosting
6. Restore from backup if necessary

### Error Messages

**"Operation not permitted" (Windows)**
- Prisma client generation issue
- Solution: Restart dev server
- Alternative: Run `npm run db:generate` when nothing else running

**"Invalid input"**
- Form validation failed
- Check all required fields filled
- Verify date formats
- Check numeric fields have numbers only

**"Failed to fetch"**
- Server not running
- Network issue
- Check server logs
- Verify port not blocked by firewall

**"Database locked"**
- Another process accessing database
- Close Prisma Studio if open
- Stop duplicate server instances
- Restart server

### Getting Help

**Before Asking:**
1. Check this manual's troubleshooting section
2. Review error message carefully
3. Check browser console (F12)
4. Try in incognito/private window
5. Test in different browser

**When Reporting Issues:**
Include:
- Exact error message
- Steps to reproduce
- Browser and version
- Operating system
- Database type (SQLite/PostgreSQL)
- Recent changes or updates

**Resources:**
- GitHub Issues: Report bugs and request features
- Documentation: Review for missed details
- Community: Share tips and solutions

---

## Appendix

### Keyboard Shortcuts

*Coming in future update*

### Glossary

**FIFO**: First In, First Out - Rotation method where oldest items used first

**RRULE**: Recurrence Rule - iCalendar format for recurring events

**Hardiness Zone**: USDA classification of climate regions for plant growth

**Hour Meter**: Equipment gauge tracking operating hours

**TTL**: Time To Live - How long before automatic logout

**Sync**: Synchronization between local cache and server database

**Starter Data**: Example data provided for learning and exploration

**PIN**: Personal Identification Number for application access

### Units Reference

**Imperial:**
- Weight: oz, lbs, tons
- Volume: cups, pints, quarts, gallons
- Length: inches, feet, yards, miles
- Temperature: °F
- Area: sq ft, acres

**Metric:**
- Weight: g, kg, metric tons
- Volume: ml, liters
- Length: cm, meters, km
- Temperature: °C
- Area: sq meters, hectares

### Common Recurrence Patterns

```
Daily: FREQ=DAILY;INTERVAL=1
Weekly: FREQ=WEEKLY;INTERVAL=1
Bi-weekly: FREQ=WEEKLY;INTERVAL=2
Monthly: FREQ=MONTHLY;INTERVAL=1
Quarterly: FREQ=MONTHLY;INTERVAL=3
Twice yearly: FREQ=MONTHLY;INTERVAL=6
Yearly: FREQ=YEARLY;INTERVAL=1
Every Monday: FREQ=WEEKLY;BYDAY=MO
Seasonal: FREQ=YEARLY;BYMONTH=3,6,9,12
```

### Support Contact

For issues, feature requests, or questions:
- **GitHub**: https://github.com/ArchitectVS7/homestead-hub
- **Issues**: Report bugs and request features
- **Discussions**: Community help and tips

---

## Document Information

**Version:** 1.0
**Last Updated:** February 2026
**Application Version:** 0.1.0
**License:** MIT

Built with 🌿 for self-reliant living.

---

*This manual is maintained as part of the HomesteadHub project. For the latest version and updates, visit the GitHub repository.*
