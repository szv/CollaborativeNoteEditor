using Microsoft.EntityFrameworkCore;
using NotesService.Data.DbConfigurations;
using NotesService.Shared.Models;

namespace NotesService.Data.DbContexts;

public class NotesDbContext : DbContext
{
    public DbSet<Note> Notes => Set<Note>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new NoteConfiguration());
        modelBuilder.HasDefaultContainer("notes");
    }
}
