# PUT and DELETE Tests

# Setup: Create a fragment to update
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Original content`

HTTP/1.1 201
[Captures]
update_id: jsonpath "$.fragment.id"
update_url: header "Location"

# Test 1: Update fragment content
PUT {{update_url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Updated content`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{update_id}}
jsonpath "$.fragment.size" == 15

# Test 2: Verify update
GET {{update_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
body == "Updated content"

# Test 3: Cannot change fragment type
PUT {{update_url}}
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`{"error": true}`

HTTP/1.1 400
[Asserts]
jsonpath "$.status" == "error"

# Test 4: Delete the fragment
DELETE {{update_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# Test 5: Verify deletion
GET {{update_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

# Test 6: Delete non-existent fragment returns 404
DELETE http://localhost:8080/v1/fragments/non-existent-id
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

