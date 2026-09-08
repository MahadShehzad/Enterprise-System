using AcmeAdmin.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AcmeAdmin.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<AttendanceRecord> Attendance => Set<AttendanceRecord>();
    public DbSet<Payslip> Payslips => Set<Payslip>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Tenant>().HasKey(x => x.Id);
        b.Entity<AppUser>().HasKey(x => x.Id);
        b.Entity<Department>().HasKey(x => x.Id);
        b.Entity<Employee>().HasKey(x => x.Id);
        b.Entity<Meeting>().HasKey(x => x.Id);
        b.Entity<Project>().HasKey(x => x.Id);
        b.Entity<LeaveRequest>().HasKey(x => x.Id);
        b.Entity<AttendanceRecord>().HasKey(x => x.Id);
        b.Entity<Payslip>().HasKey(x => x.Id);

        Seed.Apply(b);
    }
}
