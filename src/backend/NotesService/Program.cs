using Azure.Identity;
using Mapster;
using MapsterMapper;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.AzureAppConfiguration;
using NotesService;
using NotesService.Data.DbContexts;
using NotesService.Middleware;
using NotesService.Shared.Exceptions;
using NotesService.Shared.Models;
using NotesService.Shared.Transfer;

DefaultAzureCredential azureCredential = new DefaultAzureCredential();

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Azure App Configuration
builder.Configuration.AddAzureAppConfiguration(options =>
{
    string endpoint = builder.Configuration["NotesService:AppConfiguration:Endpoint"] ?? throw new ConfigurationKeyNotFoundException("NotesService:AppConfiguration:Endpoint");
    options.Connect(new Uri (endpoint), azureCredential)
        .Select(KeyFilter.Any, LabelFilter.Null)
        .Select(KeyFilter.Any, builder.Environment.EnvironmentName)
        .ConfigureKeyVault(vault => vault.SetCredential(azureCredential));
});

// ApplicationInsights
string applicationInsightsInstrumentationKey = builder.Configuration["NotesService:ApplicationInsights:ConnectionString"] ?? throw new ConfigurationKeyNotFoundException("NotesService:ApplicationInsights:ConnectionString");
builder.Services.AddApplicationInsightsTelemetry(x => x.ConnectionString = applicationInsightsInstrumentationKey);
builder.Services.AddSingleton<ITelemetryInitializer, ApplicationInsightsTelemetryInitializer>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<NotesDbContext>(options =>
{
    string connectionString = builder.Configuration["NotesService:Cosmos:ConnectionString"] ?? throw new ConfigurationKeyNotFoundException("NotesService:Cosmos:ConnectionString");
    string databaseName = builder.Configuration["NotesService:Cosmos:DatabaseName"] ?? throw new ConfigurationKeyNotFoundException("NotesService:Cosmos:DatabaseName");
    options.UseCosmos(connectionString, databaseName);
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTrackingWithIdentityResolution);
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder => builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// Mapster
builder.Services.AddSingleton(TypeAdapterConfig.GlobalSettings);
builder.Services.AddScoped<IMapper, ServiceMapper>();

// Application Services
builder.Services.AddScoped<NotesService.Services.NotesService>();

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors();
app.UseMiddleware<ExceptionMiddleware>();

// Endpoints
app.MapGet("/notes", (NotesService.Services.NotesService notesService) =>
{
    return notesService.GetAsync<NoteOverviewResponseDto>();
});

app.MapGet("/notes/{id}", (Guid id, NotesService.Services.NotesService notesService) =>
{
    return notesService.GetOrThrowAsync<NoteResponseDto>(id);
});

app.MapPost("/notes", async (NotesService.Services.NotesService notesService, CreateNoteRequestDto dto) =>
{
    Note note = await notesService.CreateAsync(dto.Adapt<Note>());
    return note.Adapt<NoteOverviewResponseDto>();
});

app.MapPut("/notes/{id}", async (Guid id, NotesService.Services.NotesService notesService, UpdateNoteRequestDto dto) =>
{
    Note note = await notesService.CreateOrUpdateAsync(id, dto.Adapt<Note>());
    return note.Adapt<NoteOverviewResponseDto>();
});

app.MapDelete("/notes/{id}", (Guid id, NotesService.Services.NotesService notesService) =>
{
    return notesService.DeleteAsync(id);
});

app.Run();