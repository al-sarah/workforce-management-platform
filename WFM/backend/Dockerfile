# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY WFM.sln ./
COPY backend/src/WFM.API/WFM.API.csproj backend/src/WFM.API/
COPY backend/src/WFM.Application/WFM.Application.csproj backend/src/WFM.Application/
COPY backend/src/WFM.Domain/WFM.Domain.csproj backend/src/WFM.Domain/
COPY backend/src/WFM.Infrastructure/WFM.Infrastructure.csproj backend/src/WFM.Infrastructure/

RUN dotnet restore backend/src/WFM.API/WFM.API.csproj

COPY backend/ backend/

WORKDIR /src/backend/src/WFM.API
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Install curl for health checks + libgssapi for Npgsql PostgreSQL driver
RUN apt-get update && apt-get install -y \
    curl \
    libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "WFM.API.dll"]
