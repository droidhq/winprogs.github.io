$Categories = (Get-ChildItem .\Categories\).BaseName

# Create and populate the hashtable, then convert it to JSON
$jsonOutput = $Categories | ForEach-Object {
    $categoryName = $_
    $categoryData = Get-Content ".\Categories\$categoryName.csv" | ConvertFrom-Csv -Header 'App', 'ID', 'Webiste', 'Download', 'Source', 'Detail'    
    @{
        $categoryName = $categoryData | ForEach-Object {
            @{
                'App'      = $_.App
                'ID'       = $_.ID
                'Website'  = $_.Webiste
                'Download' = $_.Download
                'Source'   = $_.Source
                'Detail'   = $_.Detail
            }
        }
    }
} | ConvertTo-Json -Depth 4 -Compress 

# Display the JSON
$jsonOutput | Out-File '../data.json' -Encoding utf8

$Categories = 'All', $Categories
$Categories = $Categories | ForEach-Object { $_ }
$Categories | ConvertTo-Json -Compress | Out-File '../categories.json' -Encoding utf8
