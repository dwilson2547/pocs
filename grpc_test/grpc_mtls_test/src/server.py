import grpc
from concurrent import futures
import time
import unary_pb2_grpc as pb2_grpc
import unary_pb2 as pb2
import logging
log = logging.getLogger()

server_key_file = 'tls/server_tls.key'
server_cert_file = 'tls/server_tls.crt'
client_cert_file = 'tls/client_tls.crt'

class UnaryService(pb2_grpc.UnaryServicer):

    def __init__(self, *args, **kwargs):
        pass

    def GetServerResponse(self, request, context):

        # get the string from the incoming request
        message = request.message
        result = f'Hello I am up and running received "{message}" message from you'
        result = {'message': result, 'received': True}
        log.warning('message received: ' + message)

        return pb2.MessageResponse(**result)


def serve():
    print('Starting up...')
    server_cert = open(server_cert_file, 'rb').read()
    server_key = open(server_key_file, 'rb').read()
    client_cert = open(client_cert_file, 'rb').read()
    server_creds = grpc.ssl_server_credentials(
        [(server_key, server_cert)], root_certificates=client_cert, require_client_auth=True
    )
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_UnaryServicer_to_server(UnaryService(), server)
    server.add_secure_port('[::]:50051', server_credentials=server_creds)
    server.start()
    print('Server ready...')
    server.wait_for_termination()


if __name__ == '__main__':
    serve()