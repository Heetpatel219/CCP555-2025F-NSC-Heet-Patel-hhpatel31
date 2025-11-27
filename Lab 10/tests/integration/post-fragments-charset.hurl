# Test that posting a fragment Content-Type that includes a charset works
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

`This is a fragment with charset!`

# We expect to get back an HTTP 201
HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain; charset=utf-8"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# Try to GET the fragment we just posted by its URL
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain; charset=utf-8"
jsonpath "$.fragment.data" == "This is a fragment with charset!"

