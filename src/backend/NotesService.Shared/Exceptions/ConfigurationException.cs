namespace NotesService.Shared.Exceptions;

public class ConfigurationException : Exception
{
    public ConfigurationException()
    {
    }

    public ConfigurationException(string message, string configurationKey) : base(message)
    {
        ConfigurationKey = configurationKey;
    }

    public ConfigurationException(string message) : base(message)
    {
    }

    public ConfigurationException(string message, Exception? innerException) : base(message, innerException)
    {
    }

    public ConfigurationException(string message, string configurationKey, Exception? innerException) : base(message, innerException)
    {
        ConfigurationKey = configurationKey;
    }

    public string? ConfigurationKey { get; set; }
}
