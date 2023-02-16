# Mobile Hotspot configuration
$Ssid = "pmh123456789"
$Passphrase = "123456789"

# ----
# Upper max client connections

## Ref: https://learn.microsoft.com/en-us/answers/questions/314514/add-registry-key-using-powershell
## Ref: https://learn.microsoft.com/en-us/answers/questions/799241/windows-10-mobile-hotspot
$registryPath = "HKLM:\SYSTEM\CurrentControlSet\Services\icssvc\Settings";
If ( !(Test-Path $registryPath) ) { New-Item -Path $registryPath -Force; };
New-ItemProperty -Path $registryPath -Name "WifiMaxPeers" -Value 128 -PropertyType DWORD -Force;

## Ref: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/stop-service?view=powershell-7.3
Stop-Service icssvc
Start-Service icssvc

# ----
# Setup Mobile Hotspot

## Ref: https://stackoverflow.com/a/55563418
$connectionProfile = [Windows.Networking.Connectivity.NetworkInformation,Windows.Networking.Connectivity,ContentType=WindowsRuntime]::GetInternetConnectionProfile()
$tetheringManager = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager,Windows.Networking.NetworkOperators,ContentType=WindowsRuntime]::CreateFromConnectionProfile($connectionProfile)

## Ref: https://microsoft.github.io/windows-docs-rs/doc/windows/Networking/NetworkOperators/struct.NetworkOperatorTetheringAccessPointConfiguration.html#method.new
$config = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringAccessPointConfiguration,Windows.Networking.NetworkOperators,ContentType=WindowsRuntime]::new()
$config.Ssid = $Ssid
$config.Passphrase = $Passphrase

Await ($tetheringManager.ConfigureAccessPointAsync($config)) ([Windows.Networking.NetworkOperators.NetworkOperatorTetheringOperationResult])

## Start Mobile Hotspot
Await ($tetheringManager.StartTetheringAsync()) ([Windows.Networking.NetworkOperators.NetworkOperatorTetheringOperationResult])
