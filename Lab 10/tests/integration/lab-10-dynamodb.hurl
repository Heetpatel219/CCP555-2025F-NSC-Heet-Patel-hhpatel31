# Lab 10 - DynamoDB Integration Tests
# Tests CRUD operations with DynamoDB metadata storage and S3 data storage

###############################################################################
# Test 1: POST a JSON fragment
###############################################################################

POST http://localhost:8080/v1/fragments
Content-Type: application/json
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

```
{
  "service": "DynamoDB"
}
```

HTTP 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"
[Asserts]
header "Location" matches "^http://localhost:8080/v1/fragments/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 31

###############################################################################
# Test 2: GET the first fragment's metadata
###############################################################################

GET {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 31

###############################################################################
# Test 3: POST a text fragment
###############################################################################

POST http://localhost:8080/v1/fragments
Content-Type: text/plain
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

`DynamoDB is great.`

HTTP 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"

###############################################################################
# Test 4: GET the second fragment's metadata
###############################################################################

GET {{fragment2_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.type" == "text/plain"

###############################################################################
# Test 5: GET all fragments (should include both IDs)
###############################################################################

GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" exists

###############################################################################
# Test 6: DELETE the first fragment
###############################################################################

DELETE {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

###############################################################################
# Test 7: GET the deleted fragment (should return 404)
###############################################################################

GET {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 404

###############################################################################
# Test 8: GET all fragments (first ID should NOT be included, second should)
###############################################################################

GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" exists

