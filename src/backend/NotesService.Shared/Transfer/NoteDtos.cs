namespace NotesService.Shared.Transfer;

public record class NoteResponseDto(Guid Id, string Content, DateTime CreatedAt, DateTime UpdatedAt);

public record class CreateNoteRequestDto(string Content);

public record class UpdateNoteRequestDto(string Content);
