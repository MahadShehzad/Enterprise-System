using AcmeAdmin.Api.Data;
using AcmeAdmin.Api.Dtos;
using AcmeAdmin.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AcmeAdmin.Api.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<ProjectDto>> GetAll() =>
        (await db.Projects.AsNoTracking().ToListAsync()).Select(p => p.ToDto());

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> Create(ProjectUpsertRequest req)
    {
        var p = new Project
        {
            Id = "p-" + Guid.NewGuid().ToString("N")[..10],
            Name = req.Name.Trim(),
            Client = string.IsNullOrWhiteSpace(req.Client) ? "Internal" : req.Client,
            Status = req.Status,
            Progress = Math.Clamp(req.Progress, 0, 100),
            LeadId = req.LeadId ?? "",
            MemberIds = Map.Join(req.MemberIds ?? []),
            DueDate = req.DueDate,
        };
        db.Projects.Add(p);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = p.Id }, p.ToDto());
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectDto>> Update(string id, ProjectUpsertRequest req)
    {
        var p = await db.Projects.FindAsync(id);
        if (p is null) return NotFound();
        p.Name = req.Name.Trim();
        p.Client = req.Client;
        p.Status = req.Status;
        p.Progress = Math.Clamp(req.Progress, 0, 100);
        p.MemberIds = Map.Join(req.MemberIds ?? []);
        p.DueDate = req.DueDate;
        await db.SaveChangesAsync();
        return p.ToDto();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var p = await db.Projects.FindAsync(id);
        if (p is null) return NotFound();
        db.Projects.Remove(p);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
