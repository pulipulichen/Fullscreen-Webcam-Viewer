$toAdapterName = 'Realtek USB GbE Family*'
#$toAdapterName = 'ASIX AX88179 *'

# =================================================================

# Get the Windows Audio service
$audioService = Get-Service -Name "Audiosrv"

# Check if the service is running
if ($audioService.Status -eq 'Running') {
    # Stop the service to mute the audio
    Stop-Service -Name "Audiosrv" -Force
    Write-Host "Audio muted."
} else {
    Write-Host "Audio is already muted."
}

# =================================================================

function Set-MrInternetConnectionSharing {

<#
.SYNOPSIS
    Configures Internet connection sharing for the specified network adapter(s).
 
.DESCRIPTION
    Set-MrInternetConnectionSharing is an advanced function that configures Internet connection sharing
    for the specified network adapter(s). The specified network adapter(s) must exist and must be enabled.
    To enable Internet connection sharing, Internet connection sharing cannot already be enabled on any
    network adapters.
 
.PARAMETER InternetInterfaceName
    The name of the network adapter to enable or disable Internet connection sharing for.
 
 .PARAMETER LocalInterfaceName
    The name of the network adapter to share the Internet connection with.
 .PARAMETER Enabled
    Boolean value to specify whether to enable or disable Internet connection sharing.
.EXAMPLE
    Set-MrInternetConnectionSharing -InternetInterfaceName Ethernet -LocalInterfaceName 'Internal Virtual Switch' -Enabled $true
.EXAMPLE
    'Ethernet' | Set-MrInternetConnectionSharing -LocalInterfaceName 'Internal Virtual Switch' -Enabled $false
.EXAMPLE
    Get-NetAdapter -Name Ethernet | Set-MrInternetConnectionSharing -LocalInterfaceName 'Internal Virtual Switch' -Enabled $true
.INPUTS
    String
 
.OUTPUTS
    PSCustomObject
 
.NOTES
    Author:  Mike F Robbins
    Website: http://mikefrobbins.com
    Twitter: @mikefrobbins
#>

    [CmdletBinding()]
    param (
        [Parameter(Mandatory,
                   ValueFromPipeline,
                   ValueFromPipelineByPropertyName)]
        [ValidateScript({
            If ((Get-NetAdapter -Name $_ -ErrorAction SilentlyContinue -OutVariable INetNIC) -and (($INetNIC).Status -ne 'Disabled' -or ($INetNIC).Status -ne 'Not Present')) {
                $True
            }
            else {
                Throw "$_ is either not a valid network adapter of it's currently disabled."
            }
        })]
        [Alias('Name')]
        [string]$InternetInterfaceName,

        [ValidateScript({
            If ((Get-NetAdapter -Name $_ -ErrorAction SilentlyContinue -OutVariable LocalNIC) -and (($LocalNIC).Status -ne 'Disabled' -or ($INetNIC).Status -ne 'Not Present')) {
                $True
            }
            else {
                Throw "$_ is either not a valid network adapter of it's currently disabled."
            }
        })]
        [string]$LocalInterfaceName,

        [Parameter(Mandatory)]
        [bool]$Enabled
    )

    BEGIN {
        if ((Get-NetAdapter).SharingEnabled -contains $true -and $Enabled) {
            Write-Warning -Message 'Unable to continue due to Internet connection sharing already being enabled for one or more network adapters.'
            Break
        }

        regsvr32.exe /s hnetcfg.dll
        $netShare = New-Object -ComObject HNetCfg.HNetShare
    }
    
    PROCESS {
        
        $publicConnection = $netShare.EnumEveryConnection |
        Where-Object {
            $netShare.NetConnectionProps.Invoke($_).Name -eq $InternetInterfaceName
        }

        $publicConfig = $netShare.INetSharingConfigurationForINetConnection.Invoke($publicConnection)

        if ($PSBoundParameters.LocalInterfaceName) {
            $privateConnection = $netShare.EnumEveryConnection |
            Where-Object {
                $netShare.NetConnectionProps.Invoke($_).Name -eq $LocalInterfaceName
            }

            $privateConfig = $netShare.INetSharingConfigurationForINetConnection.Invoke($privateConnection)
        } 
        
        if ($Enabled) {
            $publicConfig.EnableSharing(0)
            if ($PSBoundParameters.LocalInterfaceName) {
                $privateConfig.EnableSharing(1)
            }
        }
        else {
            $publicConfig.DisableSharing()
            if ($PSBoundParameters.LocalInterfaceName) {
                $privateConfig.DisableSharing()
            }
        }

    }

}

Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
Start-Sleep -Seconds 1.5

#(Get-NetAdapter).Name 
$fromAdapter = Get-NetAdapter -physical | where status -eq 'up' | where InterfaceDescription -notlike $toAdapterName
$fromAdapter = $fromAdapter[0].name

$toAdapter = Get-NetAdapter -physical | where InterfaceDescription -like $toAdapterName

while($toAdapter.length -eq 0)
{
    echo "Adapter not found."
    Start-Sleep -Seconds 3
    $toAdapter = Get-NetAdapter -physical | where InterfaceDescription -like $toAdapterName
}

$toAdapterIfIndex = $toAdapter[0].ifIndex
$toAdapterStatus = $toAdapter[0].Status
$toAdapter = $toAdapter[0].name

Set-NetIPInterface -InterfaceIndex $toAdapterIfIndex -InterfaceMetric 999
Set-NetIPInterface -InterfaceIndex $toAdapterIfIndex -DHCP Disabled
Set-DnsClientServerAddress -InterfaceIndex $toAdapterIfIndex -ResetServerAddresses

Stop-Service -Name SharedAccess
Start-Sleep -Seconds 3
Set-MrInternetConnectionSharing -InternetInterfaceName $fromAdapter -Enabled $false

Enable-NetAdapter -Name $toAdapter -Confirm:$false

while($toAdapterStatus -eq 'Disconnected')
{
    echo "Wait for connect"
    Start-Sleep -Seconds 3
    $toAdapter = Get-NetAdapter -physical | where InterfaceDescription -like $toAdapterName

    $toAdapterIfIndex = $toAdapter[0].ifIndex
    $toAdapterStatus = $toAdapter[0].Status
    $toAdapter = $toAdapter[0].name
}

echo "Waiting for AP booting... 30 sec"
Start-Sleep -Seconds 10
echo "Waiting for AP booting... 20 sec"
Start-Sleep -Seconds 10
echo "Waiting for AP booting... 10 sec"
Start-Sleep -Seconds 10

#Set-NetConnectionProfile -InterfaceIndex $toAdapterIfIndex -NetworkCategory Private

while ($true) {
    try {
        Stop-Service -Name SharedAccess
        Set-MrInternetConnectionSharing -InternetInterfaceName $fromAdapter -LocalInterfaceName $toAdapter -Enabled $true
        echo 'share'
        break
    } 
    catch {
        echo 'share failed...'
        echo $fromAdapter
        echo $toAdapter
        Stop-Service -Name SharedAccess
        Start-Sleep -Seconds 3
    }
}

Start-Sleep -Seconds 1.5

Disable-NetAdapter -Name $toAdapter -Confirm:$false
Start-Sleep -Seconds 1.5
Enable-NetAdapter -Name $toAdapter -Confirm:$false

Start-Sleep -Seconds 10

#Set-NetConnectionProfile -InterfaceIndex $toAdapterIfIndex -NetworkCategory Private

Start-Sleep -Seconds 1.5

$windowsVersion = (Get-WmiObject -class Win32_OperatingSystem).Caption

#if ($windowsVersion -notlike "*Windows 11*") {
#    Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
#    echo "Enable Firewall"
#}
#else {
    echo "Disable Firewall"
#}

