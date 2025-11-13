# Frontend Testing Guide - Assignment 2

## How to Run the Frontend

### 1. Install Dependencies
```bash
cd "Lab 2"
npm install
```

### 2. Update Configuration
Edit `config.js` and update:
- `API_URL`: Your EC2 IP or `http://localhost:8080` for local testing
- `AWS_COGNITO_DOMAIN_URL`: Your Cognito domain URL

### 3. Start the Frontend
```bash
npm run dev
```

The frontend will be available at: **http://localhost:1234**

## Testing with Different Content Types

The updated frontend now supports creating fragments with different content types:

### 1. **Text Plain** (`text/plain`)
- Select "Text Plain" from the dropdown
- Enter any plain text:
  ```
  Hello World
  This is a plain text fragment.
  ```

### 2. **Markdown** (`text/markdown`)
- Select "Markdown" from the dropdown
- Enter Markdown content:
  ```markdown
  # My Title
  
  This is **bold** text and this is *italic*.
  
  - List item 1
  - List item 2
  
  [Link](https://example.com)
  ```
- After creating, click "View as HTML" to see the converted HTML

### 3. **JSON** (`application/json`)
- Select "JSON" from the dropdown
- Enter valid JSON:
  ```json
  {
    "name": "John Doe",
    "age": 30,
    "city": "New York",
    "hobbies": ["reading", "coding", "traveling"]
  }
  ```

## Example Test Strings

### Plain Text Examples:
```
Simple text fragment
```

```
Multi-line
text fragment
with multiple lines
```

### Markdown Examples:
```markdown
# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet point 1
- Bullet point 2

[Link text](https://example.com)
```

### JSON Examples:
```json
{"message": "Hello", "count": 42}
```

```json
{
  "user": {
    "name": "Heet Patel",
    "email": "hhpatel31@myseneca.ca"
  },
  "fragments": [
    {"id": "1", "type": "text/plain"},
    {"id": "2", "type": "application/json"}
  ]
}
```

## Features

1. **Create Fragments**: Select content type and enter content
2. **View All Fragments**: See all your fragments with metadata
3. **View Fragment Details**: See content, type, size, and creation date
4. **Markdown to HTML**: Click "View as HTML" button for Markdown fragments
5. **JSON Formatting**: JSON fragments are automatically formatted

## Testing Workflow

1. **Start the API server** (if testing locally):
   ```bash
   cd "assignment 2"
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd "Lab 2"
   npm run dev
   ```

3. **Login**: Click "Login" button (uses Cognito or mock auth)

4. **Create fragments** with different content types:
   - Try plain text
   - Try Markdown
   - Try JSON

5. **View fragments**: All fragments are displayed with full metadata

6. **Test Markdown conversion**: Create a Markdown fragment and click "View as HTML"

## Troubleshooting

- **CORS errors**: Make sure your API server allows CORS from `http://localhost:1234`
- **Authentication errors**: Check your Cognito credentials in `config.js`
- **API connection errors**: Verify `API_URL` in `config.js` points to the correct server

