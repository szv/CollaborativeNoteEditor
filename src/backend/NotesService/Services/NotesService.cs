using Mapster;
using Microsoft.EntityFrameworkCore;
using NotesService.Data.DbContexts;
using NotesService.Shared.Exceptions;
using NotesService.Shared.Models;
using System.Collections.Generic;

namespace NotesService.Services;

internal class NotesService
{
    private readonly NotesDbContext _dbContext;

    public NotesService(NotesDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IAsyncEnumerable<Note> GetAsync()
    {
        return _dbContext.Notes.AsAsyncEnumerable();
    }

    public IAsyncEnumerable<TAdaptTo> GetAsync<TAdaptTo>()
    {
        return (IAsyncEnumerable<TAdaptTo>)_dbContext.Notes.ProjectToType<TAdaptTo>();
    }

    public ValueTask<Note?> GetAsync(Guid id)
    {
        return _dbContext.Notes.FindAsync(id);
    }

    public async Task<TAdaptTo?> GetAsync<TAdaptTo>(Guid id)
        where TAdaptTo : class
    {
        Note? note = await _dbContext.Notes.FindAsync(id);

        return note is null
            ? null
            : note.Adapt<TAdaptTo>();
    }

    public async ValueTask<Note> GetOrThrowAsync(Guid id)
    {
        return await _dbContext.Notes.FindAsync(id) ?? throw new NotFoundException();
    }

    public async ValueTask<TAdaptTo> GetOrThrowAsync<TAdaptTo>(Guid id)
    {
        Note? note = await _dbContext.Notes.FindAsync(id);

        if (note is null)
            throw new NotFoundException();

        return note.Adapt<TAdaptTo>();
    }

    public Task CreateAsync(Note note)
    {
        note.CreatedAt = DateTime.UtcNow;
        note.UpdatedAt = DateTime.UtcNow;
        _dbContext.Notes.Add(note);
        return _dbContext.SaveChangesAsync();
    }

    public async Task CreateOrUpdateAsync(Guid id, Note note)
    {
        Note? existing = await GetAsync(id);

        if (existing is not null)
        {
            note.Id = id;
            note.UpdatedAt = DateTime.Now;
            _dbContext.Notes.Update(note);
        }
        else
            await CreateAsync(note);

        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        Note note = await GetAsync(id) ?? throw new NotFoundException();
        _dbContext.Notes.Remove(note);
        await _dbContext.SaveChangesAsync();
    }
}
