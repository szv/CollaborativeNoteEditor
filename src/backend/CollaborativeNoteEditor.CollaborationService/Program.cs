using Azure.Identity;
using CollaborationService;
using Microsoft.Azure.WebPubSub.AspNetCore;
using Microsoft.Extensions.Configuration.AzureAppConfiguration;
using NotesService.Shared.Exceptions;

DefaultAzureCredential azureCredential = new();
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Azure App Configuration
builder.Configuration.AddAzureAppConfiguration(options =>
{
    string endpoint = builder.Configuration["CollaborationService:AppConfiguration:Endpoint"] ?? throw new ConfigurationKeyNotFoundException("CollaborationService:AppConfiguration:Endpoint");
    options.Connect(new Uri(endpoint), azureCredential)
        .Select(KeyFilter.Any, LabelFilter.Null)
        .Select(KeyFilter.Any, builder.Environment.EnvironmentName)
        .ConfigureKeyVault(vault => vault.SetCredential(azureCredential));
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddWebPubSub(options =>
{
    string endpoint = builder.Configuration["CollaborationService:WebPubSub:Endpoint"] ?? throw new ConfigurationKeyNotFoundException("CollaborationService:WebPubSub:Endpoint");
    options.ServiceEndpoint = new(new Uri(endpoint), azureCredential);
})
.AddWebPubSubServiceClient<CollaborationPubSubHub>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/negotiate", async (WebPubSubServiceClient<CollaborationPubSubHub> serviceClient, HttpContext context) =>
{
    int testUserId = Random.Shared.Next(int.MaxValue);
    await context.Response.WriteAsync(serviceClient.GetClientAccessUri(userId: testUserId.ToString()).AbsoluteUri);
});
app.MapWebPubSubHub<CollaborationPubSubHub>("/eventhandler/{*path}");

app.Run();