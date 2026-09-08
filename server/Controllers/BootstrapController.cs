using AcmeAdmin.Api.Data;
using AcmeAdmin.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AcmeAdmin.Api.Controllers;

[ApiController]
[Route("api/bootstrap")]
public class BootstrapController(AppDbContext db) : ControllerBase
{
    /// <summary>Everything the SPA needs in one round-trip.</summary>
    [HttpGet]
    public async Task<ActionResult<BootstrapDto>> Get()
    {
        var tenants = await db.Tenants.AsNoTracking().ToListAsync();
        var departments = await db.Departments.AsNoTracking().ToListAsync();
        var employees = await db.Employees.AsNoTracking().ToListAsync();
        var meetings = await db.Meetings.AsNoTracking().ToListAsync();
        var projects = await db.Projects.AsNoTracking().ToListAsync();
        var leave = await db.LeaveRequests.AsNoTracking().ToListAsync();
        var attendance = await db.Attendance.AsNoTracking().ToListAsync();
        var payslips = await db.Payslips.AsNoTracking().ToListAsync();

        return new BootstrapDto(
            tenants.Select(x => x.ToDto()),
            departments.Select(x => x.ToDto()),
            employees.Select(x => x.ToDto()),
            meetings.Select(x => x.ToDto()),
            projects.Select(x => x.ToDto()),
            leave.Select(x => x.ToDto()),
            attendance.Select(x => x.ToDto()),
            payslips.Select(x => x.ToDto()));
    }
}
