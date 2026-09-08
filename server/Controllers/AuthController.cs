using AcmeAdmin.Api.Data;
using AcmeAdmin.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AcmeAdmin.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginRequest req)
    {
        var email = (req.Email ?? "").Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user is null)
            return BadRequest(new { error = "No account found for that email address." });
        if (user.Password != req.Password)
            return BadRequest(new { error = "Incorrect password. Please try again." });

        return user.ToDto();
    }
}
