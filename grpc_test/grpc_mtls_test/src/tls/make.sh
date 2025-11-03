openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout server_tls.key -out server_tls.crt -subj "/CN=grpc-mtls-test-server.dev.com/O=wilson-enterprises"

openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout client_tls.key -out client_tls.crt -subj "/CN=localhost"
