# Test that posting a fragment when not authenticated produces a 401 error
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

`This is a fragment!`

# We expect to get back an HTTP 401 Unauthorized
HTTP/1.1 401

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" == "Unauthorized"

