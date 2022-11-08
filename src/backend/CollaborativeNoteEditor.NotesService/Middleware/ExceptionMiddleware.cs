using NotesService.Shared.Exceptions;

namespace NotesService.Middleware;

internal record class HttpErrorDetails(int StatusCode, string Message);

internal class ExceptionMiddleware
{
	private readonly RequestDelegate _next;

	public ExceptionMiddleware(RequestDelegate next)
	{
		_next = next;
	}

	public async Task InvokeAsync(HttpContext context)
	{
		HttpErrorDetails? errorDetails = await Catch(context);

		if (errorDetails is null)
			return;

        context.Response.StatusCode = errorDetails.StatusCode;
        await context.Response.WriteAsJsonAsync(errorDetails);
    }

	private async Task<HttpErrorDetails?> Catch(HttpContext context)
	{
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
			return new(404, "Not Found");
        }
        catch (Exception ex)
        {
			return new(500, "Internal Server Error");
        }

		return null;
    }
}
