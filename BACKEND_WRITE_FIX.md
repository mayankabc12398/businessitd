# Backend fix — unblock generic entity writes (create/update)

Apply these 2 edits in `D:\Mayank Data\BusinessD\Api\businessAPI\businessAPI`, then rebuild + restart
(`dotnet run`). Without them, every non-aggregate insert (Bug, Issue, Risk, SRS, Requirement,
DevItem, UAT, Training, Activity, HospitalUser, Milestone, Document, Signoff, ProcessFlow, …)
auto-400s with `{ Code: ["required"], <Nav>: ["required"] }` before the repository runs.

Aggregates (Client, Project, Feature, Integration, Api) already work — they have Create DTOs.

---

## Edit 1 — `Program.cs`

Right after the `builder.Services.AddControllers().AddJsonOptions(...)` block, add:

```csharp
// Generic entity inserts bind the raw EF entity, whose non-nullable Code + required
// navigation properties would otherwise trip the automatic 400 model-state filter
// before the repository runs. Real validation is FluentValidation in the repo layer,
// so suppress the automatic filter and let the repository own validation + code-gen.
builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(
    options => options.SuppressModelStateInvalidFilter = true);
```

---

## Edit 2 — `Infrastructure/Repositories/Repository.cs`

Add the using (top of file, with the other usings):

```csharp
using BusinessD.Infrastructure.Services; // NaturalId
```

Replace the existing `AddAsync` method:

```csharp
    public async Task<T> AddAsync(T entity, CancellationToken ct = default)
    {
        _set.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }
```

with:

```csharp
    private static readonly PropertyInfo? CodeProp =
        typeof(T).GetProperty("Code", BindingFlags.Public | BindingFlags.Instance);

    public async Task<T> AddAsync(T entity, CancellationToken ct = default)
    {
        await EnsureCodeAsync(entity, ct);
        _set.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    // Auto-generate the natural Code (e.g. BUG-021) when the caller left it blank,
    // mirroring how the aggregate repositories mint CL-0NN / FEA-1NNN.
    private async Task EnsureCodeAsync(T entity, CancellationToken ct)
    {
        if (CodeProp is null || CodeProp.PropertyType != typeof(string)) return;
        if (!string.IsNullOrWhiteSpace(CodeProp.GetValue(entity) as string)) return;

        var prefix = CodePrefix(typeof(T).Name);
        var existing = await _set.AsNoTracking()
            .Select(e => EF.Property<string>(e, "Code"))
            .ToListAsync(ct);
        CodeProp.SetValue(entity, NaturalId.Next(existing.Where(c => c != null)!, prefix, 0, 3));
    }

    private static string CodePrefix(string entity) => entity switch
    {
        "Bug" => "BUG-",
        "Issue" => "ISS-",
        "Risk" => "RISK-",
        "Requirement" => "REQ-",
        "SrsSession" => "SRS-",
        "MasterDataRecord" => "MDR-",
        "DevelopmentItem" => "DEV-",
        "UatCase" => "UAT-",
        "Training" => "TRN-",
        "ActivitySchedule" => "ACT-",
        "HospitalUser" => "HU-",
        "Document" => "DOC-",
        "Signoff" => "SGN-",
        "ProjectMilestone" => "MILE-",
        "ProcessFlow" => "PF-",
        "HimsChange" => "HIMS-",
        "DbChange" => "DBC-",
        "SourceCode" => "SRC-",
        "IntegrationScreen" => "SCR-",
        "ClientImplementation" => "CIMP-",
        "IntegrationTestCase" => "ITC-",
        "IntegrationDocument" => "IDOC-",
        "VersionHistory" => "VER-",
        "DeveloperNote" => "DN-",
        "Vendor" => "VEN-",
        "GoliveReadiness" => "GLR-",
        "LiveImport" => "LIMP-",
        "ParallelGolive" => "PGL-",
        "FinalGolive" => "FGL-",
        "ApiPayload" => "PAY-",
        _ => (entity.Length >= 3 ? entity[..3] : entity).ToUpperInvariant() + "-",
    };
```

`PropertyInfo`, `BindingFlags` need `using System.Reflection;` (already present); `EF`/`ToListAsync`
need `using Microsoft.EntityFrameworkCore;` (already present).

After rebuild + restart, the frontend writes (already wired) will persist.
