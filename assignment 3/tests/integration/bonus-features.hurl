# Bonus Features Integration Tests

# Setup: Create a fragment for testing bonus features
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Test fragment for bonus features`

HTTP/1.1 201
[Captures]
bonus_id: jsonpath "$.fragment.id"

# Test 1: Search endpoint
GET http://localhost:8080/v1/fragments/search?type=text
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isCollection

# Test 2: Analytics endpoint
GET http://localhost:8080/v1/fragments/analytics
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.analytics.summary" exists

# Test 3: Get fragment tags
GET http://localhost:8080/v1/fragments/{{bonus_id}}/tags
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.tags" isCollection

# Test 4: Add tags to fragment
POST http://localhost:8080/v1/fragments/{{bonus_id}}/tags
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{"tags": ["test", "integration"]}

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.tags" includes "test"
jsonpath "$.tags" includes "integration"

# Test 5: Get fragment versions
GET http://localhost:8080/v1/fragments/{{bonus_id}}/versions
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.versions" isCollection

# Test 6: Get fragment share info
GET http://localhost:8080/v1/fragments/{{bonus_id}}/share
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.sharedWith" isCollection

# Test 7: Share fragment
POST http://localhost:8080/v1/fragments/{{bonus_id}}/share
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{"email": "test@example.com"}

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# Test 8: Get fragment analytics
GET http://localhost:8080/v1/fragments/{{bonus_id}}/analytics
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.analytics" exists

# Test 9: Shared fragments endpoint
GET http://localhost:8080/v1/fragments/shared
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

