using AcmeAdmin.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AcmeAdmin.Api.Data;

/// <summary>
/// Seed data mirrored from the original Angular mock-data.ts so the database
/// starts with the same demo content.
/// </summary>
public static class Seed
{
    public static void Apply(ModelBuilder b)
    {
        b.Entity<Tenant>().HasData(
            new Tenant { Id = "orient", Name = "Orient Textiles", BrandingPrimary = "#a9805b", BrandingShortName = "OT", EnabledFeatures = "dashboard,users,reports,settings" },
            new Tenant { Id = "packages", Name = "Packages Group", BrandingPrimary = "#8f6844", BrandingShortName = "PG", EnabledFeatures = "dashboard,users,settings" },
            new Tenant { Id = "systems", Name = "Systems Limited", BrandingPrimary = "#7c5234", BrandingShortName = "SL", EnabledFeatures = "dashboard,reports" }
        );

        b.Entity<AppUser>().HasData(
            new AppUser
            {
                Id = "u-admin", Name = "Mahad Shehzad", Email = "mahad@acme.pk", Password = "admin123",
                Role = "Admin", TenantIds = "orient,packages,systems", EmployeeId = "e1",
                ProfileTitle = "Head of Operations", ProfileDepartment = "Operations", ProfilePhone = "+92 300 1234567",
                ProfileLocation = "Sialkot, Pakistan",
                ProfileBio = "Oversees platform administration and tenant onboarding across all regions.",
                ProfileJoinedAt = "March 2023", ProfileAvatarUrl = ""
            },
            new AppUser
            {
                Id = "u-manager", Name = "Bilal Ahmed", Email = "bilal.ahmed@acme.pk", Password = "manager123",
                Role = "Manager", TenantIds = "orient,packages", EmployeeId = "e2",
                ProfileTitle = "Sales Manager", ProfileDepartment = "Sales", ProfilePhone = "+92 321 7654321",
                ProfileLocation = "Lahore, Pakistan",
                ProfileBio = "Leads the northern sales team and owns the active project portfolio.",
                ProfileJoinedAt = "August 2023", ProfileAvatarUrl = ""
            },
            new AppUser
            {
                Id = "u-employee", Name = "Imran Yousaf", Email = "imran.yousaf@acme.pk", Password = "employee123",
                Role = "Employee", TenantIds = "orient", EmployeeId = "e4",
                ProfileTitle = "Software Engineer", ProfileDepartment = "Engineering", ProfilePhone = "+92 345 2223344",
                ProfileLocation = "Lahore, Pakistan",
                ProfileBio = "Builds and maintains internal tools for the operations team.",
                ProfileJoinedAt = "February 2024", ProfileAvatarUrl = ""
            },
            new AppUser
            {
                Id = "u-viewer", Name = "Sana Malik", Email = "sana.malik@acme.pk", Password = "viewer123",
                Role = "Viewer", TenantIds = "orient", EmployeeId = "e3",
                ProfileTitle = "Business Analyst", ProfileDepartment = "Analytics", ProfilePhone = "+92 333 9876543",
                ProfileLocation = "Islamabad, Pakistan",
                ProfileBio = "Reviews dashboards and report summaries to support planning decisions.",
                ProfileJoinedAt = "January 2024", ProfileAvatarUrl = ""
            }
        );

        b.Entity<Department>().HasData(
            new Department { Id = "dept-ops", Name = "Operations", Lead = "Mahad Shehzad", TenantId = "orient" },
            new Department { Id = "dept-sales", Name = "Sales", Lead = "Bilal Ahmed", TenantId = "orient" },
            new Department { Id = "dept-eng", Name = "Engineering", Lead = "Hassan Raza", TenantId = "orient" },
            new Department { Id = "dept-analytics", Name = "Analytics", Lead = "Sana Malik", TenantId = "orient" },
            new Department { Id = "dept-hr", Name = "Human Resources", Lead = "Maryam Nawaz", TenantId = "orient" }
        );

        b.Entity<Employee>().HasData(
            new Employee { Id = "e1", Name = "Mahad Shehzad", Email = "mahad@acme.pk", Role = "Admin", Status = "Active", Position = "Head of Operations", DepartmentId = "dept-ops", ManagerId = null, Salary = 720000, Phone = "+92 300 1234567", Location = "Sialkot", JoinedAt = "2023-03-06", TenantId = "orient" },
            new Employee { Id = "e2", Name = "Bilal Ahmed", Email = "bilal.ahmed@acme.pk", Role = "Manager", Status = "Active", Position = "Sales Manager", DepartmentId = "dept-sales", ManagerId = "e1", Salary = 480000, Phone = "+92 321 7654321", Location = "Lahore", JoinedAt = "2023-08-14", TenantId = "orient" },
            new Employee { Id = "e3", Name = "Sana Malik", Email = "sana.malik@acme.pk", Role = "Viewer", Status = "Active", Position = "Business Analyst", DepartmentId = "dept-analytics", ManagerId = "e2", Salary = 260000, Phone = "+92 333 9876543", Location = "Islamabad", JoinedAt = "2024-01-09", TenantId = "orient" },
            new Employee { Id = "e4", Name = "Imran Yousaf", Email = "imran.yousaf@acme.pk", Role = "Employee", Status = "Active", Position = "Software Engineer", DepartmentId = "dept-eng", ManagerId = "e2", Salary = 340000, Phone = "+92 345 2223344", Location = "Lahore", JoinedAt = "2024-02-01", TenantId = "orient" },
            new Employee { Id = "e5", Name = "Fatima Sheikh", Email = "fatima.sheikh@acme.pk", Role = "Employee", Status = "Invited", Position = "Sales Executive", DepartmentId = "dept-sales", ManagerId = "e2", Salary = 220000, Phone = "+92 300 4455667", Location = "Lahore", JoinedAt = "2024-06-18", TenantId = "orient" },
            new Employee { Id = "e6", Name = "Usman Raza", Email = "usman.raza@acme.pk", Role = "Employee", Status = "Active", Position = "Operations Analyst", DepartmentId = "dept-ops", ManagerId = "e1", Salary = 300000, Phone = "+92 301 5566778", Location = "Karachi", JoinedAt = "2023-11-02", TenantId = "orient" },
            new Employee { Id = "e7", Name = "Zainab Iqbal", Email = "zainab.iqbal@acme.pk", Role = "Employee", Status = "Active", Position = "Frontend Engineer", DepartmentId = "dept-eng", ManagerId = "e2", Salary = 320000, Phone = "+92 302 6677889", Location = "Remote", JoinedAt = "2024-03-21", TenantId = "orient" },
            new Employee { Id = "e8", Name = "Hamza Farooq", Email = "hamza.farooq@acme.pk", Role = "Employee", Status = "Suspended", Position = "Support Specialist", DepartmentId = "dept-ops", ManagerId = "e1", Salary = 210000, Phone = "+92 303 7788990", Location = "Karachi", JoinedAt = "2023-09-11", TenantId = "orient" },
            new Employee { Id = "e9", Name = "Maryam Nawaz", Email = "maryam.nawaz@acme.pk", Role = "Manager", Status = "Active", Position = "HR Business Partner", DepartmentId = "dept-hr", ManagerId = "e1", Salary = 440000, Phone = "+92 304 8899001", Location = "Islamabad", JoinedAt = "2023-05-30", TenantId = "orient" },
            new Employee { Id = "e10", Name = "Ali Hassan", Email = "ali.hassan@acme.pk", Role = "Employee", Status = "Active", Position = "Data Analyst", DepartmentId = "dept-analytics", ManagerId = "e2", Salary = 280000, Phone = "+92 305 9900112", Location = "Lahore", JoinedAt = "2024-04-15", TenantId = "orient" }
        );

        b.Entity<Meeting>().HasData(
            new Meeting { Id = "m1", Title = "Weekly leadership sync", Date = "2026-09-10", Time = "10:00", DurationMins = 45, Attendees = "Mahad, Bilal, Maryam", OwnerId = "u-admin", Status = "Scheduled" },
            new Meeting { Id = "m2", Title = "Q4 hiring plan review", Date = "2026-09-12", Time = "14:30", DurationMins = 60, Attendees = "Mahad, Maryam", OwnerId = "u-admin", Status = "Scheduled" },
            new Meeting { Id = "m3", Title = "Vendor contract call", Date = "2026-09-05", Time = "16:00", DurationMins = 30, Attendees = "Mahad, External", OwnerId = "u-admin", Status = "Completed" },
            new Meeting { Id = "m4", Title = "Sales pipeline standup", Date = "2026-09-09", Time = "09:15", DurationMins = 20, Attendees = "Bilal, Fatima, Ali", OwnerId = "u-manager", Status = "Scheduled" }
        );

        b.Entity<Project>().HasData(
            new Project { Id = "p1", Name = "Retail portal revamp", Client = "Orient Retail", Status = "In progress", Progress = 62, LeadId = "e2", MemberIds = "e4,e7,e10", DueDate = "2026-11-15" },
            new Project { Id = "p2", Name = "Warehouse automation", Client = "Internal Ops", Status = "Planning", Progress = 15, LeadId = "e2", MemberIds = "e6,e4", DueDate = "2027-01-20" },
            new Project { Id = "p3", Name = "Analytics data mart", Client = "Internal", Status = "On hold", Progress = 40, LeadId = "e2", MemberIds = "e3,e10", DueDate = "2026-12-05" }
        );

        b.Entity<LeaveRequest>().HasData(
            new LeaveRequest { Id = "l1", EmployeeId = "e4", Type = "Annual", From = "2026-09-22", To = "2026-09-24", Days = 3, Reason = "Family trip", Status = "Pending" },
            new LeaveRequest { Id = "l2", EmployeeId = "e4", Type = "Sick", From = "2026-08-11", To = "2026-08-11", Days = 1, Reason = "Fever", Status = "Approved" },
            new LeaveRequest { Id = "l3", EmployeeId = "e7", Type = "Casual", From = "2026-09-18", To = "2026-09-18", Days = 1, Reason = "Personal errand", Status = "Pending" },
            new LeaveRequest { Id = "l4", EmployeeId = "e10", Type = "Annual", From = "2026-10-01", To = "2026-10-03", Days = 3, Reason = "Vacation", Status = "Pending" }
        );

        b.Entity<AttendanceRecord>().HasData(AttendanceFor("e4").Concat(AttendanceFor("e7")).ToArray());

        b.Entity<Payslip>().HasData(
            PayslipsFor("e4", 78000).Concat(PayslipsFor("e7", 74000)).ToArray());
    }

    private static IEnumerable<AttendanceRecord> AttendanceFor(string employeeId)
    {
        var rows = new (string date, string ci, string co, string status, double hours)[]
        {
            ("2026-09-01", "09:05", "17:35", "Present", 8.5),
            ("2026-09-02", "09:00", "17:10", "Present", 8.2),
            ("2026-09-03", "—", "—", "Remote", 8),
            ("2026-09-04", "09:20", "17:40", "Present", 8.3),
            ("2026-09-05", "—", "—", "Leave", 0),
            ("2026-09-08", "08:55", "17:25", "Present", 8.5),
        };
        return rows.Select((r, i) => new AttendanceRecord
        {
            Id = $"{employeeId}-att-{i}", EmployeeId = employeeId,
            Date = r.date, ClockIn = r.ci, ClockOut = r.co, Status = r.status, Hours = r.hours,
        });
    }

    private static IEnumerable<Payslip> PayslipsFor(string employeeId, int monthlyGross)
    {
        var periods = new[] { "June 2026", "July 2026", "August 2026" };
        var paidOn = new[] { "2026-06-30", "2026-07-31", "2026-08-31" };
        int tax = (int)Math.Round(monthlyGross * 0.1);
        const int deductions = 3500;
        return periods.Select((p, i) => new Payslip
        {
            Id = $"{employeeId}-pay-{i}", EmployeeId = employeeId, Period = p,
            Gross = monthlyGross, Tax = tax, Deductions = deductions,
            Net = monthlyGross - tax - deductions, PaidOn = paidOn[i],
        });
    }
}
