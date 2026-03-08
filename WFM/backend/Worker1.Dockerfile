# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files first (layer caching)
COPY WFM.sln ./
COPY backend/src/WFM.Worker1/WFM.Worker1.csproj backend/src/WFM.Worker1/
COPY backend/src/WFM.Domain/WFM.Domain.csproj backend/src/WFM.Domain/
COPY backend/src/WFM.Application/WFM.Application.csproj backend/src/WFM.Application/
COPY backend/src/WFM.Infrastructure/WFM.Infrastructure.csproj backend/src/WFM.Infrastructure/

# Restore NuGet packages
RUN dotnet restore backend/src/WFM.Worker1/WFM.Worker1.csproj

# Copy the rest of the source code
COPY backend/ backend/

# Publish Worker1 in Release mode
RUN dotnet publish backend/src/WFM.Worker1/WFM.Worker1.csproj \
    --configuration Release \
    --no-restore \
    --output /app/out \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS runtime
WORKDIR /app

# Install libgssapi for Npgsql PostgreSQL driver
RUN apt-get update && apt-get install -y \
    libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "WFM.Worker1.dll"]
