# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# 1. Copy csproj files from all projects (relative to the context root)
# This allows for better Docker layer caching
COPY ["ServAd.ApiService/ServAd.ApiService.csproj", "ServAd.ApiService/"]
COPY ["ShareLibrary.cs/ShareLibrary.cs.csproj", "ShareLibrary.cs/"]

# 2. Restore dependencies
RUN dotnet restore "ServAd.ApiService/ServAd.ApiService.csproj"

# 3. Copy the entire source code
COPY . .

# 4. Build and Publish the ApiService
WORKDIR "/src/ServAd.ApiService"
RUN dotnet publish "ServAd.ApiService.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Stage 2: Final Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# The command in docker-compose will override this, but it's good practice to have it
ENTRYPOINT ["dotnet", "ServAd.ApiService.dll"]