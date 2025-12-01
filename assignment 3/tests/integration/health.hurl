# Health Check Tests

# Test 1: Health check endpoint returns 200
GET http://localhost:8080/

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.status" == "ok"
jsonpath "$.author" exists
jsonpath "$.version" exists
jsonpath "$.githubUrl" exists

