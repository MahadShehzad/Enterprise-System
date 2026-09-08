using AcmeAdmin.Api.Data;
using AcmeAdmin.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AcmeAdmin.Api.Controllers;

[ApiController]
[Route("api/tenants")]
public class TenantsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<TenantDto>> GetAll() =>
        (await db.Tenants.AsNoTracking().ToListAsync()).Select(t => t.ToDto());

    [HttpPut("{id}/features")]
    public async Task<ActionResult<TenantDto>> UpdateFeatures(string id, FeaturesUpdateRequest req)
    {
        var t = await db.Tenants.FindAsync(id);
        if (t is null) return NotFound();

        var features = (req.EnabledFeatures ?? []).Distinct().ToList();
        if (!features.Contains("dashboard")) features.Insert(0, "dashboard"); // always on
        t.EnabledFeatures = Map.Join(features);

        await db.SaveChangesAsync();
        return t.ToDto();
    }
}
