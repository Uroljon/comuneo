# Comuneo Demo Strategy

## Purpose
Comuneo is a showcase/visualization frontend for the CURATE PDF extraction system, designed for a one-time presentation. It simulates the file upload and processing flow while displaying pre-generated JSON results from CURATE.

## Architecture Overview

### Source Project: CURATE
- **Location**: `/Users/yonnock/Developer/CURATE/curate`
- **Function**: PDF extraction system that extracts structured entities (action fields, projects, indicators, measures) and their connections
- **Output**: JSON files with consistent structure containing:
  - Action Fields - High-level strategic areas
  - Projects - Specific implementation projects
  - Indicators - Measurable metrics with targets/values
  - Measures - Specific implementation measures
  - Connections - Links between entities with confidence scores

### Showcase Project: Comuneo
- **Location**: `/Users/yonnock/Developer/CURATE/comuneo`
- **Function**: React-based visualization UI for demonstration purposes
- **Approach**: Mock the upload/processing flow, display pre-generated JSON results

## Implementation Strategy

### 1. Data Storage
- Store pre-generated JSON files locally in `src/data/` directory
- JSON files follow the structure: `*_operations_result.json`
- Multiple JSON files can be stored to demonstrate different document processing

### 2. Mock Upload Flow
- User uploads ANY PDF file through the UI
- System simulates processing with loading animation (5-10 seconds)
- Behind the scenes: randomly select or map to a pre-stored JSON file
- No actual API calls or processing required

### 3. UI/UX Design
- **Style Reference**: https://curate.cockpit.management/board
- Replicate the exact visual style from the reference site
- Components already partially built by colleague (Uro)

### 4. Results Display
The ResultPgae component should display:

#### Overview Dashboard
- Summary cards with entity counts
- Key metrics at a glance
- Processing status indicator

#### Data Visualization
- **Tabbed Navigation** for different entity types:
  - Action Fields tab
  - Projects tab
  - Indicators tab
  - Measures tab

- **For each entity type**:
  - Searchable/filterable table or card view
  - Title, description, source pages
  - Connection count badges
  - Confidence score indicators

#### Connection Visualization
- Interactive network graph showing relationships
- Color-coded by confidence scores
- Click to highlight connected entities

#### Features
- Export functionality (mock - download the JSON)
- Search across all entities
- Filter by confidence score
- Responsive design matching curate.cockpit.management

## File Structure
```
src/
├── data/                  # Pre-generated JSON files
│   ├── regensburg.json
│   └── [other-examples].json
├── page/
│   ├── Ai.jsx            # Upload interface with mock processing
│   └── ResultPgae.jsx    # Results visualization
└── utils/
    └── mockData.js       # Utility to load and manage mock data
```

## Redux State Management
- Store selected JSON data in Redux after "processing"
- Structure:
  ```javascript
  {
    isLoaded: boolean,
    data: {
      action_fields: [...],
      projects: [...],
      indicators: [...],
      measures: [...],
      metadata: {
        filename: string,
        processedAt: timestamp
      }
    }
  }
  ```

## Demo Flow
1. User lands on homepage
2. Navigates to AI analysis page
3. Uploads a PDF file
4. Loading animation plays (5-10 seconds)
5. System loads pre-stored JSON data
6. Redirects to results page
7. Displays extracted entities in curate.cockpit.management style
8. User can explore data through tabs, search, and visualizations

## Technical Notes
- No real API integration needed
- All data is mocked/pre-generated
- Focus on visual polish and smooth UX
- Ensure responsive design for presentation
- Test with multiple screen sizes

## Presentation Tips
- Have 2-3 different JSON files ready for variety
- Map specific test PDFs to specific results if needed
- Ensure smooth transitions between pages
- Pre-load all assets to avoid delays during demo