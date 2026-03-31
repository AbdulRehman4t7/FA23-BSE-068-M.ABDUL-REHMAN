$content = Get-Content app/dashboard/page.tsx -Raw
$content = $content.Replace('              ads: json.ads?.length > 0 ? json.ads.map((ad: any) => ({
                id: ad.id,
                title: ad.title,
                status: ad.status.toLowerCase(),
                package: ad.packages?.name?.toLowerCase() || ''basic'',
                views: 0,
                date: new Date(ad.created_at).toLocaleDateString()
              })) : recentAds,', "              ads: json.ads?.length > 0 ? json.ads.map((ad: any) => ({
                id: ad.id,
                title: ad.title,
                status: String(ad.status || ''draft'').toLowerCase(),
                package: (ad.packages?.name || ''basic'').toLowerCase(),
                views: ad.views || 0,
                date: ad.created_at ? new Date(ad.created_at).toLocaleDateString() : new Date().toLocaleDateString()
              })) : [],")
Set-Content app/dashboard/page.tsx -Value $content
