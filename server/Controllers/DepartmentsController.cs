using AcmeAdmin.Api.Data;
using AcmeAdmin.Api.Dtos;
using AcmeAdmin.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AcmeAdmin.Api.Controllers;

[ApiController]
[Route("api/departments")]
public class DepartmentsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<DepartmentDto>> GetAll() =>
        (await db.Departments.AsNoTracking().ToListAsync()).Select(d => d.ToDto());

    [HttpPost]
    public async Task<ActionResult<DepartmentDto>> Create(DepartmentUpsertRequest req)
    {
        var d = new Department
        {
            Id = "dept-" + Guid.NewGuid().ToString("N")[..8],
            Name = req.Name.Trim(),
            Lead = string.IsNullOrWhiteSpace(req.Lead) ? "—" : req.Lead,
            TenantId = req.TenantId ?? "orient",
        };
        db.Departments.Add(d);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = d.Id }, d.ToDto());
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DepartmentDto>> Update(string id, DepartmentUpsertRequest req)
    {
        var d = await db.Departments.FindAsync(id);
        if (d is null) return NotFound();
        d.Name = req.Name.Trim();
        d.Lead = req.Lead;
        if (req.TenantId is not null) d.TenantId = req.TenantId;
        await db.SaveChangesAsync();
        return d.ToDto();
    }
}
