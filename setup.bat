REG ADD HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\icssvc\Settings /v WifiMaxPeers /d "128" 
netsh wlan set hostednetwork mode=allow ssid=pmh123456789 key=123456789
netsh wlan start hostednetwork