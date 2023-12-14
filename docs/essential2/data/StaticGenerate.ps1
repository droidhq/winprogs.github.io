# Convert JSON to PowerShell object
Invoke-Expression ./JsonGenerate.ps1
$data = Get-Content -Raw -Path '../data.json' | ConvertFrom-Json
$Categories = (Get-ChildItem .\Categories\).BaseName | Select-Object -Skip 0

# Create HTML content with embedded CSS
$htmlContent = @'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Software Categories</title>
    <style>
        body {
            background-color: black;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            padding: 20px;
        }

        h3 {
            color: #61dafb; /* Light blue color for category headings */
        }

        ul {
            list-style-type: none;
            padding: 0;
        }

        li {
            margin-bottom: 10px;
        }

        a {
            color: #3498db; /* Bluish color for links */
            text-decoration: none; /* Remove underline */
        }

        a:hover {
            text-decoration: none; /* Underline on hover */
        }
    </style>
</head>
<body>
'@



foreach ($Category in $Categories) {
    $htmlContent += @"
    <h3>$Category</h3>
    <ul>
"@

    foreach ($app in $data.$Category) {
        $output = ''

        # App details are added to $output based on conditions
        if ($app.Website) { $output += "<a href='$($app.Website)' target='_blank'>$($app.App):</a>" } elseif ($app.App) {
            $output += "$($app.App): "
        }

        if ($app.Download) { $output += "<a href='$($app.Download)' target='_blank'>[Download]</a>" } 

        if ($app.Source) { $output += "<a href='$($app.Source)' target='_blank'> [SOURCE/Wiki++]</a> " }

        if ($app.Detail) { $output += " $($app.Detail)" }

        if ($output -ne '') {
            $htmlContent += "<li>$output</li>`n"
        }
    }

    $htmlContent += @'
    </ul>
'@
}

$htmlContent += @'
</body>
</html>
'@

# Save HTML content to a file
$htmlContent | Out-File -FilePath '../EssentialStatic.html' -Encoding UTF8

Write-Host "HTML file 'SoftwareCategories.html' created successfully."
