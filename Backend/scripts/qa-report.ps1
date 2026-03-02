param(
    [switch]$SkipGradle
)

$ErrorActionPreference = "Continue"

function Get-ModuleFromPath {
    param([string]$Path)

    $marker = "\services\"
    $parts = $Path -split [regex]::Escape($marker)
    if ($parts.Count -lt 2) {
        return "root"
    }

    $tail = $parts[1]
    return ($tail -split "\\")[0]
}

function Get-CoveragePercent {
    param(
        [xml]$JacocoXml,
        [string]$CounterType
    )

    $counter = $JacocoXml.report.counter | Where-Object { $_.type -eq $CounterType }
    if (-not $counter) {
        return 0
    }

    $covered = [double]$counter.covered
    $missed = [double]$counter.missed
    if (($covered + $missed) -eq 0) {
        return 0
    }

    return [math]::Round(($covered / ($covered + $missed)) * 100, 2)
}

if (-not $SkipGradle) {
    Write-Host "Running full test suite with JaCoCo..."
    & .\gradlew clean test jacocoRootReport --continue --no-daemon --console=plain
    $gradleExit = $LASTEXITCODE
} else {
    Write-Host "Skipping Gradle execution (-SkipGradle). Reading existing reports..."
    $gradleExit = 0
}

$testFiles = Get-ChildItem "services/*/build/test-results/test/TEST-*.xml" -ErrorAction SilentlyContinue
$rows = @()

foreach ($file in $testFiles) {
    [xml]$xml = Get-Content $file.FullName
    $suite = $xml.testsuite.name
    $module = Get-ModuleFromPath -Path $file.FullName

    foreach ($testCase in $xml.testsuite.testcase) {
        $status = if ($testCase.failure -or $testCase.error) { "FAIL" } else { "PASS" }
        $rows += [pscustomobject]@{
            Module  = $module
            Test    = "$suite.$($testCase.name)"
            Status  = $status
            TimeSec = [double]$testCase.time
        }
    }
}

Write-Host ""
Write-Host "=== TEST CASES (PASS/FAIL) ==="
if ($rows.Count -eq 0) {
    Write-Host "No test result files found under services/*/build/test-results/test."
} else {
    $rows | Sort-Object Module, Test | Format-Table -AutoSize
}

$total = $rows.Count
$failed = ($rows | Where-Object { $_.Status -eq "FAIL" }).Count
$passed = $total - $failed
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }

Write-Host ""
Write-Host "=== TEST SUMMARY ==="
Write-Host "Total: $total"
Write-Host "Passed: $passed"
Write-Host "Failed: $failed"
Write-Host "Pass Rate: $passRate`%"

$rootJacoco = "build/reports/jacoco/jacocoRootReport/jacocoRootReport.xml"
if (Test-Path $rootJacoco) {
    [xml]$root = Get-Content $rootJacoco
    $linePct = Get-CoveragePercent -JacocoXml $root -CounterType "LINE"
    $branchPct = Get-CoveragePercent -JacocoXml $root -CounterType "BRANCH"
    $instrPct = Get-CoveragePercent -JacocoXml $root -CounterType "INSTRUCTION"

    Write-Host ""
    Write-Host "=== GLOBAL COVERAGE ==="
    Write-Host "LINE:        $linePct`%"
    Write-Host "BRANCH:      $branchPct`%"
    Write-Host "INSTRUCTION: $instrPct`%"
} else {
    Write-Host ""
    Write-Host "Global JaCoCo report not found at $rootJacoco"
}

Write-Host ""
Write-Host "=== MODULE COVERAGE ==="
$moduleReports = Get-ChildItem "services/*/build/reports/jacoco/test/jacocoTestReport.xml" -ErrorAction SilentlyContinue
if ($moduleReports.Count -eq 0) {
    Write-Host "No module JaCoCo reports found."
} else {
    foreach ($report in $moduleReports) {
        [xml]$jacoco = Get-Content $report.FullName
        $module = Get-ModuleFromPath -Path $report.FullName
        $linePct = Get-CoveragePercent -JacocoXml $jacoco -CounterType "LINE"
        $branchPct = Get-CoveragePercent -JacocoXml $jacoco -CounterType "BRANCH"
        $instrPct = Get-CoveragePercent -JacocoXml $jacoco -CounterType "INSTRUCTION"
        Write-Host "$module -> LINE: $linePct`% | BRANCH: $branchPct`% | INSTRUCTION: $instrPct`%"
    }
}

exit $gradleExit

