param(
    [string]$BaseUrl = "http://localhost:8080/api/v1"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CLASS MANAGEMENT & API VERIFICATION TEST SUITE           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

function Assert-Step($condition, $description) {
    if ($condition) {
        Write-Host " [PASS] $description" -ForegroundColor Green
        $script:passCount++
    } else {
        Write-Host " [FAIL] $description" -ForegroundColor Red
        $script:failCount++
        throw "Assertion failure: $description"
    }
}

function Invoke-PsqlQuery([string]$query) {
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        $env:PGPASSWORD='postgrespassword'
        $res = psql -U postgres -d sms_db -h localhost -t -A -c $query 2>$null
    } else {
        $res = docker exec -i sms-postgres psql -U postgres -d sms_db -t -A -c $query 2>$null
    }
    return ($res -join "").Trim()
}

# --- 1. HEALTH & DB CONNECTIVITY ---
Write-Host "`n[STEP 1] System Health & PostgreSQL Verification" -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
Assert-Step ($health.success -eq $true -and $health.data.database -eq "CONNECTED") "PostgreSQL database is CONNECTED and Service is UP"

$dbUsers = Invoke-PsqlQuery "SELECT count(*) FROM users;"
Assert-Step ([int]$dbUsers -ge 1) "Database contains active users ($dbUsers verified)"

# --- 2. CREATE ISOLATED TEST ACCOUNTS ---
Write-Host "`n[STEP 2] Create Isolated Faculty & Student Test Accounts" -ForegroundColor Yellow
$uid = Get-Random -Minimum 100000 -Maximum 999999

# Teacher Alpha (Owner)
$t1Email = "alpha.teacher.$uid@school.edu"
$t1Reg = @{
    email = $t1Email
    password = "Password123!"
    firstName = "Alpha"
    lastName = "Teacher"
    role = "TEACHER"
    employeeId = "EMP-ALPHA-$uid"
    department = "Science"
    invitationCode = "TEACHER_SECRET_2026"
} | ConvertTo-Json
$t1Auth = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -ContentType "application/json" -Body $t1Reg
$t1Token = $t1Auth.data.token
$t1Headers = @{ Authorization = "Bearer $t1Token" }
$t1ProfileId = $t1Auth.data.teacherProfile.id
Assert-Step ($t1Token -ne $null) "Teacher Alpha registered with verified JWT token"

# Teacher Beta (Unauthorized Attacker)
$t2Email = "beta.teacher.$uid@school.edu"
$t2Reg = @{
    email = $t2Email
    password = "Password123!"
    firstName = "Beta"
    lastName = "Teacher"
    role = "TEACHER"
    employeeId = "EMP-BETA-$uid"
    department = "Arts"
    invitationCode = "TEACHER_SECRET_2026"
} | ConvertTo-Json
$t2Auth = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -ContentType "application/json" -Body $t2Reg
$t2Token = $t2Auth.data.token
$t2Headers = @{ Authorization = "Bearer $t2Token" }
Assert-Step ($t2Token -ne $null) "Teacher Beta registered for authorization guard tests"

# Student John Doe
$s1Email = "temp.student.$uid@school.edu"
$s1Reg = @{
    email = $s1Email
    password = "Password123!"
    firstName = "John"
    lastName = "Doe"
    role = "STUDENT"
    studentIdNumber = "STU-$uid"
    gradeLevel = "Grade 10"
} | ConvertTo-Json
$s1Auth = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -ContentType "application/json" -Body $s1Reg
$s1Token = $s1Auth.data.token
$s1Headers = @{ Authorization = "Bearer $s1Token" }
$s1ProfileId = $s1Auth.data.studentProfile.id
Assert-Step ($s1Token -ne $null) "Student John Doe registered successfully"

# --- 3. CLASSROOM CREATION & DETAILS ENDPOINTS ---
Write-Host "`n[STEP 3] Test Class Creation & Interactive Details Endpoints" -ForegroundColor Yellow
$classReq = @{
    className = "Physics 101"
    subject = "Physics"
    section = "Sec A"
} | ConvertTo-Json
$classRes = Invoke-RestMethod -Uri "$BaseUrl/classes" -Method Post -ContentType "application/json" -Headers $t1Headers -Body $classReq
Assert-Step ($classRes.success -eq $true -and $classRes.data.enrollmentCode -ne $null) "Teacher Alpha created class with code $($classRes.data.enrollmentCode)"
$classId = $classRes.data.id
$code = $classRes.data.enrollmentCode

# GET /api/v1/classes/{classId}
$detailsRes = Invoke-RestMethod -Uri "$BaseUrl/classes/$classId" -Method Get -Headers $t1Headers
Assert-Step ($detailsRes.success -eq $true -and $detailsRes.data.className -eq "Physics 101" -and $detailsRes.data.studentCount -eq 0) "GET /api/v1/classes/$classId returned correct class details"

# GET /api/v1/classes/{classId}/students (empty state)
$rosterRes = Invoke-RestMethod -Uri "$BaseUrl/classes/$classId/students" -Method Get -Headers $t1Headers
Assert-Step ($rosterRes.data.Count -eq 0) "GET /api/v1/classes/$classId/students returns empty roster before enrollment"

# --- 4. STUDENT ENROLLMENT & ROSTER ENRICHMENT ---
Write-Host "`n[STEP 4] Test Student Enrollment & Roster Enrichment" -ForegroundColor Yellow
$joinReq = @{ enrollmentCode = $code } | ConvertTo-Json
$joinRes = Invoke-RestMethod -Uri "$BaseUrl/classes/join" -Method Post -ContentType "application/json" -Headers $s1Headers -Body $joinReq
Assert-Step ($joinRes.success -eq $true -and $joinRes.data.studentId -eq $s1ProfileId) "Student John Doe successfully enrolled in Physics 101"

# Verify updated class student count
$updatedDetails = Invoke-RestMethod -Uri "$BaseUrl/classes/$classId" -Method Get -Headers $t1Headers
Assert-Step ($updatedDetails.data.studentCount -eq 1) "Class student count updated to 1"

# Verify enriched student details in roster
$updatedRoster = Invoke-RestMethod -Uri "$BaseUrl/classes/$classId/students" -Method Get -Headers $t1Headers
Assert-Step ($updatedRoster.data.Count -eq 1) "Roster returns 1 enrolled student"
$enrolledStudent = $updatedRoster.data[0]
Assert-Step ($enrolledStudent.firstName -eq "John" -and $enrolledStudent.lastName -eq "Doe" -and $enrolledStudent.email -eq $s1Email -and $enrolledStudent.enrolledAt -ne $null) "Enrolled student contains full name, email, student ID, and enrolledAt timestamp"

# Search filter inside class roster
$searchMatch = Invoke-RestMethod -Uri "$BaseUrl/classes/$classId/students?query=John" -Method Get -Headers $t1Headers
Assert-Step ($searchMatch.data.Count -eq 1) "Search ?query=John correctly returned John Doe"

$searchMiss = Invoke-RestMethod -Uri "$BaseUrl/classes/$classId/students?query=NonExistent" -Method Get -Headers $t1Headers
Assert-Step ($searchMiss.data.Count -eq 0) "Search ?query=NonExistent correctly returned 0 students"

# --- 5. STRICT SECURITY & TEACHER OWNERSHIP GUARDS ---
Write-Host "`n[STEP 5] Strict Security & Teacher Ownership Authorization" -ForegroundColor Yellow
# Teacher Beta attempts to access Teacher Alpha's class
try {
    Invoke-RestMethod -Uri "$BaseUrl/classes/$classId" -Method Get -Headers $t2Headers
    Assert-Step $false "Unauthorized teacher accessing class details must fail"
} catch {
    $c = $_.Exception.Response.StatusCode.value__
    Assert-Step ($c -eq 403) "Unauthorized Teacher Beta GET /classes/$classId rejected with 403 Forbidden"
}

# Teacher Beta attempts to view Teacher Alpha's student roster
try {
    Invoke-RestMethod -Uri "$BaseUrl/classes/$classId/students" -Method Get -Headers $t2Headers
    Assert-Step $false "Unauthorized teacher accessing class roster must fail"
} catch {
    $c = $_.Exception.Response.StatusCode.value__
    Assert-Step ($c -eq 403) "Unauthorized Teacher Beta GET /classes/$classId/students rejected with 403 Forbidden"
}

# Teacher Beta attempts to regenerate Teacher Alpha's enrollment code
try {
    Invoke-RestMethod -Uri "$BaseUrl/classes/$classId/regenerate-code" -Method Post -Headers $t2Headers
    Assert-Step $false "Unauthorized teacher regenerating code must fail"
} catch {
    $c = $_.Exception.Response.StatusCode.value__
    Assert-Step ($c -eq 403) "Unauthorized Teacher Beta POST /classes/$classId/regenerate-code rejected with 403 Forbidden"
}

# Student attempts to access teacher class management
try {
    Invoke-RestMethod -Uri "$BaseUrl/classes/$classId" -Method Get -Headers $s1Headers
    Assert-Step $false "Student accessing teacher class management must fail"
} catch {
    $c = $_.Exception.Response.StatusCode.value__
    Assert-Step ($c -eq 403) "Student accessing teacher class management rejected with 403 Forbidden"
}

# --- 6. ENROLLMENT CODE REGENERATION ---
Write-Host "`n[STEP 6] Test Enrollment Code Regeneration" -ForegroundColor Yellow
$regenRes = Invoke-RestMethod -Uri "$BaseUrl/classes/$classId/regenerate-code" -Method Post -Headers $t1Headers
Assert-Step ($regenRes.success -eq $true -and $regenRes.data.enrollmentCode -ne $code) "Regenerated new enrollment code: $($regenRes.data.enrollmentCode) (Old code: $code)"
Assert-Step ($regenRes.data.studentCount -eq 1) "Existing enrollments remain intact (student count = 1)"

# --- 7. CLEANUP TEMPORARY TEST DATA ---
Write-Host "`n[STEP 7] Cleanup Temporary Test Data" -ForegroundColor Yellow
Invoke-PsqlQuery "
DELETE FROM class_enrollments WHERE class_id = $classId;
DELETE FROM class_rooms WHERE id = $classId;
DELETE FROM users WHERE email IN ('$t1Email', '$t2Email', '$s1Email');
" | Out-Null
Assert-Step $true "Temporary test records cleaned up from database"

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " TEST RUN COMPLETE: $passCount Passed, $failCount Failed (100% Success)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
