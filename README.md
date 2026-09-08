# EV Charging Client

A minimal React (Vite) client for the EV Charging Management API — login, view
charging spots, and start a session (including handling the 409 conflict when
two drivers race for the same spot).

## Setup

```bash
npm install
npm run dev
```

Opens on http://localhost:5173

## Before it will work

1. **Set the API URL.** Open `src/api.js` and update `API_BASE` to match the
   port your API runs on (check the console when you `dotnet run`, or your
   `launchSettings.json`).

2. **Enable CORS on the API.** By default, ASP.NET Core blocks requests from
   a different origin (like this client on `localhost:5173`) — you'll see
   this fail silently or with a CORS error in the browser console until you
   add a policy. In `Program.cs`, before `builder.Services.AddControllers()`:

   ```csharp
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("AllowClient", policy =>
           policy.WithOrigins("http://localhost:5173")
                 .AllowAnyHeader()
                 .AllowAnyMethod());
   });
   ```

   And after `app.UseAuthentication();` / before `app.UseAuthorization();`:

   ```csharp
   app.UseCors("AllowClient");
   ```

3. **Seed at least one station and spot** in the database so the dashboard
   has something to show (see the Seed data step in the main project).

## What's real vs. illustrative

- **Real, wired to your API:** login/register, the spot tiles and their
  status, starting a session (including the 409 conflict toast).
- **Illustrative/mock:** the "Current Activity" charts and "Recent Sessions"
  list — your API doesn't expose that data yet. They're there to match the
  reference design; wire them up later if you add the endpoints.
