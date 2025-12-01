# GET /v1/fragments/:id Tests

# Setup: Create a text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello World`

HTTP/1.1 201
[Captures]
fragment_id: jsonpath "$.fragment.id"
fragment_url: header "Location"

# Test 1: Get fragment data by ID
GET {{fragment_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello World"

# Test 2: Get fragment info by ID
GET {{fragment_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment_id}}
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 11

# Test 3: Non-existent fragment returns 404
GET http://localhost:8080/v1/fragments/non-existent-id
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404

# Test 4: Unauthenticated request returns 401
GET {{fragment_url}}

HTTP/1.1 401

