using AcmeAdmin.Api.Data;
using AcmeAdmin.Api.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace AcmeAdmin.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(AppDbContext db) : ControllerBase
{
    [HttpPut("{id}/profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile(string id, ProfileUpdateRequest req)
    {
        var u = await db.Users.FindAsync(id);
        if (u is null) return NotFound();

        u.Name = req.Name.Trim();
        u.Email = req.Email.Trim();
        u.ProfileTitle = req.Title;
        u.ProfileDepartment = req.Department;
        u.ProfilePhone = req.Phone;
        u.ProfileLocation = req.Location;
        u.ProfileBio = req.Bio;

        await db.SaveChangesAsync();
        return u.ToDto();
    }

    [HttpPut("{id}/avatar")]
    public async Task<ActionResult<UserDto>> UpdateAvatar(string id, AvatarUpdateRequest req)
    {
        var u = await db.Users.FindAsync(id);
        if (u is null) return NotFound();
        u.ProfileAvatarUrl = req.AvatarUrl ?? "";
        await db.SaveChangesAsync();
        return u.ToDto();
    }
}
