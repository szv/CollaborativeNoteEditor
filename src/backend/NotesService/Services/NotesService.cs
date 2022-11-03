using NotesService.Data.DbContexts;
using NotesService.Shared.Exceptions;
using NotesService.Shared.Models;

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

    public ValueTask<Note?> GetAsync(Guid id)
    {
        return _dbContext.Notes.FindAsync(id);
    }

    public async ValueTask<Note> GetOrThrow(Guid id)
    {
        return await _dbContext.Notes.FindAsync(id) ?? throw new NotFoundException();
    }

    public Task CreateAsync(Note note)
    {
        _dbContext.Notes.Add(note);
        return _dbContext.SaveChangesAsync();
    }

    public async Task CreateOrUpdateAsync(Guid id, Note note)
    {
        Note? existing = await GetAsync(id);

        if (existing is not null)
        {
            note.Id = id;
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
