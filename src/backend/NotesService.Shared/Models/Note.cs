namespace NotesService.Shared.Models;

public class Note
{
    public Guid Id { get; set; }

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}