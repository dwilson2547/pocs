import grpc
import unary_pb2_grpc as pb2_grpc
import unary_pb2 as pb2

server_cert_file = 'tls/server_tls.crt'
client_cert_file = 'tls/client_tls.crt'
client_key_file = 'tls/client_tls.key'

class UnaryClient(object):
    """
    Client for gRPC functionality
    """

    def __init__(self):
        self.host = 'grpc-mtls-test-server.dev.com'
        self.server_port = 443

        server_cert = open(server_cert_file, 'rb').read()
        client_cert = open(client_cert_file, 'rb').read()
        client_key = open(client_key_file, 'rb').read()

        client_credentials = grpc.ssl_channel_credentials(
            root_certificates=server_cert,
            private_key=client_key,
            certificate_chain=client_cert
        )

        # instantiate a channel
        self.channel = grpc.secure_channel(
            '{}:{}'.format(self.host, self.server_port),
            credentials = client_credentials)

        # bind the client and the server
        self.stub = pb2_grpc.UnaryStub(self.channel)

    def get_url(self, message):
        """
        Client function to call the rpc for GetServerResponse
        """
        message = pb2.Message(message=message)
        print(f'{message}')
        return self.stub.GetServerResponse(message)


if __name__ == '__main__':
    client = UnaryClient()
    result = client.get_url(message="Hello Server you there?")
    print(f'{result}')