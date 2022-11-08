namespace NotesService.Shared.Exceptions;

public class ConfigurationException : Exception
{
    public ConfigurationException()
    {
    }

    public ConfigurationException(string message) : base(message)
    {
    }

    public ConfigurationException(string message, Exception? innerException) : base(message, innerException)
    {
    }
}

public class ConfigurationKeyNotFoundException : ConfigurationException
{
    public ConfigurationKeyNotFoundException(string configurationKey) : base($"ConfigurationKey \"{configurationKey}\" not found")
    {
        ConfigurationKey = configurationKey;
    }

    public string ConfigurationKey { get; set; }
}