using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.Extensibility;

namespace NotesService;

internal sealed class ApplicationInsightsTelemetryInitializer : ITelemetryInitializer
{
    public void Initialize(ITelemetry telemetry)
    {
        telemetry.Context.Cloud.RoleName = "CollaborativeNoteEditor.NotesService";
        telemetry.Context.Cloud.RoleInstance = "Azure Container App";
    }
}
