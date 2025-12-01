# Fragment Conversion Tests

# Setup: Create a Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`# Hello

This is **bold** text.`

HTTP/1.1 201
[Captures]
md_id: jsonpath "$.fragment.id"

# Test 1: Convert Markdown to HTML
GET http://localhost:8080/v1/fragments/{{md_id}}.html
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/html
[Asserts]
body contains "<h1>Hello</h1>"
body contains "<strong>bold</strong>"

# Test 2: Convert Markdown to plain text
GET http://localhost:8080/v1/fragments/{{md_id}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain

# Test 3: Unsupported conversion returns 415
GET http://localhost:8080/v1/fragments/{{md_id}}.png
[BasicAuth]
user1@email.com:password1

HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415

