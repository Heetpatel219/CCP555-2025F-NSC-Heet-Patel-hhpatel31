# How to Verify Location Header is Set Correctly

## Method 1: Browser Developer Tools (Easiest)

1. **Open Browser Developer Tools**
   - Press `F12` or right-click → "Inspect"
   - Go to the **Network** tab

2. **Create a Fragment**
   - In your frontend, create a new fragment (any type)
   - Watch the Network tab for the POST request

3. **Check the Response Headers**
   - Click on the POST request to `/v1/fragments`
   - Look at the **Response Headers** section
   - You should see: `Location: http://localhost:8080/v1/fragments/[fragment-id]`

4. **Take a Screenshot**
   - Make sure the Location header is visible
   - Include the request URL and response status (201)

## Method 2: Using curl (Command Line)

```bash
# Get your JWT token first (from browser console after login)
# Then use it in the curl command:

curl -X POST http://localhost:8080/v1/fragments \
  -H "Content-Type: text/plain" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "Hello World" \
  -i -v
```

The `-i` flag shows headers, and you'll see:
```
HTTP/1.1 201 Created
Location: http://localhost:8080/v1/fragments/[fragment-id]
...
```

## Method 3: Update Frontend to Display Location Header

The frontend can be updated to show the Location header in the UI.

## What to Look For

The Location header should be:
- **Format**: `http://[host]/v1/fragments/[fragment-id]`
- **Status Code**: 201 (Created)
- **Header Name**: `Location` (case-insensitive)

## For Your Report

Take a screenshot showing:
1. The Network tab with the POST request selected
2. The Response Headers section visible
3. The Location header clearly showing the correct URL
4. The response status code (201)

