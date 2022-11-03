using Mapster;
using Microsoft.EntityFrameworkCore;
using NotesService.Data.DbContexts;
using NotesService.Shared.Exceptions;
using NotesService.Shared.Models;
using NotesService.Shared.Transfer;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<NotesDbContext>(options =>
{
    string connectionString = builder.Configuration["NotesService:Cosmos:ConnectionString"] ?? throw new ConfigurationException("ConfigurationKey not found", "NotesService:Cosmos:ConnectionString");
    string databaseName = builder.Configuration["NotesService:Cosmos:DatabaseName"] ?? throw new ConfigurationException("ConfigurationKey not found", "NotesService:Cosmos:DatabaseName");
    options.UseCosmos("connectionString", "databaseName");
});

builder.Services.AddScoped<NotesService.Services.NotesService>();

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Endpoints
app.MapGet("/notes", (NotesService.Services.NotesService notesService) =>
{
    return notesService.GetAsync().Adapt<IAsyncEnumerable<NoteResponseDto>>();
});

app.MapGet("/notes/{id}", async (Guid id, NotesService.Services.NotesService notesService) =>
{
    Note note = await notesService.GetOrThrowAsync(id);
    return note.Adapt<NoteResponseDto>();
});

app.MapPost("/notes", (NotesService.Services.NotesService notesService, CreateNoteRequestDto dto) =>
{
    return notesService.CreateAsync(dto.Adapt<Note>());
});

app.MapPut("/notes/{id}", (Guid id, NotesService.Services.NotesService notesService, UpdateNoteRequestDto dto) =>
{
    return notesService.CreateOrUpdateAsync(id, dto.Adapt<Note>());
});

app.MapDelete("/notes/{id}", (Guid id, NotesService.Services.NotesService notesService) =>
{
    return notesService.DeleteAsync(id);
});

app.Run();