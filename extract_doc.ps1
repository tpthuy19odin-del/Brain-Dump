Add-Type -AssemblyName System.IO.Compression.FileSystem
$doc = Get-ChildItem -Path "d:\JOB IT" -Filter "*.docx" | Select-Object -First 1
Write-Host "Found file: $($doc.FullName)"
$zip = [System.IO.Compression.ZipFile]::OpenRead($doc.FullName)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xmlText = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$xml = [xml]$xmlText
$nsManager = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$nsManager.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $nsManager)
$output = @()
foreach ($p in $paragraphs) {
    $textNodes = $p.SelectNodes(".//w:t", $nsManager)
    $line = ($textNodes | ForEach-Object { $_.InnerText }) -join ""
    if ($line.Trim() -ne "") {
        $output += $line
    }
}
$output | Out-File -FilePath "d:\JOB IT\doc_content.txt" -Encoding utf8
Write-Host "Done writing doc_content.txt"
