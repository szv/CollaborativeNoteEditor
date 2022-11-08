namespace NotesService.Shared.Transfer;

public record class NoteOverviewResponseDto(
    Guid Id,
    string Title,
    string? Username,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record class NoteResponseDto(
    Guid Id,
    string Title,
    string Content,
    string? Username,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record class CreateNoteRequestDto(
    string Title,
    string Content,
    string? Username
);

public record class UpdateNoteRequestDto(
    string Title,
    string Content,
    string? Username
);
