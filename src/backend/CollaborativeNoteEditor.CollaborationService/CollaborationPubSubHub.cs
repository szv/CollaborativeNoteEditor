using Microsoft.Azure.WebPubSub.AspNetCore;
using Microsoft.Azure.WebPubSub.Common;

namespace CollaborationService
{
    public class CollaborationPubSubHub : WebPubSubHub
    {
        private readonly WebPubSubServiceClient<CollaborationPubSubHub> _serviceClient;

        public CollaborationPubSubHub(WebPubSubServiceClient<CollaborationPubSubHub> serviceClient)
        {
            _serviceClient = serviceClient;
        }

        public override ValueTask<UserEventResponse> OnMessageReceivedAsync(UserEventRequest request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
