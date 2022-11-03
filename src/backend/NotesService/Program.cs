using Microsoft.EntityFrameworkCore;
using NotesService.Data.DbContexts;
using NotesService.Shared.Exceptions;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<NotesDbContext>(options =>
{
    string connectionString = builder.Configuration["NotesService:Cosmos:ConnectionString"] ?? throw new ConfigurationException("ConfigurationKey not found", "NotesService:Cosmos:ConnectionString");
    string databaseName = builder.Configuration["NotesService:Cosmos:DatabaseName"] ?? throw new ConfigurationException("ConfigurationKey not found", "NotesService:Cosmos:DatabaseName");
    options.UseCosmos("connectionString", "databaseName");
});

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Endpoints
// ...

app.Run();