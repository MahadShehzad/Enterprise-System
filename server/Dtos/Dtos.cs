using AcmeAdmin.Api.Models;

namespace AcmeAdmin.Api.Dtos;

// ---- read models (shapes match the Angular TypeScript interfaces) ----

public record BrandingDto(string Primary, string ShortName);

public record TenantDto(string Id, string Name, BrandingDto Branding, string[] EnabledFeatures);

public record ProfileDto(
    string Title, string Department, string Phone, string Location,
    string Bio, string JoinedAt, string AvatarUrl);

public record UserDto(
    string Id, string Name, string Email, string Role,
    string[] TenantIds, string? EmployeeId, ProfileDto Profile);

public record DemoAccountDto(string Name, string Email, string Password, string Role);

public record DepartmentDto(string Id, string Name, string Lead, string TenantId);

public record EmployeeDto(
    string Id, string Name, string Email, string Role, string Status, string Position,
    string DepartmentId, string? ManagerId, int Salary, string Phone, string Location,
    string JoinedAt, string TenantId);

public record MeetingDto(
    string Id, string Title, string Date, string Time, int DurationMins,
    string Attendees, string OwnerId, string Status);

public record ProjectDto(
    string Id, string Name, string Client, string Status, int Progress,
    string LeadId, string[] MemberIds, string DueDate);

public record LeaveRequestDto(
    string Id, string EmployeeId, string Type, string From, string To,
    int Days, string Reason, string Status);

public record AttendanceDto(
    string Id, string EmployeeId, string Date, string ClockIn, string ClockOut,
    string Status, double Hours);

public record PayslipDto(
    string Id, string EmployeeId, string Period, int Gross, int Tax,
    int Deductions, int Net, string PaidOn);

public record BootstrapDto(
    IEnumerable<TenantDto> Tenants,
    IEnumerable<DepartmentDto> Departments,
    IEnumerable<EmployeeDto> Employees,
    IEnumerable<MeetingDto> Meetings,
    IEnumerable<ProjectDto> Projects,
    IEnumerable<LeaveRequestDto> Leave,
    IEnumerable<AttendanceDto> Attendance,
    IEnumerable<PayslipDto> Payslips);

// ---- write models ----

public record LoginRequest(string Email, string Password);

public record ProfileUpdateRequest(
    string Name, string Email, string Title, string Department,
    string Phone, string Location, string Bio);

public record AvatarUpdateRequest(string AvatarUrl);

public record EmployeeUpsertRequest(
    string Name, string Email, string Role, string Status, string Position,
    string DepartmentId, string? ManagerId, int Salary, string Phone,
    string Location, string? JoinedAt, string? TenantId);

public record DepartmentUpsertRequest(string Name, string Lead, string? TenantId);

public record MeetingUpsertRequest(
    string Title, string Date, string Time, int DurationMins,
    string Attendees, string? OwnerId, string? Status);

public record ProjectUpsertRequest(
    string Name, string Client, string Status, int Progress,
    string? LeadId, string[] MemberIds, string DueDate);

public record LeaveCreateRequest(
    string EmployeeId, string Type, string From, string To, int Days, string Reason);

public record LeaveStatusRequest(string Status);

public record FeaturesUpdateRequest(string[] EnabledFeatures);

// ---- mapping helpers ----

public static class Map
{
    private static string[] Csv(string s) =>
        string.IsNullOrWhiteSpace(s)
            ? []
            : s.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public static string Join(IEnumerable<string> parts) => string.Join(",", parts);

    public static TenantDto ToDto(this Tenant t) =>
        new(t.Id, t.Name, new BrandingDto(t.BrandingPrimary, t.BrandingShortName), Csv(t.EnabledFeatures));

    public static UserDto ToDto(this AppUser u) =>
        new(u.Id, u.Name, u.Email, u.Role, Csv(u.TenantIds), u.EmployeeId,
            new ProfileDto(u.ProfileTitle, u.ProfileDepartment, u.ProfilePhone,
                u.ProfileLocation, u.ProfileBio, u.ProfileJoinedAt, u.ProfileAvatarUrl));

    public static DepartmentDto ToDto(this Department d) => new(d.Id, d.Name, d.Lead, d.TenantId);

    public static EmployeeDto ToDto(this Employee e) =>
        new(e.Id, e.Name, e.Email, e.Role, e.Status, e.Position, e.DepartmentId,
            e.ManagerId, e.Salary, e.Phone, e.Location, e.JoinedAt, e.TenantId);

    public static MeetingDto ToDto(this Meeting m) =>
        new(m.Id, m.Title, m.Date, m.Time, m.DurationMins, m.Attendees, m.OwnerId, m.Status);

    public static ProjectDto ToDto(this Project p) =>
        new(p.Id, p.Name, p.Client, p.Status, p.Progress, p.LeadId, Csv(p.MemberIds), p.DueDate);

    public static LeaveRequestDto ToDto(this LeaveRequest l) =>
        new(l.Id, l.EmployeeId, l.Type, l.From, l.To, l.Days, l.Reason, l.Status);

    public static AttendanceDto ToDto(this AttendanceRecord a) =>
        new(a.Id, a.EmployeeId, a.Date, a.ClockIn, a.ClockOut, a.Status, a.Hours);

    public static PayslipDto ToDto(this Payslip p) =>
        new(p.Id, p.EmployeeId, p.Period, p.Gross, p.Tax, p.Deductions, p.Net, p.PaidOn);
}
