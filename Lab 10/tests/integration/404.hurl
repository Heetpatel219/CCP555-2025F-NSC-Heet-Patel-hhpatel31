# Test that requesting a non-existent route returns 404
GET http://localhost:8080/nonexistent-route

# We should get back an HTTP 404 response
HTTP/1.1 404

