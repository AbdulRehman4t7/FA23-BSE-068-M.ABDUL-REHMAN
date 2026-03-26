import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { PackageBadge } from "@/components/package-badge"

interface AdCardProps {
  ad: any // Replace with proper type
}

export function AdCard({ ad }: AdCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="aspect-video relative bg-slate-100">
        {ad.media?.[0]?.thumbnail_url ? (
          <img
            src={ad.media[0].thumbnail_url}
            alt={ad.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">No Preview</div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {ad.is_featured && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Featured</span>
          )}
          <StatusBadge status={ad.status} className="bg-white/90 backdrop-blur-sm shadow-sm" />
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-1">{ad.title}</CardTitle>
          <span className="font-bold text-primary shrink-0">PKR {ad.price?.toLocaleString() || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>{ad.city?.name || 'Anywhere'}</span>
          <span>•</span>
          <span>{ad.category?.name || 'Uncategorized'}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t mt-auto">
        <PackageBadge type={ad.package?.name?.toLowerCase() || 'basic'} />
        <Link href={`/ads/${ad.id}`} className="text-primary text-sm font-medium hover:underline">
          View Details →
        </Link>
      </CardFooter>
    </Card>
  )
}
