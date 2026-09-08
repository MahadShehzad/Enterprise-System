using AcmeAdmin.Api.Data;
using AcmeAdmin.Api.Dtos;
using AcmeAdmin.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AcmeAdmin.Api.Controllers;

[ApiController]
[Route("api/leave")]
public class LeaveController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<LeaveRequestDto>> GetAll() =>
        (await db.LeaveRequests.AsNoTracking().ToListAsync()).Select(l => l.ToDto());

    [HttpPost]
    public async Task<ActionResult<LeaveRequestDto>> Create(LeaveCreateRequest req)
    {
        var l = new LeaveRequest
        {
            Id = "l-" + Guid.NewGuid().ToString("N")[..10],
            EmployeeId = req.EmployeeId,
            Type = req.Type,
            From = req.From,
            To = req.To,
            Days = req.Days <= 0 ? 1 : req.Days,
            Reason = string.IsNullOrWhiteSpace(req.Reason) ? "—" : req.Reason,
            Status = "Pending",
        };
        db.LeaveRequests.Add(l);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = l.Id }, l.ToDto());
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<LeaveRequestDto>> SetStatus(string id, LeaveStatusRequest req)
    {
        var l = await db.LeaveRequests.FindAsync(id);
        if (l is null) return NotFound();
        l.Status = req.Status;
        await db.SaveChangesAsync();
        return l.ToDto();
    }
}
