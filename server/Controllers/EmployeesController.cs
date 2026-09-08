using AcmeAdmin.Api.Data;
using AcmeAdmin.Api.Dtos;
using AcmeAdmin.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AcmeAdmin.Api.Controllers;

[ApiController]
[Route("api/employees")]
public class EmployeesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<EmployeeDto>> GetAll() =>
        (await db.Employees.AsNoTracking().ToListAsync()).Select(e => e.ToDto());

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(EmployeeUpsertRequest req)
    {
        var e = new Employee
        {
            Id = "e-" + Guid.NewGuid().ToString("N")[..10],
            Name = req.Name.Trim(),
            Email = req.Email.Trim(),
            Role = req.Role,
            Status = req.Status,
            Position = req.Position,
            DepartmentId = req.DepartmentId,
            ManagerId = req.ManagerId,
            Salary = req.Salary,
            Phone = req.Phone,
            Location = req.Location,
            JoinedAt = req.JoinedAt ?? DateOnly.FromDateTime(DateTime.UtcNow).ToString("yyyy-MM-dd"),
            TenantId = req.TenantId ?? "orient",
        };
        db.Employees.Add(e);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = e.Id }, e.ToDto());
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<EmployeeDto>> Update(string id, EmployeeUpsertRequest req)
    {
        var e = await db.Employees.FindAsync(id);
        if (e is null) return NotFound();

        e.Name = req.Name.Trim();
        e.Email = req.Email.Trim();
        e.Role = req.Role;
        e.Status = req.Status;
        e.Position = req.Position;
        e.DepartmentId = req.DepartmentId;
        e.ManagerId = req.ManagerId;
        e.Salary = req.Salary;
        e.Phone = req.Phone;
        e.Location = req.Location;
        if (req.JoinedAt is not null) e.JoinedAt = req.JoinedAt;
        if (req.TenantId is not null) e.TenantId = req.TenantId;

        await db.SaveChangesAsync();
        return e.ToDto();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var e = await db.Employees.FindAsync(id);
        if (e is null) return NotFound();

        // detach anyone who reported to the removed person
        var reports = await db.Employees.Where(x => x.ManagerId == id).ToListAsync();
        foreach (var r in reports) r.ManagerId = null;

        db.Employees.Remove(e);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
