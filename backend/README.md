# AI Resume Builder - Backend API

FastAPI backend for generating and reviewing resumes using AI.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or if you're using a virtual environment (recommended):

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key and optionally the model name:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

**Available Model Options:**

**Free Tier (may have rate limits):**
- `meta-llama/llama-3.2-3b-instruct:free` (default, more reliable free option)
- `google/gemini-2.0-flash-exp:free` (often rate-limited)

**Paid Tier (recommended for production):**
- `google/gemini-pro` (fast, good quality)
- `google/gemini-1.5-flash` (very fast, good quality)
- `openai/gpt-4o-mini` (excellent quality, affordable)
- `anthropic/claude-3.5-sonnet` (best quality, higher cost)

**Note:** Free tier models may experience rate limits. The app includes automatic retry logic, but for production use, consider a paid model.

If `OPENROUTER_MODEL` is not set, it defaults to `meta-llama/llama-3.2-3b-instruct:free`.

**Get your OpenRouter API key:**
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Go to [API Keys](https://openrouter.ai/keys)
3. Create a new API key
4. Copy it to your `.env` file

### 3. Run the Backend Server

#### Option 1: Using Python directly

```bash
python main.py
```

#### Option 2: Using uvicorn directly

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start on `http://localhost:8000`

### 4. Verify It's Running

- Open your browser and go to: `http://localhost:8000`
- You should see: `{"message": "Welcome to the AI Resume Builder API"}`
- API documentation is available at: `http://localhost:8000/docs`

## API Endpoints

- `GET /` - Health check
- `POST /api/resume/generate` - Generate a resume
- `POST /api/resume/review` - Review a resume

Full API documentation with interactive testing is available at `/docs` when the server is running.

## Development

The server runs with auto-reload enabled, so changes to the code will automatically restart the server.

## Troubleshooting

### Port Already in Use

If port 8000 is already in use, you can change it:

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Don't forget to update the frontend API URL if you change the port.

### Missing Dependencies

If you get import errors, make sure all dependencies are installed:

```bash
pip install -r requirements.txt
```

### API Key Issues

Make sure your `.env` file is in the `backend` directory and contains a valid `OPENROUTER_API_KEY`.

