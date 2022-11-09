using Azure.Core;
using Microsoft.Azure.WebPubSub.AspNetCore;
using Microsoft.Azure.WebPubSub.Common;
using System.Text;

namespace CollaborationService
{
    public class CollaborativeNoteEditorHub : WebPubSubHub
    {
        private readonly WebPubSubServiceClient<CollaborativeNoteEditorHub> _serviceClient;

        public CollaborativeNoteEditorHub(WebPubSubServiceClient<CollaborativeNoteEditorHub> serviceClient)
        {
            _serviceClient = serviceClient;
        }

        public override Task OnConnectedAsync(ConnectedEventRequest request)
        {
            return Task.CompletedTask;
        }

        public override async ValueTask<UserEventResponse> OnMessageReceivedAsync(UserEventRequest request, CancellationToken cancellationToken)
        {
            await _serviceClient.SendToAllAsync(RequestContent.Create(request.Data), ContentType.ApplicationOctetStream);
            return new UserEventResponse();
        }
    }
}
