#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["CollaborativeNoteEditor.NotesService/CollaborativeNoteEditor.NotesService.csproj", "CollaborativeNoteEditor.NotesService/"]
COPY ["CollaborativeNoteEditor.Data/CollaborativeNoteEditor.Data.csproj", "CollaborativeNoteEditor.Data/"]
COPY ["CollaborativeNoteEditor.Shared/CollaborativeNoteEditor.Shared.csproj", "CollaborativeNoteEditor.Shared/"]
RUN dotnet restore "CollaborativeNoteEditor.NotesService/CollaborativeNoteEditor.NotesService.csproj"
COPY . .
WORKDIR "/src/CollaborativeNoteEditor.NotesService"
RUN dotnet build "CollaborativeNoteEditor.NotesService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CollaborativeNoteEditor.NotesService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CollaborativeNoteEditor.NotesService.dll"]