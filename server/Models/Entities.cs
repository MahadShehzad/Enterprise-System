namespace AcmeAdmin.Api.Models;

public class Tenant
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string BrandingPrimary { get; set; } = "";
    public string BrandingShortName { get; set; } = "";
    /// <summary>Comma-separated feature keys, e.g. "dashboard,users,reports".</summary>
    public string EnabledFeatures { get; set; } = "";
}

public class AppUser
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "";
    /// <summary>Comma-separated tenant ids.</summary>
    public string TenantIds { get; set; } = "";
    public string? EmployeeId { get; set; }

    public string ProfileTitle { get; set; } = "";
    public string ProfileDepartment { get; set; } = "";
    public string ProfilePhone { get; set; } = "";
    public string ProfileLocation { get; set; } = "";
    public string ProfileBio { get; set; } = "";
    public string ProfileJoinedAt { get; set; } = "";
    public string ProfileAvatarUrl { get; set; } = "";
}

public class Department
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Lead { get; set; } = "";
    public string TenantId { get; set; } = "";
}

public class Employee
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public string Status { get; set; } = "";
    public string Position { get; set; } = "";
    public string DepartmentId { get; set; } = "";
    public string? ManagerId { get; set; }
    public int Salary { get; set; }
    public string Phone { get; set; } = "";
    public string Location { get; set; } = "";
    public string JoinedAt { get; set; } = "";
    public string TenantId { get; set; } = "";
}

public class Meeting
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Date { get; set; } = "";
    public string Time { get; set; } = "";
    public int DurationMins { get; set; }
    public string Attendees { get; set; } = "";
    public string OwnerId { get; set; } = "";
    public string Status { get; set; } = "";
}

public class Project
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Client { get; set; } = "";
    public string Status { get; set; } = "";
    public int Progress { get; set; }
    public string LeadId { get; set; } = "";
    /// <summary>Comma-separated employee ids.</summary>
    public string MemberIds { get; set; } = "";
    public string DueDate { get; set; } = "";
}

public class LeaveRequest
{
    public string Id { get; set; } = "";
    public string EmployeeId { get; set; } = "";
    public string Type { get; set; } = "";
    public string From { get; set; } = "";
    public string To { get; set; } = "";
    public int Days { get; set; }
    public string Reason { get; set; } = "";
    public string Status { get; set; } = "";
}

public class AttendanceRecord
{
    public string Id { get; set; } = "";
    public string EmployeeId { get; set; } = "";
    public string Date { get; set; } = "";
    public string ClockIn { get; set; } = "";
    public string ClockOut { get; set; } = "";
    public string Status { get; set; } = "";
    public double Hours { get; set; }
}

public class Payslip
{
    public string Id { get; set; } = "";
    public string EmployeeId { get; set; } = "";
    public string Period { get; set; } = "";
    public int Gross { get; set; }
    public int Tax { get; set; }
    public int Deductions { get; set; }
    public int Net { get; set; }
    public string PaidOn { get; set; } = "";
}
