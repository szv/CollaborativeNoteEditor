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

builder.Services.AddCors(options => options.AddDefaultPolicy(builder => builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddWebPubSub(options =>
{
    string endpoint = builder.Configuration["CollaborationService:WebPubSub:Endpoint"] ?? throw new ConfigurationKeyNotFoundException("CollaborationService:WebPubSub:Endpoint");
    options.ServiceEndpoint = new(new Uri(endpoint), azureCredential);
})
.AddWebPubSubServiceClient<CollaborativeNoteEditorHub>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.MapGet("/negotiate/{roomName}", async (
    Guid roomName,
    WebPubSubServiceClient<CollaborativeNoteEditorHub> serviceClient,
    HttpContext context
) =>
{
    if (roomName == default)
        await Task.FromResult(Results.BadRequest("Invalid roomName"));

    Uri uri = await serviceClient.GetClientAccessUriAsync(roles: new string[] { $"webpubsub.sendToGroup.{roomName}", $"webpubsub.joinLeaveGroup.{roomName}" });
    await context.Response.WriteAsync(uri.AbsoluteUri);
});
app.MapWebPubSubHub<CollaborativeNoteEditorHub>("/eventhandler/{*path}");

app.Run();