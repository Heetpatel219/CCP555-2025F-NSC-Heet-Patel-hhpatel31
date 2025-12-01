# GET /v1/fragments Tests

# Test 1: Authenticated user can get list of fragments
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isCollection

# Test 2: Authenticated user can get expanded list
GET http://localhost:8080/v1/fragments?expand=1
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isCollection

# Test 3: Unauthenticated request returns 401
GET http://localhost:8080/v1/fragments

HTTP/1.1 401

