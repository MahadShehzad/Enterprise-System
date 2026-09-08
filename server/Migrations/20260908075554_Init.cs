using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AcmeAdmin.Api.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Attendance",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmployeeId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Date = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClockIn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClockOut = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Hours = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attendance", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Lead = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DepartmentId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ManagerId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Salary = table.Column<int>(type: "int", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JoinedAt = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LeaveRequests",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmployeeId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    From = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    To = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Days = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Meetings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Date = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Time = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DurationMins = table.Column<int>(type: "int", nullable: false),
                    Attendees = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OwnerId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meetings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Payslips",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmployeeId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Period = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Gross = table.Column<int>(type: "int", nullable: false),
                    Tax = table.Column<int>(type: "int", nullable: false),
                    Deductions = table.Column<int>(type: "int", nullable: false),
                    Net = table.Column<int>(type: "int", nullable: false),
                    PaidOn = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payslips", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Client = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Progress = table.Column<int>(type: "int", nullable: false),
                    LeadId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MemberIds = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DueDate = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BrandingPrimary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BrandingShortName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EnabledFeatures = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TenantIds = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmployeeId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProfileTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProfileDepartment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProfilePhone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProfileLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProfileBio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProfileJoinedAt = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProfileAvatarUrl = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Attendance",
                columns: new[] { "Id", "ClockIn", "ClockOut", "Date", "EmployeeId", "Hours", "Status" },
                values: new object[,]
                {
                    { "e4-att-0", "09:05", "17:35", "2026-09-01", "e4", 8.5, "Present" },
                    { "e4-att-1", "09:00", "17:10", "2026-09-02", "e4", 8.1999999999999993, "Present" },
                    { "e4-att-2", "—", "—", "2026-09-03", "e4", 8.0, "Remote" },
                    { "e4-att-3", "09:20", "17:40", "2026-09-04", "e4", 8.3000000000000007, "Present" },
                    { "e4-att-4", "—", "—", "2026-09-05", "e4", 0.0, "Leave" },
                    { "e4-att-5", "08:55", "17:25", "2026-09-08", "e4", 8.5, "Present" },
                    { "e7-att-0", "09:05", "17:35", "2026-09-01", "e7", 8.5, "Present" },
                    { "e7-att-1", "09:00", "17:10", "2026-09-02", "e7", 8.1999999999999993, "Present" },
                    { "e7-att-2", "—", "—", "2026-09-03", "e7", 8.0, "Remote" },
                    { "e7-att-3", "09:20", "17:40", "2026-09-04", "e7", 8.3000000000000007, "Present" },
                    { "e7-att-4", "—", "—", "2026-09-05", "e7", 0.0, "Leave" },
                    { "e7-att-5", "08:55", "17:25", "2026-09-08", "e7", 8.5, "Present" }
                });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Lead", "Name", "TenantId" },
                values: new object[,]
                {
                    { "dept-analytics", "Sana Malik", "Analytics", "orient" },
                    { "dept-eng", "Hassan Raza", "Engineering", "orient" },
                    { "dept-hr", "Maryam Nawaz", "Human Resources", "orient" },
                    { "dept-ops", "Mahad Shehzad", "Operations", "orient" },
                    { "dept-sales", "Bilal Ahmed", "Sales", "orient" }
                });

            migrationBuilder.InsertData(
                table: "Employees",
                columns: new[] { "Id", "DepartmentId", "Email", "JoinedAt", "Location", "ManagerId", "Name", "Phone", "Position", "Role", "Salary", "Status", "TenantId" },
                values: new object[,]
                {
                    { "e1", "dept-ops", "mahad@acme.pk", "2023-03-06", "Sialkot", null, "Mahad Shehzad", "+92 300 1234567", "Head of Operations", "Admin", 720000, "Active", "orient" },
                    { "e10", "dept-analytics", "ali.hassan@acme.pk", "2024-04-15", "Lahore", "e2", "Ali Hassan", "+92 305 9900112", "Data Analyst", "Employee", 280000, "Active", "orient" },
                    { "e2", "dept-sales", "bilal.ahmed@acme.pk", "2023-08-14", "Lahore", "e1", "Bilal Ahmed", "+92 321 7654321", "Sales Manager", "Manager", 480000, "Active", "orient" },
                    { "e3", "dept-analytics", "sana.malik@acme.pk", "2024-01-09", "Islamabad", "e2", "Sana Malik", "+92 333 9876543", "Business Analyst", "Viewer", 260000, "Active", "orient" },
                    { "e4", "dept-eng", "imran.yousaf@acme.pk", "2024-02-01", "Lahore", "e2", "Imran Yousaf", "+92 345 2223344", "Software Engineer", "Employee", 340000, "Active", "orient" },
                    { "e5", "dept-sales", "fatima.sheikh@acme.pk", "2024-06-18", "Lahore", "e2", "Fatima Sheikh", "+92 300 4455667", "Sales Executive", "Employee", 220000, "Invited", "orient" },
                    { "e6", "dept-ops", "usman.raza@acme.pk", "2023-11-02", "Karachi", "e1", "Usman Raza", "+92 301 5566778", "Operations Analyst", "Employee", 300000, "Active", "orient" },
                    { "e7", "dept-eng", "zainab.iqbal@acme.pk", "2024-03-21", "Remote", "e2", "Zainab Iqbal", "+92 302 6677889", "Frontend Engineer", "Employee", 320000, "Active", "orient" },
                    { "e8", "dept-ops", "hamza.farooq@acme.pk", "2023-09-11", "Karachi", "e1", "Hamza Farooq", "+92 303 7788990", "Support Specialist", "Employee", 210000, "Suspended", "orient" },
                    { "e9", "dept-hr", "maryam.nawaz@acme.pk", "2023-05-30", "Islamabad", "e1", "Maryam Nawaz", "+92 304 8899001", "HR Business Partner", "Manager", 440000, "Active", "orient" }
                });

            migrationBuilder.InsertData(
                table: "LeaveRequests",
                columns: new[] { "Id", "Days", "EmployeeId", "From", "Reason", "Status", "To", "Type" },
                values: new object[,]
                {
                    { "l1", 3, "e4", "2026-09-22", "Family trip", "Pending", "2026-09-24", "Annual" },
                    { "l2", 1, "e4", "2026-08-11", "Fever", "Approved", "2026-08-11", "Sick" },
                    { "l3", 1, "e7", "2026-09-18", "Personal errand", "Pending", "2026-09-18", "Casual" },
                    { "l4", 3, "e10", "2026-10-01", "Vacation", "Pending", "2026-10-03", "Annual" }
                });

            migrationBuilder.InsertData(
                table: "Meetings",
                columns: new[] { "Id", "Attendees", "Date", "DurationMins", "OwnerId", "Status", "Time", "Title" },
                values: new object[,]
                {
                    { "m1", "Mahad, Bilal, Maryam", "2026-09-10", 45, "u-admin", "Scheduled", "10:00", "Weekly leadership sync" },
                    { "m2", "Mahad, Maryam", "2026-09-12", 60, "u-admin", "Scheduled", "14:30", "Q4 hiring plan review" },
                    { "m3", "Mahad, External", "2026-09-05", 30, "u-admin", "Completed", "16:00", "Vendor contract call" },
                    { "m4", "Bilal, Fatima, Ali", "2026-09-09", 20, "u-manager", "Scheduled", "09:15", "Sales pipeline standup" }
                });

            migrationBuilder.InsertData(
                table: "Payslips",
                columns: new[] { "Id", "Deductions", "EmployeeId", "Gross", "Net", "PaidOn", "Period", "Tax" },
                values: new object[,]
                {
                    { "e4-pay-0", 3500, "e4", 78000, 66700, "2026-06-30", "June 2026", 7800 },
                    { "e4-pay-1", 3500, "e4", 78000, 66700, "2026-07-31", "July 2026", 7800 },
                    { "e4-pay-2", 3500, "e4", 78000, 66700, "2026-08-31", "August 2026", 7800 },
                    { "e7-pay-0", 3500, "e7", 74000, 63100, "2026-06-30", "June 2026", 7400 },
                    { "e7-pay-1", 3500, "e7", 74000, 63100, "2026-07-31", "July 2026", 7400 },
                    { "e7-pay-2", 3500, "e7", 74000, 63100, "2026-08-31", "August 2026", 7400 }
                });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "Id", "Client", "DueDate", "LeadId", "MemberIds", "Name", "Progress", "Status" },
                values: new object[,]
                {
                    { "p1", "Orient Retail", "2026-11-15", "e2", "e4,e7,e10", "Retail portal revamp", 62, "In progress" },
                    { "p2", "Internal Ops", "2027-01-20", "e2", "e6,e4", "Warehouse automation", 15, "Planning" },
                    { "p3", "Internal", "2026-12-05", "e2", "e3,e10", "Analytics data mart", 40, "On hold" }
                });

            migrationBuilder.InsertData(
                table: "Tenants",
                columns: new[] { "Id", "BrandingPrimary", "BrandingShortName", "EnabledFeatures", "Name" },
                values: new object[,]
                {
                    { "orient", "#a9805b", "OT", "dashboard,users,reports,settings", "Orient Textiles" },
                    { "packages", "#8f6844", "PG", "dashboard,users,settings", "Packages Group" },
                    { "systems", "#7c5234", "SL", "dashboard,reports", "Systems Limited" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "EmployeeId", "Name", "Password", "ProfileAvatarUrl", "ProfileBio", "ProfileDepartment", "ProfileJoinedAt", "ProfileLocation", "ProfilePhone", "ProfileTitle", "Role", "TenantIds" },
                values: new object[,]
                {
                    { "u-admin", "mahad@acme.pk", "e1", "Mahad Shehzad", "admin123", "", "Oversees platform administration and tenant onboarding across all regions.", "Operations", "March 2023", "Sialkot, Pakistan", "+92 300 1234567", "Head of Operations", "Admin", "orient,packages,systems" },
                    { "u-employee", "imran.yousaf@acme.pk", "e4", "Imran Yousaf", "employee123", "", "Builds and maintains internal tools for the operations team.", "Engineering", "February 2024", "Lahore, Pakistan", "+92 345 2223344", "Software Engineer", "Employee", "orient" },
                    { "u-manager", "bilal.ahmed@acme.pk", "e2", "Bilal Ahmed", "manager123", "", "Leads the northern sales team and owns the active project portfolio.", "Sales", "August 2023", "Lahore, Pakistan", "+92 321 7654321", "Sales Manager", "Manager", "orient,packages" },
                    { "u-viewer", "sana.malik@acme.pk", "e3", "Sana Malik", "viewer123", "", "Reviews dashboards and report summaries to support planning decisions.", "Analytics", "January 2024", "Islamabad, Pakistan", "+92 333 9876543", "Business Analyst", "Viewer", "orient" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attendance");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "LeaveRequests");

            migrationBuilder.DropTable(
                name: "Meetings");

            migrationBuilder.DropTable(
                name: "Payslips");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
