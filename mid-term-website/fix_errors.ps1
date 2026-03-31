$content1 = Get-Content app/dashboard/payments/page.tsx -Raw
$content1 = $content1 -replace 'if \(!res\.ok\) \{[\s\n]*toast\.error\(payload\.error \|\| "Failed to submit payment"\);[\s\n]*return;[\s\n]*\}', "if (!res.ok) {
        const errorMsg = Array.isArray(payload.error) 
          ? payload.error[0]?.message || 'Validation error'
          : typeof payload.error === 'string'
            ? payload.error
            : 'Failed to submit payment';
        toast.error(errorMsg);
        return;
      }"
Set-Content app/dashboard/payments/page.tsx -Value $content1

$content2 = Get-Content app/dashboard/ads/new/page.tsx -Raw
$content2 = $content2 -replace 'toast\.error\(payload\.error\?\.\[0\]\?\.message \|\| payload\.error \|\| "Failed to create draft"\);[\s\n]*return;', "const errorMsg = Array.isArray(payload.error) 
          ? payload.error[0]?.message || 'Validation error'
          : typeof payload.error === 'string'
            ? payload.error
            : 'Failed to create draft';
        toast.error(errorMsg);
        return;"
Set-Content app/dashboard/ads/new/page.tsx -Value $content2
