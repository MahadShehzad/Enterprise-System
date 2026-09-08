using AcmeAdmin.Api.Data;
using AcmeAdmin.Api.Dtos;
using AcmeAdmin.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AcmeAdmin.Api.Controllers;

[ApiController]
[Route("api/meetings")]
public class MeetingsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<MeetingDto>> GetAll() =>
        (await db.Meetings.AsNoTracking().ToListAsync()).Select(m => m.ToDto());

    [HttpPost]
    public async Task<ActionResult<MeetingDto>> Create(MeetingUpsertRequest req)
    {
        var m = new Meeting
        {
            Id = "m-" + Guid.NewGuid().ToString("N")[..10],
            Title = req.Title.Trim(),
            Date = req.Date,
            Time = req.Time,
            DurationMins = req.DurationMins <= 0 ? 30 : req.DurationMins,
            Attendees = req.Attendees ?? "",
            OwnerId = req.OwnerId ?? "",
            Status = "Scheduled",
        };
        db.Meetings.Add(m);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = m.Id }, m.ToDto());
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MeetingDto>> Update(string id, MeetingUpsertRequest req)
    {
        var m = await db.Meetings.FindAsync(id);
        if (m is null) return NotFound();
        m.Title = req.Title.Trim();
        m.Date = req.Date;
        m.Time = req.Time;
        m.DurationMins = req.DurationMins <= 0 ? 30 : req.DurationMins;
        m.Attendees = req.Attendees ?? "";
        if (!string.IsNullOrWhiteSpace(req.Status)) m.Status = req.Status!;
        await db.SaveChangesAsync();
        return m.ToDto();
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<MeetingDto>> Cancel(string id)
    {
        var m = await db.Meetings.FindAsync(id);
        if (m is null) return NotFound();
        m.Status = "Cancelled";
        await db.SaveChangesAsync();
        return m.ToDto();
    }
}
