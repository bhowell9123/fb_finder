# People Search Tool

A full-stack web application that allows users to upload CSV files containing contact information and automatically searches for people across multiple platforms including Facebook, public records, and business directories.

## Features

- 📁 **CSV File Upload** - Drag & drop or browse to upload contact files
- 🔍 **Multi-Platform Search** - Searches across public records, phone directories, business directories, and Facebook
- 🏢 **Business Entity Detection** - Automatically identifies and processes LLC, Inc, Corp entities
- 📊 **Confidence Scoring** - Provides confidence scores for search results (70-90%)
- 🔗 **Facebook Integration** - Direct links to Facebook search results
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Real-time Processing** - Live progress updates during search operations
- 📥 **Export Results** - Download search results as CSV files

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **Lucide React** icons

### Backend
- **Flask** Python web framework
- **Flask-CORS** for cross-origin requests
- **CSV processing** with Python's built-in csv module
- **Web search integration** capabilities

## Project Structure

```
people-search-complete/
├── frontend/                 # React application
│   ├── src/
│   │   ├── App.jsx          # Main application component
│   │   ├── App.css          # Application styles
│   │   └── components/      # UI components
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   └── index.html           # HTML template
├── backend/                 # Flask API
│   ├── src/
│   │   ├── main.py          # Flask application entry point
│   │   └── routes/
│   │       └── search.py    # Search API routes
│   ├── requirements.txt     # Python dependencies
│   └── venv/               # Python virtual environment
└── README.md               # This file
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.11+
- Git

### Frontend Setup

```bash
cd frontend
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python src/main.py
```

The backend API will be available at `http://localhost:5000`

## Configuration

### Frontend Configuration
Update the API base URL in `frontend/src/App.jsx`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api'  // For local development
// const API_BASE_URL = 'https://your-backend-url.com/api'  // For production
```

### Backend Configuration
The Flask app runs on port 5000 by default. To change this, modify `backend/src/main.py`:

```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

## CSV File Format

The application expects CSV files with the following columns (case-sensitive):

```csv
name,address,phone
"John Doe","123 Main St, City, State 12345","555-123-4567"
"Jane Smith","456 Oak Ave, Town, State 67890","555-987-6543"
```

### Supported Data Types
- **Individual People** - First/Last names
- **Couples** - "John & Jane Doe" format
- **Business Entities** - Automatically detects LLC, Inc, Corp, etc.

### Geographic Coverage
Optimized for addresses in:
- New Jersey (NJ)
- Pennsylvania (PA) 
- New York (NY)
- Maryland (MD)

## API Endpoints

### Health Check
```
GET /api/health
```
Returns API status and version information.

### File Upload & Search
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (CSV file)
```

Returns search results with confidence scores and Facebook links.

## Features in Detail

### Search Algorithm
1. **Data Validation** - Validates CSV format and required columns
2. **Location Processing** - Extracts and validates geographic information
3. **Business Detection** - Identifies business entities for enhanced processing
4. **Multi-Source Search** - Searches across multiple data sources
5. **Confidence Scoring** - Assigns confidence scores based on data quality
6. **Facebook Integration** - Generates direct Facebook search links

### Error Handling
- **Retry Logic** - Automatically retries failed requests up to 3 times
- **Timeout Handling** - 30-second timeout with clear error messages
- **Connection Testing** - Built-in backend connectivity testing
- **User-Friendly Errors** - Detailed error messages with troubleshooting tips

## Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
The Flask application can be deployed to:
- Heroku
- AWS Lambda
- Google Cloud Run
- Any VPS with Python support

Make sure to:
1. Set environment variables for production
2. Configure CORS for your frontend domain
3. Use a production WSGI server like Gunicorn

## Development

### Adding New Search Sources
To add new search sources, modify `backend/src/routes/search.py`:

```python
def search_person(name, address, phone):
    sources = []
    details = []
    
    # Add your new search logic here
    if your_search_condition:
        sources.append('Your New Source')
        details.append('Found in your new source')
    
    return sources, details
```

### Customizing UI
The frontend uses Tailwind CSS and Shadcn/ui components. Modify `frontend/src/App.jsx` to customize the interface.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Changelog

### v2.2 - Enhanced Error Handling & Retry Logic
- Added automatic retry logic for failed requests
- Improved error messages and troubleshooting
- Enhanced connection testing
- Better timeout handling

### v2.1 - Real Search & Fixed CORS
- Implemented real search functionality
- Fixed CORS issues for cross-origin requests
- Added Facebook integration
- Business entity detection

### v2.0 - Multi-Platform Search
- Added support for multiple search sources
- Confidence scoring system
- Geographic validation
- Responsive design improvements

